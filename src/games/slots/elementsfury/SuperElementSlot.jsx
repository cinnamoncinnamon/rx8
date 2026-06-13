import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./SuperElementSlot.css";

import water from "../../../assets/elements/sym-water.png";
import fire from "../../../assets/elements/sym-fire.png";
import lightning from "../../../assets/elements/sym-lightning.png";
import wind from "../../../assets/elements/sym-wind.png";
import scatter from "../../../assets/elements/sym-scatter.png";

const SYMBOLS = [
  { id: "water",    name: "Water",     img: water,     payout: 0.3,  weight: 30   },
  { id: "fire",     name: "Fire",      img: fire,      payout: 0.5,  weight: 28   },
  { id: "lightning",name: "Lightning", img: lightning, payout: 0.8,  weight: 24   },
  { id: "wind",     name: "Wind",      img: wind,      payout: 0.4,  weight: 28   },
  { id: "scatter",  name: "Scatter",   img: scatter,   payout: 1,    weight: 0.35, scatter: true },
];

const REELS = 5;
const ROWS  = 5;

function pick() {
  const total = SYMBOLS.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of SYMBOLS) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return SYMBOLS[0];
}

function newGrid() {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, () => pick()),
  );
}

const MULTIPLIERS = [1, 2, 3, 4, 5];

export default function SuperElementSlot({ balance, setBalance, onBack }) {
  const [bet, setBet]                   = useState(5);
  const [extraBet, setExtraBet]         = useState(false);
  const [grid, setGrid]                 = useState(() => newGrid());
  const [winCells, setWinCells]         = useState(new Set());
  const [scatterCells, setScatterCells] = useState(new Set());
  const [win, setWin]                   = useState(0);
  const [multiplier, setMultiplier]     = useState(1);
  const [bigWin, setBigWin]             = useState(null);
  const [flash, setFlash]               = useState(false);
  const [shake, setShake]               = useState(false);
  const [displayedWin, setDisplayedWin] = useState(0);
  const [autoSpins, setAutoSpins]       = useState(0);
  const [freeSpins, setFreeSpins]       = useState(0);
  const [freeSpinMult, setFreeSpinMult] = useState(1);
  const [showBuy, setShowBuy]           = useState(false);
  const [spinning, setSpinning]         = useState(false);
  const [colStopped, setColStopped]     = useState(() => Array(REELS).fill(true));
  const [landKey, setLandKey]           = useState(() => Array(REELS).fill(0));

  const spinningRef     = useRef(false);
  const spinIdRef       = useRef(0);
  const spinTimeoutRef  = useRef(null);
  const spinIntervalRef = useRef(null);
  const measureRef      = useRef(null);
  const [cellPx, setCellPx] = useState(52);
  const colStoppedRef   = useRef(Array(REELS).fill(true));
  const colTimeoutsRef  = useRef([]);

  const STRIP_LEN = 14;
  const [stripSyms, setStripSyms] = useState(() =>
    Array.from({ length: REELS }, () =>
      Array.from({ length: STRIP_LEN }, () => pick()),
    ),
  );

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0 && Math.abs(w - cellPx) > 0.5) setCellPx(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cellPx]);

  const totalBet = +(bet * (extraBet ? 1.5 : 1)).toFixed(2);
  const GAP      = 4;
  const BUY_COST = +(totalBet * 60).toFixed(2);

  function spin() {
    if (spinningRef.current) return;
    const isFree = freeSpins > 0;
    if (!isFree && balance < totalBet) return;

    spinningRef.current = true;
    setSpinning(true);

    const startStopped = Array(REELS).fill(false);
    colStoppedRef.current = startStopped;
    setColStopped(startStopped);

    const spinId = spinIdRef.current + 1;
    spinIdRef.current = spinId;

    if (spinTimeoutRef.current  != null) window.clearTimeout(spinTimeoutRef.current);
    if (spinIntervalRef.current != null) window.clearInterval(spinIntervalRef.current);
    colTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    colTimeoutsRef.current = [];

    if (!isFree) {
      setBalance((b) => +(b - totalBet).toFixed(2));
    } else {
      setFreeSpins((n) => n - 1);
    }

    setWin(0);
    setWinCells(new Set());
    setScatterCells(new Set());
    setBigWin(null);

    const next = newGrid();
    const strips = Array.from({ length: REELS }, (_, c) => {
      const filler = Array.from({ length: STRIP_LEN - ROWS }, () => pick());
      return [...filler, ...next[c]];
    });
    setStripSyms(strips);

    const baseStop = 600;
    const stopGap  = 180;

    for (let c = 0; c < REELS; c++) {
      const t = window.setTimeout(() => {
        if (spinIdRef.current !== spinId) return;
        setGrid((prev) => prev.map((col, i) => (i === c ? next[c] : col)));
        const ns = [...colStoppedRef.current];
        ns[c] = true;
        colStoppedRef.current = ns;
        setColStopped(ns);
        setLandKey((k) => {
          const nk = [...k];
          nk[c] = nk[c] + 1;
          return nk;
        });
      }, baseStop + c * stopGap);
      colTimeoutsRef.current.push(t);
    }

    const spinTime = baseStop + (REELS - 1) * stopGap + 140;
    spinTimeoutRef.current = window.setTimeout(() => {
      if (spinIdRef.current !== spinId) return;
      if (spinIntervalRef.current != null) window.clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
      setGrid(next);
      setSpinning(false);
      resolve(next);
    }, spinTime);
  }

  function resolve(g) {
    let totalWin = 0;
    const winning  = new Set();
    const scatters = new Set();

    for (const sym of SYMBOLS) {
      if (sym.scatter) continue;
      const positions = g.map((col) =>
        col.map((s, r) => (s.id === sym.id ? r : -1)).filter((r) => r >= 0),
      );
      let prefixLen = 0;
      let ways      = 1;
      for (let c = 0; c < REELS; c++) {
        if (positions[c].length === 0) break;
        ways *= positions[c].length;
        prefixLen++;
      }
      if (prefixLen >= 5) {
        const amount = sym.payout * ways * bet * 0.02;
        totalWin += amount;
        for (let c = 0; c < prefixLen; c++) {
          for (const r of positions[c]) winning.add(`${c}-${r}`);
        }
      }
    }

    let scatterCount = 0;
    g.forEach((col, c) =>
      col.forEach((s, r) => {
        if (s.scatter) { scatterCount++; scatters.add(`${c}-${r}`); }
      }),
    );
    if (scatterCount >= 3) {
      totalWin += scatterCount * 1 * bet;
      setFreeSpins((n) => n + (scatterCount >= 5 ? 15 : scatterCount === 4 ? 10 : 6));
      setFreeSpinMult((m) => Math.min(10, m + 1));
    } else {
      scatters.clear();
    }

    const mult     = totalWin > 0 ? Math.min(5, multiplier + 1) : 1;
    const fsBonus  = freeSpins > 0 ? freeSpinMult : 1;
    const finalWin = +(totalWin * mult * fsBonus).toFixed(2);

    setMultiplier(mult);
    setWinCells(winning);
    setScatterCells(scatters);
    setWin(finalWin);

    if (finalWin > 0) {
      setBalance((b) => +(b + finalWin).toFixed(2));
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      if (finalWin >= bet * 100) {
        setBigWin(finalWin);
        setShake(true);
        setTimeout(() => setShake(false), 1000);
      }
    }
    spinningRef.current = false;
  }

  useEffect(() => {
    if (spinningRef.current) return;
    if (autoSpins <= 0 && freeSpins <= 0) return;
    const t = setTimeout(() => {
      if (autoSpins > 0 && freeSpins === 0) setAutoSpins((n) => n - 1);
      spin();
    }, 900);
    return () => clearTimeout(t);
  }, [autoSpins, freeSpins, grid]);

  useEffect(() => {
    if (freeSpins === 0) setFreeSpinMult(1);
  }, [freeSpins]);

  useEffect(() => {
    if (win <= 0) { setDisplayedWin(0); return; }
    const start    = performance.now();
    const duration = 700;
    let raf = 0;
    const tick = (t) => {
      const p     = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayedWin(+(win * eased).toFixed(2));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [win]);

  useEffect(() => {
    if (bigWin == null) return;
    const t = setTimeout(() => setBigWin(null), 2800);
    return () => clearTimeout(t);
  }, [bigWin]);

  useEffect(() => {
    if (win <= 0) return;
    const t = setTimeout(() => {
      setWin(0);
      setWinCells(new Set());
      setScatterCells(new Set());
    }, 1800);
    return () => clearTimeout(t);
  }, [win]);

  function adjustBet(delta) {
    const opts = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
    const idx  = opts.indexOf(bet);
    const next = opts[Math.max(0, Math.min(opts.length - 1, (idx === -1 ? 1 : idx) + delta))];
    setBet(next);
  }

  function toggleAuto() {
    setAutoSpins((n) => (n > 0 ? 0 : 10));
  }

  function buyFeature() {
    if (spinningRef.current || balance < BUY_COST) return;
    setBalance((b) => +(b - BUY_COST).toFixed(2));
    setFreeSpins(8);
    setFreeSpinMult(2);
    setShowBuy(false);
  }

  return (
    <div className={shake ? "se-shake" : ""} style={{ minHeight:"100vh", background:"#0b1438", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"12px", maxWidth:480, margin:"0 auto", overflowY:"auto", boxSizing:"border-box" }}>

      {/* Back button */}
      <div style={{ width:"100%", marginBottom:8 }}>
        <button onClick={onBack} style={{ background:"rgba(245,197,66,0.15)", border:"1px solid rgba(245,197,66,0.4)", color:"#f5c542", fontSize:14, cursor:"pointer", borderRadius:8, padding:"6px 14px", fontFamily:"serif", letterSpacing:2 }}>‹ BACK</button>
      </div>

      <div style={{ width:"100%" }}>

        {/* Title */}
        <h1 className="se-title" style={{ textAlign:"center", fontWeight:900, letterSpacing:"0.25em", marginBottom:8 }}>
          ELEMENTAL FURY
        </h1>

        {/* Multiplier bar */}
        <div style={{ marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div className="se-mult-bar" style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", borderRadius:999 }}>
            <span className="se-ex">EX</span>
            {MULTIPLIERS.slice(1).map((m) => (
              <span key={m} className={multiplier >= m ? "se-mult-on" : ""} style={{ fontWeight:900, fontSize:18, color: multiplier >= m ? "#fcd34d" : "rgba(147,197,253,0.3)" }}>
                {m}X
              </span>
            ))}
            <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(253,230,138,0.7)", marginLeft:8 }}>2000 ways</span>
          </div>
        </div>

        {/* Reel frame */}
        <div className="se-frame" style={{ borderRadius:16, padding:8, position:"relative", overflow:"hidden" }}>
          <div className="se-bevel" style={{ borderRadius:12, padding:8, position:"relative", overflow:"hidden" }}>
            {win > 0 && <div className="se-rays" />}

            {/* Sizer */}
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${REELS}, 1fr)`, gap:6, position:"absolute", left:8, right:8, top:8, pointerEvents:"none", opacity:0 }} aria-hidden>
              <div ref={measureRef} style={{ aspectRatio:"1" }} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:`repeat(${REELS}, 1fr)`, gap:GAP, position:"relative", zIndex:2 }}>
              {grid.map((col, c) => {
                const isSpin  = spinning && !colStopped[c];
                const colH    = cellPx * ROWS + GAP * (ROWS - 1);
                const strip   = stripSyms[c] ?? [];
                const shiftPx = (strip.length - ROWS) * (cellPx + GAP);
                return (
                  <div key={c} style={{ position:"relative", overflow:"hidden", height:colH }}>
                    {isSpin ? (
                      <div className="se-reel-strip" style={{ gap:`${GAP}px`, "--shift":`${shiftPx}px`, animationDuration:`${0.35 + c * 0.06}s` }}>
                        {strip.concat(strip).map((s, i) => (
                          <div key={i} className="se-cell" style={{ height:cellPx, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:6 }}>
                            <img src={s.img} alt="" loading="eager" decoding="sync" draggable={false} style={{ width:"88%", height:"88%", objectFit:"contain", filter:"blur(0.8px)" }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div key={landKey[c]} className="se-col-land" style={{ display:"grid", gridTemplateRows:`repeat(${ROWS}, 1fr)`, gap:GAP, height:"100%" }}>
                        {col.map((s, r) => {
                          const key = `${c}-${r}`;
                          return <ReelCell key={key} sym={s} isWin={winCells.has(key)} isScatter={scatterCells.has(key)} />;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ pointerEvents:"none", position:"absolute", left:0, right:0, top:0, height:24, background:"linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)", zIndex:10 }} />
              <div style={{ pointerEvents:"none", position:"absolute", left:0, right:0, bottom:0, height:24, background:"linear-gradient(to top, rgba(0,0,0,0.7), transparent)", zIndex:10 }} />
            </div>
          </div>

          {flash && <div className="se-flash" style={{ pointerEvents:"none", position:"absolute", inset:0, zIndex:20 }} />}

          {win > 0 && bigWin == null && (
            <div style={{ pointerEvents:"none", position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:20 }}>
              <div className="se-win-amount" style={{ fontWeight:900, fontSize:36 }}>৳{displayedWin.toFixed(0)}</div>
            </div>
          )}

          {win > 0 && (
            <div style={{ pointerEvents:"none", position:"absolute", inset:0, zIndex:20 }}>
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const dist  = 90 + (i % 4) * 28;
                return <span key={i} className="se-coin" style={{ "--cx":`${Math.cos(angle)*dist}px`, "--cy":`${Math.sin(angle)*dist}px`, animationDelay:`${(i%8)*35}ms` }} />;
              })}
            </div>
          )}

          {bigWin != null && (
            <div className="se-bigwin-bg" style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:30 }}>
              <div className="se-bigwin-title" style={{ lineHeight:1 }}>BIG</div>
              <div className="se-bigwin-title" style={{ lineHeight:1, marginTop:-8 }}>WIN</div>
              <div className="se-win-pill" style={{ marginTop:12, padding:"10px 28px", borderRadius:999 }}>
                <span className="se-amount-text" style={{ fontSize:28, fontWeight:900 }}>৳{bigWin.toFixed(0)}</span>
              </div>
              <Sparks />
            </div>
          )}
        </div>

        {/* Extra Bet / Buy Feature */}
        <div style={{ marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
          <button onClick={() => setExtraBet((v) => !v)} className="se-pill-red" style={{ padding:"6px 20px", borderRadius:999, fontSize:13, fontWeight:900, outline: extraBet ? "2px solid #fcd34d" : "none" }}>
            Extra Bet
          </button>
          <button onClick={() => setShowBuy(true)} className="se-pill-purple" style={{ padding:"6px 20px", borderRadius:999, fontSize:13, fontWeight:900 }}>
            Buy Feature
          </button>
        </div>

        {/* Status banner */}
        {(freeSpins > 0 || autoSpins > 0) && (
          <div style={{ marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:12, fontSize:11, fontWeight:900, letterSpacing:"0.1em" }}>
            {freeSpins > 0 && <span style={{ padding:"4px 12px", borderRadius:999, background:"rgba(245,158,11,0.2)", border:"1px solid rgba(251,191,36,0.6)", color:"#fde68a" }}>FREE SPINS: {freeSpins} · ×{freeSpinMult}</span>}
            {autoSpins > 0 && <span style={{ padding:"4px 12px", borderRadius:999, background:"rgba(16,185,129,0.2)", border:"1px solid rgba(52,211,153,0.6)", color:"#6ee7b7" }}>AUTO: {autoSpins}</span>}
          </div>
        )}

        {/* Meters */}
        <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }} className="se-meter">
          <Meter label="Balance" value={`৳${Math.floor(balance)}`} />
          <Meter label="Win" value={`৳${displayedWin.toFixed(0)}`} accent={win > 0} />
          <Meter label="Bet" value={`৳${totalBet}`} />
        </div>

        {/* Control deck */}
        <div className="se-deck" style={{ marginTop:12, borderRadius:16, padding:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <CircleBtn color={autoSpins > 0 ? "amber" : "green"} onClick={toggleAuto} label={autoSpins > 0 ? "■" : "▶"} title="Auto spin" />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <CircleBtn color="amber" onClick={() => adjustBet(-1)} label="−" big />
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:68 }}>
              <span style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(253,230,138,0.7)" }}>Bet</span>
              <span style={{ color:"#fcd34d", fontWeight:900, fontSize:20, lineHeight:1 }}>৳{bet}</span>
            </div>
            <button onClick={spin} disabled={freeSpins === 0 && balance < totalBet} className="se-spin" style={{ width:80, height:80, borderRadius:"50%", fontWeight:900, fontSize:30, color:"#fff", cursor:"pointer" }} aria-label="Spin">↻</button>
            <CircleBtn color="amber" onClick={() => adjustBet(1)} label="+" big />
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <CircleBtn color="green" onClick={() => {}} label="≡" />
            <CircleBtn color="green" onClick={() => {}} label="i" />
          </div>
        </div>
      </div>

      {/* Buy Feature dialog */}
      {showBuy && (
        <div onClick={() => setShowBuy(false)} style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.6)", padding:16 }}>
          <div onClick={(e) => e.stopPropagation()} className="se-frame" style={{ borderRadius:16, padding:20, maxWidth:300, width:"100%", textAlign:"center" }}>
            <div style={{ color:"#fcd34d", fontWeight:900, fontSize:20, marginBottom:4 }}>BUY FEATURE</div>
            <div style={{ color:"rgba(254,243,199,0.8)", fontSize:12, marginBottom:12 }}>8 Free Spins · ×2 multiplier</div>
            <div style={{ color:"#fde68a", fontSize:14, marginBottom:16 }}>Cost: <span style={{ fontWeight:900, color:"#fcd34d" }}>৳{BUY_COST}</span></div>
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              <button onClick={() => setShowBuy(false)} style={{ padding:"8px 16px", borderRadius:999, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(251,191,36,0.4)", color:"#fef3c7", fontSize:14, fontWeight:700, cursor:"pointer" }}>Cancel</button>
              <button onClick={buyFeature} disabled={balance < BUY_COST} className="se-pill-purple" style={{ padding:"8px 16px", borderRadius:999, fontSize:14, fontWeight:900, cursor:"pointer", opacity: balance < BUY_COST ? 0.5 : 1 }}>Buy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, accent }) {
  return (
    <div style={{ textAlign:"center", background:"rgba(0,0,0,0.4)", borderRadius:6, padding:"4px 0", border:"1px solid rgba(245,158,11,0.2)" }}>
      <div style={{ textTransform:"uppercase", letterSpacing:"0.1em", fontSize:9, color:"rgba(253,230,138,0.6)" }}>{label}</div>
      <div style={{ fontWeight:900, fontSize:15, color: accent ? "#fcd34d" : "#fef3c7" }}>{value}</div>
    </div>
  );
}

function CircleBtn({ color, onClick, label, big, title }) {
  const size = big ? { width:48, height:48, fontSize:22 } : { width:36, height:36, fontSize:15 };
  const bg   = color === "green" ? "linear-gradient(to bottom, #34d399, #065f46)" : "linear-gradient(to bottom, #fbbf24, #92400e)";
  const col  = color === "green" ? "#ecfdf5" : "#fffbeb";
  return (
    <button onClick={onClick} title={title} style={{ ...size, background:bg, color:col, borderRadius:"50%", fontWeight:900, border:"2px solid rgba(165,243,252,0.4)", boxShadow:"0 0 12px rgba(80,200,255,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
      {label}
    </button>
  );
}

function ReelCell({ sym, isWin, isScatter }) {
  return (
    <div className={`se-cell${isWin || isScatter ? " se-win" : ""}`} style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", aspectRatio:"1", borderRadius:6 }}>
      <img src={sym.img} alt={sym.name} loading="eager" decoding="sync" draggable={false} className={isWin || isScatter ? "se-img-win" : ""} style={{ width:"88%", height:"88%", objectFit:"contain" }} />
      {sym.scatter && (
        <span style={{ position:"absolute", bottom:0, left:0, right:0, textAlign:"center", fontSize:8, fontWeight:900, color:"#fcd34d", letterSpacing:"0.1em" }}>SCATTER</span>
      )}
      {(isWin || isScatter) && (
        <>
          <span className="se-ring" />
          <span className="se-spark se-spark-1" />
          <span className="se-spark se-spark-2" />
          <span className="se-spark se-spark-3" />
        </>
      )}
    </div>
  );
}

function Sparks() {
  return (
    <div style={{ pointerEvents:"none", position:"absolute", inset:0, overflow:"hidden" }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="se-star" style={{ left:`${(i*73)%100}%`, animationDelay:`${(i*137)%1200}ms`, animationDuration:`${1400+((i*211)%900)}ms` }} />
      ))}
    </div>
  );
}



import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SYMBOLS, SYMBOL_PAY, SYMBOL_WEIGHT, SymbolGlyph } from "./symbols";
import { mulberry32 } from "./rng";
import "./GoldenRelicsSlot.css";

const REELS = 5;
const ROWS  = 3;

const SCATTER              = "poseidon";
const BONUS_SPINS_AWARD    = 10;
const BONUS_RETRIGGER_AWARD = 5;
const BONUS_WIN_MULTIPLIER = 3;

const JACKPOT_SEED         = 50_000;
const JACKPOT_CONTRIB      = 0.02;
const JACKPOT_TRIGGER_CHANCE = 0.00015;
const JACKPOT_BIG_BET_BONUS  = 0.0005;

const WEIGHTED_POOL = (() => {
  const pool = [];
  for (const s of SYMBOLS) {
    if (s === SCATTER) continue;
    const w = SYMBOL_WEIGHT[s] ?? 1;
    for (let i = 0; i < w; i++) pool.push(s);
  }
  return pool;
})();

const pickSymbol = (rand, scatterBias = 0) => {
  if (rand() < scatterBias) return SCATTER;
  return WEIGHTED_POOL[Math.floor(rand() * WEIGHTED_POOL.length)];
};
const buildGrid = (rand, scatterBias = 0) =>
  Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, () => pickSymbol(rand, scatterBias)),
  );
const initialGrid = () =>
  Array.from({ length: REELS }, (_, c) =>
    Array.from({ length: ROWS },  (_, r) => SYMBOLS[(c * 3 + r) % SYMBOLS.length]),
  );

// ─── Main component ───────────────────────────────────────────────────────────

export function GoldenRelicsSlot({ balance, setBalance, bet, setBet }) {
  const [grid, setGrid]           = useState(() => initialGrid());
  const [spinning, setSpinning]   = useState(() => Array(REELS).fill(false));
  const [wins, setWins]           = useState([]);
  const [winTotal, setWinTotal]   = useState(0);
  const [auto, setAuto]           = useState(false);
  const [shock, setShock]         = useState(0);
  const [history, setHistory]     = useState([]);

  const [freeSpins, setFreeSpins]     = useState(0);
  const [bonusTotal, setBonusTotal]   = useState(0);
  const [bonusIntro, setBonusIntro]   = useState(null);
  const [scatterHits, setScatterHits] = useState([]);
  const inBonus = freeSpins > 0 || !!bonusIntro;

  const particlesRef = useRef([]);
  const pidRef       = useRef(0);
  const [, forceTick] = useState(0);

  const [jackpot, setJackpot]       = useState(JACKPOT_SEED);
  const [totalWon, setTotalWon]     = useState(0);
  const [jackpotHit, setJackpotHit] = useState(null);

  const rngRef = useRef(mulberry32(0xA71A57));
  useEffect(() => {
    const buf = new Uint32Array(2);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(buf);
    else { buf[0] = Date.now() & 0xffffffff; buf[1] = (Date.now() / 1000) & 0xffffffff; }
    rngRef.current = mulberry32((buf[0] ^ buf[1]) >>> 0);
  }, []);

  const isSpinning = spinning.some(Boolean);
  const canSpin    = !isSpinning && !bonusIntro && (freeSpins > 0 || balance >= bet);

  // Particle loop
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const ps = particlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life -= 16;
        p.x += p.dx;
        p.y += p.dy;
        p.dy += p.kind === "coin" ? 0.35 : -0.08;
        p.dx *= 0.99;
        if (p.life <= 0) ps.splice(i, 1);
      }
      if (ps.length) forceTick((n) => (n + 1) % 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const emit = useCallback((x, y, kind, count = 12) => {
    for (let i = 0; i < count; i++) {
      const ang   = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        id: pidRef.current++,
        x, y,
        dx: Math.cos(ang) * speed,
        dy: Math.sin(ang) * speed - (kind === "bubble" || kind === "pearl" ? 2 : 0),
        kind,
        life: 900 + Math.random() * 700,
      });
    }
  }, []);

  const evaluateWins = useCallback((g, multiplier) => {
    const result = [];
    for (let r = 0; r < ROWS; r++) {
      const s = g[0][r];
      let count = 1;
      for (let c = 1; c < REELS; c++) {
        if (g[c][r] === s) count++;
        else break;
      }
      if (count >= 3) {
        const pay    = SYMBOL_PAY[s] * (count === 5 ? 5 : count === 4 ? 2 : 1);
        const amount = Math.round((bet / 10) * pay * multiplier);
        result.push({ row: r, cols: Array.from({ length: count }, (_, i) => i), symbol: s, amount });
      }
    }
    return result;
  }, [bet]);

  const countScatters = (g) => {
    const hits = [];
    for (let c = 0; c < REELS; c++)
      for (let r = 0; r < ROWS; r++)
        if (g[c][r] === SCATTER) hits.push(`${c}-${r}`);
    return hits;
  };

  const doSpin = useCallback(() => {
    if (!canSpin) return;

    const usingFreeSpin = freeSpins > 0;
    if (!usingFreeSpin) {
      setBalance((b) => b - bet);
      setJackpot((j) => j + Math.round(bet * JACKPOT_CONTRIB * 100) / 100);
    }
    if (usingFreeSpin) setFreeSpins((n) => n - 1);

    setWins([]); setWinTotal(0); setScatterHits([]);

    const rand = rngRef.current;
    const jackpotChance = usingFreeSpin
      ? 0
      : JACKPOT_TRIGGER_CHANCE + Math.max(0, bet - 5) * JACKPOT_BIG_BET_BONUS;
    const jackpotWon = rand() < jackpotChance;

    const scatterBias = usingFreeSpin ? 0.14 : 0.02;
    const finalGrid   = buildGrid(rand, scatterBias);
    setSpinning(Array(REELS).fill(true));

    finalGrid.forEach((reel, i) => {
      setTimeout(() => {
        setGrid((cur) => {
          const cp = cur.map((r) => r.slice());
          cp[i] = reel;
          return cp;
        });
        setSpinning((cur) => {
          const cp = cur.slice();
          cp[i] = false;
          return cp;
        });

        if (i === REELS - 1) {
          const mult     = usingFreeSpin ? BONUS_WIN_MULTIPLIER : 1;
          const w        = evaluateWins(finalGrid, mult);
          const scatters = countScatters(finalGrid);
          setScatterHits(scatters);

          const lineTotal = w.reduce((acc, x) => acc + x.amount, 0);
          if (lineTotal > 0) {
            setWins(w);
            setWinTotal(lineTotal);
            setBalance((b) => b + lineTotal);
            setTotalWon((t) => t + lineTotal);
            setShock((n) => n + 1);
            if (usingFreeSpin) setBonusTotal((t) => t + lineTotal);

            requestAnimationFrame(() => {
              const frame = document.getElementById("slot-frame");
              if (!frame) return;
              const fr = frame.getBoundingClientRect();
              w.forEach((line) => {
                line.cols.forEach((c) => {
                  const cell = document.querySelector(`[data-cell="${c}-${line.row}"]`);
                  if (!cell) return;
                  const r = cell.getBoundingClientRect();
                  const x = r.left + r.width  / 2 - fr.left;
                  const y = r.top  + r.height / 2 - fr.top;
                  emit(x, y, "coin",   usingFreeSpin ? 16 : 10);
                  emit(x, y, "bubble", 8);
                  emit(x, y, "spark",  usingFreeSpin ? 10 : 6);
                });
              });
            });
          }

          if (scatters.length >= 3) {
            const retrigger = usingFreeSpin;
            const award     = retrigger ? BONUS_RETRIGGER_AWARD : BONUS_SPINS_AWARD;
            setBonusIntro({ award, retrigger });

            requestAnimationFrame(() => {
              const frame = document.getElementById("slot-frame");
              if (!frame) return;
              const fr = frame.getBoundingClientRect();
              scatters.forEach((key) => {
                const cell = document.querySelector(`[data-cell="${key}"]`);
                if (!cell) return;
                const r = cell.getBoundingClientRect();
                const x = r.left + r.width  / 2 - fr.left;
                const y = r.top  + r.height / 2 - fr.top;
                emit(x, y, "spark",  20);
                emit(x, y, "bubble", 14);
                emit(x, y, "pearl",  6);
              });
            });

            setHistory((h) => ["F", ...h].slice(0, 10));
            setTimeout(() => {
              setBonusIntro(null);
              setFreeSpins((n) => n + award);
              if (!retrigger) setBonusTotal(0);
            }, 2600);
          } else if (lineTotal > 0) {
            setHistory((h) => [(lineTotal >= bet * 5 ? "B" : "W"), ...h].slice(0, 10));
          } else {
            setHistory((h) => ["L", ...h].slice(0, 10));
          }

          if (jackpotWon) {
            setJackpot((current) => {
              setBalance((b) => b + current);
              setTotalWon((t) => t + current);
              setJackpotHit(current);
              setShock((n) => n + 1);
              setHistory((h) => ["J", ...h].slice(0, 10));
              requestAnimationFrame(() => {
                const frame = document.getElementById("slot-frame");
                if (!frame) return;
                const fr = frame.getBoundingClientRect();
                for (let k = 0; k < 8; k++) {
                  emit(fr.width * (0.2 + (k / 8) * 0.6), fr.height * 0.4, "coin", 22);
                }
              });
              setTimeout(() => setJackpotHit(null), 4200);
              return JACKPOT_SEED;
            });
          }
        }
      }, 500 + i * 280);
    });
  }, [bet, canSpin, emit, evaluateWins, freeSpins, setBalance]);

  // Auto-spin
  useEffect(() => {
    if (isSpinning || bonusIntro) return;
    if (freeSpins > 0) {
      const t = setTimeout(doSpin, 900);
      return () => clearTimeout(t);
    }
    if (!auto) return;
    if (balance < bet) { setAuto(false); return; }
    const t = setTimeout(doSpin, 900);
    return () => clearTimeout(t);
  }, [auto, isSpinning, balance, bet, doSpin, freeSpins, bonusIntro]);

  const winningCells = useMemo(() => {
    const s = new Set();
    wins.forEach((w) => w.cols.forEach((c) => s.add(`${c}-${w.row}`)));
    return s;
  }, [wins]);

  const scatterSet = useMemo(() => new Set(scatterHits), [scatterHits]);

  return (
    <div className="gr-wrapper">
      {/* Jackpot + Total Won */}
      <div className="gr-top-grid">
        <div className="gr-panel gr-panel--strong gr-panel--shimmer">
          <div>
            <span className="gr-label">💎 MEGA JACKPOT</span>
            <span className="gr-jackpot-val gr-gold-text">
              ৳{Math.floor(jackpot).toLocaleString()}
            </span>
          </div>
          <div className="gr-sub-label">PROGRESSIVE<br />ANY SPIN</div>
        </div>
        <div className="gr-panel">
          <div>
            <span className="gr-label">TOTAL WON</span>
            <span className={`gr-jackpot-val ${totalWon > 0 ? "gr-gold-text" : "gr-dim-text"}`}>
              ৳{totalWon.toLocaleString()}
            </span>
          </div>
          <div className="gr-sub-label">SESSION<br />TOTAL</div>
        </div>
      </div>

      {/* Win flash */}
      <div className="gr-win-flash">
        {winTotal > 0 && (
          <div key={shock} className="gr-win-pop gr-gold-text gr-font-display">
            {inBonus ? "FREE SPIN WIN" : "BIG WIN"} ৳{winTotal.toLocaleString()}
          </div>
        )}
      </div>

      {/* Slot frame */}
      <div id="slot-frame" className={`gr-frame${inBonus ? " gr-frame--bonus" : ""}`}>
        <CornerEmblems bonus={inBonus} />

        {(freeSpins > 0 || bonusTotal > 0) && (
          <div className="gr-free-hud">
            {freeSpins > 0 && (
              <div className="gr-badge gr-badge--gold gr-font-display">
                FREE SPINS · {freeSpins}
              </div>
            )}
            {bonusTotal > 0 && (
              <div className="gr-badge gr-badge--cyan">
                BONUS ৳{bonusTotal.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Reels */}
        <div className="gr-reels">
          <div className="gr-caustics" />
          {grid.map((reel, c) => (
            <Reel
              key={c}
              symbols={reel}
              spinning={spinning[c]}
              winningRows={[...winningCells].filter((k) => k.startsWith(`${c}-`)).map((k) => Number(k.split("-")[1]))}
              scatterRows={[...scatterSet].filter((k) => k.startsWith(`${c}-`)).map((k) => Number(k.split("-")[1]))}
              col={c}
            />
          ))}

          {wins.map((w, i) => (
            <div key={i} className="gr-winline-overlay" aria-hidden>
              <div
                className="gr-winline"
                style={{ top: `calc(${(w.row + 0.5) * (100 / ROWS)}%)` }}
              />
            </div>
          ))}
        </div>

        <ParticleLayer particles={particlesRef.current} />
        {bonusIntro   && <BonusIntro award={bonusIntro.award} retrigger={bonusIntro.retrigger} multiplier={BONUS_WIN_MULTIPLIER} />}
        {jackpotHit !== null && <JackpotHit amount={jackpotHit} />}
      </div>

      {/* Controls */}
      <div className="gr-controls">
        <Panel label="BET">
          <div className="gr-bet-val gr-gold-text">৳{bet}</div>
          <div className="gr-btn-row">
            <button className="gr-btn-aqua" onClick={() => setBet(Math.max(5, bet - 5))}   disabled={isSpinning || inBonus}>−</button>
            <button className="gr-btn-aqua" onClick={() => setBet(Math.min(500, bet + 5))} disabled={isSpinning || inBonus}>+</button>
          </div>
        </Panel>

        <div className="gr-spin-col">
          <button
            onClick={doSpin}
            disabled={!canSpin}
            className={`gr-spin-btn${inBonus ? " gr-spin-btn--bonus" : ""}${!canSpin ? " gr-spin-btn--disabled" : ""}`}
            aria-label="Spin"
          >
            <div className="gr-spin-inner gr-font-display">
              <span className="gr-spin-label">{isSpinning ? "..." : inBonus ? "FREE" : "SPIN"}</span>
              <span className="gr-spin-sub">{isSpinning ? "REELING" : inBonus ? `×${BONUS_WIN_MULTIPLIER}` : "TAP"}</span>
            </div>
          </button>
          <button
            onClick={() => setAuto((a) => !a)}
            disabled={inBonus}
            className={`gr-auto-btn${auto ? " gr-auto-btn--on" : ""}`}
          >
            AUTO {auto ? "ON" : "OFF"}
          </button>
        </div>

        <Panel label="WIN">
          <div className={`gr-bet-val ${winTotal > 0 ? "gr-gold-text" : "gr-dim-text"}`}>৳{winTotal}</div>
          <div className="gr-sub-note">last spin</div>
        </Panel>
      </div>

      {/* Quick bets */}
      <div className="gr-quick-bets">
        {[5, 10, 25, 50, 100, 200].map((v) => (
          <button
            key={v}
            onClick={() => setBet(v)}
            disabled={isSpinning || inBonus}
            className={`gr-quick-btn${bet === v ? " gr-quick-btn--active" : ""}${inBonus ? " gr-quick-btn--disabled" : ""}`}
          >৳{v}</button>
        ))}
      </div>

      {/* Paytable */}
      <div className="gr-paytable">
        <div className="gr-paytable-header">
          <span className="gr-label">Paytable · 3 in a row pays</span>
          <span className="gr-label gr-label--gold">
            3+ Scatter → {BONUS_SPINS_AWARD} Free Spins ×{BONUS_WIN_MULTIPLIER}
          </span>
        </div>
        <div className="gr-paytable-list">
          {SYMBOLS.slice().sort((a, b) => SYMBOL_PAY[b] - SYMBOL_PAY[a]).map((k) => (
            <div key={k} className={`gr-pay-item${k === SCATTER ? " gr-pay-item--scatter" : ""}`}>
              <div className="gr-pay-icon"><SymbolGlyph k={k} /></div>
              <span className="gr-pay-label">×{SYMBOL_PAY[k]}{k === SCATTER ? " ★" : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="gr-history">
        {history.map((h, i) => (
          <span key={i} className={`gr-hist-badge gr-hist-badge--${h.toLowerCase()}`}>
            {h === "W" ? "WIN" : h === "B" ? "BIG WIN" : h === "F" ? "FREE SPINS" : h === "J" ? "JACKPOT" : "LOSS"}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Panel({ label, children }) {
  return (
    <div className="gr-panel gr-panel--center">
      <div className="gr-label">{label}</div>
      {children}
    </div>
  );
}

function CornerEmblems({ bonus }) {
  const positions = [
    "gr-corner--tl",
    "gr-corner--tr",
    "gr-corner--bl",
    "gr-corner--br",
  ];
  const scales = [
    "scale(1,1)",
    "scale(-1,1)",
    "scale(1,-1)",
    "scale(-1,-1)",
  ];
  return (
    <>
      {positions.map((cls, i) => (
        <svg key={i} className={`gr-corner ${cls}${bonus ? " gr-corner--bonus" : ""}`} viewBox="0 0 40 40">
          <path d="M2 2 Q20 2 20 20 M2 2 Q2 20 20 20" stroke="url(#emb)" strokeWidth="1.5" fill="none" style={{ transform: scales[i], transformOrigin: "50% 50%" }} />
          <circle cx="20" cy="20" r="2" fill={bonus ? "#ffb347" : "#ffd97a"} />
          <defs>
            <linearGradient id={`emb${i}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%"   stopColor={bonus ? "#ffd97a" : "#5ee7ff"} />
              <stop offset="100%" stopColor={bonus ? "#ff8a3d" : "#ffd97a"} />
            </linearGradient>
          </defs>
        </svg>
      ))}
    </>
  );
}

function Reel({ symbols, spinning, winningRows, scatterRows, col }) {
  const strip = useMemo(() => {
    if (!spinning) return symbols;
    return Array.from({ length: 18 }, (_, i) => SYMBOLS[(i + col * 3) % SYMBOLS.length]);
  }, [spinning, symbols, col]);

  return (
    <div className="gr-reel">
      <div className="gr-reel-fade gr-reel-fade--top" />
      <div className="gr-reel-fade gr-reel-fade--bot" />
      <div
        className="gr-reel-strip"
        style={{
          height: spinning ? `${strip.length * 100}%` : "100%",
          transition: spinning ? "none" : "transform 0.45s cubic-bezier(.22,1.5,.36,1)",
          transform: spinning ? `translateY(-${(strip.length - ROWS) * 100 / strip.length}%)` : "translateY(0)",
          animation: spinning ? "gr-reelblur 0.4s linear infinite" : "none",
          filter: spinning ? "blur(2px)" : "blur(0)",
        }}
      >
        {strip.map((s, idx) => {
          const isWin     = !spinning && winningRows.includes(idx);
          const isScatter = !spinning && scatterRows.includes(idx);
          return <SymbolTile key={idx} symbol={s} win={isWin} scatter={isScatter} col={col} row={idx} isStatic={!spinning} />;
        })}
      </div>
    </div>
  );
}

function SymbolTile({ symbol, win, scatter, col, row, isStatic }) {
  return (
    <div
      data-cell={isStatic ? `${col}-${row}` : undefined}
      className={`gr-tile${win || scatter ? " gr-tile--highlight" : ""}`}
      style={{
        background: win
          ? "radial-gradient(circle, rgba(94,231,255,0.35), rgba(94,231,255,0) 70%)"
          : scatter
          ? "radial-gradient(circle, rgba(255,180,60,0.4), rgba(255,180,60,0) 70%)"
          : "transparent",
      }}
    >
      <div className={`gr-tile-inner${isStatic ? " gr-floaty" : ""}`}>
        <SymbolGlyph k={symbol} />
        {win && (
          <>
            <div className="gr-tile-glow gr-tile-glow--win" />
            <div className="gr-shockwave" style={{ borderColor: "#5ee7ff" }} />
            <div className="gr-sparkle gr-sparkle--1" />
            <div className="gr-sparkle gr-sparkle--2" />
          </>
        )}
        {scatter && !win && (
          <>
            <div className="gr-tile-glow gr-tile-glow--scatter" />
            <div className="gr-shockwave" style={{ borderColor: "#ffb347" }} />
            <div className="gr-sparkle gr-sparkle--1" />
          </>
        )}
      </div>
    </div>
  );
}

function ParticleLayer({ particles }) {
  return (
    <div className="gr-particles">
      {particles.map((p) => {
        if (p.kind === "coin") return (
          <div key={p.id} className="gr-particle gr-particle--coin" style={{ left: p.x, top: p.y, transform: `rotate(${p.x * 4}deg)` }} />
        );
        if (p.kind === "bubble") return (
          <div key={p.id} className="gr-particle gr-particle--bubble" style={{ left: p.x, top: p.y }} />
        );
        if (p.kind === "pearl") return (
          <div key={p.id} className="gr-particle gr-particle--pearl" style={{ left: p.x, top: p.y }} />
        );
        return (
          <div key={p.id} className="gr-particle gr-particle--spark" style={{ left: p.x, top: p.y }} />
        );
      })}
    </div>
  );
}

function BonusIntro({ award, retrigger, multiplier }) {
  return (
    <div className="gr-overlay gr-bonus-overlay">
      <div className="gr-overlay-bg" />
      <div className="gr-bonus-rays" />
      <div className="gr-ring gr-ring--1" />
      <div className="gr-ring gr-ring--2" />
      <div className="gr-ring gr-ring--3" />
      <div className="gr-overlay-content gr-win-pop">
        <div className="gr-overlay-eyebrow">{retrigger ? "Poseidon Smiles Again" : "Poseidon's Favor"}</div>
        <div className="gr-overlay-title gr-gold-text gr-font-display">
          {retrigger ? "+" : ""}{award} FREE SPINS
        </div>
        <div className="gr-overlay-sub">{`ALL WINS ×${multiplier}`}</div>
        <div className="gr-overlay-foot">The trident awakens · reels of the deep</div>
      </div>
    </div>
  );
}

function JackpotHit({ amount }) {
  return (
    <div className="gr-overlay gr-jackpot-overlay">
      <div className="gr-jackpot-bg" />
      <div className="gr-bonus-rays" />
      <div className="gr-ring gr-ring--j1" />
      <div className="gr-ring gr-ring--j2" />
      <div className="gr-ring gr-ring--j3" />
      <div className="gr-overlay-content gr-win-pop">
        <div className="gr-overlay-eyebrow gr-overlay-eyebrow--wide">Atlantean Treasure</div>
        <div className="gr-jackpot-title">MEGA JACKPOT</div>
        <div className="gr-jackpot-amount gr-gold-text gr-font-display">৳{amount.toLocaleString()}</div>
        <div className="gr-overlay-foot">Awarded to your balance</div>
      </div>
    </div>
  );
}
export default GoldenRelicsSlot;
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getToken } from "../../api";

// ── Put these images in src/games/roadrush/assets/ ──
import bgImg from "./assets/bg.jpg";
import cloudsImg from "./assets/clouds.png";
import foregroundImg from "./assets/foreground.png";
import carImg from "./assets/car.png";

const WS_URL = "ws://localhost:4000/ws/roadrush";
const GROWTH_RATE_COSMETIC = 0.00011; // mirrors the server's rate purely for the car's progress animation between ticks — never decides any outcome

function fmt(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtX(n) { return n.toFixed(2); }
function initialBet(stake = 1) {
  return { stake, autoCashout: 0, status: "none", cashoutMultiplier: null, lastWin: null };
}

// ─────────────────────── CSS ───────────────────────
const STYLES = `
.rr-root { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: oklch(0.18 0.03 260); color: oklch(0.97 0.01 250); min-height: 100vh; display: flex; flex-direction: column; -webkit-tap-highlight-color: transparent; }
.rr-multiplier-text { color: oklch(0.82 0.16 80); text-shadow: -2px -2px 0 #1a1408, 2px -2px 0 #1a1408, -2px 2px 0 #1a1408, 2px 2px 0 #1a1408, 0 4px 8px rgba(0,0,0,0.5); font-weight: 900; letter-spacing: -0.02em; }
.rr-crash-text { color: oklch(0.7 0.25 25); text-shadow: -2px -2px 0 #1a0808, 2px -2px 0 #1a0808, -2px 2px 0 #1a0808, 2px 2px 0 #1a0808; font-weight: 900; }
@keyframes rr-parallax-scroll { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
.rr-track { position:absolute; inset:0; display:flex; width:max-content; will-change:transform; animation: rr-parallax-scroll linear infinite; }
.rr-track.paused { animation-play-state: paused; }
.rr-slow { animation-duration: 60s; }
.rr-medium { animation-duration: 28s; }
.rr-fast { animation-duration: 10s; }
.rr-tile { height:100%; width:auto; display:block; flex:0 0 auto; user-select:none; object-fit:cover; }
@keyframes rr-car-bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-1px);} }
.rr-car-bounce { animation: rr-car-bounce 0.5s ease-in-out infinite; }
@keyframes rr-wind-sway { 0%,100%{transform:skewY(0deg) translateY(0);} 25%{transform:skewY(1.2deg) translateY(-2px);} 75%{transform:skewY(-1.5deg) translateY(1px);} }
.rr-wind-sway { animation: rr-wind-sway 0.45s ease-in-out infinite; transform-origin: bottom center; }
@keyframes rr-road-dash { from{background-position:0 0;} to{background-position:-80px 0;} }
.rr-road-dashes { position:absolute; left:-120px; right:-120px; top:50%; height:2px; transform:translateY(-50%); background-image: repeating-linear-gradient(to right, transparent 0 22px, oklch(0.92 0.05 85 / 0.7) 22px 70px, transparent 70px 128px); background-size:128px 100%; background-repeat:repeat-x; opacity:0.85; }
.rr-road-dashes.running { animation: rr-road-dash 0.35s linear infinite; }
@keyframes rr-fade-in { from{opacity:0;transform:scale(0.9);} to{opacity:1;transform:scale(1);} }
.rr-fade-in { animation: rr-fade-in 0.2s ease; }
@keyframes rr-burst-out { from{opacity:1;transform:scale(0.3);} to{opacity:0;transform:scale(1.4);} }
`;

// ─────────────────────── Sub-components ───────────────────────
function ParallaxLayer({ src, active, speed, extraStyle }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", ...extraStyle }}>
      <div className={`rr-track ${speed} ${active ? "" : "paused"}`}>
        <img src={src} alt="" className="rr-tile" draggable={false} />
        <img src={src} alt="" className="rr-tile" draggable={false} aria-hidden />
      </div>
    </div>
  );
}

function Road({ active }) {
  return (
    <div style={{ position:"absolute", inset:"0 0 0 0", bottom:0, height:"8%", top:"auto", overflow:"hidden", pointerEvents:"none" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, oklch(0.78 0.10 55), oklch(0.62 0.10 48))" }} />
      <div style={{ position:"absolute", top:"18%", bottom:"6%", background:"linear-gradient(to bottom, oklch(0.58 0.08 50), oklch(0.46 0.07 46))" }} />
      <div className={`rr-road-dashes ${active ? "running" : ""}`} />
    </div>
  );
}

function DustTrail({ intensity }) {
  const c = Math.max(0.15, Math.min(1.2, intensity));
  return (
    <div style={{ position:"absolute", left:"8%", bottom:"8%", width:0, height:0, pointerEvents:"none" }}>
      {[...Array(4)].map((_, i) => {
        const size = (10 + i * 4) * c;
        return (
          <div key={i} style={{ position:"absolute", width:size, height:size, left:-size/2, top:-size/2, borderRadius:"50%", background:"radial-gradient(circle, rgba(220,195,150,0.6), rgba(180,150,110,0))", opacity: 0.6 * c, transform:`translateX(${-30*c*i}px)` }} />
        );
      })}
    </div>
  );
}

function ChipBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:"oklch(0.26 0.03 260)", border:"1px solid oklch(0.32 0.03 260)", borderRadius:8, padding:"6px 0", fontSize:13, fontWeight:700, color:"oklch(0.97 0.01 250)", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1, flex:1 }}>
      {children}
    </button>
  );
}

function BetPanel({ label, bet, setBet, phase, multiplier, balance, onPlace, onCashOut, open, onToggle }) {
  const chips = [1, 2, 5, 10];
  const setStake = (n) => setBet(b => ({ ...b, stake: Math.max(0.1, Math.min(n, balance + (b.status !== "none" ? b.stake : 0))) }));

  const canCashOut = phase === "running" && bet.status === "active";
  const isQueued = bet.status === "queued";
  const justCashed = bet.status === "cashed";
  const justLost = bet.status === "lost";

  let btnBg = "oklch(0.72 0.22 145)";
  let btnColor = "oklch(0.15 0.02 260)";
  let btnText, btnSub, btnAction = onPlace;

  if (justCashed) {
    btnBg = "oklch(0.6 0.2 50)"; btnColor = "#fff";
    btnText = "CASHED OUT"; btnSub = `+৳${fmt(bet.lastWin ?? 0)} @ x${fmtX(bet.cashoutMultiplier ?? 1)}`;
  } else if (justLost) {
    btnBg = "oklch(0.65 0.24 25)"; btnColor = "#fff";
    btnText = "LOST"; btnSub = `-৳${fmt(bet.stake)}`;
  } else if (canCashOut) {
    btnBg = "oklch(0.7 0.2 50)"; btnColor = "#000";
    btnText = "CASH OUT"; btnSub = `৳${fmt(bet.stake * multiplier)}`; btnAction = onCashOut;
  } else if (isQueued) {
    btnBg = "oklch(0.55 0.24 25)"; btnColor = "#fff";
    btnText = "CANCEL"; btnSub = "Waiting...";
  } else {
    btnText = "MAKE BET"; btnSub = null;
  }

  return (
    <div style={{ background:"oklch(0.22 0.03 260)", border:"1px solid oklch(0.32 0.03 260)", borderRadius:14, padding:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: open ? 10 : 0 }}>
        <span style={{ fontSize:12, fontWeight:700, color:"oklch(0.7 0.02 260)" }}>{label}</span>
        <button onClick={onToggle} style={{ background:"oklch(0.26 0.03 260)", border:"none", borderRadius:6, padding:"4px 8px", color:"oklch(0.97 0.01 250)", cursor:"pointer", fontSize:12 }}>
          {open ? "−" : "+"}
        </button>
      </div>
      {open && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8 }}>
          {/* Bet input */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ background:"oklch(0.26 0.03 260)", borderRadius:8, padding:"8px 10px", border:"1px solid oklch(0.32 0.03 260)" }}>
              <div style={{ fontSize:10, color:"oklch(0.7 0.02 260)", marginBottom:2 }}>Bet (৳)</div>
              <input type="number" inputMode="decimal" step="0.1" min="0.1" value={bet.stake}
                disabled={bet.status !== "none"}
                onChange={e => setStake(Number(e.target.value) || 0.1)}
                style={{ background:"transparent", border:"none", outline:"none", color:"oklch(0.97 0.01 250)", fontSize:16, fontWeight:700, width:"100%", opacity: bet.status !== "none" ? 0.7 : 1 }} />
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {chips.slice(0,2).map(c => <ChipBtn key={c} onClick={() => setStake(c)} disabled={bet.status !== "none"}>৳{c}</ChipBtn>)}
            </div>
            <div style={{ display:"flex", gap:4 }}>
              <ChipBtn onClick={() => setStake(bet.stake / 2)} disabled={bet.status !== "none"}>/2</ChipBtn>
              <ChipBtn onClick={() => setStake(bet.stake * 2)} disabled={bet.status !== "none"}>×2</ChipBtn>
            </div>
          </div>

          {/* Autocashout */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ background:"oklch(0.26 0.03 260)", borderRadius:8, padding:"8px 10px", border:"1px solid oklch(0.32 0.03 260)" }}>
              <div style={{ fontSize:10, color:"oklch(0.7 0.02 260)", marginBottom:2 }}>Auto x</div>
              <input type="number" inputMode="decimal" step="0.1" min="0" value={bet.autoCashout}
                disabled={bet.status !== "none"}
                onChange={e => setBet(b => ({ ...b, autoCashout: Math.max(0, Number(e.target.value) || 0) }))}
                style={{ background:"transparent", border:"none", outline:"none", color:"oklch(0.97 0.01 250)", fontSize:16, fontWeight:700, width:"100%", opacity: bet.status !== "none" ? 0.7 : 1 }} />
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {chips.slice(2).map(c => <ChipBtn key={c} onClick={() => setStake(c)} disabled={bet.status !== "none"}>৳{c}</ChipBtn>)}
            </div>
          </div>

          {/* Action button */}
          <button onClick={btnAction}
            disabled={bet.status === "lost" || bet.status === "cashed"}
            style={{ background:btnBg, color:btnColor, border:"none", borderRadius:12, padding:"0 14px", minWidth:100, minHeight:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, cursor:"pointer", fontFamily:"inherit", opacity: (bet.status === "lost" || bet.status === "cashed") ? 0.9 : 1 }}>
            <span style={{ fontSize:13, fontWeight:800 }}>{btnText}</span>
            {btnSub && <span style={{ fontSize:11, fontWeight:700 }}>{btnSub}</span>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────── Main Component ───────────────────────
export default function RoadRushGame({ balance, setBalance, onExit }) {
  const [phase, setPhase] = useState("idle"); // "idle" (betting) | "running" | "crashed"
  const [multiplier, setMultiplier] = useState(1);
  const [history, setHistory] = useState([]);
  const [roundId, setRoundId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [bet1, setBet1] = useState(initialBet(10));
  const [bet2, setBet2] = useState(initialBet(10));
  const [panel2Open, setPanel2Open] = useState(false);
  const [wsStatus, setWsStatus] = useState("connecting");

  const wsRef = useRef(null);
  const bettingEndsAtRef = useRef(0);
  const countdownRafRef = useRef(0);
  const bet1Ref = useRef(bet1);
  const bet2Ref = useRef(bet2);
  const autoRolled1Ref = useRef(false);
  const autoRolled2Ref = useRef(false);

  useEffect(() => { bet1Ref.current = bet1; }, [bet1]);
  useEffect(() => { bet2Ref.current = bet2; }, [bet2]);

  // ── Real backend connection — same engine/protocol as Aviator & Moto Ride ──
  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token }));

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "auth_ok") setWsStatus("connected");

      if (msg.type === "state") {
        setPhase(msg.phase === "running" ? "running" : msg.phase);
        setMultiplier(msg.multiplier);
        setRoundId(msg.roundId);
        setHistory((msg.history || []).map(h => h.crashPoint));
        if (msg.phase === "betting" && msg.bettingEndsAt) bettingEndsAtRef.current = msg.bettingEndsAt;
      }

      if (msg.type === "betting_open") {
        setPhase("idle");
        setMultiplier(1);
        setRoundId(msg.roundId);
        bettingEndsAtRef.current = msg.bettingEndsAt;
        setHistory((msg.history || []).map(h => h.crashPoint));
        autoRolled1Ref.current = false;
        autoRolled2Ref.current = false;
        setBet1(b => ({ ...b, status: "none", cashoutMultiplier: null, lastWin: null }));
        setBet2(b => ({ ...b, status: "none", cashoutMultiplier: null, lastWin: null }));
      }

      if (msg.type === "round_start") {
        setPhase("running");
        setBet1(b => b.status === "queued" ? { ...b, status: "active" } : b);
        setBet2(b => b.status === "queued" ? { ...b, status: "active" } : b);
      }

      if (msg.type === "tick") {
        setMultiplier(msg.multiplier);
        // Auto cashout — client-triggered off the last server tick, but the
        // server independently validates the multiplier when it receives the
        // request, so this is a convenience, not the authority.
        if (bet1Ref.current.status === "active" && !autoRolled1Ref.current && bet1Ref.current.autoCashout > 0 && msg.multiplier >= bet1Ref.current.autoCashout) {
          autoRolled1Ref.current = true;
          wsRef.current?.send(JSON.stringify({ type: "cashout", slot: 1 }));
        }
        if (bet2Ref.current.status === "active" && !autoRolled2Ref.current && bet2Ref.current.autoCashout > 0 && msg.multiplier >= bet2Ref.current.autoCashout) {
          autoRolled2Ref.current = true;
          wsRef.current?.send(JSON.stringify({ type: "cashout", slot: 2 }));
        }
      }

      if (msg.type === "bet_accepted") {
        setBalance(msg.newBalance);
        const setBet = msg.slot === 1 ? setBet1 : setBet2;
        setBet(b => ({ ...b, status: "queued", cashoutMultiplier: null, lastWin: null }));
      }

      if (msg.type === "cancel_accepted") {
        setBalance(msg.newBalance);
        const setBet = msg.slot === 1 ? setBet1 : setBet2;
        setBet(b => ({ ...b, status: "none" }));
      }

      if (msg.type === "cashout_accepted") {
        setBalance(msg.newBalance);
        const setBet = msg.slot === 1 ? setBet1 : setBet2;
        setBet(b => ({ ...b, status: "cashed", cashoutMultiplier: msg.multiplier, lastWin: msg.winAmount }));
      }

      if (msg.type === "crashed") {
        setPhase("crashed");
        setMultiplier(msg.crashPoint);
        setHistory(h => [msg.crashPoint, ...h].slice(0, 20));
        setBet1(b => b.status === "active" ? { ...b, status: "lost" } : b);
        setBet2(b => b.status === "active" ? { ...b, status: "lost" } : b);
      }
    };

    ws.onerror = () => setWsStatus("error");
    ws.onclose = () => { setWsStatus("connecting"); setTimeout(connect, 3000); };
  }, [setBalance]);

  useEffect(() => {
    connect();
    return () => { cancelAnimationFrame(countdownRafRef.current); if (wsRef.current) wsRef.current.close(); };
  }, [connect]);

  // Countdown display derived from the server's bettingEndsAt timestamp, not
  // counted locally — correct even on reconnect mid-phase.
  useEffect(() => {
    if (phase !== "idle") return;
    const tick = () => {
      const remaining = Math.max(0, bettingEndsAtRef.current - Date.now());
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining > 0) countdownRafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(countdownRafRef.current);
  }, [phase]);

  const placeBet = (which) => {
    const bet = which === 1 ? bet1 : bet2;
    if (bet.status === "queued") {
      wsRef.current?.send(JSON.stringify({ type: "cancel", slot: which }));
      return;
    }
    if (bet.status !== "none" || bet.stake <= 0 || bet.stake > balance) return;
    wsRef.current?.send(JSON.stringify({ type: "bet", slot: which, amount: bet.stake }));
  };

  const cashOut = (which) => {
    const bet = which === 1 ? bet1 : bet2;
    if (bet.status !== "active" || phase !== "running") return;
    wsRef.current?.send(JSON.stringify({ type: "cashout", slot: which }));
  };

  // Cosmetic-only car position, driven by the current multiplier (which comes
  // from real server ticks) — never decides any outcome, just animates
  // smoothly between the ~10-times-a-second server updates.
  const carProgress = phase === "running" ? Math.min((multiplier - 1) / 4, 1) : 0;
  const carLeft = phase === "crashed" ? "120%" : `${5 + carProgress * 45}%`;

  const historyColor = (h) => h >= 2 ? "oklch(0.65 0.28 300)" : h >= 1.5 ? "oklch(0.7 0.18 230)" : "oklch(0.55 0.05 260)";

  return (
    <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:999, background:"oklch(0.18 0.03 260)", overflowY:"auto" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid oklch(0.32 0.03 260)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ lineHeight:1.1 }}>
            <div style={{ fontSize:13, fontWeight:900, letterSpacing:1 }}>ROAD</div>
            <div style={{ fontSize:13, fontWeight:900, letterSpacing:1, color:"oklch(0.82 0.16 80)" }}>RUSH</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {wsStatus !== "connected" && (
            <span style={{ fontSize:11, color: wsStatus === "error" ? "oklch(0.65 0.24 25)" : "oklch(0.75 0.15 80)" }}>
              {wsStatus === "error" ? "Connection error" : "Connecting…"}
            </span>
          )}
          <div style={{ background:"oklch(0.22 0.03 260)", borderRadius:20, padding:"6px 16px", border:"1px solid oklch(0.32 0.03 260)", fontWeight:700, fontSize:14 }}>
            ৳{fmt(balance)}
          </div>
        </div>
        {onExit && (
          <button onClick={onExit}
            style={{ background:"oklch(0.26 0.03 260)", border:"none", borderRadius:8, padding:"8px 14px", color:"oklch(0.97 0.01 250)", fontWeight:700, fontSize:13, cursor:"pointer" }}>
            ✕ Exit
          </button>
        )}
      </div>

      {/* History strip */}
      <div style={{ display:"flex", gap:6, padding:"8px 14px", overflowX:"auto" }}>
        {history.length === 0 && <span style={{ fontSize:11, color:"oklch(0.6 0.02 260)" }}>No rounds yet</span>}
        {history.slice(0, 6).map((h, i) => (
          <div key={i} style={{ flexShrink:0, background:"oklch(0.22 0.03 260)", border:"1px solid oklch(0.32 0.03 260)", borderRadius:8, padding:"4px 10px", fontWeight:700, fontSize:12, color:historyColor(h) }}>
            x{fmtX(h)}
          </div>
        ))}
      </div>

      {/* Scene */}
      <div style={{ padding:"0 12px" }}>
        <div style={{ position:"relative", aspectRatio:"16/11", borderRadius:18, overflow:"hidden", border:"1px solid oklch(0.32 0.03 260)" }}>
          <ParallaxLayer src={bgImg} active={phase==="running"} speed="rr-slow" />
          <ParallaxLayer src={cloudsImg} active={phase==="running"} speed="rr-medium" extraStyle={{ top:"5%", height:"55%", bottom:"auto" }} />
          <ParallaxLayer src={foregroundImg} active={phase==="running"} speed="rr-fast" extraStyle={{ bottom:"10%", height:"70%", top:"auto" }} />
          <Road active={phase==="running"} />

          {/* Round id */}
          <div style={{ position:"absolute", bottom:6, left:10, fontSize:10, color:"rgba(255,255,255,0.5)" }}>
            Round: {roundId ? roundId.slice(0, 8) : "—"}
          </div>

          {/* Multiplier */}
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
            {phase === "idle" && (
              <div className="rr-fade-in" style={{ textAlign:"center" }}>
                <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600 }}>Next round in</div>
                <div className="rr-multiplier-text" style={{ fontSize:52, marginTop:2 }}>{countdown}s</div>
              </div>
            )}
            {phase === "crashed" && (
              <div className="rr-fade-in" style={{ textAlign:"center" }}>
                <div className="rr-crash-text" style={{ fontSize:28, textTransform:"uppercase", letterSpacing:2 }}>Crashed!</div>
                <div className="rr-crash-text" style={{ fontSize:56 }}>x{fmtX(multiplier)}</div>
              </div>
            )}
            {phase === "running" && (
              <div className="rr-multiplier-text" style={{ fontSize:60 }}>x{fmtX(multiplier)}</div>
            )}
          </div>

          {/* Car */}
          <div style={{ position:"absolute", bottom:"1%", left:carLeft, width:"42%", transition: phase==="crashed" ? "left 0.9s ease-in" : "left 0.1s linear" }}>
            {phase !== "idle" && <DustTrail intensity={phase==="crashed" ? 1 : 0.25 + carProgress * 0.9} />}
            <div className={phase==="running" || phase==="crashed" ? "rr-car-bounce" : ""}>
              <img src={carImg} alt="" className={phase==="running" ? "rr-wind-sway" : ""} style={{ width:"100%", height:"auto", display:"block", transformOrigin:"bottom center" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bet panels */}
      <div style={{ padding:"12px", display:"flex", flexDirection:"column", gap:10 }}>
        <BetPanel label="Bet 1" bet={bet1} setBet={setBet1} phase={phase} multiplier={multiplier} balance={balance}
          onPlace={() => placeBet(1)} onCashOut={() => cashOut(1)} open={true} onToggle={() => {}} />
        <BetPanel label="Bet 2" bet={bet2} setBet={setBet2} phase={phase} multiplier={multiplier} balance={balance}
          onPlace={() => placeBet(2)} onCashOut={() => cashOut(2)} open={panel2Open} onToggle={() => setPanel2Open(o => !o)} />
      </div>
    </div>
  );
}

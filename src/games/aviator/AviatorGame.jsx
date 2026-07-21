import React, { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "../../constants";
import { getToken } from "../../api";

const WS_URL = "ws://localhost:4000/ws/aviator";
const GROWTH_RATE = 0.00011; // cosmetic only — mirrors the server's rate purely so the plane's
                              // flight path animates smoothly; the actual crash point and every
                              // payout are decided server-side, this never feeds into either.

// Inverse of the server's multiplier-from-elapsed-time function — used only
// to drive the plane's path animation from a multiplier value, never to
// decide any outcome.
function elapsedAtMultiplier(m) {
  return Math.log(Math.max(1, m)) / GROWTH_RATE;
}

function HistoryPill({ m }) {
  const col = m < 2 ? { bg:"rgba(14,165,233,0.1)", text:"#7dd3fc", border:"rgba(14,165,233,0.3)" }
    : m < 10 ? { bg:"rgba(139,92,246,0.1)", text:"#c4b5fd", border:"rgba(139,92,246,0.3)" }
    : { bg:"rgba(236,72,153,0.1)", text:"#f9a8d4", border:"rgba(236,72,153,0.3)" };
  return (
    <div style={{ padding:"2px 10px", borderRadius:100, fontSize:11, fontWeight:700, whiteSpace:"nowrap", background:col.bg, color:col.text, border:`1px solid ${col.border}`, fontFamily:"monospace", flexShrink:0 }}>
      {m.toFixed(2)}x
    </div>
  );
}

function Plane({ phase, planeX, planeY, planeRot, crashAnim }) {
  const opacity = phase === "betting" ? 0 : phase === "crashed" ? Math.max(0, 1 - crashAnim * 1.1) : 1;
  return (
    <div style={{
      position:"absolute",
      left:`${phase === "betting" ? 0 : planeX}%`,
      top:`${phase === "betting" ? 100 : planeY}%`,
      width:"clamp(70px,20vw,120px)",
      height:"clamp(70px,20vw,120px)",
      transform:`translate(-50%,-50%) rotate(${planeRot}deg)`,
      filter:"drop-shadow(0 6px 18px rgba(239,68,68,0.6))",
      opacity,
      pointerEvents:"none",
      animation: phase === "flying" ? "wobble 0.6s ease-in-out infinite" : "none",
    }}>
      <img src="/plane.webp" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
    </div>
  );
}

function BetPanel({ slot, phase, balance, betAmount, setBetAmount, autoCashout, setAutoCashout, hasBet, cashedOutAt, multiplier, placeBet, cancelBet, cashOut, collapsible }) {
  const [tab, setTab] = useState("bet");
  const [collapsed, setCollapsed] = useState(false);

  const canBet = phase === "betting" && !hasBet && betAmount <= balance;
  const canCash = phase === "flying" && hasBet && !cashedOutAt;
  const canCancel = phase === "betting" && hasBet;

  const btnBg = canCash ? "#22c55e" : canCancel ? "#ef4444" : canBet ? "#22c55e" : "#374151";
  const btnText = canCash ? `Cash Out\n${(betAmount * multiplier).toFixed(2)} USD`
    : canCancel ? "Cancel\nBet"
    : hasBet && phase === "flying" ? `Cashed\n${cashedOutAt?.toFixed(2)}x`
    : `Bet\n${betAmount.toFixed(2)} USD`;

  if (collapsed) return (
    <div style={{ background:"#11151c", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)", padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Bet panel {slot}</span>
      <button onClick={() => setCollapsed(false)} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:12 }}>Show</button>
    </div>
  );

  return (
    <div style={{ background:"#11151c", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)", padding:"10px 12px" }}>
      {/* Tabs */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:20, padding:2, flex:1, marginRight:8 }}>
          {["bet","auto"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"5px 0", borderRadius:18, border:"none", cursor:"pointer", background:tab===t?"rgba(255,255,255,0.15)":"transparent", color:tab===t?"#fff":"rgba(255,255,255,0.4)", fontWeight:700, fontSize:12, fontFamily:"'Poppins',sans-serif", textTransform:"capitalize" }}>{t === "bet" ? "Bet" : "Auto"}</button>
          ))}
        </div>
        {collapsible && (
          <button onClick={() => setCollapsed(true)} style={{ width:28, height:28, borderRadius:8, border:"none", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
        )}
      </div>

      <div style={{ display:"flex", gap:10, alignItems:"stretch" }}>
        {/* Left side */}
        <div style={{ flex:1 }}>
          {tab === "bet" ? (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <button onClick={() => setBetAmount(v => Math.max(1, v-1))} disabled={hasBet} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>−</button>
                <input type="number" value={betAmount} onChange={e => setBetAmount(Math.max(1, Number(e.target.value)||1))} disabled={hasBet} style={{ flex:1, background:"transparent", border:"none", color:"#fff", textAlign:"center", fontSize:18, fontWeight:700, outline:"none", fontFamily:"monospace" }}/>
                <button onClick={() => setBetAmount(v => v+1)} disabled={hasBet} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                {[1,2,5,10].map(v => (
                  <button key={v} onClick={() => setBetAmount(v)} disabled={hasBet} style={{ padding:"6px 0", borderRadius:8, border:"none", background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, cursor:"pointer" }}>{v}</button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:6, letterSpacing:"0.2em", textTransform:"uppercase" }}>Auto Cash Out</div>
              <input type="number" placeholder="—" value={autoCashout} onChange={e => setAutoCashout(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", textAlign:"center", fontSize:18, fontWeight:700, outline:"none", fontFamily:"monospace", borderRadius:8, padding:"8px 0" }}/>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:4, textAlign:"center" }}>x multiplier</div>
            </>
          )}
        </div>

        {/* Big Button */}
        <button
          onClick={() => { if (canBet) placeBet(); else if (canCancel) cancelBet(); else if (canCash) cashOut(); }}
          disabled={!canBet && !canCancel && !canCash}
          style={{ width:130, borderRadius:12, border:"none", background:btnBg, color:"#fff", fontWeight:900, fontSize:15, cursor:(canBet||canCancel||canCash)?"pointer":"not-allowed", fontFamily:"'Poppins',sans-serif", whiteSpace:"pre-line", lineHeight:1.4, boxShadow:canCash?"0 4px 20px rgba(34,197,94,0.4)":canBet?"0 4px 20px rgba(34,197,94,0.3)":"none", animation:canCash?"pulse 1.2s ease infinite":"none" }}>
          {btnText}
        </button>
      </div>
    </div>
  );
}

export default function AviatorGame({ balance, setBalance, onBack }) {
  const [phase, setPhase] = useState("betting"); // "betting" | "flying" | "crashed" — "flying" maps to the server's "running"
  const [countdown, setCountdown] = useState(0);
  const [bettingMs, setBettingMs] = useState(7000);
  const [multiplier, setMultiplier] = useState(1.0);
  const [history, setHistory] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [betAmount2, setBetAmount2] = useState(10);
  const [autoCashout2, setAutoCashout2] = useState("");
  const [hasBet2, setHasBet2] = useState(false);
  const [cashedOutAt2, setCashedOutAt2] = useState(null);
  const [autoCashout, setAutoCashout] = useState("");
  const [hasBet, setHasBet] = useState(false);
  const [cashedOutAt, setCashedOutAt] = useState(null);
  const [crashAnim, setCrashAnim] = useState(0);
  const [cashoutHistory, setCashoutHistory] = useState([]);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [errMsg, setErrMsg] = useState("");
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const wsRef = useRef(null);
  const countdownRafRef = useRef(0);
  const crashRafRef = useRef(0);
  const bettingEndsAtRef = useRef(0);
  const hasBetRef = useRef(false);
  const hasBet2Ref = useRef(false);
  const cashedOutRef = useRef(false);
  const cashedOut2Ref = useRef(false);
  const autoCashoutRef = useRef("");
  const autoCashout2Ref = useRef("");
  const betAmountRef = useRef(betAmount);
  const betAmount2Ref = useRef(betAmount2);
  const canvasRef = useRef(null);

  useEffect(() => { hasBetRef.current = hasBet; }, [hasBet]);
  useEffect(() => { hasBet2Ref.current = hasBet2; }, [hasBet2]);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);
  useEffect(() => { autoCashout2Ref.current = autoCashout2; }, [autoCashout2]);
  useEffect(() => { betAmountRef.current = betAmount; }, [betAmount]);
  useEffect(() => { betAmount2Ref.current = betAmount2; }, [betAmount2]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setCanvasSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── WebSocket connection — real server, real wallet, real provably-fair crash point ──
  const connect = useCallback(() => {
    const token = getToken();
    if (!token) { setErrMsg("Not logged in"); return; }
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token }));

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "auth_ok") setWsStatus("connected");

      if (msg.type === "state") {
        setPhase(msg.phase === "running" ? "flying" : msg.phase);
        setMultiplier(msg.multiplier);
        setHistory((msg.history || []).map(h => h.crashPoint));
        if (msg.phase === "betting" && msg.bettingEndsAt) bettingEndsAtRef.current = msg.bettingEndsAt;
      }

      if (msg.type === "betting_open") {
        setPhase("betting");
        setMultiplier(1.0);
        setCrashAnim(0);
        setHasBet(false); hasBetRef.current = false; setCashedOutAt(null); cashedOutRef.current = false;
        setHasBet2(false); hasBet2Ref.current = false; setCashedOutAt2(null); cashedOut2Ref.current = false;
        setBettingMs(msg.bettingMs);
        bettingEndsAtRef.current = msg.bettingEndsAt;
        setHistory((msg.history || []).map(h => h.crashPoint));
      }

      if (msg.type === "round_start") {
        setPhase("flying");
      }

      if (msg.type === "tick") {
        setMultiplier(msg.multiplier);
        // Auto cashout — client-triggered based on the last server tick, but
        // the server independently validates the multiplier at the moment it
        // receives the request, so this is a convenience, not the authority.
        if (hasBetRef.current && !cashedOutRef.current && autoCashoutRef.current !== "" && msg.multiplier >= Number(autoCashoutRef.current)) {
          cashedOutRef.current = true;
          wsRef.current?.send(JSON.stringify({ type: "cashout", slot: 1 }));
        }
        if (hasBet2Ref.current && !cashedOut2Ref.current && autoCashout2Ref.current !== "" && msg.multiplier >= Number(autoCashout2Ref.current)) {
          cashedOut2Ref.current = true;
          wsRef.current?.send(JSON.stringify({ type: "cashout", slot: 2 }));
        }
      }

      if (msg.type === "bet_accepted") {
        setBalance(msg.newBalance);
        if (msg.slot === 1) { setHasBet(true); hasBetRef.current = true; }
        else { setHasBet2(true); hasBet2Ref.current = true; }
      }

      if (msg.type === "cancel_accepted") {
        setBalance(msg.newBalance);
        if (msg.slot === 1) { setHasBet(false); hasBetRef.current = false; }
        else { setHasBet2(false); hasBet2Ref.current = false; }
      }

      if (msg.type === "cashout_accepted") {
        setBalance(msg.newBalance);
        if (msg.slot === 1) { setCashedOutAt(msg.multiplier); cashedOutRef.current = true; }
        else { setCashedOutAt2(msg.multiplier); cashedOut2Ref.current = true; }
        setCashoutHistory(ch => [{ id: Date.now(), bet: msg.slot === 1 ? betAmountRef.current : betAmount2Ref.current, multiplier: msg.multiplier, win: msg.winAmount, crashed: false, time: Date.now() }, ...ch].slice(0, 30));
      }

      if (msg.type === "crashed") {
        setPhase("crashed");
        setMultiplier(msg.crashPoint);
        setHistory(h => [msg.crashPoint, ...h].slice(0, 20));

        if (hasBetRef.current && !cashedOutRef.current) {
          setCashoutHistory(ch => [{ id: Date.now()+1, bet: betAmountRef.current, multiplier: msg.crashPoint, win: 0, crashed: true, time: Date.now() }, ...ch].slice(0, 30));
        }
        if (hasBet2Ref.current && !cashedOut2Ref.current) {
          setCashoutHistory(ch => [{ id: Date.now()+2, bet: betAmount2Ref.current, multiplier: msg.crashPoint, win: 0, crashed: true, time: Date.now() }, ...ch].slice(0, 30));
        }

        const start = performance.now();
        const animTick = () => {
          const t = Math.min(1, (performance.now() - start) / 1400);
          setCrashAnim(t);
          if (t < 1) crashRafRef.current = requestAnimationFrame(animTick);
        };
        animTick();
      }

      if (msg.type === "error") {
        setErrMsg(msg.message);
        setTimeout(() => setErrMsg(""), 3000);
      }
    };

    ws.onerror = () => setWsStatus("error");
    ws.onclose = () => { setWsStatus("connecting"); setTimeout(connect, 3000); };
  }, [setBalance]);

  useEffect(() => {
    connect();
    return () => { cancelAnimationFrame(countdownRafRef.current); cancelAnimationFrame(crashRafRef.current); if (wsRef.current) wsRef.current.close(); };
  }, [connect]);

  // Countdown display, derived from the server-provided bettingEndsAt timestamp
  // rather than counted locally — so it's correct even on reconnect mid-phase.
  useEffect(() => {
    if (phase !== "betting") return;
    const tick = () => {
      const remaining = Math.max(0, bettingEndsAtRef.current - Date.now());
      setCountdown(remaining);
      if (remaining > 0) countdownRafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(countdownRafRef.current);
  }, [phase]);

  const placeBet = () => {
    if (phase !== "betting" || hasBet || betAmount <= 0 || betAmount > balance) return;
    wsRef.current?.send(JSON.stringify({ type: "bet", slot: 1, amount: betAmount }));
  };
  const cancelBet = () => {
    if (phase !== "betting" || !hasBet) return;
    wsRef.current?.send(JSON.stringify({ type: "cancel", slot: 1 }));
  };
  const cashOut = () => {
    if (phase !== "flying" || !hasBet || cashedOutAt) return;
    wsRef.current?.send(JSON.stringify({ type: "cashout", slot: 1 }));
  };
  const placeBet2 = () => {
    if (phase !== "betting" || hasBet2 || betAmount2 <= 0 || betAmount2 > balance) return;
    wsRef.current?.send(JSON.stringify({ type: "bet", slot: 2, amount: betAmount2 }));
  };
  const cancelBet2 = () => {
    if (phase !== "betting" || !hasBet2) return;
    wsRef.current?.send(JSON.stringify({ type: "cancel", slot: 2 }));
  };
  const cashOut2 = () => {
    if (phase !== "flying" || !hasBet2 || cashedOutAt2) return;
    wsRef.current?.send(JSON.stringify({ type: "cashout", slot: 2 }));
  };

  // Curve geometry — purely cosmetic, derives the plane's position from the
  // current multiplier so the flight path animates smoothly between the
  // server's 10-times-a-second ticks.
  const flightElapsed = phase === "betting" ? 0 : elapsedAtMultiplier(multiplier);
  const curve = (p) => {
    const cp = Math.min(1, Math.max(0, p));
    return { x: cp * 88, y: 100 - Math.pow(cp, 0.55) * 88 };
  };
  const rawProgress = Math.min(1, Math.max(0, flightElapsed / 8000));
  const progress = Math.log1p(rawProgress * 4) / Math.log(5);
  const base = curve(progress);
  const basePlaneX = base.x;
  const basePlaneY = base.y;

  const rawX = phase === "crashed" ? basePlaneX + crashAnim * 60 : basePlaneX;
  const rawY = phase === "crashed" ? basePlaneY - crashAnim * 60 : basePlaneY;
  const planeX = phase === "crashed" ? Math.min(rawX, 116) : Math.min(96, Math.max(0, rawX));
  const planeY = phase === "crashed" ? Math.max(rawY, -16) : Math.max(4, Math.min(100, rawY));
  const planeRot = phase === "crashed" ? -8 - crashAnim * 25 : 0;
  const trailOpacity = phase === "crashed" ? 1 - crashAnim : 1;

  const steps = 48;
  const pathPoints = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pt = curve(progress * t);
    pathPoints.push(`${pt.x.toFixed(3)},${pt.y.toFixed(3)}`);
  }
  const pathD = `M ${pathPoints[0]} ${pathPoints.slice(1).map(p => `L ${p}`).join(" ")}`;
  const fillD = `${pathD} L ${basePlaneX.toFixed(3)},100 L 0,100 Z`;

  const multColor = phase === "crashed" ? "#ef4444" : cashedOutAt ? "#10b981" : "#ffffff";

  return (
    <div style={{ minHeight:"100vh", background:"#0b0e13", color:"#fff", display:"flex", flexDirection:"column", fontFamily:"'Poppins',sans-serif" }}>
      <style>{`
        ${CSS}
        @keyframes wobble { 0%,100%{transform:translate(-50%,-50%) rotate(-8deg)} 50%{transform:translate(-50%,calc(-50% - 4px)) rotate(-6deg)} }
        @keyframes crashflash { 0%{opacity:1} 100%{opacity:0} }
        @keyframes flewaway { 0%{opacity:0;transform:scale(0.85)} 15%{opacity:1;transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
        @keyframes propspin { to{transform:rotate(360deg)} }
        @keyframes fanspin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"#11151c", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#aaa", fontSize:22, cursor:"pointer" }}>‹</button>
          <span style={{ color:"#ef4444", fontWeight:900, fontSize:22, fontStyle:"italic", letterSpacing:2, textShadow:"0 0 20px rgba(239,68,68,0.6)" }}>AVIATOR</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {wsStatus !== "connected" && (
            <span style={{ fontSize:11, color: wsStatus === "error" ? "#ef4444" : "#f59e0b" }}>
              {wsStatus === "error" ? "Connection error" : "Connecting…"}
            </span>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.5)", padding:"6px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontWeight:700, color:"#10b981", fontSize:15, fontFamily:"monospace" }}>{balance.toFixed(2)}</span>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>USD</span>
          </div>
        </div>
      </div>

      {errMsg && (
        <div style={{ background:"rgba(239,68,68,0.15)", color:"#f87171", padding:"6px 16px", fontSize:12, textAlign:"center" }}>{errMsg}</div>
      )}

      {/* History */}
      <div style={{ background:"#11151c", padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,0.05)", overflowX:"auto", display:"flex", gap:6 }}>
        {history.length === 0 && <span style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>No rounds yet</span>}
        {history.map((m, i) => <HistoryPill key={i} m={m} />)}
      </div>

      {/* Game Canvas */}
      <div ref={canvasRef} style={{ position:"relative", flex:1, minHeight:240, overflow:"hidden", background:"radial-gradient(ellipse at bottom left, #3a0a1a 0%, #0a0610 55%, #000 100%)" }}>
        {/* Fan lines */}
        <div style={{ position:"absolute", bottom:"-30%", left:"-20%", width:"140%", height:"160%", opacity:0.7, backgroundImage:"repeating-conic-gradient(from 0deg at 0% 100%, rgba(255,255,255,0.07) 0deg 2deg, transparent 2deg 8deg)", animation: phase === "flying" ? "fanspin 22s linear infinite" : "none" }} />
        {/* Dot grid */}
        <div style={{ position:"absolute", inset:0, opacity:0.25, backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)", backgroundSize:"36px 36px" }} />
        {/* Crash flash */}
        {phase === "crashed" && <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse at center, rgba(239,68,68,0.25) 0%, transparent 60%)", animation:"crashflash 0.6s ease-out" }} />}

        {/* SVG Trail */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:trailOpacity, transition:"opacity 0.25s ease-out" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trail" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="trailLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#ff5252" stopOpacity="1"/>
            </linearGradient>
          </defs>
          {phase !== "betting" && (
            <>
              <path d={fillD} fill="url(#trail)"/>
              <path d={pathD} fill="none" stroke="url(#trailLine)" strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
            </>
          )}
        </svg>

        {/* Plane */}
        <Plane phase={phase} planeX={planeX} planeY={planeY} planeRot={planeRot} crashAnim={crashAnim} />

        {/* Multiplier Display */}
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", padding:"0 16px" }}>
          {phase === "betting" ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:8 }}>Waiting for next round</div>
              <div style={{ fontSize:"clamp(48px,12vw,72px)", fontWeight:900, color:"#ef4444", fontFamily:"monospace", textShadow:"0 0 25px rgba(239,68,68,0.6)" }}>{(countdown/1000).toFixed(1)}s</div>
              <div style={{ width:176, height:4, background:"rgba(255,255,255,0.1)", borderRadius:4, marginTop:16, overflow:"hidden", margin:"16px auto 0" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#ef4444,#ec4899)", width:`${100-(countdown/Math.max(1,bettingMs))*100}%`, transition:"width 0.08s linear" }}/>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", animation: phase === "crashed" ? "flewaway 0.4s ease-out" : "none" }}>
              {phase === "crashed" && <div style={{ color:"#ef4444", fontSize:"clamp(14px,4vw,22px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.3em", marginBottom:8, textShadow:"0 0 15px rgba(239,68,68,0.8)" }}>Flew Away!</div>}
              <div style={{ fontSize:"clamp(56px,14vw,88px)", fontWeight:900, fontFamily:"monospace", color:multColor, textShadow: phase==="crashed" ? "0 0 30px rgba(239,68,68,0.9)" : cashedOutAt ? "0 0 25px rgba(16,185,129,0.7)" : "0 0 25px rgba(255,255,255,0.25)" }}>
                {multiplier.toFixed(2)}x
              </div>
              {cashedOutAt && phase === "flying" && (
                <div style={{ marginTop:12, background:"rgba(16,185,129,0.2)", border:"1px solid #10b981", padding:"4px 16px", borderRadius:8, backdropFilter:"blur(6px)" }}>
                  <span style={{ color:"#10b981", fontWeight:700, fontSize:13 }}>+{(betAmount * cashedOutAt).toFixed(2)} @ {cashedOutAt.toFixed(2)}x</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

     {/* Controls */}
      <div style={{ background:"#1a1d26", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"10px 10px 16px" }}>
        <div style={{ maxWidth:480, margin:"0 auto", display:"flex", flexDirection:"column", gap:8 }}>
          <BetPanel
            slot={1}
            phase={phase}
            balance={balance}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            autoCashout={autoCashout}
            setAutoCashout={setAutoCashout}
            hasBet={hasBet}
            cashedOutAt={cashedOutAt}
            multiplier={multiplier}
            placeBet={placeBet}
            cancelBet={cancelBet}
            cashOut={cashOut}
          />
          <BetPanel
            slot={2}
            phase={phase}
            balance={balance}
            betAmount={betAmount2}
            setBetAmount={setBetAmount2}
            autoCashout={autoCashout2}
            setAutoCashout={setAutoCashout2}
            hasBet={hasBet2}
            cashedOutAt={cashedOutAt2}
            multiplier={multiplier}
            placeBet={placeBet2}
            cancelBet={cancelBet2}
            cashOut={cashOut2}
            collapsible
          />
          {cashoutHistory.length > 0 && (
            <div style={{ background:"#11151c", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)", overflow:"hidden", marginTop:4 }}>
              <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                {["All Bets","Previous","Top"].map((t,i) => (
                  <button key={t} style={{ flex:1, padding:"10px 0", border:"none", background:i===0?"rgba(255,255,255,0.08)":"transparent", color:i===0?"#fff":"rgba(255,255,255,0.4)", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>{t}</button>
                ))}
              </div>
              <div style={{ maxHeight:150, overflowY:"auto" }}>
                {cashoutHistory.map(c => (
                  <div key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderTop:"1px solid rgba(255,255,255,0.04)", fontSize:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🎭</div>
                      <span style={{ color:"rgba(255,255,255,0.5)", fontFamily:"monospace" }}>{c.bet.toFixed(2)}</span>
                    </div>
                    <span style={{ padding:"2px 10px", borderRadius:6, fontWeight:700, fontFamily:"monospace", background:c.crashed?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)", color:c.crashed?"#f87171":"#34d399" }}>
                      {c.multiplier.toFixed(2)}x
                    </span>
                    <span style={{ fontWeight:700, fontFamily:"monospace", color:c.crashed?"#f87171":"#34d399" }}>
                      {c.crashed?`-${c.bet.toFixed(2)}`:`+${c.win.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

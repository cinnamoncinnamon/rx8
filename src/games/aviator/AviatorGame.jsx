import React, { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "../../constants";

function genBots() {
  const names = ["0***8","i***4","m***u","i***5","i***8","i***1","i***9","u***m","p***r","k***i","a***z","b***7","c***3","d***9","e***5","f***2"];
  return Array.from({ length: 14 }, (_, i) => {
    const bet = (Math.random() * 900 + 50).toFixed(2);
    const x = (Math.random() * 6 + 1.1).toFixed(2);
    return { name: names[i % 16], bet: parseFloat(bet), x: parseFloat(x), won: (parseFloat(bet) * parseFloat(x)).toFixed(2), flying: i >= 10 };
  });
}

export default function AviatorGame({ balance, setBalance, onBack }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(null);
  const crashRef = useRef(null);
  const phaseRef = useRef("waiting");
  const multRef = useRef(1.0);
  const pointsRef = useRef([]);

  const [phase, setPhase] = useState("waiting");
  const [mult, setMult] = useState(1.0);
  const [countdown, setCountdown] = useState(5);
  const [betAmt, setBetAmt] = useState(10);
  const [betAmt2, setBetAmt2] = useState(10);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betPlaced2, setBetPlaced2] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashedOut2, setCashedOut2] = useState(false);
  const [cashMult, setCashMult] = useState(null);
  const [cashMult2, setCashMult2] = useState(null);
  const [autoCash1, setAutoCash1] = useState(0);
  const [autoCash2, setAutoCash2] = useState(0);
  const [history, setHistory] = useState([1.28,77.76,1.76,17.13,7.33,11.42,1.05,3.24,2.14,1.42]);
  const [activeTab, setActiveTab] = useState("allbets");
  const [betTab1, setBetTab1] = useState("bet");
  const [betTab2, setBetTab2] = useState("bet");
  const [allBets, setAllBets] = useState(() => genBots());
  const [crashedMult, setCrashedMult] = useState(null);

  const betPlacedRef = useRef(false);
  const betPlaced2Ref = useRef(false);
  const betAmtRef = useRef(10);
  const betAmt2Ref = useRef(10);
  useEffect(() => { betPlacedRef.current = betPlaced; }, [betPlaced]);
  useEffect(() => { betPlaced2Ref.current = betPlaced2; }, [betPlaced2]);
  useEffect(() => { betAmtRef.current = betAmt; }, [betAmt]);
  useEffect(() => { betAmt2Ref.current = betAmt2; }, [betAmt2]);

  const cashedOutRef = useRef(false);
  const cashedOut2Ref = useRef(false);
  const autoCash1Ref = useRef(0);
  const autoCash2Ref = useRef(0);
  useEffect(() => { cashedOutRef.current = cashedOut; }, [cashedOut]);
  useEffect(() => { cashedOut2Ref.current = cashedOut2; }, [cashedOut2]);
  useEffect(() => { autoCash1Ref.current = autoCash1; }, [autoCash1]);
  useEffect(() => { autoCash2Ref.current = autoCash2; }, [autoCash2]);

  const mc = (m) => m < 2 ? "#FFD600" : m < 5 ? "#4ADE80" : m < 10 ? "#38BDF8" : "#F472B6";

  const drawFrame = useCallback((canvas, pts, currentMult, ph, cd) => {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0D0D1A";
    ctx.fillRect(0, 0, W, H);
    const ox = W * 0.05, oy = H * 0.98;
    const rays = 24;
    for (let i = 0; i < rays; i++) {
      const angle = -Math.PI / 2 + (i / (rays - 1)) * Math.PI * 0.65 - 0.1;
      const len = W * 2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(angle) * len, oy + Math.sin(angle) * len);
      ctx.strokeStyle = `rgba(255,255,255,${i % 2 === 0 ? 0.018 : 0.012})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (ph === "waiting" || ph === "crashed") {
      if (ph === "crashed" && pts.length > 1) drawCurve(ctx, pts, W, H, "#EF4444");
      return;
    }
    if (pts.length < 2) return;
    drawCurve(ctx, pts, W, H, "#EF4444");
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    drawPlane(ctx, last.x, last.y, angle, currentMult);
  }, []);

  function drawCurve(ctx, pts, W, H, color) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[pts.length - 1].x, H - 10);
    ctx.lineTo(pts[0].x, H - 10);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(239,68,68,0.35)");
    grad.addColorStop(1, "rgba(239,68,68,0.0)");
    ctx.fillStyle = grad; ctx.fill(); ctx.restore();
  }

  function drawPlane(ctx, x, y, angle, m) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1.3, 1.3);
    ctx.shadowColor = "#FF4400"; ctx.shadowBlur = 28;
    const fireLen = 18 + Math.random() * 14;
    const fireGrad = ctx.createLinearGradient(-50 - fireLen, 0, -38, 0);
    fireGrad.addColorStop(0, "rgba(255,220,0,0)");
    fireGrad.addColorStop(0.7, "rgba(255,80,0,0.95)");
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.ellipse(-44 - fireLen / 2, 2, fireLen / 2, 4 + Math.random() * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#C8000A";
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.bezierCurveTo(20, -8, 0, -10, -20, -8);
    ctx.bezierCurveTo(-36, -6, -44, -3, -46, 2);
    ctx.bezierCurveTo(-44, 7, -36, 8, -20, 8);
    ctx.bezierCurveTo(0, 10, 20, 7, 28, 0);
    ctx.fill();
    ctx.fillStyle = "#1A2A4A";
    ctx.beginPath();
    ctx.ellipse(8, -5, 9, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const startRound = useCallback(() => {
    const r = Math.random();
    let crash;
    if (r < 0.04) crash = 1.0;
    else crash = parseFloat(Math.max(1.01, (1 / (1 - Math.random())) * 0.97).toFixed(2));
    crashRef.current = crash;
    phaseRef.current = "flying";
    multRef.current = 1.0;
    pointsRef.current = [];
    startRef.current = performance.now();
    if (betPlacedRef.current) setBalance((b) => b - betAmtRef.current);
    if (betPlaced2Ref.current) setBalance((b) => b - betAmt2Ref.current);
    setPhase("flying"); setMult(1.0);
    const canvas = canvasRef.current;
    const W = canvas ? canvas.width : 460, H = canvas ? canvas.height : 240;
    const PAD_L = W * 0.07, PAD_B = H - 18, PAD_T = 18, PAD_R = W - 14;
    const tick = (now) => {
      if (phaseRef.current !== "flying") return;
      const elapsed = (now - startRef.current) / 1000;
      const m = parseFloat(Math.pow(Math.E, elapsed * 0.09).toFixed(3));
      multRef.current = m;
      setMult(parseFloat(m.toFixed(2)));
      const maxM = Math.max(crashRef.current * 1.1, 4);
      const t = Math.min((m - 1) / (maxM - 1), 1);
      const cx = PAD_L + t * (PAD_R - PAD_L);
      const cy = PAD_B - Math.pow(t, 0.7) * (PAD_B - PAD_T);
      const pts = pointsRef.current;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(cx - last.x, cy - last.y) > 3) {
        pointsRef.current = [...pts.slice(-120), { x: cx, y: cy }];
      }
      if (canvas) drawFrame(canvas, pointsRef.current, m, "flying", 0);
      if (autoCash1Ref.current > 0 && betPlacedRef.current && !cashedOutRef.current && m >= autoCash1Ref.current) {
        setBalance((b) => b + betAmtRef.current * m);
        setCashedOut(true); cashedOutRef.current = true; setCashMult(parseFloat(m.toFixed(2)));
      }
      if (autoCash2Ref.current > 0 && betPlaced2Ref.current && !cashedOut2Ref.current && m >= autoCash2Ref.current) {
        setBalance((b) => b + betAmt2Ref.current * m);
        setCashedOut2(true); cashedOut2Ref.current = true; setCashMult2(parseFloat(m.toFixed(2)));
      }
      if (m >= crashRef.current) {
        phaseRef.current = "crashed";
        setCrashedMult(crashRef.current);
        setPhase("crashed");
        setHistory((h) => [crashRef.current, ...h].slice(0, 20));
        setAllBets(genBots());
        setBetPlaced(false); setBetPlaced2(false); setCashedOut(false); setCashedOut2(false);
        cashedOutRef.current = false; cashedOut2Ref.current = false;
        if (canvas) drawFrame(canvas, pointsRef.current, m, "crashed", 0);
        setTimeout(() => {
          phaseRef.current = "waiting"; setPhase("waiting"); setCountdown(5); pointsRef.current = [];
          if (canvas) { const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, canvas.width, canvas.height); }
        }, 3000);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [setBalance]);

  useEffect(() => {
    if (phase !== "waiting") return;
    if (countdown <= 0) { startRound(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, startRound]);

  useEffect(() => {
    if (phase === "waiting" && canvasRef.current) drawFrame(canvasRef.current, [], "1.00", "waiting", countdown);
  }, [phase, countdown]);

  useEffect(() => () => { cancelAnimationFrame(animRef.current); }, []);

  const cashOut = (slot) => {
    if (phaseRef.current !== "flying") return;
    const m = multRef.current;
    if (slot === 1 && betPlacedRef.current && !cashedOutRef.current) {
      setBalance((b) => b + betAmtRef.current * m);
      setCashedOut(true); cashedOutRef.current = true; setCashMult(parseFloat(m.toFixed(2)));
    }
    if (slot === 2 && betPlaced2Ref.current && !cashedOut2Ref.current) {
      setBalance((b) => b + betAmt2Ref.current * m);
      setCashedOut2(true); cashedOut2Ref.current = true; setCashMult2(parseFloat(m.toFixed(2)));
    }
  };

  const BetPanel = ({ slot, amt, setAmt, placed, setPlaced, cashed, cashM, autoCash, setAutoCash, tab, setTab }) => {
    const canBet = !placed && phase === "waiting" && balance >= amt;
    const canCash = placed && !cashed && phase === "flying";
    const btnBg = canBet ? "#22C55E" : canCash ? "#EF4444" : cashed ? "#1a2a1a" : "#2A2A3A";
    const btnText = canBet ? `BET\n৳${amt}` : canCash ? `CASH OUT\n৳${(amt * mult).toFixed(2)}` : cashed ? `✓ ${cashM?.toFixed(2)}×` : "Waiting...";
    const glowColor = canBet ? "#22C55E44" : canCash ? "#EF444466" : "transparent";
    return (
      <div style={{ background:"#161622", borderRadius:14, padding:"12px 10px 14px", border:"1px solid #ffffff0D", flex:1 }}>
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          <button onClick={() => setTab("bet")} style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", background:tab==="bet"?"#22C55E22":"transparent", color:tab==="bet"?"#22C55E":"#444", fontWeight:700, fontSize:11, fontFamily:"'Poppins',sans-serif" }}>Bet</button>
          <button onClick={() => setTab("auto")} style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", background:tab==="auto"?"#FFD60022":"transparent", color:tab==="auto"?"#FFD600":"#444", fontWeight:700, fontSize:11, fontFamily:"'Poppins',sans-serif" }}>Auto</button>
        </div>
        {tab === "auto" ? (
          <div>
            <div style={{ color:"#888", fontSize:11, marginBottom:6, fontWeight:600 }}>Auto Cash Out at ×</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <button onClick={() => setAutoCash((v) => Math.max(0, parseFloat((v-0.1).toFixed(2))))} disabled={placed} style={{ width:28, height:28, borderRadius:"50%", border:"none", background:"#2A2A3A", color:"#fff", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>−</button>
              <span style={{ fontWeight:800, fontSize:15, color:"#FFD600", flex:1, textAlign:"center" }}>{autoCash > 0 ? autoCash.toFixed(2)+"×" : "Off"}</span>
              <button onClick={() => setAutoCash((v) => parseFloat((Math.max(1.1,v)+0.1).toFixed(2)))} disabled={placed} style={{ width:28, height:28, borderRadius:"50%", border:"none", background:"#2A2A3A", color:"#fff", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:10 }}>
              {[1.5,2,5,10].map((p) => <button key={p} onClick={() => setAutoCash(p)} disabled={placed} style={{ padding:"5px 0", borderRadius:7, border:"none", cursor:"pointer", background:autoCash===p?"#FFD60033":"#2A2A3A", color:autoCash===p?"#FFD600":"#888", fontSize:11, fontWeight:600, fontFamily:"'Poppins',sans-serif" }}>{p}×</button>)}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <button onClick={() => setAmt((a) => Math.max(1,a-1))} disabled={placed} style={{ width:28, height:28, borderRadius:"50%", border:"none", background:"#2A2A3A", color:"#fff", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>−</button>
              <span style={{ fontWeight:800, fontSize:15, color:"#fff", flex:1, textAlign:"center" }}>{amt.toFixed(2)}</span>
              <button onClick={() => setAmt((a) => a+1)} disabled={placed} style={{ width:28, height:28, borderRadius:"50%", border:"none", background:"#2A2A3A", color:"#fff", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:10 }}>
              {[1,2,5,10].map((p) => <button key={p} onClick={() => setAmt(p)} disabled={placed} style={{ padding:"5px 0", borderRadius:7, border:"none", cursor:"pointer", background:"#2A2A3A", color:"#888", fontSize:11, fontWeight:600, fontFamily:"'Poppins',sans-serif" }}>{p}</button>)}
            </div>
          </div>
        )}
        <button onClick={() => { if (canBet) setPlaced(true); else if (canCash) cashOut(slot); }}
          style={{ width:"100%", height:58, borderRadius:12, border:"none", cursor:"pointer", background:btnBg, color:"#fff", fontWeight:800, fontSize:12, lineHeight:1.5, whiteSpace:"pre-line", boxShadow:`0 4px 20px ${glowColor}`, fontFamily:"'Poppins',sans-serif", animation:canCash?"multPulse 0.8s infinite":"none" }}>
          {btnText}
        </button>
      </div>
    );
  };

  const displayMult = phase === "waiting" ? 1.0 : mult;
  const multColor = displayMult < 2 ? "#ffffff" : displayMult < 5 ? "#4ADE80" : displayMult < 10 ? "#38BDF8" : "#F472B6";

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#0D0D1A", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{CSS}</style>
      <div style={{ background:"#0A0A12", padding:"11px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid #ffffff0D" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#aaa", fontSize:22, cursor:"pointer" }}>‹</button>
        <span style={{ color:"#EF4444", fontWeight:900, fontSize:20, fontStyle:"italic", letterSpacing:2, textShadow:"0 0 20px #EF444466", fontFamily:"'Orbitron',monospace" }}>AVIATOR</span>
        <div style={{ flex:1 }} />
        <span style={{ background:"#22C55E22", borderRadius:20, padding:"4px 12px", color:"#22C55E", fontWeight:700, fontSize:13 }}>৳{balance.toFixed(2)}</span>
      </div>
      <div style={{ display:"flex", gap:5, padding:"7px 10px", overflowX:"auto", background:"#0A0A12", borderBottom:"1px solid #ffffff08", alignItems:"center" }}>
        <span style={{ fontSize:10, color:"#444", flexShrink:0 }}>History:</span>
        {history.map((m,i) => <div key={i} style={{ flexShrink:0, padding:"3px 10px", borderRadius:16, fontSize:11, fontWeight:800, background:"#1A1A28", color:mc(m), border:`1px solid ${mc(m)}22` }}>{m}×</div>)}
      </div>
      <div style={{ position:"relative", flexShrink:0, margin:"8px 8px 0", borderRadius:16, overflow:"hidden", border:"1px solid #ffffff0A" }}>
        <canvas ref={canvasRef} width={460} height={240} style={{ width:"100%", height:"auto", display:"block" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", pointerEvents:"none" }}>
          {phase === "waiting" && (
            <>
              <div style={{ color:"rgba(255,255,255,.5)", fontSize:13, marginBottom:4, fontWeight:600 }}>Starting in</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:68, fontWeight:900, color:"#FFD600", textShadow:"0 0 40px #FFD600", lineHeight:1 }}>{countdown}</div>
              {(betPlaced||betPlaced2) && <div style={{ color:"#22C55E", fontSize:13, marginTop:8, fontWeight:700 }}>✓ Bet placed — waiting for round</div>}
            </>
          )}
          {phase === "flying" && (
            <>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:58, fontWeight:900, color:multColor, textShadow:`0 0 50px ${multColor}`, lineHeight:1, animation:"multPulse 1s infinite" }}>{mult.toFixed(2)}×</div>
              {(cashedOut||cashedOut2) && <div style={{ color:"#22C55E", fontSize:13, marginTop:8, fontWeight:700, background:"rgba(0,0,0,.5)", padding:"4px 14px", borderRadius:20 }}>✓ Cashed {[cashedOut&&cashMult,cashedOut2&&cashMult2].filter(Boolean).join(", ")}×</div>}
            </>
          )}
          {phase === "crashed" && (
            <div style={{ animation:"crashShake .5s ease" }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:44, fontWeight:900, color:"#EF4444", textShadow:"0 0 40px #EF4444", lineHeight:1, textAlign:"center" }}>FLEW AWAY!</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:26, color:"#FF6666", textAlign:"center", marginTop:4 }}>{crashedMult}×</div>
            </div>
          )}
        </div>
        {phase === "flying" && (
          <div style={{ position:"absolute", bottom:10, right:12, background:"rgba(0,0,0,.7)", backdropFilter:"blur(6px)", borderRadius:20, padding:"4px 10px", display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#fff", border:"1px solid #ffffff10" }}>
            <span>👥</span>
            <span style={{ fontWeight:700, color:"#FFD600" }}>{Math.floor(mult*1234+3200).toLocaleString()}</span>
          </div>
        )}
      </div>
      <div style={{ padding:"8px 8px 6px", display:"flex", gap:8 }}>
        <BetPanel slot={1} amt={betAmt} setAmt={setBetAmt} placed={betPlaced} setPlaced={setBetPlaced} cashed={cashedOut} cashM={cashMult} autoCash={autoCash1} setAutoCash={setAutoCash1} tab={betTab1} setTab={setBetTab1} />
        <BetPanel slot={2} amt={betAmt2} setAmt={setBetAmt2} placed={betPlaced2} setPlaced={setBetPlaced2} cashed={cashedOut2} cashM={cashMult2} autoCash={autoCash2} setAutoCash={setAutoCash2} tab={betTab2} setTab={setBetTab2} />
      </div>
      <div style={{ margin:"0 8px 8px", background:"#111120", borderRadius:14, overflow:"hidden", border:"1px solid #ffffff08", flex:1 }}>
        <div style={{ display:"flex", borderBottom:"1px solid #ffffff0A" }}>
          {["allbets","mybets","top"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex:1, padding:"10px 0", border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:"transparent", color:activeTab===t?"#fff":"#444", borderBottom:activeTab===t?"2px solid #EF4444":"2px solid transparent", fontFamily:"'Poppins',sans-serif" }}>
              {t==="allbets"?"All Bets":t==="mybets"?"My Bets":"Top"}
            </button>
          ))}
        </div>
        <div style={{ padding:"8px 10px 4px", overflowY:"auto", maxHeight:200 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1.2fr .8fr 1.2fr", marginBottom:6, padding:"0 4px" }}>
            {["Player","Bet ৳","×","Won ৳"].map((h) => <span key={h} style={{ fontSize:10, color:"#444", fontWeight:600 }}>{h}</span>)}
          </div>
          {allBets.map((b,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1.6fr 1.2fr .8fr 1.2fr", padding:"6px 4px", borderTop:"1px solid #ffffff05", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:`hsl(${i*37+20},55%,30%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, flexShrink:0 }}>{"🎭🎨🎯🎮🎲🃏🎪🎸🦊🦁"[i%10]}</div>
                <span style={{ fontSize:11, color:"#777" }}>{b.name}</span>
              </div>
              <span style={{ fontSize:11, color:"#888" }}>{b.bet.toFixed(2)}</span>
              <span style={{ fontSize:11, fontWeight:800, color:b.flying?"#333":mc(b.x) }}>{b.flying?"—":b.x+"×"}</span>
              <span style={{ fontSize:11, color:b.flying?"#333":"#bbb" }}>{b.flying?"—":b.won}</span>
            </div>
          ))}
          <div style={{ textAlign:"center", padding:"8px 0 4px", fontSize:10, color:"#333" }}>🛡️ Provably Fair</div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "../../constants";
import planePng from "../../assets/plane.webp";

// ── Simple Audio (no loops, no intervals) ─────────────────────────────────────
const SFX = (() => {
  let ctx = null;
  const get = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} }
    if (ctx?.state === "suspended") ctx.resume();
    return ctx;
  };
  const tone = (freq, type, dur, vol, delay = 0) => {
    const c = get(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  };
  return {
    cashOut() {
      tone(523, "sine", 0.1, 0.2);
      tone(659, "sine", 0.1, 0.18, 0.08);
      tone(784, "sine", 0.15, 0.15, 0.16);
    },
    betPlace() { tone(440, "sine", 0.08, 0.12); },
    crash() {
      tone(200, "sawtooth", 0.3, 0.15);
      tone(100, "sine", 0.5, 0.1, 0.1);
    },
    go() {
      tone(523, "sine", 0.08, 0.15);
      tone(784, "sine", 0.1, 0.12, 0.1);
    },
    tick() { tone(330, "sine", 0.06, 0.07); },
  };
})();

function genBots() {
  const names = ["0***8","i***4","m***u","i***5","i***8","i***1","i***9","u***m","p***r","k***i","a***z","b***7","c***3","d***9","e***5","f***2"];
  return Array.from({ length: 14 }, (_, i) => {
    const bet = (Math.random() * 900 + 50).toFixed(2);
    const x = (Math.random() * 6 + 1.1).toFixed(2);
    return { name: names[i % 16], bet: parseFloat(bet), x: parseFloat(x), won: (parseFloat(bet) * parseFloat(x)).toFixed(2), flying: i >= 10 };
  });
}

export default function AviatorGame({ balance, setBalance, onBack }) {
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const startRef     = useRef(null);
  const crashRef     = useRef(null);
  const phaseRef     = useRef("waiting");
  const multRef      = useRef(1.0);
  const pointsRef    = useRef([]);
  const planeImgRef  = useRef(null);
  const particlesRef = useRef([]);

  const [phase, setPhase]             = useState("waiting");
  const [mult, setMult]               = useState(1.0);
  const [countdown, setCountdown]     = useState(5);
  const [betAmt, setBetAmt]           = useState(10);
  const [betAmt2, setBetAmt2]         = useState(10);
  const [betPlaced, setBetPlaced]     = useState(false);
  const [betPlaced2, setBetPlaced2]   = useState(false);
  const [cashedOut, setCashedOut]     = useState(false);
  const [cashedOut2, setCashedOut2]   = useState(false);
  const [cashMult, setCashMult]       = useState(null);
  const [cashMult2, setCashMult2]     = useState(null);
  const [autoCash1, setAutoCash1]     = useState(0);
  const [autoCash2, setAutoCash2]     = useState(0);
  const [history, setHistory]         = useState([1.28,77.76,1.76,17.13,7.33,11.42,1.05,3.24,2.14,1.42]);
  const [activeTab, setActiveTab]     = useState("allbets");
  const [betTab1, setBetTab1]         = useState("bet");
  const [betTab2, setBetTab2]         = useState("bet");
  const [allBets, setAllBets]         = useState(() => genBots());
  const [crashedMult, setCrashedMult] = useState(null);

  const betPlacedRef  = useRef(false);
  const betPlaced2Ref = useRef(false);
  const betAmtRef     = useRef(10);
  const betAmt2Ref    = useRef(10);
  const cashedOutRef  = useRef(false);
  const cashedOut2Ref = useRef(false);
  const autoCash1Ref  = useRef(0);
  const autoCash2Ref  = useRef(0);

  useEffect(() => { betPlacedRef.current = betPlaced; },   [betPlaced]);
  useEffect(() => { betPlaced2Ref.current = betPlaced2; }, [betPlaced2]);
  useEffect(() => { betAmtRef.current = betAmt; },         [betAmt]);
  useEffect(() => { betAmt2Ref.current = betAmt2; },       [betAmt2]);
  useEffect(() => { cashedOutRef.current = cashedOut; },   [cashedOut]);
  useEffect(() => { cashedOut2Ref.current = cashedOut2; }, [cashedOut2]);
  useEffect(() => { autoCash1Ref.current = autoCash1; },   [autoCash1]);
  useEffect(() => { autoCash2Ref.current = autoCash2; },   [autoCash2]);

  // Preload plane image once
  useEffect(() => {
    const img = new Image();
    img.src = planePng;
    img.onload = () => { planeImgRef.current = img; };
  }, []);

  const mc = (m) => m < 2 ? "#FFD600" : m < 5 ? "#4ADE80" : m < 10 ? "#38BDF8" : "#F472B6";

  // ── Canvas drawing ────────────────────────────────────────────────────────────
  const render = useCallback((pts, currentMult, ph) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0D0D1A";
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(0, H/5*i); ctx.lineTo(W, H/5*i); ctx.stroke();
    }
    for (let i = 1; i < 7; i++) {
      ctx.beginPath(); ctx.moveTo(W/7*i, 0); ctx.lineTo(W/7*i, H); ctx.stroke();
    }

    // Origin rays
    const ox = W * 0.06, oy = H * 0.95;
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI/2 + (i/17)*Math.PI*0.55;
      ctx.beginPath(); ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(a)*W*2, oy + Math.sin(a)*W*2);
      ctx.strokeStyle = `rgba(255,255,255,${i%2===0?0.014:0.007})`;
      ctx.stroke();
    }

    if (pts.length < 2) return;

    // Curve fill
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i].x + pts[i-1].x) / 2;
      const my = (pts[i].y + pts[i-1].y) / 2;
      ctx.quadraticCurveTo(pts[i-1].x, pts[i-1].y, mx, my);
    }
    ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
    ctx.lineTo(pts[pts.length-1].x, H);
    ctx.lineTo(pts[0].x, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(239,68,68,0.22)");
    grad.addColorStop(1, "rgba(239,68,68,0.0)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Curve stroke
    ctx.save();
    ctx.shadowColor = "#EF4444";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i].x + pts[i-1].x) / 2;
      const my = (pts[i].y + pts[i-1].y) / 2;
      ctx.quadraticCurveTo(pts[i-1].x, pts[i-1].y, mx, my);
    }
    ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
    ctx.strokeStyle = "#EF4444";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    if (ph === "crashed") return;

    const last = pts[pts.length-1];
    const prev = pts[pts.length-2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);

    // Particles
    const now = Date.now();
    if (Math.random() < 0.7) {
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: last.x - Math.cos(angle)*30 + (Math.random()-0.5)*6,
          y: last.y - Math.sin(angle)*30 + (Math.random()-0.5)*6,
          vx: -Math.cos(angle)*(1+Math.random()*3) + (Math.random()-0.5)*0.8,
          vy: -Math.sin(angle)*(1+Math.random()*3) + (Math.random()-0.5)*0.8,
          r: 1.5 + Math.random()*2.5,
          born: now,
          life: 400 + Math.random()*300,
          color: Math.random()<0.6 ? "#FF6600" : "#FFD600",
        });
      }
    }
    // Draw + age particles
    particlesRef.current = particlesRef.current.filter(p => {
      const age = now - p.born;
      if (age > p.life) return false;
      const alpha = 1 - age/p.life;
      p.x += p.vx; p.y += p.vy; p.vy += 0.15;
      ctx.save();
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      return true;
    });

    // Draw plane image
    const img = planeImgRef.current;
    if (img) {
      const pw = 90, ph2 = Math.round(pw * img.naturalHeight / img.naturalWidth);
      ctx.save();
      ctx.translate(last.x, last.y);
      ctx.rotate(angle);
      ctx.shadowColor = "#FF4400";
      ctx.shadowBlur = 28;
      ctx.drawImage(img, -pw*0.65, -ph2/2, pw, ph2);
      ctx.restore();
    }
  }, []);

  // ── Round ─────────────────────────────────────────────────────────────────────
  const startRound = useCallback(() => {
    const r = Math.random();
    let crash = r < 0.04 ? 1.0 : parseFloat(Math.max(1.01, (1/(1-Math.random()))*0.97).toFixed(2));
    crashRef.current = crash;
    phaseRef.current = "flying";
    multRef.current = 1.0;
    pointsRef.current = [];
    particlesRef.current = [];
    startRef.current = performance.now();

    if (betPlacedRef.current)  setBalance(b => b - betAmtRef.current);
    if (betPlaced2Ref.current) setBalance(b => b - betAmt2Ref.current);
    setPhase("flying");
    setMult(1.0);
    SFX.go();

    const canvas = canvasRef.current;
    const rect = canvas ? canvas.getBoundingClientRect() : { width:460, height:260 };
    const W = rect.width, H = rect.height;
    const PAD_L = W*0.07, PAD_B = H-22, PAD_T = 22, PAD_R = W-18;

    const tick = (now) => {
      if (phaseRef.current !== "flying") return;
      const elapsed = (now - startRef.current) / 1000;
      const m = Math.pow(Math.E, elapsed * 0.09);
      multRef.current = m;
      setMult(parseFloat(m.toFixed(2)));

      const maxM = Math.max(crashRef.current * 1.12, 4);
      const t = Math.min((m-1)/(maxM-1), 1);
      const cx = PAD_L + t*(PAD_R-PAD_L);
      const cy = PAD_B - Math.pow(t, 0.65)*(PAD_B-PAD_T);
      const pts = pointsRef.current;
      const last = pts[pts.length-1];
      if (!last || Math.hypot(cx-last.x, cy-last.y) > 2.5) {
        pointsRef.current = [...pts.slice(-200), {x:cx, y:cy}];
      }

      render(pointsRef.current, m, "flying");

      // Auto cashouts
      if (autoCash1Ref.current > 0 && betPlacedRef.current && !cashedOutRef.current && m >= autoCash1Ref.current) {
        setBalance(b => b + betAmtRef.current * m);
        setCashedOut(true); cashedOutRef.current = true;
        setCashMult(parseFloat(m.toFixed(2))); SFX.cashOut();
      }
      if (autoCash2Ref.current > 0 && betPlaced2Ref.current && !cashedOut2Ref.current && m >= autoCash2Ref.current) {
        setBalance(b => b + betAmt2Ref.current * m);
        setCashedOut2(true); cashedOut2Ref.current = true;
        setCashMult2(parseFloat(m.toFixed(2))); SFX.cashOut();
      }

      if (m >= crashRef.current) {
        phaseRef.current = "crashed";
        SFX.crash();
        setCrashedMult(crashRef.current);
        setPhase("crashed");
        setHistory(h => [crashRef.current, ...h].slice(0, 20));
        setAllBets(genBots());
        setBetPlaced(false); setBetPlaced2(false);
        setCashedOut(false); setCashedOut2(false);
        cashedOutRef.current = false; cashedOut2Ref.current = false;
        render(pointsRef.current, m, "crashed");
        setTimeout(() => {
          phaseRef.current = "waiting";
          setPhase("waiting");
          setCountdown(5);
          pointsRef.current = [];
          particlesRef.current = [];
        }, 3000);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [setBalance, render]);

  useEffect(() => {
    if (phase !== "waiting") return;
    if (countdown <= 0) { startRound(); return; }
    if (countdown < 5) SFX.tick();
    const t = setTimeout(() => setCountdown(c => c-1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, startRound]);

  // Draw idle state
  useEffect(() => {
    if (phase === "waiting") render([], 1, "waiting");
  }, [phase, countdown, render]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const cashOut = (slot) => {
    if (phaseRef.current !== "flying") return;
    const m = multRef.current;
    if (slot === 1 && betPlacedRef.current && !cashedOutRef.current) {
      setBalance(b => b + betAmtRef.current * m);
      setCashedOut(true); cashedOutRef.current = true;
      setCashMult(parseFloat(m.toFixed(2))); SFX.cashOut();
    }
    if (slot === 2 && betPlaced2Ref.current && !cashedOut2Ref.current) {
      setBalance(b => b + betAmt2Ref.current * m);
      setCashedOut2(true); cashedOut2Ref.current = true;
      setCashMult2(parseFloat(m.toFixed(2))); SFX.cashOut();
    }
  };

  const BetPanel = ({ slot, amt, setAmt, placed, setPlaced, cashed, cashM, autoCash, setAutoCash, tab, setTab }) => {
    const canBet  = !placed && phase === "waiting" && balance >= amt;
    const canCash = placed && !cashed && phase === "flying";
    const btnBg   = canBet ? "#22C55E" : canCash ? "#EF4444" : cashed ? "#1a2a1a" : "#2A2A3A";
    const btnText = canBet ? `BET\n৳${amt}` : canCash ? `CASH OUT\n৳${(amt*mult).toFixed(2)}` : cashed ? `✓ ${cashM?.toFixed(2)}×` : "Waiting...";
    const glow    = canBet ? "#22C55E44" : canCash ? "#EF444466" : "transparent";
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
              <button onClick={() => setAutoCash(v => Math.max(0, parseFloat((v-0.1).toFixed(2))))} disabled={placed} style={{ width:28,height:28,borderRadius:"50%",border:"none",background:"#2A2A3A",color:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>−</button>
              <span style={{ fontWeight:800, fontSize:15, color:"#FFD600", flex:1, textAlign:"center" }}>{autoCash > 0 ? autoCash.toFixed(2)+"×" : "Off"}</span>
              <button onClick={() => setAutoCash(v => parseFloat((Math.max(1.1,v)+0.1).toFixed(2)))} disabled={placed} style={{ width:28,height:28,borderRadius:"50%",border:"none",background:"#2A2A3A",color:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>+</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:10 }}>
              {[1.5,2,5,10].map(p => <button key={p} onClick={() => setAutoCash(p)} disabled={placed} style={{ padding:"5px 0",borderRadius:7,border:"none",cursor:"pointer",background:autoCash===p?"#FFD60033":"#2A2A3A",color:autoCash===p?"#FFD600":"#888",fontSize:11,fontWeight:600,fontFamily:"'Poppins',sans-serif" }}>{p}×</button>)}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <button onClick={() => setAmt(a => Math.max(1,a-1))} disabled={placed} style={{ width:28,height:28,borderRadius:"50%",border:"none",background:"#2A2A3A",color:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>−</button>
              <span style={{ fontWeight:800, fontSize:15, color:"#fff", flex:1, textAlign:"center" }}>{amt.toFixed(2)}</span>
              <button onClick={() => setAmt(a => a+1)} disabled={placed} style={{ width:28,height:28,borderRadius:"50%",border:"none",background:"#2A2A3A",color:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>+</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:10 }}>
              {[1,2,5,10].map(p => <button key={p} onClick={() => setAmt(p)} disabled={placed} style={{ padding:"5px 0",borderRadius:7,border:"none",cursor:"pointer",background:"#2A2A3A",color:"#888",fontSize:11,fontWeight:600,fontFamily:"'Poppins',sans-serif" }}>{p}</button>)}
            </div>
          </div>
        )}
        <button onClick={() => { if (canBet) { setPlaced(true); SFX.betPlace(); } else if (canCash) cashOut(slot); }}
          style={{ width:"100%", height:58, borderRadius:12, border:"none", cursor:canBet||canCash?"pointer":"default", background:btnBg, color:"#fff", fontWeight:800, fontSize:12, lineHeight:1.5, whiteSpace:"pre-line", boxShadow:`0 4px 24px ${glow}`, fontFamily:"'Poppins',sans-serif" }}>
          {btnText}
        </button>
      </div>
    );
  };

  const multColor = mult < 2 ? "#fff" : mult < 5 ? "#4ADE80" : mult < 10 ? "#38BDF8" : "#F472B6";

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#0D0D1A", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{CSS}{`
        @keyframes multPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes crashShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
      `}</style>

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
        <canvas ref={canvasRef} style={{ width:"100%", height:260, display:"block" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", pointerEvents:"none" }}>
          {phase === "waiting" && (
            <>
              <div style={{ color:"rgba(255,255,255,.45)", fontSize:12, marginBottom:4, fontWeight:600, letterSpacing:1 }}>STARTING IN</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:72, fontWeight:900, color:"#FFD600", textShadow:"0 0 50px #FFD600aa", lineHeight:1 }}>{countdown}</div>
              {(betPlaced||betPlaced2) && <div style={{ color:"#22C55E", fontSize:12, marginTop:10, fontWeight:700 }}>✓ Bet placed — waiting for round</div>}
            </>
          )}
          {phase === "flying" && (
            <>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:62, fontWeight:900, color:multColor, textShadow:`0 0 60px ${multColor}`, lineHeight:1, animation:"multPulse 0.9s infinite" }}>{mult.toFixed(2)}×</div>
              {(cashedOut||cashedOut2) && <div style={{ color:"#22C55E", fontSize:12, marginTop:8, fontWeight:700, background:"rgba(0,0,0,.6)", padding:"4px 14px", borderRadius:20 }}>✓ Cashed {[cashedOut&&cashMult,cashedOut2&&cashMult2].filter(Boolean).join(", ")}×</div>}
            </>
          )}
          {phase === "crashed" && (
            <div style={{ animation:"crashShake 0.5s ease", textAlign:"center" }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:42, fontWeight:900, color:"#EF4444", textShadow:"0 0 50px #EF4444", lineHeight:1 }}>FLEW AWAY!</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:28, color:"#FF8888", marginTop:6 }}>{crashedMult}×</div>
            </div>
          )}
        </div>
        {phase === "flying" && (
          <div style={{ position:"absolute", bottom:10, right:12, background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)", borderRadius:20, padding:"4px 12px", display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#fff", border:"1px solid #ffffff12" }}>
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
          {["allbets","mybets","top"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex:1, padding:"10px 0", border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:"transparent", color:activeTab===t?"#fff":"#444", borderBottom:activeTab===t?"2px solid #EF4444":"2px solid transparent", fontFamily:"'Poppins',sans-serif" }}>
              {t==="allbets"?"All Bets":t==="mybets"?"My Bets":"Top"}
            </button>
          ))}
        </div>
        <div style={{ padding:"8px 10px 4px", overflowY:"auto", maxHeight:200 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1.2fr .8fr 1.2fr", marginBottom:6, padding:"0 4px" }}>
            {["Player","Bet ৳","×","Won ৳"].map(h => <span key={h} style={{ fontSize:10, color:"#444", fontWeight:600 }}>{h}</span>)}
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
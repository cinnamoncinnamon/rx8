import React, { useState, useEffect, useRef, useCallback } from "react";

function mkAudio() {
  let ctx = null;
  const ac = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
  const tone = (freq, type, dur, vol = 0.18, delay = 0, freqEnd) => {
    try {
      const c = ac(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + delay);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + delay + dur);
      g.gain.setValueAtTime(vol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      o.start(c.currentTime + delay); o.stop(c.currentTime + delay + dur + 0.01);
    } catch (e) {}
  };
  const noise = (dur, vol = 0.3, delay = 0) => {
    try {
      const c = ac(), buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(), g = c.createGain();
      src.buffer = buf; src.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(vol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      src.start(c.currentTime + delay); src.stop(c.currentTime + delay + dur + 0.01);
    } catch (e) {}
  };
  return {
    engine: () => { tone(80,'sawtooth',0.12,0.12); tone(160,'sawtooth',0.12,0.06,0.03); },
    rev: (speed) => { const f = 60 + speed * 120; tone(f,'sawtooth',0.08,0.1,0,f*1.4); },
    cashout: () => { tone(523,'sine',0.15,0.3); tone(659,'sine',0.15,0.28,0.08); tone(784,'sine',0.2,0.32,0.16); tone(1047,'sine',0.25,0.28,0.26); },
    crash: () => { noise(0.6,0.5); tone(120,'sawtooth',0.5,0.3,0,30); tone(200,'square',0.3,0.2,0.05,40); },
    bet: () => { tone(400,'sine',0.08,0.2); tone(600,'sine',0.06,0.15,0.06); },
    waiting: () => tone(300,'sine',0.1,0.08),
  };
}
const SFX = mkAudio();

function genCrash() {
  const r = Math.random();
  if (r < 0.01) return 1.00 + Math.random() * 0.02;
  if (r < 0.4) return 1.0 + Math.pow(Math.random(), 0.6) * 1.5;
  if (r < 0.7) return 2.5 + Math.pow(Math.random(), 0.7) * 5;
  if (r < 0.88) return 7 + Math.random() * 20;
  if (r < 0.96) return 27 + Math.random() * 73;
  return 100 + Math.random() * 400;
}

const HistPill = ({ val }) => {
  const col = val < 2 ? '#f44336' : val < 5 ? '#ff9800' : val < 10 ? '#4caf50' : val < 50 ? '#2196f3' : '#9c27b0';
  return <div style={{ padding:'3px 9px', borderRadius:'100px', fontSize:'11px', fontWeight:'700', background:col+'22', border:`1px solid ${col}66`, color:col, fontFamily:'monospace', whiteSpace:'nowrap', flexShrink:0 }}>{val.toFixed(2)}×</div>;
};

const Moto = ({ crashed, wheelSpin = 0 }) => (
  <svg width={96} height={58} viewBox="0 0 96 58" style={{ overflow:'visible' }}>
    <defs>
      <radialGradient id="wg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#444"/><stop offset="100%" stopColor="#111"/></radialGradient>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ff3d00"/><stop offset="100%" stopColor="#b71c1c"/></linearGradient>
      <linearGradient id="fg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#e0e0e0"/><stop offset="100%" stopColor="#757575"/></linearGradient>
    </defs>
    <g transform={crashed ? 'rotate(-30,48,38) translate(0,8)' : ''} style={{ transition:'transform 0.3s' }}>
      <circle cx="18" cy="40" r="13" fill="url(#wg2)" stroke="#222" strokeWidth="2.5"/>
      <g transform={`rotate(${wheelSpin}, 18, 40)`}>
        <line x1="18" y1="27" x2="18" y2="53" stroke="#333" strokeWidth="1.5"/>
        <line x1="5" y1="40" x2="31" y2="40" stroke="#333" strokeWidth="1.5"/>
      </g>
      <circle cx="18" cy="40" r="5" fill="#1a1a1a" stroke="#555" strokeWidth="1.5"/>
      <circle cx="76" cy="40" r="12" fill="url(#wg2)" stroke="#222" strokeWidth="2.5"/>
      <g transform={`rotate(${wheelSpin}, 76, 40)`}>
        <line x1="76" y1="28" x2="76" y2="52" stroke="#333" strokeWidth="1.5"/>
        <line x1="64" y1="40" x2="88" y2="40" stroke="#333" strokeWidth="1.5"/>
      </g>
      <circle cx="76" cy="40" r="4.5" fill="#1a1a1a" stroke="#555" strokeWidth="1.5"/>
      <polygon points="30,27 57,21 64,31 40,35" fill="url(#bg2)"/>
      <ellipse cx="46" cy="21" rx="15" ry="7.5" fill="url(#bg2)"/>
      <line x1="57" y1="21" x2="76" y2="40" stroke="url(#fg2)" strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx="80" cy="31" rx="5" ry="4" fill="#fffde7" stroke="#fdd835" strokeWidth="1"/>
      <ellipse cx="49" cy="13" rx="5.5" ry="5.5" fill="#111"/>
      {!crashed && <><circle cx="18" cy="47" r="3.5" fill="#888" opacity="0.28"/><circle cx="13" cy="46" r="2.5" fill="#888" opacity="0.17"/></>}
    </g>
    {crashed && [[-6,4],[6,-9],[-10,-4],[9,3],[0,-12]].map(([dx,dy],i)=>(
      <circle key={i} cx={48+dx} cy={36+dy} r={2+(i%3)} fill={['#ff6d00','#ffd600','#ff3d00','#fff','#ff1744'][i]} opacity={0.9}/>
    ))}
  </svg>
);

const PHASES = { WAITING:'waiting', RUNNING:'running', CRASHED:'crashed' };
const SCENE_W = 560, SCENE_H = 260, GROUND_Y = SCENE_H - 48, BIKE_X = 110;

export default function MotorideGame({ balance, setBalance, onBack }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const crashPointRef = useRef(1.5);
  const engineIntervalRef = useRef(null);
  const scrollXRef = useRef(0);
  const linePointsRef = useRef([]);
  const wheelSpinRef = useRef(0);
  const multRef = useRef(1.0);
  const phaseRef = useRef(PHASES.WAITING);
  const hasBetRef = useRef(false);
  const cashedOutRef = useRef(false);
  const autoCashoutRef = useRef('');
  const treesRef = useRef([]);
  const cloudRef = useRef([]);
  const [wheelSpinState, setWheelSpinState] = useState(0);

  const [phase, setPhase] = useState(PHASES.WAITING);
  const [mult, setMult] = useState(1.00);
  const [betAmt, setBetAmt] = useState(10);
  const [autoCashout, setAutoCashout] = useState('');
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashedMult, setCashedMult] = useState(null);
  const [history, setHistory] = useState([8.42,1.23,34.1,2.05,1.01,15.6,3.3,7.7,1.88,102.4]);
  const [shake, setShake] = useState(false);
  const [waitTimer, setWaitTimer] = useState(5);
  const [particles, setParticles] = useState([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { multRef.current = mult; }, [mult]);
  useEffect(() => { hasBetRef.current = hasBet; }, [hasBet]);
  useEffect(() => { cashedOutRef.current = cashedOut; }, [cashedOut]);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);

  useEffect(() => {
    treesRef.current = Array.from({ length: 30 }, (_, i) => ({
      worldX: 80 + i * 70 + (i * 37.3 % 30 - 15),
      h: 0.65 + (i * 13.7 % 55) / 100,
      variant: i % 3,
      layer: i % 3 === 0 ? 'far' : 'mid',
    }));
    cloudRef.current = Array.from({ length: 8 }, (_, i) => ({
      worldX: i * 200 + (i * 47 % 100),
      y: 20 + (i * 31 % 55),
      w: 70 + (i * 23 % 80),
      speed: 0.15 + (i * 7 % 10) / 100,
    }));
  }, []);

  function drawTree(ctx, h, variant) {
    if (variant % 3 === 0) {
      ctx.fillStyle='#5d4037'; ctx.fillRect(-4,-20,8,20);
      ctx.fillStyle='#1b5e20'; ctx.beginPath(); ctx.moveTo(0,-60*h); ctx.lineTo(-22,-10*h); ctx.lineTo(22,-10*h); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#2e7d32'; ctx.beginPath(); ctx.moveTo(0,-47*h); ctx.lineTo(-18,-5*h); ctx.lineTo(18,-5*h); ctx.closePath(); ctx.fill();
    } else if (variant % 3 === 1) {
      ctx.fillStyle='#6d4c41'; ctx.fillRect(-5,-5,10,28);
      ctx.fillStyle='#1b5e20'; ctx.beginPath(); ctx.arc(0,-40*h,22*h,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#2e7d32'; ctx.beginPath(); ctx.arc(-8*h,-48*h,14*h,0,Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle='#795548'; ctx.fillRect(-3,-25,6,25);
      ctx.fillStyle='#1a6b1a'; ctx.beginPath(); ctx.ellipse(0,-50*h,10*h,30*h,0,0,Math.PI*2); ctx.fill();
    }
  }

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,SCENE_W,SCENE_H);
    const scroll = scrollXRef.current;
    const crashed = phaseRef.current === PHASES.CRASHED;
    const sky = ctx.createLinearGradient(0,0,0,SCENE_H);
    sky.addColorStop(0,'#060c1e'); sky.addColorStop(0.6,'#0d1a38'); sky.addColorStop(1,'#182040');
    ctx.fillStyle=sky; ctx.fillRect(0,0,SCENE_W,SCENE_H);
    ctx.fillStyle='rgba(255,255,255,0.7)';
    for (let i=0;i<55;i++) {
      const sx=((i*173.3+scroll*0.02)%SCENE_W), sy=(i*57.7)%(SCENE_H*0.52);
      ctx.beginPath(); ctx.arc(sx,sy,i%3===0?1.2:0.7,0,Math.PI*2); ctx.fill();
    }
    cloudRef.current.forEach(cl=>{
      const cx=((cl.worldX-scroll*cl.speed)%(SCENE_W+200)+SCENE_W+200)%(SCENE_W+200)-100;
      ctx.fillStyle='rgba(180,200,255,0.07)';
      ctx.beginPath(); ctx.ellipse(cx,cl.y,cl.w,18,0,0,Math.PI*2); ctx.fill();
    });
    treesRef.current.filter(t=>t.layer==='far').forEach(tree=>{
      const px=tree.worldX-scroll*0.55;
      const screenX=((px%(SCENE_W+300)+SCENE_W+300)%(SCENE_W+300))-100;
      ctx.save(); ctx.translate(screenX,GROUND_Y-10); ctx.scale(0.65,0.65); ctx.globalAlpha=0.55;
      drawTree(ctx,tree.h,tree.variant); ctx.restore();
    });
    const roadGrad=ctx.createLinearGradient(0,GROUND_Y,0,SCENE_H);
    roadGrad.addColorStop(0,'#161822'); roadGrad.addColorStop(1,'#0e0f16');
    ctx.fillStyle=roadGrad; ctx.fillRect(0,GROUND_Y,SCENE_W,SCENE_H-GROUND_Y);
    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,GROUND_Y); ctx.lineTo(SCENE_W,GROUND_Y); ctx.stroke();
    ctx.setLineDash([24,20]); ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=3;
    ctx.lineDashOffset=-(scroll%44);
    ctx.beginPath(); ctx.moveTo(0,GROUND_Y+10); ctx.lineTo(SCENE_W,GROUND_Y+10); ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset=0;
    treesRef.current.filter(t=>t.layer==='mid').forEach(tree=>{
      const px=tree.worldX-scroll*0.85;
      const screenX=((px%(SCENE_W+300)+SCENE_W+300)%(SCENE_W+300))-60;
      ctx.save(); ctx.translate(screenX,GROUND_Y); drawTree(ctx,tree.h,tree.variant); ctx.restore();
    });
    const pts=linePointsRef.current;
    if (pts.length>=2) {
      const screenPts=pts.map(p=>({ x:p.worldX-scroll+BIKE_X, y:p.y })).filter(p=>p.x>=0&&p.x<=SCENE_W+20);
      if (screenPts.length>=2) {
        const lineColor=crashed?'#f44336':'#00e676';
        ctx.beginPath(); ctx.moveTo(screenPts[0].x,GROUND_Y);
        screenPts.forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.lineTo(screenPts[screenPts.length-1].x,GROUND_Y); ctx.closePath();
        const fg=ctx.createLinearGradient(0,GROUND_Y-80,0,GROUND_Y);
        fg.addColorStop(0,crashed?'rgba(244,67,54,0.18)':'rgba(0,230,118,0.13)'); fg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=fg; ctx.fill();
        ctx.beginPath(); ctx.moveTo(screenPts[0].x,screenPts[0].y);
        for (let i=1;i<screenPts.length;i++) {
          const prev=screenPts[i-1],curr=screenPts[i],cpx=(prev.x+curr.x)/2;
          ctx.bezierCurveTo(cpx,prev.y,cpx,curr.y,curr.x,curr.y);
        }
        ctx.strokeStyle=lineColor; ctx.lineWidth=2.5; ctx.shadowColor=lineColor; ctx.shadowBlur=10; ctx.stroke(); ctx.shadowBlur=0;
      }
    }
    if (phaseRef.current===PHASES.RUNNING||phaseRef.current===PHASES.CRASHED) {
      const m=multRef.current;
      const col=crashed?'#f44336':m>=10?'#9c27b0':m>=5?'#2196f3':m>=2?'#00e676':'#fff';
      ctx.font="bold 28px 'Arial Black',sans-serif"; ctx.textAlign='center';
      ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=16;
      ctx.fillText(m.toFixed(2)+'×',BIKE_X+48,GROUND_Y-70); ctx.shadowBlur=0;
      if (crashed) { ctx.font="bold 13px 'Arial Black',sans-serif"; ctx.fillStyle='#f44336'; ctx.fillText('CRASHED!',BIKE_X+48,GROUND_Y-92); }
    }
  }, []);

  const doCashout = (m) => {
    if (!hasBetRef.current||cashedOutRef.current) return;
    cashedOutRef.current=true; setCashedOut(true);
    setCashedMult(m); setBalance(b=>+(b+betAmt*m).toFixed(2)); SFX.cashout();
  };

  const startRound = useCallback(() => {
    crashPointRef.current=genCrash(); linePointsRef.current=[]; scrollXRef.current=0;
    startTimeRef.current=performance.now(); setMult(1.00); multRef.current=1.00;
    setPhase(PHASES.RUNNING); phaseRef.current=PHASES.RUNNING;
    clearInterval(engineIntervalRef.current);
    engineIntervalRef.current=setInterval(()=>SFX.engine(),180);
    const loop=(now)=>{
      if (phaseRef.current!==PHASES.RUNNING) return;
      const elapsed=(now-startTimeRef.current)/1000;
      const m=Math.pow(Math.E,elapsed*0.18);
      multRef.current=m; setMult(m);
      const speed=2.2+(m-1)*0.7;
      scrollXRef.current+=speed; wheelSpinRef.current+=speed*3.5;
      setWheelSpinState(wheelSpinRef.current);
      const lineMaxRise=GROUND_Y-30;
      const rise=Math.min(Math.log(m)/Math.log(crashPointRef.current+0.001)*lineMaxRise*0.88,lineMaxRise);
      linePointsRef.current.push({ worldX:scrollXRef.current, y:GROUND_Y-rise });
      if (linePointsRef.current.length>500) linePointsRef.current.shift();
      drawScene();
      if (Math.random()<0.04) SFX.rev(Math.min(elapsed/30,1));
      const ac=parseFloat(autoCashoutRef.current);
      if (!isNaN(ac)&&ac>=1.01&&m>=ac&&hasBetRef.current&&!cashedOutRef.current) doCashout(m);
      if (m>=crashPointRef.current) {
        clearInterval(engineIntervalRef.current); SFX.crash();
        setPhase(PHASES.CRASHED); phaseRef.current=PHASES.CRASHED;
        setShake(true); setTimeout(()=>setShake(false),600);
        setParticles(Array.from({length:35},(_,i)=>({ id:i+Date.now(), x:BIKE_X+48, y:GROUND_Y-26, vx:(Math.random()-0.4)*16, vy:(Math.random()-1.4)*10, life:1, size:Math.random()*9+3, color:['#ff3d00','#ffd600','#ff6d00','#fff','#ff1744'][Math.floor(Math.random()*5)] })));
        drawScene();
        setHistory(h=>[m,...h].slice(0,20));
        setTimeout(()=>{ setHasBet(false); setCashedOut(false); setCashedMult(null); setPhase(PHASES.WAITING); phaseRef.current=PHASES.WAITING; setMult(1.00); multRef.current=1.00; linePointsRef.current=[]; drawScene(); },4000);
        return;
      }
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
  },[drawScene]);

  useEffect(()=>{
    if (phase!==PHASES.WAITING) return;
    drawScene(); setWaitTimer(5);
    const iv=setInterval(()=>setWaitTimer(t=>{ if(t<=1){clearInterval(iv);return 0;} SFX.waiting(); return t-1; }),1000);
    const t=setTimeout(startRound,5000);
    return ()=>{ clearInterval(iv); clearTimeout(t); };
  },[phase,startRound,drawScene]);

  useEffect(()=>()=>{ cancelAnimationFrame(rafRef.current); clearInterval(engineIntervalRef.current); },[]);

  useEffect(()=>{
    if (!particles.length) return;
    const raf=requestAnimationFrame(()=>setParticles(p=>p.map(pt=>({...pt,x:pt.x+pt.vx,y:pt.y+pt.vy,vy:pt.vy+0.55,life:pt.life-0.032})).filter(pt=>pt.life>0)));
    return ()=>cancelAnimationFrame(raf);
  },[particles]);

  const cashout=()=>{ if(phase!==PHASES.RUNNING||!hasBet||cashedOut) return; doCashout(multRef.current); };
  const placeBet=()=>{
    if((phase!==PHASES.WAITING&&phase!==PHASES.RUNNING)||balance<betAmt||hasBet) return;
    SFX.bet(); setBalance(b=>+(b-betAmt).toFixed(2)); setHasBet(true); hasBetRef.current=true;
  };

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 50% 0%, #0d1f3c 0%, #050a14 60%)', fontFamily:"'Arial Black',sans-serif", color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 8px 24px', overflow:'hidden', position:'relative' }}>
      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-6px)}60%{transform:translateX(6px)}}
        @keyframes crashFlash{0%{opacity:0}20%{opacity:0.4}100%{opacity:0}}
        @keyframes popIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes floatUp{0%{transform:translateY(0) translateX(-50%);opacity:1}100%{transform:translateY(-50px) translateX(-50%);opacity:0}}
        .shake{animation:shake 0.55s ease} .pop{animation:popIn 0.3s ease forwards}
      `}</style>

      {phase===PHASES.CRASHED&&<div style={{ position:'fixed',inset:0,background:'rgba(244,67,54,0.22)',animation:'crashFlash 1.5s ease forwards',pointerEvents:'none',zIndex:100 }}/>}

      <div style={{ position:'relative',zIndex:1,width:'100%',maxWidth:`${SCENE_W}px`,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',fontSize:20,cursor:'pointer',borderRadius:8,padding:'6px 12px' }}>‹ Back</button>
        <div style={{ fontSize:'clamp(20px,5vw,32px)',fontFamily:"'Arial Black',sans-serif",letterSpacing:'4px',color:'#fff',textShadow:'0 0 20px rgba(255,61,0,0.6)' }}>🏍️ MOTO CRASH</div>
        <div style={{ background:'rgba(255,214,0,0.15)',borderRadius:16,padding:'4px 12px',color:'#ffd600',fontWeight:700,fontSize:13 }}>৳{balance.toFixed(2)}</div>
      </div>

      <div style={{ display:'flex',gap:'5px',overflowX:'auto',width:'100%',maxWidth:`${SCENE_W}px`,marginBottom:'8px',paddingBottom:'2px',position:'relative',zIndex:1 }}>
        {history.slice(0,12).map((v,i)=><HistPill key={i} val={v}/>)}
      </div>

      <div className={shake?'shake':''} style={{ position:'relative',zIndex:1,background:'#040c1a',borderRadius:'16px',border:`2px solid ${phase===PHASES.CRASHED?'rgba(244,67,54,0.5)':'rgba(255,255,255,0.08)'}`,overflow:'hidden',width:'100%',maxWidth:`${SCENE_W}px` }}>
        <canvas ref={canvasRef} width={SCENE_W} height={SCENE_H} style={{ display:'block',width:'100%' }}/>
        {phase!==PHASES.WAITING&&(
          <div style={{ position:'absolute',left:BIKE_X-2,top:GROUND_Y-52,zIndex:4,filter:phase===PHASES.CRASHED?'drop-shadow(0 0 14px #f44336)':'drop-shadow(0 0 8px rgba(255,100,0,0.7))',transform:phase===PHASES.CRASHED?'rotate(-32deg) translate(4px,8px)':'none',transition:'transform 0.35s ease' }}>
            <Moto crashed={phase===PHASES.CRASHED} wheelSpin={wheelSpinState}/>
          </div>
        )}
        {phase===PHASES.WAITING&&(
          <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:6,background:'rgba(4,10,24,0.55)' }}>
            <div style={{ animation:'pulse 1s ease infinite',textAlign:'center' }}>
              <div style={{ fontSize:'13px',letterSpacing:'4px',color:'rgba(255,255,255,0.4)',marginBottom:'4px' }}>STARTING IN</div>
              <div style={{ fontSize:'58px',color:'#fff',lineHeight:1 }}>{waitTimer}</div>
              <div style={{ fontSize:'12px',letterSpacing:'3px',color:'rgba(255,255,255,0.3)' }}>PLACE YOUR BET</div>
            </div>
          </div>
        )}
        {cashedOut&&cashedMult&&phase!==PHASES.CRASHED&&(
          <div className="pop" style={{ position:'absolute',top:'12px',right:'14px',zIndex:7,fontSize:'13px',color:'#00e676',letterSpacing:'2px',background:'rgba(0,230,118,0.12)',borderRadius:'8px',padding:'4px 12px',border:'1px solid rgba(0,230,118,0.3)' }}>
            ✓ CASHED OUT @ {cashedMult.toFixed(2)}×
          </div>
        )}
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:5 }}>
          {particles.map(p=>(
            <div key={p.id} style={{ position:'absolute',left:p.x,top:p.y,width:p.size,height:p.size,borderRadius:'50%',background:p.color,opacity:p.life,transform:`scale(${p.life})` }}/>
          ))}
        </div>
      </div>

      {cashedOut&&cashedMult&&(
        <div key={cashedMult} style={{ position:'fixed',top:'38%',left:'50%',fontSize:'30px',color:'#00e676',textShadow:'0 0 20px rgba(0,230,118,0.8)',animation:'floatUp 2s ease forwards',pointerEvents:'none',zIndex:999,letterSpacing:'2px' }}>
          +৳{(betAmt*cashedMult).toFixed(2)}
        </div>
      )}

      <div style={{ width:'100%',maxWidth:`${SCENE_W}px`,marginTop:'10px',background:'rgba(255,255,255,0.04)',borderRadius:'16px',padding:'14px',border:'1px solid rgba(255,255,255,0.08)',position:'relative',zIndex:1 }}>
        <div style={{ marginBottom:'10px' }}>
          <div style={{ fontSize:'10px',letterSpacing:'3px',color:'rgba(255,255,255,0.35)',marginBottom:'6px' }}>BET AMOUNT</div>
          <div style={{ display:'flex',gap:'6px',alignItems:'center',flexWrap:'wrap' }}>
            <div style={{ display:'flex',background:'rgba(0,0,0,0.4)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',overflow:'hidden',flex:1 }}>
              <button onClick={()=>!hasBet&&setBetAmt(b=>Math.max(1,+(b-1).toFixed(0)))} style={{ padding:'10px 14px',background:'transparent',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer' }}>−</button>
              <input value={betAmt} onChange={e=>!hasBet&&setBetAmt(+e.target.value||1)} style={{ flex:1,background:'transparent',border:'none',color:'#fff',textAlign:'center',fontSize:'16px',fontWeight:'700',outline:'none',minWidth:0 }}/>
              <button onClick={()=>!hasBet&&setBetAmt(b=>+(b+1).toFixed(0))} style={{ padding:'10px 14px',background:'transparent',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer' }}>+</button>
            </div>
            {[5,10,25,50].map(v=>(
              <button key={v} onClick={()=>!hasBet&&setBetAmt(v)} style={{ padding:'10px 12px',borderRadius:'10px',border:`1px solid ${betAmt===v?'rgba(255,214,0,0.6)':'rgba(255,255,255,0.1)'}`,background:betAmt===v?'rgba(255,214,0,0.12)':'rgba(0,0,0,0.3)',color:betAmt===v?'#ffd600':'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:'700',cursor:'pointer' }}>৳{v}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:'12px' }}>
          <div style={{ fontSize:'10px',letterSpacing:'3px',color:'rgba(255,255,255,0.35)',marginBottom:'6px' }}>AUTO CASH OUT AT</div>
          <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
            <div style={{ flex:1,display:'flex',background:'rgba(0,0,0,0.4)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',overflow:'hidden' }}>
              <input placeholder="e.g. 2.00" value={autoCashout} onChange={e=>setAutoCashout(e.target.value)} style={{ flex:1,background:'transparent',border:'none',color:'#fff',padding:'10px 14px',fontSize:'14px',outline:'none' }}/>
              <span style={{ padding:'10px 12px',color:'rgba(255,255,255,0.3)',fontSize:'14px' }}>×</span>
            </div>
            {autoCashout&&<button onClick={()=>setAutoCashout('')} style={{ padding:'10px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.4)',cursor:'pointer' }}>✕</button>}
          </div>
        </div>

        {!hasBet?(
          <button onClick={placeBet} disabled={phase===PHASES.CRASHED} style={{ width:'100%',padding:'16px',borderRadius:'12px',border:'2px solid rgba(0,230,118,0.4)',background:'linear-gradient(135deg,#00c853,#00695c)',color:'#fff',fontSize:'18px',fontWeight:'700',letterSpacing:'3px',cursor:phase===PHASES.CRASHED?'not-allowed':'pointer',opacity:phase===PHASES.CRASHED?0.4:1,boxShadow:'0 4px 20px rgba(0,200,83,0.35)' }}>
            {phase===PHASES.WAITING?`🏍️ PLACE BET (${waitTimer}s)`:phase===PHASES.RUNNING?'🎰 BET NEXT ROUND':'🏍️ PLACE BET'}
          </button>
        ):cashedOut?(
          <div style={{ width:'100%',padding:'16px',borderRadius:'12px',background:'rgba(0,230,118,0.1)',border:'2px solid rgba(0,230,118,0.4)',color:'#00e676',fontSize:'18px',letterSpacing:'3px',textAlign:'center' }}>
            ✓ CASHED OUT @ {cashedMult?.toFixed(2)}×
          </div>
        ):(
          <button onClick={cashout} disabled={phase!==PHASES.RUNNING} style={{ width:'100%',padding:'16px',borderRadius:'12px',border:'2px solid rgba(255,61,0,0.6)',background:'linear-gradient(135deg,#ff3d00,#b71c1c)',color:'#fff',fontSize:'18px',fontWeight:'700',letterSpacing:'3px',cursor:phase!==PHASES.RUNNING?'not-allowed':'pointer',boxShadow:'0 4px 25px rgba(255,61,0,0.4)',animation:phase===PHASES.RUNNING?'pulse 1.2s ease infinite':'none' }}>
            💨 CASH OUT — ৳{(betAmt*mult).toFixed(2)}
          </button>
        )}
      </div>
    </div>
  );
}
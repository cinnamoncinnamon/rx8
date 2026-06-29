import React, { useState, useEffect, useRef } from "react";
import { motorideCrashPoint } from "../../utils/gameEngine";
import bikerImg from "./motoassets/biker.png";
import bg1 from "./motoassets/bg1.jpg";
import bg2 from "./motoassets/bg2.jpg";
import bg3 from "./motoassets/bg3.jpg";
import bg4 from "./motoassets/bg4.jpg";
import bg6 from "./motoassets/bg6.jpg";

const BG_IMAGES = [bg1, bg2, bg3, bg4, bg6];

// ── Audio ─────────────────────────────────────────────────────────────────
function mkAudio() {
  let ctx = null;
  const ac = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
  const tone = (freq, type, dur, vol = 0.18, delay = 0, freqEnd) => {
    if (GAME.muted) return;
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
    if (GAME.muted) return;
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

  // expose ctx so we can suspend/resume it
  const getSfx = () => ({
    engine:  () => { tone(80,'sawtooth',0.12,0.12); tone(160,'sawtooth',0.12,0.06,0.03); },
    rev:     (s) => { const f = 60 + s * 120; tone(f,'sawtooth',0.08,0.1,0,f*1.4); },
    cashout: () => { tone(523,'sine',0.15,0.3); tone(659,'sine',0.15,0.28,0.08); tone(784,'sine',0.2,0.32,0.16); tone(1047,'sine',0.25,0.28,0.26); },
    crash:   () => { noise(0.6,0.5); tone(120,'sawtooth',0.5,0.3,0,30); tone(200,'square',0.3,0.2,0.05,40); },
    bet:     () => { tone(400,'sine',0.08,0.2); tone(600,'sine',0.06,0.15,0.06); },
    waiting: () => tone(300,'sine',0.1,0.08),
    // suspend stops all currently-scheduled audio immediately
    suspend: () => { try { if (ctx) ctx.suspend(); } catch(e) {} },
    resume:  () => { try { if (ctx) ctx.resume(); } catch(e) {} },
  });
  return getSfx();
}

// ── Singleton game state ───────────────────────────────────────────────────
const GAME = {
  phase: 'waiting',
  mult: 1.0,
  waitTimer: 5,
  crashPoint: 2,
  startTime: null,
  bgIndex: 0,
  bgScroll: 0,
  hasBet: false,
  cashedOut: false,
  cashedMult: null,
  betQueued: false,
  history: [8.42,1.23,34.1,2.05,1.01,15.6,3.3,7.7,1.88,102.4],
  betAmt: 10,
  autoCashout: '',
  balance: 1000,
  particles: [],
  muted: false,

  onUpdate: null,
  onBalance: null,

  _raf: null,
  _engineIv: null,
  _waitIv: null,
  _waitT: null,
  _canvas: null,
  _bgImages: [],
  _bikerImg: null,
  _started: false,   // market loop is running
};

// must be after GAME is declared so tone/noise can read GAME.muted
const SFX = mkAudio();

// Preload assets once
BG_IMAGES.forEach((src, i) => {
  const img = new Image(); img.src = src;
  GAME._bgImages[i] = img;
});
const _bi = new Image(); _bi.src = bikerImg;
GAME._bikerImg = _bi;

function gameNotify() { GAME.onUpdate && GAME.onUpdate(); }

function gameDraw() {
  const canvas = GAME._canvas; if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const crashed = GAME.phase === 'crashed';
  const bgImg = GAME._bgImages[GAME.bgIndex];
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    const tileW = W * 1.8;
    const offset = -(GAME.bgScroll % tileW);
    ctx.drawImage(bgImg, offset, 0, tileW, H);
    ctx.drawImage(bgImg, offset + tileW, 0, tileW, H);
  } else {
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#1a0533'); g.addColorStop(0.6,'#7c2d12'); g.addColorStop(1,'#c2410c');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  }

  if (GAME.phase === 'running' || GAME.phase === 'crashed') {
    const m = GAME.mult;
    const col = crashed ? '#ef4444'
      : m >= 50 ? '#a855f7' : m >= 10 ? '#22c55e' : m >= 3 ? '#f59e0b' : '#ffffff';
    ctx.font = "bold 36px 'Arial Black',Arial,sans-serif";
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillText(m.toFixed(2)+'×', 18, 52);
    ctx.shadowBlur = 0;
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 22;
    ctx.fillText(m.toFixed(2)+'×', 18, 52);
    ctx.shadowBlur = 0;
    if (crashed) {
      ctx.font = "bold 14px 'Arial Black',Arial,sans-serif";
      ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
      ctx.fillText('CRASHED!', 18, 72); ctx.shadowBlur = 0;
    }
  }

  const GROUND_Y = H - 45, BIKE_X = 90;
  const biker = GAME._bikerImg;
  if (biker && biker.complete && biker.naturalWidth > 0 &&
      (GAME.phase === 'running' || GAME.phase === 'crashed')) {
    const bw = 140, bh = 95, by = GROUND_Y - bh + 8;
    ctx.save();
    if (crashed) {
      ctx.translate(BIKE_X+bw/2, by+bh/2);
      ctx.rotate(-0.4); ctx.globalAlpha = 0.75;
      ctx.drawImage(biker,-bw/2,-bh/2,bw,bh);
    } else {
      const bob  = Math.sin(Date.now()/300)*0.018;
      const sway = Math.sin(Date.now()/300)*0.8;
      const surge= Math.sin(Date.now()/600)*4;
      ctx.translate(BIKE_X+bw/2+surge, by+bh/2+sway);
      ctx.rotate(bob);
      ctx.drawImage(biker,-bw/2,-bh/2,bw,bh);
    }
    ctx.restore();
  }
}

function gameDoCashout(m) {
  if (!GAME.hasBet || GAME.cashedOut) return;
  GAME.cashedOut = true;
  GAME.cashedMult = m;
  const win = +(GAME.betAmt * m).toFixed(2);
  GAME.balance = +(GAME.balance + win).toFixed(2);
  GAME.onBalance && GAME.onBalance(b => +(b + win).toFixed(2));
  SFX.cashout();
  gameNotify();
}

const genCrash = motorideCrashPoint;

function gameStartWaiting() {
  cancelAnimationFrame(GAME._raf);
  clearInterval(GAME._engineIv);
  clearInterval(GAME._waitIv);
  clearTimeout(GAME._waitT);

  GAME.phase      = 'waiting';
  GAME.mult       = 1.0;
  GAME.hasBet     = false;
  GAME.cashedOut  = false;
  GAME.cashedMult = null;
  GAME.betQueued  = false;
  GAME.waitTimer  = 5;
  gameDraw();
  gameNotify();

  let t = 5;
  GAME._waitIv = setInterval(() => {
    t -= 1; GAME.waitTimer = t;
    if (t > 0) SFX.waiting();
    gameNotify();
    if (t <= 0) clearInterval(GAME._waitIv);
  }, 1000);
  GAME._waitT = setTimeout(gameStartRound, 5000);
}

function gameStartRound() {
  if (GAME.phase === 'running') return;

  clearInterval(GAME._waitIv);
  clearTimeout(GAME._waitT);
  clearInterval(GAME._engineIv);

  GAME.phase      = 'running';
  GAME.bgIndex    = Math.floor(Math.random() * BG_IMAGES.length);
  GAME.bgScroll   = 0;
  GAME.crashPoint = genCrash();
  GAME.startTime  = performance.now();
  GAME.mult       = 1.0;

  if (GAME.betQueued) {
    GAME.hasBet     = true;
    GAME.cashedOut  = false;
    GAME.cashedMult = null;
    GAME.betQueued  = false;
    GAME.balance    = +(GAME.balance - GAME.betAmt).toFixed(2);
    GAME.onBalance && GAME.onBalance(b => +(b - GAME.betAmt).toFixed(2));
  }
  gameNotify();

  GAME._engineIv = setInterval(() => SFX.engine(), 200);

  const loop = (now) => {
    if (GAME.phase !== 'running') return;

    const elapsed = (now - GAME.startTime) / 1000;
    const m = Math.pow(Math.E, elapsed * 0.18);
    GAME.mult = m;
    const speed = 1.8 + (m - 1) * 0.5;
    GAME.bgScroll += speed * 0.55;
    gameDraw();
    gameNotify();

    if (Math.random() < 0.04) SFX.rev(Math.min(elapsed/35, 1));

    const ac = parseFloat(GAME.autoCashout);
    if (!isNaN(ac) && ac >= 1.01 && m >= ac && GAME.hasBet && !GAME.cashedOut) {
      gameDoCashout(m);
    }

    if (m >= GAME.crashPoint) {
      clearInterval(GAME._engineIv);
      SFX.crash();
      GAME.phase = 'crashed';
      GAME.history = [m, ...GAME.history].slice(0, 20);
      GAME.particles = Array.from({ length: 40 }, (_, i) => ({
        id: i + Date.now(),
        x: 90 + 70,
        y: (GAME._canvas?.height || 260) - 45 - 20,
        vx: (Math.random()-0.35)*18,
        vy: (Math.random()-1.5)*10,
        life: 1, size: Math.random()*10+3,
        color: ['#f97316','#fbbf24','#f59e0b','#fff','#ef4444','#fb923c'][Math.floor(Math.random()*6)]
      }));
      gameDraw();
      gameNotify();
      setTimeout(gameStartWaiting, 4000);
      return;
    }

    GAME._raf = requestAnimationFrame(loop);
  };
  GAME._raf = requestAnimationFrame(loop);
}

// Particle ticker
function tickParticles() {
  if (GAME.particles.length > 0) {
    GAME.particles = GAME.particles
      .map(p => ({ ...p, x:p.x+p.vx, y:p.y+p.vy, vy:p.vy+0.6, life:p.life-0.03 }))
      .filter(p => p.life > 0);
    gameNotify();
  }
  requestAnimationFrame(tickParticles);
}
requestAnimationFrame(tickParticles);

// ── History pill ──────────────────────────────────────────────────────────
const HistPill = ({ val }) => {
  const col = val < 1.5 ? '#ef4444' : val < 3 ? '#f97316' : val < 10 ? '#f59e0b' : val < 50 ? '#22c55e' : '#a855f7';
  return (
    <div style={{ padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:700,
      background:col+'22', border:`1px solid ${col}66`, color:col,
      fontFamily:'monospace', whiteSpace:'nowrap', flexShrink:0 }}>
      {val.toFixed(2)}×
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────
const SCENE_W = 560, SCENE_H = 260;

export default function MotorideGame({ balance, setBalance, onBack }) {
  const canvasRef = useRef(null);
  const [, forceUpdate] = useState(0);
  const [shake, setShake] = useState(false);
  const [muted, setMuted] = useState(GAME.muted);
  const prevCrashedRef = useRef(false);
  const [loading, setLoading] = useState(!GAME._started); // only show on first mount

  useEffect(() => { GAME.balance = balance; }, [balance]);

  useEffect(() => {
    GAME._canvas  = canvasRef.current;
    GAME.onUpdate = () => forceUpdate(n => n+1);
    GAME.onBalance = setBalance;

    // ── FIX: market always keeps running; just resume audio and redraw ──
    SFX.resume();
    if (!GAME._started) {
      GAME._started = true;
      gameStartWaiting();
      // dismiss loading screen after 1.5s
      setTimeout(() => setLoading(false), 1500);
    } else {
      gameDraw(); // repaint onto the newly-mounted canvas
    }

    return () => {
      // ── FIX: on back, STOP sound but KEEP the market loop alive ──────
      SFX.suspend();               // immediately silences all AudioContext sound
      clearInterval(GAME._engineIv); // stop the repeating engine interval
      // do NOT cancel _raf / _waitIv / _waitT — the market keeps going
      GAME._canvas   = null;       // no canvas to draw on while away
      GAME.onUpdate  = null;       // don't try to setState on unmounted component
      GAME.onBalance = null;
      // intentionally NOT setting GAME._started = false
    };
  }, []); // eslint-disable-line

  // Shake on crash
  useEffect(() => {
    if (GAME.phase === 'crashed' && !prevCrashedRef.current) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    prevCrashedRef.current = GAME.phase === 'crashed';
  });

  useEffect(() => {
    GAME._canvas = canvasRef.current;
    gameDraw();
  });

  // ── Mute toggle ───────────────────────────────────────────────────────
  const toggleMute = () => {
    GAME.muted = !GAME.muted;
    if (GAME.muted) {
      clearInterval(GAME._engineIv);
      SFX.suspend();
    } else {
      SFX.resume();
      if (GAME.phase === 'running') {
        GAME._engineIv = setInterval(() => SFX.engine(), 200);
      }
    }
    setMuted(GAME.muted);
  };

  // ── Actions ───────────────────────────────────────────────────────────
  const placeBet = () => {
    const { phase, hasBet, betQueued, betAmt, balance: bal } = GAME;
    if (phase === 'crashed') return;
    if (hasBet || betQueued) return;
    if (bal < betAmt) return;
    SFX.bet();
    if (phase === 'waiting') {
      GAME.balance = +(bal - betAmt).toFixed(2);
      setBalance(b => +(b - betAmt).toFixed(2));
      GAME.hasBet = true; GAME.cashedOut = false; GAME.cashedMult = null;
    } else {
      GAME.balance = +(bal - betAmt).toFixed(2);
      setBalance(b => +(b - betAmt).toFixed(2));
      GAME.betQueued = true;
    }
    forceUpdate(n => n+1);
  };

  const cashout = () => {
    if (GAME.phase !== 'running' || !GAME.hasBet || GAME.cashedOut) return;
    gameDoCashout(GAME.mult);
  };

  const cancelQueue = () => {
    if (!GAME.betQueued) return;
    GAME.balance = +(GAME.balance + GAME.betAmt).toFixed(2);
    setBalance(b => +(b + GAME.betAmt).toFixed(2));
    GAME.betQueued = false;
    forceUpdate(n => n+1);
  };

  const setBetAmt = (val) => {
    if (GAME.hasBet || GAME.betQueued) return;
    const next = typeof val === 'function' ? val(GAME.betAmt) : val;
    GAME.betAmt = Math.max(1, next);
    forceUpdate(n => n+1);
  };

  const setAutoCashout = (val) => { GAME.autoCashout = val; forceUpdate(n => n+1); };

  const { phase, mult, waitTimer, hasBet, betQueued, cashedOut, cashedMult,
          history, particles, betAmt, autoCashout } = GAME;

  const cardBg = 'rgba(15,7,2,0.95)';

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(180deg,#160600 0%,#0a0200 100%)',
      fontFamily:"'Arial Black',Arial,sans-serif",
      color:'#fff', display:'flex', flexDirection:'column', alignItems:'center',
      padding:'10px 8px 28px', overflowX:'hidden', position:'relative',
    }}>
      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-9px)}35%{transform:translateX(9px)}55%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        @keyframes crashFlash{0%{opacity:0}15%{opacity:0.5}100%{opacity:0}}
        @keyframes popIn{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes floatUp{0%{transform:translateY(0) translateX(-50%);opacity:1}100%{transform:translateY(-60px) translateX(-50%);opacity:0}}
        .shake{animation:shake 0.55s ease}
        .pop{animation:popIn 0.28s ease forwards}

        @keyframes bikeRide{
          0%   { transform: translateX(-120px) scaleX(-1); }
          100% { transform: translateX(calc(100vw + 120px)) scaleX(-1); }
        }
        @keyframes roadScroll{
          0%   { background-position: 0 0; }
          100% { background-position: -400px 0; }
        }
        @keyframes loadFadeOut{
          0%   { opacity:1; }
          100% { opacity:0; pointer-events:none; }
        }
        @keyframes titlePop{
          0%   { opacity:0; transform:scale(0.7) translateY(10px); }
          60%  { transform:scale(1.08) translateY(-2px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes bikeBob{
          0%,100%{ transform: translateX(-120px) scaleX(-1) translateY(0px); }
          50%    { transform: translateX(-120px) scaleX(-1) translateY(-6px); }
        }
        @keyframes exhaustPuff{
          0%  { opacity:0.7; transform:scale(0.5) translateX(0); }
          100%{ opacity:0;   transform:scale(2)   translateX(-30px); }
        }
        .moto-loader {
          position:fixed; inset:0; z-index:9999;
          background:linear-gradient(180deg,#160600 0%,#0a0200 100%);
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          overflow:hidden;
        }
        .moto-loader.fade-out {
          animation: loadFadeOut 0.4s ease forwards;
        }
        .moto-road {
          position:absolute; bottom:0; left:0; right:0; height:56px;
          background: repeating-linear-gradient(90deg,
            #2a1400 0px, #2a1400 60px,
            #f97316 60px, #f97316 80px,
            #2a1400 80px, #2a1400 140px
          );
          animation: roadScroll 0.35s linear infinite;
          border-top: 3px solid rgba(249,115,22,0.5);
        }
        .moto-bike {
          position:absolute;
          bottom: 56px;
          left: 0;
          font-size: 64px;
          line-height:1;
          animation: bikeRide 1.1s cubic-bezier(0.4,0,0.6,1) forwards;
          filter: drop-shadow(0 0 18px rgba(249,115,22,0.8));
        }
        .moto-exhaust {
          position:absolute;
          bottom:96px;
          left:20px;
          font-size:18px;
          animation: exhaustPuff 0.4s ease forwards;
        }
        .moto-title {
          font-family:'Arial Black',Arial,sans-serif;
          font-size: clamp(28px,8vw,48px);
          font-weight:900;
          letter-spacing:6px;
          color:#f97316;
          text-shadow: 0 0 30px rgba(249,115,22,0.9), 0 0 60px rgba(249,115,22,0.4);
          animation: titlePop 0.5s ease forwards;
          margin-bottom: 12px;
        }
        .moto-sub {
          font-family:'Arial Black',Arial,sans-serif;
          font-size:11px;
          letter-spacing:5px;
          color:rgba(249,115,22,0.45);
          animation: titlePop 0.5s ease 0.15s both;
        }
      `}</style>

      {/* ── Loading Screen ── */}
      {loading && (
        <div className="moto-loader">
          <div className="moto-title">🏍️ MOTORIDE</div>
          <div className="moto-sub">LOADING...</div>
          {/* bike rides across */}
          <div className="moto-bike">🏍️</div>
          {/* road strip at bottom */}
          <div className="moto-road" />
        </div>
      )}

      {phase === 'crashed' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(239,68,68,0.28)',
          animation:'crashFlash 1.8s ease forwards', pointerEvents:'none', zIndex:100 }}/>
      )}

      {/* ── Header ── */}
      <div style={{ width:'100%', maxWidth:SCENE_W, display:'flex', alignItems:'center',
        justifyContent:'space-between', marginBottom:8, position:'relative', zIndex:1 }}>
        <button onClick={onBack} style={{ background:'rgba(249,115,22,0.12)',
          border:'1px solid rgba(249,115,22,0.3)', color:'#f97316',
          fontSize:18, cursor:'pointer', borderRadius:8, padding:'6px 14px', fontWeight:700 }}>
          ‹ Back
        </button>

        <div style={{ fontSize:'clamp(16px,4.5vw,24px)', letterSpacing:4,
          color:'#f97316', textShadow:'0 0 22px rgba(249,115,22,0.75)' }}>
          🏍️ MOTORIDE
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={toggleMute} style={{
            background: muted ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.12)',
            border: muted ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(249,115,22,0.3)',
            color: muted ? '#ef4444' : '#f97316',
            fontSize:16, cursor:'pointer', borderRadius:8, padding:'6px 10px', fontWeight:700,
            lineHeight:1,
          }}>
            {muted ? '🔇' : '🔊'}
          </button>

          <div style={{ background:'rgba(245,158,11,0.12)', borderRadius:16,
            padding:'4px 12px', color:'#fbbf24', fontWeight:700, fontSize:13,
            border:'1px solid rgba(245,158,11,0.28)' }}>
            ৳{balance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* ── History ── */}
      <div style={{ display:'flex', gap:5, overflowX:'auto', width:'100%',
        maxWidth:SCENE_W, marginBottom:8, paddingBottom:2, position:'relative', zIndex:1 }}>
        {history.slice(0,12).map((v,i) => <HistPill key={i} val={v}/>)}
      </div>

      {/* ── Canvas ── */}
      <div className={shake ? 'shake' : ''} style={{
        position:'relative', zIndex:1, width:'100%', maxWidth:SCENE_W,
        borderRadius:16, overflow:'hidden',
        border:`2px solid ${phase==='crashed' ? 'rgba(239,68,68,0.55)' : 'rgba(249,115,22,0.3)'}`,
        boxShadow: phase==='crashed' ? '0 0 32px rgba(239,68,68,0.28)' : '0 0 18px rgba(249,115,22,0.12)',
      }}>
        <canvas ref={canvasRef} width={SCENE_W} height={SCENE_H}
          style={{ display:'block', width:'100%' }}/>

        {phase === 'waiting' && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', zIndex:6,
            background:'rgba(8,3,0,0.65)', backdropFilter:'blur(3px)' }}>
            <div style={{ animation:'pulse 1s ease infinite', textAlign:'center' }}>
              <div style={{ fontSize:11, letterSpacing:5, color:'rgba(249,115,22,0.55)', marginBottom:8 }}>
                NEXT ROUND IN
              </div>
              <div style={{ fontSize:72, color:'#f97316', lineHeight:1,
                textShadow:'0 0 34px rgba(249,115,22,0.85)' }}>
                {waitTimer}
              </div>
              <div style={{ fontSize:11, letterSpacing:4, color:'rgba(255,255,255,0.32)', marginTop:6 }}>
                PLACE YOUR BET NOW
              </div>
            </div>
          </div>
        )}

        {cashedOut && cashedMult && phase !== 'crashed' && (
          <div className="pop" style={{ position:'absolute', top:12, right:14, zIndex:7,
            fontSize:12, color:'#fbbf24', letterSpacing:2,
            background:'rgba(245,158,11,0.18)', borderRadius:8,
            padding:'5px 13px', border:'1px solid rgba(245,158,11,0.42)' }}>
            ✓ OUT @ {cashedMult.toFixed(2)}×
          </div>
        )}

        {/* particles */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:5 }}>
          {particles.map(p => (
            <div key={p.id} style={{
              position:'absolute', left:p.x, top:p.y,
              width:p.size, height:p.size, borderRadius:'50%',
              background:p.color, opacity:p.life, transform:`scale(${p.life})`,
              pointerEvents:'none'
            }}/>
          ))}
        </div>
      </div>

      {betQueued && phase === 'running' && (
        <div style={{
          width:'100%', maxWidth:SCENE_W, marginTop:6,
          padding:'8px 14px', borderRadius:10, zIndex:1,
          background:'rgba(163,230,53,0.08)', border:'1px solid rgba(163,230,53,0.35)',
          color:'#a3e635', fontSize:12, fontWeight:700, letterSpacing:2, textAlign:'center',
        }}>
          ⏳ BET QUEUED FOR NEXT ROUND
        </div>
      )}

      {cashedOut && cashedMult && (
        <div key={cashedMult} style={{
          position:'fixed', top:'36%', left:'50%',
          fontSize:32, color:'#fbbf24',
          textShadow:'0 0 24px rgba(251,191,36,0.9)',
          animation:'floatUp 2s ease forwards',
          pointerEvents:'none', zIndex:999, letterSpacing:2, fontWeight:900
        }}>
          +৳{(betAmt * cashedMult).toFixed(2)}
        </div>
      )}

      {/* ── Controls ── */}
      <div style={{ width:'100%', maxWidth:SCENE_W, marginTop:10,
        background:cardBg, borderRadius:16, padding:14,
        border:'1px solid rgba(249,115,22,0.18)', position:'relative', zIndex:1 }}>

        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:10, letterSpacing:3, color:'rgba(249,115,22,0.45)', marginBottom:6 }}>
            BET AMOUNT
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ display:'flex', background:'rgba(0,0,0,0.6)', borderRadius:10,
              border:'1px solid rgba(249,115,22,0.18)', overflow:'hidden', flex:1, minWidth:100 }}>
              <button onClick={() => setBetAmt(b => Math.max(1,b-1))}
                style={{ padding:'10px 14px', background:'transparent', border:'none',
                  color:(hasBet||betQueued)?'rgba(249,115,22,0.25)':'#f97316',
                  fontSize:18, cursor:(hasBet||betQueued)?'not-allowed':'pointer' }}>−</button>
              <input value={betAmt}
                onChange={e => setBetAmt(Math.max(1,parseInt(e.target.value)||1))}
                style={{ flex:1, background:'transparent', border:'none', color:'#fff',
                  textAlign:'center', fontSize:16, fontWeight:700, outline:'none', minWidth:0,
                  opacity:(hasBet||betQueued)?0.4:1 }}/>
              <button onClick={() => setBetAmt(b => b+1)}
                style={{ padding:'10px 14px', background:'transparent', border:'none',
                  color:(hasBet||betQueued)?'rgba(249,115,22,0.25)':'#f97316',
                  fontSize:18, cursor:(hasBet||betQueued)?'not-allowed':'pointer' }}>+</button>
            </div>
            {[5,10,25,50].map(v => (
              <button key={v} onClick={() => setBetAmt(v)}
                disabled={hasBet||betQueued}
                style={{ padding:'10px 12px', borderRadius:10,
                  border:`1px solid ${betAmt===v?'rgba(249,115,22,0.65)':'rgba(255,255,255,0.08)'}`,
                  background:betAmt===v?'rgba(249,115,22,0.18)':'rgba(0,0,0,0.35)',
                  color:betAmt===v?'#f97316':'rgba(255,255,255,0.4)',
                  opacity:(hasBet||betQueued)?0.35:1,
                  fontSize:13, fontWeight:700, cursor:(hasBet||betQueued)?'not-allowed':'pointer' }}>
                ৳{v}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, letterSpacing:3, color:'rgba(249,115,22,0.45)', marginBottom:6 }}>
            AUTO CASH OUT AT
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ flex:1, display:'flex', background:'rgba(0,0,0,0.6)', borderRadius:10,
              border:'1px solid rgba(249,115,22,0.18)', overflow:'hidden' }}>
              <input placeholder="e.g. 2.00" value={autoCashout}
                onChange={e => setAutoCashout(e.target.value)}
                style={{ flex:1, background:'transparent', border:'none', color:'#fff',
                  padding:'10px 14px', fontSize:14, outline:'none' }}/>
              <span style={{ padding:'10px 12px', color:'rgba(249,115,22,0.38)', fontSize:14 }}>×</span>
            </div>
            {autoCashout && (
              <button onClick={() => setAutoCashout('')}
                style={{ padding:'10px 14px', borderRadius:10,
                  border:'1px solid rgba(255,255,255,0.08)',
                  background:'rgba(255,255,255,0.04)',
                  color:'rgba(255,255,255,0.35)', cursor:'pointer' }}>✕</button>
            )}
          </div>
        </div>

        {hasBet && cashedOut && (
          <div style={{ width:'100%', padding:16, borderRadius:12,
            background:'rgba(245,158,11,0.1)', border:'2px solid rgba(245,158,11,0.4)',
            color:'#fbbf24', fontSize:18, letterSpacing:3, textAlign:'center' }}>
            ✓ CASHED OUT @ {cashedMult?.toFixed(2)}×
          </div>
        )}

        {hasBet && !cashedOut && phase === 'running' && (
          <button onClick={cashout}
            style={{ width:'100%', padding:16, borderRadius:12,
              border:'2px solid rgba(249,115,22,0.65)',
              background:'linear-gradient(135deg,#f97316,#ea580c)',
              color:'#fff', fontSize:18, fontWeight:700, letterSpacing:3, cursor:'pointer',
              boxShadow:'0 4px 30px rgba(249,115,22,0.5)',
              animation:'pulse 1.1s ease infinite',
              textShadow:'0 1px 4px rgba(0,0,0,0.5)' }}>
            💨  CASH OUT — ৳{(betAmt * mult).toFixed(2)}
          </button>
        )}

        {betQueued && !hasBet && (
          <button onClick={cancelQueue}
            style={{ width:'100%', padding:16, borderRadius:12,
              border:'2px solid rgba(163,230,53,0.4)',
              background:'rgba(163,230,53,0.08)',
              color:'#a3e635', fontSize:16, fontWeight:700, letterSpacing:2, cursor:'pointer' }}>
            ⏳ QUEUED FOR NEXT ROUND — tap to cancel
          </button>
        )}

        {!hasBet && !betQueued && (
          <button onClick={placeBet} disabled={phase === 'crashed'}
            style={{ width:'100%', padding:16, borderRadius:12,
              border:'2px solid rgba(249,115,22,0.45)',
              background:'linear-gradient(135deg,#ea6b00,#b91c1c)',
              color:'#fff', fontSize:18, fontWeight:700, letterSpacing:3,
              cursor:phase==='crashed'?'not-allowed':'pointer',
              opacity:phase==='crashed'?0.35:1,
              boxShadow:'0 4px 26px rgba(234,107,0,0.42)',
              textShadow:'0 1px 4px rgba(0,0,0,0.5)' }}>
            {phase === 'waiting'
              ? `🏍️  PLACE BET  (${waitTimer}s)`
              : phase === 'running'
              ? '🎰  BET NEXT ROUND'
              : '⏳  WAIT...'}
          </button>
        )}
      </div>
    </div>
  );
}

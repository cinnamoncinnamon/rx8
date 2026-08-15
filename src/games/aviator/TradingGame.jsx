import React, { useState, useEffect, useRef, useCallback } from "react";
import { getToken, apiGetBalance } from "../../api";
/* ── TRADING — server-authoritative (backend games/FXTraderServer.js runs
   the real price feed, round clock, and outcome decision; this file only
   renders what the server sends and forwards bets over the socket) ── */
const CANDLE_DURATION = 30;
const ENTRY_WINDOW    = 10;
const WS_URL = `${import.meta.env.VITE_WS_BASE_URL || "ws://localhost:4000"}/ws/fxtrader`;

const TRADE_MARKETS = [
  { id:"USDJPY", backendId:"fx_usdjpy", label:"USD/JPY", decimals:2, prefix:"" },
  { id:"EURUSD", backendId:"fx_eurusd", label:"EUR/USD", decimals:4, prefix:"" },
  { id:"GBPUSD", backendId:"fx_gbpusd", label:"GBP/USD", decimals:4, prefix:"" },
  { id:"XAUUSD", backendId:"fx_xauusd", label:"XAU/USD", decimals:1, prefix:"$" },
  { id:"BTCUSD", backendId:"fx_btcusd", label:"BTC/USD", decimals:2, prefix:"$" },
];
const marketByBackendId = Object.fromEntries(TRADE_MARKETS.map(m => [m.backendId, m]));

const AudioEngine = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const tone = (freq, type, dur, vol, delay) => {
    vol   = vol   || 0.18;
    delay = delay || 0;
    const c = getCtx(); if (!c) return;
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
    tradeEntry: function(dir) {
      if (dir === "UP") { tone(660,"sine",0.08,0.14); tone(880,"sine",0.12,0.10,0.06); tone(1100,"sine",0.10,0.08,0.12); }
      else              { tone(440,"sine",0.08,0.14); tone(330,"sine",0.12,0.10,0.06); tone(220,"sine",0.10,0.08,0.12); }
    },
    win:     function() { tone(660,"sine",0.15,0.14); tone(880,"sine",0.15,0.12,0.1); tone(1100,"sine",0.20,0.10,0.2); tone(1320,"sine",0.18,0.08,0.35); },
    loss:    function() { tone(330,"sine",0.15,0.14); tone(220,"sine",0.15,0.12,0.12); tone(165,"triangle",0.18,0.10,0.25); },
    uiClick: function() { tone(800,"sine",0.05,0.07); },
    reveal:  function() { tone(523,"sine",0.12,0.12); tone(659,"sine",0.12,0.12,0.1); tone(784,"sine",0.12,0.12,0.2); tone(1047,"sine",0.25,0.14,0.3); },
  };
})();

const FXSocket = (function() {
  const stores = {};
  const listeners = [];
  const resultListeners = [];
  const betResponseListeners = [];
  let ws = null;
  let authed = false;

  TRADE_MARKETS.forEach(function(m) {
    stores[m.id] = {
      candles: [], live: 0, openRef: 0, timeLeft: CANDLE_DURATION, resolved: false,
    };
  });

  function notify() { listeners.forEach(function(fn) { fn(); }); }

  function connect(token) {
    if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;
    ws = new WebSocket(WS_URL);

    ws.onopen = function() {
      ws.send(JSON.stringify({ type: "auth", token: token }));
    };

    ws.onmessage = function(evt) {
      let msg;
      try { msg = JSON.parse(evt.data); } catch (e) { return; }

      if (msg.type === "auth_ok") {
        authed = true;
        (msg.markets || []).forEach(function(snap) {
          const m = marketByBackendId[snap.marketId];
          if (!m) return;
          stores[m.id] = {
            candles: snap.candles, live: snap.live, openRef: snap.openRef,
            timeLeft: snap.timeLeft, resolved: false,
          };
        });
        notify();
        return;
      }

      if (msg.type === "price") {
        const m = marketByBackendId[msg.marketId]; if (!m) return;
        const s = stores[m.id]; if (!s) return;
        s.live = msg.price;
        const live = s.candles[s.candles.length - 1];
        if (live) { live.c = msg.price; live.hi = Math.max(live.hi, msg.price); live.lo = Math.min(live.lo, msg.price); }
        notify();
        return;
      }

      if (msg.type === "tick") {
        const m = marketByBackendId[msg.marketId]; if (!m) return;
        const s = stores[m.id]; if (!s) return;
        s.timeLeft = msg.timeLeft;
        notify();
        return;
      }

      if (msg.type === "new_round") {
        const m = marketByBackendId[msg.marketId]; if (!m) return;
        const s = stores[m.id]; if (!s) return;
        if (s.candles.length) s.candles[s.candles.length - 1].closed = true;
        s.openRef = msg.openRef;
        s.timeLeft = msg.timeLeft;
        s.candles.push({ o: msg.openRef, c: msg.openRef, hi: msg.openRef, lo: msg.openRef, closed: false });
        if (s.candles.length > 120) s.candles.shift();
        notify();
        return;
      }

      if (msg.type === "result") {
        resultListeners.forEach(function(fn) { fn(msg); });
        return;
      }

      if (msg.type === "bet_accepted" || msg.type === "error") {
        betResponseListeners.forEach(function(fn) { fn(msg); });
        return;
      }
    };

    ws.onclose = function() {
      authed = false;
      setTimeout(function() { connect(token); }, 2000);
    };
  }

  function getStore(id) { return stores[id]; }
  function isAuthed() { return authed; }

  function placeBet(backendMarketId, dir, amount) {
    if (!ws || ws.readyState !== 1) return false;
    ws.send(JSON.stringify({ type: "bet", marketId: backendMarketId, dir: dir, amount: amount }));
    return true;
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function() { const i = listeners.indexOf(fn); if (i !== -1) listeners.splice(i, 1); };
  }
  function onResult(fn) {
    resultListeners.push(fn);
    return function() { const i = resultListeners.indexOf(fn); if (i !== -1) resultListeners.splice(i, 1); };
  }
  function onBetResponse(fn) {
    betResponseListeners.push(fn);
    return function() { const i = betResponseListeners.indexOf(fn); if (i !== -1) betResponseListeners.splice(i, 1); };
  }

  return { connect, getStore, isAuthed, placeBet, subscribe, onResult, onBetResponse };
})();

function TradingLoader({ onDone }) {
  const canvasRef = useRef(null);
  const onDoneRef = useRef(onDone);
  useEffect(function() { onDoneRef.current = onDone; }, [onDone]);

  useEffect(function() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 400, H = 650;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const startTime = Date.now();
    let raf;

    const pts = [];
    let py = 180, px = 0;
    while (px < W - 20) {
      py += (Math.random() - 0.46) * 14;
      py  = Math.max(80, Math.min(260, py));
      pts.push({ x: px, y: py });
      px += 5 + Math.random() * 5;
    }

    const draw = function() {
      const elapsed  = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / 2.0, 1);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, 220);
      grd.addColorStop(0, "rgba(0,180,100," + (0.08 + 0.04 * Math.sin(elapsed * 1.4)) + ")");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      const drawCount = Math.floor(progress * pts.length);
      if (drawCount > 1) {
        const slice = pts.slice(0, drawCount);
        const ox = 10, oy = 120;

        ctx.save();
        ctx.shadowColor = "#00cc88";
        ctx.shadowBlur  = 20;
        ctx.beginPath();
        slice.forEach(function(p, i) { i === 0 ? ctx.moveTo(ox+p.x, oy+p.y) : ctx.lineTo(ox+p.x, oy+p.y); });
        ctx.strokeStyle = "#00cc88";
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = "round";
        ctx.lineCap     = "round";
        ctx.stroke();
        ctx.restore();

        const ep = slice[slice.length - 1];
        ctx.save();
        ctx.beginPath();
        slice.forEach(function(p, i) { i === 0 ? ctx.moveTo(ox+p.x, oy+p.y) : ctx.lineTo(ox+p.x, oy+p.y); });
        ctx.lineTo(ox + ep.x, oy + 280);
        ctx.lineTo(ox, oy + 280);
        ctx.closePath();
        const fill = ctx.createLinearGradient(0, oy, 0, oy + 280);
        fill.addColorStop(0, "rgba(0,200,136,0.22)");
        fill.addColorStop(1, "rgba(0,200,136,0)");
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = "#00cc88";
        ctx.shadowBlur  = 24;
        ctx.beginPath();
        ctx.arc(ox + ep.x, oy + ep.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#00cc88";
        ctx.fill();
        ctx.restore();
      }

      const candleData = [36,22,48,30,52,18,42,34,50,26];
      candleData.forEach(function(h, i) {
        const bull  = i % 2 === 0;
        const alpha = Math.min(progress * 2 - i * 0.1, 1);
        if (alpha <= 0) return;
        const cx = 30 + i * 36;
        const cy = H - 80;
        ctx.globalAlpha = alpha * 0.45;
        ctx.fillStyle   = bull ? "#00cc88" : "#ff3355";
        ctx.fillRect(cx - 1, cy - h * 0.35, 2, h * 0.35);
        ctx.fillRect(cx - 6, cy - h, 12, h);
        ctx.fillRect(cx - 1, cy, 2, h * 0.2);
        ctx.globalAlpha = 1;
      });

      const titleAlpha = Math.min(progress * 2.5, 1);
      ctx.save();
      ctx.globalAlpha = titleAlpha;
      ctx.font        = "bold 30px monospace";
      ctx.textAlign   = "center";
      ctx.fillStyle   = "#00cc88";
      ctx.shadowColor = "#00cc88";
      ctx.shadowBlur  = 28;
      ctx.fillText("FX TRADER", W / 2, H * 0.14);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(Math.max(progress * 3 - 0.8, 0), 1);
      ctx.font        = "11px monospace";
      ctx.textAlign   = "center";
      ctx.fillStyle   = "rgba(0,200,136,0.5)";
      ctx.shadowBlur  = 0;
      ctx.fillText("SPINOVA TRADING PLATFORM", W / 2, H * 0.21);
      ctx.restore();

      const bW = 240, bX = (W - bW) / 2, bY = H * 0.87;
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(bX, bY, bW, 3);
      ctx.save();
      ctx.shadowColor = "#00cc88";
      ctx.shadowBlur  = 10;
      ctx.fillStyle   = "#00cc88";
      ctx.fillRect(bX, bY, bW * progress, 3);
      ctx.restore();

      const dotCount = Math.floor(elapsed * 2) % 4;
      ctx.globalAlpha = 0.5;
      ctx.font        = "11px monospace";
      ctx.textAlign   = "center";
      ctx.fillStyle   = "#6a6a8a";
      ctx.fillText("Loading market data" + "...".slice(0, dotCount), W / 2, H * 0.93);
      ctx.globalAlpha = 1;

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        setTimeout(function() { onDoneRef.current && onDoneRef.current(); }, 250);
      }
    };

    raf = requestAnimationFrame(draw);
    return function() { cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"#050508", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <canvas ref={canvasRef} style={{ width:"100%", maxWidth:400, height:"auto", display:"block" }} />
    </div>
  );
}

function TradeChart({ store, activeTrades, market, chartOffset, onOffsetChange }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const isDrag    = useRef(false);
  const dragX     = useRef(0);
  const dragOff   = useRef(0);

  const draw = useCallback(function() {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 360, H = 210;
    if (canvas.width !== W*dpr || canvas.height !== H*dpr) {
      canvas.width = W*dpr; canvas.height = H*dpr;
      canvas.style.width = W+"px"; canvas.style.height = H+"px";
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#07070e"; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.028)"; ctx.lineWidth = 1;
    for (let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(0,H/5*i);ctx.lineTo(W,H/5*i);ctx.stroke();}
    for (let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(W/7*i,0);ctx.lineTo(W/7*i,H);ctx.stroke();}

    const allCdls = store.current.candles;
    if (!allCdls || allCdls.length < 2) return;
    const VISIBLE=44, total=allCdls.length;
    const maxOff = Math.max(0, total-VISIBLE);
    const off    = Math.min(Math.max(chartOffset,0), maxOff);
    const startI = Math.max(0, total-VISIBLE-off), endI = total-off;
    const disp   = allCdls.slice(startI, endI);
    if (disp.length < 2) return;

    const prices = disp.flatMap(function(c){return[c.hi,c.lo];});
    let minP = Math.min.apply(null,prices), maxP = Math.max.apply(null,prices);
    const pad = (maxP-minP)*0.08; minP-=pad; maxP+=pad;
    const range=maxP-minP||1, PADT=10, PADB=22, PADL=2, PADR=52;
    const cW = (W-PADL-PADR)/disp.length;
    const toY = function(p){ return PADT+((maxP-p)/range)*(H-PADT-PADB); };
    const m = market;

    ctx.font="bold 9px monospace"; ctx.fillStyle="rgba(255,255,255,0.22)"; ctx.textAlign="right";
    for (let i=0;i<=4;i++){const v=minP+(range*(4-i)/4);ctx.fillText(v.toFixed(m.decimals),W-2,toY(v)+3);}
    ctx.textAlign="left";

    disp.forEach(function(c,i){
      const x=PADL+i*cW, xc=x+cW*0.5, bull=c.c>=c.o;
      const isLive = !c.closed && off===0 && i===disp.length-1;
      const col = bull?"#00e878":"#ff3355";
      const bodyY=Math.min(toY(c.o),toY(c.c)), bodyH=Math.max(Math.abs(toY(c.o)-toY(c.c)),1.5), bW=Math.max(cW*0.7,2);
      ctx.strokeStyle=col+(isLive?"cc":"55"); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(xc,toY(c.hi)); ctx.lineTo(xc,toY(c.lo)); ctx.stroke();
      if(isLive){ctx.save();ctx.shadowColor=col;ctx.shadowBlur=10;}
      ctx.fillStyle=col+(isLive?"ff":"99");
      ctx.fillRect(x+cW*0.15,bodyY,bW,bodyH);
      if(isLive)ctx.restore();
    });

    activeTrades.forEach(function(trade){
      if(trade.entry<minP||trade.entry>maxP)return;
      const ey=toY(trade.entry);
      ctx.save(); ctx.shadowColor=trade.dir==="UP"?"#00cc88":"#ff3355"; ctx.shadowBlur=6;
      ctx.setLineDash([3,5]); ctx.strokeStyle=trade.dir==="UP"?"rgba(0,200,136,0.7)":"rgba(255,51,85,0.7)"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(PADL,ey); ctx.lineTo(W-PADR,ey); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      ctx.font="bold 9px monospace"; ctx.fillStyle=trade.dir==="UP"?"#00cc88":"#ff3355";
      ctx.fillText((trade.dir==="UP"?"▲":"▼")+" "+m.prefix+trade.entry.toFixed(m.decimals),PADL+4,ey-3);
    });

    if(off===0){
      const lp=store.current.live, cy=toY(lp);
      const up=lp>=store.current.openRef, lc=up?"#00cc88":"#ff3355";
      ctx.save(); ctx.shadowColor=lc; ctx.shadowBlur=6;
      ctx.setLineDash([2,4]); ctx.strokeStyle=lc+"55"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(PADL,cy); ctx.lineTo(W-PADR,cy); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      const priceStr=m.prefix+lp.toFixed(m.decimals), pw=priceStr.length*6.5+10;
      ctx.fillStyle=lc;
      if(ctx.roundRect){ctx.beginPath();ctx.roundRect(W-PADR+2,cy-8,pw,16,4);ctx.fill();}
      else{ctx.fillRect(W-PADR+2,cy-8,pw,16);}
      ctx.fillStyle="#000"; ctx.font="bold 9px monospace"; ctx.textAlign="left";
      ctx.fillText(priceStr,W-PADR+6,cy+3);
    }

    if(off>0){ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="10px sans-serif";ctx.textAlign="right";ctx.fillText("← "+off+" candles back",W-PADR-4,H-5);}
    if(off===0){ctx.fillStyle="rgba(255,255,255,0.1)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("← drag to pan history",W/2,H-4);}
  }, [store, activeTrades, market, chartOffset]);

  useEffect(function(){
    let running=true;
    const loop=function(){ if(!running)return; draw(); rafRef.current=requestAnimationFrame(loop); };
    rafRef.current=requestAnimationFrame(loop);
    return function(){ running=false; cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  const onDown = function(e){ isDrag.current=true; dragX.current=e.clientX||(e.touches&&e.touches[0].clientX)||0; dragOff.current=chartOffset; };
  const onMove = function(e){
    if(!isDrag.current)return;
    const cx=(e.clientX||(e.touches&&e.touches[0].clientX)||0);
    const dx=dragX.current-cx, max=Math.max(0,store.current.candles.length-44);
    onOffsetChange(Math.min(Math.max(Math.round(dragOff.current+dx/9),0),max));
  };
  const onUp = function(){ isDrag.current=false; };

  return (
    <div style={{ background:"#07070e", position:"relative", flexShrink:0, cursor:"grab", userSelect:"none" }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={function(e){onDown(e.touches[0]);}} onTouchMove={function(e){onMove(e.touches[0]);}} onTouchEnd={onUp}>
      <canvas ref={canvasRef} style={{ width:"100%", height:210, display:"block" }} />
    </div>
  );
}

function EntryRing({ timeLeft, total, entryWindow }) {
  total       = total       || CANDLE_DURATION;
  entryWindow = entryWindow || ENTRY_WINDOW;
  const canvasRef = useRef(null);
  const inWindow  = timeLeft > total - entryWindow;
  const windowPct = inWindow ? (timeLeft-(total-entryWindow))/entryWindow : 0;
  const totalPct  = timeLeft/total;

  useEffect(function(){
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const S=56,R=22,cx=S/2,cy=S/2;
    canvas.width=canvas.height=S;
    ctx.clearRect(0,0,S,S);
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=3; ctx.stroke();
    const tAngle=-Math.PI/2+totalPct*Math.PI*2;
    ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2,tAngle);
    ctx.strokeStyle=timeLeft>5?"rgba(255,255,255,0.15)":"rgba(255,51,85,0.3)"; ctx.lineWidth=3; ctx.stroke();
    if(inWindow&&windowPct>0){
      ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+windowPct*Math.PI*2);
      ctx.shadowColor="#00cc88"; ctx.shadowBlur=10;
      ctx.strokeStyle="#00cc88"; ctx.lineWidth=3; ctx.stroke(); ctx.shadowBlur=0;
    }
    ctx.font="bold 13px monospace"; ctx.textAlign="center";
    ctx.fillStyle=inWindow?"#00cc88":timeLeft<=5?"#ff3355":"rgba(255,255,255,0.6)";
    ctx.fillText(timeLeft+"s",cx,cy+5);
  }, [timeLeft,inWindow,windowPct,totalPct]);

  return <canvas ref={canvasRef} style={{ width:56, height:56, display:"block" }} />;
}

function PositionCard({ trade, livePrice, market }) {
  const up   = livePrice > trade.entry;
  const won  = (trade.dir==="UP")===up;
  const pnl  = won ? trade.amt*0.92 : -trade.amt;
  const col  = pnl>=0?"#00cc88":"#ff3355";
  return (
    <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid "+(pnl>=0?"rgba(0,200,136,0.18)":"rgba(255,51,85,0.18)"),borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,backdropFilter:"blur(6px)"}}>
      <div style={{width:34,height:34,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,background:trade.dir==="UP"?"rgba(0,200,136,0.12)":"rgba(255,51,85,0.12)",color:trade.dir==="UP"?"#00cc88":"#ff3355"}}>
        {trade.dir==="UP"?"▲":"▼"}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:"#e8e8ff"}}>{market.label}</div>
        <div style={{fontSize:10,color:"#5a5a7a",marginTop:1}}>Entry: {market.prefix}{trade.entry.toFixed(market.decimals)}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:14,fontWeight:900,fontFamily:"monospace",color:col,transition:"color 0.2s"}}>{pnl>=0?"+":""}{pnl.toFixed(2)}$</div>
        <div style={{fontSize:10,color:"#5a5a7a",marginTop:2}}>৳{trade.amt.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default function TradingGame({ balance, setBalance, onBack }) {
  const [loading,      setLoading]      = useState(true);
  const [marketIdx,    setMarketIdx]    = useState(0);
  const [livePrice,    setLivePrice]    = useState(0);
  const [openRef,      setOpenRef]      = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(CANDLE_DURATION);
  const [betAmt,       setBetAmt]       = useState(10);
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [resultInfo,   setResultInfo]   = useState(null);
  const [activeTab,    setActiveTab]    = useState("trade");
  const [chartOffset,  setChartOffset]  = useState(0);
  const [soundOn,      setSoundOn]      = useState(true);
  const [stats, setStats] = useState({ trades:0, wins:0, losses:0, profit:0, totalLoss:0, streak:0, bestStreak:0, pnlCurve:[] });

  const market     = TRADE_MARKETS[marketIdx];
  const entryOpen  = timeLeft > CANDLE_DURATION - ENTRY_WINDOW;
  const pct        = openRef ? ((livePrice - openRef) / openRef * 100) : 0;
  const timerCol   = timeLeft > 10 ? "#00cc88" : timeLeft > 5 ? "#ffd700" : "#ff3355";

  const activeTradesRef = useRef([]);
  const tradeSeq        = useRef(0);
  const soundRef        = useRef(true);
  const marketIdxRef    = useRef(0);
  const pnlCanvasRef    = useRef(null);

  const storeRef = useRef(null);
  storeRef.current = FXSocket.getStore(market.id) || { candles:[], live:0, openRef:0 };

  useEffect(function(){ activeTradesRef.current = activeTrades; }, [activeTrades]);
  useEffect(function(){ soundRef.current = soundOn; }, [soundOn]);
  useEffect(function(){ marketIdxRef.current = marketIdx; }, [marketIdx]);

  // Connect to the real FX Trader server once, on mount. The server owns
  // price, the round clock, and the outcome — this effect just wires up
  // listeners for what it broadcasts.
  useEffect(function() {
    const token = getToken();
    if (token) FXSocket.connect(token);

    const unsubStore = FXSocket.subscribe(function() {
      const idx = marketIdxRef.current;
      const m   = TRADE_MARKETS[idx];
      const s   = FXSocket.getStore(m.id);
      if (!s) return;
      setLivePrice(s.live);
      setOpenRef(s.openRef);
      setTimeLeft(s.timeLeft);
    });

    const unsubResult = FXSocket.onResult(function(msg) {
      const m = marketByBackendId[msg.marketId];
      if (m) handleServerResult(msg, m);
    });

    const unsubBet = FXSocket.onBetResponse(function(msg) {
      if (msg.type === "error") return; // rejected — nothing was added optimistically, nothing to undo
      // bet_accepted — the server is the source of truth for entry price and
      // balance, so the confirmed trade is added now, not before the server
      // actually accepted it.
      const m = marketByBackendId[msg.marketId];
      if (!m) return;
      const id = ++tradeSeq.current;
      const trade = { id: id, dir: msg.dir, entry: msg.entryPrice, amt: msg.amount, marketId: msg.marketId };
      setActiveTrades(function(p) { return p.concat([trade]); });
      setBalance(msg.newBalance);
    });

    return function() { unsubStore(); unsubResult(); unsubBet(); };
  }, []); // eslint-disable-line

  const sound = useCallback(function(name) {
    if (!soundRef.current) return;
    if (AudioEngine[name]) AudioEngine[name]();
  }, []);

  function handleServerResult(msg, m) {
    // Server already decided win/loss and already credited any winnings —
    // this only updates the local display (history, stats, the result
    // modal), it never mutates the wallet itself.
    const myTrades = activeTradesRef.current.filter(function(t) { return t.marketId === msg.marketId; });
    if (!myTrades.length) return;

    const outcomeUp = msg.outcome === "UP";
    const now = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    const resolved = myTrades.map(function(t) {
      const won = (t.dir === "UP") === outcomeUp;
      const pnl = won ? t.amt * 0.92 : -t.amt; // net gain/loss relative to the stake, matches the server's payout rate
      return { id:t.id, dir:t.dir, entry:t.entry, amt:t.amt, won:won, pnl:pnl, close:msg.close, market:m.label, time:now };
    });

    setStats(function(prev) {
      const newWins  = prev.wins   + resolved.filter(function(r){return r.won;}).length;
      const newLoss  = prev.losses + resolved.filter(function(r){return !r.won;}).length;
      const newProfit= prev.profit + resolved.filter(function(r){return r.won;}).reduce(function(a,r){return a+r.pnl;},0);
      const newTLoss = prev.totalLoss + resolved.filter(function(r){return !r.won;}).reduce(function(a,r){return a+Math.abs(r.pnl);},0);
      const streak   = resolved.every(function(r){return r.won;}) ? prev.streak+1 : 0;
      return { ...prev, trades:prev.trades+resolved.length, wins:newWins, losses:newLoss, profit:newProfit, totalLoss:newTLoss, streak, bestStreak:Math.max(prev.bestStreak,streak), pnlCurve:[...prev.pnlCurve, newProfit-newTLoss] };
    });

    setTradeHistory(function(h){ return resolved.concat(h).slice(0,100); });
    setActiveTrades(function(p) { return p.filter(function(t) { return t.marketId !== msg.marketId; }); });

    // Refresh the real balance from the server instead of computing it
    // locally — the server is what actually credited the winnings.
    apiGetBalance().then(function(b) { setBalance(b); }).catch(function(){});

    const anyWon = resolved.some(function(r){return r.won;});
    const totPnl = resolved.reduce(function(acc,r){return acc+r.pnl;},0);
    setResultInfo({ won:anyWon, pnl:totPnl, close:msg.close, allWon:resolved.every(function(r){return r.won;}) });
    if (soundRef.current) { if (anyWon) AudioEngine.win(); else AudioEngine.loss(); }
    setTimeout(function(){ setResultInfo(null); }, 4200);
  }

  const switchMarket = useCallback(function(idx) {
    if (soundRef.current) AudioEngine.uiClick();
    setMarketIdx(idx);
    marketIdxRef.current = idx;
    const s = FXSocket.getStore(TRADE_MARKETS[idx].id);
    if (s) { setLivePrice(s.live); setOpenRef(s.openRef); setTimeLeft(s.timeLeft); }
    setChartOffset(0);
  }, []);

  const placeBet = useCallback(function(dir) {
    if (betAmt > balance || betAmt < 1 || !entryOpen) return;
    if (soundRef.current) AudioEngine.tradeEntry(dir);
    navigator && navigator.vibrate && navigator.vibrate(12);
    const m = TRADE_MARKETS[marketIdxRef.current];
    // Balance and the confirmed trade are applied when bet_accepted comes
    // back over the socket (see the onBetResponse subscription above) — the
    // server is the only thing that actually deducts the wallet now.
    FXSocket.placeBet(m.backendId, dir, betAmt);
  }, [betAmt, balance, entryOpen]);

  const drawPnl = useCallback(function() {
    const canvas = pnlCanvasRef.current; if(!canvas)return;
    const dpr=window.devicePixelRatio||1, W=canvas.offsetWidth||320, H=80;
    canvas.width=W*dpr; canvas.height=H*dpr;
    canvas.style.width=W+"px"; canvas.style.height=H+"px";
    const ctx=canvas.getContext("2d"); ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H);
    const curve=stats.pnlCurve;
    if(curve.length<2){ ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.font="11px sans-serif"; ctx.textAlign="center"; ctx.fillText("Trade to see P&L curve",W/2,H/2); return; }
    const minV=Math.min.apply(null,curve.concat([0])), maxV=Math.max.apply(null,curve.concat([1])), range=maxV-minV||1, pad=8;
    const toX=function(i){return pad+(i/(curve.length-1))*(W-pad*2);};
    const toY=function(v){return H-pad-((v-minV)/range)*(H-pad*2);};
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"rgba(0,200,136,0.3)"); g.addColorStop(1,"rgba(0,200,136,0)");
    ctx.beginPath(); ctx.moveTo(toX(0),toY(curve[0]));
    curve.forEach(function(v,i){if(i>0)ctx.lineTo(toX(i),toY(v));});
    ctx.lineTo(toX(curve.length-1),H-pad); ctx.lineTo(toX(0),H-pad); ctx.closePath();
    ctx.fillStyle=g; ctx.fill();
    ctx.beginPath(); ctx.moveTo(toX(0),toY(curve[0]));
    curve.forEach(function(v,i){if(i>0)ctx.lineTo(toX(i),toY(v));});
    ctx.strokeStyle="#00cc88"; ctx.lineWidth=2; ctx.lineJoin="round"; ctx.stroke();
  }, [stats.pnlCurve]);

  useEffect(function(){ if(activeTab==="profile")drawPnl(); }, [activeTab, stats, drawPnl]);

  if (loading) return <TradingLoader onDone={function(){
    // Wait for the socket to actually be authenticated before dropping the
    // loader — the animation has a fixed duration, but the real connection
    // might take a beat longer on a slow network.
    (function checkReady() {
      if (FXSocket.isAuthed()) setLoading(false);
      else setTimeout(checkReady, 150);
    })();
  }} />;

  const headerStyle = { background:"rgba(7,7,14,0.95)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 };

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#050508", minHeight:"100vh", fontFamily:"'Inter',sans-serif", display:"flex", flexDirection:"column", color:"#e8e8ff", overflow:"hidden" }}>
      <style>{`
        @keyframes slideInPos { from{opacity:0;transform:translateY(-8px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes tabSlide   { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes entryClosed{ 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes blink2     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes popIn      { 0%{opacity:0;transform:scale(0.7) rotate(-4deg)} 60%{opacity:1;transform:scale(1.05) rotate(1deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
      `}</style>

      <div style={headerStyle}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a5a7a", fontSize:22, cursor:"pointer", lineHeight:1, padding:"0 4px" }}>‹</button>
        <div style={{ fontFamily:"monospace", fontSize:15, fontWeight:900, color:"#00cc88", letterSpacing:2 }}>FX TRADER</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={function(){ setSoundOn(function(v){return !v;}); }} style={{ background:soundOn?"rgba(0,200,136,0.08)":"rgba(255,255,255,0.04)", border:"1px solid "+(soundOn?"rgba(0,200,136,0.2)":"rgba(255,255,255,0.08)"), borderRadius:8, padding:"5px 10px", fontSize:13, cursor:"pointer", color:soundOn?"#00cc88":"#4a4a6a", transition:"all 0.2s" }}>
            {soundOn ? "🔊 Sound" : "🔇 Sound"}
          </button>
          <div style={{ background:"rgba(0,200,136,0.08)", border:"1px solid rgba(0,200,136,0.18)", borderRadius:22, padding:"5px 14px", fontSize:13, fontWeight:800, color:"#00cc88", fontFamily:"monospace" }}>
            ৳{balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", background:"rgba(7,7,14,0.9)", borderBottom:"1px solid rgba(255,255,255,0.05)", flexShrink:0 }}>
        {[["trade","Trade"],["history","History"],["profile","Profile"]].map(function(kl){
          return (
            <button key={kl[0]} onClick={function(){ if(soundRef.current)AudioEngine.uiClick(); setActiveTab(kl[0]); }} style={{ flex:1, padding:"10px 0", border:"none", background:"transparent", color:activeTab===kl[0]?"#00cc88":"#4a4a6a", fontWeight:700, fontSize:12, borderBottom:activeTab===kl[0]?"2px solid #00cc88":"2px solid transparent", cursor:"pointer", fontFamily:"sans-serif", transition:"color 0.2s" }}>
              {kl[1]}
            </button>
          );
        })}
      </div>

      {activeTab === "trade" && (
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", animation:"tabSlide 0.2s ease" }}>
          <div style={{ display:"flex", gap:6, padding:"10px 12px", overflowX:"auto", background:"rgba(7,7,14,0.8)", borderBottom:"1px solid rgba(255,255,255,0.04)", flexShrink:0 }}>
            {TRADE_MARKETS.map(function(tm, i) {
              const active = marketIdx === i;
              return (
                <button key={tm.id} onClick={function(){ switchMarket(i); }} style={{ flexShrink:0, padding:"7px 14px", borderRadius:20, border:"1px solid "+(active?"rgba(0,200,136,0.4)":"rgba(255,255,255,0.06)"), background:active?"rgba(0,200,136,0.1)":"transparent", color:active?"#00cc88":"#5a5a7a", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"sans-serif", transition:"all 0.2s", boxShadow:active?"0 0 12px rgba(0,200,136,0.15)":"none", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:active?"#00cc88":"#2a2a44", boxShadow:active?"0 0 6px #00cc88":"none", display:"inline-block", animation:active?"blink2 1.5s infinite":"none" }} />
                  {tm.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding:"12px 16px", background:"rgba(10,10,20,0.9)", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <div style={{ fontSize:10, color:"#4a4a6a", fontWeight:600, letterSpacing:.8, textTransform:"uppercase", marginBottom:4 }}>{market.label}</div>
              <div style={{ fontFamily:"monospace", fontSize:24, fontWeight:700, color:pct>=0?"#00cc88":"#ff3355", transition:"color 0.2s" }}>
                {market.prefix}{livePrice.toFixed(market.decimals)}
              </div>
              <div style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:7, marginTop:5, display:"inline-block", background:pct>=0?"rgba(0,200,136,0.08)":"rgba(255,51,85,0.08)", color:pct>=0?"#00cc88":"#ff3355", border:"1px solid "+(pct>=0?"rgba(0,200,136,0.18)":"rgba(255,51,85,0.18)") }}>
                {pct>=0?"+":""}{pct.toFixed(3)}%
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <EntryRing timeLeft={timeLeft} />
              <div style={{ fontSize:9, fontWeight:800, color:entryOpen?"#00cc88":"#ff3355", letterSpacing:.5, animation:entryOpen?"none":"entryClosed 1s infinite" }}>
                {entryOpen ? "ENTRY OPEN" : "ENTRY CLOSED"}
              </div>
            </div>
          </div>

          <div style={{ height:3, background:"rgba(255,255,255,0.04)", flexShrink:0 }}>
            <div style={{ height:"100%", width:((timeLeft/CANDLE_DURATION)*100)+"%", background:"linear-gradient(90deg,"+timerCol+"88,"+timerCol+")", transition:"width 1s linear, background 0.3s" }} />
          </div>
          <div style={{ height:2, background:"rgba(255,255,255,0.02)", flexShrink:0 }}>
            <div style={{ height:"100%", width:entryOpen?((timeLeft-(CANDLE_DURATION-ENTRY_WINDOW))/ENTRY_WINDOW*100)+"%":"0%", background:"linear-gradient(90deg,rgba(0,200,136,0.4),#00cc88)", transition:"width 1s linear" }} />
          </div>

          <TradeChart store={storeRef} activeTrades={activeTrades} market={market} chartOffset={chartOffset} onOffsetChange={setChartOffset} />

          <div style={{ padding:"14px 14px 12px", background:"rgba(10,10,20,0.85)", borderTop:"1px solid rgba(255,255,255,0.05)", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#5a5a7a", fontWeight:600, letterSpacing:.6, textTransform:"uppercase", minWidth:52 }}>Amount</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {[10,25,50,100,200].map(function(p){
                  return (
                    <button key={p} onClick={function(){ if(soundRef.current)AudioEngine.uiClick(); setBetAmt(p); }} style={{ padding:"5px 11px", borderRadius:8, border:"1px solid "+(betAmt===p?"rgba(0,200,136,0.45)":"rgba(255,255,255,0.07)"), background:betAmt===p?"rgba(0,200,136,0.12)":"rgba(255,255,255,0.03)", color:betAmt===p?"#00cc88":"#5a5a7a", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"sans-serif", transition:"all 0.15s" }}>
                      ৳{p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"3px 3px 3px 14px" }}>
              <input type="number" value={betAmt} onChange={function(e){ setBetAmt(Math.max(1, parseFloat(e.target.value)||1)); }} style={{ flex:1, background:"transparent", border:"none", color:"#e8e8ff", fontSize:16, fontWeight:700, fontFamily:"sans-serif", outline:"none", minWidth:0 }} />
              <button onClick={function(){ setBetAmt(function(a){return Math.max(1,a-1);}); }} style={{ width:34,height:34,borderRadius:9,border:"none",background:"rgba(255,255,255,0.05)",color:"#e8e8ff",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>−</button>
              <button onClick={function(){ setBetAmt(function(a){return a+1;}); }} style={{ width:34,height:34,borderRadius:9,border:"none",background:"rgba(255,255,255,0.05)",color:"#e8e8ff",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>+</button>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              {["UP","DOWN"].map(function(dir){
                const isUp=dir==="UP", col=isUp?"#00cc88":"#ff3355", locked=!entryOpen, dis=balance<betAmt;
                return (
                  <button key={dir} onClick={function(){ placeBet(dir); }} disabled={dis} style={{ flex:1, height:62, borderRadius:16, border:"1.5px solid "+(locked?"#2a2a44":col+"55"), background:locked?"rgba(255,255,255,0.03)":(isUp?"rgba(0,200,136,0.12)":"rgba(255,51,85,0.12)"), color:locked?"#3a3a5a":col, fontWeight:800, fontSize:15, cursor:locked||dis?"not-allowed":"pointer", fontFamily:"sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, transition:"all 0.15s", boxShadow:locked?"none":"0 0 16px "+col+"33" }}>
                    <div style={{ fontSize:20 }}>{isUp?"▲":"▼"}</div>
                    <div style={{ fontSize:12, fontWeight:800, letterSpacing:1.5 }}>{dir}</div>
                  </button>
                );
              })}
            </div>

            {!entryOpen && (
              <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(255,51,85,0.06)", border:"1px solid rgba(255,51,85,0.18)", borderRadius:10, textAlign:"center", fontSize:12, fontWeight:700, color:"#ff3355", animation:"entryClosed 1.5s infinite" }}>
                Entry closed — next candle in {timeLeft}s
              </div>
            )}
          </div>

          <div style={{ background:"rgba(7,7,14,0.9)", borderTop:"1px solid rgba(255,255,255,0.04)", maxHeight:220, overflowY:"auto", flexShrink:0 }}>
            <div style={{ padding:"10px 14px 6px", display:"flex", alignItems:"center", gap:8, position:"sticky", top:0, background:"rgba(7,7,14,0.98)", zIndex:2 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"#00cc88",boxShadow:"0 0 8px #00cc88" }} />
              <span style={{ fontSize:12,fontWeight:700,color:"#8a8aaa",letterSpacing:.5,textTransform:"uppercase" }}>Active Positions</span>
              <span style={{ background:"rgba(0,200,136,0.1)",border:"1px solid rgba(0,200,136,0.2)",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#00cc88" }}>{activeTrades.length}</span>
            </div>
            <div style={{ padding:"0 10px 10px",display:"flex",flexDirection:"column",gap:6 }}>
              {activeTrades.length===0
                ? <div style={{ textAlign:"center",padding:18,color:"#3a3a5a",fontSize:13 }}>No active positions</div>
                : activeTrades.map(function(t){
                    const tm = marketByBackendId[t.marketId] || market;
                    const ts = FXSocket.getStore(tm.id);
                    return <PositionCard key={t.id} trade={t} livePrice={ts ? ts.live : livePrice} market={tm} />;
                  })
              }
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ flex:1, overflowY:"auto", animation:"tabSlide 0.2s ease" }}>
          <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:15, fontWeight:700 }}>Trade History</div>
            <div style={{ background:"rgba(0,200,136,0.08)", border:"1px solid rgba(0,200,136,0.2)", borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:700, color:"#00cc88" }}>LIVE</div>
          </div>
          <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
            {tradeHistory.length===0
              ? <div style={{ textAlign:"center", padding:"50px 20px", color:"#4a4a6a", fontSize:13 }}>No trades yet</div>
              : tradeHistory.map(function(t,i){
                  return (
                    <div key={i} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid "+(t.won?"rgba(0,200,136,0.12)":"rgba(255,51,85,0.12)"), borderRadius:13, padding:"13px 14px", display:"flex", alignItems:"center", gap:11 }}>
                      <div style={{ width:38,height:38,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,flexShrink:0,background:t.dir==="UP"?"rgba(0,200,136,0.1)":"rgba(255,51,85,0.1)",color:t.dir==="UP"?"#00cc88":"#ff3355" }}>{t.dir==="UP"?"▲":"▼"}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:700 }}>{t.market} · {t.dir}</div>
                        <div style={{ fontSize:11,color:"#5a5a7a",marginTop:2 }}>{t.time} · ৳{t.amt.toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:15,fontWeight:900,fontFamily:"monospace",color:t.won?"#00cc88":"#ff3355" }}>{t.pnl>=0?"+":""}${Math.abs(t.pnl).toFixed(2)}</div>
                        <div style={{ fontSize:10,color:"#5a5a7a",marginTop:2 }}>{t.won?"WIN":"LOSS"}</div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div style={{ flex:1, overflowY:"auto", animation:"tabSlide 0.2s ease" }}>
          <div style={{ background:"radial-gradient(ellipse at 50% 0%,rgba(0,200,136,0.1),transparent 70%)", padding:"24px 16px 20px", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize:18,fontWeight:800,marginBottom:4 }}>Trading Stats</div>
            <div style={{ fontSize:11,color:"#5a5a7a",letterSpacing:1 }}>Performance Overview</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:14 }}>
            {[
              { val:"+$"+stats.profit.toFixed(2),    lbl:"Total Profit",  col:"#00cc88" },
              { val:"-$"+stats.totalLoss.toFixed(2), lbl:"Total Losses",  col:"#ff3355" },
              { val:(stats.trades>0?Math.round(stats.wins/stats.trades*100):0)+"%", lbl:"Win Rate", col:"#e8e8ff" },
              { val:""+stats.trades,                 lbl:"Total Trades",  col:"#e8e8ff" },
              { val:""+stats.bestStreak,             lbl:"Best Streak",   col:"#ffd700" },
              { val:""+stats.wins,                   lbl:"Total Wins",    col:"#00cc88" },
              { val:""+stats.losses,                 lbl:"Total Losses",  col:"#ff3355" },
              { val:((stats.profit-stats.totalLoss)/Math.max(balance,1)*100).toFixed(1)+"%", lbl:"ROI", col:"#e8e8ff" },
            ].map(function(s,i){
              return (
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:14, textAlign:"center" }}>
                  <div style={{ fontSize:20,fontWeight:900,fontFamily:"monospace",marginBottom:4,color:s.col }}>{s.val}</div>
                  <div style={{ fontSize:10,color:"#5a5a7a",fontWeight:600,letterSpacing:.4,textTransform:"uppercase" }}>{s.lbl}</div>
                </div>
              );
            })}
          </div>
          <div style={{ margin:"0 14px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#8a8aaa",marginBottom:10,letterSpacing:.4,textTransform:"uppercase" }}>P&L Curve</div>
            <canvas ref={pnlCanvasRef} style={{ width:"100%", height:80, display:"block" }} />
          </div>
        </div>
      )}

      {resultInfo && (
        <div style={{ position:"fixed", inset:0, zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.78)", backdropFilter:"blur(16px)", animation:"fadeIn 0.3s ease" }}>
          <div style={{ background:"rgba(15,15,25,0.95)", border:"1px solid "+(resultInfo.won?"rgba(0,200,136,0.25)":"rgba(255,51,85,0.25)"), borderRadius:28, padding:"38px 44px", textAlign:"center", maxWidth:280, width:"90%", backdropFilter:"blur(20px)" }}>
            <div style={{ fontSize:13, fontWeight:900, letterSpacing:2, color:resultInfo.won?"#00cc88":"#ff3355", marginBottom:10, textTransform:"uppercase" }}>
              {resultInfo.allWon ? "Trade Won" : resultInfo.won ? "Partial Win" : "Trade Lost"}
            </div>
            <div style={{ fontSize:36, fontWeight:900, fontFamily:"monospace", marginBottom:8, color:resultInfo.pnl>=0?"#00cc88":"#ff3355" }}>
              {resultInfo.pnl>=0?"+":""}{resultInfo.pnl.toFixed(2)}$
            </div>
            <div style={{ fontSize:12, color:"#5a5a7a", marginBottom:22 }}>Closed at {resultInfo.close&&resultInfo.close.toFixed(2)}</div>
            <button onClick={function(){ setResultInfo(null); }} style={{ width:"100%", padding:"13px", borderRadius:13, border:"none", background:"linear-gradient(135deg,#00aa55,#00cc88)", color:"#000", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"sans-serif" }}>
              Trade Again
            </button>
          </div>
        </div>
      )}

    
    </div>
  );
}

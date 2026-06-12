import { useEffect, useRef, useState, useCallback } from "react";
import { sfx } from "./slotSounds";
import bgImg from "../../../assets/tomb-bg.jpg";
import raiderHero from "../../../assets/raider-hero.png";
import imgLara from "../../../assets/symbols/lara.png";
import imgIdol from "../../../assets/symbols/idol.png";
import imgChest from "../../../assets/symbols/chest.png";
import imgMap from "../../../assets/symbols/map.png";
import imgKey from "../../../assets/symbols/key.png";
import imgGem from "../../../assets/symbols/gem.png";
import imgTorch from "../../../assets/symbols/torch.png";
import imgRelic from "../../../assets/symbols/relic.png";
import imgWild from "../../../assets/symbols/wild.png";
import imgScat from "../../../assets/symbols/scat.png";

const SYMBOL_IMAGES = {
  lara: imgLara, idol: imgIdol, chest: imgChest, map: imgMap, key: imgKey,
  gem: imgGem, torch: imgTorch, relic: imgRelic, wild: imgWild, scat: imgScat,
};

const SYMBOLS = [
  { id: "lara",  glyph: "🗡️", label: "Explorer",    color: "#f5d97a", pay: [2, 10, 40],  weight: 3 },
  { id: "idol",  glyph: "🗿", label: "Idol",         color: "#c9a84c", pay: [2, 8,  30],  weight: 4 },
  { id: "chest", glyph: "🧰", label: "Chest",        color: "#d8a86b", pay: [1, 5,  20],  weight: 5 },
  { id: "map",   glyph: "📜", label: "Map",          color: "#e8c98a", pay: [1, 4,  15],  weight: 6 },
  { id: "key",   glyph: "🗝️", label: "Key",          color: "#e0b97f", pay: [1, 3,  12],  weight: 7 },
  { id: "gem",   glyph: "💎", label: "Emerald",      color: "#7be3b0", pay: [1, 3,  10],  weight: 7 },
  { id: "torch", glyph: "🔥", label: "Torch",        color: "#ff9650", pay: [1, 2,  8],   weight: 8 },
  { id: "relic", glyph: "🏺", label: "Relic",        color: "#caa07a", pay: [1, 2,  6],   weight: 9 },
  { id: "wild",  glyph: "✨", label: "Wild Idol",    color: "#ffe27a", pay: [3, 12, 35],  wild: true,    weight: 2 },
  { id: "scat",  glyph: "🛕", label: "Temple Gate",  color: "#9cd9ff", pay: [0, 0,  0],   scatter: true, weight: 1 },
];

const BY_ID = Object.fromEntries(SYMBOLS.map(s => [s.id, s]));
const WEIGHTED = SYMBOLS.flatMap(s => Array(s.weight).fill(s.id));
const pickWeighted = () => WEIGHTED[Math.floor(Math.random() * WEIGHTED.length)];

const ROWS = 3;
const COLS = 5;

const PAYLINES = [
  [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
  [0,0,1,2,2],[2,2,1,0,0],[1,0,1,2,1],[1,2,1,0,1],[0,1,1,1,2],
];

const BET_STEPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
const HOUSE_EDGE = 0.52;
const JACKPOTS = { mini: 2, minor: 3, major: 4, grand: 5 };
const FREE_SPINS_AWARD = { 3: 5, 4: 8, 5: 12 };
const FREE_SPINS_RETRIGGER = 3;
const MULT_TIERS = [1, 1, 2, 3];
const MULT_TIER_INTERVAL = 4;
const GAMBLE_MAX_ROUNDS = 3;

function currentFreeMult(total, remaining) {
  if (total <= 0) return 1;
  const used = Math.max(0, total - remaining);
  const idx = Math.min(MULT_TIERS.length - 1, Math.floor(used / MULT_TIER_INTERVAL));
  return MULT_TIERS[idx];
}

function emptyGrid() {
  return Array.from({ length: COLS }, () =>
    Array.from({ length: ROWS }, () => ({ sym: pickWeighted() }))
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function TombRaidersSlot({ balance, setBalance, onBack }) {
  const bgRef = useRef(null);
  const reelRef = useRef(null);
  const fxRef = useRef(null);
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const spinIntensityRef = useRef(0);

  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const [displayWin, setDisplayWin] = useState(0);
  const [grid, setGrid] = useState(() => emptyGrid());
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinsTotal, setFreeSpinsTotal] = useState(0);
  const multiplier = currentFreeMult(freeSpinsTotal, freeSpins);
  const [gamble, setGamble] = useState(null);
  const [gambleFlash, setGambleFlash] = useState(null);
  const winFlashRef = useRef(0);
  const winFlashTierRef = useRef("normal");
  const [winLines, setWinLines] = useState([]);
  const gridRef = useRef(grid);
  const winLinesRef = useRef(winLines);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { winLinesRef.current = winLines; }, [winLines]);
  const [celebration, setCelebration] = useState(null);
  const [paytableOpen, setPaytableOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  useEffect(() => { sfx.setMuted(muted); }, [muted]);

  /* ---------- Background canvas ---------- */
  useEffect(() => {
    const cv = bgRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf = 0, t = 0;
    const dust = [], fireflies = [], leaves = [], embers = [], drips = [];

    function resize() {
      const w = Math.round(window.innerWidth);
      const h = Math.round(window.innerHeight);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
    resize();
    let roRaf = 0;
    const onResize = () => { if (roRaf) return; roRaf = requestAnimationFrame(() => { roRaf = 0; resize(); }); };
    window.addEventListener("resize", onResize);

    function spawn() {
      const W = cv.width, H = cv.height;
      while (dust.length < 80) dust.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-0.5)*0.12, vy: -Math.random()*0.18-0.04, r: Math.random()*1.4+0.3, a: Math.random()*0.5+0.15, life: 0 });
      while (fireflies.length < 18) fireflies.push({ x: Math.random()*W, y: H*0.4+Math.random()*H*0.5, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.4, r: Math.random()*1.6+1, a: Math.random(), life: Math.random()*1000 });
      while (leaves.length < 14) leaves.push({ x: Math.random()*W, y: -20-Math.random()*H, vx: -Math.random()*0.4-0.1, vy: Math.random()*0.6+0.3, r: Math.random()*6+4, a: 1, life: Math.random()*6.28 });
      while (embers.length < 22) embers.push({ x: Math.random()*W, y: H-Math.random()*H*0.4, vx: (Math.random()-0.5)*0.3, vy: -Math.random()*0.6-0.2, r: Math.random()*1.6+0.5, a: 1, life: 0 });
      while (drips.length < 5) drips.push({ x: Math.random()*W, y: Math.random()*H*0.3, vx: 0, vy: Math.random()*0.4+0.3, r: 1.4, a: 1, life: 0 });
    }

    function drawBg(spin = 0) {
      const W = cv.width, H = cv.height;
      const parX = Math.sin(t*0.0025)*6*spin;
      ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.translate(parX, 0);
      const tint = ctx.createLinearGradient(0,0,0,H);
      tint.addColorStop(0,"rgba(11,26,14,0.18)"); tint.addColorStop(0.5,"rgba(26,18,8,0.10)"); tint.addColorStop(1,"rgba(10,7,3,0.30)");
      ctx.fillStyle = tint; ctx.fillRect(0,0,W,H);
      const gx=W/2, gy=H*0.72;
      const glow = ctx.createRadialGradient(gx,gy,4,gx,gy,220);
      glow.addColorStop(0,"rgba(255,180,80,0.25)"); glow.addColorStop(0.4,"rgba(220,120,40,0.08)"); glow.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.globalCompositeOperation="screen";
      for (let i=0;i<6;i++) {
        const a=(0.04+0.02*Math.sin(t*0.0008+i))*(1+spin*2.2);
        const x=W*(0.15+i*0.12)+Math.sin(t*0.0004+i)*10;
        ctx.fillStyle=`rgba(255,210,140,${a})`;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+60,0); ctx.lineTo(x+180,H); ctx.lineTo(x-60,H); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle="rgba(20,50,25,0.7)"; ctx.lineWidth=2;
      for (let i=0;i<12;i++) {
        const vx=(i/11)*W, len=40+Math.sin(i*1.7)*30+30;
        ctx.beginPath(); ctx.moveTo(vx,0);
        for (let y=0;y<len;y+=4) ctx.lineTo(vx+Math.sin((t*0.002)+i+y*0.1)*(4+spin*12),y);
        ctx.stroke();
      }
      ctx.save(); ctx.globalCompositeOperation="screen";
      const fog=ctx.createLinearGradient(0,H*0.55,0,H*0.85);
      fog.addColorStop(0,"rgba(120,140,110,0)"); fog.addColorStop(0.5,`rgba(140,160,130,${0.12+spin*0.2})`); fog.addColorStop(1,"rgba(80,90,70,0)");
      ctx.fillStyle=fog; ctx.translate(Math.sin(t*0.0004)*(30+spin*70),0); ctx.fillRect(-50,H*0.5,W+100,H*0.4); ctx.restore();
      ctx.restore();
    }

    function drawParticles(dt, spin=0) {
      const W=cv.width, H=cv.height, boost=1+spin*1.6;
      ctx.save(); ctx.globalCompositeOperation="screen";
      for (const p of dust) {
        p.x+=p.vx*boost; p.y+=p.vy*boost;
        if (p.y<-5){p.y=H+5;p.x=Math.random()*W;}
        ctx.fillStyle=`rgba(255,230,180,${Math.min(1,p.a*boost)})`;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.28); ctx.fill();
      }
      for (const f of fireflies) {
        f.life+=dt; f.x+=f.vx+Math.sin(f.life*0.003)*0.3; f.y+=f.vy+Math.cos(f.life*0.004)*0.2;
        if(f.x<0)f.x=W; if(f.x>W)f.x=0; if(f.y<H*0.35)f.y=H; if(f.y>H)f.y=H*0.35;
        const pulse=0.55+0.45*Math.sin(f.life*0.006);
        const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,8);
        g.addColorStop(0,`rgba(180,255,140,${pulse})`); g.addColorStop(1,"rgba(180,255,140,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(f.x,f.y,8,0,6.28); ctx.fill();
      }
      for (const e of embers) {
        e.x+=e.vx; e.y+=e.vy; e.a-=0.004;
        if(e.a<=0){e.x=Math.random()*W;e.y=H-Math.random()*H*0.3;e.a=1;e.vy=-Math.random()*0.6-0.2;}
        ctx.fillStyle=`rgba(255,${140+Math.random()*80|0},60,${e.a*0.85})`;
        ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,6.28); ctx.fill();
      }
      ctx.restore();
      for (const l of leaves) {
        l.x+=l.vx+Math.sin(l.life)*0.3; l.y+=l.vy; l.life+=0.02;
        if(l.y>H+10){l.y=-10;l.x=Math.random()*W+100;}
        ctx.save(); ctx.translate(l.x,l.y); ctx.rotate(l.life);
        ctx.fillStyle="rgba(120,160,80,0.7)"; ctx.beginPath(); ctx.ellipse(0,0,l.r,l.r*0.45,0,0,6.28); ctx.fill(); ctx.restore();
      }
      for (const d of drips) {
        d.y+=d.vy;
        if(d.y>H*0.6){d.y=Math.random()*H*0.2;d.x=Math.random()*W;}
        ctx.strokeStyle="rgba(170,210,255,0.6)"; ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x,d.y+5); ctx.stroke();
      }
    }

    let last = performance.now();
    function loop(now) {
      const dt = now-last; last=now; t+=dt;
      spawn(); spinIntensityRef.current*=0.985;
      const spin=spinIntensityRef.current;
      drawBg(spin); drawParticles(dt,spin);
      if (winFlashRef.current>0.01) {
        const W=cv.width,H=cv.height,intensity=winFlashRef.current,isJp=winFlashTierRef.current==="jackpot";
        ctx.save(); ctx.globalCompositeOperation="screen";
        const sweepX=((t*0.5)%(W+400))-200;
        const grad=ctx.createLinearGradient(sweepX-200,0,sweepX+200,0);
        const col=isJp?"255,230,150":"255,210,130";
        grad.addColorStop(0,`rgba(${col},0)`); grad.addColorStop(0.5,`rgba(${col},${0.18*intensity})`); grad.addColorStop(1,`rgba(${col},0)`);
        ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);
        if(isJp){ctx.fillStyle=`rgba(255,200,100,${0.06*intensity})`;ctx.fillRect(0,0,W,H);}
        ctx.restore(); winFlashRef.current*=isJp?0.992:0.985;
      }
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onResize);if(roRaf)cancelAnimationFrame(roRaf);};
  }, []);

  /* ---------- Reel canvas ---------- */
  const spinStateRef = useRef({ spinning:false, cols:[], targetGrid:emptyGrid(), onDone:null });
  const reelBoxRef = useRef({ w:0,h:0,dpr:1 });
  const fxBoxRef = useRef({ w:0,h:0,dpr:1 });

  useEffect(()=>{
    const cv=reelRef.current,fx=fxRef.current;
    if(!cv||!fx)return;
    const ctx=cv.getContext("2d"),fxc=fx.getContext("2d");
    let raf=0,t=0,last=performance.now();
    const imgCache={};
    for(const[id,src]of Object.entries(SYMBOL_IMAGES)){const im=new Image();im.src=src;imgCache[id]=im;}

    function resize(){
      const r=wrapRef.current.getBoundingClientRect();
      const w=Math.max(280,Math.min(Math.round(r.width-24),720));
      const h=Math.max(168,Math.min(Math.round(window.innerHeight*0.48),360));
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const targetW=Math.round(w*dpr),targetH=Math.round(h*dpr);
      const reelBox=reelBoxRef.current;
      if(cv.width!==targetW||cv.height!==targetH||reelBox.w!==w||reelBox.h!==h||reelBox.dpr!==dpr){
        cv.style.width=`${w}px`;cv.style.height=`${h}px`;cv.width=targetW;cv.height=targetH;
        reelBoxRef.current={w,h,dpr};ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      const fxCssW=Math.max(1,Math.round(r.width)),fxCssH=Math.max(1,Math.round(window.innerHeight));
      const fxW=Math.round(fxCssW*dpr),fxH=Math.round(fxCssH*dpr);
      const fxBox=fxBoxRef.current;
      if(fx.width!==fxW||fx.height!==fxH||fxBox.w!==fxCssW||fxBox.h!==fxCssH||fxBox.dpr!==dpr){
        fx.style.width=`${fxCssW}px`;fx.style.height=`${fxCssH}px`;fx.width=fxW;fx.height=fxH;
        fxBoxRef.current={w:fxCssW,h:fxCssH,dpr};fxc.setTransform(dpr,0,0,dpr,0,0);
      }
    }
    resize();
    let roRaf=0;
    const onResize=()=>{if(roRaf)return;roRaf=requestAnimationFrame(()=>{roRaf=0;resize();});};
    window.addEventListener("resize",onResize);

    function drawSymbol(x,y,w,h,sym,opts={}){
      const pad=4;
      const grad=ctx.createLinearGradient(x,y,x,y+h);
      grad.addColorStop(0,"#3a2e1c");grad.addColorStop(1,"#1c150a");
      ctx.fillStyle=grad;roundRect(ctx,x+pad,y+pad,w-pad*2,h-pad*2,8);ctx.fill();
      ctx.strokeStyle="rgba(212,170,80,0.55)";ctx.lineWidth=1.5;roundRect(ctx,x+pad,y+pad,w-pad*2,h-pad*2,8);ctx.stroke();
      if(opts.glow){
        const pulse=0.5+0.5*Math.sin(t*0.008);
        const g=ctx.createRadialGradient(x+w/2,y+h/2,4,x+w/2,y+h/2,w*0.7);
        g.addColorStop(0,`rgba(255,220,120,${0.45*pulse})`);g.addColorStop(1,"rgba(255,220,120,0)");
        ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
      }
      let idleDX=0,idleDY=0,idleScale=1,idleGlow=0;
      if(opts.idle&&!opts.glow){
        if(sym.id==="wild"){
          idleGlow=0.5+0.5*Math.sin(t*0.004);
          const rg=ctx.createRadialGradient(x+w/2,y+h/2,2,x+w/2,y+h/2,w*0.55);
          rg.addColorStop(0,`rgba(255,226,120,${0.25*idleGlow})`);rg.addColorStop(1,"rgba(255,226,120,0)");
          ctx.fillStyle=rg;ctx.fillRect(x,y,w,h);
          ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(t*0.0008);
          ctx.strokeStyle=`rgba(255,226,140,${0.35+0.2*idleGlow})`;ctx.lineWidth=1;
          ctx.beginPath();ctx.arc(0,0,Math.max(0,Math.min(w,h)*0.42),0,Math.PI*2);ctx.stroke();ctx.restore();
        } else if(sym.id==="lara"){
          idleDY=Math.sin(t*0.0025)*1.8;
        }
      }
      const shake=opts.shake||0;
      const sx=(shake?(Math.random()-0.5)*shake:0)+idleDX;
      const sy=(shake?(Math.random()-0.5)*shake:0)+idleDY;
      const im=imgCache[sym.id];
      if(im&&im.complete&&im.naturalWidth>0){
        const size=Math.min(w,h)*0.82*idleScale;
        ctx.shadowColor=sym.color;ctx.shadowBlur=opts.glow?22:10+idleGlow*8;
        ctx.drawImage(im,x+(w-size)/2+sx,y+(h-size)/2+sy,size,size);ctx.shadowBlur=0;
      } else {
        ctx.font=`${Math.floor(h*0.55)}px serif`;ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.shadowColor=sym.color;ctx.shadowBlur=opts.glow?18:8;ctx.fillStyle="#fff";
        ctx.fillText(sym.glyph,x+w/2+sx,y+h/2+sy+2);ctx.shadowBlur=0;
      }
    }

    function drawFrame(now){
      const dt=now-last;last=now;t+=dt;
      const{w:cssW,h:cssH}=reelBoxRef.current;
      if(!cssW||!cssH){raf=requestAnimationFrame(drawFrame);return;}
      ctx.clearRect(0,0,cssW,cssH);
      const frameGrad=ctx.createLinearGradient(0,0,0,cssH);
      frameGrad.addColorStop(0,"rgba(40,30,15,0.92)");frameGrad.addColorStop(1,"rgba(20,15,8,0.95)");
      ctx.fillStyle=frameGrad;roundRect(ctx,0,0,cssW,cssH,14);ctx.fill();
      const goldGrad=ctx.createLinearGradient(0,0,cssW,0);
      goldGrad.addColorStop(0,"#7a5a20");goldGrad.addColorStop(0.5,"#f0d878");goldGrad.addColorStop(1,"#7a5a20");
      ctx.strokeStyle=goldGrad;ctx.lineWidth=3;roundRect(ctx,1.5,1.5,cssW-3,cssH-3,13);ctx.stroke();
      const padX=16,padY=16,gridW=cssW-padX*2,gridH=cssH-padY*2,cellW=gridW/COLS,cellH=gridH/ROWS;
      ctx.fillStyle="rgba(0,0,0,0.35)";roundRect(ctx,padX,padY,gridW,gridH,8);ctx.fill();
      const st=spinStateRef.current;
      for(let c=0;c<COLS;c++){
        const colX=padX+c*cellW;
        ctx.save();ctx.beginPath();roundRect(ctx,colX,padY,cellW,gridH,6);ctx.clip();
        if(st.spinning&&!st.cols[c]?.stopped){
          const col=st.cols[c];col.offset+=col.vel*(dt/16.67);
          const strip=col.strip,total=strip.length*cellH;
          col.offset=((col.offset%total)+total)%total;
          for(let i=-1;i<ROWS+2;i++){
            const sIdx=Math.floor(((col.offset/cellH)+i))%strip.length;
            const sId=strip[(sIdx+strip.length)%strip.length];
            const sy=padY+i*cellH-(col.offset%cellH);
            drawSymbol(colX,sy,cellW,cellH,BY_ID[sId]);
          }
          ctx.fillStyle="rgba(20,15,8,0.18)";ctx.fillRect(colX,padY,cellW,gridH);
        } else {
          const sourceGrid=st.spinning?st.targetGrid:gridRef.current;
          const allStopped=!st.spinning;
          for(let r=0;r<ROWS;r++){
            const cell=sourceGrid[c][r],sym=BY_ID[cell.sym];
            const isWinning=winLinesRef.current.some(li=>PAYLINES[li][c]===r);
            drawSymbol(colX,padY+r*cellH,cellW,cellH,sym,{glow:isWinning,shake:isWinning?1.2:0,idle:allStopped&&!isWinning});
          }
        }
        ctx.restore();
      }
      {
        const flicker=0.85+0.15*Math.sin(t*0.012)+0.06*(Math.random()-0.5);
        const winGlow=winLinesRef.current.length>0?1:0.5;
        const pgL=ctx.createLinearGradient(0,0,padX,0);pgL.addColorStop(0,"rgba(80,60,32,0.65)");pgL.addColorStop(1,"rgba(80,60,32,0)");
        ctx.fillStyle=pgL;ctx.fillRect(0,padY,padX,gridH);
        const pgR=ctx.createLinearGradient(cssW-padX,0,cssW,0);pgR.addColorStop(0,"rgba(80,60,32,0)");pgR.addColorStop(1,"rgba(80,60,32,0.65)");
        ctx.fillStyle=pgR;ctx.fillRect(cssW-padX,padY,padX,gridH);
        const drawTorch=(tx,ty)=>{
          ctx.save();ctx.globalCompositeOperation="screen";
          const g=ctx.createRadialGradient(tx,ty,1,tx,ty,26);
          g.addColorStop(0,`rgba(255,200,110,${0.55*flicker})`);g.addColorStop(0.4,`rgba(255,140,60,${0.28*flicker})`);g.addColorStop(1,"rgba(255,80,20,0)");
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(tx,ty,26,0,Math.PI*2);ctx.fill();ctx.restore();
          ctx.fillStyle=`rgba(255,235,170,${0.9*flicker})`;ctx.beginPath();ctx.ellipse(tx,ty-1,2.5,5,0,0,Math.PI*2);ctx.fill();
        };
        drawTorch(padX-1,padY+1);drawTorch(cssW-padX+1,padY+1);
        const runePulse=winLinesRef.current.length?0.5+0.5*Math.sin(t*0.012):0.35;
        ctx.fillStyle=`rgba(255,216,102,${runePulse*winGlow})`;
        ctx.beginPath();ctx.arc(padX-1,cssH-padY-1,3,0,Math.PI*2);ctx.arc(cssW-padX+1,cssH-padY-1,3,0,Math.PI*2);ctx.fill();
      }
      const wl=winLinesRef.current;
      if(wl.length){
        ctx.save();
        for(const li of wl){
          const line=PAYLINES[li];
          const colors=["#ffd866","#76f0c0","#ffa3a3","#9ab8ff","#c89aff","#ffbf69","#69ffb1","#ff8aa1","#a3d8ff","#ffe27a"];
          ctx.strokeStyle=colors[li%colors.length];ctx.lineWidth=3;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=10;
          ctx.beginPath();
          for(let c=0;c<COLS;c++){const x=padX+c*cellW+cellW/2,y=padY+line[c]*cellH+cellH/2;if(c===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
          ctx.stroke();
        }
        ctx.restore();
      }
      raf=requestAnimationFrame(drawFrame);
    }
    raf=requestAnimationFrame(drawFrame);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onResize);if(roRaf)cancelAnimationFrame(roRaf);};
  },[]);

  /* ---------- FX canvas ---------- */
  const fxParticlesRef=useRef([]);
  const shockwavesRef=useRef([]);
  const celebFxRef=useRef(null);
  const confettiRef=useRef([]);
  const sparkleRef=useRef([]);

  function spawnConfetti(W,count,palette){
    const arr=confettiRef.current;
    for(let i=0;i<count;i++) arr.push({x:Math.random()*W,y:-20-Math.random()*60,vx:(Math.random()-0.5)*2.4,vy:2+Math.random()*3,rot:Math.random()*6.28,vr:(Math.random()-0.5)*0.25,size:5+Math.random()*6,color:palette[Math.floor(Math.random()*palette.length)],life:0,max:3200+Math.random()*1800});
  }

  useEffect(()=>{
    const fx=fxRef.current;if(!fx)return;
    const ctx=fx.getContext("2d");let raf=0,last=performance.now();
    function loop(now){
      const dt=now-last;last=now;
      const{w:W,h:H}=fxBoxRef.current;
      if(!W||!H){raf=requestAnimationFrame(loop);return;}
      ctx.clearRect(0,0,W,H);
      const celeb=celebFxRef.current;
      if(celeb){
        const elapsed=now-celeb.startedAt,p=Math.min(1,elapsed/celeb.duration);
        const isJackpot=["mini","minor","major","grand"].includes(celeb.tier);
        const cx=celeb.cx,cy=celeb.cy;
        ctx.save();ctx.globalCompositeOperation="screen";
        const rayCount=isJackpot?18:12,rayLen=Math.max(W,H);
        const rayAlpha=(isJackpot?0.22:0.14)*(1-p*0.6);
        ctx.translate(cx,cy);ctx.rotate((elapsed/1000)*(isJackpot?0.9:0.5));
        for(let i=0;i<rayCount;i++){
          const a=(i/rayCount)*Math.PI*2;
          const col=isJackpot?["#ffd866","#7be3b0","#9adfff","#ffb37a"][i%4]:"#ffd866";
          const grad=ctx.createLinearGradient(0,0,Math.cos(a)*rayLen,Math.sin(a)*rayLen);
          grad.addColorStop(0,`${col}${Math.floor(rayAlpha*255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(1,`${col}00`);
          ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,0);
          ctx.lineTo(Math.cos(a-0.06)*rayLen,Math.sin(a-0.06)*rayLen);
          ctx.lineTo(Math.cos(a+0.06)*rayLen,Math.sin(a+0.06)*rayLen);
          ctx.closePath();ctx.fill();
        }
        ctx.restore();
        const ringPeriod=isJackpot?450:700,ringMax=isJackpot?4:2;
        ctx.save();ctx.globalCompositeOperation="screen";
        for(let i=0;i<ringMax;i++){
          const phase=((elapsed+i*(ringPeriod/ringMax))%ringPeriod)/ringPeriod;
          const r=phase*(isJackpot?380:220);
          const a=(1-phase)*(isJackpot?0.7:0.45)*(1-p*0.7);
          ctx.strokeStyle=isJackpot?`rgba(255,216,102,${a})`:`rgba(255,210,120,${a})`;
          ctx.lineWidth=isJackpot?3:2;ctx.beginPath();ctx.arc(cx,cy,r,0,6.28);ctx.stroke();
        }
        ctx.restore();
        if(Math.random()<(isJackpot?0.6:0.3)&&p<0.85){
          const ang=Math.random()*6.28,dist=60+Math.random()*180;
          sparkleRef.current.push({x:cx+Math.cos(ang)*dist,y:cy+Math.sin(ang)*dist*0.7,born:now,life:700+Math.random()*500,size:2+Math.random()*3,color:isJackpot?["#fff6c8","#ffd866","#7be3b0","#9adfff"][Math.floor(Math.random()*4)]:"#fff6c8"});
        }
        if(elapsed>=celeb.duration)celebFxRef.current=null;
      }
      const sparks=sparkleRef.current;
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i],age=now-s.born;
        if(age>s.life){sparks.splice(i,1);continue;}
        const a=1-age/s.life,r=s.size*(1+age/s.life);
        ctx.save();ctx.globalCompositeOperation="screen";ctx.fillStyle=s.color;ctx.globalAlpha=a;ctx.shadowColor=s.color;ctx.shadowBlur=12;
        ctx.beginPath();ctx.moveTo(s.x,s.y-r*2);ctx.lineTo(s.x+r*0.6,s.y-r*0.6);ctx.lineTo(s.x+r*2,s.y);ctx.lineTo(s.x+r*0.6,s.y+r*0.6);ctx.lineTo(s.x,s.y+r*2);ctx.lineTo(s.x-r*0.6,s.y+r*0.6);ctx.lineTo(s.x-r*2,s.y);ctx.lineTo(s.x-r*0.6,s.y-r*0.6);ctx.closePath();ctx.fill();ctx.restore();
      }
      const conf=confettiRef.current;
      for(let i=conf.length-1;i>=0;i--){
        const c=conf[i];c.life+=dt;c.x+=c.vx*(dt/16.67);c.y+=c.vy*(dt/16.67);c.vy+=0.04;c.rot+=c.vr;
        if(c.life>c.max||c.y>H+30){conf.splice(i,1);continue;}
        const a=1-c.life/c.max;
        ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.globalAlpha=a;ctx.fillStyle=c.color;ctx.fillRect(-c.size/2,-c.size/4,c.size,c.size/2);ctx.restore();
      }
      const parts=fxParticlesRef.current;
      for(let i=parts.length-1;i>=0;i--){
        const p=parts[i];p.life+=dt;p.x+=p.vx*(dt/16.67);p.y+=p.vy*(dt/16.67);p.vy+=0.35;
        if(p.life>p.max){parts.splice(i,1);continue;}
        const a=1-p.life/p.max;
        if(p.kind==="coin"||p.kind==="gem"){
          const isGem=p.kind==="gem";
          ctx.fillStyle=isGem?`rgba(123,227,176,${a})`:`rgba(255,210,90,${a})`;
          ctx.shadowColor=isGem?"#7be3b0":"#ffcc55";ctx.shadowBlur=isGem?16:10;
          ctx.beginPath();
          if(isGem){ctx.moveTo(p.x,p.y-p.size);ctx.lineTo(p.x+p.size,p.y);ctx.lineTo(p.x,p.y+p.size);ctx.lineTo(p.x-p.size,p.y);ctx.closePath();}
          else ctx.arc(p.x,p.y,p.size,0,6.28);
          ctx.fill();ctx.shadowBlur=0;
        } else {ctx.fillStyle=`rgba(255,230,160,${a})`;ctx.fillRect(p.x,p.y,p.size,p.size);}
      }
      const sw=shockwavesRef.current;
      for(let i=sw.length-1;i>=0;i--){
        const s=sw[i];s.r+=dt*0.6;s.a-=dt*0.0015;
        if(s.a<=0||s.r>s.max){sw.splice(i,1);continue;}
        ctx.strokeStyle=s.color?s.color.replace("ALPHA",String(s.a)):`rgba(255,220,120,${s.a})`;
        ctx.lineWidth=s.width??3;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.stroke();
      }
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);

  function burstCoins(cx,cy,n=40){
    const arr=fxParticlesRef.current;
    for(let i=0;i<n;i++){const ang=Math.random()*6.28,sp=4+Math.random()*8;arr.push({x:cx,y:cy,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-4,life:0,max:1200+Math.random()*600,size:3+Math.random()*3,color:"gold",kind:"coin"});}
    shockwavesRef.current.push({x:cx,y:cy,r:4,max:220,a:0.9});
  }

  function burstJackpot(cx,cy,tier){
    const arr=fxParticlesRef.current;
    const power=tier==="grand"?170:tier==="major"?130:tier==="minor"?95:75;
    for(let i=0;i<power;i++){const ang=Math.random()*6.28,sp=5+Math.random()*(tier==="grand"?13:10);arr.push({x:cx,y:cy,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-5,life:0,max:1700+Math.random()*1000,size:3+Math.random()*6,color:"gold",kind:i%4===0?"gem":"coin"});}
    shockwavesRef.current.push({x:cx,y:cy,r:4,max:520,a:1,color:"rgba(255,216,102,ALPHA)",width:5});
    shockwavesRef.current.push({x:cx,y:cy,r:20,max:700,a:0.85,color:"rgba(123,227,176,ALPHA)",width:3});
    shockwavesRef.current.push({x:cx,y:cy,r:42,max:860,a:0.7,color:"rgba(154,184,255,ALPHA)",width:2});
  }

  /* ---------- Win count-up ---------- */
  useEffect(()=>{
    if(win===displayWin)return;
    const start=displayWin,end=win,dur=Math.min(1800,600+Math.abs(end-start)*1.5),t0=performance.now();
    let raf=0;
    function step(now){const p=Math.min(1,(now-t0)/dur),eased=1-Math.pow(1-p,3);setDisplayWin(Math.round(start+(end-start)*eased));if(p<1)raf=requestAnimationFrame(step);}
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[win]); // eslint-disable-line

  /* ---------- Evaluate wins ---------- */
  function evaluate(g){
    const lines=[];let totalMult=0,jackpot=null;
    const jackpotRank={mini:1,minor:2,major:3,grand:4};
    const setJackpot=(tier)=>{if(!jackpot||jackpotRank[tier]>jackpotRank[jackpot])jackpot=tier;};
    PAYLINES.forEach((line,idx)=>{
      const firstSymId=(()=>{
        const s=g[0][line[0]].sym;
        if(s==="scat")return null;
        if(s==="wild"){for(let c=1;c<COLS;c++){const x=g[c][line[c]].sym;if(x!=="wild"&&x!=="scat")return x;}return"wild";}
        return s;
      })();
      if(!firstSymId)return;
      let matches=1;
      for(let c=1;c<COLS;c++){const s=g[c][line[c]].sym;if(s===firstSymId||s==="wild")matches++;else break;}
      if(matches>=3){
        const sym=BY_ID[firstSymId],m=sym.pay[matches-3];
        if(m>0){totalMult+=m;lines.push(idx);}
        if(matches===5){
          if(firstSymId==="wild")setJackpot("grand");
          else if(firstSymId==="lara")setJackpot("major");
          else if(firstSymId==="idol")setJackpot("minor");
          else setJackpot("mini");
        }
      }
    });
    let scatters=0;
    for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++)if(g[c][r].sym==="scat")scatters++;
    if(scatters>=5)setJackpot("minor");
    return{totalMult,lines,scatters,jackpot};
  }

  /* ---------- Spin ---------- */
  const spin=useCallback(()=>{
    if(spinning||gamble)return;
    if(freeSpins===0&&balance<bet)return;
    setCelebration(null);setWinLines([]);
    if(freeSpins>0){setFreeSpins(f=>f-1);}else{setBalance(b=>b-bet);}
    setSpinning(true);sfx.spinStart();spinIntensityRef.current=1;
    const target=Array.from({length:COLS},()=>Array.from({length:ROWS},()=>({sym:pickWeighted()})));
    const roll=Math.random();
    if(roll<0.04){const rows=[0,1,2];const cols=[0,1,2,3,4].sort(()=>Math.random()-0.5).slice(0,3);cols.forEach(c=>{target[c][rows[Math.floor(Math.random()*3)]].sym="scat";});}
    else if(roll<0.12){const sId=["key","map","gem"][Math.floor(Math.random()*3)];target[0][1].sym=sId;target[1][1].sym=sId;target[2][1].sym=sId;}
    else if(roll<0.34){const sId=["torch","relic"][Math.floor(Math.random()*2)];target[0][1].sym=sId;target[1][1].sym=sId;target[2][1].sym=sId;}
    const st=spinStateRef.current;
    st.targetGrid=target;
    st.cols=Array.from({length:COLS},()=>({offset:0,vel:22+Math.random()*6,strip:Array.from({length:24},()=>pickWeighted()),stopAt:0,stopped:false}));
    st.spinning=true;
    const baseDur=turbo?320:850,stagger=turbo?90:230;
    let scatterSoFar=0;
    for(let c=0;c<COLS-1;c++)for(let r=0;r<ROWS;r++)if(target[c][r].sym==="scat")scatterSoFar++;
    const lastReelHasScat=target[COLS-1].some(cell=>cell.sym==="scat");
    const teaseExtra=scatterSoFar>=2&&!lastReelHasScat?600:0;
    st.cols.forEach((col,idx)=>{
      const extra=idx===COLS-1?teaseExtra:0;
      if(extra)setTimeout(()=>sfx.tease(),baseDur+idx*stagger);
      setTimeout(()=>{
        for(let r=0;r<ROWS;r++)col.strip[r]=target[idx][r].sym;
        col.offset=0;col.vel=0;col.stopped=true;sfx.reelStop(idx);
        if(idx===COLS-1)sfx.allReelsStopped();
        if(extra){const stage=stageRef.current;if(stage){stage.classList.add("tease");setTimeout(()=>stage.classList.remove("tease"),extra);}}
      },baseDur+idx*stagger+extra);
    });
    setTimeout(()=>{
      st.spinning=false;spinIntensityRef.current=0.25;setGrid(target);
      const ev=evaluate(target);
      const activeMult=currentFreeMult(freeSpinsTotal,Math.max(0,freeSpins-(freeSpins>0?1:0)));
      const lineWin=ev.lines.length?Math.max(1,Math.floor(ev.totalMult*bet*activeMult*HOUSE_EDGE)):0;
      const jackpotWin=ev.jackpot?Math.floor(JACKPOTS[ev.jackpot]*bet):0;
      const totalWin=lineWin+jackpotWin;
      if(totalWin>0){
        setWinLines(ev.lines);setWin(totalWin);setBalance(b=>b+totalWin);
        const ratio=totalWin/bet;
        let label=null;
        if(ev.jackpot)label={label:`${ev.jackpot.toUpperCase()} JACKPOT`,amount:jackpotWin,tier:ev.jackpot};
        else if(ratio>=50)label={label:"EPIC WIN",amount:totalWin,tier:"epic"};
        else if(ratio>=20)label={label:"MEGA WIN",amount:totalWin,tier:"mega"};
        else if(ratio>=8)label={label:"BIG WIN",amount:totalWin,tier:"big"};
        if(ev.jackpot)sfx.jackpot(ev.jackpot);
        else if(ratio>=50)sfx.win("epic");
        else if(ratio>=20)sfx.win("mega");
        else if(ratio>=8)sfx.win("big");
        else sfx.win("small");
        winFlashRef.current=ev.jackpot?1:0.6;winFlashTierRef.current=ev.jackpot?"jackpot":"normal";
        if(label){
          setCelebration(label);
          const fxBox=fxBoxRef.current;
          const cx=fxBox.w/2,cy=Math.min(fxBox.h*0.48,window.innerHeight*0.5);
          const isJp=!!ev.jackpot,duration=isJp?3600:label.tier==="epic"?2800:2400;
          celebFxRef.current={tier:label.tier,startedAt:performance.now(),duration,cx,cy};
          if(isJp){
            burstJackpot(cx,cy,label.tier);
            const palette=label.tier==="grand"?["#ffd866","#7be3b0","#9adfff","#ffb37a","#fff6c8","#c89aff"]:["#ffd866","#fff6c8","#ffb37a"];
            spawnConfetti(fxBox.w,label.tier==="grand"?140:90,palette);
            setTimeout(()=>burstJackpot(cx-80,cy+40,label.tier),350);
            setTimeout(()=>burstJackpot(cx+80,cy+40,label.tier),700);
            if(label.tier==="grand")setTimeout(()=>burstJackpot(cx,cy-60,label.tier),1050);
          } else {
            burstCoins(cx,cy,label.tier==="epic"?90:label.tier==="mega"?60:40);
            if(label.tier==="epic"||label.tier==="mega")spawnConfetti(fxBox.w,label.tier==="epic"?70:40,["#ffd866","#fff6c8","#ffb37a"]);
          }
          const stage=stageRef.current;if(stage){stage.classList.add("shake");setTimeout(()=>stage.classList.remove("shake"),ev.jackpot?900:600);}
          setTimeout(()=>setCelebration(null),ev.jackpot?3600:2600);
        } else {
          const fxBox=fxBoxRef.current;burstCoins(fxBox.w/2,Math.min(fxBox.h*0.5,window.innerHeight*0.52),20);
        }
        if(!ev.jackpot&&freeSpins===0){
          const offerAmt=totalWin;setGamble({amount:offerAmt,round:0});
          setTimeout(()=>{setGamble(g=>(g&&g.round===0?null:g));},5000);
        }
      }
      if(ev.scatters>=3){
        const isRetrigger=freeSpins>0||freeSpinsTotal>0;
        const fs=isRetrigger?FREE_SPINS_RETRIGGER:(FREE_SPINS_AWARD[ev.scatters]||10);
        setFreeSpins(f=>f+fs);setFreeSpinsTotal(t=>t+fs);
        setCelebration({label:isRetrigger?`+${fs} FREE SPINS!`:`${fs} FREE SPINS!`,tier:"free"});
        sfx.freeSpins();
        const fxBox=fxBoxRef.current;const cx=fxBox.w/2,cy=Math.min(fxBox.h*0.5,window.innerHeight*0.52);
        celebFxRef.current={tier:"free",startedAt:performance.now(),duration:2400,cx,cy};
        burstCoins(cx,cy,60);spawnConfetti(fxBox.w,60,["#ffb37a","#ffd866","#fff6c8"]);
        setTimeout(()=>setCelebration(null),2600);
      }
      setSpinning(false);
    },baseDur+COLS*stagger+200);
  },[spinning,balance,bet,turbo,freeSpins,freeSpinsTotal,gamble]);

  /* Auto spin */
  useEffect(()=>{
    if(!autoSpin||spinning||gamble)return;
    if(freeSpins===0&&balance<bet){setAutoSpin(false);return;}
    const t=setTimeout(spin,600);return()=>clearTimeout(t);
  },[autoSpin,spinning,balance,bet,freeSpins,spin,gamble]);

  useEffect(()=>{if(freeSpins===0)setFreeSpinsTotal(0);},[freeSpins]);

  const resolveGamble=useCallback((pick)=>{
    if(!gamble)return;sfx.gamblePick();
    const result=Math.random()<0.5?"red":"black";const wonRound=pick===result;
    if(wonRound){
      const doubled=gamble.amount*2,delta=doubled-gamble.amount;
      setBalance(b=>b+delta);setWin(doubled);setGambleFlash("win");sfx.gambleWin();
      const nextRound=gamble.round+1;
      if(nextRound>=GAMBLE_MAX_ROUNDS){setTimeout(()=>{setGamble(null);setGambleFlash(null);},900);}
      else setTimeout(()=>{setGamble({amount:doubled,round:nextRound});setGambleFlash(null);},700);
    } else {
      setBalance(b=>b-gamble.amount);setWin(0);setGambleFlash("lose");sfx.gambleLose();
      setTimeout(()=>{setGamble(null);setGambleFlash(null);},1000);
    }
  },[gamble]);

  const collectGamble=useCallback(()=>{sfx.coin();setGamble(null);setGambleFlash(null);},[]);

  function adjBet(d){
    sfx.betChange();
    setBet(b=>{
      const idx=BET_STEPS.indexOf(b);
      if(idx===-1){const nearest=BET_STEPS.reduce((prev,cur)=>Math.abs(cur-b)<Math.abs(prev-b)?cur:prev);return Math.min(nearest,balance);}
      const nextIdx=Math.max(0,Math.min(BET_STEPS.length-1,idx+d));
      return Math.min(BET_STEPS[nextIdx],balance);
    });
  }

  return (
    <div ref={wrapRef} className={"tr-root"+(freeSpins>0?" in-free":"")}
      style={{ backgroundImage:`linear-gradient(180deg,rgba(10,7,3,0.15),rgba(10,7,3,0.35)),url(${bgImg})`, backgroundSize:"cover", backgroundPosition:"center", backgroundRepeat:"no-repeat" }}>
      <style>{SLOT_CSS}</style>
      <canvas ref={bgRef} className="tr-bg"/>
      <canvas ref={fxRef} className="tr-fx"/>
      <img src={raiderHero} alt="Tomb raider" className={"tr-hero"+(spinning?" spinning":"")} loading="lazy"/>

      <div className="tr-ui">
        <header className="tr-top">
          <button onClick={onBack} style={{ background:"rgba(212,170,80,0.15)", border:"1px solid rgba(212,170,80,0.4)", color:"#f0d878", fontSize:14, cursor:"pointer", borderRadius:8, padding:"6px 14px", fontFamily:"'Cinzel',serif", letterSpacing:2 }}>‹ BACK</button>
          <div className="tr-jpots">
 <div className="jp mini"><span>50X</span><b>50x</b></div>
<div className="jp minor"><span>100X</span><b>100x</b></div>
<div className="jp major"><span>150X</span><b>150x</b></div>
<div className="jp grand"><span>200X</span><b>200x</b></div>
          </div>
          <h1 className="tr-title">⚱ Tomb Raiders ⚱</h1>
          <div className="tr-bal"><span>BALANCE</span><b>৳{balance.toLocaleString()}</b></div>
        </header>

        <div ref={stageRef} className="tr-stage">
          <canvas ref={reelRef} className="tr-reels"/>
          {freeSpins>0&&(
            <div className="tr-fs-banner">
              <span>FREE SPINS</span>
              <b>{freeSpins}{freeSpinsTotal>0?`/${freeSpinsTotal}`:""}</b>
              <em className={"mult mult-"+multiplier}>×{multiplier}</em>
            </div>
          )}
        </div>

        <div className="tr-win-layer" aria-live="polite" aria-atomic="true">
          {celebration&&(
            <div className={`tr-bigwin ${["mini","minor","major","grand"].includes(celebration.tier)?"jackpot":`tier-${celebration.tier}`}`}>
              <span>{celebration.label}</span>
              {celebration.amount?<b>৳{celebration.amount.toLocaleString()}</b>:null}
            </div>
          )}
          {gamble&&(
            <div className={"tr-gamble"+(gambleFlash?` flash-${gambleFlash}`:"")}>
              <div className="tr-gamble-card">
                <div className="tg-h">DOUBLE OR NOTHING</div>
                <div className="tg-amt"><span>CURRENT WIN</span><b>৳{gamble.amount.toLocaleString()}</b></div>
                <div className="tg-row">
                  <div className="tg-side"><span>WIN</span><b>৳{(gamble.amount*2).toLocaleString()}</b></div>
                  <div className="tg-vs">vs</div>
                  <div className="tg-side lose"><span>LOSE</span><b>৳0</b></div>
                </div>
                <div className="tg-picks">
                  <button className="tg-pick red" onClick={()=>resolveGamble("red")} disabled={!!gambleFlash}>♥ RED</button>
                  <button className="tg-pick black" onClick={()=>resolveGamble("black")} disabled={!!gambleFlash}>♠ BLACK</button>
                </div>
                <button className="tg-collect" onClick={collectGamble} disabled={!!gambleFlash}>COLLECT ৳{gamble.amount.toLocaleString()}</button>
                <div className="tg-meta">Round {gamble.round+1} / {GAMBLE_MAX_ROUNDS}</div>
              </div>
              {gambleFlash&&<div className={"tg-result "+gambleFlash}>{gambleFlash==="win"?"DOUBLED!":"LOST"}</div>}
            </div>
          )}
        </div>

        <div className="tr-controls">
          <div className="ctrl">
            <span className="ctrl-l">BET</span>
            <b className="ctrl-v">৳{bet}</b>
            <div className="ctrl-adj">
              <button onClick={()=>adjBet(-1)} disabled={spinning||bet<=BET_STEPS[0]}>−</button>
              <button onClick={()=>adjBet(1)} disabled={spinning||bet>=Math.min(BET_STEPS[BET_STEPS.length-1],balance)}>+</button>
            </div>
          </div>
          <div className="spin-zone">
            <button className={"spin-btn"+(spinning?" spinning":"")} onClick={spin} disabled={spinning||(freeSpins===0&&balance<bet)} aria-label="Spin">
              <span className="ring"/>
              <span className="core">{spinning?"…":freeSpins>0?"FREE":"SPIN"}</span>
            </button>
            <div className="spin-toggles">
              <button className={"tog"+(autoSpin?" on":"")} onClick={()=>{sfx.toggle();setAutoSpin(a=>!a);}}>AUTO</button>
              <button className={"tog"+(turbo?" on":"")} onClick={()=>{sfx.toggle();setTurbo(t=>!t);}}>TURBO</button>
              <button className={"tog"+(muted?" on":"")} onClick={()=>setMuted(m=>!m)}>{muted?"🔇":"🔊"}</button>
            </div>
          </div>
          <div className="ctrl">
            <span className="ctrl-l">WIN</span>
            <b className="ctrl-v win">৳{displayWin.toLocaleString()}</b>
            <div className="ctrl-sub">Lines: {winLines.length}</div>
          </div>
        </div>

        <div className="tr-quickbets">
          {BET_STEPS.map(b=>(
            <button key={b} className={"qb"+(bet===b?" active":"")} disabled={spinning||b>balance} onClick={()=>{if(!spinning&&b<=balance){sfx.betChange();setBet(b);}}}>৳{b}</button>
          ))}
          <button className="qb pt" onClick={()=>{sfx.click();setPaytableOpen(o=>!o);}}>{paytableOpen?"Hide":"Paytable"}</button>
          <button className="qb pt" onClick={()=>{sfx.click();setRulesOpen(o=>!o);setPaytableOpen(false);}}>{rulesOpen?"Hide":"Rules"}</button>
        </div>

        {paytableOpen&&(
          <div className="tr-paytable">
            {SYMBOLS.map(s=>(
              <div key={s.id} className="pt-row">
                <span className="pt-g" style={{color:s.color}}>
                  <img src={SYMBOL_IMAGES[s.id]} alt={s.label} loading="lazy" style={{width:28,height:28,objectFit:"contain",filter:`drop-shadow(0 0 6px ${s.color})`}}/>
                </span>
                <span className="pt-n">{s.label}{s.wild?" (Wild)":s.scatter?" (Scatter)":""}</span>
                <span className="pt-p">{s.scatter?"3+ trigger Free Spins":`3×${s.pay[0]} · 4×${s.pay[1]} · 5×${s.pay[2]}`}</span>
              </div>
            ))}
          </div>
        )}

        {rulesOpen&&(
          <div className="tr-panel">
            <h3 className="tr-panel-h">How to Play</h3>
            <ul className="tr-rules">
              <li><b>Reels & Lines:</b> 5 reels × 3 rows with 10 fixed paylines left-to-right.</li>
              <li><b>Wild Idol:</b> Substitutes for all symbols except Scatter.</li>
              <li><b>Scatter:</b> 3→10 Free Spins, 4→15, 5→25.</li>
              <li><b>Free Spins Multiplier:</b> ×1→×2→×3→×5 every {MULT_TIER_INTERVAL} free spins.</li>
              <li><b>Gamble:</b> Double or nothing after any base-game win. Up to {GAMBLE_MAX_ROUNDS} rounds.</li>
              <li><b>Jackpots:</b> 5 lower symbols→Mini, 5 Idols→Minor, 5 Explorers→Major, 5 Wilds→Grand.</li>
            <li><b>Jackpots:</b> Land 5 matching top symbols to trigger bonus prizes.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const SLOT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@700&display=swap');
.tr-root{position:relative;width:100%;min-height:100vh;background:#0a0703;overflow:hidden;font-family:'Cinzel',serif;color:#f4e8c8}
.tr-bg{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0}
.tr-hero{position:fixed;right:1%;bottom:1%;height:28%;max-height:260px;width:auto;z-index:6;pointer-events:none;opacity:.85;filter:drop-shadow(0 0 20px rgba(255,180,80,.55)) drop-shadow(0 6px 20px rgba(0,0,0,.7));animation:heroFloat 6s ease-in-out infinite}
.tr-hero.spinning{transform:translateY(-6px) scale(1.03);opacity:1}
@keyframes heroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@media(max-width:900px){.tr-hero{height:18%;opacity:.55;right:0;bottom:0}}
.tr-fx{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:3;pointer-events:none}
.tr-ui{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;padding:10px 12px 18px;gap:8px;min-height:100vh}
.tr-top{width:100%;max-width:760px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}
.tr-jpots{display:flex;gap:5px}
.jp{display:flex;flex-direction:column;align-items:center;padding:3px 8px;border-radius:8px;min-width:52px;font-size:7px;letter-spacing:2px}
.jp.mini{background:rgba(180,100,20,.25);border:1px solid rgba(220,150,60,.4)}
.jp.minor{background:rgba(180,180,20,.25);border:1px solid rgba(220,220,60,.4)}
.jp.major{background:rgba(20,160,100,.25);border:1px solid rgba(60,220,150,.4)}
.jp.grand{background:rgba(100,20,180,.25);border:1px solid rgba(150,60,220,.4)}
.jp span{color:rgba(240,208,120,.65);font-size:6px;letter-spacing:2px}
.jp b{color:#f0d878;font-size:11px;letter-spacing:1px}
.tr-title{font-family:'Cinzel Decorative',serif;font-size:16px;letter-spacing:4px;color:#f0d878;text-shadow:0 0 14px rgba(255,200,100,.5);text-align:center}
.tr-bal{display:flex;flex-direction:column;align-items:flex-end}
.tr-bal span{font-size:7px;letter-spacing:3px;color:rgba(240,208,120,.6)}
.tr-bal b{font-size:16px;color:#fff;letter-spacing:1px}
.tr-stage{position:relative;width:100%;max-width:760px}
.tr-reels{display:block;border-radius:14px}
.tr-fs-banner{position:absolute;top:8px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;background:rgba(10,6,2,.85);border:1px solid rgba(212,170,80,.5);border-radius:20px;padding:4px 14px;font-size:11px;letter-spacing:2px;white-space:nowrap}
.tr-fs-banner b{color:#ffd866;font-size:15px}
.tr-fs-banner .mult{padding:1px 6px;border-radius:6px;background:rgba(255,180,60,.18);border:1px solid rgba(255,216,102,.45);font-size:12px}
.tr-fs-banner .mult-2{color:#ffd866}
.tr-fs-banner .mult-3{color:#7be3b0}
.tr-fs-banner .mult-5{color:#fff6c8;animation:multMax 1s ease-in-out infinite}
@keyframes multMax{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35)}}
.tr-win-layer{position:relative;width:100%;max-width:760px;min-height:50px;display:flex;align-items:center;justify-content:center}
.tr-bigwin{font-family:'Cinzel Decorative',serif;font-size:38px;letter-spacing:6px;text-align:center;animation:bigWinIn .4s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column;align-items:center;gap:4px}
@keyframes bigWinIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
.tr-bigwin.tier-big{color:#ffd866;text-shadow:0 0 24px rgba(255,216,102,.8)}
.tr-bigwin.tier-mega{color:#7be3b0;text-shadow:0 0 28px rgba(123,227,176,.9)}
.tr-bigwin.tier-epic{color:#fff;text-shadow:0 0 32px rgba(255,255,255,.9),0 0 60px rgba(255,200,100,.7)}
.tr-bigwin.tier-free{color:#ffa040;text-shadow:0 0 22px rgba(255,160,64,.8)}
.tr-bigwin.jackpot{color:#ffd866;text-shadow:0 0 30px rgba(255,216,102,1),0 0 60px rgba(255,160,60,.8)}
.tr-bigwin b{font-size:24px;color:#fff;text-shadow:0 0 12px currentColor}
.tr-controls{width:100%;max-width:760px;display:flex;align-items:center;gap:8px;padding:0 4px}
.ctrl{flex:1;background:linear-gradient(180deg,rgba(30,20,8,.85),rgba(15,10,4,.85));border:1px solid rgba(212,170,80,.35);border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0}
.ctrl-l{font-size:8px;letter-spacing:3px;color:rgba(240,208,120,.65)}
.ctrl-v{font-size:18px;color:#fff;letter-spacing:1px}
.ctrl-v.win{color:#ffd866}
.ctrl-sub{font-size:9px;color:rgba(240,208,120,.5);letter-spacing:1px}
.ctrl-adj{display:flex;gap:5px;margin-top:3px}
.ctrl-adj button{background:rgba(212,170,80,.12);border:1px solid rgba(212,170,80,.3);color:#f0d878;width:28px;height:24px;border-radius:5px;font-size:14px;cursor:pointer;font-family:'Cinzel',serif}
.ctrl-adj button:disabled{opacity:.4;cursor:not-allowed}
.spin-zone{display:flex;flex-direction:column;align-items:center;gap:5px;padding:0 4px}
.spin-btn{position:relative;width:88px;height:88px;border-radius:50%;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.spin-btn .ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#c9a84c,#fff6c8,#c9a84c,#f0d878,#c9a84c,#fff6c8,#c9a84c);animation:ringRot 4s linear infinite;padding:3px}
.spin-btn.spinning .ring{animation-duration:.6s}
.spin-btn .core{position:relative;width:calc(100% - 6px);height:calc(100% - 6px);margin:3px;border-radius:50%;background:radial-gradient(circle at 35% 25%,#3a2e15,#0d0803 70%);display:flex;align-items:center;justify-content:center;font-family:'Cinzel Decorative',serif;font-size:14px;letter-spacing:3px;color:#f0d878;border:1px solid rgba(255,220,120,.4)}
.spin-btn:disabled{opacity:.5;cursor:not-allowed}
@keyframes ringRot{to{transform:rotate(360deg)}}
.spin-toggles{display:flex;gap:4px}
.tog{background:rgba(20,12,4,.7);border:1px solid rgba(212,170,80,.3);color:rgba(240,208,120,.7);font-family:'Cinzel',serif;font-size:9px;padding:4px 10px;border-radius:6px;cursor:pointer;letter-spacing:2px}
.tog.on{background:linear-gradient(90deg,rgba(180,40,40,.4),rgba(220,80,40,.45));border-color:rgba(255,120,80,.7);color:#fff}
.tr-quickbets{width:100%;max-width:760px;display:flex;gap:5px;flex-wrap:wrap}
.qb{flex:1;min-width:60px;background:rgba(20,12,4,.55);border:1px solid rgba(212,170,80,.25);color:rgba(240,208,120,.7);font-family:'Cinzel',serif;font-size:11px;padding:6px 4px;border-radius:7px;cursor:pointer;letter-spacing:1px}
.qb.active{background:linear-gradient(180deg,rgba(212,170,80,.35),rgba(140,100,40,.4));border-color:#f0d878;color:#fff}
.qb.pt{flex:0 0 auto;padding:6px 14px}
.qb:disabled{opacity:.4;cursor:not-allowed}
.tr-paytable{width:100%;max-width:760px;background:rgba(10,6,2,.85);border:1px solid rgba(212,170,80,.3);border-radius:10px;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:6px 16px}
.pt-row{display:flex;align-items:center;gap:8px;font-size:11px}
.pt-g{font-size:20px;width:28px;text-align:center}
.pt-n{color:#f0d878;flex:0 0 100px;letter-spacing:.5px}
.pt-p{color:rgba(240,232,200,.65);font-size:10px}
.tr-panel{width:100%;max-width:760px;background:rgba(10,6,2,.92);border:1px solid rgba(212,170,80,.4);border-radius:10px;padding:12px 14px;color:#f0e2b8;max-height:340px;overflow-y:auto}
.tr-panel-h{font-family:'Cinzel Decorative',serif;font-size:14px;letter-spacing:3px;color:#f0d878;margin-bottom:8px}
.tr-rules{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;font-size:11px;line-height:1.5}
.tr-rules li{padding:6px 8px;background:rgba(212,170,80,.06);border-left:2px solid rgba(212,170,80,.5);border-radius:4px}
.tr-rules b{color:#ffd866}
@keyframes shake{0%,100%{transform:translate(0,0)}10%{transform:translate(-4px,2px)}20%{transform:translate(4px,-2px)}30%{transform:translate(-3px,3px)}40%{transform:translate(3px,-3px)}50%{transform:translate(-2px,2px)}60%{transform:translate(2px,-2px)}70%{transform:translate(-2px,1px)}80%{transform:translate(2px,-1px)}90%{transform:translate(-1px,1px)}}
.tr-stage.shake{animation:shake .6s}
@keyframes teaseRumble{0%,100%{transform:translate(0,0)}25%{transform:translate(-1px,1px)}50%{transform:translate(1px,-1px)}75%{transform:translate(-1px,-1px)}}
.tr-stage.tease{animation:teaseRumble .12s linear infinite}
.tr-root.in-free::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,180,60,0.18),rgba(255,120,30,0.08) 55%,transparent 80%);pointer-events:none;z-index:1;animation:fsPulse 3.4s ease-in-out infinite}
@keyframes fsPulse{0%,100%{opacity:.7}50%{opacity:1}}
.tr-gamble{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:auto;background:radial-gradient(ellipse at center,rgba(0,0,0,.7),rgba(0,0,0,.35));z-index:11}
.tr-gamble-card{background:linear-gradient(180deg,rgba(30,18,8,.96),rgba(15,8,3,.98));border:2px solid #c9a84c;border-radius:14px;padding:18px 22px;min-width:280px;max-width:90vw;display:flex;flex-direction:column;gap:10px;align-items:center;box-shadow:0 0 40px rgba(255,200,100,.35)}
.tg-h{font-family:'Cinzel Decorative',serif;font-size:14px;letter-spacing:4px;color:#ffd866}
.tg-amt{display:flex;flex-direction:column;align-items:center;gap:2px}
.tg-amt span{font-size:9px;letter-spacing:3px;color:rgba(240,208,120,.65)}
.tg-amt b{font-size:22px;color:#fff}
.tg-row{display:flex;align-items:center;gap:14px;padding:6px 0}
.tg-side{display:flex;flex-direction:column;align-items:center;gap:1px}
.tg-side span{font-size:8px;letter-spacing:2px;color:rgba(123,227,176,.85)}
.tg-side b{font-size:14px;color:#7be3b0}
.tg-side.lose span{color:rgba(220,120,120,.85)}
.tg-side.lose b{color:#e88a8a}
.tg-vs{font-size:10px;color:rgba(240,208,120,.5);letter-spacing:2px}
.tg-picks{display:flex;gap:10px;width:100%}
.tg-pick{flex:1;padding:14px 8px;border-radius:10px;font-family:'Cinzel',serif;font-size:14px;letter-spacing:3px;cursor:pointer;border:2px solid}
.tg-pick.red{background:linear-gradient(180deg,#7a1818,#3a0808);color:#ff8080;border-color:#c83030}
.tg-pick.black{background:linear-gradient(180deg,#1a1a1a,#000);color:#dadada;border-color:#555}
.tg-pick:disabled{opacity:.5;cursor:not-allowed}
.tg-collect{background:linear-gradient(90deg,rgba(120,80,20,.6),rgba(180,130,40,.7),rgba(120,80,20,.6));border:1px solid #f0d878;color:#fff6c8;font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;padding:8px 14px;border-radius:8px;cursor:pointer}
.tg-collect:disabled{opacity:.5;cursor:not-allowed}
.tg-meta{font-size:8px;letter-spacing:2px;color:rgba(240,208,120,.5)}
.tg-result{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Cinzel Decorative',serif;font-size:48px;letter-spacing:6px;pointer-events:none}
.tg-result.win{color:#7be3b0;text-shadow:0 0 24px #7be3b0}
.tg-result.lose{color:#e85050;text-shadow:0 0 24px #c83030}
.tr-gamble.flash-win .tr-gamble-card{border-color:#7be3b0;box-shadow:0 0 50px rgba(123,227,176,.7)}
.tr-gamble.flash-lose .tr-gamble-card{border-color:#e85050;box-shadow:0 0 50px rgba(220,60,60,.7)}
@media(max-width:520px){.tr-title{font-size:14px;letter-spacing:2px}.jp{min-width:44px;font-size:6px}.jp b{font-size:9px}.ctrl-v{font-size:14px}.spin-btn{width:74px;height:74px}.tr-bigwin{font-size:30px;letter-spacing:4px}.tr-paytable{grid-template-columns:1fr}}
`;
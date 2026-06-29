import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SYMBOLS, SYMBOL_PAY, SYMBOL_WEIGHT, SymbolGlyph } from "./symbols";
import { mulberry32 } from "./rng";
import "./GoldenRelicsSlot.css";
import { UnderwaterScene } from "./UnderwaterScene";
import { slotPickSymbol } from "../../../utils/gameEngine";

const _R=5,_RW=3,_SC="poseidon",_BSA=10,_BRA=5,_BWM=3,_JS=50000,_JC=0.02,_JT=0.00015,_JBB=0.0005;
const _WP=(()=>{const p=[];for(const s of SYMBOLS){if(s===_SC)continue;const w=SYMBOL_WEIGHT[s]??1;for(let i=0;i<w;i++)p.push(s);}return p;})();
const _pk=(rand,sb=0)=>rand()<sb?_SC:slotPickSymbol(_WP);
const _bg=(rand,sb=0)=>Array.from({length:_R},()=>Array.from({length:_RW},()=>_pk(rand,sb)));
const _ig=()=>Array.from({length:_R},(_,c)=>Array.from({length:_RW},(_,r)=>SYMBOLS[(c*3+r)%SYMBOLS.length]));
const BET_STEPS=[5,10,25,50,100,200,500];

export function GoldenRelicsSlot({balance,setBalance,onBack}){
  const [bet,setBet]=useState(10);
  const [grid,setGrid]=useState(()=>_ig());
  const [spinning,setSpinning]=useState(()=>Array(_R).fill(false));
  const [wins,setWins]=useState([]);
  const [winTotal,setWinTotal]=useState(0);
  const [auto,setAuto]=useState(false);
  const [turbo,setTurbo]=useState(false);
  const [shock,setShock]=useState(0);
  const [freeSpins,setFreeSpins]=useState(0);
  const [bonusTotal,setBonusTotal]=useState(0);
  const [bonusIntro,setBonusIntro]=useState(null);
  const [scatterHits,setScatterHits]=useState([]);
  const inBonus=freeSpins>0||!!bonusIntro;
  const particlesRef=useRef([]);
  const pidRef=useRef(0);
  const [,forceTick]=useState(0);
  const [jackpot,setJackpot]=useState(_JS);
  const [totalWon,setTotalWon]=useState(0);
  const [jackpotHit,setJackpotHit]=useState(null);
  const rngRef=useRef(mulberry32(0xA71A57));

  useEffect(()=>{
    const buf=new Uint32Array(2);
    if(typeof crypto!=="undefined"&&crypto.getRandomValues)crypto.getRandomValues(buf);
    else{buf[0]=Date.now()&0xffffffff;buf[1]=(Date.now()/1000)&0xffffffff;}
    rngRef.current=mulberry32((buf[0]^buf[1])>>>0);
  },[]);

  const isSpinning=spinning.some(Boolean);
  const canSpin=!isSpinning&&!bonusIntro&&(freeSpins>0||balance>=bet);

  useEffect(()=>{
    let raf=0;
    const tick=()=>{
      const ps=particlesRef.current;
      for(let i=ps.length-1;i>=0;i--){const p=ps[i];p.life-=16;p.x+=p.dx;p.y+=p.dy;p.dy+=p.kind==="coin"?0.35:-0.08;p.dx*=0.99;if(p.life<=0)ps.splice(i,1);}
      if(ps.length)forceTick(n=>(n+1)%1000);
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[]);

  const emit=useCallback((x,y,kind,count=12)=>{
    for(let i=0;i<count;i++){const ang=Math.random()*Math.PI*2,speed=2+Math.random()*4;particlesRef.current.push({id:pidRef.current++,x,y,dx:Math.cos(ang)*speed,dy:Math.sin(ang)*speed-(kind==="bubble"||kind==="pearl"?2:0),kind,life:900+Math.random()*700});}
  },[]);

  const evaluateWins=useCallback((g,multiplier)=>{
    const result=[];
    for(let r=0;r<_RW;r++){const s=g[0][r];let count=1;for(let c=1;c<_R;c++){if(g[c][r]===s)count++;else break;}if(count>=3){const pay=SYMBOL_PAY[s]*(count===5?5:count===4?2:1);const amount=Math.round((bet/10)*pay*multiplier);result.push({row:r,cols:Array.from({length:count},(_,i)=>i),symbol:s,amount});}}
    return result;
  },[bet]);

  const countScatters=(g)=>{const hits=[];for(let c=0;c<_R;c++)for(let r=0;r<_RW;r++)if(g[c][r]===_SC)hits.push(`${c}-${r}`);return hits;};

  const doSpin=useCallback(()=>{
    if(!canSpin)return;
    const uFS=freeSpins>0;
    if(!uFS){setBalance(b=>b-bet);setJackpot(j=>j+Math.round(bet*_JC*100)/100);}
    if(uFS)setFreeSpins(n=>n-1);
    setWins([]);setScatterHits([]);
    const rand=rngRef.current;
    const jWon=!uFS&&rand()<(_JT+Math.max(0,bet-5)*_JBB);
    const fg=_bg(rand,uFS?0.14:0.02);
    setSpinning(Array(_R).fill(true));
    fg.forEach((reel,i)=>{
      setTimeout(()=>{
        setGrid(cur=>{const cp=cur.map(r=>r.slice());cp[i]=reel;return cp;});
        setSpinning(cur=>{const cp=cur.slice();cp[i]=false;return cp;});
        if(i===_R-1){
          const mult=uFS?_BWM:1;const w=evaluateWins(fg,mult);const scatters=countScatters(fg);
          setScatterHits(scatters);
          const lt=w.reduce((acc,x)=>acc+x.amount,0);
          if(lt===0)setWinTotal(0);
          if(lt>0){setWins(w);setWinTotal(lt);setBalance(b=>b+lt);setTotalWon(t=>t+lt);setShock(n=>n+1);if(uFS)setBonusTotal(t=>t+lt);
            requestAnimationFrame(()=>{const frame=document.getElementById("slot-frame");if(!frame)return;const fr=frame.getBoundingClientRect();w.forEach(line=>line.cols.forEach(c=>{const cell=document.querySelector(`[data-cell="${c}-${line.row}"]`);if(!cell)return;const r=cell.getBoundingClientRect();const x=r.left+r.width/2-fr.left,y=r.top+r.height/2-fr.top;emit(x,y,"coin",uFS?16:10);emit(x,y,"bubble",8);emit(x,y,"spark",uFS?10:6);}));});
          }
          if(scatters.length>=3){const retrigger=uFS,award=retrigger?_BRA:_BSA;setBonusIntro({award,retrigger});
            requestAnimationFrame(()=>{const frame=document.getElementById("slot-frame");if(!frame)return;const fr=frame.getBoundingClientRect();scatters.forEach(key=>{const cell=document.querySelector(`[data-cell="${key}"]`);if(!cell)return;const r=cell.getBoundingClientRect();const x=r.left+r.width/2-fr.left,y=r.top+r.height/2-fr.top;emit(x,y,"spark",20);emit(x,y,"bubble",14);emit(x,y,"pearl",6);});});
            setTimeout(()=>{setBonusIntro(null);setFreeSpins(n=>n+award);if(!retrigger)setBonusTotal(0);},2600);
          }
          if(jWon){setJackpot(cur=>{setBalance(b=>b+cur);setTotalWon(t=>t+cur);setJackpotHit(cur);setShock(n=>n+1);requestAnimationFrame(()=>{const frame=document.getElementById("slot-frame");if(!frame)return;const fr=frame.getBoundingClientRect();for(let k=0;k<8;k++)emit(fr.width*(0.2+(k/8)*0.6),fr.height*0.4,"coin",22);});setTimeout(()=>setJackpotHit(null),4200);return _JS;});}
        }
      },turbo?80+i*50:500+i*280);
    });
  },[bet,canSpin,emit,evaluateWins,freeSpins,setBalance,turbo]);

  useEffect(()=>{
    if(isSpinning||bonusIntro)return;
    if(freeSpins>0){const t=setTimeout(doSpin,turbo?300:800);return()=>clearTimeout(t);}
    if(!auto)return;
    if(balance<bet){setAuto(false);return;}
    const t=setTimeout(doSpin,turbo?300:800);return()=>clearTimeout(t);
  },[auto,isSpinning,balance,bet,doSpin,freeSpins,bonusIntro,turbo]);

  const winningCells=useMemo(()=>{const s=new Set();wins.forEach(w=>w.cols.forEach(c=>s.add(`${c}-${w.row}`)));return s;},[wins]);
  const scatterSet=useMemo(()=>new Set(scatterHits),[scatterHits]);
  const betDown=()=>{if(isSpinning||inBonus)return;const idx=BET_STEPS.indexOf(bet);if(idx>0)setBet(BET_STEPS[idx-1]);};
  const betUp=()=>{if(isSpinning||inBonus)return;const idx=BET_STEPS.indexOf(bet);if(idx<BET_STEPS.length-1)setBet(BET_STEPS[idx+1]);};

  // ── button styles (inline so CSS file can't interfere) ──
  const btnBase={fontFamily:"'Cinzel',serif",cursor:"pointer",border:"none",borderRadius:8,fontWeight:700,letterSpacing:2,transition:"all 0.2s"};
  const backStyle={...btnBase,background:"rgba(94,231,255,0.12)",border:"1px solid rgba(94,231,255,0.5)",color:"#5ee7ff",fontSize:13,padding:"9px 20px",letterSpacing:3};
  const autoStyle={...btnBase,background:auto?"rgba(220,50,50,0.25)":"rgba(94,231,255,0.12)",border:`1px solid ${auto?"rgba(220,80,80,0.6)":"rgba(94,231,255,0.4)"}`,color:auto?"#ffb3b3":"#d6f7ff",fontSize:11,padding:"7px 14px"};
  const turboStyle={...btnBase,background:turbo?"rgba(255,180,30,0.2)":"rgba(94,231,255,0.12)",border:`1px solid ${turbo?"rgba(255,180,30,0.6)":"rgba(94,231,255,0.4)"}`,color:turbo?"#ffd97a":"#d6f7ff",fontSize:11,padding:"7px 14px"};

  return(
    <div style={{width:"100%",maxWidth:760,margin:"0 auto",padding:"52px 12px 32px",fontFamily:"'Cinzel',serif",color:"#d6f7ff",boxSizing:"border-box",userSelect:"none",WebkitUserSelect:"none"}}>
      <UnderwaterScene/>

      {/* ── FIXED TOP BAR ── */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,display:"flex",alignItems:"center",gap:8,padding:"8px 16px",background:"rgba(2,8,20,0.96)",backdropFilter:"blur(8px)",borderBottom:"1px solid rgba(94,231,255,0.2)"}}>
        <button style={backStyle} onClick={onBack}>‹ BACK</button>
        <div style={{flex:1,textAlign:"center"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(180,230,255,0.6)",letterSpacing:3}}>BALANCE </span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,background:"linear-gradient(180deg,#fff1c2,#ffd97a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>৳{(balance||0).toLocaleString()}</span>
        </div>
      </div>

      {/* Jackpot + Total Won */}
      <div className="gr-top-grid">
        <div className="gr-panel gr-panel--strong gr-panel--shimmer">
          <div><span className="gr-label">💎 MEGA JACKPOT</span><span className="gr-jackpot-val gr-gold-text">৳{Math.floor(jackpot).toLocaleString()}</span></div>
          <div className="gr-sub-label">PROGRESSIVE<br/>ANY SPIN</div>
        </div>
        <div className="gr-panel">
          <div><span className="gr-label">TOTAL WON</span><span className={`gr-jackpot-val ${totalWon>0?"gr-gold-text":"gr-dim-text"}`}>৳{totalWon.toLocaleString()}</span></div>
          <div className="gr-sub-label">SESSION<br/>TOTAL</div>
        </div>
      </div>

      {/* Win flash */}
      <div className="gr-win-flash">
        {winTotal>0&&<div key={shock} className="gr-win-pop gr-gold-text gr-font-display">{inBonus?"FREE SPIN WIN":"BIG WIN"} ৳{winTotal.toLocaleString()}</div>}
      </div>

      {/* Slot frame */}
      <div id="slot-frame" className={`gr-frame${inBonus?" gr-frame--bonus":""}`}>
        <CornerEmblems bonus={inBonus}/>
        {(freeSpins>0||bonusTotal>0)&&(
          <div className="gr-free-hud">
            {freeSpins>0&&<div className="gr-badge gr-badge--gold gr-font-display">FREE SPINS · {freeSpins}</div>}
            {bonusTotal>0&&<div className="gr-badge gr-badge--cyan">BONUS ৳{bonusTotal.toLocaleString()}</div>}
          </div>
        )}
        <div className="gr-reels">
          <div className="gr-caustics"/>
          {grid.map((reel,c)=>(
            <Reel key={c} symbols={reel} spinning={spinning[c]}
              winningRows={[...winningCells].filter(k=>k.startsWith(`${c}-`)).map(k=>Number(k.split("-")[1]))}
              scatterRows={[...scatterSet].filter(k=>k.startsWith(`${c}-`)).map(k=>Number(k.split("-")[1]))}
              col={c}/>
          ))}
          {wins.map((w,i)=>(
            <div key={i} className="gr-winline-overlay" aria-hidden>
              <div className="gr-winline" style={{top:`calc(${(w.row+0.5)*(100/_RW)}%)`}}/>
            </div>
          ))}
        </div>
        <ParticleLayer particles={particlesRef.current}/>
        {bonusIntro&&<BonusIntro award={bonusIntro.award} retrigger={bonusIntro.retrigger} multiplier={_BWM}/>}
        {jackpotHit!==null&&<JackpotHit amount={jackpotHit}/>}
      </div>

      {/* Controls */}
      <div className="gr-controls">
        {/* BET + AUTO + TURBO all together */}
        <div className="gr-panel gr-panel--center">
          <div className="gr-label">BET</div>
          <div className="gr-bet-val gr-gold-text">৳{bet}</div>
          <div className="gr-btn-row">
            <button className="gr-btn-aqua" onClick={()=>{if(!isSpinning&&!inBonus)setBet(b=>Math.max(1,b-1));}}>−</button>
            <button className="gr-btn-aqua" onClick={()=>{if(!isSpinning&&!inBonus)setBet(b=>b+1);}}>+</button>
          </div>
          {/* AUTO + TURBO sit right under bet */}
          <div style={{display:"flex",gap:5,marginTop:6}}>
            <button onClick={()=>!inBonus&&setAuto(a=>!a)} style={{...autoStyle,fontSize:9,padding:"5px 8px",letterSpacing:1}}>
              AUTO {auto?"ON":"OFF"}
            </button>
            <button onClick={()=>setTurbo(t=>!t)} style={{...turboStyle,fontSize:9,padding:"5px 8px",letterSpacing:1}}>
              ⚡{turbo?"FAST":"SLOW"}
            </button>
          </div>
        </div>

        <div className="gr-spin-col">
          <button onClick={doSpin} disabled={!canSpin} className={`gr-spin-btn${inBonus?" gr-spin-btn--bonus":""}${!canSpin?" gr-spin-btn--disabled":""}`}>
            <div className="gr-spin-inner gr-font-display">
              <span className="gr-spin-label">{isSpinning?"...":inBonus?"FREE":"SPIN"}</span>
              <span className="gr-spin-sub">{isSpinning?"REELING":inBonus?`×${_BWM}`:"TAP"}</span>
            </div>
          </button>
        </div>

        <div className="gr-panel gr-panel--center">
          <div className="gr-label">WIN</div>
          <div className={`gr-bet-val ${winTotal>0?"gr-gold-text":"gr-dim-text"}`}>৳{winTotal}</div>
          <div className="gr-sub-note">last spin</div>
        </div>
      </div>

      {/* Quick bet presets */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
        {[1,5,10,25,50,100,200,500].map(v=>(
          <button key={v} onClick={()=>{if(!isSpinning&&!inBonus)setBet(v);}}
            style={{flex:1,minWidth:36,fontFamily:"'Cinzel',serif",fontSize:10,padding:"6px 4px",borderRadius:8,cursor:isSpinning||inBonus?"not-allowed":"pointer",opacity:isSpinning||inBonus?0.5:1,background:bet===v?"rgba(94,231,255,0.15)":"transparent",border:`1px solid ${bet===v?"rgba(94,231,255,0.55)":"rgba(255,255,255,0.1)"}`,color:bet===v?"#d6f7ff":"rgba(94,231,255,0.55)",letterSpacing:0,transition:"all 0.2s"}}>
            ৳{v}
          </button>
        ))}
      </div>
    </div>
  );
}

function CornerEmblems({bonus}){
  const p=["gr-corner--tl","gr-corner--tr","gr-corner--bl","gr-corner--br"];
  const sc=["scale(1,1)","scale(-1,1)","scale(1,-1)","scale(-1,-1)"];
  return(<>{p.map((cls,i)=>(
    <svg key={i} className={`gr-corner ${cls}${bonus?" gr-corner--bonus":""}`} viewBox="0 0 40 40">
      <path d="M2 2 Q20 2 20 20 M2 2 Q2 20 20 20" stroke="url(#emb)" strokeWidth="1.5" fill="none" style={{transform:sc[i],transformOrigin:"50% 50%"}}/>
      <circle cx="20" cy="20" r="2" fill={bonus?"#ffb347":"#ffd97a"}/>
      <defs><linearGradient id={`emb${i}`} x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor={bonus?"#ffd97a":"#5ee7ff"}/><stop offset="100%" stopColor={bonus?"#ff8a3d":"#ffd97a"}/></linearGradient></defs>
    </svg>
  ))}</>);
}

function Reel({symbols,spinning,winningRows,scatterRows,col}){
  const strip=useMemo(()=>{if(!spinning)return symbols;return Array.from({length:18},(_,i)=>SYMBOLS[(i+col*3)%SYMBOLS.length]);},[spinning,symbols,col]);
  return(
    <div className="gr-reel">
      <div className="gr-reel-fade gr-reel-fade--top"/><div className="gr-reel-fade gr-reel-fade--bot"/>
      <div className="gr-reel-strip" style={{height:spinning?`${strip.length*100}%`:"100%",transition:spinning?"none":"transform 0.45s cubic-bezier(.22,1.5,.36,1)",transform:spinning?`translateY(-${(strip.length-_RW)*100/strip.length}%)`:"translateY(0)",animation:spinning?"gr-reelblur 0.4s linear infinite":"none",filter:spinning?"blur(2px)":"blur(0)"}}>
        {strip.map((s,idx)=>{const isWin=!spinning&&winningRows.includes(idx);const isScatter=!spinning&&scatterRows.includes(idx);return<SymbolTile key={idx} symbol={s} win={isWin} scatter={isScatter} col={col} row={idx} isStatic={!spinning}/>;})}
      </div>
    </div>
  );
}

function SymbolTile({symbol,win,scatter,col,row,isStatic}){
  return(
    <div data-cell={isStatic?`${col}-${row}`:undefined} className={`gr-tile${win||scatter?" gr-tile--highlight":""}`} style={{background:win?"radial-gradient(circle, rgba(94,231,255,0.35), rgba(94,231,255,0) 70%)":scatter?"radial-gradient(circle, rgba(255,180,60,0.4), rgba(255,180,60,0) 70%)":"transparent"}}>
      <div className={`gr-tile-inner${isStatic?" gr-floaty":""}`}>
        <SymbolGlyph k={symbol}/>
        {win&&(<><div className="gr-tile-glow gr-tile-glow--win"/><div className="gr-shockwave" style={{borderColor:"#5ee7ff"}}/><div className="gr-sparkle gr-sparkle--1"/><div className="gr-sparkle gr-sparkle--2"/></>)}
        {scatter&&!win&&(<><div className="gr-tile-glow gr-tile-glow--scatter"/><div className="gr-shockwave" style={{borderColor:"#ffb347"}}/><div className="gr-sparkle gr-sparkle--1"/></>)}
      </div>
    </div>
  );
}

function ParticleLayer({particles}){
  return(
    <div className="gr-particles">
      {particles.map(p=>{
        if(p.kind==="coin")return<div key={p.id} className="gr-particle gr-particle--coin" style={{left:p.x,top:p.y,transform:`rotate(${p.x*4}deg)`}}/>;
        if(p.kind==="bubble")return<div key={p.id} className="gr-particle gr-particle--bubble" style={{left:p.x,top:p.y}}/>;
        if(p.kind==="pearl")return<div key={p.id} className="gr-particle gr-particle--pearl" style={{left:p.x,top:p.y}}/>;
        return<div key={p.id} className="gr-particle gr-particle--spark" style={{left:p.x,top:p.y}}/>;
      })}
    </div>
  );
}

function BonusIntro({award,retrigger,multiplier}){
  return(
    <div className="gr-overlay gr-bonus-overlay">
      <div className="gr-overlay-bg"/><div className="gr-bonus-rays"/>
      <div className="gr-ring gr-ring--1"/><div className="gr-ring gr-ring--2"/><div className="gr-ring gr-ring--3"/>
      <div className="gr-overlay-content gr-win-pop">
        <div className="gr-overlay-eyebrow">{retrigger?"Poseidon Smiles Again":"Poseidon's Favor"}</div>
        <div className="gr-overlay-title gr-gold-text gr-font-display">{retrigger?"+":""}{award} FREE SPINS</div>
        <div className="gr-overlay-sub">{`ALL WINS ×${multiplier}`}</div>
        <div className="gr-overlay-foot">The trident awakens · reels of the deep</div>
      </div>
    </div>
  );
}

function JackpotHit({amount}){
  return(
    <div className="gr-overlay gr-jackpot-overlay">
      <div className="gr-jackpot-bg"/><div className="gr-bonus-rays"/>
      <div className="gr-ring gr-ring--j1"/><div className="gr-ring gr-ring--j2"/><div className="gr-ring gr-ring--j3"/>
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
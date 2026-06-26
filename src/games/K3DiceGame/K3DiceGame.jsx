import { useState, useEffect, useRef } from "react";

const _MX = [
  { id: "15s", label: "K3 15 Sec", seconds: 15  },
  { id: "30s", label: "K3 30 Sec", seconds: 30  },
  { id: "1m",  label: "K3 1 Min",  seconds: 60  },
  { id: "3m",  label: "K3 3 Min",  seconds: 180 },
];

const _TP = {3:207.36,4:69.12,5:34.56,6:20.74,7:13.83,8:9.88,9:8.3,10:7.68,11:7.68,12:8.3,13:9.88,14:13.83,15:20.74,16:34.56,17:69.12,18:207.36};
const _2S = [{label:"1·1",pair:[1,1],payout:17.64},{label:"2·2",pair:[2,2],payout:17.64},{label:"3·3",pair:[3,3],payout:17.64},{label:"4·4",pair:[4,4],payout:17.64},{label:"5·5",pair:[5,5],payout:17.64},{label:"6·6",pair:[6,6],payout:17.64}];
const _3S = [{label:"Any Triple",key:"any3",payout:29.4},{label:"1·1·1",key:"111",triple:1,payout:176.4},{label:"2·2·2",key:"222",triple:2,payout:176.4},{label:"3·3·3",key:"333",triple:3,payout:176.4},{label:"4·4·4",key:"444",triple:4,payout:176.4},{label:"5·5·5",key:"555",triple:5,payout:176.4},{label:"6·6·6",key:"666",triple:6,payout:176.4}];
const _DC = ["1,2,3","1,2,4","1,2,5","1,2,6","1,3,4","1,3,5","1,3,6","1,4,5","1,4,6","1,5,6","2,3,4","2,3,5","2,3,6","2,4,5","2,4,6","2,5,6","3,4,5","3,4,6","3,5,6","4,5,6"].map(k=>({label:k,key:k,payout:17.64}));

let _pc = 100;
const _gp = (mid) => {
  const n = new Date();
  const d = `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
  return `${d}${mid.toUpperCase()}${String(++_pc).padStart(6,"0")}`;
};
const _rd = () => [Math.ceil(Math.random()*6),Math.ceil(Math.random()*6),Math.ceil(Math.random()*6)];
const _cl = (d) => { const s=d[0]+d[1]+d[2]; return {sum:s,big:s>=11?"Big":"Small",oddEven:s%2===0?"Even":"Odd"}; };

function _smartRoll(betMap) {
  let best=null, bestW=Infinity;
  for(let t=0;t<60;t++){
    const d=_rd();
    const {sum,big,oddEven}=_cl(d);
    const sorted=[...d].sort((a,b)=>a-b);
    let w=0;
    w+=betMap[`total-${sum}`]||0;
    w+=betMap[`big-big`]||0;
    w+=betMap[`small-small`]||0;
    w+=betMap[`even-even`]||0;
    w+=betMap[`odd-odd`]||0;
    if(d[0]===d[1]&&d[1]===d[2]){ w+=betMap[`3same-"any3"`]||0; w+=betMap[`3same-${d[0]}`]||0; }
    _2S.forEach(item=>{ if(d.filter(x=>x===item.pair[0]).length>=2) w+=betMap[`2same-${JSON.stringify(item.pair)}`]||0; });
    w+=betMap[`diff-"${sorted.join(",")}"`]||0;
    if(w<bestW){bestW=w;best=d;}
  }
  return best||_rd();
}

function _ev(bet,dice){
  if(!bet) return {won:false,payout:0};
  const {type,value,amount}=bet;
  const {sum,big,oddEven}=_cl(dice);
  const sorted=[...dice].sort((a,b)=>a-b);
  let won=false,mult=0;
  if(type==="big"&&big==="Big"){won=true;mult=2;}
  if(type==="small"&&big==="Small"){won=true;mult=2;}
  if(type==="even"&&oddEven==="Even"){won=true;mult=2;}
  if(type==="odd"&&oddEven==="Odd"){won=true;mult=2;}
  if(type==="total"&&value===sum){won=true;mult=_TP[value];}
  if(type==="2same"){
    const [a,b]=value;
    const ca=dice.filter(x=>x===a).length, cb=dice.filter(x=>x===b).length;
    if(a===b&&ca>=2){won=true;mult=17.64;}
    else if(a!==b&&ca>=1&&cb>=1){won=true;mult=17.64;}
  }
  if(type==="3same"){
    if(value==="any3"&&dice[0]===dice[1]&&dice[1]===dice[2]){won=true;mult=29.4;}
    else if(typeof value==="number"&&dice.every(d=>d===value)){won=true;mult=176.4;}
  }
  if(type==="diff"){
    const nums=value.split(",").map(Number).sort((a,b)=>a-b);
    if(JSON.stringify(sorted)===JSON.stringify(nums)){won=true;mult=17.64;}
  }
  return {won,payout:won?parseFloat((amount*mult).toFixed(2)):0};
}

const _DOT = {
  1:[[50,50]],2:[[30,30],[70,70]],3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]],
};

function DiceSVG({value=1,size=70}){
  const dots=_DOT[value]||_DOT[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:"block"}}>
      <defs>
        <radialGradient id={`dg${value}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ff7070"/>
          <stop offset="100%" stopColor="#b71c1c"/>
        </radialGradient>
        <filter id="dsf"><feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.45"/></filter>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="20" ry="20" fill={`url(#dg${value})`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <rect x="4" y="4" width="92" height="40" rx="20" ry="20" fill="rgba(255,255,255,0.08)"/>
      {dots.map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r={8.5} fill="#FFD700" filter="url(#dsf)"/>
      ))}
    </svg>
  );
}

function MiniDice({value=1,size=22}){
  const dots=_DOT[value]||_DOT[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:"inline-block",verticalAlign:"middle",borderRadius:size*0.2,overflow:"hidden"}}>
      <defs>
        <radialGradient id={`mg${value}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ff7070"/>
          <stop offset="100%" stopColor="#b71c1c"/>
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="20" ry="20" fill={`url(#mg${value})`}/>
      {dots.map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r={9} fill="#FFD700"/>))}
    </svg>
  );
}

// Animated dice: bounces while rolling, pops in on reveal
function AnimDice({value,size=72,rolling,revealKey,delay=0}){
  return (
    <div style={{
      width:size,height:size,
      borderRadius:size*0.18,
      overflow:"hidden",
      boxShadow: rolling
        ? "0 0 0 2px rgba(255,215,0,0.5), 0 8px 24px rgba(0,0,0,0.5)"
        : "0 6px 18px rgba(0,0,0,0.5)",
      animation: rolling
        ? "diceBounce 0.4s ease-in-out infinite alternate"
        : `dicePopIn 0.45s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
      flexShrink:0,
    }}>
      <DiceSVG value={rolling?Math.ceil(Math.random()*6):value} size={size}/>
    </div>
  );
}

function Ball({num,payout,selected,locked,onClick,isRed}){
  const bg=selected
    ?(isRed?"#7f0000":"#003300")
    :isRed
      ?"radial-gradient(circle at 35% 28%, #ff8a80, #e53935 50%, #b71c1c)"
      :"radial-gradient(circle at 35% 28%, #a5d6a7, #43a047 50%, #1b5e20)";
  return (
    <div onClick={()=>!locked&&onClick()} style={{
      width:"100%",aspectRatio:"1",borderRadius:"50%",background:bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      cursor:locked?"not-allowed":"pointer",opacity:locked?0.5:1,position:"relative",
      boxShadow:selected?"0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.4)":"0 4px 10px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(0,0,0,0.2)",
      border:selected?"2px solid #FFD700":"2px solid rgba(255,255,255,0.3)",
      transition:"transform 0.12s,box-shadow 0.12s",userSelect:"none",
    }}
    onMouseEnter={e=>{if(!locked)e.currentTarget.style.transform="scale(1.09)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
    onMouseDown={e=>{if(!locked)e.currentTarget.style.transform="scale(0.93)";}}
    onMouseUp={e=>{if(!locked)e.currentTarget.style.transform="scale(1.09)";}}
    >
      {!selected&&<div style={{position:"absolute",top:"12%",left:"22%",width:"28%",height:"16%",borderRadius:"50%",background:"rgba(255,255,255,0.5)",filter:"blur(2px)"}}/>}
      <span style={{color:"#fff",fontWeight:800,fontSize:14,lineHeight:1,textShadow:"0 1px 3px rgba(0,0,0,0.5)"}}>{num}</span>
      <span style={{color:"rgba(255,255,255,0.85)",fontSize:8.5,marginTop:1,textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>{payout}X</span>
    </div>
  );
}

// ── module-level market state ──────────────────────────────────────────────────
const _MS = {};
_MX.forEach(m=>{
  _MS[m.id]={timeLeft:m.seconds,period:_gp(m.id),dice:_rd(),history:[],bets:{},listeners:new Set(),rolling:false,_justRolled:false};
});
const _sub=(id,fn)=>{_MS[id].listeners.add(fn);return()=>_MS[id].listeners.delete(fn);};
const _notify=(id)=>{_MS[id].listeners.forEach(fn=>fn({..._MS[id]}));};

if(!window.__k3v3){
  window.__k3v3=true;
  _MX.forEach(m=>{
    setInterval(()=>{
      const ms=_MS[m.id];
      if(ms.rolling) return;
      ms.timeLeft--;
      if(ms.timeLeft<=0){
        ms.rolling=true;
        _notify(m.id);
        setTimeout(()=>{
          const nd=_smartRoll(ms.bets);
          const {sum,big,oddEven}=_cl(nd);
          ms.history=[{period:ms.period,sum,big,oddEven,dice:nd},...ms.history.slice(0,99)];
          ms.dice=nd; ms.period=_gp(m.id); ms.timeLeft=m.seconds;
          ms.bets={}; ms.rolling=false; ms._justRolled=true;
          _notify(m.id);
          setTimeout(()=>{ms._justRolled=false;_notify(m.id);},300);
        },1400);
      } else {
        _notify(m.id);
      }
    },1000);
  });
}

// ── preset amounts ─────────────────────────────────────────────────────────────
const PRESETS=[5,10,20,30,50,100,200,300];

export default function K3DiceGame({balance,setBalance,onBack}){
  const [marketId,setMarketId]=useState("30s");
  const [snap,setSnap]=useState({..._MS[marketId]});
  const [activeTab,setActiveTab]=useState(0);
  const [betAmount,setBetAmount]=useState(10);
  const [customAmt,setCustomAmt]=useState("");
  const [pendingBet,setPendingBet]=useState(null);
  const [toast,setToast]=useState(null);
  const [bottomTab,setBottomTab]=useState(0);
  const [myBets,setMyBets]=useState([]);
  const [rollingFaces,setRollingFaces]=useState([1,2,3]);
  const betRef=useRef(null);
  const rollAnim=useRef(null);

  useEffect(()=>{
    setSnap({..._MS[marketId]});
    const unsub=_sub(marketId,(s)=>{
      setSnap({...s});
      if(s.rolling && !rollAnim.current){
        rollAnim.current=setInterval(()=>{
          setRollingFaces([Math.ceil(Math.random()*6),Math.ceil(Math.random()*6),Math.ceil(Math.random()*6)]);
        },120);
      }
      if(!s.rolling && rollAnim.current){
        clearInterval(rollAnim.current);
        rollAnim.current=null;
      }
      if(s._justRolled&&betRef.current){
        const {won,payout}=_ev(betRef.current,s.dice);
        setMyBets(prev=>[{period:s.history[0]?.period||"",bet:betRef.current,dice:s.dice,won,payout,time:new Date().toLocaleTimeString()},...prev.slice(0,99)]);
        if(won){setBalance(b=>parseFloat((b+payout).toFixed(2)));_showToast(`🎉 Won ৳${payout}!`,"win");}
        else{_showToast(`💸 Lost ৳${betRef.current.amount}`,"lose");}
        betRef.current=null; setPendingBet(null);
      }
    });
    return ()=>{ unsub(); if(rollAnim.current){clearInterval(rollAnim.current);rollAnim.current=null;} };
  },[marketId,setBalance]);

  const _showToast=(msg,type="info")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};

  const placeBet=(type,value,payout)=>{
    if(balance<betAmount){_showToast("Insufficient balance","lose");return;}
    if(betRef.current){_showToast("One bet per round","lose");return;}
    if(snap.rolling||snap.timeLeft<=5){_showToast("Betting locked","lose");return;}
    setBalance(b=>parseFloat((b-betAmount).toFixed(2)));
    const bet={type,value,amount:betAmount,payout};
    betRef.current=bet; setPendingBet(bet);
    const key=`${type}-${JSON.stringify(value)}`;
    _MS[marketId].bets[key]=(_MS[marketId].bets[key]||0)+betAmount;
    _showToast(`✅ ৳${betAmount} placed`,"info");
  };

  const {timeLeft,period,dice,history,rolling}=snap;
  const locked=timeLeft<=5||rolling;
  const mm=String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss=String(timeLeft%60).padStart(2,"0");
  const selKey=pendingBet?`${pendingBet.type}-${JSON.stringify(pendingBet.value)}`:null;
  const R="#e53935",DR="#b71c1c",G="#2e7d32";

  const chartData=[...history].slice(0,20).reverse();

  const handleCustomAmt=(e)=>{
    const v=e.target.value.replace(/[^0-9]/g,"");
    setCustomAmt(v);
    if(v&&parseInt(v)>=1) setBetAmount(parseInt(v));
  };

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:420,margin:"0 auto",background:"#f4f4f4",minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative"}}>
      <style>{`
        @keyframes diceBounce {
          0%  { transform: translateY(0px) rotate(-8deg) scale(1); }
          100%{ transform: translateY(-10px) rotate(8deg) scale(1.05); }
        }
        @keyframes dicePopIn {
          0%  { transform: scale(0.3) rotate(-15deg); opacity:0; }
          65% { transform: scale(1.18) rotate(4deg);  opacity:1; }
          82% { transform: scale(0.93) rotate(-2deg); }
          100%{ transform: scale(1) rotate(0deg);     opacity:1; }
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(12px) translateX(-50%)}
          to  {opacity:1;transform:translateY(0)    translateX(-50%)}
        }
        @keyframes pulseRed {
          0%,100%{opacity:1} 50%{opacity:0.6}
        }
        .hov:hover{transform:scale(1.06)!important; transition:transform 0.12s;}
        .hov:active{transform:scale(0.94)!important;}
      `}</style>

      {toast&&(
        <div style={{position:"fixed",top:62,left:"50%",
          background:toast.type==="win"?"#2e7d32":toast.type==="lose"?"#b71c1c":"#1565c0",
          color:"#fff",padding:"10px 24px",borderRadius:24,fontSize:14,fontWeight:700,
          zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 6px 20px rgba(0,0,0,0.35)",
          animation:"fadeUp 0.22s ease forwards"}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${R},${DR})`,padding:"14px 16px",display:"flex",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",borderRadius:8,padding:"4px 12px",fontWeight:700}}>‹</button>
        <span style={{flex:1,textAlign:"center",color:"#fff",fontWeight:900,fontSize:20,letterSpacing:2,textShadow:"0 2px 4px rgba(0,0,0,0.3)"}}>K3 DICE</span>
        <div style={{width:44}}/>
      </div>

      {/* Wallet */}
      <div style={{background:"#fff",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #eee",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:R}}>৳{(balance||0).toFixed(2)}</div>
          <div style={{fontSize:11,color:"#999",marginTop:1}}>💼 Wallet balance</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{padding:"8px 16px",background:R,color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13}}>Withdraw</button>
          <button style={{padding:"8px 16px",background:G,color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13}}>Deposit</button>
        </div>
      </div>

      {/* Market tabs */}
      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #eee",overflowX:"auto"}}>
        {_MX.map(m=>{
          const active=m.id===marketId;
          const t=_MS[m.id].timeLeft;
          const tmm=String(Math.floor(t/60)).padStart(2,"0");
          const tss=String(t%60).padStart(2,"0");
          return (
            <button key={m.id} onClick={()=>setMarketId(m.id)} style={{
              flex:1,minWidth:72,padding:"10px 4px 8px",border:"none",
              background:active?"#fff":"#fafafa",
              borderBottom:active?`2.5px solid ${R}`:"2.5px solid transparent",
              cursor:"pointer",transition:"all 0.15s",
            }}>
              <div style={{fontSize:11,fontWeight:active?700:500,color:active?R:"#888"}}>{m.label}</div>
              <div style={{fontSize:11,color:active?DR:"#ccc",fontVariantNumeric:"tabular-nums",marginTop:1,fontWeight:600}}>{tmm}:{tss}</div>
            </button>
          );
        })}
      </div>

      {/* Period + countdown */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 14px",background:"#fff",borderBottom:"1px solid #f0f0f0"}}>
        <span style={{color:"#1565c0",fontWeight:600,fontSize:10,letterSpacing:0.3}}>{period}</span>
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          <span style={{fontSize:10,color:"#aaa",marginRight:4}}>Time</span>
          {[mm[0],mm[1],":",ss[0],ss[1]].map((c,i)=>
            c===":"
              ?<span key={i} style={{fontWeight:900,color:R,fontSize:18,margin:"0 1px"}}>:</span>
              :<span key={i} style={{background:R,color:"#fff",borderRadius:4,padding:"2px 5px",fontWeight:800,fontSize:15,minWidth:18,textAlign:"center",display:"inline-block",lineHeight:1.4}}>{c}</span>
          )}
        </div>
      </div>

      {/* Lock/rolling bar */}
      {locked&&(
        <div style={{background:rolling?"#0d47a1":"#fff3e0",padding:"5px 14px",textAlign:"center",fontSize:12,fontWeight:700,color:rolling?"#fff":"#e65100",animation:rolling?"pulseRed 0.7s ease infinite":"none"}}>
          {rolling?"🎲 Rolling…":"🔒 Betting closed"}
        </div>
      )}

      {/* Dice display */}
      <div style={{background:"linear-gradient(160deg,#1b5e20,#2e7d32,#1b5e20)",margin:"10px 12px",borderRadius:16,padding:"18px 0",display:"flex",justifyContent:"center",alignItems:"center",gap:16,boxShadow:"0 6px 20px rgba(0,0,0,0.35)",border:"2px solid rgba(76,175,80,0.5)",position:"relative",overflow:"hidden",minHeight:108}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 8px)"}}/>
        {rolling
          ?rollingFaces.map((v,i)=>(
            <div key={i} style={{width:72,height:72,borderRadius:14,overflow:"hidden",boxShadow:"0 0 0 2px rgba(255,215,0,0.4),0 8px 24px rgba(0,0,0,0.5)",animation:`diceBounce 0.4s ease-in-out infinite alternate`,animationDelay:`${i*0.12}s`,flexShrink:0}}>
              <DiceSVG value={v} size={72}/>
            </div>
          ))
          :dice.map((v,i)=>(
            <div key={`${period}-${i}`} style={{width:72,height:72,borderRadius:14,overflow:"hidden",boxShadow:"0 6px 18px rgba(0,0,0,0.5)",animation:`dicePopIn 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i*0.1}s both`,flexShrink:0}}>
              <DiceSVG value={v} size={72}/>
            </div>
          ))
        }
        {!rolling&&(
          <div style={{position:"absolute",bottom:7,right:11,background:"rgba(0,0,0,0.45)",borderRadius:9,padding:"3px 10px",fontSize:11,color:"#fff",fontWeight:700}}>
            {dice[0]+dice[1]+dice[2]} &nbsp;·&nbsp;
            <span style={{color:dice[0]+dice[1]+dice[2]>=11?"#FFD700":"#90caf9"}}>{dice[0]+dice[1]+dice[2]>=11?"Big":"Small"}</span>
            &nbsp;·&nbsp;
            <span style={{color:"#ef9a9a"}}>{(dice[0]+dice[1]+dice[2])%2===0?"Even":"Odd"}</span>
          </div>
        )}
      </div>

      {/* Bet type tabs */}
      <div style={{display:"flex",margin:"0 12px",background:"#fff",borderRadius:10,overflow:"hidden",border:"1px solid #e5e5e5",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        {["Total","2 Same","3 Same","Different"].map((t,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)} style={{flex:1,padding:"9px 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:i===activeTab?700:400,background:i===activeTab?R:"transparent",color:i===activeTab?"#fff":"#666",transition:"all 0.15s"}}>{t}</button>
        ))}
      </div>

      {/* Bet area */}
      <div style={{padding:"10px 12px 0",flex:1,overflowY:"auto"}}>

        {/* Total */}
        {activeTab===0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {Object.entries(_TP).map(([n,p])=>{
              const num=parseInt(n),isRed=num<=10;
              const sel=selKey===`total-${JSON.stringify(num)}`;
              return <Ball key={num} num={num} payout={p} selected={sel} locked={locked} isRed={isRed} onClick={()=>placeBet("total",num,p)}/>;
            })}
          </div>
        )}

        {/* 2 Same */}
        {activeTab===1&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {_2S.map(item=>{
              const sel=selKey===`2same-${JSON.stringify(item.pair)}`;
              return (
                <div key={item.label} className="hov" onClick={()=>!locked&&placeBet("2same",item.pair,item.payout)} style={{background:sel?"#7f0000":"radial-gradient(circle at 30% 25%, #ff8a80, #e53935 50%, #b71c1c)",borderRadius:12,padding:"12px 6px",display:"flex",flexDirection:"column",alignItems:"center",cursor:locked?"not-allowed":"pointer",opacity:locked?0.5:1,boxShadow:sel?"0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.3)":"0 4px 10px rgba(0,0,0,0.3)",border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.25)",gap:6,userSelect:"none",transition:"transform 0.12s"}}>
                  <div style={{display:"flex",gap:5}}><MiniDice value={item.pair[0]} size={28}/><MiniDice value={item.pair[1]} size={28}/></div>
                  <span style={{color:"#fff",fontWeight:700,fontSize:11}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.8)",fontSize:10}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 3 Same */}
        {activeTab===2&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {_3S.map(item=>{
              const v=item.key==="any3"?"any3":item.triple;
              const sel=selKey===`3same-${JSON.stringify(v)}`;
              const isAny=item.key==="any3";
              return (
                <div key={item.key} className="hov" onClick={()=>!locked&&placeBet("3same",v,item.payout)} style={{background:sel?(isAny?"#5d3000":"#7f0000"):isAny?"radial-gradient(circle at 30% 25%, #ffcc80, #ffa726 50%, #e65100)":"radial-gradient(circle at 30% 25%, #ff8a80, #e53935 50%, #b71c1c)",borderRadius:12,padding:"14px 8px",display:"flex",flexDirection:"column",alignItems:"center",cursor:locked?"not-allowed":"pointer",opacity:locked?0.5:1,boxShadow:sel?"0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.3)":"0 4px 10px rgba(0,0,0,0.3)",border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.25)",gap:6,userSelect:"none",transition:"transform 0.12s"}}>
                  {isAny?<span style={{fontSize:26}}>🎲</span>:<div style={{display:"flex",gap:3}}>{[0,1,2].map(j=><MiniDice key={j} value={item.triple} size={22}/>)}</div>}
                  <span style={{color:"#fff",fontWeight:700,fontSize:12}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.8)",fontSize:10}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Different */}
        {activeTab===3&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
            {_DC.map(item=>{
              const sel=selKey===`diff-${JSON.stringify(item.key)}`;
              return (
                <div key={item.key} className="hov" onClick={()=>!locked&&placeBet("diff",item.key,item.payout)} style={{background:sel?"#003300":"radial-gradient(circle at 30% 25%, #a5d6a7, #43a047 50%, #1b5e20)",borderRadius:9,padding:"9px 3px",display:"flex",flexDirection:"column",alignItems:"center",cursor:locked?"not-allowed":"pointer",opacity:locked?0.5:1,boxShadow:sel?"0 0 0 2.5px #FFD700":"0 3px 8px rgba(0,0,0,0.3)",border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.2)",gap:2,userSelect:"none",transition:"transform 0.12s"}}>
                  <span style={{color:"#fff",fontWeight:700,fontSize:10}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.8)",fontSize:8.5}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Big/Small/Even/Odd */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
          {[{k:"small",label:"Small",bg:"linear-gradient(145deg,#42a5f5,#1565c0)"},{k:"big",label:"Big",bg:"linear-gradient(145deg,#ffa726,#e65100)"},{k:"even",label:"Even",bg:"linear-gradient(145deg,#66bb6a,#2e7d32)"},{k:"odd",label:"Odd",bg:"linear-gradient(145deg,#ef5350,#b71c1c)"}].map(({k,label,bg})=>{
            const sel=selKey===`${k}-${JSON.stringify(k)}`;
            return (
              <button key={k} className="hov" onClick={()=>!locked&&placeBet(k,k,2)} style={{background:sel?"#222":bg,border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"11px 0",color:"#fff",fontWeight:800,fontSize:14,cursor:locked?"not-allowed":"pointer",boxShadow:sel?"0 0 0 2.5px #FFD700":"0 3px 10px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",alignItems:"center",gap:3,opacity:locked?0.5:1,transition:"transform 0.12s"}}>
                <span>{label}</span>
                <span style={{fontSize:10,fontWeight:400,opacity:0.85}}>2X</span>
              </button>
            );
          })}
        </div>

        {/* Bet amount */}
        <div style={{background:"#fff",borderRadius:12,padding:"12px",marginTop:10,border:"1px solid #e5e5e5",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:13,color:"#555",fontWeight:700,whiteSpace:"nowrap"}}>Bet ৳</span>
            <div style={{flex:1,background:"#1a1a1a",borderRadius:8,padding:"9px 14px",fontSize:17,fontWeight:800,color:"#fff",textAlign:"center",letterSpacing:1}}>
              {betAmount.toLocaleString()}
            </div>
          </div>
          {/* preset chips — scrollable */}
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4}}>
            {PRESETS.map(v=>(
              <button key={v} onClick={()=>{setBetAmount(v);setCustomAmt("");}} style={{flexShrink:0,background:betAmount===v?R:"#f5f5f5",color:betAmount===v?"#fff":"#555",border:`1.5px solid ${betAmount===v?R:"#e0e0e0"}`,borderRadius:7,padding:"6px 10px",fontSize:11.5,fontWeight:betAmount===v?700:500,cursor:"pointer",whiteSpace:"nowrap"}}>৳{v}</button>
            ))}
          </div>
          {/* custom amount */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
            <input
              type="text" inputMode="numeric" placeholder="Custom amount…"
              value={customAmt}
              onChange={handleCustomAmt}
              style={{flex:1,border:"1.5px solid #e0e0e0",borderRadius:8,padding:"8px 12px",fontSize:14,fontWeight:700,outline:"none",color:"#222"}}
            />
            {customAmt&&(
              <button onClick={()=>{setCustomAmt("");setBetAmount(10);}} style={{background:"#eee",border:"none",borderRadius:7,padding:"8px 12px",cursor:"pointer",fontSize:12,color:"#666"}}>✕</button>
            )}
          </div>
        </div>

        {pendingBet&&(
          <div style={{background:"#fff8e1",border:"1.5px solid #ffd54f",borderRadius:10,padding:"8px 14px",marginTop:8,fontSize:12,color:"#e65100",fontWeight:700,textAlign:"center"}}>
            ⏳ ৳{pendingBet.amount.toLocaleString()} on {pendingBet.type==="total"?`Sum ${pendingBet.value}`:pendingBet.type} — awaiting result
          </div>
        )}

        {/* ── Bottom tabs: History / Chart / My Bets ── */}
        <div style={{marginTop:12,background:"#fff",borderRadius:14,border:"1px solid #e5e5e5",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",overflow:"hidden",marginBottom:14}}>
          <div style={{display:"flex",borderBottom:"1px solid #eee"}}>
            {["Game History","Chart","My History"].map((t,i)=>(
              <button key={i} onClick={()=>setBottomTab(i)} style={{flex:1,padding:"10px 0",border:"none",background:bottomTab===i?"#fff":"#fafafa",borderBottom:bottomTab===i?`2.5px solid ${R}`:"2.5px solid transparent",color:bottomTab===i?R:"#888",fontWeight:bottomTab===i?700:400,fontSize:12,cursor:"pointer",transition:"all 0.15s"}}>{t}</button>
            ))}
          </div>

          {/* Game History — only current market */}
          {bottomTab===0&&(
            <div style={{maxHeight:280,overflowY:"auto"}}>
              {history.length===0?(
                <div style={{textAlign:"center",padding:28,color:"#ccc",fontSize:13}}>No rounds yet for this market</div>
              ):(
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:"#fafafa",borderBottom:"1px solid #f0f0f0"}}>
                      <th style={{padding:"8px 10px",textAlign:"left",color:"#aaa",fontWeight:600}}>Period</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#aaa",fontWeight:600}}>Sum</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#aaa",fontWeight:600}}>Result</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#aaa",fontWeight:600}}>Dice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f8f8f8",background:i%2===0?"#fff":"#fafafa",animation:i===0?"fadeUp 0.3s ease":"none"}}>
                        <td style={{padding:"7px 10px",fontSize:9,color:"#1565c0",fontWeight:600,fontFamily:"monospace"}}>{row.period.slice(-8)}</td>
                        <td style={{padding:"7px 6px",textAlign:"center",fontWeight:900,fontSize:16,color:"#222"}}>{row.sum}</td>
                        <td style={{padding:"7px 6px",textAlign:"center"}}>
                          <span style={{background:row.big==="Big"?"#fff3e0":"#e3f2fd",color:row.big==="Big"?"#e65100":"#1565c0",borderRadius:5,padding:"2px 6px",fontSize:10,fontWeight:700,marginRight:3}}>{row.big}</span>
                          <span style={{background:row.oddEven==="Even"?"#e8f5e9":"#fce4ec",color:row.oddEven==="Even"?"#2e7d32":"#c62828",borderRadius:5,padding:"2px 6px",fontSize:10,fontWeight:700}}>{row.oddEven}</span>
                        </td>
                        <td style={{padding:"7px 6px"}}>
                          <div style={{display:"flex",gap:3,justifyContent:"center"}}>
                            {row.dice.map((v,j)=><MiniDice key={j} value={v} size={20}/>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Chart */}
          {bottomTab===1&&(
            <div style={{padding:"12px 10px",maxHeight:300,overflowY:"auto"}}>
              {chartData.length===0?(
                <div style={{textAlign:"center",padding:28,color:"#ccc",fontSize:13}}>No data yet</div>
              ):(
                <>
                  <div style={{fontSize:11,color:"#aaa",marginBottom:8,textAlign:"center"}}>Sum trend — last {chartData.length} rounds ({_MX.find(m=>m.id===marketId)?.label})</div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:2,height:90,padding:"0 2px",marginBottom:4}}>
                    {chartData.map((row,i)=>{
                      const h=Math.max(8,((row.sum-3)/(18-3))*90);
                      return (
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                          <span style={{fontSize:7,color:"#bbb",fontWeight:700}}>{row.sum}</span>
                          <div style={{width:"100%",height:`${h}px`,background:row.sum>=11?"#e53935":"#1565c0",borderRadius:"2px 2px 0 0",minHeight:5}}/>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    {[["Big","#e65100","#fff3e0","big"],["Small","#1565c0","#e3f2fd","small"],["Even","#2e7d32","#e8f5e9","even"],["Odd","#c62828","#fce4ec","odd"]].map(([label,color,bg,key])=>{
                      const cnt=history.filter(r=>(key==="big"&&r.big==="Big")||(key==="small"&&r.big==="Small")||(key==="even"&&r.oddEven==="Even")||(key==="odd"&&r.oddEven==="Odd")).length;
                      const pct=history.length?Math.round(cnt/history.length*100):0;
                      return (
                        <div key={label} style={{flex:1,background:bg,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                          <div style={{fontSize:13,fontWeight:800,color}}>{pct}%</div>
                          <div style={{fontSize:9,color:"#888",marginTop:1}}>{label}</div>
                          <div style={{fontSize:9,color:"#aaa"}}>{cnt}x</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* My History */}
          {bottomTab===2&&(
            <div style={{maxHeight:300,overflowY:"auto"}}>
              {myBets.length===0?(
                <div style={{textAlign:"center",padding:28,color:"#ccc",fontSize:13}}>No bets yet this session</div>
              ):(
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{background:"#fafafa",borderBottom:"1px solid #f0f0f0"}}>
                      <th style={{padding:"8px 8px",textAlign:"left",color:"#aaa",fontWeight:600}}>Bet</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#aaa",fontWeight:600}}>Amount</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#aaa",fontWeight:600}}>Dice</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#aaa",fontWeight:600}}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBets.map((b,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f8f8f8",background:b.won?"#f1f8e9":"#fff8f8"}}>
                        <td style={{padding:"7px 8px",color:"#444",fontWeight:600,fontSize:11}}>
                          {b.bet.type==="total"?`Sum ${b.bet.value}`:b.bet.type}
                        </td>
                        <td style={{padding:"7px 6px",textAlign:"center",fontWeight:700,color:"#444"}}>৳{b.bet.amount.toLocaleString()}</td>
                        <td style={{padding:"7px 6px"}}>
                          <div style={{display:"flex",gap:2,justifyContent:"center"}}>
                            {b.dice.map((v,j)=><MiniDice key={j} value={v} size={18}/>)}
                          </div>
                        </td>
                        <td style={{padding:"7px 6px",textAlign:"center"}}>
                          {b.won
                            ?<span style={{color:"#2e7d32",fontWeight:800,fontSize:12}}>+৳{b.payout.toLocaleString()}</span>
                            :<span style={{color:"#c62828",fontWeight:700,fontSize:12}}>Lost</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
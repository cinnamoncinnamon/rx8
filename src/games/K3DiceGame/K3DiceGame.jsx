import { useState, useEffect, useRef } from "react";

// ── markets ──────────────────────────────────────────────────────────────────
const _MX = [
  { id: "15s", label: "K3 15 Sec", seconds: 15  },
  { id: "30s", label: "K3 30 Sec", seconds: 30  },
  { id: "1m",  label: "K3 1 Min",  seconds: 60  },
  { id: "3m",  label: "K3 3 Min",  seconds: 180 },
];

// ── payout tables ─────────────────────────────────────────────────────────────
const _TP = {3:207.36,4:69.12,5:34.56,6:20.74,7:13.83,8:9.88,9:8.3,10:7.68,11:7.68,12:8.3,13:9.88,14:13.83,15:20.74,16:34.56,17:69.12,18:207.36};
const _2S = [{label:"1·1",pair:[1,1],payout:17.64},{label:"2·2",pair:[2,2],payout:17.64},{label:"3·3",pair:[3,3],payout:17.64},{label:"4·4",pair:[4,4],payout:17.64},{label:"5·5",pair:[5,5],payout:17.64},{label:"6·6",pair:[6,6],payout:17.64}];
const _3S = [{label:"Any Triple",key:"any3",payout:29.4},{label:"1·1·1",key:"111",triple:1,payout:176.4},{label:"2·2·2",key:"222",triple:2,payout:176.4},{label:"3·3·3",key:"333",triple:3,payout:176.4},{label:"4·4·4",key:"444",triple:4,payout:176.4},{label:"5·5·5",key:"555",triple:5,payout:176.4},{label:"6·6·6",key:"666",triple:6,payout:176.4}];
const _DC = ["1,2,3","1,2,4","1,2,5","1,2,6","1,3,4","1,3,5","1,3,6","1,4,5","1,4,6","1,5,6","2,3,4","2,3,5","2,3,6","2,4,5","2,4,6","2,5,6","3,4,5","3,4,6","3,5,6","4,5,6"].map(k=>({label:k,key:k,payout:17.64}));

// ── helpers ───────────────────────────────────────────────────────────────────
let _pc = 100;
const _gp = (mid) => {
  const n = new Date();
  const d = `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
  return `${d}${mid.toUpperCase()}${String(++_pc).padStart(6,"0")}`;
};
const _rd = () => [Math.ceil(Math.random()*6), Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)];
const _cl = (d) => {
  const s = d[0]+d[1]+d[2];
  return { sum:s, big: s>=11?"Big":"Small", oddEven: s%2===0?"Even":"Odd" };
};

// ── smart outcome: pick dice that produces the least-bet total ────────────────
function _smartRoll(betMap) {
  // betMap: { "total-7": 50, "big-big": 100, ... }
  const total = (d) => {
    const s = d[0]+d[1]+d[2];
    const {big,oddEven} = _cl(d);
    let wagered = 0;
    wagered += betMap[`total-${s}`]||0;
    wagered += betMap[`big-${big.toLowerCase()}`]||0;
    wagered += betMap[`small-${big.toLowerCase()}`]||0;
    wagered += betMap[`even-${oddEven.toLowerCase()}`]||0;
    wagered += betMap[`odd-${oddEven.toLowerCase()}`]||0;
    const sorted = [...d].sort((a,b)=>a-b);
    const isTriple = d[0]===d[1]&&d[1]===d[2];
    if(isTriple){
      wagered += betMap[`3same-any3`]||0;
      wagered += betMap[`3same-${d[0]}`]||0;
    }
    const hasPair = (v) => {
      let c=0; d.forEach(x=>{ if(x===v) c++; }); return c>=2;
    };
    _2S.forEach(item=>{ if(hasPair(item.pair[0])){ wagered += betMap[`2same-${JSON.stringify(item.pair)}`]||0; } });
    wagered += betMap[`diff-"${sorted.join(",")}"`]||0;
    return wagered;
  };

  // sample 40 combos, pick lowest wagered
  let best = null, bestW = Infinity;
  for(let t=0;t<40;t++){
    const d = _rd();
    const w = total(d);
    if(w < bestW){ bestW=w; best=d; }
  }
  return best || _rd();
}

// ── evaluate a single bet ─────────────────────────────────────────────────────
function _ev(bet, dice) {
  if(!bet) return {won:false,payout:0};
  const {type,value,amount} = bet;
  const {sum,big,oddEven} = _cl(dice);
  const sorted = [...dice].sort((a,b)=>a-b);
  let won=false, mult=0;
  if(type==="big"   && big==="Big")      {won=true;mult=2;}
  if(type==="small" && big==="Small")    {won=true;mult=2;}
  if(type==="even"  && oddEven==="Even") {won=true;mult=2;}
  if(type==="odd"   && oddEven==="Odd")  {won=true;mult=2;}
  if(type==="total" && value===sum)      {won=true;mult=_TP[value];}
  if(type==="2same"){
    const [a,b]=value;
    let c=0; dice.forEach(x=>{ if(x===a||x===b) c++; });
    if(dice.filter(x=>x===a).length>=1 && dice.filter(x=>x===b).length>=1 && (a!==b?true:dice.filter(x=>x===a).length>=2)){won=true;mult=17.64;}
  }
  if(type==="3same"){
    if(value==="any3" && dice[0]===dice[1]&&dice[1]===dice[2]){won=true;mult=29.4;}
    else if(typeof value==="number" && dice.every(d=>d===value)){won=true;mult=176.4;}
  }
  if(type==="diff"){
    const nums=value.split(",").map(Number).sort((a,b)=>a-b);
    if(JSON.stringify(sorted)===JSON.stringify(nums)){won=true;mult=17.64;}
  }
  return {won, payout: won ? parseFloat((amount*mult).toFixed(2)) : 0};
}

// ── dot positions for dice faces ──────────────────────────────────────────────
const _DOT = {
  1:[[50,50]],
  2:[[30,30],[70,70]],
  3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]],
  5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]],
};

// ── dice face SVG ─────────────────────────────────────────────────────────────
function _DiceFace({value=1, size=70}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="2" y="2" width="96" height="96" rx="18" ry="18"
        fill="url(#dg)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <defs>
        <radialGradient id="dg" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ff6b6b"/>
          <stop offset="100%" stopColor="#b71c1c"/>
        </radialGradient>
      </defs>
      {(_DOT[value]||_DOT[1]).map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r={8.5}
          fill="#FFD700"
          filter="url(#ds)"
        />
      ))}
      <defs>
        <filter id="ds">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.5"/>
        </filter>
      </defs>
    </svg>
  );
}

// ── rolling dice component ────────────────────────────────────────────────────
function RollingDice({value=1, size=70, rolling=false, delay=0}) {
  return (
    <div style={{
      width:size, height:size,
      borderRadius: size*0.18,
      boxShadow: rolling
        ? `0 0 0 2px rgba(255,215,0,0.6), 0 8px 24px rgba(0,0,0,0.5)`
        : `0 6px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
      position:"relative",
      animation: rolling ? `diceRoll 0.15s ease-in-out infinite` : `diceReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
      flexShrink:0,
      cursor:"default",
    }}>
      <_DiceFace value={value} size={size}/>
    </div>
  );
}

// ── mini dice for history/cards ───────────────────────────────────────────────
function MiniDice({value=1, size=22}) {
  return (
    <div style={{width:size,height:size,borderRadius:size*0.2,overflow:"hidden",display:"inline-block",flexShrink:0,boxShadow:"0 2px 4px rgba(0,0,0,0.4)"}}>
      <_DiceFace value={value} size={size}/>
    </div>
  );
}

// ── lottery ball ──────────────────────────────────────────────────────────────
function Ball({num, payout, selected, locked, onClick, isRed}) {
  const bg = selected
    ? (isRed ? "#7f0000" : "#003300")
    : isRed
      ? "radial-gradient(circle at 35% 30%, #ff8a80, #e53935 45%, #b71c1c)"
      : "radial-gradient(circle at 35% 30%, #a5d6a7, #43a047 45%, #1b5e20)";
  const shine = !selected;
  return (
    <div onClick={()=>!locked&&onClick()} style={{
      width:"100%", aspectRatio:"1",
      borderRadius:"50%",
      background: bg,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      cursor: locked?"not-allowed":"pointer",
      opacity: locked?0.55:1,
      boxShadow: selected
        ? `0 0 0 2.5px #FFD700, 0 4px 12px rgba(0,0,0,0.4)`
        : `0 4px 10px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.25)`,
      border: selected ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.3)",
      position:"relative",
      transition:"transform 0.12s, box-shadow 0.12s",
      userSelect:"none",
    }}
    onMouseEnter={e=>{ if(!locked) e.currentTarget.style.transform="scale(1.08)"; }}
    onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}
    onMouseDown={e=>{ if(!locked) e.currentTarget.style.transform="scale(0.94)"; }}
    onMouseUp={e=>{ if(!locked) e.currentTarget.style.transform="scale(1.08)"; }}
    >
      {shine && <div style={{position:"absolute",top:"12%",left:"20%",width:"30%",height:"18%",borderRadius:"50%",background:"rgba(255,255,255,0.55)",filter:"blur(2px)"}}/>}
      <span style={{color:"#fff",fontWeight:800,fontSize:14,lineHeight:1,textShadow:"0 1px 3px rgba(0,0,0,0.5)"}}>{num}</span>
      <span style={{color:"rgba(255,255,255,0.85)",fontSize:8.5,marginTop:1,textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>{payout}X</span>
    </div>
  );
}

// ── module-level market state (survives re-renders) ───────────────────────────
const _MS = {};
_MX.forEach(m => {
  _MS[m.id] = {
    timeLeft: m.seconds,
    period: _gp(m.id),
    dice: _rd(),
    history: [],
    bets: {},           // betKey -> total amount wagered this round
    listeners: new Set(),
    rolling: false,
  };
});

const _sub = (id, fn) => { _MS[id].listeners.add(fn); return ()=>_MS[id].listeners.delete(fn); };
const _notify = (id) => { _MS[id].listeners.forEach(fn=>fn({..._MS[id]})); };

if(!window.__k3v2Started) {
  window.__k3v2Started = true;
  _MX.forEach(m => {
    setInterval(() => {
      const ms = _MS[m.id];
      ms.timeLeft--;
      if(ms.timeLeft <= 0) {
        // roll smart dice
        ms.rolling = true;
        _notify(m.id);
        setTimeout(() => {
          const newDice = _smartRoll(ms.bets);
          const {sum,big,oddEven} = _cl(newDice);
          ms.history = [{period:ms.period,sum,big,oddEven,dice:newDice},...ms.history.slice(0,99)];
          ms.dice = newDice;
          ms.period = _gp(m.id);
          ms.timeLeft = m.seconds;
          ms.bets = {};
          ms.rolling = false;
          ms._justRolled = true;
          _notify(m.id);
          setTimeout(()=>{ ms._justRolled=false; _notify(m.id); }, 200);
        }, 1200);
      } else {
        _notify(m.id);
      }
    }, 1000);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function K3DiceGame({balance, setBalance, onBack}) {
  const [marketId, setMarketId]   = useState("30s");
  const [snap, setSnap]           = useState({..._MS[marketId]});
  const [activeTab, setActiveTab] = useState(0);   // 0=Total 1=2Same 2=3Same 3=Different
  const [betAmount, setBetAmount] = useState(10);
  const [pendingBet, setPendingBet] = useState(null);
  const [toast, setToast]         = useState(null);
  const [bottomTab, setBottomTab] = useState(0);   // 0=History 1=Chart 2=MyBets
  const [myBets, setMyBets]       = useState([]);
  const betRef = useRef(null);

  useEffect(() => {
    setSnap({..._MS[marketId]});
    const unsub = _sub(marketId, (s) => {
      setSnap({...s});
      if(s._justRolled && betRef.current) {
        const {won,payout} = _ev(betRef.current, s.dice);
        setMyBets(prev => [{
          period: s.history[0]?.period||"",
          bet: betRef.current,
          dice: s.dice,
          won, payout,
          time: new Date().toLocaleTimeString(),
        }, ...prev.slice(0,49)]);
        if(won) {
          setBalance(b=>parseFloat((b+payout).toFixed(2)));
          _toast(`🎉 Won ৳${payout}!`, "win");
        } else {
          _toast(`💸 Lost ৳${betRef.current.amount}`, "lose");
        }
        betRef.current = null;
        setPendingBet(null);
      }
    });
    return unsub;
  }, [marketId, setBalance]);

  const _toast = (msg, type="info") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2500);
  };

  const placeBet = (type, value, payout) => {
    if(balance < betAmount){ _toast("Insufficient balance","lose"); return; }
    if(betRef.current){ _toast("One bet per round","lose"); return; }
    if(snap.locked||snap.rolling||snap.timeLeft<=5){ _toast("Betting locked","lose"); return; }
    setBalance(b=>parseFloat((b-betAmount).toFixed(2)));
    const bet = {type,value,amount:betAmount,payout};
    betRef.current = bet;
    setPendingBet(bet);
    // register in market betMap
    const key = `${type}-${JSON.stringify(value)}`;
    _MS[marketId].bets[key] = (_MS[marketId].bets[key]||0) + betAmount;
    _toast(`✅ Placed ৳${betAmount}`,"info");
  };

  const {timeLeft, period, dice, history, rolling} = snap;
  const locked = timeLeft <= 5 || rolling;
  const mm = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss = String(timeLeft%60).padStart(2,"0");
  const selKey = pendingBet ? `${pendingBet.type}-${JSON.stringify(pendingBet.value)}` : null;

  const R = "#e53935", DR = "#b71c1c", G = "#2e7d32";

  // ── Chart data from history ────────────────────────────────────────────────
  const chartData = history.slice(0,20).reverse();

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:420,margin:"0 auto",background:"#f4f4f4",minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes diceRoll {
          0%   { transform: rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
          20%  { transform: rotateX(180deg) rotateY(90deg)  rotateZ(45deg); }
          40%  { transform: rotateX(90deg)  rotateY(270deg) rotateZ(180deg); }
          60%  { transform: rotateX(270deg) rotateY(180deg) rotateZ(90deg); }
          80%  { transform: rotateX(45deg)  rotateY(360deg) rotateZ(270deg); }
          100% { transform: rotateX(360deg) rotateY(0deg)   rotateZ(360deg); }
        }
        @keyframes diceReveal {
          0%   { transform: scale(0.4) rotateZ(-20deg); opacity:0; }
          60%  { transform: scale(1.15) rotateZ(5deg);  opacity:1; }
          80%  { transform: scale(0.95) rotateZ(-2deg); }
          100% { transform: scale(1)   rotateZ(0deg);  opacity:1; }
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(10px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes pulse {
          0%,100%{opacity:1} 50%{opacity:0.5}
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",
          background:toast.type==="win"?"#2e7d32":toast.type==="lose"?"#b71c1c":"#1565c0",
          color:"#fff",padding:"10px 22px",borderRadius:24,fontSize:14,fontWeight:700,
          zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 6px 20px rgba(0,0,0,0.35)",
          animation:"fadeUp 0.2s ease"}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${R},${DR})`,padding:"14px 16px",display:"flex",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",borderRadius:8,padding:"4px 12px",lineHeight:1,fontWeight:700}}>‹</button>
        <span style={{flex:1,textAlign:"center",color:"#fff",fontWeight:900,fontSize:20,letterSpacing:2,textShadow:"0 2px 4px rgba(0,0,0,0.3)"}}>K3 DICE</span>
        <div style={{width:40}}/>
      </div>

      {/* Wallet strip */}
      <div style={{background:"#fff",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #eee",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:R,letterSpacing:0.5}}>৳{(balance||0).toFixed(2)}</div>
          <div style={{fontSize:11,color:"#999",marginTop:1}}>💼 Wallet balance</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{padding:"8px 16px",background:R,color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13,boxShadow:"0 2px 6px rgba(229,57,53,0.35)"}}>Withdraw</button>
          <button style={{padding:"8px 16px",background:G,color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13,boxShadow:"0 2px 6px rgba(46,125,50,0.35)"}}>Deposit</button>
        </div>
      </div>

      {/* Market tabs */}
      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #eee",overflowX:"auto"}}>
        {_MX.map(m=>{
          const active = m.id===marketId;
          const ms = _MS[m.id];
          const t = ms.timeLeft;
          const tmm = String(Math.floor(t/60)).padStart(2,"0");
          const tss = String(t%60).padStart(2,"0");
          return (
            <button key={m.id} onClick={()=>setMarketId(m.id)} style={{
              flex:1,minWidth:70,padding:"10px 4px 8px",border:"none",
              background:active?"#fff":"#fafafa",
              borderBottom:active?`2.5px solid ${R}`:"2.5px solid transparent",
              cursor:"pointer",transition:"all 0.15s",
            }}>
              <div style={{fontSize:11,fontWeight:active?700:500,color:active?R:"#777"}}>{m.label}</div>
              <div style={{fontSize:11,color:active?DR:"#bbb",fontVariantNumeric:"tabular-nums",marginTop:1,fontWeight:600}}>{tmm}:{tss}</div>
            </button>
          );
        })}
      </div>

      {/* Period + countdown */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:"#fff",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{fontSize:10,color:"#888"}}>
          <span style={{color:"#1565c0",fontWeight:700,fontSize:10}}>{period}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          <span style={{fontSize:10,color:"#aaa",marginRight:4}}>Time</span>
          {[mm[0],mm[1],":",ss[0],ss[1]].map((c,i)=>
            c===":" ? <span key={i} style={{fontWeight:900,color:R,fontSize:18,margin:"0 1px"}}>:</span>
              : <span key={i} style={{background:R,color:"#fff",borderRadius:4,padding:"2px 5px",fontWeight:800,fontSize:15,minWidth:18,textAlign:"center",display:"inline-block",lineHeight:1.4}}>
                  {c}
                </span>
          )}
        </div>
      </div>

      {/* Lock bar */}
      {locked && (
        <div style={{background:rolling?"#1a237e":"#fff3e0",padding:"6px 14px",textAlign:"center",fontSize:12,fontWeight:700,color:rolling?"#fff":"#e65100",animation:rolling?"pulse 0.6s ease infinite":"none"}}>
          {rolling ? "🎲 Rolling dice…" : "🔒 Betting closed — waiting for result"}
        </div>
      )}

      {/* Dice display */}
      <div style={{background:"linear-gradient(160deg,#1b5e20,#2e7d32,#1b5e20)",margin:"10px 12px",borderRadius:16,padding:"18px 0",display:"flex",justifyContent:"center",alignItems:"center",gap:16,boxShadow:"0 6px 20px rgba(0,0,0,0.35)",border:"2px solid rgba(76,175,80,0.6)",position:"relative",overflow:"hidden",minHeight:110}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 8px)"}}/>
        {rolling ? (
          // rolling: show 3 random faces spinning fast
          [0,1,2].map(i=>(
            <div key={i} style={{animation:`diceRoll 0.3s ease-in-out infinite`,animationDelay:`${i*0.05}s`,perspective:200}}>
              <RollingDice value={Math.ceil(Math.random()*6)} size={72} rolling={true}/>
            </div>
          ))
        ) : (
          dice.map((v,i)=>(
            <RollingDice key={`${i}-${v}-${period}`} value={v} size={72} rolling={false} delay={i*0.08}/>
          ))
        )}
        {/* sum badge */}
        {!rolling && (
          <div style={{position:"absolute",bottom:8,right:12,background:"rgba(0,0,0,0.45)",borderRadius:10,padding:"3px 10px",fontSize:11,color:"#fff",fontWeight:700}}>
            Sum: {dice[0]+dice[1]+dice[2]} &nbsp;·&nbsp;
            <span style={{color: dice[0]+dice[1]+dice[2]>=11?"#FFD700":"#90caf9"}}>{dice[0]+dice[1]+dice[2]>=11?"Big":"Small"}</span>
            &nbsp;·&nbsp;
            <span style={{color:"#ef9a9a"}}>{(dice[0]+dice[1]+dice[2])%2===0?"Even":"Odd"}</span>
          </div>
        )}
      </div>

      {/* Bet type tabs */}
      <div style={{display:"flex",margin:"0 12px",background:"#fff",borderRadius:10,overflow:"hidden",border:"1px solid #e5e5e5",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        {["Total","2 Same","3 Same","Different"].map((t,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)} style={{
            flex:1,padding:"9px 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:i===activeTab?700:400,
            background:i===activeTab?R:"transparent",color:i===activeTab?"#fff":"#666",
            transition:"all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* Bet area */}
      <div style={{padding:"10px 12px 0",flex:1,overflowY:"auto"}}>

        {/* ── Total ── */}
        {activeTab===0 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {Object.entries(_TP).map(([n,p])=>{
              const num=parseInt(n);
              const isRed=num<=10;
              const sel=selKey===`total-${JSON.stringify(num)}`;
              return (
                <Ball key={num} num={num} payout={p} selected={sel} locked={locked} isRed={isRed}
                  onClick={()=>placeBet("total",num,p)}/>
              );
            })}
          </div>
        )}

        {/* ── 2 Same ── */}
        {activeTab===1 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {_2S.map(item=>{
              const sel=selKey===`2same-${JSON.stringify(item.pair)}`;
              return (
                <div key={item.label} onClick={()=>!locked&&placeBet("2same",item.pair,item.payout)} style={{
                  background:sel?"#7f0000":"radial-gradient(circle at 30% 25%, #ff8a80, #e53935 50%, #b71c1c)",
                  borderRadius:12,padding:"12px 6px",display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:locked?"not-allowed":"pointer",opacity:locked?0.55:1,
                  boxShadow:sel?"0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.3)":"0 4px 10px rgba(0,0,0,0.3)",
                  border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.25)",gap:6,
                  transition:"transform 0.12s",userSelect:"none",
                }}
                onMouseEnter={e=>{ if(!locked) e.currentTarget.style.transform="scale(1.05)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}
                >
                  <div style={{display:"flex",gap:5}}>
                    <MiniDice value={item.pair[0]} size={28}/><MiniDice value={item.pair[1]} size={28}/>
                  </div>
                  <span style={{color:"#fff",fontWeight:700,fontSize:11,textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.8)",fontSize:10}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 3 Same ── */}
        {activeTab===2 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {_3S.map(item=>{
              const v = item.key==="any3"?"any3":item.triple;
              const sel=selKey===`3same-${JSON.stringify(v)}`;
              const isAny=item.key==="any3";
              return (
                <div key={item.key} onClick={()=>!locked&&placeBet("3same",v,item.payout)} style={{
                  background:sel?(isAny?"#5d3000":"#7f0000"):isAny?"radial-gradient(circle at 30% 25%, #ffcc80, #ffa726 50%, #e65100)":"radial-gradient(circle at 30% 25%, #ff8a80, #e53935 50%, #b71c1c)",
                  borderRadius:12,padding:"14px 8px",display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:locked?"not-allowed":"pointer",opacity:locked?0.55:1,
                  boxShadow:sel?"0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.3)":"0 4px 10px rgba(0,0,0,0.3)",
                  border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.25)",gap:6,
                  transition:"transform 0.12s",userSelect:"none",
                }}
                onMouseEnter={e=>{ if(!locked) e.currentTarget.style.transform="scale(1.04)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}
                >
                  {isAny
                    ? <span style={{fontSize:26}}>🎲</span>
                    : <div style={{display:"flex",gap:3}}>{[0,1,2].map(j=><MiniDice key={j} value={item.triple} size={22}/>)}</div>
                  }
                  <span style={{color:"#fff",fontWeight:700,fontSize:12,textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.8)",fontSize:10}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Different ── */}
        {activeTab===3 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
            {_DC.map(item=>{
              const sel=selKey===`diff-${JSON.stringify(item.key)}`;
              return (
                <div key={item.key} onClick={()=>!locked&&placeBet("diff",item.key,item.payout)} style={{
                  background:sel?"#003300":"radial-gradient(circle at 30% 25%, #a5d6a7, #43a047 50%, #1b5e20)",
                  borderRadius:9,padding:"9px 3px",display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:locked?"not-allowed":"pointer",opacity:locked?0.55:1,
                  boxShadow:sel?"0 0 0 2.5px #FFD700":"0 3px 8px rgba(0,0,0,0.3)",
                  border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.2)",gap:2,
                  transition:"transform 0.12s",userSelect:"none",
                }}
                onMouseEnter={e=>{ if(!locked) e.currentTarget.style.transform="scale(1.06)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}
                >
                  <span style={{color:"#fff",fontWeight:700,fontSize:10,textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.8)",fontSize:8.5}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Big / Small / Even / Odd ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
          {[
            {k:"small",label:"Small",bg:"linear-gradient(145deg,#42a5f5,#1565c0)"},
            {k:"big",  label:"Big",  bg:"linear-gradient(145deg,#ffa726,#e65100)"},
            {k:"even", label:"Even", bg:"linear-gradient(145deg,#66bb6a,#2e7d32)"},
            {k:"odd",  label:"Odd",  bg:"linear-gradient(145deg,#ef5350,#b71c1c)"},
          ].map(({k,label,bg})=>{
            const sel=selKey===`${k}-${JSON.stringify(k)}`;
            return (
              <button key={k} onClick={()=>!locked&&placeBet(k,k,2)} style={{
                background:sel?"#222":bg,
                border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.2)",
                borderRadius:10,padding:"11px 0",color:"#fff",fontWeight:800,fontSize:14,
                cursor:locked?"not-allowed":"pointer",
                boxShadow:sel?"0 0 0 2.5px #FFD700":"0 3px 10px rgba(0,0,0,0.3)",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                opacity:locked?0.55:1,transition:"transform 0.12s",
              }}
              onMouseEnter={e=>{ if(!locked) e.currentTarget.style.transform="scale(1.05)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}
              >
                <span>{label}</span>
                <span style={{fontSize:10,fontWeight:400,opacity:0.85}}>2X</span>
              </button>
            );
          })}
        </div>

        {/* ── Bet amount ── */}
        <div style={{background:"#fff",borderRadius:12,padding:"12px",marginTop:10,border:"1px solid #e5e5e5",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:13,color:"#555",fontWeight:700,whiteSpace:"nowrap"}}>Bet ৳</span>
            <div style={{flex:1,background:"#1a1a1a",borderRadius:8,padding:"9px 14px",fontSize:16,fontWeight:800,color:"#fff",textAlign:"center",letterSpacing:1}}>
              {betAmount}
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {[10,50,100,500,1000].map(v=>(
              <button key={v} onClick={()=>setBetAmount(v)} style={{
                flex:1,background:betAmount===v?R:"#f5f5f5",
                color:betAmount===v?"#fff":"#555",
                border:`1.5px solid ${betAmount===v?R:"#e0e0e0"}`,
                borderRadius:7,padding:"7px 0",fontSize:11.5,fontWeight:betAmount===v?700:500,cursor:"pointer",
              }}>৳{v}</button>
            ))}
          </div>
        </div>

        {pendingBet && (
          <div style={{background:"#fff8e1",border:"1.5px solid #ffd54f",borderRadius:10,padding:"8px 14px",marginTop:8,fontSize:12,color:"#e65100",fontWeight:700,textAlign:"center"}}>
            ⏳ ৳{pendingBet.amount} on {pendingBet.type==="total"?`Sum ${pendingBet.value}`:pendingBet.type} — awaiting result
          </div>
        )}

        {/* ── Bottom section: History / Chart / My Bets ── */}
        <div style={{marginTop:12,background:"#fff",borderRadius:14,border:"1px solid #e5e5e5",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",overflow:"hidden",marginBottom:12}}>
          {/* sub tabs */}
          <div style={{display:"flex",borderBottom:"1px solid #eee"}}>
            {["Game History","Chart","My History"].map((t,i)=>(
              <button key={i} onClick={()=>setBottomTab(i)} style={{
                flex:1,padding:"10px 0",border:"none",background:bottomTab===i?"#fff":"#fafafa",
                borderBottom:bottomTab===i?`2.5px solid ${R}`:"2.5px solid transparent",
                color:bottomTab===i?R:"#888",fontWeight:bottomTab===i?700:400,
                fontSize:12,cursor:"pointer",transition:"all 0.15s",
              }}>{t}</button>
            ))}
          </div>

          {/* ── Game History ── */}
          {bottomTab===0 && (
            <div style={{maxHeight:260,overflowY:"auto"}}>
              {history.length===0 ? (
                <div style={{textAlign:"center",padding:28,color:"#ccc",fontSize:13}}>No rounds yet</div>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:"#fafafa",borderBottom:"1px solid #f0f0f0"}}>
                      <th style={{padding:"8px 10px",textAlign:"left",color:"#999",fontWeight:600}}>Period</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#999",fontWeight:600}}>Sum</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#999",fontWeight:600}}>Result</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#999",fontWeight:600}}>Dice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f8f8f8",background:i%2===0?"#fff":"#fafafa"}}>
                        <td style={{padding:"7px 10px",fontSize:9,color:"#1565c0",fontWeight:600,fontFamily:"monospace"}}>{row.period.slice(-8)}</td>
                        <td style={{padding:"7px 6px",textAlign:"center",fontWeight:800,fontSize:15,color:"#222"}}>{row.sum}</td>
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

          {/* ── Chart ── */}
          {bottomTab===1 && (
            <div style={{padding:"12px 10px",maxHeight:280,overflowY:"auto"}}>
              {chartData.length===0 ? (
                <div style={{textAlign:"center",padding:28,color:"#ccc",fontSize:13}}>No data yet</div>
              ) : (
                <>
                  <div style={{fontSize:11,color:"#aaa",marginBottom:8,textAlign:"center"}}>Sum trend (last {chartData.length} rounds)</div>
                  {/* Bar chart */}
                  <div style={{display:"flex",alignItems:"flex-end",gap:3,height:100,padding:"0 4px"}}>
                    {chartData.map((row,i)=>{
                      const h = Math.max(10, ((row.sum-3)/(18-3))*100);
                      const clr = row.sum>=11?"#e53935":"#1565c0";
                      return (
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                          <div style={{fontSize:8,color:"#999",fontWeight:700}}>{row.sum}</div>
                          <div style={{width:"100%",height:`${h}%`,background:clr,borderRadius:"3px 3px 0 0",minHeight:6,transition:"height 0.3s"}}/>
                        </div>
                      );
                    })}
                  </div>
                  {/* Big/Small ratio */}
                  <div style={{marginTop:12,display:"flex",gap:8}}>
                    {[["Big","#e65100","#fff3e0"],["Small","#1565c0","#e3f2fd"],["Even","#2e7d32","#e8f5e9"],["Odd","#c62828","#fce4ec"]].map(([label,color,bg])=>{
                      const cnt = history.filter(r=>r.big===label||r.oddEven===label).length;
                      const pct = history.length ? Math.round(cnt/history.length*100) : 0;
                      return (
                        <div key={label} style={{flex:1,background:bg,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                          <div style={{fontSize:11,fontWeight:800,color}}>{pct}%</div>
                          <div style={{fontSize:9,color:"#888",marginTop:2}}>{label}</div>
                          <div style={{fontSize:9,color:"#aaa"}}>{cnt}x</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── My Bets ── */}
          {bottomTab===2 && (
            <div style={{maxHeight:280,overflowY:"auto"}}>
              {myBets.length===0 ? (
                <div style={{textAlign:"center",padding:28,color:"#ccc",fontSize:13}}>No bets yet this session</div>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{background:"#fafafa",borderBottom:"1px solid #f0f0f0"}}>
                      <th style={{padding:"8px 8px",textAlign:"left",color:"#999",fontWeight:600}}>Bet</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#999",fontWeight:600}}>Amount</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#999",fontWeight:600}}>Dice</th>
                      <th style={{padding:"8px 6px",textAlign:"center",color:"#999",fontWeight:600}}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBets.map((b,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f8f8f8",background:b.won?"#f1f8e9":"#fff8f8"}}>
                        <td style={{padding:"7px 8px",color:"#444",fontWeight:600}}>
                          {b.bet.type==="total"?`Sum ${b.bet.value}`:b.bet.type}
                        </td>
                        <td style={{padding:"7px 6px",textAlign:"center",fontWeight:700,color:"#444"}}>৳{b.bet.amount}</td>
                        <td style={{padding:"7px 6px"}}>
                          <div style={{display:"flex",gap:2,justifyContent:"center"}}>
                            {b.dice.map((v,j)=><MiniDice key={j} value={v} size={18}/>)}
                          </div>
                        </td>
                        <td style={{padding:"7px 6px",textAlign:"center"}}>
                          {b.won
                            ? <span style={{color:"#2e7d32",fontWeight:800,fontSize:12}}>+৳{b.payout}</span>
                            : <span style={{color:"#c62828",fontWeight:700,fontSize:12}}>Lost</span>
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
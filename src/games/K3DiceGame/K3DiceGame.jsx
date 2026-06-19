import { useState, useEffect, useRef, useCallback } from "react";

// ─── Markets ────────────────────────────────────────────────────────────────
const MARKETS = [
  { id: "30s",  label: "K3 30 Sec", seconds: 30  },
  { id: "1m",   label: "K3 1 Min",  seconds: 60  },
  { id: "3m",   label: "K3 3 Min",  seconds: 180 },
];

// ─── Payout tables ──────────────────────────────────────────────────────────
const TOTAL_PAYOUTS = {
  3:207.36, 4:69.12, 5:34.56, 6:20.74,
  7:13.83,  8:9.88,  9:8.3,   10:7.68,
  11:7.68, 12:8.3,  13:9.88,  14:13.83,
  15:20.74,16:34.56,17:69.12, 18:207.36,
};
const TWO_SAME = [
  {label:"1·1",pair:[1,1],payout:17.64},{label:"2·2",pair:[2,2],payout:17.64},
  {label:"3·3",pair:[3,3],payout:17.64},{label:"4·4",pair:[4,4],payout:17.64},
  {label:"5·5",pair:[5,5],payout:17.64},{label:"6·6",pair:[6,6],payout:17.64},
];
const THREE_SAME = [
  {label:"Any Triple",key:"any3",payout:29.4},
  {label:"1·1·1",key:"111",triple:1,payout:176.4},{label:"2·2·2",key:"222",triple:2,payout:176.4},
  {label:"3·3·3",key:"333",triple:3,payout:176.4},{label:"4·4·4",key:"444",triple:4,payout:176.4},
  {label:"5·5·5",key:"555",triple:5,payout:176.4},{label:"6·6·6",key:"666",triple:6,payout:176.4},
];
const DIFF_COMBOS = [
  "1,2,3","1,2,4","1,2,5","1,2,6","1,3,4","1,3,5","1,3,6","1,4,5","1,4,6","1,5,6",
  "2,3,4","2,3,5","2,3,6","2,4,5","2,4,6","2,5,6","3,4,5","3,4,6","3,5,6","4,5,6",
].map(k=>({label:k,key:k,payout:17.64}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _periodCounter = 100;
function genPeriod(marketId) {
  const now = new Date();
  const d = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  _periodCounter++;
  return `${d}${marketId.toUpperCase()}${String(_periodCounter).padStart(6,"0")}`;
}

function rollDice() {
  return [Math.ceil(Math.random()*6), Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)];
}

function classify(dice) {
  const sum = dice.reduce((a,b)=>a+b,0);
  return { sum, big: sum>=11?"Big":"Small", oddEven: sum%2===0?"Even":"Odd" };
}

function evalBet(bet, dice) {
  if(!bet) return {won:false,payout:0};
  const {type,value,amount} = bet;
  const {sum,big,oddEven} = classify(dice);
  const sorted = [...dice].sort((a,b)=>a-b);
  let won = false, mult = 0;
  if(type==="big"   && big==="Big")     {won=true;mult=2;}
  if(type==="small" && big==="Small")   {won=true;mult=2;}
  if(type==="even"  && oddEven==="Even"){won=true;mult=2;}
  if(type==="odd"   && oddEven==="Odd") {won=true;mult=2;}
  if(type==="total" && value===sum)     {won=true;mult=TOTAL_PAYOUTS[value];}
  if(type==="2same"){
    const [a,b]=value;
    if((dice[0]===a&&dice[1]===b)||(dice[0]===a&&dice[2]===b)||(dice[1]===a&&dice[2]===b)||
       (dice[0]===b&&dice[1]===a)||(dice[0]===b&&dice[2]===a)||(dice[1]===b&&dice[2]===a))
      {won=true;mult=17.64;}
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

// ─── 3D Dice component ───────────────────────────────────────────────────────
const DOT_POS = {
  1:[[50,50]],
  2:[[28,28],[72,72]],
  3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]],
  5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]],
};

function Dice3D({value=1, size=72, shaking=false}) {
  return (
    <div style={{
      width:size, height:size,
      borderRadius: size*0.18,
      background:"linear-gradient(145deg,#ff5252,#b71c1c)",
      boxShadow:`0 ${size*0.07}px ${size*0.14}px rgba(0,0,0,0.5), inset 0 ${size*0.03}px ${size*0.06}px rgba(255,255,255,0.25), inset 0 -${size*0.03}px ${size*0.06}px rgba(0,0,0,0.3)`,
      position:"relative",
      animation: shaking ? "diceShake 0.08s linear infinite" : "none",
      flexShrink:0,
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position:"absolute",top:0,left:0}}>
        {(DOT_POS[value]||DOT_POS[1]).map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r={9}
            fill="#FFD700"
            style={{filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.4))"}}
          />
        ))}
      </svg>
    </div>
  );
}

function DiceMini({value=1,size=24}) {
  return (
    <div style={{
      width:size,height:size,borderRadius:size*0.18,
      background:"linear-gradient(145deg,#ff5252,#b71c1c)",
      boxShadow:`0 2px 4px rgba(0,0,0,0.4)`,
      position:"relative",display:"inline-block",flexShrink:0,
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position:"absolute",top:0,left:0}}>
        {(DOT_POS[value]||DOT_POS[1]).map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r={10} fill="#FFD700"/>
        ))}
      </svg>
    </div>
  );
}

// ─── Always-running market clocks (module-level, survive re-renders) ─────────
const marketState = {};
MARKETS.forEach(m => {
  marketState[m.id] = {
    timeLeft: m.seconds,
    period: genPeriod(m.id),
    dice: rollDice(),
    history: [],
    listeners: new Set(),
  };
});

function subscribeMarket(id, fn) {
  marketState[id].listeners.add(fn);
  return () => marketState[id].listeners.delete(fn);
}
function notifyMarket(id) {
  marketState[id].listeners.forEach(fn => fn({...marketState[id]}));
}

// Start global tickers once
if(!window.__k3TickersStarted) {
  window.__k3TickersStarted = true;
  MARKETS.forEach(m => {
    setInterval(() => {
      const ms = marketState[m.id];
      ms.timeLeft--;
      if(ms.timeLeft <= 0) {
        const newDice = rollDice();
        const {sum,big,oddEven} = classify(newDice);
        ms.history = [{period:ms.period,sum,big,oddEven,dice:newDice},...ms.history.slice(0,49)];
        ms.dice = newDice;
        ms.period = genPeriod(m.id);
        ms.timeLeft = m.seconds;
        ms._justRolled = true;
        setTimeout(()=>{ms._justRolled=false; notifyMarket(m.id);}, 700);
      }
      notifyMarket(m.id);
    }, 1000);
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function K3DiceGame({balance, setBalance, onBack}) {
  const [marketId, setMarketId] = useState("30s");
  const [mktSnap, setMktSnap] = useState({...marketState[marketId]});
  const [activeTab, setActiveTab] = useState(0);
  const [pendingBet, setPendingBet] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [toast, setToast] = useState(null);
  const [subScreen, setSubScreen] = useState("game");
  const prevDiceRef = useRef(marketState[marketId].dice);
  const [shaking, setShaking] = useState(false);
  const betRef = useRef(null);

  // Subscribe to current market
  useEffect(() => {
    setMktSnap({...marketState[marketId]});
    const unsub = subscribeMarket(marketId, (snap) => {
      setMktSnap({...snap});
      // detect roll
      if(snap._justRolled === false && prevDiceRef.current !== snap.dice) {
        prevDiceRef.current = snap.dice;
        setShaking(true);
        setTimeout(()=>setShaking(false), 600);
        // evaluate bet
        if(betRef.current) {
          const {won,payout} = evalBet(betRef.current, snap.dice);
          if(won) {
            setBalance(b => parseFloat((b+payout).toFixed(2)));
            showToast(`🎉 Won ৳${payout}!`,"win");
          } else {
            showToast(`Lost ৳${betRef.current.amount}`,"lose");
          }
          betRef.current = null;
          setPendingBet(null);
        }
      }
    });
    return unsub;
  }, [marketId, setBalance]);

  const showToast = (msg, type="info") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2500);
  };

  const placeBet = (type, value, payout) => {
    if(balance < betAmount){ showToast("Insufficient balance","lose"); return; }
    if(betRef.current){ showToast("Bet already placed for this round","lose"); return; }
    setBalance(b => parseFloat((b-betAmount).toFixed(2)));
    const bet = {type,value,amount:betAmount,payout};
    betRef.current = bet;
    setPendingBet(bet);
    showToast(`✅ Bet ৳${betAmount} placed`,"info");
  };

  const {timeLeft, period, dice, history} = mktSnap;
  const mm = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss = String(timeLeft%60).padStart(2,"0");
  const market = MARKETS.find(m=>m.id===marketId);

  // Determine if betting is locked (last 5 seconds)
  const locked = timeLeft <= 5;

  const selKey = pendingBet ? `${pendingBet.type}-${JSON.stringify(pendingBet.value)}` : null;

  // ── Styles ──
  const C = {
    red:"#e53935", darkRed:"#b71c1c", green:"#2e7d32",
    blue:"#1565c0", orange:"#f57c00", bg:"#f8f8f8",
  };

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:420,margin:"0 auto",background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes diceShake {
          0%{transform:translate(-2px,-2px) rotate(-3deg)}
          25%{transform:translate(2px,-2px) rotate(3deg)}
          50%{transform:translate(-2px,2px) rotate(-2deg)}
          75%{transform:translate(2px,2px) rotate(2deg)}
          100%{transform:translate(0,0) rotate(0)}
        }
        @keyframes diceReveal {
          0%{transform:scale(0.6) rotate(-10deg);opacity:0}
          60%{transform:scale(1.12) rotate(2deg);opacity:1}
          100%{transform:scale(1) rotate(0);opacity:1}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
        .bet-ball:hover{transform:scale(1.07);transition:transform 0.15s;}
        .bet-ball:active{transform:scale(0.95);}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",
          background:toast.type==="win"?"#2e7d32":toast.type==="lose"?"#b71c1c":"#333",
          color:"#fff",padding:"10px 24px",borderRadius:24,fontSize:14,fontWeight:700,
          zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
          animation:"fadeUp 0.2s ease"}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.red},${C.darkRed})`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 2px 8px rgba(0,0,0,0.25)"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",borderRadius:8,padding:"4px 10px",lineHeight:1}}>‹</button>
        <span style={{flex:1,textAlign:"center",color:"#fff",fontWeight:800,fontSize:19,letterSpacing:1.5,textShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>K3 DICE</span>
        <div style={{width:36}}/>
      </div>

      {/* Wallet */}
      <div style={{background:"#fff",margin:"12px 12px 0",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 10px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0"}}>
        <div style={{textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:28,fontWeight:800,color:C.red,letterSpacing:1}}>৳{(balance||0).toFixed(2)}</div>
          <div style={{fontSize:12,color:"#888",marginTop:2}}>💼 Wallet balance</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,padding:"9px 0",background:C.red,color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14,boxShadow:"0 2px 6px rgba(229,57,53,0.4)"}}>Withdraw</button>
          <button style={{flex:1,padding:"9px 0",background:C.green,color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14,boxShadow:"0 2px 6px rgba(46,125,50,0.4)"}}>Deposit</button>
        </div>
      </div>

      {/* Market Selector */}
      <div style={{display:"flex",gap:8,padding:"12px 12px 0"}}>
        {MARKETS.map(m=>{
          const active = m.id===marketId;
          const mktTime = marketState[m.id].timeLeft;
          const mktMM = String(Math.floor(mktTime/60)).padStart(2,"0");
          const mktSS = String(mktTime%60).padStart(2,"0");
          return (
            <button key={m.id} onClick={()=>setMarketId(m.id)} style={{
              flex:1,background:active?"#fff":"transparent",
              border:active?`2px solid ${C.red}`:"2px solid #e0e0e0",
              borderRadius:12,padding:"8px 4px",cursor:"pointer",
              boxShadow:active?"0 2px 10px rgba(229,57,53,0.2)":"none",
              transition:"all 0.2s",
            }}>
              <div style={{fontSize:13,fontWeight:active?700:500,color:active?C.red:"#555"}}>{m.label}</div>
              <div style={{fontSize:11,color:active?C.darkRed:"#999",marginTop:2,fontVariantNumeric:"tabular-nums"}}>
                {mktMM}:{mktSS}
              </div>
            </button>
          );
        })}
      </div>

      {/* Period + timer */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px 4px",fontSize:11}}>
        <div style={{color:"#666"}}>
          <span style={{fontWeight:600,color:C.red,marginRight:4}}>📋</span>
          <span style={{color:C.blue,fontWeight:600}}>{period}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <span style={{color:"#888",marginRight:4}}>Time</span>
          {[mm[0],mm[1],":",ss[0],ss[1]].map((c,i)=>
            c===":"
              ? <span key={i} style={{fontWeight:800,color:C.red,fontSize:18,lineHeight:1}}>:</span>
              : <span key={i} style={{background:C.red,color:"#fff",borderRadius:5,padding:"2px 5px",fontWeight:800,fontSize:16,lineHeight:1.4,minWidth:20,textAlign:"center",display:"inline-block"}}>
                  {c}
                </span>
          )}
        </div>
      </div>

      {/* Lock indicator */}
      {locked && (
        <div style={{background:"#fff3e0",margin:"0 12px",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,color:C.orange,textAlign:"center",border:"1px solid #ffe0b2"}}>
          🔒 Betting locked — waiting for result
        </div>
      )}

      {/* Dice display */}
      <div style={{background:"linear-gradient(135deg,#1b5e20,#2e7d32,#1b5e20)",margin:"10px 12px",borderRadius:18,padding:"20px 0",display:"flex",justifyContent:"center",alignItems:"center",gap:18,boxShadow:"0 4px 16px rgba(0,0,0,0.3)",border:"2px solid #4caf50",position:"relative",overflow:"hidden"}}>
        {/* felt texture */}
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 8px)",pointerEvents:"none"}}/>
        {dice.map((v,i)=>(
          <div key={i} style={{animation: shaking ? `diceShake 0.08s linear infinite` : `diceReveal 0.4s ease ${i*0.06}s both`}}>
            <Dice3D value={v} size={72} />
          </div>
        ))}
      </div>

      {/* Bet tabs */}
      <div style={{display:"flex",margin:"0 12px",background:"#fff",borderRadius:10,overflow:"hidden",border:"1px solid #e0e0e0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        {["Total","2 Same","3 Same","Different"].map((t,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)} style={{
            flex:1,padding:"9px 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:i===activeTab?700:400,
            background:i===activeTab?C.red:"transparent",color:i===activeTab?"#fff":"#666",
            transition:"all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* Bet area */}
      <div style={{padding:"10px 12px 4px",flex:1,overflowY:"auto"}}>

        {/* Total */}
        {activeTab===0 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {Object.entries(TOTAL_PAYOUTS).map(([n,p])=>{
              const num=parseInt(n);
              const isRed=num<=10;
              const k=`total-${num}`;
              const sel=selKey===`total-${JSON.stringify(num)}`;
              return (
                <div key={num} className="bet-ball" onClick={()=>!locked&&placeBet("total",num,p)} style={{
                  background:sel?(isRed?"#7f0000":"#1a3a00"):isRed?"linear-gradient(145deg,#ef5350,#b71c1c)":"linear-gradient(145deg,#66bb6a,#2e7d32)",
                  borderRadius:"50%",aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  cursor:locked?"not-allowed":"pointer",opacity:locked?0.6:1,
                  boxShadow:sel?"0 0 0 3px #FFD700, 0 4px 8px rgba(0,0,0,0.3)":"0 3px 8px rgba(0,0,0,0.25)",
                  border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.2)",
                  transition:"all 0.15s",
                }}>
                  <span style={{color:"#fff",fontWeight:800,fontSize:15,lineHeight:1}}>{num}</span>
                  <span style={{color:"rgba(255,255,255,0.8)",fontSize:9,marginTop:2}}>{p}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 2 Same */}
        {activeTab===1 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {TWO_SAME.map(item=>{
              const k=`2same-${JSON.stringify(item.pair)}`;
              const sel=selKey===k;
              return (
                <div key={item.label} className="bet-ball" onClick={()=>!locked&&placeBet("2same",item.pair,item.payout)} style={{
                  background:sel?"#7f0000":"linear-gradient(145deg,#ef5350,#b71c1c)",
                  borderRadius:12,padding:"12px 6px",display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:locked?"not-allowed":"pointer",opacity:locked?0.6:1,
                  boxShadow:sel?"0 0 0 3px #FFD700":"0 3px 8px rgba(0,0,0,0.25)",
                  border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.15)",
                  gap:4,
                }}>
                  <div style={{display:"flex",gap:4}}>
                    <DiceMini value={item.pair[0]} size={26}/>
                    <DiceMini value={item.pair[1]} size={26}/>
                  </div>
                  <span style={{color:"#fff",fontWeight:700,fontSize:11}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.75)",fontSize:10}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 3 Same */}
        {activeTab===2 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {THREE_SAME.map(item=>{
              const v = item.key==="any3" ? "any3" : item.triple;
              const k=`3same-${JSON.stringify(v)}`;
              const sel=selKey===k;
              const isAny=item.key==="any3";
              return (
                <div key={item.key} className="bet-ball" onClick={()=>!locked&&placeBet("3same",v,item.payout)} style={{
                  background:sel?(isAny?"#e65100":"#7f0000"):isAny?"linear-gradient(145deg,#ffa726,#e65100)":"linear-gradient(145deg,#ef5350,#b71c1c)",
                  borderRadius:12,padding:"12px 8px",display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:locked?"not-allowed":"pointer",opacity:locked?0.6:1,
                  boxShadow:sel?"0 0 0 3px #FFD700":"0 3px 8px rgba(0,0,0,0.25)",
                  border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.15)",gap:6,
                }}>
                  {isAny
                    ? <span style={{fontSize:22}}>🎲</span>
                    : <div style={{display:"flex",gap:3}}>{[0,1,2].map(j=><DiceMini key={j} value={item.triple} size={22}/>)}</div>
                  }
                  <span style={{color:"#fff",fontWeight:700,fontSize:12}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.75)",fontSize:10}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Different */}
        {activeTab===3 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {DIFF_COMBOS.map(item=>{
              const k=`diff-${JSON.stringify(item.key)}`;
              const sel=selKey===k;
              return (
                <div key={item.key} className="bet-ball" onClick={()=>!locked&&placeBet("diff",item.key,item.payout)} style={{
                  background:sel?"#1a3a00":"linear-gradient(145deg,#66bb6a,#2e7d32)",
                  borderRadius:10,padding:"10px 4px",display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:locked?"not-allowed":"pointer",opacity:locked?0.6:1,
                  boxShadow:sel?"0 0 0 3px #FFD700":"0 3px 8px rgba(0,0,0,0.25)",
                  border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.15)",gap:3,
                }}>
                  <span style={{color:"#fff",fontWeight:700,fontSize:11}}>{item.label}</span>
                  <span style={{color:"rgba(255,255,255,0.75)",fontSize:9}}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Big/Small/Even/Odd */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
          {[
            {k:"small",label:"Small",mult:"2X",bg:"linear-gradient(145deg,#42a5f5,#1565c0)"},
            {k:"big",  label:"Big",  mult:"2X",bg:"linear-gradient(145deg,#ffa726,#e65100)"},
            {k:"even", label:"Even", mult:"2X",bg:"linear-gradient(145deg,#66bb6a,#2e7d32)"},
            {k:"odd",  label:"Odd",  mult:"2X",bg:"linear-gradient(145deg,#ef5350,#b71c1c)"},
          ].map(({k,label,mult,bg})=>{
            const sel=selKey===`${k}-${JSON.stringify(k)}`;
            return (
              <button key={k} className="bet-ball" onClick={()=>!locked&&placeBet(k,k,2)} style={{
                background:sel?"#222":bg,
                border:sel?"2px solid #FFD700":"2px solid rgba(255,255,255,0.15)",
                borderRadius:10,padding:"11px 0",color:"#fff",fontWeight:800,fontSize:14,cursor:locked?"not-allowed":"pointer",
                boxShadow:sel?"0 0 0 3px #FFD700":"0 3px 8px rgba(0,0,0,0.25)",
                display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:locked?0.6:1,
              }}>
                <span>{label}</span>
                <span style={{fontSize:10,fontWeight:400,opacity:0.85}}>{mult}</span>
              </button>
            );
          })}
        </div>

        {/* Bet amount */}
        <div style={{background:"#fff",borderRadius:12,padding:"12px",marginTop:10,border:"1px solid #e0e0e0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:13,color:"#555",fontWeight:600,whiteSpace:"nowrap"}}>Bet ৳</span>
            <input type="number" value={betAmount} min={1}
              onChange={e=>setBetAmount(Math.max(1,parseFloat(e.target.value)||1))}
              style={{flex:1,border:"1.5px solid #e0e0e0",borderRadius:8,padding:"8px 10px",fontSize:15,textAlign:"center",fontWeight:700,outline:"none"}}
            />
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[10,50,100,500,1000].map(v=>(
              <button key={v} onClick={()=>setBetAmount(v)} style={{
                background:betAmount===v?C.red:"#f5f5f5",color:betAmount===v?"#fff":"#444",
                border:betAmount===v?`1.5px solid ${C.red}`:"1.5px solid #e0e0e0",
                borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:betAmount===v?700:400,cursor:"pointer",
              }}>৳{v}</button>
            ))}
          </div>
        </div>

        {pendingBet && (
          <div style={{background:"#fff8e1",border:"1.5px solid #ffd54f",borderRadius:10,padding:"8px 14px",marginTop:8,fontSize:12,color:"#e65100",fontWeight:600,textAlign:"center"}}>
            ⏳ Bet placed: ৳{pendingBet.amount} on {pendingBet.type==="total"?`Sum ${pendingBet.value}`:pendingBet.type} — waiting for result
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{display:"flex",borderTop:"1px solid #e0e0e0",background:"#fff",marginTop:"auto"}}>
        {[["game","🎲","Game"],["history","📋","History"],["chart","📊","Chart"],["myhistory","👤","My Bets"]].map(([k,icon,label])=>(
          <button key={k} onClick={()=>setSubScreen(k)} style={{
            flex:1,padding:"10px 0 8px",background:"none",border:"none",cursor:"pointer",
            color:subScreen===k?C.red:"#888",fontWeight:subScreen===k?700:400,
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontSize:11,
          }}>
            <span style={{fontSize:18}}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* History sub-screen */}
      {subScreen==="history" && (
        <div style={{position:"absolute",inset:0,background:C.bg,zIndex:20,display:"flex",flexDirection:"column"}}>
          <div style={{background:`linear-gradient(135deg,${C.red},${C.darkRed})`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setSubScreen("game")} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",borderRadius:8,padding:"4px 10px"}}>‹</button>
            <span style={{flex:1,textAlign:"center",color:"#fff",fontWeight:800,fontSize:17}}>Game History — {market.label}</span>
          </div>
          <div style={{overflowY:"auto",flex:1}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:C.red}}>
                  <th style={{color:"#fff",padding:"9px 8px",textAlign:"left",fontWeight:700}}>Period</th>
                  <th style={{color:"#fff",padding:"9px 6px",textAlign:"center",fontWeight:700}}>Sum</th>
                  <th style={{color:"#fff",padding:"9px 6px",textAlign:"center",fontWeight:700}}>Result</th>
                  <th style={{color:"#fff",padding:"9px 6px",textAlign:"center",fontWeight:700}}>Dice</th>
                </tr>
              </thead>
              <tbody>
                {history.length===0 && (
                  <tr><td colSpan={4} style={{textAlign:"center",padding:32,color:"#bbb"}}>No rounds yet</td></tr>
                )}
                {history.map((row,i)=>(
                  <tr key={i} style={{background:i%2===0?"#fff":"#fafafa",borderBottom:"1px solid #f0f0f0"}}>
                    <td style={{padding:"8px 8px",fontSize:10,color:C.blue,fontWeight:600}}>{row.period}</td>
                    <td style={{padding:"8px 6px",textAlign:"center",fontWeight:800,fontSize:15}}>{row.sum}</td>
                    <td style={{padding:"8px 6px",textAlign:"center"}}>
                      <span style={{background:row.big==="Big"?"#fff3e0":"#e3f2fd",color:row.big==="Big"?C.orange:C.blue,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,marginRight:4}}>{row.big}</span>
                      <span style={{background:"#f3e5f5",color:"#7b1fa2",borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700}}>{row.oddEven}</span>
                    </td>
                    <td style={{padding:"8px 6px"}}>
                      <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                        {row.dice.map((v,j)=><DiceMini key={j} value={v} size={22}/>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
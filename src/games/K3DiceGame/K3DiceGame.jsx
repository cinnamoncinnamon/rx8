import { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "../../constants";
import { getToken } from "../../api";

const WS_URL = "ws://localhost:4000/ws/k3";

const MODES = [
  { id:"15s", label:"K3 15 Sec", seconds:15 },
  { id:"30s", label:"K3 30 Sec", seconds:30 },
  { id:"1m",  label:"K3 1 Min",  seconds:60 },
  { id:"3m",  label:"K3 3 Min",  seconds:180 },
];

const TOTAL_PAYOUTS = {3:207.36,4:69.12,5:34.56,6:20.74,7:13.83,8:9.88,9:8.3,10:7.68,11:7.68,12:8.3,13:9.88,14:13.83,15:20.74,16:34.56,17:69.12,18:207.36};
const TWO_SAME = [{label:"1·1",pair:[1,1]},{label:"2·2",pair:[2,2]},{label:"3·3",pair:[3,3]},{label:"4·4",pair:[4,4]},{label:"5·5",pair:[5,5]},{label:"6·6",pair:[6,6]}];
const THREE_SAME = [{label:"Any Triple",key:"any3"},{label:"1·1·1",key:1,triple:1},{label:"2·2·2",key:2,triple:2},{label:"3·3·3",key:3,triple:3},{label:"4·4·4",key:4,triple:4},{label:"5·5·5",key:5,triple:5},{label:"6·6·6",key:6,triple:6}];
const DIFF_COMBO = ["1,2,3","1,2,4","1,2,5","1,2,6","1,3,4","1,3,5","1,3,6","1,4,5","1,4,6","1,5,6","2,3,4","2,3,5","2,3,6","2,4,5","2,4,6","2,5,6","3,4,5","3,4,6","3,5,6","4,5,6"];

const DOT_POS = {
  1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]],
};

function DiceSVG({ value=1, size=70 }) {
  const dots = DOT_POS[value] || DOT_POS[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`dg${value}${size}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ff7070"/><stop offset="100%" stopColor="#b71c1c"/>
        </radialGradient>
        <filter id="dsf"><feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.45"/></filter>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="20" fill={`url(#dg${value}${size})`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <rect x="4" y="4" width="92" height="40" rx="20" fill="rgba(255,255,255,0.08)"/>
      {dots.map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={8.5} fill="#FFD700" filter="url(#dsf)"/>)}
    </svg>
  );
}

function MiniDice({ value=1 }) {
  const dots = DOT_POS[value] || DOT_POS[1];
  return (
    <svg width={22} height={22} viewBox="0 0 100 100" style={{display:"inline-block",verticalAlign:"middle",borderRadius:4,overflow:"hidden"}}>
      <rect x="0" y="0" width="100" height="100" fill="#c0392b"/>
      {dots.map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={10} fill="#FFD700"/>)}
    </svg>
  );
}

function BetModal({ label, onConfirm, onClose, balance, payout }) {
  const [amount, setAmount] = useState(10);
  const presets = [10,20,50,100,200,500];
  return (
    <div style={{position:"fixed",inset:0,background:"#0009",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,margin:"0 auto",background:"#1A1A2E",borderRadius:"20px 20px 0 0",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#c0392b,#922b21)",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:16}}>K3 Dice · {label}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#fff",fontSize:24,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"20px 20px 32px",fontFamily:"'Poppins',sans-serif"}}>
          <div style={{color:"#aaa",fontSize:13,marginBottom:12}}>Balance: ৳{Number(balance).toFixed(2)}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            {presets.map(p=><button key={p} onClick={()=>setAmount(p)} style={{padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:amount===p?"#EF5350":"#2A2A40",color:amount===p?"#fff":"#aaa"}}>৳{p}</button>)}
          </div>
          <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} min={1}
            style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #333",background:"#0f0f1a",color:"#fff",fontSize:16,fontFamily:"'Poppins',sans-serif",marginBottom:12,boxSizing:"border-box"}}/>
          <div style={{color:"#aaa",fontSize:12,marginBottom:14}}>Payout: ×{payout} = ৳{(amount*payout).toFixed(2)}</div>
          <button onClick={()=>onConfirm(amount)} disabled={amount<=0||amount>balance}
            style={{width:"100%",padding:"14px 0",borderRadius:10,border:"none",background:amount>0&&amount<=balance?"#EF5350":"#333",color:"#fff",fontWeight:700,fontSize:15,cursor:amount>0&&amount<=balance?"pointer":"not-allowed",fontFamily:"'Poppins',sans-serif"}}>
            Confirm Bet
          </button>
        </div>
      </div>
    </div>
  );
}

export default function K3DiceGame({ balance, setBalance, onBack }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLocked, setIsLocked] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [history, setHistory] = useState([]);
  const [pendingBets, setPendingBets] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState("total");
  const [resultFlash, setResultFlash] = useState(null);
  const [err, setErr] = useState("");
  const [wsStatus, setWsStatus] = useState("connecting");
  const [lastResult, setLastResult] = useState(null);

  const wsRef = useRef(null);
  const modeRef = useRef(MODES[0]);
  const pendingRef = useRef([]);
  useEffect(()=>{ pendingRef.current=pendingBets; },[pendingBets]);

  const connect = useCallback(()=>{
    const token = getToken();
    if (!token) { setErr("Not logged in"); return; }
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = ()=>{ ws.send(JSON.stringify({type:"auth",token})); };

    ws.onmessage = (e)=>{
      const msg = JSON.parse(e.data);
      if (msg.type==="auth_ok") {
        setWsStatus("connected");
        ws.send(JSON.stringify({type:"subscribe",modeId:modeRef.current.id}));
      }
      if (msg.type==="state") {
        setCurrentPeriod(msg.period); setTimeLeft(msg.timeLeft);
        setIsLocked(msg.timeLeft<=5); setHistory(msg.history||[]);
      }
      if (msg.type==="tick") {
        setTimeLeft(msg.timeLeft); setIsLocked(msg.timeLeft<=5); setCurrentPeriod(msg.period);
      }
      if (msg.type==="new_round") {
        setCurrentPeriod(msg.period); setTimeLeft(msg.timeLeft);
        setIsLocked(false); setHistory(msg.history||[]);
        setPendingBets([]); pendingRef.current=[];
      }
      if (msg.type==="result") {
        const r = msg.result;
        setLastResult(r);
        const myBets = pendingRef.current;
        let totalWin = 0;
        if (myBets.length>0) {
          myBets.forEach(b=>{
            // Mirror server calculation for display
            let payout=0;
            if (b.betGroup==="total"&&b.betValue===r.sum) payout=TOTAL_PAYOUTS[r.sum]||0;
            else if (b.betGroup==="bigsmall"&&b.betValue===r.big&&!r.isTriple) payout=2;
            else if (b.betGroup==="oddeven"&&b.betValue===r.oddEven&&!r.isTriple) payout=2;
            else if (b.betGroup==="twoSame") {
              const s=[...r.dice].sort();
              if (s[0]===b.betValue[0]&&s[1]===b.betValue[1]) payout=17.64;
            } else if (b.betGroup==="threeSame") {
              if (b.betValue==="any3"&&r.isTriple) payout=29.4;
              else if (r.isTriple&&r.dice[0]===b.betValue) payout=176.4;
            } else if (b.betGroup==="diffCombo") {
              const cn=b.betValue.split(",").map(Number).sort();
              if (JSON.stringify(cn)===JSON.stringify([...r.dice].sort((a,b)=>a-b))&&!r.isTriple) payout=17.64;
            }
            totalWin += b.amount*payout;
          });
          if (totalWin>0) setBalance(b=>b+totalWin);
          setMyHistory(mh=>[{period:msg.period,result:r,bets:myBets,totalWin,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},...mh].slice(0,30));
          setResultFlash({result:r,won:totalWin>0,amount:totalWin});
          setTimeout(()=>setResultFlash(null),2800);
        }
      }
      if (msg.type==="bet_accepted") {
        setBalance(msg.newBalance);
        setPendingBets(b=>[...b,{betGroup:msg.betGroup,betValue:msg.betValue,amount:msg.amount}]);
      }
      if (msg.type==="error") { setErr(msg.message); setTimeout(()=>setErr(""),3000); }
    };
    ws.onerror=()=>setWsStatus("error");
    ws.onclose=()=>{ setWsStatus("connecting"); setTimeout(connect,3000); };
  },[]);

  useEffect(()=>{ connect(); return()=>{ if(wsRef.current) wsRef.current.close(); }; },[connect]);

  useEffect(()=>{
    modeRef.current=MODES[modeIdx];
    if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify({type:"subscribe",modeId:MODES[modeIdx].id}));
  },[modeIdx]);

  function placeBet(betGroup, betValue, amount) {
    if (!wsRef.current||wsRef.current.readyState!==1) { setErr("Not connected"); return; }
    wsRef.current.send(JSON.stringify({type:"bet",betGroup,betValue,amount}));
  }

  const openModal=(group,value,label,payout)=>{
    if(isLocked) return;
    setModal({group,value,label,payout});
  };

  const mm=String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss=String(timeLeft%60).padStart(2,"0");

  const tabBtnStyle=(active)=>({padding:"10px 0",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Poppins',sans-serif",background:active?"#EF5350":"transparent",color:active?"#fff":"#888"});

  const BET_TABS = ["total","bigsmall","twoSame","threeSame","diffCombo"];
  const TAB_LABELS = {total:"Total",bigsmall:"Big/Small",twoSame:"2 Same",threeSame:"3 Same",diffCombo:"Different"};

  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#0D0D1A",minHeight:"100vh",fontFamily:"'Poppins',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#c0392b,#922b21)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",fontSize:18,cursor:"pointer",borderRadius:8,padding:"6px 12px"}}>‹ Back</button>
          <span style={{fontSize:18,fontWeight:900,color:"#fff",letterSpacing:1}}>K3 Dice</span>
          <div style={{background:"rgba(255,255,255,.2)",borderRadius:16,padding:"5px 12px",color:"#fff",fontWeight:700,fontSize:13}}>৳{Number(balance).toFixed(2)}</div>
        </div>
        {/* Mode tabs */}
        <div style={{display:"flex",padding:"0 10px 12px",gap:6}}>
          {MODES.map((m,i)=>(
            <button key={i} onClick={()=>setModeIdx(i)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:"none",cursor:"pointer",background:modeIdx===i?"#fff":"rgba(255,255,255,.2)",color:modeIdx===i?"#EF5350":"#fff",fontWeight:700,fontSize:11,fontFamily:"'Poppins',sans-serif"}}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Timer + last result */}
      <div style={{background:"#1a0f0f",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          {wsStatus!=="connected"&&<div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:4}}>⟳ Connecting...</div>}
          <div style={{display:"flex",gap:6,marginBottom:4}}>
            {lastResult && lastResult.dice.map((d,i)=><MiniDice key={i} value={d}/>)}
          </div>
          {lastResult && <div style={{color:"#FFD700",fontSize:12,fontWeight:700}}>{lastResult.sum} · {lastResult.big} · {lastResult.oddEven}</div>}
          <div style={{color:"rgba(255,255,255,.35)",fontSize:9,fontFamily:"monospace",marginTop:2}}>{currentPeriod.slice(-10)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"rgba(255,255,255,.7)",fontSize:10,marginBottom:4}}>Time remaining</div>
          <div style={{display:"flex",gap:3,justifyContent:"flex-end",alignItems:"center"}}>
            {[mm[0],mm[1],":",ss[0],ss[1]].map((d,i)=>
              d===":"?<span key={i} style={{color:"#fff",fontSize:18,fontWeight:900,lineHeight:"30px",margin:"0 1px"}}>:</span>
              :<div key={i} style={{width:26,height:30,background:"#111",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',monospace",fontSize:17,fontWeight:900,color:isLocked?"#EF5350":"#fff"}}>{d}</div>
            )}
          </div>
        </div>
      </div>

      {/* Bet area */}
      <div style={{background:"#fff",margin:"10px 10px 0",borderRadius:16,overflow:"hidden",position:"relative"}}>
        {isLocked&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6,borderRadius:16}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:48,fontWeight:900,color:"#EF5350",textShadow:"0 0 30px #EF5350"}}>{timeLeft}</div>
            <div style={{color:"rgba(255,255,255,.7)",fontSize:13}}>Betting closed</div>
          </div>
        )}

        {err&&<div style={{background:"#FFF0F0",padding:"8px 14px",fontSize:13,color:"#c62828",fontWeight:600,margin:10,borderRadius:8}}>{err}</div>}

        {/* Sub-tabs */}
        <div style={{display:"flex",borderBottom:"1px solid #f0f0f0",overflowX:"auto"}}>
          {BET_TABS.map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{...tabBtnStyle(activeTab===t),flex:"0 0 auto",padding:"10px 14px",borderBottom:activeTab===t?"2px solid #EF5350":"2px solid transparent"}}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div style={{padding:12}}>

          {/* Total */}
          {activeTab==="total"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {Object.entries(TOTAL_PAYOUTS).map(([n,p])=>(
                <button key={n} onClick={()=>openModal("total",parseInt(n),`Sum ${n}`,p)}
                  style={{padding:"10px 4px",borderRadius:10,border:"1px solid #eee",background:parseInt(n)>=11?"#FFF5F5":"#F0FFF4",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:parseInt(n)>=11?"#EF5350":"#22C55E"}}>{n}</div>
                  <div style={{fontSize:9,color:"#aaa"}}>×{p}</div>
                </button>
              ))}
            </div>
          )}

          {/* Big/Small + Odd/Even */}
          {activeTab==="bigsmall"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {["Big","Small","Odd","Even"].map(v=>(
                <button key={v} onClick={()=>openModal(v==="Big"||v==="Small"?"bigsmall":"oddeven",v,v,2)}
                  style={{padding:"16px 0",borderRadius:12,border:"none",cursor:"pointer",fontWeight:800,fontSize:17,
                    background:v==="Big"?"#FFF0E0":v==="Small"?"#E8F4FD":v==="Odd"?"#F5E8FD":"#E8FDF0",
                    color:v==="Big"?"#E65100":v==="Small"?"#1565C0":v==="Odd"?"#6A1B9A":"#2E7D32"}}>
                  {v}<div style={{fontSize:11,fontWeight:400,marginTop:4,opacity:0.7}}>×2</div>
                </button>
              ))}
            </div>
          )}

          {/* 2 Same */}
          {activeTab==="twoSame"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {TWO_SAME.map(({label,pair})=>(
                <button key={label} onClick={()=>openModal("twoSame",pair,label,17.64)}
                  style={{padding:"12px 6px",borderRadius:10,border:"1px solid #f5e0e0",background:"#fff5f5",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#c0392b",marginBottom:4}}>{label}</div>
                  <div style={{fontSize:9,color:"#aaa"}}>×17.64</div>
                </button>
              ))}
            </div>
          )}

          {/* 3 Same */}
          {activeTab==="threeSame"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {THREE_SAME.map(({label,key,triple})=>(
                <button key={label} onClick={()=>openModal("threeSame",key==="any3"?"any3":(triple||key),label,key==="any3"?29.4:176.4)}
                  style={{padding:"12px 6px",borderRadius:10,border:"1px solid #ffe0e0",background:"#fff0f0",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#b71c1c",marginBottom:4}}>{label}</div>
                  <div style={{fontSize:9,color:"#aaa"}}>×{key==="any3"?29.4:176.4}</div>
                </button>
              ))}
            </div>
          )}

          {/* Different Combo */}
          {activeTab==="diffCombo"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {DIFF_COMBO.map(k=>(
                <button key={k} onClick={()=>openModal("diffCombo",k,k,17.64)}
                  style={{padding:"10px 4px",borderRadius:8,border:"1px solid #eee",background:"#f9f9f9",cursor:"pointer",textAlign:"center",fontSize:11,fontWeight:700,color:"#444"}}>
                  {k}<div style={{fontSize:8,color:"#aaa",marginTop:2}}>×17.64</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {pendingBets.length>0&&(
          <div style={{padding:"8px 14px 12px",display:"flex",gap:6,flexWrap:"wrap"}}>
            {pendingBets.map((b,i)=><span key={i} style={{padding:"3px 10px",background:"#FFE082",borderRadius:14,fontSize:11,fontWeight:700,color:"#5D4037"}}>{String(Array.isArray(b.betValue)?b.betValue.join("·"):b.betValue)} ৳{b.amount}</span>)}
          </div>
        )}
      </div>

      {/* History */}
      <div style={{background:"#fff",margin:"10px 10px 0",borderRadius:"16px 16px 0 0",overflow:"hidden"}}>
        <div style={{display:"flex",borderBottom:"1px solid #f0f0f0"}}>
          {[{k:"hist",l:"History"},{k:"my",l:"My Bets"}].map(t=>(
            <button key={t.k} onClick={()=>setActiveTab(t.k==="hist"?"_hist":"_my")} style={{...tabBtnStyle(activeTab===t.k||activeTab===(t.k==="hist"?"_hist":"_my")),flex:1,padding:"12px 0",borderBottom:(activeTab===t.k||activeTab===(t.k==="hist"?"_hist":"_my"))?"2px solid #EF5350":"2px solid transparent"}}>
              {t.l}
            </button>
          ))}
        </div>

        {(activeTab==="total"||activeTab==="bigsmall"||activeTab==="twoSame"||activeTab==="threeSame"||activeTab==="diffCombo"||activeTab==="_hist")&&(
          <div>
            {history.slice(0,8).map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #f5f5f5",background:i%2?"#fff":"#fafafa"}}>
                <div style={{display:"flex",gap:4}}>
                  {r.dice.map((d,j)=><MiniDice key={j} value={d}/>)}
                </div>
                <div style={{flex:1}}>
                  <span style={{fontSize:14,fontWeight:800,color:"#c0392b",marginRight:8}}>{r.sum}</span>
                  <span style={{fontSize:11,color:"#888"}}>{r.big} · {r.oddEven}</span>
                </div>
                <span style={{fontSize:9,color:"#ccc",fontFamily:"monospace"}}>{r.period?.slice(-6)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab==="_my"&&(
          <div>
            {myHistory.length===0?<div style={{textAlign:"center",padding:"32px 0",color:"#ccc",fontSize:14}}>No bets yet</div>
            :myHistory.map((row,i)=>(
              <div key={i} style={{padding:"12px 14px",borderBottom:"1px solid #f5f5f5"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:10,color:"#aaa"}}>{row.time}</span>
                  <div style={{display:"flex",gap:3}}>{row.result.dice.map((d,j)=><MiniDice key={j} value={d}/>)}</div>
                  <span style={{fontSize:12,fontWeight:700,color:"#c0392b"}}>{row.result.sum}</span>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4}}>
                  {row.bets.map((b,j)=><span key={j} style={{fontSize:11,background:"#f0f0f0",borderRadius:6,padding:"2px 8px",color:"#666"}}>{String(Array.isArray(b.betValue)?b.betValue.join("·"):b.betValue)} ৳{b.amount}</span>)}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:row.totalWin>0?"#22C55E":"#EF5350"}}>
                  {row.totalWin>0?`+৳${row.totalWin.toFixed(2)} Won 🎉`:"No win"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{height:24,background:"#fff",margin:"0 10px"}}/>

      {modal&&(
        <BetModal label={modal.label} payout={modal.payout} balance={balance}
          onConfirm={amt=>{ placeBet(modal.group,modal.value,amt); setModal(null); }}
          onClose={()=>setModal(null)}/>
      )}

      {resultFlash&&(
        <div style={{position:"fixed",top:"38%",left:"50%",transform:"translateX(-50%)",zIndex:400,textAlign:"center",minWidth:240}}>
          <div style={{background:"#111122",borderRadius:20,padding:"24px 36px",boxShadow:"0 20px 60px #0008",border:"1px solid #ffffff15"}}>
            <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:12}}>
              {resultFlash.result.dice.map((d,i)=><DiceSVG key={i} value={d} size={52}/>)}
            </div>
            <div style={{fontSize:22,fontWeight:900,color:"#FFD700",marginBottom:4}}>{resultFlash.result.sum}</div>
            <div style={{fontSize:15,fontWeight:700,color:resultFlash.won?"#22C55E":"#EF5350"}}>{resultFlash.won?`Won ৳${resultFlash.amount.toFixed(2)} 🎉`:"Better luck!"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

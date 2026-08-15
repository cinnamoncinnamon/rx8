import React, { useState, useEffect, useRef, useCallback } from "react";
import { NUM_COLORS, CSS, gradient } from "../../constants";
import Ball from "../../components/Ball";
import { getToken } from "../../api";

const WS_URL = `${import.meta.env.VITE_WS_BASE_URL || "ws://localhost:4000"}/ws/wingo`;

const MODES = [
  { label: "30s",   seconds: 30  },
  { label: "1 Min", seconds: 60  },
  { label: "3 Min", seconds: 180 },
  { label: "5 Min", seconds: 300 },
];

const PAYOUTS = { number: 9, violet: 4.5, big: 2, small: 2, green: 2, red: 2 };

function BetModal({ type, label, color, value, onConfirm, onClose, balance }) {
  const [amount, setAmount] = useState(10);
  const presets = [10, 20, 50, 100, 200, 500];
  const bgMap = { green:"#22C55E", violet:"#7C3AED", red:"#EF4444", big:"#F97316", small:"#3B82F6" };
  const bg = bgMap[color] || "#EF5350";
  return (
    <div style={{ position:"fixed", inset:0, background:"#0009", zIndex:300, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:480, margin:"0 auto", background:"#1A1A2E", borderRadius:"20px 20px 0 0", overflow:"hidden", animation:"slideUp .3s ease" }}>
        <div style={{ background:bg, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#fff", fontSize:18, fontWeight:700 }}>Win Go</span>
          <span style={{ color:"#fff", fontSize:16 }}>{label}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ padding:"20px 20px 32px" }}>
          <div style={{ color:"#aaa", fontSize:13, marginBottom:12 }}>Balance: ৳{Number(balance).toFixed(2)}</div>
          <div style={{ fontSize:13, fontWeight:600, color:"#ccc", marginBottom:8 }}>Bet Amount</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            {presets.map(p => (
              <button key={p} onClick={() => setAmount(p)} style={{ padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600, background:amount===p?bg:"#2A2A40", color:amount===p?"#fff":"#aaa", border:"none" }}>৳{p}</button>
            ))}
          </div>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={1}
            style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid #333", background:"#0f0f1a", color:"#fff", fontSize:16, fontFamily:"'Poppins',sans-serif", marginBottom:16, boxSizing:"border-box" }} />
          <div style={{ color:"#aaa", fontSize:12, marginBottom:12 }}>
            Payout: ×{PAYOUTS[type] || 2} = ৳{(amount * (PAYOUTS[type] || 2)).toFixed(2)}
          </div>
          <button onClick={() => onConfirm(amount)} disabled={amount <= 0 || amount > balance}
            style={{ width:"100%", padding:"14px 0", borderRadius:10, border:"none", background:amount>0&&amount<=balance?bg:"#333", color:"#fff", fontWeight:700, fontSize:15, cursor:amount>0&&amount<=balance?"pointer":"not-allowed", fontFamily:"'Poppins',sans-serif" }}>
            Confirm Bet
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WinGoGame({ balance, setBalance, onBack }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLocked, setIsLocked] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [pendingBets, setPendingBets] = useState([]);
  const [myHistory, setMyHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("wingo_my_history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState("history");
  const [resultFlash, setResultFlash] = useState(null);
  const [wsStatus, setWsStatus] = useState("connecting"); // connecting | connected | error
  const [err, setErr] = useState("");

  const wsRef = useRef(null);
  const modeRef = useRef(MODES[0]);
  const pendingBetsRef = useRef([]);

  useEffect(() => { pendingBetsRef.current = pendingBets; }, [pendingBets]);

  useEffect(() => {
    try { localStorage.setItem("wingo_my_history", JSON.stringify(myHistory)); } catch { /* storage unavailable — history still works this session */ }
  }, [myHistory]);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) { setErr("Not logged in."); return; }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", token }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "auth_ok") {
        setWsStatus("connected");
        ws.send(JSON.stringify({ type: "subscribe", seconds: modeRef.current.seconds }));
      }

      if (msg.type === "state") {
        setCurrentPeriod(msg.period);
        setTimeLeft(msg.timeLeft);
        setIsLocked(msg.timeLeft <= 5);
        setHistory(msg.history || []);
      }

      if (msg.type === "tick") {
        setTimeLeft(msg.timeLeft);
        setIsLocked(msg.timeLeft <= 5);
        setCurrentPeriod(msg.period);
      }

      if (msg.type === "new_round") {
        setCurrentPeriod(msg.period);
        setTimeLeft(msg.timeLeft);
        setIsLocked(false);
        setHistory(msg.history || []);
        setPendingBets([]);
        pendingBetsRef.current = [];
      }

      if (msg.type === "result") {
        const { number, colors, bigSmall, winners } = msg;
        const myBets = pendingBetsRef.current;
        let totalWin = 0;
        if (myBets.length > 0) {
          myBets.forEach(b => {
            let won = false;
            if (b.type==="big" && number>=5) won=true;
            if (b.type==="small" && number<=4) won=true;
            if (b.type==="green" && colors.includes("green")) won=true;
            if (b.type==="red" && colors.includes("red")) won=true;
            if (b.type==="violet" && colors.includes("violet")) won=true;
            if (b.type==="number" && b.value===number) won=true;
            if (won) totalWin += b.amount * (PAYOUTS[b.type] || 2);
          });
          setMyHistory(mh => [{
            period: msg.period, number, bets: myBets, totalWin, market: modeRef.current.label,
            time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })
          }, ...mh].slice(0, 30));
          setResultFlash({ number, won: totalWin > 0, amount: totalWin });
          setTimeout(() => setResultFlash(null), 2800);
        }
        // Update balance from server win
        if (totalWin > 0) setBalance(b => b + totalWin);
      }

      if (msg.type === "bet_accepted") {
        setBalance(msg.newBalance);
        setPendingBets(b => [...b, { type: msg.betType, value: msg.value, amount: msg.amount, label: msg.betType }]);
      }

      if (msg.type === "error") {
        setErr(msg.message);
        setTimeout(() => setErr(""), 3000);
      }
    };

    ws.onerror = () => setWsStatus("error");
    ws.onclose = () => {
      setWsStatus("connecting");
      setTimeout(connect, 3000); // auto-reconnect
    };
  }, []);

  useEffect(() => {
    connect();
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [connect]);

  // Switch mode — also clears the visual "selected" highlight on old bets so
  // it doesn't look like this new market already has a bet on it. The bets
  // themselves are already locked in server-side for their original round
  // and are untouched; this only resets what's shown as selected here.
  useEffect(() => {
    modeRef.current = MODES[modeIdx];
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", seconds: MODES[modeIdx].seconds }));
    }
    setPendingBets([]);
    pendingBetsRef.current = [];
  }, [modeIdx]);

  function placeBet(type, value, amount) {
    if (!wsRef.current || wsRef.current.readyState !== 1) { setErr("Not connected."); return; }
    wsRef.current.send(JSON.stringify({ type: "bet", betType: type, value, amount }));
  }

  const openModal = (type, label, color, value) => {
    if (isLocked) return;
    setModal({ type, label, color, value });
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#0D0D1A", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background:gradient, padding:"0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px" }}>
          <button onClick={onBack} style={{ background:"rgba(255,255,255,.2)", border:"none", color:"#fff", fontSize:18, cursor:"pointer", borderRadius:8, padding:"6px 12px" }}>‹ Back</button>
          <div style={{ fontSize:20, fontWeight:900, color:"#fff", letterSpacing:1 }}><span style={{ fontStyle:"italic", color:"#FFE082" }}>S</span>PINOVA</div>
          <div style={{ background:"rgba(255,255,255,.2)", borderRadius:16, padding:"5px 12px", color:"#fff", fontWeight:700, fontSize:13 }}>৳{Number(balance).toFixed(2)}</div>
        </div>
        {/* Mode tabs */}
        <div style={{ display:"flex", padding:"0 10px 12px", gap:6 }}>
          {MODES.map((m,i) => (
            <button key={i} onClick={() => setModeIdx(i)} style={{ flex:1, padding:"8px 4px", borderRadius:10, border:"none", cursor:"pointer", background:modeIdx===i?"#fff":"rgba(255,255,255,.2)", color:modeIdx===i?"#EF5350":"#fff", fontWeight:700, fontSize:11, fontFamily:"'Poppins',sans-serif" }}>WinGo<br/>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Connection status + timer */}
      <div style={{ background:"linear-gradient(135deg,#c0392b,#922b21)", padding:"12px 14px 14px" }}>
        {wsStatus !== "connected" && (
          <div style={{ textAlign:"center", color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:6 }}>
            {wsStatus === "connecting" ? "⟳ Connecting to server..." : "⚠ Connection lost, reconnecting..."}
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ display:"flex", gap:5, marginBottom:6 }}>
              {history.slice(0,5).map((r,i) => <Ball key={i} number={r.number} size={26} />)}
            </div>
            <div style={{ color:"rgba(255,255,255,.55)", fontSize:9, fontFamily:"monospace" }}>{currentPeriod}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"rgba(255,255,255,.8)", fontSize:10, marginBottom:4 }}>Time remaining</div>
            <div style={{ display:"flex", gap:3, justifyContent:"flex-end", alignItems:"center" }}>
              {[mm[0],mm[1],":",ss[0],ss[1]].map((d,i) =>
                d===":" ? <span key={i} style={{ color:"#fff", fontSize:18, fontWeight:900, lineHeight:"30px", margin:"0 1px" }}>:</span>
                : <div key={i} style={{ width:26, height:30, background:"#111", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',monospace", fontSize:17, fontWeight:900, color:isLocked?"#EF5350":"#fff" }}>{d}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bet area */}
      <div style={{ background:"#fff", margin:"10px 10px 0", borderRadius:16, padding:"14px", position:"relative", overflow:"hidden" }}>
        {isLocked && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.65)", borderRadius:16, zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6 }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:48, fontWeight:900, color:"#EF5350", textShadow:"0 0 30px #EF5350" }}>{timeLeft}</div>
            <div style={{ color:"rgba(255,255,255,.7)", fontSize:13, fontWeight:600 }}>Betting closed</div>
          </div>
        )}

        {err && <div style={{ background:"#FFF0F0", border:"1px solid #ffcdd2", borderRadius:8, padding:"8px 12px", marginBottom:10, color:"#c62828", fontSize:13 }}>{err}</div>}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
          <button onClick={() => openModal("green","Green","green")} style={{ padding:"13px 0", borderRadius:10, border:"none", background:"#22C55E", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>Green</button>
          <button onClick={() => openModal("violet","Violet","violet")} style={{ padding:"13px 0", borderRadius:10, border:"none", background:"#7C3AED", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>Violet</button>
          <button onClick={() => openModal("red","Red","red")} style={{ padding:"13px 0", borderRadius:10, border:"none", background:"#EF4444", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>Red</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            {Array.from({length:5},(_,n) => <Ball key={n} number={n} size={46} selected={pendingBets.some(b=>b.type==="number"&&b.value===n)} onClick={() => openModal("number",`Number ${n}`,NUM_COLORS[n].includes("green")?"green":"red",n)} />)}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            {Array.from({length:5},(_,n) => <Ball key={n+5} number={n+5} size={46} selected={pendingBets.some(b=>b.type==="number"&&b.value===n+5)} onClick={() => openModal("number",`Number ${n+5}`,NUM_COLORS[n+5].includes("green")?"green":"red",n+5)} />)}
          </div>
        </div>

        <div style={{ display:"flex", borderRadius:22, overflow:"hidden", height:48 }}>
          <button onClick={() => openModal("big","Big","big")} style={{ flex:1, border:"none", background:"#F97316", color:"#fff", fontWeight:800, fontSize:17, cursor:"pointer" }}>Big</button>
          <button onClick={() => openModal("small","Small","small")} style={{ flex:1, border:"none", background:"#3B82F6", color:"#fff", fontWeight:800, fontSize:17, cursor:"pointer" }}>Small</button>
        </div>

        {pendingBets.length > 0 && (
          <div style={{ marginTop:10, padding:"8px 12px", background:"#FFF8E1", borderRadius:10, border:"1px solid #FFE082", display:"flex", gap:6, flexWrap:"wrap" }}>
            {pendingBets.map((b,i) => <span key={i} style={{ padding:"3px 10px", background:"#FFE082", borderRadius:14, fontSize:11, fontWeight:700, color:"#5D4037" }}>{b.label} ৳{b.amount}</span>)}
          </div>
        )}
      </div>

      {/* History tabs */}
      <div style={{ background:"#fff", margin:"10px 10px 0", borderRadius:"16px 16px 0 0", overflow:"hidden" }}>
        <div style={{ display:"flex", borderBottom:"1px solid #f0f0f0" }}>
          {[{k:"history",l:"Game history"},{k:"chart",l:"Chart"},{k:"myhistory",l:"My history"}].map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)} style={{ flex:1, padding:"12px 0", border:"none", background:activeTab===t.k?"#EF5350":"transparent", color:activeTab===t.k?"#fff":"#aaa", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Poppins',sans-serif", borderRadius:activeTab===t.k?"12px 12px 0 0":0 }}>{t.l}</button>
          ))}
        </div>

        {activeTab==="history" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"10px 12px", background:"#EF5350", gap:4 }}>
              {["Period","Number","Big Small","Color"].map(h => <span key={h} style={{ color:"#fff", fontSize:11, fontWeight:700, textAlign:"center" }}>{h}</span>)}
            </div>
            {history.slice(0,10).map((r,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"10px 12px", gap:4, borderBottom:"1px solid #f5f5f5", background:i%2===0?"#fff":"#fafafa", alignItems:"center" }}>
                <span style={{ fontSize:10, color:"#999" }}>{r.period.slice(-8)}</span>
                <span style={{ fontSize:20, fontWeight:800, color:r.colors.includes("green")?"#22C55E":"#EF4444", textAlign:"center" }}>{r.number}</span>
                <span style={{ fontSize:12, color:"#555", textAlign:"center" }}>{r.bigSmall}</span>
                <div style={{ display:"flex", gap:3, justifyContent:"center" }}>
                  {r.colors.map((c,j) => <div key={j} style={{ width:10, height:10, borderRadius:"50%", background:c==="green"?"#22C55E":c==="violet"?"#7C3AED":"#EF4444" }} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="chart" && (
          <div style={{ padding:12 }}>
            {history.slice(0,10).map((r,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:3, padding:"5px 0", borderBottom:"1px solid #f5f5f5" }}>
                <span style={{ fontSize:9, color:"#ccc", width:72, flexShrink:0 }}>{r.period.slice(-6)}</span>
                {Array.from({length:10},(_,n) => (
                  <div key={n} style={{ width:19, height:19, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {r.number===n ? <div style={{ width:17, height:17, borderRadius:"50%", background:r.colors.includes("green")?"#22C55E":"#EF4444", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff" }}>{n}</div>
                    : <span style={{ fontSize:9, color:"#e0e0e0" }}>{n}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab==="myhistory" && (
          <div style={{ padding:12 }}>
            {myHistory.length===0 ? <div style={{ textAlign:"center", padding:"32px 0", color:"#ccc" }}>No bets yet</div>
            : myHistory.map((row,i) => (
              <div key={i} style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5", background:i%2?"#fff":"#fafafa" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:10, color:"#aaa" }}>
                    <span style={{ background:"#EF5350", color:"#fff", borderRadius:5, padding:"1px 6px", fontWeight:700, marginRight:6 }}>{row.market || "WinGo"}</span>
                    {row.period.slice(-8)} · {row.time}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Ball number={row.number} size={24} />
                    <span style={{ fontWeight:800, color:row.number>=5?"#F97316":"#3B82F6", fontSize:12 }}>{row.number>=5?"Big":"Small"}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:4 }}>
                  {row.bets.map((b,j) => <span key={j} style={{ fontSize:11, background:"#f0f0f0", borderRadius:6, padding:"2px 8px", color:"#666" }}>{b.label} ৳{b.amount}</span>)}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:row.totalWin>0?"#22C55E":"#EF5350" }}>{row.totalWin>0?`+৳${row.totalWin.toFixed(2)} Won 🎉`:"No win this round"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ height:24, background:"#fff", margin:"0 10px" }} />

      {modal && (
        <BetModal {...modal} balance={balance}
          onConfirm={amt => { placeBet(modal.type, modal.value, amt); setModal(null); }}
          onClose={() => setModal(null)} />
      )}

      {resultFlash && (
        <div style={{ position:"fixed", top:"38%", left:"50%", transform:"translateX(-50%)", zIndex:400, animation:"fadeIn .3s ease", textAlign:"center", minWidth:220 }}>
          <div style={{ background:"#111122", borderRadius:20, padding:"24px 36px", boxShadow:"0 20px 60px #0008", border:"1px solid #ffffff15" }}>
            <Ball number={resultFlash.number} size={64} />
            <div style={{ marginTop:12, fontSize:18, fontWeight:800, color:resultFlash.won?"#22C55E":"#EF5350" }}>{resultFlash.won?`🎉 Won ৳${resultFlash.amount.toFixed(2)}`:"😢 Better luck!"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

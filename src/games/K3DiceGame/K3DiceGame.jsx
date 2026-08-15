import { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "../../constants";
import { getToken } from "../../api";

const WS_URL = `${import.meta.env.VITE_WS_BASE_URL || "ws://localhost:4000"}/ws/k3`;

const MODES = [
  { id: "15s", label: "K3 15 Sec", seconds: 15 },
  { id: "30s", label: "K3 30 Sec", seconds: 30 },
  { id: "1m", label: "K3 1 Min", seconds: 60 },
  { id: "3m", label: "K3 3 Min", seconds: 180 },
];

const TOTAL_PAYOUTS = { 3: 207.36, 4: 69.12, 5: 34.56, 6: 20.74, 7: 13.83, 8: 9.88, 9: 8.3, 10: 7.68, 11: 7.68, 12: 8.3, 13: 9.88, 14: 13.83, 15: 20.74, 16: 34.56, 17: 69.12, 18: 207.36 };
const TWO_SAME = [{ label: "1·1", pair: [1, 1] }, { label: "2·2", pair: [2, 2] }, { label: "3·3", pair: [3, 3] }, { label: "4·4", pair: [4, 4] }, { label: "5·5", pair: [5, 5] }, { label: "6·6", pair: [6, 6] }];
const THREE_SAME = [{ label: "Any Triple", key: "any3", payout: 29.4 }, { label: "1·1·1", key: 1, triple: 1, payout: 176.4 }, { label: "2·2·2", key: 2, triple: 2, payout: 176.4 }, { label: "3·3·3", key: 3, triple: 3, payout: 176.4 }, { label: "4·4·4", key: 4, triple: 4, payout: 176.4 }, { label: "5·5·5", key: 5, triple: 5, payout: 176.4 }, { label: "6·6·6", key: 6, triple: 6, payout: 176.4 }];
const DIFF_COMBO = ["1,2,3", "1,2,4", "1,2,5", "1,2,6", "1,3,4", "1,3,5", "1,3,6", "1,4,5", "1,4,6", "1,5,6", "2,3,4", "2,3,5", "2,3,6", "2,4,5", "2,4,6", "2,5,6", "3,4,5", "3,4,6", "3,5,6", "4,5,6"];
const PRESETS = [5, 10, 20, 30, 50, 100, 200, 300];

const DOT_POS = {
  1: [[50, 50]], 2: [[30, 30], [70, 70]], 3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
};

function DiceSVG({ value = 1, size = 70 }) {
  const dots = DOT_POS[value] || DOT_POS[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`dg${value}${size}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ff7070" /><stop offset="100%" stopColor="#b71c1c" />
        </radialGradient>
        <filter id="dsf"><feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.45" /></filter>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="20" ry="20" fill={`url(#dg${value}${size})`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <rect x="4" y="4" width="92" height="40" rx="20" ry="20" fill="rgba(255,255,255,0.08)" />
      {dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={8.5} fill="#FFD700" filter="url(#dsf)" />)}
    </svg>
  );
}

function MiniDice({ value = 1, size = 22 }) {
  const dots = DOT_POS[value] || DOT_POS[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "inline-block", verticalAlign: "middle", borderRadius: size * 0.2, overflow: "hidden" }}>
      <defs>
        <radialGradient id={`mg${value}${size}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ff7070" /><stop offset="100%" stopColor="#b71c1c" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="20" ry="20" fill={`url(#mg${value}${size})`} />
      {dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={9} fill="#FFD700" />)}
    </svg>
  );
}

function Ball({ num, payout, selected, locked, onClick, isRed }) {
  const bg = selected
    ? (isRed ? "#7f0000" : "#003300")
    : isRed
      ? "radial-gradient(circle at 35% 28%, #ff8a80, #e53935 50%, #b71c1c)"
      : "radial-gradient(circle at 35% 28%, #a5d6a7, #43a047 50%, #1b5e20)";
  return (
    <div onClick={() => !locked && onClick()} style={{
      width: "100%", aspectRatio: "1", borderRadius: "50%", background: bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.5 : 1, position: "relative",
      boxShadow: selected ? "0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.4)" : "0 4px 10px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(0,0,0,0.2)",
      border: selected ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.3)",
      transition: "transform 0.12s,box-shadow 0.12s", userSelect: "none",
    }}>
      {!selected && <div style={{ position: "absolute", top: "12%", left: "22%", width: "28%", height: "16%", borderRadius: "50%", background: "rgba(255,255,255,0.5)", filter: "blur(2px)" }} />}
      <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{num}</span>
      <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 8.5, marginTop: 1, textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>{payout}X</span>
    </div>
  );
}

export default function K3DiceGame({ balance, setBalance, onBack }) {
  const [modeIdx, setModeIdx] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLocked, setIsLocked] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [history, setHistory] = useState([]);
  const [pendingBets, setPendingBets] = useState([]);
  const [myHistory, setMyHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("k3_my_history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState(0); // 0 Total, 1 2Same, 2 3Same, 3 Diff
  const [bottomTab, setBottomTab] = useState(0); // 0 History, 1 Chart, 2 My History
  const [err, setErr] = useState("");
  const [wsStatus, setWsStatus] = useState("connecting");
  const [lastResult, setLastResult] = useState(null);
  const [rollingFaces, setRollingFaces] = useState([1, 2, 3]);
  const [toast, setToast] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [customAmt, setCustomAmt] = useState("");

  const wsRef = useRef(null);
  const modeRef = useRef(MODES[1]);
  const pendingRef = useRef([]);
  const rollTimerRef = useRef(null);
  useEffect(() => { pendingRef.current = pendingBets; }, [pendingBets]);

  useEffect(() => {
    try { localStorage.setItem("k3_my_history", JSON.stringify(myHistory)); } catch { /* storage unavailable — history still works this session */ }
  }, [myHistory]);

  const showToast = (msg, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2200); };

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) { setErr("Not logged in"); return; }
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => { ws.send(JSON.stringify({ type: "auth", token })); };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "auth_ok") {
        setWsStatus("connected");
        ws.send(JSON.stringify({ type: "subscribe", modeId: modeRef.current.id }));
      }
      if (msg.type === "state") {
        setCurrentPeriod(msg.period); setTimeLeft(msg.timeLeft);
        setIsLocked(msg.timeLeft <= 5); setHistory(msg.history || []);
      }
      if (msg.type === "tick") {
        setTimeLeft(msg.timeLeft); setIsLocked(msg.timeLeft <= 5); setCurrentPeriod(msg.period);
      }
      if (msg.type === "new_round") {
        setCurrentPeriod(msg.period); setTimeLeft(msg.timeLeft);
        setIsLocked(false); setHistory(msg.history || []);
        setPendingBets([]); pendingRef.current = [];
      }
      if (msg.type === "result") {
        const r = msg.result;
        setLastResult(r);
        const myBets = pendingRef.current;
        let totalWin = 0;
        if (myBets.length > 0) {
          myBets.forEach((b) => {
            let payout = 0;
            if (b.betGroup === "total" && b.betValue === r.sum) payout = TOTAL_PAYOUTS[r.sum] || 0;
            else if (b.betGroup === "bigsmall" && b.betValue === r.big && !r.isTriple) payout = 2;
            else if (b.betGroup === "oddeven" && b.betValue === r.oddEven && !r.isTriple) payout = 2;
            else if (b.betGroup === "twoSame") {
              const s = [...r.dice].sort();
              if (s[0] === b.betValue[0] && s[1] === b.betValue[1]) payout = 17.64;
            } else if (b.betGroup === "threeSame") {
              if (b.betValue === "any3" && r.isTriple) payout = 29.4;
              else if (r.isTriple && r.dice[0] === b.betValue) payout = 176.4;
            } else if (b.betGroup === "diffCombo") {
              const cn = b.betValue.split(",").map(Number).sort();
              if (JSON.stringify(cn) === JSON.stringify([...r.dice].sort((a, c) => a - c)) && !r.isTriple) payout = 17.64;
            }
            totalWin += b.amount * payout;
          });
          if (totalWin > 0) { setBalance((b) => b + totalWin); showToast(`🎉 Won ৳${totalWin.toFixed(2)}!`, "win"); }
          else showToast(`💸 Round lost`, "lose");
          setMyHistory((mh) => [{ period: msg.period, result: r, bets: myBets, totalWin, market: modeRef.current.label, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...mh].slice(0, 30));
        }
      }
      if (msg.type === "bet_accepted") {
        setBalance(msg.newBalance);
        setPendingBets((b) => [...b, { betGroup: msg.betGroup, betValue: msg.betValue, amount: msg.amount }]);
        showToast(`✅ ৳${msg.amount} placed`, "info");
      }
      if (msg.type === "error") { setErr(msg.message); showToast(msg.message, "lose"); setTimeout(() => setErr(""), 3000); }
    };
    ws.onerror = () => setWsStatus("error");
    ws.onclose = () => { setWsStatus("connecting"); setTimeout(connect, 3000); };
  }, []);

  useEffect(() => { connect(); return () => { if (wsRef.current) wsRef.current.close(); }; }, [connect]);

  // Switch mode — clears the visual "selected" highlight from the old
  // market, same reasoning as WinGo: the bets themselves already resolved
  // server-side for their original round, this just resets what's shown as
  // selected so the new market's board isn't showing stale highlights.
  useEffect(() => {
    modeRef.current = MODES[modeIdx];
    if (wsRef.current?.readyState === 1) wsRef.current.send(JSON.stringify({ type: "subscribe", modeId: MODES[modeIdx].id }));
    setPendingBets([]);
    pendingRef.current = [];
  }, [modeIdx]);

  // Rolling dice animation during the last few locked seconds
  useEffect(() => {
    if (isLocked && !rollTimerRef.current) {
      rollTimerRef.current = setInterval(() => {
        setRollingFaces([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      }, 120);
    }
    if (!isLocked && rollTimerRef.current) {
      clearInterval(rollTimerRef.current);
      rollTimerRef.current = null;
    }
    return () => { if (rollTimerRef.current) { clearInterval(rollTimerRef.current); rollTimerRef.current = null; } };
  }, [isLocked]);

  function placeBet(betGroup, betValue) {
    if (!wsRef.current || wsRef.current.readyState !== 1) { showToast("Not connected", "lose"); return; }
    if (isLocked) { showToast("Betting closed", "lose"); return; }
    if (balance < betAmount) { showToast("Insufficient balance", "lose"); return; }
    wsRef.current.send(JSON.stringify({ type: "bet", betGroup, betValue, amount: betAmount }));
  }

  const isSelected = (betGroup, betValue) =>
    pendingBets.some((b) => b.betGroup === betGroup && JSON.stringify(b.betValue) === JSON.stringify(betValue));

  const handleCustomAmt = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmt(v);
    if (v && parseInt(v) >= 1) setBetAmount(parseInt(v));
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const R = "#c0392b", DR = "#922b21", G = "#2e7d32";
  const chartData = [...history].slice(0, 20).reverse();
  const displayDice = isLocked ? rollingFaces : (lastResult?.dice || [1, 1, 1]);

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", maxWidth: 420, margin: "0 auto", background: "#f4f4f4", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <style>{CSS}</style>
      <style>{`
        @keyframes diceBounce { 0% { transform: translateY(0px) rotate(-8deg) scale(1); } 100%{ transform: translateY(-10px) rotate(8deg) scale(1.05); } }
        @keyframes dicePopIn { 0% { transform: scale(0.3) rotate(-15deg); opacity:0; } 65% { transform: scale(1.18) rotate(4deg); opacity:1; } 82% { transform: scale(0.93) rotate(-2deg); } 100%{ transform: scale(1) rotate(0deg); opacity:1; } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px) translateX(-50%)} to {opacity:1;transform:translateY(0) translateX(-50%)} }
        @keyframes pulseRed { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .hov:hover{transform:scale(1.06)!important; transition:transform 0.12s;}
        .hov:active{transform:scale(0.94)!important;}
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: 62, left: "50%",
          background: toast.type === "win" ? "#2e7d32" : toast.type === "lose" ? "#b71c1c" : "#1565c0",
          color: "#fff", padding: "10px 24px", borderRadius: 24, fontSize: 14, fontWeight: 700,
          zIndex: 9999, whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          animation: "fadeUp 0.22s ease forwards",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${R},${DR})`, padding: "14px 16px", display: "flex", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.18)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 8, padding: "4px 12px", fontWeight: 700 }}>‹</button>
        <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: 2, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>K3 DICE</span>
        <div style={{ width: 44 }} />
      </div>

      {/* Wallet */}
      <div style={{ background: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: R }}>৳{Number(balance || 0).toFixed(2)}</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
            💼 Wallet balance {wsStatus !== "connected" && <span style={{ color: "#e65100" }}>· ⟳ Connecting…</span>}
          </div>
        </div>
      </div>

      {err && <div style={{ background: "#FFF0F0", padding: "8px 14px", fontSize: 13, color: "#c62828", fontWeight: 600, margin: "8px 12px 0", borderRadius: 8 }}>{err}</div>}

      {/* Market tabs */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #eee", overflowX: "auto" }}>
        {MODES.map((m, i) => {
          const active = i === modeIdx;
          return (
            <button key={m.id} onClick={() => setModeIdx(i)} style={{
              flex: 1, minWidth: 72, padding: "10px 4px 8px", border: "none",
              background: active ? "#fff" : "#fafafa",
              borderBottom: active ? `2.5px solid ${R}` : "2.5px solid transparent",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : "#888" }}>{m.label}</div>
            </button>
          );
        })}
      </div>

      {/* Period + countdown */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 14px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <span style={{ color: "#1565c0", fontWeight: 600, fontSize: 10, letterSpacing: 0.3 }}>{currentPeriod.slice(-14)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 10, color: "#aaa", marginRight: 4 }}>Time</span>
          {[mm[0], mm[1], ":", ss[0], ss[1]].map((c, i) =>
            c === ":"
              ? <span key={i} style={{ fontWeight: 900, color: R, fontSize: 18, margin: "0 1px" }}>:</span>
              : <span key={i} style={{ background: R, color: "#fff", borderRadius: 4, padding: "2px 5px", fontWeight: 800, fontSize: 15, minWidth: 18, textAlign: "center", display: "inline-block", lineHeight: 1.4 }}>{c}</span>
          )}
        </div>
      </div>

      {isLocked && (
        <div style={{ background: "#fff3e0", padding: "5px 14px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#e65100" }}>
          🔒 Betting closed
        </div>
      )}

      {/* Dice display */}
      <div style={{ background: "linear-gradient(160deg,#1b5e20,#2e7d32,#1b5e20)", margin: "10px 12px", borderRadius: 16, padding: "18px 0", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.35)", border: "2px solid rgba(76,175,80,0.5)", position: "relative", overflow: "hidden", minHeight: 108 }}>
        {isLocked
          ? displayDice.map((v, i) => (
            <div key={i} style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 2px rgba(255,215,0,0.4),0 8px 24px rgba(0,0,0,0.5)", animation: `diceBounce 0.4s ease-in-out infinite alternate`, animationDelay: `${i * 0.12}s`, flexShrink: 0 }}>
              <DiceSVG value={v} size={72} />
            </div>
          ))
          : displayDice.map((v, i) => (
            <div key={`${currentPeriod}-${i}`} style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.5)", animation: `dicePopIn 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s both`, flexShrink: 0 }}>
              <DiceSVG value={v} size={72} />
            </div>
          ))
        }
        {!isLocked && lastResult && (
          <div style={{ position: "absolute", bottom: 7, right: 11, background: "rgba(0,0,0,0.45)", borderRadius: 9, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
            {lastResult.sum} &nbsp;·&nbsp;
            <span style={{ color: lastResult.big === "Big" ? "#FFD700" : "#90caf9" }}>{lastResult.big}</span>
            &nbsp;·&nbsp;
            <span style={{ color: "#ef9a9a" }}>{lastResult.oddEven}</span>
          </div>
        )}
      </div>

      {/* Bet type tabs */}
      <div style={{ display: "flex", margin: "0 12px", background: "#fff", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e5e5", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {["Total", "2 Same", "3 Same", "Different"].map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "9px 0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: i === activeTab ? 700 : 400, background: i === activeTab ? R : "transparent", color: i === activeTab ? "#fff" : "#666", transition: "all 0.15s" }}>{t}</button>
        ))}
      </div>

      {/* Bet area */}
      <div style={{ padding: "10px 12px 0", flex: 1, overflowY: "auto" }}>

        {activeTab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {Object.entries(TOTAL_PAYOUTS).map(([n, p]) => {
              const num = parseInt(n), isRed = num <= 10;
              return <Ball key={num} num={num} payout={p} selected={isSelected("total", num)} locked={isLocked} isRed={isRed} onClick={() => placeBet("total", num)} />;
            })}
          </div>
        )}

        {activeTab === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {TWO_SAME.map((item) => {
              const sel = isSelected("twoSame", item.pair);
              return (
                <div key={item.label} className="hov" onClick={() => !isLocked && placeBet("twoSame", item.pair)} style={{ background: sel ? "#7f0000" : "radial-gradient(circle at 30% 25%, #ff8a80, #e53935 50%, #b71c1c)", borderRadius: 12, padding: "12px 6px", display: "flex", flexDirection: "column", alignItems: "center", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.5 : 1, boxShadow: sel ? "0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.3)", border: sel ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.25)", gap: 6, userSelect: "none", transition: "transform 0.12s" }}>
                  <div style={{ display: "flex", gap: 5 }}><MiniDice value={item.pair[0]} size={28} /><MiniDice value={item.pair[1]} size={28} /></div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>{item.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>17.64X</span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {THREE_SAME.map((item) => {
              const v = item.key === "any3" ? "any3" : item.triple;
              const sel = isSelected("threeSame", v);
              const isAny = item.key === "any3";
              return (
                <div key={item.key} className="hov" onClick={() => !isLocked && placeBet("threeSame", v)} style={{ background: sel ? (isAny ? "#5d3000" : "#7f0000") : isAny ? "radial-gradient(circle at 30% 25%, #ffcc80, #ffa726 50%, #e65100)" : "radial-gradient(circle at 30% 25%, #ff8a80, #e53935 50%, #b71c1c)", borderRadius: 12, padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.5 : 1, boxShadow: sel ? "0 0 0 2.5px #FFD700,0 4px 12px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.3)", border: sel ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.25)", gap: 6, userSelect: "none", transition: "transform 0.12s" }}>
                  {isAny ? <span style={{ fontSize: 26 }}>🎲</span> : <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map((j) => <MiniDice key={j} value={item.triple} size={22} />)}</div>}
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{item.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>{item.payout}X</span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 3 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
            {DIFF_COMBO.map((k) => {
              const sel = isSelected("diffCombo", k);
              return (
                <div key={k} className="hov" onClick={() => !isLocked && placeBet("diffCombo", k)} style={{ background: sel ? "#003300" : "radial-gradient(circle at 30% 25%, #a5d6a7, #43a047 50%, #1b5e20)", borderRadius: 9, padding: "9px 3px", display: "flex", flexDirection: "column", alignItems: "center", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.5 : 1, boxShadow: sel ? "0 0 0 2.5px #FFD700" : "0 3px 8px rgba(0,0,0,0.3)", border: sel ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.2)", gap: 2, userSelect: "none", transition: "transform 0.12s" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 10 }}>{k}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 8.5 }}>17.64X</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Big/Small/Even/Odd */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 }}>
          {[{ k: "Small", grp: "bigsmall", bg: "linear-gradient(145deg,#42a5f5,#1565c0)" }, { k: "Big", grp: "bigsmall", bg: "linear-gradient(145deg,#ffa726,#e65100)" }, { k: "Even", grp: "oddeven", bg: "linear-gradient(145deg,#66bb6a,#2e7d32)" }, { k: "Odd", grp: "oddeven", bg: "linear-gradient(145deg,#ef5350,#b71c1c)" }].map(({ k, grp, bg }) => {
            const sel = isSelected(grp, k);
            return (
              <button key={k} className="hov" onClick={() => !isLocked && placeBet(grp, k)} style={{ background: sel ? "#222" : bg, border: sel ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "11px 0", color: "#fff", fontWeight: 800, fontSize: 14, cursor: isLocked ? "not-allowed" : "pointer", boxShadow: sel ? "0 0 0 2.5px #FFD700" : "0 3px 10px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: isLocked ? 0.5 : 1, transition: "transform 0.12s" }}>
                <span>{k}</span>
                <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>2X</span>
              </button>
            );
          })}
        </div>

        {/* Bet amount */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px", marginTop: 10, border: "1px solid #e5e5e5", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#555", fontWeight: 700, whiteSpace: "nowrap" }}>Bet ৳</span>
            <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 8, padding: "9px 14px", fontSize: 17, fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: 1 }}>
              {betAmount.toLocaleString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4 }}>
            {PRESETS.map((v) => (
              <button key={v} onClick={() => { setBetAmount(v); setCustomAmt(""); }} style={{ flexShrink: 0, background: betAmount === v ? R : "#f5f5f5", color: betAmount === v ? "#fff" : "#555", border: `1.5px solid ${betAmount === v ? R : "#e0e0e0"}`, borderRadius: 7, padding: "6px 10px", fontSize: 11.5, fontWeight: betAmount === v ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>৳{v}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <input
              type="text" inputMode="numeric" placeholder="Custom amount…"
              value={customAmt}
              onChange={handleCustomAmt}
              style={{ flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "8px 12px", fontSize: 14, fontWeight: 700, outline: "none", color: "#222" }}
            />
            {customAmt && (
              <button onClick={() => { setCustomAmt(""); setBetAmount(10); }} style={{ background: "#eee", border: "none", borderRadius: 7, padding: "8px 12px", cursor: "pointer", fontSize: 12, color: "#666" }}>✕</button>
            )}
          </div>
        </div>

        {pendingBets.length > 0 && (
          <div style={{ padding: "8px 2px", display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {pendingBets.map((b, i) => (
              <span key={i} style={{ padding: "4px 10px", background: "#fff8e1", border: "1.5px solid #ffd54f", borderRadius: 14, fontSize: 11, fontWeight: 700, color: "#e65100" }}>
                {String(Array.isArray(b.betValue) ? b.betValue.join("·") : b.betValue)} ৳{b.amount}
              </span>
            ))}
          </div>
        )}

        {/* Bottom tabs: History / Chart / My History */}
        <div style={{ marginTop: 12, background: "#fff", borderRadius: 14, border: "1px solid #e5e5e5", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
            {["Game History", "Chart", "My History"].map((t, i) => (
              <button key={i} onClick={() => setBottomTab(i)} style={{ flex: 1, padding: "10px 0", border: "none", background: bottomTab === i ? "#fff" : "#fafafa", borderBottom: bottomTab === i ? `2.5px solid ${R}` : "2.5px solid transparent", color: bottomTab === i ? R : "#888", fontWeight: bottomTab === i ? 700 : 400, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>{t}</button>
            ))}
          </div>

          {bottomTab === 0 && (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: 28, color: "#ccc", fontSize: 13 }}>No rounds yet for this market</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#aaa", fontWeight: 600 }}>Period</th>
                      <th style={{ padding: "8px 6px", textAlign: "center", color: "#aaa", fontWeight: 600 }}>Sum</th>
                      <th style={{ padding: "8px 6px", textAlign: "center", color: "#aaa", fontWeight: 600 }}>Result</th>
                      <th style={{ padding: "8px 6px", textAlign: "center", color: "#aaa", fontWeight: 600 }}>Dice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8f8f8", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "7px 10px", fontSize: 9, color: "#1565c0", fontWeight: 600, fontFamily: "monospace" }}>{row.period?.slice(-8)}</td>
                        <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 900, fontSize: 16, color: "#222" }}>{row.sum}</td>
                        <td style={{ padding: "7px 6px", textAlign: "center" }}>
                          <span style={{ background: row.big === "Big" ? "#fff3e0" : "#e3f2fd", color: row.big === "Big" ? "#e65100" : "#1565c0", borderRadius: 5, padding: "2px 6px", fontSize: 10, fontWeight: 700, marginRight: 3 }}>{row.big}</span>
                          <span style={{ background: row.oddEven === "Even" ? "#e8f5e9" : "#fce4ec", color: row.oddEven === "Even" ? "#2e7d32" : "#c62828", borderRadius: 5, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>{row.oddEven}</span>
                        </td>
                        <td style={{ padding: "7px 6px" }}>
                          <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                            {row.dice.map((v, j) => <MiniDice key={j} value={v} size={20} />)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {bottomTab === 1 && (
            <div style={{ padding: "12px 10px", maxHeight: 300, overflowY: "auto" }}>
              {chartData.length === 0 ? (
                <div style={{ textAlign: "center", padding: 28, color: "#ccc", fontSize: 13 }}>No data yet</div>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8, textAlign: "center" }}>Sum trend — last {chartData.length} rounds ({MODES[modeIdx].label})</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 90, padding: "0 2px", marginBottom: 4 }}>
                    {chartData.map((row, i) => {
                      const h = Math.max(8, ((row.sum - 3) / (18 - 3)) * 90);
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <span style={{ fontSize: 7, color: "#bbb", fontWeight: 700 }}>{row.sum}</span>
                          <div style={{ width: "100%", height: `${h}px`, background: row.sum >= 11 ? "#e53935" : "#1565c0", borderRadius: "2px 2px 0 0", minHeight: 5 }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {[["Big", "#e65100", "#fff3e0", "big"], ["Small", "#1565c0", "#e3f2fd", "small"], ["Even", "#2e7d32", "#e8f5e9", "even"], ["Odd", "#c62828", "#fce4ec", "odd"]].map(([label, color, bg, key]) => {
                      const cnt = history.filter((r) => (key === "big" && r.big === "Big") || (key === "small" && r.big === "Small") || (key === "even" && r.oddEven === "Even") || (key === "odd" && r.oddEven === "Odd")).length;
                      const pct = history.length ? Math.round((cnt / history.length) * 100) : 0;
                      return (
                        <div key={label} style={{ flex: 1, background: bg, borderRadius: 8, padding: "8px 4px", textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</div>
                          <div style={{ fontSize: 9, color: "#888", marginTop: 1 }}>{label}</div>
                          <div style={{ fontSize: 9, color: "#aaa" }}>{cnt}x</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {bottomTab === 2 && (
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {myHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: 28, color: "#ccc", fontSize: 13 }}>No bets yet this session</div>
              ) : (
                <div>
                  {myHistory.map((row, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#aaa" }}>
                          <span style={{ background: R, color: "#fff", borderRadius: 5, padding: "1px 6px", fontWeight: 700, marginRight: 6 }}>{row.market || "K3"}</span>
                          {row.time}
                        </span>
                        <div style={{ display: "flex", gap: 3 }}>{row.result.dice.map((d, j) => <MiniDice key={j} value={d} size={18} />)}</div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#c0392b" }}>{row.result.sum}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 4 }}>
                        {row.bets.map((b, j) => <span key={j} style={{ fontSize: 11, background: "#f0f0f0", borderRadius: 6, padding: "2px 8px", color: "#666" }}>{String(Array.isArray(b.betValue) ? b.betValue.join("·") : b.betValue)} ৳{b.amount}</span>)}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: row.totalWin > 0 ? "#22C55E" : "#EF5350" }}>
                        {row.totalWin > 0 ? `+৳${row.totalWin.toFixed(2)} Won 🎉` : "No win"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

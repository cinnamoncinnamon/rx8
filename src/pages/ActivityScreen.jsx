import React, { useState, useEffect, useRef } from "react";
import BottomNav from "../components/BottomNav";
import { G, gradient } from "../constants";
import {
  getBets, getRebateData, claimRebate,
  redeemGiftCode, getCheckinData, claimCheckin,
  getLuckySpinData, claimLuckySpin,
  getDepositBonusData, claimDepositBonus,
  getLeaderboard, getDeposits, hasDepositHistory,
} from "../utils/activityStore";

const RED = "#EF5350";
const ORANGE = "#FF7043";

// ── Shared back header ────────────────────────────────────────────
function SubHeader({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#333", padding: 0 }}>‹</button>
      <span style={{ fontWeight: 800, fontSize: 16, color: "#222" }}>{title}</span>
      <div style={{ minWidth: 28 }}>{right || null}</div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: type === "success" ? "#4CAF50" : RED, color: "#fff", padding: "12px 24px", borderRadius: 24, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };
  return [toast, show];
}

// ══════════════════════════════════════════════════════════════════
// SUB SCREENS
// ══════════════════════════════════════════════════════════════════

// ── Activity Award ────────────────────────────────────────────────
function ActivityAwardScreen({ onBack, balance, setBalance }) {
  const [toast, showToast] = useToast();
  const bets = getBets();
  const [claimed, setClaimed] = useState(() => JSON.parse(localStorage.getItem("spinova_award_claimed") || "{}"));

  const tasks = [
    { id: "weekly", label: "Weekly task", color: "#EF5350", target: 50000, reward: 150, current: bets.week },
    { id: "daily1", label: "Daily mission", color: "#4CAF50", target: 10000, reward: 50, current: bets.today },
    { id: "daily2", label: "Daily mission", color: "#4CAF50", target: 1000, reward: 10, current: bets.today },
  ];

  const today = new Date().toDateString();
  const week = (() => { const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(new Date().setDate(diff)).toDateString(); })();

  function claimTask(task) {
    const claimKey = task.id === "weekly" ? "week_" + week : task.id + "_" + today;
    if (claimed[claimKey]) return showToast("Already claimed!", "error");
    if (task.current < task.target) return showToast(`Need ৳${task.target.toLocaleString()} in bets!`, "error");
    setBalance(b => b + task.reward);
    const next = { ...claimed, [claimKey]: true };
    setClaimed(next);
    localStorage.setItem("spinova_award_claimed", JSON.stringify(next));
    showToast(`+৳${task.reward} claimed! 🎉`);
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SubHeader title="Activity Award" onBack={onBack} />

      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg,#FF8C00,#FF6B00)", margin: 14, borderRadius: 18, padding: "20px 18px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -10, top: -10, fontSize: 80, opacity: 0.2 }}>🎲</div>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Activity Award</div>
        <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5 }}>Complete weekly/daily tasks to receive rich rewards.<br />Weekly rewards reset every Monday.</div>
      </div>

      {tasks.map((task) => {
        const claimKey = task.id === "weekly" ? "week_" + week : task.id + "_" + today;
        const isClaimed = claimed[claimKey];
        const isDone = task.current >= task.target;
        const pct = Math.min((task.current / task.target) * 100, 100);
        return (
          <div key={task.id} style={{ background: "#fff", margin: "0 14px 14px", borderRadius: 16, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ background: task.color, color: "#fff", fontWeight: 800, fontSize: 12, padding: "4px 14px", borderRadius: 20 }}>{task.label}</span>
              <span style={{ fontSize: 12, color: isClaimed ? "#4CAF50" : isDone ? ORANGE : "#999", fontWeight: 700 }}>{isClaimed ? "✓ Claimed" : isDone ? "Ready!" : "Unfinished"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>🎯</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Betting volume task</span>
              <span style={{ marginLeft: "auto", fontSize: 13, color: RED, fontWeight: 700 }}>{task.current.toLocaleString()}/{task.target.toLocaleString()}</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 8, height: 8, marginBottom: 10 }}>
              <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg,${task.color},${ORANGE})`, borderRadius: 8, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#888" }}>Award amount <span style={{ color: ORANGE, fontWeight: 800 }}>🪙 ৳{task.reward}.00</span></span>
              <button onClick={() => claimTask(task)} style={{ background: isClaimed ? "#ccc" : isDone ? `linear-gradient(90deg,${RED},${ORANGE})` : "#eee", color: isClaimed ? "#999" : isDone ? "#fff" : "#bbb", border: "none", borderRadius: 20, padding: "8px 22px", fontWeight: 700, fontSize: 13, cursor: isClaimed ? "default" : "pointer", fontFamily: "'Poppins',sans-serif" }}>
                {isClaimed ? "Claimed" : "Claim"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Betting Rebate ────────────────────────────────────────────────
function BettingRebateScreen({ onBack, balance, setBalance }) {
  const [toast, showToast] = useToast();
  const [data, setData] = useState(getRebateData());

  const rebateAmt = parseFloat((data.todayBets * 0.003).toFixed(2));

  function handleClaim() {
    if (data.todayClaimed) return showToast("Already claimed today!", "error");
    if (rebateAmt <= 0) return showToast("No bets placed today!", "error");
    const amt = claimRebate();
    setBalance(b => b + amt);
    setData(getRebateData());
    showToast(`+৳${amt} rebate claimed! 🎉`);
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SubHeader title="Betting Rebate" onBack={onBack} />

      <div style={{ margin: 14, background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["All", "Lottery", "Casino", "Racing"].map((tab, i) => (
            <div key={tab} style={{ background: i === 0 ? RED : "#f5f5f5", color: i === 0 ? "#fff" : "#888", padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{tab}</div>
          ))}
        </div>

        <div style={{ marginBottom: 6, fontWeight: 700, fontSize: 14, color: "#333" }}>All-Total betting rebate</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff3f3", border: `1px solid ${RED}`, borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
          <span style={{ color: RED, fontSize: 12 }}>🛡</span>
          <span style={{ color: RED, fontSize: 12, fontWeight: 600 }}>Real-time count</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#333", marginBottom: 14 }}>🏷 {rebateAmt.toFixed(2)}</div>

        <div style={{ background: "#f9f9f9", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#888" }}>
          0.3% rebate rate · Upgrade VIP to increase rebate rate
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: "#f5f5f5", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Today rebate</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: ORANGE }}>{rebateAmt.toFixed(2)}</div>
          </div>
          <div style={{ flex: 1, background: "#f5f5f5", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Total rebate</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: ORANGE }}>{data.totalClaimed.toFixed(2)}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 14, textAlign: "center" }}>Automatic reset at 01:00:00 every morning</div>

        <button onClick={handleClaim} style={{ width: "100%", padding: "14px 0", borderRadius: 28, border: "none", background: data.todayClaimed ? "#ccc" : `linear-gradient(90deg,${RED},${ORANGE})`, color: "#fff", fontWeight: 800, fontSize: 15, cursor: data.todayClaimed ? "default" : "pointer", fontFamily: "'Poppins',sans-serif" }}>
          {data.todayClaimed ? "Already Claimed Today" : "One-Click Rebate"}
        </button>
      </div>

      <div style={{ margin: "0 14px", background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#333", borderLeft: `4px solid ${RED}`, paddingLeft: 10, marginBottom: 14 }}>Rebate history</div>
        <button style={{ width: "100%", padding: "12px 0", borderRadius: 28, border: `1.5px solid ${RED}`, background: "transparent", color: RED, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>All history</button>
      </div>
    </div>
  );
}

// ── Gift Code ─────────────────────────────────────────────────────
function GiftCodeScreen({ onBack, balance, setBalance }) {
  const [code, setCode] = useState("");
  const [toast, showToast] = useToast();

  function handleRedeem() {
    const result = redeemGiftCode(code);
    if (result.success) {
      setBalance(b => b + result.amount);
      setCode("");
      showToast(`+৳${result.amount} added to your balance! 🎁`);
    } else {
      showToast(result.msg, "error");
    }
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SubHeader title="Gift Code" onBack={onBack} />

      <div style={{ margin: 14 }}>
        <div style={{ background: `linear-gradient(135deg,#7C3AED,#A855F7)`, borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 20, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: 100, opacity: 0.1 }}>🎁</div>
          <div style={{ fontSize: 50, marginBottom: 10 }}>🎁</div>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Redeem Gift Code</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Enter your code below to receive bonus balance</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 8 }}>Enter Gift Code</div>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SPINOVA10"
            style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #e0e0e0", fontSize: 16, fontWeight: 700, fontFamily: "'Poppins',sans-serif", outline: "none", boxSizing: "border-box", letterSpacing: 2, textAlign: "center", color: "#333" }}
          />
          <button onClick={handleRedeem} style={{ width: "100%", marginTop: 16, padding: "14px 0", borderRadius: 28, border: "none", background: code.length > 0 ? `linear-gradient(90deg,#7C3AED,#A855F7)` : "#e0e0e0", color: code.length > 0 ? "#fff" : "#aaa", fontWeight: 800, fontSize: 15, cursor: code.length > 0 ? "pointer" : "default", fontFamily: "'Poppins',sans-serif", transition: "all 0.2s" }}>
            Redeem Code
          </button>

          <div style={{ marginTop: 20, padding: "14px", background: "#f9f9f9", borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 8 }}>ℹ️ Rules</div>
            <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7 }}>
              • Each code can only be used once<br />
              • Codes are case-insensitive<br />
              • Balance is credited instantly<br />
              • Follow our social media for new codes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Daily Check-in ────────────────────────────────────────────────
function DailyCheckinScreen({ onBack, balance, setBalance }) {
  const [toast, showToast] = useToast();
  const [data, setData] = useState(getCheckinData());
  const deposits = getDeposits();

  function handleCheckin() {
    const result = claimCheckin(deposits.total);
    if (result.success) {
      setBalance(b => b + result.amount);
      setData(getCheckinData());
      showToast(`+৳${result.amount} check-in bonus! 🎉`);
    } else {
      showToast(result.msg, "error");
    }
  }

  const currentStreak = data.streak % 7;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SubHeader title="Daily Check-in" onBack={onBack} />

      <div style={{ background: `linear-gradient(135deg,${RED},${ORANGE})`, margin: 14, borderRadius: 20, padding: "20px 18px", color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>📅 Daily Check-in</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>Streak: {data.streak} day{data.streak !== 1 ? "s" : ""} • Check in daily for bigger rewards!</div>
      </div>

      {/* Day cards */}
      <div style={{ margin: "0 14px 14px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {data.rewards.map((r, i) => {
          const isPast = i < currentStreak;
          const isToday = i === currentStreak;
          return (
            <div key={r.day} style={{ background: isPast ? "#4CAF50" : isToday ? `linear-gradient(135deg,${RED},${ORANGE})` : "#fff", borderRadius: 12, padding: "8px 4px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", border: isToday ? "none" : "1px solid #eee" }}>
              <div style={{ fontSize: 9, color: isPast || isToday ? "rgba(255,255,255,0.8)" : "#aaa", fontWeight: 700, marginBottom: 2 }}>Day {r.day}</div>
              <div style={{ fontSize: isPast ? 14 : 11, marginBottom: 2 }}>{isPast ? "✓" : "🪙"}</div>
              <div style={{ fontSize: 9, color: isPast || isToday ? "#fff" : ORANGE, fontWeight: 800 }}>৳{r.bonus >= 1000 ? (r.bonus / 1000).toFixed(0) + "k" : r.bonus}</div>
            </div>
          );
        })}
      </div>

      {/* Rules table */}
      <div style={{ margin: "0 14px 14px", background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: RED }}>
          {["Day", "Min Deposit", "Bonus"].map(h => (
            <div key={h} style={{ color: "#fff", fontWeight: 800, fontSize: 12, padding: "10px 0", textAlign: "center" }}>{h}</div>
          ))}
        </div>
        {data.rewards.map((r, i) => (
          <div key={r.day} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: 700, color: "#333" }}>{r.day}</div>
            <div style={{ textAlign: "center", padding: "10px 0", fontSize: 12, color: ORANGE }}>৳{r.deposit.toLocaleString()}</div>
            <div style={{ textAlign: "center", padding: "10px 0", fontSize: 12, color: ORANGE, fontWeight: 700 }}>৳{r.bonus.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={{ margin: "0 14px 14px", background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 8 }}>📋 Rules</div>
        {["The higher the consecutive login days, the more rewards you get, up to 7 consecutive days", "During the activity, please check in once a day", "Players with no deposit history cannot claim the bonus"].map((rule, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: "#666" }}>
            <span style={{ color: RED, flexShrink: 0 }}>◆</span>
            <span>{rule}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 14px 20px" }}>
        <button onClick={handleCheckin} style={{ width: "100%", padding: "14px 0", borderRadius: 28, border: "none", background: data.claimedToday ? "#ccc" : `linear-gradient(90deg,${RED},${ORANGE})`, color: "#fff", fontWeight: 800, fontSize: 15, cursor: data.claimedToday ? "default" : "pointer", fontFamily: "'Poppins',sans-serif" }}>
          {data.claimedToday ? "✓ Checked In Today" : "Check In Now"}
        </button>
      </div>
    </div>
  );
}

// ── Lucky Spin ────────────────────────────────────────────────────
const SPIN_SEGMENTS = [5, 20, 5, 50, 10, 100, 5, 200, 10, 30, 5, 150];
const SEGMENT_COLORS = ["#EF5350","#FF7043","#FFA726","#66BB6A","#42A5F5","#AB47BC","#EF5350","#FF7043","#FFA726","#66BB6A","#42A5F5","#AB47BC"];

function LuckySpinScreen({ onBack, balance, setBalance }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [toast, showToast] = useToast();
  const [spinData, setSpinData] = useState(getLuckySpinData());
  const angleRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    drawWheel(angleRef.current);
  }, []);

  function drawWheel(angle) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const seg = (2 * Math.PI) / SPIN_SEGMENTS.length;
    SPIN_SEGMENTS.forEach((val, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle + i * seg, angle + (i + 1) * seg);
      ctx.fillStyle = SEGMENT_COLORS[i];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + i * seg + seg / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Poppins";
      ctx.fillText("৳" + val, r - 12, 5);
      ctx.restore();
    });
    // center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = RED;
    ctx.font = "bold 11px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", cx, cy + 4);
  }

  function handleSpin() {
    if (spinning || spinData.spunToday) return;
    if (!getLuckySpinData || !hasTodayDepositCheck()) {
      showToast("Deposit first to spin today!", "error");
      return;
    }
    const result = claimLuckySpin();
    if (!result.success) { showToast(result.msg, "error"); return; }

    setSpinning(true);
    const totalRotation = (5 + Math.random() * 5) * 2 * Math.PI;
    const duration = 4000;
    const start = performance.now();
    const startAngle = angleRef.current;

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      angleRef.current = startAngle + totalRotation * ease;
      drawWheel(angleRef.current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setSpinData(getLuckySpinData());
        setBalance(b => b + result.amount);
        showToast(`🎰 You won ৳${result.amount}!`);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
  }

  function hasTodayDepositCheck() {
    const data = JSON.parse(localStorage.getItem("spinova_deposits") || "{}");
    const t = new Date().toDateString();
    return (data[t] || 0) > 0;
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SubHeader title="Lucky Spin" onBack={onBack} />

      <div style={{ textAlign: "center", padding: "20px 14px" }}>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 4 }}>Spin once per day after deposit</div>
        <div style={{ fontSize: 13, color: spinData.spunToday ? "#4CAF50" : ORANGE, fontWeight: 700, marginBottom: 20 }}>
          {spinData.spunToday ? "✓ Already spun today" : "🎰 Ready to spin!"}
        </div>

        {/* Pointer */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: `24px solid ${RED}`, zIndex: 10 }} />
          <canvas ref={canvasRef} width={280} height={280} style={{ borderRadius: "50%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
        </div>

        <button onClick={handleSpin} disabled={spinning || spinData.spunToday} style={{ marginTop: 28, padding: "14px 60px", borderRadius: 30, border: "none", background: spinning || spinData.spunToday ? "#ccc" : `linear-gradient(90deg,${RED},${ORANGE})`, color: "#fff", fontWeight: 800, fontSize: 16, cursor: spinning || spinData.spunToday ? "default" : "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: spinning || spinData.spunToday ? "none" : "0 4px 16px rgba(239,83,80,0.4)" }}>
          {spinning ? "Spinning..." : spinData.spunToday ? "Come back tomorrow" : "SPIN NOW"}
        </button>

        <div style={{ marginTop: 20, background: "#fff", borderRadius: 16, padding: 16, textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 8 }}>📋 Rules</div>
          {["One free spin per day", "Must make a deposit today to spin", "Winnings credited instantly to balance", "Wheel shows ৳5–৳200 · actual payout ৳5 or ৳10"].map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>◆ {r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────
function LeaderboardScreen({ onBack, user }) {
  const board = getLeaderboard();
  const username = (user?.contact?.includes("@") ? user.contact.split("@")[0] : user?.contact) || "Player";
  const medals = ["🥇", "🥈", "🥉"];
  const bonuses = [500, 200, 100];

  // Add self if not on board
  const myBets = getBets().week;
  const enriched = board.length === 0
    ? [{ rank: 1, name: username, amount: myBets }]
    : board;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <SubHeader title="Weekly Leaderboard" onBack={onBack} />

      <div style={{ background: `linear-gradient(135deg,#1a1a2e,#16213e)`, margin: 14, borderRadius: 20, padding: "20px 18px", color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>🏆 Top Bettors This Week</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Top 3 win bonus rewards! Resets every Monday.</div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {bonuses.map((b, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 0", textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{medals[i]}</div>
              <div style={{ fontSize: 11, color: ORANGE, fontWeight: 800 }}>৳{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "0 14px" }}>
        {enriched.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, padding: 40, textAlign: "center", color: "#aaa", fontSize: 14 }}>No bets placed this week yet</div>
        ) : enriched.map((entry) => (
          <div key={entry.rank} style={{ background: entry.name === username ? "#fff8f0" : "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: entry.name === username ? `1.5px solid ${ORANGE}` : "1.5px solid transparent" }}>
            <div style={{ fontSize: entry.rank <= 3 ? 24 : 16, fontWeight: 800, color: entry.rank <= 3 ? "inherit" : "#ccc", minWidth: 32, textAlign: "center" }}>
              {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{entry.name}{entry.name === username ? " (You)" : ""}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Weekly bets: ৳{entry.amount.toLocaleString()}</div>
            </div>
            {entry.rank <= 3 && <div style={{ background: `linear-gradient(135deg,${RED},${ORANGE})`, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 10 }}>+৳{bonuses[entry.rank - 1]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Deposit Bonus ─────────────────────────────────────────────────
function DepositBonusScreen({ onBack, balance, setBalance }) {
  const [toast, showToast] = useToast();
  const [data, setData] = useState(getDepositBonusData());

  function handleClaim() {
    const result = claimDepositBonus();
    if (result.success) {
      setBalance(b => b + result.amount);
      setData(getDepositBonusData());
      showToast(`+৳${result.amount} deposit bonus! 💰`);
    } else {
      showToast(result.msg, "error");
    }
  }

  const bonusAmt = Math.min(data.todayDeposit * 0.05, 10).toFixed(2);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SubHeader title="Deposit Bonus" onBack={onBack} />

      <div style={{ margin: 14 }}>
        <div style={{ background: `linear-gradient(135deg,#1B5E20,#43A047)`, borderRadius: 20, padding: "24px 20px", color: "#fff", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>First Deposit Bonus</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Get 5% back on your first deposit each day (max ৳10)</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: "#888" }}>Today's deposit</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#333" }}>৳{data.todayDeposit.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: "#888" }}>Bonus (5%, max ৳10)</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: ORANGE }}>৳{bonusAmt}</span>
          </div>
          <button onClick={handleClaim} style={{ width: "100%", padding: "14px 0", borderRadius: 28, border: "none", background: data.claimedToday || data.todayDeposit <= 0 ? "#ccc" : `linear-gradient(90deg,#1B5E20,#43A047)`, color: "#fff", fontWeight: 800, fontSize: 15, cursor: data.claimedToday || data.todayDeposit <= 0 ? "default" : "pointer", fontFamily: "'Poppins',sans-serif" }}>
            {data.claimedToday ? "✓ Claimed Today" : data.todayDeposit <= 0 ? "Make a deposit first" : "Claim Bonus"}
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 8 }}>📋 Rules</div>
          {["Available once per day", "Based on your first deposit of the day", "5% bonus up to maximum ৳10", "Credited instantly to your balance"].map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>◆ {r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN ACTIVITY SCREEN
// ══════════════════════════════════════════════════════════════════
export default function ActivityScreen({ user, balance, setBalance, onGoHome, onGoWallet, onGoProfile, onGoPromo }) {
  const [subScreen, setSubScreen] = useState(null);

  if (subScreen === "award") return <ActivityAwardScreen onBack={() => setSubScreen(null)} balance={balance} setBalance={setBalance} />;
  if (subScreen === "rebate") return <BettingRebateScreen onBack={() => setSubScreen(null)} balance={balance} setBalance={setBalance} />;
  if (subScreen === "gift") return <GiftCodeScreen onBack={() => setSubScreen(null)} balance={balance} setBalance={setBalance} />;
  if (subScreen === "checkin") return <DailyCheckinScreen onBack={() => setSubScreen(null)} balance={balance} setBalance={setBalance} />;
  if (subScreen === "spin") return <LuckySpinScreen onBack={() => setSubScreen(null)} balance={balance} setBalance={setBalance} />;
  if (subScreen === "leaderboard") return <LeaderboardScreen onBack={() => setSubScreen(null)} user={user} />;
  if (subScreen === "depbonus") return <DepositBonusScreen onBack={() => setSubScreen(null)} balance={balance} setBalance={setBalance} />;

  const bets = getBets();
  const deposits = getDeposits();
  const rebate = getRebateData();
  const spin = getLuckySpinData();
  const checkin = getCheckinData();

  const cards = [
    { id: "award", emoji: "🎯", label: "Activity Award", desc: "Complete tasks for rewards", color: "linear-gradient(135deg,#FF8C00,#FF6B00)" },
    { id: "rebate", emoji: "💸", label: "Betting Rebate", desc: `0.3% back · ৳${(bets.today * 0.003).toFixed(2)} available`, color: "linear-gradient(135deg,#1565C0,#1E88E5)" },
    { id: "gift", emoji: "🎁", label: "Gift Code", desc: "Enter code for bonus balance", color: "linear-gradient(135deg,#6A1B9A,#AB47BC)" },
    { id: "checkin", emoji: "📅", label: "Daily Check-in", desc: checkin.claimedToday ? "✓ Checked in today" : `Day ${(checkin.streak % 7) + 1} · Check in now!`, color: "linear-gradient(135deg,#C62828,#EF5350)" },
    { id: "spin", emoji: "🎰", label: "Lucky Spin", desc: spin.spunToday ? "Come back tomorrow" : "Spin to win up to ৳200!", color: "linear-gradient(135deg,#00695C,#26A69A)" },
    { id: "leaderboard", emoji: "🏆", label: "Leaderboard", desc: "Top bettors win big prizes", color: "linear-gradient(135deg,#1a1a2e,#16213e)" },
    { id: "depbonus", emoji: "💰", label: "Deposit Bonus", desc: "5% back on first deposit daily", color: "linear-gradient(135deg,#1B5E20,#43A047)" },
  ];

  const todayBonus = deposits.today * 0.05 > 0 ? Math.min(deposits.today * 0.05, 10) : 0;
  const totalBonus = parseFloat((JSON.parse(localStorage.getItem("spinova_rebate") || "{}").total || 0).toFixed(2));

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80, fontFamily: "'Poppins',sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${RED},${ORANGE})`, padding: "20px 18px 24px" }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 16 }}>Activity</div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16, backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 }}>Today's bonus</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 24 }}>৳{todayBonus.toFixed(2)}</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 }}>Total bonus</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 24 }}>৳{totalBonus.toFixed(2)}</div>
            </div>
          </div>
          <button style={{ width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 20, border: "none", background: "#fff", color: RED, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
            Bonus details
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ padding: "16px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {cards.map(card => (
            <div key={card.id} onClick={() => setSubScreen(card.id)}
              style={{ background: card.color, borderRadius: 18, padding: "18px 16px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", position: "relative", overflow: "hidden", transition: "transform 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ position: "absolute", bottom: -10, right: -10, fontSize: 52, opacity: 0.15 }}>{card.emoji}</div>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{card.emoji}</div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{card.label}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav
        activeNav="activity"
        setActiveNav={() => {}}
        onGoHome={onGoHome}
        onGoWallet={onGoWallet}
        onGoProfile={onGoProfile}
        onGoActivity={() => {}}
        onGoPromo={onGoPromo}
      />
    </div>
  );
}
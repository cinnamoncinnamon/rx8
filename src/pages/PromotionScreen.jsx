import React, { useState } from "react";
import { G, gradient } from "../constants";
import BottomNav from "../components/BottomNav";
import { apiRedeemPromoCode, apiGetBalance } from "../api";

const RED = "#EF5350";
const ORANGE = "#FF7043";

function generateCode(contact) {
  const existing = JSON.parse(localStorage.getItem("spinova_all_codes") || "[]");
  const base = (contact || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "SPIN";
  let code;
  do {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    code = base + rand;
  } while (existing.includes(code));
  existing.push(code);
  localStorage.setItem("spinova_all_codes", JSON.stringify(existing));
  return code;
}

function getMyReferralCode(contact) {
  const key = "spinova_mycode";
  let code = localStorage.getItem(key);
  if (!code) {
    code = generateCode(contact);
    localStorage.setItem(key, code);
  }
  return code;
}

function getReferralStats() {
  const data = JSON.parse(localStorage.getItem("spinova_referrals") || "{}");
  return {
    referred: data.referred || 0,
    earned: data.earned || 0,
    history: data.history || [],
  };
}

const VIP_LEVELS = [
  { name: "Bronze", min: 0, max: 4999, color: "#CD7F32", icon: "🥉", rebate: "0.3%", bg: "linear-gradient(135deg,#8D6E63,#CD7F32)" },
  { name: "Silver", min: 5000, max: 19999, color: "#9E9E9E", icon: "🥈", rebate: "0.5%", bg: "linear-gradient(135deg,#757575,#BDBDBD)" },
  { name: "Gold", min: 20000, max: 99999, color: "#FFC107", icon: "🥇", rebate: "0.8%", bg: "linear-gradient(135deg,#F9A825,#FFD54F)" },
  { name: "Diamond", min: 100000, max: Infinity, color: "#42A5F5", icon: "💎", rebate: "1.2%", bg: "linear-gradient(135deg,#1565C0,#42A5F5)" },
];

function getVIPLevel(totalDeposit) {
  return VIP_LEVELS.find(v => totalDeposit >= v.min && totalDeposit <= v.max) || VIP_LEVELS[0];
}

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

function SubHeader({ title, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#333", padding: 0 }}>‹</button>
      <span style={{ fontWeight: 800, fontSize: 16, color: "#222" }}>{title}</span>
      <div style={{ minWidth: 28 }} />
    </div>
  );
}

// ── Referral Detail Screen ────────────────────────────────────────
function ReferralScreen({ onBack, user, balance, setBalance }) {
  const [toast, showToast] = useToast();
  const [stats, setStats] = useState(getReferralStats());
  const code = getMyReferralCode(user?.contact);
  const [activeTab, setActiveTab] = useState("data");

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => showToast("Code copied! 📋"));
  }

  function simulateReferral() {
    const data = JSON.parse(localStorage.getItem("spinova_referrals") || "{}");
    data.referred = (data.referred || 0) + 1;
    data.pending = (data.pending || 0) + 1; // friend signed up but hasn't deposited yet
    data.history = data.history || [];
    data.history.unshift({ type: "signup", amount: 0, date: new Date().toLocaleDateString(), note: "Friend signed up (no reward yet)" });
    localStorage.setItem("spinova_referrals", JSON.stringify(data));
    setStats(getReferralStats());
    showToast("Friend signed up! Reward unlocks after their first deposit.");
  }

  function simulateDeposit() {
    const data = JSON.parse(localStorage.getItem("spinova_referrals") || "{}");
    if ((data.pending || 0) === 0) { showToast("No friends awaiting deposit!", "error"); return; }
    data.pending -= 1;
    data.earned = (data.earned || 0) + 10;
    data.history = data.history || [];
    data.history.unshift({ type: "deposit", amount: 10, date: new Date().toLocaleDateString(), note: "Friend made their first deposit" });
    localStorage.setItem("spinova_referrals", JSON.stringify(data));
    setBalance(b => b + 10);
    setStats(getReferralStats());
    showToast("+৳10 referral bonus! 🎉");
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 20, fontFamily: "'Poppins',sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ background: `linear-gradient(135deg,${RED},${ORANGE})`, padding: "16px 18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#fff", padding: 0 }}>‹</button>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Agency</span>
          <div style={{ marginLeft: "auto", fontSize: 22 }}>🏢</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Total Commission", value: "৳" + stats.earned },
            { label: "Friends Referred", value: stats.referred },
            { label: "This Week", value: "৳0" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Invitation code */}
      <div style={{ background: "#fff", margin: "14px 14px 0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid #f5f5f5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔗</div>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>Copy invitation code</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#888", fontWeight: 700 }}>{code}</span>
            <button onClick={copyCode} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>📋</button>
          </div>
        </div>

        {[
          { icon: "📊", label: "Subordinate data", desc: `${stats.referred} friends referred` },
          { icon: "💵", label: "Commission detail", desc: `Total ৳${stats.earned} earned` },
          { icon: "📋", label: "Invitation rules", desc: "৳10 reward once your friend deposits" },
          { icon: "🎯", label: "Promotion data", desc: "View your stats" },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{item.desc}</div>
              </div>
            </div>
            <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>

      {/* Share button */}
      <div style={{ margin: "14px 14px 0" }}>
        <button onClick={() => {
          if (navigator.share) {
            navigator.share({ title: "Join SPINOVA!", text: `Use my code ${code} to join SPINOVA and get a bonus!`, url: window.location.href });
          } else copyCode();
        }} style={{ width: "100%", padding: "14px 0", borderRadius: 28, border: "none", background: `linear-gradient(90deg,${RED},${ORANGE})`, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
          📤 Share Invitation Link
        </button>
      </div>

      {/* History */}
      <div style={{ background: "#fff", margin: "14px 14px 0", borderRadius: 16, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#333", borderLeft: `4px solid ${RED}`, paddingLeft: 10, marginBottom: 14 }}>Commission History</div>
        {stats.history.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", fontSize: 13, padding: "20px 0" }}>No commissions yet. Share your code!</div>
        ) : stats.history.slice(0, 5).map((h, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < Math.min(stats.history.length, 5) - 1 ? "1px solid #f5f5f5" : "none" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{h.note}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{h.date}</div>
            </div>
            <div style={{ color: "#4CAF50", fontWeight: 800, fontSize: 15 }}>+৳{h.amount}</div>
          </div>
        ))}
      </div>

      {/* Dev test */}
      <div style={{ margin: "14px 14px 0", background: "#fff3e0", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 10, fontWeight: 700 }}>🧪 Test buttons (remove before launch)</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={simulateReferral} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: "#FF8C00", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>Simulate Signup (no reward)</button>
          <button onClick={simulateDeposit} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: "#4CAF50", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>Simulate Friend's Deposit (+৳10)</button>
        </div>
      </div>
    </div>
  );
}

// ── VIP Screen ────────────────────────────────────────────────────
function VIPScreen({ onBack }) {
  const totalDeposit = JSON.parse(localStorage.getItem("spinova_deposits") || "{}").total || 0;
  const currentVIP = getVIPLevel(totalDeposit);
  const nextVIP = VIP_LEVELS[VIP_LEVELS.indexOf(currentVIP) + 1] || null;
  const pct = nextVIP ? Math.min(((totalDeposit - currentVIP.min) / (nextVIP.min - currentVIP.min)) * 100, 100) : 100;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 20, fontFamily: "'Poppins',sans-serif" }}>
      <SubHeader title="VIP Club" onBack={onBack} />
      <div style={{ background: currentVIP.bg, margin: 14, borderRadius: 20, padding: "24px 20px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 100, opacity: 0.15 }}>{currentVIP.icon}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>{currentVIP.icon}</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 26 }}>{currentVIP.name} VIP</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Total deposited: ৳{totalDeposit.toLocaleString()}</div>
          </div>
        </div>
        {nextVIP && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
              <span>Progress to {nextVIP.name}</span>
              <span>৳{totalDeposit.toLocaleString()} / ৳{nextVIP.min.toLocaleString()}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, height: 10 }}>
              <div style={{ width: pct + "%", height: "100%", background: "#fff", borderRadius: 8 }} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>৳{(nextVIP.min - totalDeposit).toLocaleString()} more to reach {nextVIP.name}</div>
          </>
        )}
      </div>

      <div style={{ margin: "0 14px", background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "14px 18px", fontWeight: 800, fontSize: 14, color: "#333", borderBottom: "1px solid #f5f5f5" }}>All VIP Levels</div>
        {VIP_LEVELS.map((v, i) => (
          <div key={v.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < VIP_LEVELS.length - 1 ? "1px solid #f5f5f5" : "none", background: v.name === currentVIP.name ? "#fff8f0" : "#fff" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{v.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#333" }}>
                {v.name}
                {v.name === currentVIP.name && <span style={{ fontSize: 9, background: RED, color: "#fff", padding: "2px 7px", borderRadius: 8, marginLeft: 6 }}>CURRENT</span>}
              </div>
              <div style={{ fontSize: 11, color: "#aaa" }}>Min deposit ৳{v.min.toLocaleString()}</div>
            </div>
            <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>{v.rebate} rebate</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Redeem Code Card ──────────────────────────────────────────────
// Real backend call — credits the wallet server-side and refreshes the
// real balance, unlike the referral simulate buttons above which are
// still local/fake.
function RedeemCodeCard({ setBalance }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "success"|"error", text }

  async function redeem() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await apiRedeemPromoCode(trimmed);
      setFeedback({ type: "success", text: result.message });
      setCode("");
      apiGetBalance().then(b => setBalance(b)).catch(() => {});
    } catch (e) {
      setFeedback({ type: "error", text: e.message || "Could not redeem code." });
    }
    setBusy(false);
  }

  return (
    <div style={{ margin: "16px 14px 0" }}>
      <div style={{ fontWeight: 800, fontSize: 14, color: "#333", borderLeft: `4px solid ${RED}`, paddingLeft: 10, marginBottom: 12 }}>Redeem Code</div>
      <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && redeem()}
            placeholder="Enter promo code"
            style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: "#333", outline: "none", boxSizing: "border-box" }}
          />
          <button onClick={redeem} disabled={busy || !code.trim()} style={{
            padding: "0 20px", borderRadius: 10, border: "none",
            background: busy || !code.trim() ? "#eee" : `linear-gradient(135deg,${RED},${ORANGE})`,
            color: busy || !code.trim() ? "#aaa" : "#fff", fontWeight: 700, fontSize: 13,
            cursor: busy || !code.trim() ? "default" : "pointer", fontFamily: "'Poppins',sans-serif", whiteSpace: "nowrap",
          }}>
            {busy ? "..." : "Redeem"}
          </button>
        </div>
        {feedback && (
          <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: feedback.type === "success" ? "#22C55E" : RED }}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PROMOTION SCREEN
// ══════════════════════════════════════════════════════════════════
const PROMOS = [
  { id: 1, title: "Weekend Deposit Bonus", desc: "Deposit ৳1,000 this weekend and get ৳100 bonus!", emoji: "🎉", bg: "linear-gradient(135deg,#E91E63,#F06292)", expires: "Sun 11:59 PM" },
  { id: 2, title: "Slots Cashback", desc: "Play any slot 50 times and get ৳200 cashback!", emoji: "🎰", bg: "linear-gradient(135deg,#7C3AED,#A855F7)", expires: "Limited time" },
  { id: 3, title: "New Member Bonus", desc: "First deposit gets an extra 10% up to ৳500!", emoji: "🎁", bg: "linear-gradient(135deg,#FF8C00,#FF6B00)", expires: "New members only" },
];

export default function PromotionScreen({ user, balance, setBalance, onGoHome, onGoWallet, onGoProfile, onGoActivity }) {
  const [subScreen, setSubScreen] = useState(null);

  if (subScreen === "referral") return <ReferralScreen onBack={() => setSubScreen(null)} user={user} balance={balance} setBalance={setBalance} />;
  if (subScreen === "vip") return <VIPScreen onBack={() => setSubScreen(null)} />;

  const totalDeposit = JSON.parse(localStorage.getItem("spinova_deposits") || "{}").total || 0;
  const currentVIP = getVIPLevel(totalDeposit);
  const referralStats = getReferralStats();
  const myCode = getMyReferralCode(user?.contact);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80, fontFamily: "'Poppins',sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${RED},${ORANGE})`, padding: "20px 18px 24px" }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 4 }}>Promotion</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Referral rewards, VIP & promotions</div>
      </div>

      {/* Promo banners */}
      <div style={{ padding: "16px 14px 0" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#333", borderLeft: `4px solid ${RED}`, paddingLeft: 10, marginBottom: 12 }}>Current Promotions</div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {PROMOS.map(p => (
            <div key={p.id} style={{ background: p.bg, borderRadius: 16, padding: "16px 14px", minWidth: 220, flexShrink: 0, color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -10, right: -10, fontSize: 55, opacity: 0.15 }}>{p.emoji}</div>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{p.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 11, opacity: 0.85, lineHeight: 1.5, marginBottom: 8 }}>{p.desc}</div>
              <div style={{ fontSize: 9, background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: 8, display: "inline-block" }}>⏰ {p.expires}</div>
            </div>
          ))}
        </div>
      </div>

      <RedeemCodeCard setBalance={setBalance} />

      {/* Agency / Referral card */}
      <div style={{ margin: "16px 14px 0" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#333", borderLeft: `4px solid ${RED}`, paddingLeft: 10, marginBottom: 12 }}>Referral Program</div>
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* top bar */}
          <div style={{ background: `linear-gradient(135deg,${RED},${ORANGE})`, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>🏢 Agency</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>{referralStats.referred}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10 }}>Referred</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>৳{referralStats.earned}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10 }}>Earned</div>
              </div>
            </div>
          </div>

          {/* Copy code row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔗</div>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>Copy invitation code</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 700 }}>{myCode}</span>
              <button onClick={() => navigator.clipboard.writeText(myCode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>📋</button>
            </div>
          </div>

          {/* Menu items */}
          {[
            { icon: "📊", label: "Subordinate data" },
            { icon: "💵", label: "Commission detail" },
            { icon: "📋", label: "Invitation rules" },
            { icon: "🎯", label: "Promotion data" },
          ].map((item, i) => (
            <div key={item.label} onClick={() => setSubScreen("referral")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < 3 ? "1px solid #f5f5f5" : "none", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</div>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>{item.label}</span>
              </div>
              <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      </div>

      {/* VIP card */}
      <div style={{ margin: "14px 14px 0" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#333", borderLeft: `4px solid ${RED}`, paddingLeft: 10, marginBottom: 12 }}>VIP Club</div>
        <div onClick={() => setSubScreen("vip")} style={{ background: currentVIP.bg, borderRadius: 16, padding: "18px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "transform 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 80, opacity: 0.1 }}>{currentVIP.icon}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 34 }}>{currentVIP.icon}</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>{currentVIP.name} VIP</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{currentVIP.rebate} rebate · Tap to view all levels</div>
              </div>
            </div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>›</span>
          </div>
        </div>
      </div>

      <BottomNav
        activeNav="promo"
        setActiveNav={() => {}}
        onGoHome={onGoHome}
        onGoWallet={onGoWallet}
        onGoProfile={onGoProfile}
        onGoActivity={onGoActivity}
        onGoPromo={() => {}}
      />
    </div>
  );
}
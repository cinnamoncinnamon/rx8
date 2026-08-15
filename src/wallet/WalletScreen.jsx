import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import SubHeader from "../components/SubHeader";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "../utils/rateLimiter";
import { recordDeposit } from "../utils/activityStore";
import { apiSubmitWithdrawalRequest, apiGetBalance } from "../api";
import DepositScreen from "./DepositScreen";

// ── Design tokens for this screen ────────────────────────────────────────────
// Deposit keeps the app's red brand gradient. Withdraw gets its own graphite/
// ink register with the blue already used for "Main wallet" elsewhere in this
// screen — money leaving the account reads calmer and more deliberate than
// reusing the same red as the "First Deposit Bonus" banner.
const CARD_SHADOW = "0 1px 2px rgba(16,24,40,0.04), 0 12px 28px -14px rgba(16,24,40,0.16)";
const CARD_BORDER = "1px solid rgba(16,24,40,0.05)";
const WITHDRAW_GRADIENT = "linear-gradient(135deg,#1B1B2F,#2C2C46)";
const WITHDRAW_ACCENT = "#3B82F6";

// ── Icon set (replaces emoji) ────────────────────────────────────────────────
function Icon({ children, size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const IconDeposit  = (p) => <Icon {...p}><path d="M12 4v11" /><path d="M8 11l4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></Icon>;
const IconWithdraw = (p) => <Icon {...p}><path d="M12 20V9" /><path d="M8 13l4-4 4 4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></Icon>;
const IconHistory  = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></Icon>;
const IconWallet   = (p) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1.2" fill={p.color || "currentColor"} stroke="none" /></Icon>;
const IconGift     = (p) => <Icon {...p}><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M4 13h16" /><path d="M12 9v11" /><path d="M12 9c-1.4-3-6-3.4-6-.6C6 9.6 8 9.6 12 9Z" /><path d="M12 9c1.4-3 6-3.4 6-.6C18 9.6 16 9.6 12 9Z" /></Icon>;

// ── Method badge (used by both deposit + withdraw so the two flows read as one system) ──
function MethodBadge({ label, color, bg, size = 42 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, border: `1.5px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.36, fontWeight: 900, color, fontFamily: "sans-serif", letterSpacing: -0.5 }}>{label}</span>
    </div>
  );
}

// ── Balance figure — tabular Orbitron numerals, matches the app's digital-display idiom ──
function BalanceFigure({ value, size = 30, color = "#fff" }) {
  const [whole, dec] = value.toFixed(2).split(".");
  return (
    <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, color, letterSpacing: 0.5, fontVariantNumeric: "tabular-nums" }}>
      <span style={{ fontSize: size }}>৳{Number(whole).toLocaleString()}</span>
      <span style={{ fontSize: size * 0.55, opacity: 0.75 }}>.{dec}</span>
    </span>
  );
}

// ── Donut chart ──────────────────────────────────────────────────────────────
function Donut({ pct, color, size = 90 }) {
  const r = 36, cx = 45, cy = 45;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 90 90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={9} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill={color}>{pct}%</text>
    </svg>
  );
}

// ── Withdraw Screen ──────────────────────────────────────────────────────────
function WithdrawScreen({ balance, setBalance, accounts, onBack }) {
  const [method, setMethod] = useState("bkash");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [err, setErr] = useState("");
  const withdrawable = Math.max(0, balance);
  const presets = [100, 200, 500, 1000, 2000, 5000];

  const methods = [
    { id: "bkash",   apiMethod: "bkash",        label: "bKash",   badge: "B", color: "#D81B60", bg: "#FFF0F7", name: "bKash" },
    { id: "nagad",   apiMethod: "nagad",        label: "Nagad",   badge: "N", color: "#E8501A", bg: "#FFF3EF", name: "Nagad" },
    { id: "binance",  apiMethod: "binance_usdt", label: "Binance",  badge: "₿", color: "#B7950B", bg: "#FFFDE7", name: "Binance Pay" },
  ];

  // The bKash/Nagad destination defaults to the account on file; Binance has
  // no account on file, so the user has to type it in. Both stay editable —
  // the money should go wherever the user actually wants it sent.
  React.useEffect(() => {
    setDestination(method === "bkash" || method === "nagad" ? (accounts?.main || "") : "");
  }, [method]);

  const doWithdraw = async () => {
    const a = parseFloat(amount);
    if (!a || a <= 0 || a > withdrawable) return;
    if (!destination.trim()) { setErr("Enter the account to send the withdrawal to."); return; }
    const check = checkRateLimit("withdraw");
    if (!check.allowed) { setErr(check.message); return; }

    setLoading(true);
    setErr("");
    try {
      await apiSubmitWithdrawalRequest({ method: active.apiMethod, account_details: destination.trim(), amount: a });
      clearRateLimit("withdraw");
      apiGetBalance().then(b => setBalance(b)).catch(() => {});
      setDone(`Withdrawal request for ৳${a.toFixed(2)} submitted. Admin will review and send your payout shortly.`);
      setAmount("");
      setTimeout(() => setDone(""), 5000);
    } catch (e) {
      setErr(e.message || "Withdrawal request failed.");
    }
    setLoading(false);
  };

  const active = methods.find(m => m.id === method);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 30 }}>
      {/* Header — deliberately not the same red as Deposit/promo banners */}
      <div style={{ background: WITHDRAW_GRADIENT }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={onBack} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>Withdraw</span>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            <IconHistory size={14} color="rgba(255,255,255,0.55)" /> History
          </button>
        </div>
        {/* Balance card */}
        <div style={{ margin: "0 14px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <IconWallet size={15} color="rgba(255,255,255,0.55)" />
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>AVAILABLE TO WITHDRAW</span>
          </div>
          <BalanceFigure value={balance} size={28} />
        </div>
      </div>

      <div style={{ padding: "14px" }}>
        {/* Method tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {methods.map(m => {
            const isActive = method === m.id;
            return (
              <div key={m.id} onClick={() => setMethod(m.id)} style={{
                flex: 1, background: isActive ? "#fff" : "transparent",
                border: isActive ? `1.5px solid ${WITHDRAW_ACCENT}` : "1.5px solid #e4e4ea",
                borderRadius: 14, padding: "12px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                boxShadow: isActive ? "0 4px 14px rgba(59,130,246,0.14)" : "none", transition: "all 0.15s",
              }}>
                <MethodBadge label={m.badge} color={m.color} bg={m.bg} size={34} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? G.text : "#888" }}>{m.label}</span>
              </div>
            );
          })}
        </div>

        {/* Destination account */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", marginBottom: 14, boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <MethodBadge label={active.badge} color={active.color} bg={active.bg} size={40} />
            <div style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{active.name}</div>
          </div>
          <div style={{ fontSize: 11, color: G.sub, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {method === "bkash" || method === "nagad" ? "Send to this number" : "Your Binance Pay ID or USDT address"}
          </div>
          <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
            placeholder={method === "bkash" || method === "nagad" ? "01XXXXXXXXX" : "Binance Pay ID / TRC20 address"}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #eee", fontSize: 13, fontFamily: method === "bkash" || method === "nagad" ? "'Poppins',sans-serif" : "monospace", color: G.text, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Amount input */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", boxShadow: CARD_SHADOW, border: CARD_BORDER, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: WITHDRAW_ACCENT + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: WITHDRAW_ACCENT }}>৳</div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 22, fontWeight: 700, fontFamily: "'Poppins',sans-serif", color: G.text, background: "transparent" }} />
          </div>
          <div style={{ height: 1, background: "#f0f0f0", marginBottom: 12 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: WITHDRAW_ACCENT, fontWeight: 600 }}>Withdrawable ৳{withdrawable.toFixed(2)}</span>
            <button onClick={() => setAmount(withdrawable.toString())} style={{ background: "none", border: `1px solid ${WITHDRAW_ACCENT}`, color: WITHDRAW_ACCENT, borderRadius: 14, padding: "2px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>All</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
            {presets.map(p => (
              <button key={p} onClick={() => setAmount(p.toString())} style={{
                padding: "8px 0", borderRadius: 9, border: `1.5px solid ${amount == p ? WITHDRAW_ACCENT : "#e0e0e0"}`,
                background: amount == p ? WITHDRAW_ACCENT : "#fff", color: amount == p ? "#fff" : "#555",
                fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif",
              }}>৳{p}</button>
            ))}
          </div>
        </div>

        {err && <div style={{ background: "#FFF0F0", border: "1px solid #FFD9D9", borderRadius: 10, padding: 12, marginBottom: 12, color: "#C62828", fontWeight: 600, fontSize: 13 }}>{err}</div>}
        {done && <div style={{ background: "#EEF4FF", border: "1px solid #DCE7FF", borderRadius: 10, padding: 12, marginBottom: 12, color: "#2952CC", fontWeight: 600, fontSize: 13 }}>{done}</div>}

        <button onClick={doWithdraw} disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > withdrawable} style={{
          width: "100%", padding: "15px 0", borderRadius: 14, border: "none",
          background: !loading && amount && parseFloat(amount) > 0 && parseFloat(amount) <= withdrawable ? WITHDRAW_GRADIENT : "#e0e0e0",
          color: !loading && amount && parseFloat(amount) > 0 && parseFloat(amount) <= withdrawable ? "#fff" : "#aaa",
          fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Poppins',sans-serif",
          boxShadow: !loading && amount && parseFloat(amount) > 0 && parseFloat(amount) <= withdrawable ? "0 8px 20px -6px rgba(27,27,47,0.45)" : "none",
        }}>{loading ? "Submitting..." : "Withdraw"}</button>
      </div>
    </div>
  );
}

// ── Main Wallet Screen ────────────────────────────────────────────────────────
export default function WalletScreen({ balance, setBalance, accounts, onBack, activeNav, setActiveNav }) {
  const [subScreen, setSubScreen] = useState(null);

  if (subScreen === "deposit")  return <DepositScreen  balance={balance} setBalance={setBalance} onBack={() => setSubScreen(null)} />;
  if (subScreen === "withdraw") return <WithdrawScreen balance={balance} setBalance={setBalance} accounts={accounts} onBack={() => setSubScreen(null)} />;

  const actionBtn = (Icon, label, action, color) => (
    <div key={label} onClick={action} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: color + "14", border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={color} />
      </div>
      <span style={{ fontSize: 12, color: G.text, fontWeight: 600, textAlign: "center" }}>{label}</span>
    </div>
  );

  const historyLink = (Icon2, label, action) => (
    <div key={label} onClick={action} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
      <Icon2 size={14} color={G.sub} />
      <span style={{ fontSize: 12, color: G.sub, fontWeight: 600 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 30 }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background: gradient, padding: "0 0 30px" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={onBack} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.18)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>Wallet</span>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", letterSpacing: 1, marginBottom: 8 }}>MAIN WALLET BALANCE</div>
          <BalanceFigure value={balance} size={34} />
        </div>
      </div>

      <div style={{ padding: "0 14px" }}>
        {/* Wallet card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "22px 20px", marginTop: -16, boxShadow: CARD_SHADOW, border: CARD_BORDER, position: "relative", zIndex: 5, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {actionBtn(IconDeposit,  "Deposit",  () => setSubScreen("deposit"),  G.red)}
            {actionBtn(IconWithdraw, "Withdraw", () => setSubScreen("withdraw"), G.blue)}
          </div>
          <div style={{ height: 1, background: "#f0f0f0", marginBottom: 16 }} />
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {historyLink(IconHistory, "Deposit history", () => {})}
            {historyLink(IconHistory, "Withdrawal history", () => {})}
          </div>
        </div>

        {/* Promo banner */}
        <div style={{ background: "linear-gradient(135deg,#1A1A2E,#3B1F6B)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 22px -10px rgba(59,31,107,0.55)", marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,224,130,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconGift size={22} color="#FFE082" />
          </div>
          <div>
            <div style={{ color: "#FFE082", fontWeight: 800, fontSize: 14 }}>First Deposit Bonus</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 3 }}>Deposit now and get 100% bonus up to ৳10,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}

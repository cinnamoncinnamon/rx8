import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import SubHeader from "../components/SubHeader";

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

// ── Deposit Screen ───────────────────────────────────────────────────────────
function DepositScreen({ balance, setBalance, onBack }) {
  const [method, setMethod] = useState("nagad");
  const [channel, setChannel] = useState(0);
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState("");

  const methods = [
    { id: "nagad",   label: "Nagad",   emoji: "🔥", color: "#e8501a" },
    { id: "bkash",   label: "bKash",   emoji: "💳", color: "#d01f8c" },
    { id: "binance", label: "Binance", emoji: "🟡", color: "#F0B90B" },
  ];

  const channels = {
    nagad:   [{ name: "NagadPay-Direct", range: "৳50 - ৳50K" }, { name: "NagadPay-Agent", range: "৳50 - ৳20K" }],
    bkash:   [{ name: "bKash-Personal", range: "৳50 - ৳50K" }, { name: "bKash-Merchant", range: "৳100 - ৳30K" }],
    binance: [{ name: "Binance Pay", range: "৳500 - ৳100K" }, { name: "Binance USDT (TRC20)", range: "৳500 - ৳500K" }],
  };

  const presets = [100, 200, 500, 1000, 2000, 5000];

  const doDeposit = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    setBalance(b => b + a);
    setDone(`✅ Deposited ৳${a.toFixed(2)} successfully!`);
    setAmount("");
    setTimeout(() => setDone(""), 3000);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 30 }}>
      {/* Header */}
      <div style={{ background: gradient, padding: "0 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 8, padding: "4px 10px", lineHeight: 1 }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>Deposit</span>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>Deposit history</button>
        </div>
        {/* Balance card */}
        <div style={{ margin: "0 14px 16px", background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>💼</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>Balance</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>৳{balance.toFixed(2)}</div>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: 4 }}>**** **** **** ****</div>
        </div>
      </div>

      <div style={{ padding: "14px" }}>
        {/* Method tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {methods.map((m, i) => {
            const active = method === m.id;
            return (
              <div key={m.id} onClick={() => { setMethod(m.id); setChannel(0); }} style={{
                flex: 1, background: active ? "#fff" : "transparent", border: active ? `2px solid ${m.color}` : "2px solid #e0e0e0",
                borderRadius: 14, padding: "10px 4px", cursor: "pointer", textAlign: "center",
                boxShadow: active ? `0 2px 10px ${m.color}33` : "none", transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{m.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? m.color : "#888" }}>{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* Channel select */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 8px #0001" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📡</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: G.text }}>Select channel</span>
          </div>
          {channels[method].map((ch, i) => (
            <div key={i} onClick={() => setChannel(i)} style={{
              background: channel === i ? gradient : "#f8f8f8",
              borderRadius: 12, padding: "14px 16px", marginBottom: 8, cursor: "pointer",
              border: channel === i ? "none" : "1.5px solid #eee",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: channel === i ? "rgba(255,255,255,0.2)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {method === "nagad" ? "🔥" : method === "bkash" ? "💳" : "🟡"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: channel === i ? "#fff" : G.text }}>{ch.name}</div>
                <div style={{ fontSize: 12, color: channel === i ? "rgba(255,255,255,0.75)" : G.sub, marginTop: 2 }}>Balance: {ch.range}</div>
              </div>
              {channel === i && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>✓</div>}
            </div>
          ))}
        </div>

        {/* Amount */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px #0001", marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: G.sub, fontWeight: 600, marginBottom: 10 }}>Deposit Amount (৳)</div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount..."
            style={{ width: "100%", padding: "13px 14px", borderRadius: 11, border: "1.5px solid #eee", fontSize: 16, fontFamily: "'Poppins',sans-serif", color: G.text, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {presets.map(p => (
              <button key={p} onClick={() => setAmount(p.toString())} style={{
                padding: "9px 0", borderRadius: 9, border: `1.5px solid ${amount == p ? "#EF5350" : "#e0e0e0"}`,
                background: amount == p ? "#EF5350" : "#fff", color: amount == p ? "#fff" : "#555",
                fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif",
              }}>৳{p}</button>
            ))}
          </div>
        </div>

        {done && <div style={{ background: "#E8F5E9", borderRadius: 10, padding: 12, marginBottom: 12, color: "#2E7D32", fontWeight: 600, fontSize: 13 }}>{done}</div>}

        {/* Bottom bar */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 2px 8px #0001", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: G.sub }}>Recharge Method:</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: G.text }}>{channels[method][channel].name}</div>
          </div>
          <button onClick={doDeposit} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: gradient, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 4px 16px #EF535044" }}>Deposit</button>
        </div>
      </div>
    </div>
  );
}

// ── Withdraw Screen ──────────────────────────────────────────────────────────
function WithdrawScreen({ balance, setBalance, accounts, onBack }) {
  const [method, setMethod] = useState("ewallet");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState("");
  const withdrawable = Math.max(0, balance);
  const presets = [100, 200, 500, 1000, 2000, 5000];

  const methods = [
    { id: "ewallet", label: "E-Wallet", emoji: "💼", color: "#EF5350" },
    { id: "binance", label: "Binance",  emoji: "🟡", color: "#F0B90B" },
  ];

  const doWithdraw = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0 || a > withdrawable) return;
    setBalance(b => b - a);
    setDone(`✅ Withdrawal of ৳${a.toFixed(2)} requested!`);
    setAmount("");
    setTimeout(() => setDone(""), 3000);
  };

  const maskedAccount = accounts?.main
    ? accounts.main.slice(0, 3) + "****" + accounts.main.slice(-3)
    : "013****522";

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 30 }}>
      {/* Header */}
      <div style={{ background: gradient, padding: "0 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 8, padding: "4px 10px", lineHeight: 1 }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>Withdraw</span>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>Withdrawal history</button>
        </div>
        {/* Balance card */}
        <div style={{ margin: "0 14px 16px", background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>💼</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>Available balance</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>৳{balance.toFixed(2)}</div>
            <span style={{ fontSize: 18 }}>🔄</span>
          </div>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: 4 }}>**** **** **** ****</div>
        </div>
      </div>

      <div style={{ padding: "14px" }}>
        {/* Method tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {methods.map(m => {
            const active = method === m.id;
            return (
              <div key={m.id} onClick={() => setMethod(m.id)} style={{
                flex: 1, background: active ? "#fff" : "transparent",
                border: active ? `2px solid ${m.color}` : "2px solid #e0e0e0",
                borderRadius: 14, padding: "12px 8px", cursor: "pointer", textAlign: "center",
                boxShadow: active ? `0 2px 10px ${m.color}33` : "none", transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{m.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? m.color : "#888" }}>{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* Account */}
        {method === "ewallet" && (
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 8px #0001", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💳</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: G.text }}>BKASH</div>
                <div style={{ fontSize: 12, color: G.sub, marginTop: 2 }}>{maskedAccount}</div>
              </div>
            </div>
            <span style={{ color: "#ccc", fontSize: 20 }}>›</span>
          </div>
        )}
        {method === "binance" && (
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 8px #0001", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF8E1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🟡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: G.text }}>Binance Pay</div>
              <div style={{ fontSize: 12, color: G.sub, marginTop: 2 }}>Link your Binance account</div>
            </div>
          </div>
        )}

        {/* Amount input */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px #0001", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>৳</div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 22, fontWeight: 700, fontFamily: "'Poppins',sans-serif", color: G.text, background: "transparent" }} />
          </div>
          <div style={{ height: 1, background: "#f0f0f0", marginBottom: 12 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#EF5350", fontWeight: 600 }}>Withdrawable balance ৳{withdrawable.toFixed(2)}</span>
            <button onClick={() => setAmount(withdrawable.toString())} style={{ background: "none", border: "1px solid #EF5350", color: "#EF5350", borderRadius: 14, padding: "2px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>All</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: G.sub }}>
            <span>Withdrawal amount received</span>
            <span style={{ color: "#EF5350", fontWeight: 600 }}>৳{amount ? (parseFloat(amount) || 0).toFixed(2) : "0.00"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
            {presets.map(p => (
              <button key={p} onClick={() => setAmount(p.toString())} style={{
                padding: "8px 0", borderRadius: 9, border: `1.5px solid ${amount == p ? "#EF5350" : "#e0e0e0"}`,
                background: amount == p ? "#EF5350" : "#fff", color: amount == p ? "#fff" : "#555",
                fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif",
              }}>৳{p}</button>
            ))}
          </div>
        </div>

        {done && <div style={{ background: "#E8F5E9", borderRadius: 10, padding: 12, marginBottom: 12, color: "#2E7D32", fontWeight: 600, fontSize: 13 }}>{done}</div>}

        <button onClick={doWithdraw} style={{
          width: "100%", padding: "15px 0", borderRadius: 12, border: "none",
          background: amount && parseFloat(amount) > 0 && parseFloat(amount) <= withdrawable ? gradient : "#e0e0e0",
          color: amount && parseFloat(amount) > 0 && parseFloat(amount) <= withdrawable ? "#fff" : "#aaa",
          fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 4px 16px #EF535022",
        }}>Withdraw</button>
      </div>
    </div>
  );
}

// ── Main Wallet Screen ────────────────────────────────────────────────────────
export default function WalletScreen({ balance, setBalance, accounts, onBack, activeNav, setActiveNav }) {
  const [subScreen, setSubScreen] = useState(null);

  if (subScreen === "deposit")  return <DepositScreen  balance={balance} setBalance={setBalance} accounts={accounts} onBack={() => setSubScreen(null)} />;
  if (subScreen === "withdraw") return <WithdrawScreen balance={balance} setBalance={setBalance} accounts={accounts} onBack={() => setSubScreen(null)} />;

  const totalDeposit = 3800;
  const mainPct = 100;
  const thirdPct = 0;

  const iconBtn = (emoji, label, action) => (
    <div key={label} onClick={action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "#FFF0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{emoji}</div>
      <span style={{ fontSize: 11, color: G.sub, fontWeight: 600, textAlign: "center" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 30 }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background: gradient, padding: "0 0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 8, padding: "4px 10px", lineHeight: 1 }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>Wallet</span>
          <div style={{ width: 40 }} />
        </div>

        {/* Total balance row */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", letterSpacing: 1, marginBottom: 6 }}>Total balance</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{(balance + 0).toFixed(0)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>Total amount</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{totalDeposit}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>Total deposit amount</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 14px" }}>
        {/* Wallet card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px", marginTop: -14, boxShadow: "0 4px 24px #0001", position: "relative", zIndex: 5, marginBottom: 14 }}>

          {/* Donut charts */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <Donut pct={mainPct} color="#EF5350" />
              <div style={{ fontSize: 15, fontWeight: 800, color: G.text, marginTop: 6 }}>৳{balance.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: G.sub, marginTop: 2 }}>Main wallet</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Donut pct={thirdPct} color="#e0e0e0" />
              <div style={{ fontSize: 15, fontWeight: 800, color: G.text, marginTop: 6 }}>৳0.00</div>
              <div style={{ fontSize: 11, color: G.sub, marginTop: 2 }}>3rd party wallet</div>
            </div>
          </div>

          {/* Transfer button */}
          <button style={{ width: "100%", padding: "13px 0", borderRadius: 24, border: "none", background: gradient, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 4px 16px #EF535033", marginBottom: 20 }}>
            Main wallet transfer
          </button>

          {/* Icon buttons */}
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {iconBtn("📥", "Deposit",            () => setSubScreen("deposit"))}
            {iconBtn("📤", "Withdraw",           () => setSubScreen("withdraw"))}
            {iconBtn("🧾", "Deposit\nhistory",   () => {})}
            {iconBtn("📋", "Withdrawal\nhistory",() => {})}
          </div>
        </div>

        {/* Promo banner */}
        <div style={{ background: "linear-gradient(135deg,#1A1A2E,#3B1F6B)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 16px #0002", marginBottom: 14 }}>
          <span style={{ fontSize: 32 }}>🎁</span>
          <div>
            <div style={{ color: "#FFE082", fontWeight: 800, fontSize: 14 }}>First Deposit Bonus</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 3 }}>Deposit now and get 100% bonus up to ৳10,000</div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Total Deposited", value: `৳${totalDeposit}`, icon: "📥", col: "#22C55E" },
            { label: "Total Withdrawn", value: "৳0.00",             icon: "📤", col: "#EF5350" },
            { label: "Main Wallet",     value: `৳${balance.toFixed(2)}`, icon: "💼", col: "#3B82F6" },
            { label: "Bonus Wallet",    value: "৳0.00",             icon: "🎁", col: "#F97316" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "14px", boxShadow: "0 2px 8px #0001", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: s.col + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: G.sub, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: s.col, marginTop: 2 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
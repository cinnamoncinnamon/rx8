import React, { useState, useEffect } from "react";
import { G, gradient } from "../constants";
import { apiGetDepositMethods, apiSubmitDepositRequest, apiGetBalance } from "../api";

const METHOD_CONFIG = {
  bkash:        { label: "bKash",        color: "#D81B60", bg: "#FFF0F7", logo: "B" },
  nagad:        { label: "Nagad",         color: "#E8501A", bg: "#FFF3EF", logo: "N" },
  binance_pay:  { label: "Binance Pay",   color: "#B7950B", bg: "#FFFDE7", logo: "BP" },
  binance_usdt: { label: "USDT TRC20",    color: "#B7950B", bg: "#FFFDE7", logo: "₮" },
};

function LogoBadge({ method, size = 42 }) {
  const cfg = METHOD_CONFIG[method] || { color: "#888", bg: "#f5f5f5", logo: "?" };
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: cfg.bg, border: `1.5px solid ${cfg.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.38, fontWeight: 900, color: cfg.color, fontFamily: "sans-serif", letterSpacing: -0.5 }}>{cfg.logo}</span>
    </div>
  );
}

export default function DepositScreen({ balance, setBalance, onBack }) {
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [step, setStep] = useState("select"); // select | submit | done
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const presets = [200, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    apiGetDepositMethods()
      .then(m => { setMethods(m); if (m.length > 0) setSelected(m[0]); })
      .catch(() => setErr("Could not load deposit methods."))
      .finally(() => setFetching(false));
  }, []);

  function handleCopy() {
    if (!selected) return;
    navigator.clipboard.writeText(selected.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitDeposit() {
    if (!amount || parseFloat(amount) <= 0) { setErr("Enter a valid amount."); return; }
    if (!txnId.trim()) { setErr("Enter your transaction ID."); return; }
    setLoading(true);
    setErr("");
    try {
      await apiSubmitDepositRequest({
        deposit_method_id: selected.id,
        amount: parseFloat(amount),
        transaction_id: txnId.trim(),
      });
      apiGetBalance().then(b => setBalance(b)).catch(() => {});
      setStep("done");
    } catch (e) {
      setErr(e.message || "Submission failed.");
    }
    setLoading(false);
  }

  const cfg = selected ? (METHOD_CONFIG[selected.method] || { label: selected.method, color: "#888", bg: "#f5f5f5" }) : null;
  const isCrypto = selected?.method === "binance_pay" || selected?.method === "binance_usdt";

  // Group methods by type for display
  const grouped = methods.reduce((acc, m) => {
    const type = m.method.includes("binance") ? "Crypto" : m.method === "bkash" ? "bKash" : "Nagad";
    if (!acc[type]) acc[type] = [];
    acc[type].push(m);
    return acc;
  }, {});

  if (step === "done") return (
    <div style={{ minHeight: "100vh", background: "#F4F4F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins',sans-serif", padding: 24 }}>
      <div style={{ width: 72, height: 72, borderRadius: 24, background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 8 }}>Request Submitted</div>
      <div style={{ fontSize: 14, color: G.sub, textAlign: "center", lineHeight: 1.6, marginBottom: 32, maxWidth: 280 }}>
        Your deposit of <strong>৳{parseFloat(amount).toLocaleString()}</strong> is under review. Your wallet will be credited once confirmed.
      </div>
      <button onClick={onBack} style={{ padding: "14px 48px", borderRadius: 14, border: "none", background: gradient, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
        Back to Wallet
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: gradient }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>Deposit</span>
          <div style={{ width: 36 }} />
        </div>
        <div style={{ margin: "0 16px 18px", background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4, fontWeight: 500 }}>Available Balance</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>৳{Number(balance).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {fetching ? (
          <div style={{ textAlign: "center", padding: 40, color: G.sub, fontSize: 14 }}>Loading...</div>
        ) : methods.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#EF5350", fontSize: 14 }}>No deposit methods available. Contact support.</div>
        ) : (
          <>
            {/* Method selection */}
            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", marginBottom: 14, boxShadow: "0 1px 4px #0001" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>Select Payment Method</div>
              </div>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div style={{ padding: "8px 16px 4px", fontSize: 11, color: G.sub, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{group}</div>
                  {items.map(m => {
                    const mc = METHOD_CONFIG[m.method] || { label: m.method, color: "#888", bg: "#f5f5f5" };
                    const active = selected?.id === m.id;
                    return (
                      <div key={m.id} onClick={() => setSelected(m)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: active ? mc.color + "08" : "#fff", borderLeft: `3px solid ${active ? mc.color : "transparent"}`, transition: "all 0.15s" }}>
                        <LogoBadge method={m.method} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: active ? mc.color : G.text }}>{m.label}</div>
                          <div style={{ fontSize: 11, color: G.sub, marginTop: 2 }}>
                            Min ৳{Number(m.min_amount).toLocaleString()} · Max ৳{Number(m.max_amount).toLocaleString()}
                            {m.note ? ` · ${m.note}` : ""}
                          </div>
                        </div>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? mc.color : "#ddd"}`, background: active ? mc.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Account number to send to */}
            {selected && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 14, boxShadow: "0 1px 4px #0001" }}>
                <div style={{ fontSize: 12, color: G.sub, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {isCrypto ? "Send to this wallet address" : `Send via ${cfg?.label} to this number`}
                </div>
                <div style={{ background: cfg?.bg || "#f9f9f9", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <LogoBadge method={selected.method} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: isCrypto ? 11 : 18, fontWeight: 800, color: cfg?.color, fontFamily: isCrypto ? "monospace" : "inherit", wordBreak: "break-all", lineHeight: 1.3 }}>
                      {selected.account_number}
                    </div>
                    {selected.note && !isCrypto && (
                      <div style={{ fontSize: 11, color: G.sub, marginTop: 3 }}>{selected.note}</div>
                    )}
                  </div>
                  <button onClick={handleCopy} style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${cfg?.color}`, background: copied ? cfg?.color : "transparent", color: copied ? "#fff" : cfg?.color, fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0, fontFamily: "'Poppins',sans-serif", transition: "all 0.2s" }}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {/* Amount */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 14, boxShadow: "0 1px 4px #0001" }}>
              <div style={{ fontSize: 12, color: G.sub, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Amount (৳)</div>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 20, fontWeight: 700, fontFamily: "'Poppins',sans-serif", color: G.text, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {presets.map(p => (
                  <button key={p} onClick={() => setAmount(p.toString())}
                    style={{ padding: "9px 0", borderRadius: 9, border: `1.5px solid ${amount == p ? "#EF5350" : "#e8e8e8"}`, background: amount == p ? "#EF5350" : "#fafafa", color: amount == p ? "#fff" : "#555", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all 0.15s" }}>
                    ৳{p.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction ID */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 14, boxShadow: "0 1px 4px #0001" }}>
              <div style={{ fontSize: 12, color: G.sub, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {isCrypto ? "Transaction Hash" : "Transaction ID"}
              </div>
              <input type="text" value={txnId} onChange={e => setTxnId(e.target.value)}
                placeholder={isCrypto ? "Paste TxID from your wallet" : "TrxID from confirmation SMS"}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 14, fontFamily: isCrypto ? "monospace" : "'Poppins',sans-serif", color: G.text, outline: "none", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: G.sub, marginTop: 6 }}>
                {isCrypto ? "Find the TxID in your crypto wallet transaction history after sending." : "The TrxID is in the SMS confirmation you receive after sending money."}
              </div>
            </div>

            {err && <div style={{ background: "#FFF0F0", borderRadius: 10, padding: "12px 14px", marginBottom: 12, color: "#C62828", fontWeight: 600, fontSize: 13 }}>{err}</div>}

            <button onClick={submitDeposit} disabled={loading || !amount || !txnId}
              style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: loading || !amount || !txnId ? "#e0e0e0" : gradient, color: loading || !amount || !txnId ? "#aaa" : "#fff", fontWeight: 700, fontSize: 16, cursor: loading || !amount || !txnId ? "not-allowed" : "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: loading || !amount || !txnId ? "none" : "0 4px 16px #EF535033" }}>
              {loading ? "Submitting..." : "Submit Deposit Request"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

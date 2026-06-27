import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";

export default function RegisterScreen({ onRegister, onBack }) {
  const [method, setMethod] = useState("mobile");
  const [input, setInput] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!input || !pass || !confirm) { setErr("Fill all fields."); return; }
    if (pass !== confirm) { setErr("Passwords don't match."); return; }
    setLoading(true);
    setTimeout(() => onRegister({ contact: input, method }), 1200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 72%)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Poppins',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ paddingTop: 55, paddingBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>
          <span style={{ fontStyle: "italic", color: "#FFE082" }}>S</span>PINOVA
        </div>
      </div>

      <div style={{ width: "92%", maxWidth: 400, background: "#fff", borderRadius: 24, padding: "28px 24px 32px", boxShadow: "0 20px 60px #EF535044" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: G.text, marginBottom: 4 }}>Join SPINOVA 🎮</div>
        <div style={{ color: G.sub, fontSize: 13, marginBottom: 20 }}>Start winning today</div>

        {/* Method toggle */}
        <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 12, marginBottom: 20, padding: 4, gap: 4 }}>
          {["mobile", "gmail"].map((m) => (
            <button key={m} onClick={() => { setMethod(m); setInput(""); setErr(""); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: method === m ? "#EF5350" : "transparent", color: method === m ? "#fff" : "#888", transition: "all .2s" }}>
              {m === "mobile" ? "📱 Mobile" : "📧 Gmail"}
            </button>
          ))}
        </div>

        {/* Fields */}
        {[
          { label: method === "mobile" ? "Mobile Number" : "Gmail", val: input, set: setInput, ph: method === "mobile" ? "+880 XXXXXXXXXX" : "you@gmail.com", type: "text" },
          { label: "Password", val: pass, set: setPass, ph: "••••••••", type: "password" },
          { label: "Confirm Password", val: confirm, set: setConfirm, ph: "••••••••", type: "password" },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>{f.label}</div>
            <input type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E" }} />
          </div>
        ))}

        {err && <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8 }}>{err}</div>}

        <button onClick={submit}
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", marginTop: 4, background: loading ? "#ccc" : gradient, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px #EF535044", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? (
            <><div style={{ width: 18, height: 18, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />Creating...</>
          ) : "Create Account →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: G.sub }}>
          Already have an account?{" "}
          <span onClick={onBack} style={{ color: G.red, fontWeight: 700, cursor: "pointer" }}>Login</span>
        </div>
      </div>
    </div>
  );
}
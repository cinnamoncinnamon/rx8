import React, { useState, useEffect } from "react";
import { G, CSS, gradient } from "../constants";
import { checkRateLimit, recordFailedAttempt, clearRateLimit, remainingAttempts } from "../utils/rateLimiter";
import { validateLoginInput } from "../utils/sanitize";

export default function LoginScreen({ onLogin, onGotoRegister }) {
  const [method, setMethod] = useState("mobile");
  const [input, setInput] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 80);
    // Show lockout message on mount if already rate-limited
    const check = checkRateLimit("login");
    if (!check.allowed) setErr(check.message);
  }, []);

  const submit = () => {
    const check = checkRateLimit("login");
    if (!check.allowed) { setErr(check.message); return; }

    const validation = validateLoginInput(method, input, pass);
    if (!validation.ok) { setErr(validation.message); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearRateLimit("login");
      onLogin({ contact: validation.contact, method });
    }, 1400);
  };

  const rem = remainingAttempts("login");

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 72%)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Poppins',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ paddingTop: 60, paddingBottom: 20, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(-30px)", transition: "all .7s ease", textAlign: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: 2, textShadow: "0 4px 20px #0003" }}>
          <span style={{ fontStyle: "italic", color: "#FFE082" }}>S</span>PINOVA
        </div>
        <div style={{ color: "rgba(255,255,255,.8)", fontSize: 12, marginTop: 4, letterSpacing: 4 }}>GAMING PLATFORM</div>
      </div>

      <div style={{ width: "92%", maxWidth: 400, background: "#fff", borderRadius: 24, padding: "28px 24px 32px", boxShadow: "0 20px 60px #EF535044", opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(50px)", transition: "all .8s ease .2s" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: G.text, marginBottom: 4 }}>Welcome Back 👋</div>
        <div style={{ color: G.sub, fontSize: 13, marginBottom: 20 }}>Log in to your account</div>

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
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>{f.label}</div>
            <input type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
              maxLength={f.type === "password" ? 64 : method === "mobile" ? 15 : 100}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E" }} />
          </div>
        ))}

        {err && <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8 }}>{err}</div>}

        {/* Remaining attempts warning */}
        {rem <= 2 && rem > 0 && !err && (
          <div style={{ color: "#FF8F00", fontSize: 12, marginBottom: 8 }}>
            ⚠️ {rem} attempt{rem !== 1 ? "s" : ""} remaining before temporary lockout.
          </div>
        )}

        <button onClick={submit} disabled={loading || !checkRateLimit("login").allowed}
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", marginTop: 16, background: loading || !checkRateLimit("login").allowed ? "#ccc" : gradient, color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading || !checkRateLimit("login").allowed ? "not-allowed" : "pointer", boxShadow: "0 6px 20px #EF535044", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? (
            <><div style={{ width: 18, height: 18, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />Logging in...</>
          ) : "Log In"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: G.sub }}>
          Don't have an account?{" "}
          <span onClick={onGotoRegister} style={{ color: G.red, fontWeight: 700, cursor: "pointer" }}>Register</span>
        </div>
      </div>
    </div>
  );
}

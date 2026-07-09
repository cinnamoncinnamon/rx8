import React, { useState, useEffect } from "react";
import { G, CSS, gradient } from "../constants";
import { apiLogin } from "../api";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
export default function LoginScreen({ onLogin, onGotoRegister }) {
  const [input, setInput] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);

  const submit = async () => {
    if (!input || !pass) { setErr("Please fill all fields."); return; }
    setLoading(true);
    setErr("");
    try {
      const user = await apiLogin(input.trim(), pass);
      onLogin(user);
    } catch (e) {
      setErr(e.message || "Login failed. Please try again.");
    }
    setLoading(false);
  };

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

        {/* Mobile field */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>📱 Mobile Number</div>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="+880 XXXXXXXXXX" maxLength={15}
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }} />
        </div>

        {/* Password field with show/hide */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Password</div>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="••••••••" maxLength={64}
              style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }} />
            <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, color: "#aaa" }}>
            <img src={showPass ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        {err && <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8, padding: "8px 12px", background: "#FFF0F0", borderRadius: 8 }}>{err}</div>}

        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", marginTop: 8, background: loading ? "#ccc" : gradient, color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 6px 20px #EF535044", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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

import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import SlideVerify from "../components/SlideVerify";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import { apiRegister } from "../api";

export default function RegisterScreen({ onRegister, onBack }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [verified, setVerified] = useState(false);
  const [slideReset, setSlideReset] = useState(0);
  const [showMobile, setShowMobile] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = async () => {
    if (!verified) { setErr("Please complete the verification slider."); return; }
    if (!name.trim() || name.trim().length < 2) { setErr("Enter your full name."); return; }
    if (!mobile) { setErr("Enter your mobile number."); return; }
    if (!pass || pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pass !== confirm) { setErr("Passwords don't match."); return; }

    setLoading(true);
    setErr("");
    try {
      const user = await apiRegister({
        mobile: mobile.trim(),
        password: pass,
        confirmPassword: confirm,
        name: name.trim(),
      });
      onRegister(user);
    } catch (e) {
      setErr(e.message || "Registration failed. Please try again.");
      setVerified(false);
      setSlideReset(r => r + 1);
    }
    setLoading(false);
  };

  const fieldStyle = { width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" };
  const labelStyle = { fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 };

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

        {/* Full Name */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Full Name</div>
          <div style={{ position: "relative" }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={40} style={{ ...fieldStyle, padding: "13px 16px" }} />
          </div>
        </div>

        {/* Mobile */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>📱 Mobile Number</div>
          <div style={{ position: "relative" }}>
            <input type={showMobile ? "text" : "password"} value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+880 XXXXXXXXXX" maxLength={15} style={fieldStyle} />
            <button onClick={() => setShowMobile(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
              <img src={showMobile ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Password</div>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" maxLength={64} style={fieldStyle} />
            <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
              <img src={showPass ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Confirm Password</div>
          <div style={{ position: "relative" }}>
            <input type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" maxLength={64} style={fieldStyle} />
            <button onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
              <img src={showConfirm ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        {err && <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8, padding: "8px 12px", background: "#FFF0F0", borderRadius: 8 }}>{err}</div>}

        <SlideVerify onVerify={setVerified} reset={slideReset} />

        <button onClick={submit} disabled={loading || !verified}
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", marginTop: 4, background: loading || !verified ? "#ccc" : gradient, color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading || !verified ? "not-allowed" : "pointer", boxShadow: "0 6px 20px #EF535044", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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

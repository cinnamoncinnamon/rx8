import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import { checkRateLimit, recordFailedAttempt, clearRateLimit, remainingAttempts } from "../utils/rateLimiter";
import { validateRegisterInput } from "../utils/sanitize";
import { apiRegister } from "../api";
import SlideVerify from "../components/SlideVerify";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";

export default function RegisterScreen({ onRegister, onBack }) {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [verified, setVerified] = useState(false);
  const [slideReset, setSlideReset] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // After a successful register, we hold the account here and show the
  // recovery code once before actually logging the user into the app.
  const [pendingUser, setPendingUser] = useState(null);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const submit = async () => {
    const check = checkRateLimit("register");
    if (!check.allowed) { setErr(check.message); return; }

    if (!verified) { setErr("Please complete the verification slider."); return; }

    if (!name.trim()) { setErr("Please enter your name."); return; }
    if (name.trim().length < 2) { setErr("Name must be at least 2 characters."); return; }

    const validation = validateRegisterInput("mobile", input, pass, confirm);
    if (!validation.ok) {
      setErr(validation.message);
      setVerified(false);
      setSlideReset(r => r + 1);
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const { user, recoveryCode } = await apiRegister({
        mobile: validation.contact,
        password: pass,
        confirmPassword: confirm,
        name: name.trim(),
      });
      clearRateLimit("register");
      setPendingUser(user);
      setRecoveryCode(recoveryCode);
    } catch (e) {
      recordFailedAttempt("register");
      setErr(e.message || "Registration failed. Please try again.");
      setVerified(false);
      setSlideReset(r => r + 1);
    }
    setLoading(false);
  };

  const rem = remainingAttempts("register");
  const locked = !checkRateLimit("register").allowed;

  // ── Step 2: recovery code reveal ─────────────────────────────────────────
  if (pendingUser) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 72%)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Poppins',sans-serif" }}>
        <style>{CSS}</style>
        <div style={{ paddingTop: 55, paddingBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>
            <span style={{ fontStyle: "italic", color: "#FFE082" }}>S</span>PINOVA
          </div>
        </div>

        <div style={{ width: "92%", maxWidth: 400, background: "#fff", borderRadius: 24, padding: "28px 24px 32px", boxShadow: "0 20px 60px #EF535044" }}>
          <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>🔑</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: G.text, marginBottom: 6, textAlign: "center" }}>Save your recovery code</div>
          <div style={{ color: G.sub, fontSize: 13, marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>
            This is the only way to reset your password if you forget it. We won't show it again — write it down or take a screenshot now.
          </div>

          <div style={{ background: "#FFF8E1", border: "1.5px dashed #FFC107", borderRadius: 14, padding: "18px 14px", textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: "#1A1A2E", fontFamily: "monospace" }}>{recoveryCode}</div>
            <button
              onClick={() => navigator.clipboard?.writeText(recoveryCode)}
              style={{ marginTop: 10, padding: "7px 16px", borderRadius: 8, border: "1px solid #FFC107", background: "#fff", color: "#8a6d00", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
              Copy code
            </button>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18, cursor: "pointer" }}>
            <input type="checkbox" checked={savedConfirmed} onChange={(e) => setSavedConfirmed(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: G.sub, lineHeight: 1.4 }}>I've saved this code somewhere safe. I understand SPINOVA cannot recover my account without it.</span>
          </label>

          <button
            onClick={() => onRegister(pendingUser)}
            disabled={!savedConfirmed}
            style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: savedConfirmed ? gradient : "#ccc", color: "#fff", fontSize: 16, fontWeight: 700, cursor: savedConfirmed ? "pointer" : "not-allowed", boxShadow: "0 6px 20px #EF535044" }}>
            Continue to SPINOVA →
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: registration form ────────────────────────────────────────────
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

        {/* Fields */}
        {/* Full Name */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Full Name</div>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your name" maxLength={40}
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }}
          />
        </div>

        {/* Mobile */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Mobile Number</div>
          <div style={{ position: "relative" }}>
            <input
              type={showInput ? "text" : "password"}
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="01XXXXXXXXX"
              maxLength={15}
              style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }}
            />
            <button onClick={() => setShowInput(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
              <img src={showInput ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Password</div>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={pass} onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••" maxLength={64}
              style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }}
            />
            <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
              <img src={showPass ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Confirm Password</div>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••" maxLength={64}
              style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }}
            />
            <button onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
              <img src={showConfirm ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        {err && <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8 }}>{err}</div>}

        {rem <= 1 && rem > 0 && !err && (
          <div style={{ color: "#FF8F00", fontSize: 12, marginBottom: 8 }}>
            ⚠️ Last attempt before temporary lockout.
          </div>
        )}

        <SlideVerify onVerify={setVerified} reset={slideReset} />

        <button onClick={submit} disabled={loading || locked || !verified}
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", marginTop: 4, background: loading || locked || !verified ? "#ccc" : gradient, color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading || locked || !verified ? "not-allowed" : "pointer", boxShadow: "0 6px 20px #EF535044", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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

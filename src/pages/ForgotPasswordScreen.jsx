import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import { apiForgotPassword } from "../api";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "../utils/rateLimiter";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";

export default function ForgotPasswordScreen({ onBack, onDone }) {
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const submit = async () => {
    const check = checkRateLimit("forgot-password");
    if (!check.allowed) { setErr(check.message); return; }

    if (!mobile.trim() || !code.trim() || !newPass || !confirmPass) {
      setErr("Fill all fields.");
      return;
    }
    if (newPass !== confirmPass) {
      setErr("Passwords don't match.");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const rotatedCode = await apiForgotPassword({
        mobile: mobile.trim(),
        recoveryCode: code.trim(),
        newPassword: newPass,
        confirmNewPassword: confirmPass,
      });
      clearRateLimit("forgot-password");
      setNewCode(rotatedCode);
    } catch (e) {
      recordFailedAttempt("forgot-password");
      setErr(e.message || "Could not reset password. Please try again.");
    }
    setLoading(false);
  };

  // ── Step 2: new recovery code reveal ─────────────────────────────────────
  if (newCode) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 72%)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Poppins',sans-serif" }}>
        <style>{CSS}</style>
        <div style={{ paddingTop: 55, paddingBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>
            <span style={{ fontStyle: "italic", color: "#FFE082" }}>S</span>PINOVA
          </div>
        </div>

        <div style={{ width: "92%", maxWidth: 400, background: "#fff", borderRadius: 24, padding: "28px 24px 32px", boxShadow: "0 20px 60px #EF535044" }}>
          <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: G.text, marginBottom: 6, textAlign: "center" }}>Password reset</div>
          <div style={{ color: G.sub, fontSize: 13, marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>
            Your old recovery code no longer works. Here's your new one — save it now, it won't be shown again.
          </div>

          <div style={{ background: "#FFF8E1", border: "1.5px dashed #FFC107", borderRadius: 14, padding: "18px 14px", textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: "#1A1A2E", fontFamily: "monospace" }}>{newCode}</div>
            <button
              onClick={() => navigator.clipboard?.writeText(newCode)}
              style={{ marginTop: 10, padding: "7px 16px", borderRadius: 8, border: "1px solid #FFC107", background: "#fff", color: "#8a6d00", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
              Copy code
            </button>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18, cursor: "pointer" }}>
            <input type="checkbox" checked={savedConfirmed} onChange={(e) => setSavedConfirmed(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: G.sub, lineHeight: 1.4 }}>I've saved this code somewhere safe.</span>
          </label>

          <button
            onClick={onDone}
            disabled={!savedConfirmed}
            style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: savedConfirmed ? gradient : "#ccc", color: "#fff", fontSize: 16, fontWeight: 700, cursor: savedConfirmed ? "pointer" : "not-allowed", boxShadow: "0 6px 20px #EF535044" }}>
            Back to Login →
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: reset form ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 72%)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Poppins',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ paddingTop: 55, paddingBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>
          <span style={{ fontStyle: "italic", color: "#FFE082" }}>S</span>PINOVA
        </div>
      </div>

      <div style={{ width: "92%", maxWidth: 400, background: "#fff", borderRadius: 24, padding: "28px 24px 32px", boxShadow: "0 20px 60px #EF535044" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: G.text, marginBottom: 4 }}>Reset password</div>
        <div style={{ color: G.sub, fontSize: 13, marginBottom: 20 }}>Enter your mobile number and the recovery code you saved at signup.</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Mobile Number</div>
          <input
            type="text" value={mobile} onChange={(e) => setMobile(e.target.value)}
            placeholder="01XXXXXXXXX" maxLength={15}
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Recovery Code</div>
          <input
            type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX" maxLength={14}
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "monospace", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box", letterSpacing: 1 }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>New Password</div>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={newPass} onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••" maxLength={64}
              style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }}
            />
            <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
              <img src={showPass ? hideIcon : viewIcon} alt="toggle" style={{ width: 20, height: 20, opacity: 0.45 }} />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Confirm New Password</div>
          <input
            type={showPass ? "text" : "password"}
            value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="••••••••" maxLength={64}
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 14, fontFamily: "'Poppins',sans-serif", background: "#fafafa", color: "#1A1A2E", boxSizing: "border-box" }}
          />
        </div>

        {err && <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8, padding: "8px 12px", background: "#FFF0F0", borderRadius: 8 }}>{err}</div>}

        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", marginTop: 4, background: loading ? "#ccc" : gradient, color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 6px 20px #EF535044", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? (
            <><div style={{ width: 18, height: 18, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />Resetting...</>
          ) : "Reset Password →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: G.sub }}>
          <span onClick={onBack} style={{ color: G.red, fontWeight: 700, cursor: "pointer" }}>← Back to Login</span>
        </div>
      </div>
    </div>
  );
}

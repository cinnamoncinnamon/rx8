import React, { useState, useEffect, useRef, useCallback } from "react";

const NUM_COLORS = {
  0: ["red", "violet"],
  1: ["green"],
  2: ["red"],
  3: ["green"],
  4: ["red"],
  5: ["green", "violet"],
  6: ["red"],
  7: ["green"],
  8: ["red"],
  9: ["green"],
};
const isBig = (n) => n >= 5;
const BASE = "20260513100051260";
const makePID = (base, off = 0) => (BigInt(base) - BigInt(off)).toString();
function genHist(n = 50) {
  return Array.from({ length: n }, (_, i) => {
    const num = Math.floor(Math.random() * 10);
    return {
      period: makePID(BASE, i + 1),
      number: num,
      bigSmall: isBig(num) ? "Big" : "Small",
      colors: NUM_COLORS[num],
    };
  });
}
const G = {
  red: "#EF5350",
  green: "#22C55E",
  violet: "#7C3AED",
  orange: "#F97316",
  blue: "#3B82F6",
  bg: "#F4F4F8",
  text: "#1A1A2E",
  sub: "#888",
};
const gradient = `linear-gradient(135deg,#EF5350,#FF8A80)`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes engineGlow{0%,100%{opacity:.7;transform:scaleX(1)}50%{opacity:1;transform:scaleX(1.4)}}
@keyframes multPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes dotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes crashShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
input::placeholder{color:#777;}
input:focus{outline:none;}
button:active{opacity:.85;}
::-webkit-scrollbar{width:0;height:0;}
`;

/* ── BALL ── */
function Ball({ number, size = 44, selected = false, onClick }) {
  const colors = NUM_COLORS[number];
  const dual = colors.length === 2;
  const isGreen = colors.includes("green");
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        border: selected ? "3px solid #FF6B35" : "none",
        boxShadow: selected ? "0 0 12px #FF6B3599" : "0 2px 8px #0004",
        transform: selected ? "scale(1.1)" : "scale(1)",
        transition: "transform .15s",
      }}
    >
      {dual ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isGreen ? "#22C55E" : "#EF4444",
              clipPath: "polygon(0 0,50% 0,50% 100%,0 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#7C3AED",
              clipPath: "polygon(50% 0,100% 0,100% 100%,50% 100%)",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isGreen ? "#22C55E" : "#EF4444",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "15%",
          right: "15%",
          bottom: "15%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.38,
            fontWeight: 800,
            color: isGreen ? "#22C55E" : "#EF4444",
          }}
        >
          {number}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "15%",
          width: "35%",
          height: "25%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.4)",
        }}
      />
    </div>
  );
}

/* ── LOGIN ── */
function LoginScreen({ onLogin, onGotoRegister }) {
  const [method, setMethod] = useState("mobile");
  const [input, setInput] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), 80);
  }, []);
  const submit = () => {
    if (!input || !pass) {
      setErr("Please fill all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ contact: input, method });
    }, 1400);
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 72%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <style>{CSS}</style>
      <div
        style={{
          paddingTop: 60,
          paddingBottom: 20,
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(-30px)",
          transition: "all .7s ease",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 2,
            textShadow: "0 4px 20px #0003",
          }}
        >
          <span style={{ fontStyle: "italic", color: "#FFE082" }}>H</span>GNICE
        </div>
        <div
          style={{
            color: "rgba(255,255,255,.8)",
            fontSize: 12,
            marginTop: 4,
            letterSpacing: 4,
          }}
        >
          GAMING PLATFORM
        </div>
      </div>
      <div
        style={{
          width: "92%",
          maxWidth: 400,
          background: "#fff",
          borderRadius: 24,
          padding: "28px 24px 32px",
          boxShadow: "0 20px 60px #EF535044",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(50px)",
          transition: "all .8s ease .2s",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: G.text,
            marginBottom: 4,
          }}
        >
          Welcome Back 👋
        </div>
        <div style={{ color: G.sub, fontSize: 13, marginBottom: 20 }}>
          Log in to your account
        </div>
        <div
          style={{
            display: "flex",
            background: "#f5f5f5",
            borderRadius: 12,
            marginBottom: 20,
            padding: 4,
            gap: 4,
          }}
        >
          {["mobile", "gmail"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMethod(m);
                setInput("");
                setErr("");
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                background: method === m ? "#EF5350" : "transparent",
                color: method === m ? "#fff" : "#888",
                transition: "all .2s",
              }}
            >
              {m === "mobile" ? "📱 Mobile" : "📧 Gmail"}
            </button>
          ))}
        </div>
        {[
          {
            label: method === "mobile" ? "Mobile Number" : "Gmail",
            val: input,
            set: setInput,
            ph: method === "mobile" ? "+880 XXXXXXXXXX" : "you@gmail.com",
            type: "text",
          },
          {
            label: "Password",
            val: pass,
            set: setPass,
            ph: "••••••••",
            type: "password",
          },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                color: G.sub,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              {f.label}
            </div>
            <input
              type={f.type}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.ph}
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                border: "1.5px solid #eee",
                fontSize: 14,
                fontFamily: "'Poppins',sans-serif",
                background: "#fafafa",
                color: "#1A1A2E",
              }}
            />
          </div>
        ))}
        {err && (
          <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8 }}>
            {err}
          </div>
        )}
        <button
          onClick={submit}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 14,
            border: "none",
            marginTop: 16,
            background: loading ? "#ccc" : gradient,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 20px #EF535044",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </button>
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 13,
            color: G.sub,
          }}
        >
          Don't have an account?{" "}
          <span
            onClick={onGotoRegister}
            style={{ color: G.red, fontWeight: 700, cursor: "pointer" }}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── REGISTER ── */
function RegisterScreen({ onRegister, onBack }) {
  const [method, setMethod] = useState("mobile");
  const [input, setInput] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const submit = () => {
    if (!input || !pass || !confirm) {
      setErr("Fill all fields.");
      return;
    }
    if (pass !== confirm) {
      setErr("Passwords don't match.");
      return;
    }
    setLoading(true);
    setTimeout(() => onRegister({ contact: input, method }), 1200);
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 72%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <style>{CSS}</style>
      <div style={{ paddingTop: 55, paddingBottom: 16, textAlign: "center" }}>
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 2,
          }}
        >
          <span style={{ fontStyle: "italic", color: "#FFE082" }}>H</span>GNICE
        </div>
      </div>
      <div
        style={{
          width: "92%",
          maxWidth: 400,
          background: "#fff",
          borderRadius: 24,
          padding: "28px 24px 32px",
          boxShadow: "0 20px 60px #EF535044",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: G.text,
            marginBottom: 4,
          }}
        >
          Join HGNICE 🎮
        </div>
        <div style={{ color: G.sub, fontSize: 13, marginBottom: 20 }}>
          Start winning today
        </div>
        <div
          style={{
            display: "flex",
            background: "#f5f5f5",
            borderRadius: 12,
            marginBottom: 20,
            padding: 4,
            gap: 4,
          }}
        >
          {["mobile", "gmail"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMethod(m);
                setInput("");
                setErr("");
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                background: method === m ? "#EF5350" : "transparent",
                color: method === m ? "#fff" : "#888",
                transition: "all .2s",
              }}
            >
              {m === "mobile" ? "📱 Mobile" : "📧 Gmail"}
            </button>
          ))}
        </div>
        {[
          {
            label: method === "mobile" ? "Mobile Number" : "Gmail",
            val: input,
            set: setInput,
            ph: method === "mobile" ? "+880 XXXXXXXXXX" : "you@gmail.com",
            type: "text",
          },
          {
            label: "Password",
            val: pass,
            set: setPass,
            ph: "••••••••",
            type: "password",
          },
          {
            label: "Confirm Password",
            val: confirm,
            set: setConfirm,
            ph: "••••••••",
            type: "password",
          },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                color: G.sub,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              {f.label}
            </div>
            <input
              type={f.type}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.ph}
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                border: "1.5px solid #eee",
                fontSize: 14,
                fontFamily: "'Poppins',sans-serif",
                background: "#fafafa",
                color: "#1A1A2E",
              }}
            />
          </div>
        ))}
        {err && (
          <div style={{ color: "#EF5350", fontSize: 12, marginBottom: 8 }}>
            {err}
          </div>
        )}
        <button
          onClick={submit}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 14,
            border: "none",
            marginTop: 4,
            background: loading ? "#ccc" : gradient,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 20px #EF535044",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Creating...
            </>
          ) : (
            "Create Account →"
          )}
        </button>
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 13,
            color: G.sub,
          }}
        >
          Already have an account?{" "}
          <span
            onClick={onBack}
            style={{ color: G.red, fontWeight: 700, cursor: "pointer" }}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── DEPOSIT SETUP ── */
function DepositSetup({ contact, onDone }) {
  const [mainNum, setMainNum] = useState("");
  const [extraNums, setExtraNums] = useState(["", ""]);
  const [done, setDone] = useState(false);
  const save = () => {
    if (!mainNum) {
      return;
    }
    setDone(true);
    setTimeout(() => onDone({ main: mainNum, extras: extraNums }), 1000);
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 60%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <style>{CSS}</style>
      <div style={{ paddingTop: 50, paddingBottom: 16, textAlign: "center" }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 2,
          }}
        >
          <span style={{ fontStyle: "italic", color: "#FFE082" }}>H</span>GNICE
        </div>
        <div
          style={{ color: "rgba(255,255,255,.8)", fontSize: 13, marginTop: 4 }}
        >
          💳 Payment Setup
        </div>
      </div>
      <div
        style={{
          width: "92%",
          maxWidth: 400,
          background: "#fff",
          borderRadius: 24,
          padding: "28px 24px 36px",
          boxShadow: "0 20px 60px #EF535044",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 20,
            color: G.text,
            marginBottom: 4,
          }}
        >
          💳 Payment Setup
        </div>
        <div
          style={{
            color: G.sub,
            fontSize: 12,
            marginBottom: 20,
            lineHeight: 1.7,
          }}
        >
          Set your deposit & withdrawal account. Main number cannot be changed
          later. Add up to 2 extra withdrawal numbers.
        </div>
        <div
          style={{
            background: "#FFF3E0",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 20,
            fontSize: 12,
            color: "#E65100",
            fontWeight: 600,
          }}
        >
          ⚠️ Main number is permanent. Choose carefully.
        </div>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: G.text,
              marginBottom: 6,
            }}
          >
            Main Account Number <span style={{ color: "#EF5350" }}>*</span>
          </div>
          <input
            value={mainNum}
            onChange={(e) => setMainNum(e.target.value)}
            placeholder="e.g. 01XXXXXXXXX"
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 12,
              border: "2px solid #EF5350",
              fontSize: 14,
              fontFamily: "'Poppins',sans-serif",
              background: "#fff8f8",
              color: G.text,
            }}
          />
          <div style={{ fontSize: 11, color: G.sub, marginTop: 4 }}>
            Used for both deposit and withdrawal
          </div>
        </div>
        {extraNums.map((n, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: G.sub,
                marginBottom: 6,
              }}
            >
              Withdrawal Number {i + 2} (optional)
            </div>
            <input
              value={n}
              onChange={(e) => {
                const a = [...extraNums];
                a[i] = e.target.value;
                setExtraNums(a);
              }}
              placeholder={`Alternative number ${i + 2}`}
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                border: "1.5px solid #eee",
                fontSize: 14,
                fontFamily: "'Poppins',sans-serif",
                background: "#fafafa",
                color: G.text,
              }}
            />
          </div>
        ))}
        <button
          onClick={save}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 14,
            border: "none",
            marginTop: 12,
            background: done ? "#ccc" : gradient,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 20px #EF535044",
          }}
        >
          {done ? "Setting up..." : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}

/* ── WINGO ── */
const MODES = [
  { label: "30s", seconds: 30 },
  { label: "1 Min", seconds: 60 },
  { label: "3 Min", seconds: 180 },
  { label: "5 Min", seconds: 300 },
];

function BetModal({
  type,
  label,
  color,
  onConfirm,
  onClose,
  multiplier,
  setMultiplier,
  balance,
}) {
  const [amount, setAmount] = useState(10);
  const presets = [10, 25, 50, 100, 200];
  const bgMap = {
    green: "#22C55E",
    violet: "#7C3AED",
    red: "#EF4444",
    big: "#F97316",
    small: "#3B82F6",
  };
  const bg = bgMap[color] || "#EF4444";
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0009",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          background: "#1A1A2E",
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          animation: "slideUp .3s ease",
        }}
      >
        <div
          style={{
            background: bg,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
            Win Go
          </span>
          <span style={{ color: "#fff", fontSize: 16 }}>{label}</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "20px 20px 32px" }}>
          <div style={{ color: "#aaa", fontSize: 13, marginBottom: 12 }}>
            Balance: ৳{balance.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#ccc",
              marginBottom: 8,
            }}
          >
            Contract Money
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  background: amount === p ? bg : "#2A2A40",
                  color: amount === p ? "#fff" : "#aaa",
                  border: "none",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#ccc",
              marginBottom: 8,
            }}
          >
            Multiplier
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {[1, 5, 10, 20, 50, 100].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: multiplier === m ? bg : "#2A2A40",
                  color: multiplier === m ? "#fff" : "#aaa",
                  border: "none",
                }}
              >
                ×{m}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "#2A2A40",
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <span style={{ color: "#aaa", fontSize: 13 }}>Total</span>
            <span style={{ color: bg, fontSize: 22, fontWeight: 800 }}>
              ৳{(amount * multiplier).toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => onConfirm(amount * multiplier)}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 12,
              border: "none",
              background: bg,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 4px 20px ${bg}66`,
            }}
          >
            Confirm ৳{(amount * multiplier).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

function WinGoGame({ balance, setBalance, onBack }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentPeriod, setCurrentPeriod] = useState(BASE);
  const [lastResults, setLastResults] = useState([7, 4, 2, 4, 7]);
  const [history, setHistory] = useState(() => genHist(50));
  const [pendingBets, setPendingBets] = useState([]);
  const [modal, setModal] = useState(null);
  const [multiplier, setMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState("history");
  const [myHistory, setMyHistory] = useState([]);
  const [resultFlash, setResultFlash] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef(null);
  const modeSeconds = MODES[modeIdx].seconds;

  const resolveRound = useCallback(() => {
    setPendingBets((bets) => {
      const winNum = Math.floor(Math.random() * 10);
      const winColors = NUM_COLORS[winNum];
      let totalWin = 0;
      bets.forEach((b) => {
        let won = false;
        if (b.type === "big" && winNum >= 5) won = true;
        if (b.type === "small" && winNum <= 4) won = true;
        if (b.type === "green" && winColors.includes("green")) won = true;
        if (b.type === "red" && winColors.includes("red")) won = true;
        if (b.type === "violet" && winColors.includes("violet")) won = true;
        if (b.type === "number" && b.value === winNum) won = true;
        if (won)
          totalWin +=
            b.amount *
            (b.type === "number" ? 9 : b.type === "violet" ? 4.5 : 2);
      });
      if (totalWin > 0) setBalance((bl) => bl + totalWin);
      const entry = {
        period: currentPeriod,
        number: winNum,
        bigSmall: winNum >= 5 ? "Big" : "Small",
        colors: NUM_COLORS[winNum],
      };
      setHistory((h) => [entry, ...h].slice(0, 50));
      setLastResults((r) => [winNum, ...r].slice(0, 5));
      setCurrentPeriod((p) => (BigInt(p) + 1n).toString());
      if (bets.length > 0) {
        setMyHistory((mh) =>
          [
            {
              period: currentPeriod,
              number: winNum,
              bets,
              totalWin,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            ...mh,
          ].slice(0, 30)
        );
        setResultFlash({ number: winNum, won: totalWin > 0, amount: totalWin });
        setTimeout(() => setResultFlash(null), 2800);
      }
      return [];
    });
  }, [currentPeriod]);

  useEffect(() => {
    setTimeLeft(modeSeconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          resolveRound();
          return modeSeconds;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [modeIdx, modeSeconds]);

  useEffect(() => {
    setIsLocked(timeLeft <= 5);
  }, [timeLeft]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  const openModal = (type, label, color, value) => {
    if (isLocked) return;
    setModal({ type, label, color, value });
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: "#0D0D1A",
        minHeight: "100vh",
        fontFamily: "'Poppins',sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ background: gradient, padding: "0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,.2)",
              border: "none",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              borderRadius: 8,
              padding: "6px 12px",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            ‹ Back
          </button>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: 1,
            }}
          >
            <span style={{ fontStyle: "italic", color: "#FFE082" }}>H</span>
            GNICE
          </div>
          <div
            style={{
              background: "rgba(255,255,255,.2)",
              borderRadius: 16,
              padding: "5px 12px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ৳{balance.toFixed(2)}
          </div>
        </div>
        {/* Mode tabs */}
        <div style={{ display: "flex", padding: "0 10px 12px", gap: 6 }}>
          {MODES.map((m, i) => (
            <button
              key={i}
              onClick={() => setModeIdx(i)}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: modeIdx === i ? "#fff" : "rgba(255,255,255,.2)",
                color: modeIdx === i ? "#EF5350" : "#fff",
                fontWeight: 700,
                fontSize: 11,
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              WinGo
              <br />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game info panel */}
      <div
        style={{
          background: "linear-gradient(135deg,#c0392b,#922b21)",
          padding: "12px 14px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              {lastResults.map((n, i) => (
                <Ball key={i} number={n} size={26} />
              ))}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,.55)",
                fontSize: 9,
                fontFamily: "monospace",
              }}
            >
              {currentPeriod}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                color: "rgba(255,255,255,.8)",
                fontSize: 10,
                marginBottom: 4,
              }}
            >
              Time remaining
            </div>
            <div
              style={{
                display: "flex",
                gap: 3,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {[mm[0], mm[1], ":", ss[0], ss[1]].map((d, i) =>
                d === ":" ? (
                  <span
                    key={i}
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: 900,
                      lineHeight: "30px",
                      margin: "0 1px",
                    }}
                  >
                    :
                  </span>
                ) : (
                  <div
                    key={i}
                    style={{
                      width: 26,
                      height: 30,
                      background: "#111",
                      borderRadius: 5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Orbitron',monospace",
                      fontSize: 17,
                      fontWeight: 900,
                      color: isLocked ? "#EF5350" : "#fff",
                    }}
                  >
                    {d}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bet area */}
      <div
        style={{
          background: "#fff",
          margin: "10px 10px 0",
          borderRadius: 16,
          padding: "14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isLocked && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,.65)",
              borderRadius: 16,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 48,
                fontWeight: 900,
                color: "#EF5350",
                textShadow: "0 0 30px #EF5350",
              }}
            >
              {timeLeft}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,.7)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Betting closed
            </div>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <button
            onClick={() => openModal("green", "Green", "green")}
            style={{
              padding: "13px 0",
              borderRadius: 10,
              border: "none",
              background: "#22C55E",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Green
          </button>
          <button
            onClick={() => openModal("violet", "Violet", "violet")}
            style={{
              padding: "13px 0",
              borderRadius: 10,
              border: "none",
              background: "#7C3AED",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Violet
          </button>
          <button
            onClick={() => openModal("red", "Red", "red")}
            style={{
              padding: "13px 0",
              borderRadius: 10,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Red
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {Array.from({ length: 5 }, (_, n) => (
              <Ball
                key={n}
                number={n}
                size={46}
                selected={pendingBets.some(
                  (b) => b.type === "number" && b.value === n
                )}
                onClick={() =>
                  openModal(
                    "number",
                    `Number ${n}`,
                    NUM_COLORS[n].includes("green") ? "green" : "red",
                    n
                  )
                }
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {Array.from({ length: 5 }, (_, n) => (
              <Ball
                key={n + 5}
                number={n + 5}
                size={46}
                selected={pendingBets.some(
                  (b) => b.type === "number" && b.value === n + 5
                )}
                onClick={() =>
                  openModal(
                    "number",
                    `Number ${n + 5}`,
                    NUM_COLORS[n + 5].includes("green") ? "green" : "red",
                    n + 5
                  )
                }
              />
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              padding: "7px 14px",
              borderRadius: 16,
              border: "1px solid #EF5350",
              color: "#EF5350",
              background: "#fff",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Random
          </button>
          {[1, 5, 10, 20, 50, 100].map((m) => (
            <button
              key={m}
              onClick={() => setMultiplier(m)}
              style={{
                padding: "7px 13px",
                borderRadius: 16,
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: multiplier === m ? "#22C55E" : "#f0f0f0",
                color: multiplier === m ? "#fff" : "#666",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              ×{m}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            borderRadius: 22,
            overflow: "hidden",
            height: 48,
          }}
        >
          <button
            onClick={() => openModal("big", "Big", "big")}
            style={{
              flex: 1,
              border: "none",
              background: "#F97316",
              color: "#fff",
              fontWeight: 800,
              fontSize: 17,
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Big
          </button>
          <button
            onClick={() => openModal("small", "Small", "small")}
            style={{
              flex: 1,
              border: "none",
              background: "#3B82F6",
              color: "#fff",
              fontWeight: 800,
              fontSize: 17,
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Small
          </button>
        </div>
        {pendingBets.length > 0 && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: "#FFF8E1",
              borderRadius: 10,
              border: "1px solid #FFE082",
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {pendingBets.map((b, i) => (
              <span
                key={i}
                style={{
                  padding: "3px 10px",
                  background: "#FFE082",
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5D4037",
                }}
              >
                {b.label} ৳{b.amount}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "#fff",
          margin: "10px 10px 0",
          borderRadius: "16px 16px 0 0",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
          {[
            { k: "history", l: "Game history" },
            { k: "chart", l: "Chart" },
            { k: "myhistory", l: "My history" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k)}
              style={{
                flex: 1,
                padding: "12px 0",
                border: "none",
                background: activeTab === t.k ? "#EF5350" : "transparent",
                color: activeTab === t.k ? "#fff" : "#aaa",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Poppins',sans-serif",
                borderRadius: activeTab === t.k ? "12px 12px 0 0" : 0,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
        {activeTab === "history" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "10px 12px",
                background: "#EF5350",
                gap: 4,
              }}
            >
              {["Period", "Number", "Big Small", "Color"].map((h) => (
                <span
                  key={h}
                  style={{
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {history.slice(0, 10).map((r, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "10px 12px",
                  gap: 4,
                  borderBottom: "1px solid #f5f5f5",
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 10, color: "#999" }}>
                  {r.period.slice(-8)}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: r.colors.includes("green") ? "#22C55E" : "#EF4444",
                    textAlign: "center",
                  }}
                >
                  {r.number}
                </span>
                <span
                  style={{ fontSize: 12, color: "#555", textAlign: "center" }}
                >
                  {r.bigSmall}
                </span>
                <div
                  style={{ display: "flex", gap: 3, justifyContent: "center" }}
                >
                  {r.colors.map((c, j) => (
                    <div
                      key={j}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background:
                          c === "green"
                            ? "#22C55E"
                            : c === "violet"
                            ? "#7C3AED"
                            : "#EF4444",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "chart" && (
          <div style={{ padding: 12 }}>
            {history.slice(0, 10).map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "5px 0",
                  borderBottom: "1px solid #f5f5f5",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: "#ccc",
                    width: 72,
                    flexShrink: 0,
                  }}
                >
                  {r.period.slice(-6)}
                </span>
                {Array.from({ length: 10 }, (_, n) => (
                  <div
                    key={n}
                    style={{
                      width: 19,
                      height: 19,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {r.number === n ? (
                      <div
                        style={{
                          width: 17,
                          height: 17,
                          borderRadius: "50%",
                          background: r.colors.includes("green")
                            ? "#22C55E"
                            : "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        {n}
                      </div>
                    ) : (
                      <span style={{ fontSize: 9, color: "#e0e0e0" }}>{n}</span>
                    )}
                  </div>
                ))}
                <div
                  style={{
                    width: 19,
                    height: 19,
                    borderRadius: "50%",
                    background: r.bigSmall === "Big" ? "#F97316" : "#3B82F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {r.bigSmall === "Big" ? "B" : "S"}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "myhistory" && (
          <div style={{ padding: 12 }}>
            {myHistory.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "#ccc",
                }}
              >
                No data yet
              </div>
            ) : (
              myHistory.map((row, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f5f5f5",
                    background: i % 2 ? "#fff" : "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 10, color: "#aaa" }}>
                      {row.period.slice(-8)} · {row.time}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Ball number={row.number} size={24} />
                      <span
                        style={{
                          fontWeight: 800,
                          color: row.number >= 5 ? "#F97316" : "#3B82F6",
                          fontSize: 12,
                        }}
                      >
                        {row.number >= 5 ? "Big" : "Small"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    {row.bets.map((b, j) => (
                      <span
                        key={j}
                        style={{
                          fontSize: 11,
                          background: "#f0f0f0",
                          borderRadius: 6,
                          padding: "2px 8px",
                          color: "#666",
                        }}
                      >
                        {b.label} ৳{b.amount}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: row.totalWin > 0 ? "#22C55E" : "#EF5350",
                    }}
                  >
                    {row.totalWin > 0
                      ? `+৳${row.totalWin.toFixed(2)} Won 🎉`
                      : "No win this round"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div style={{ height: 24, background: "#fff", margin: "0 10px" }} />

      {modal && (
        <BetModal
          {...modal}
          multiplier={multiplier}
          setMultiplier={setMultiplier}
          balance={balance}
          onConfirm={(amt) => {
            if (balance < amt) return;
            setBalance((b) => b - amt);
            setPendingBets((b) => [...b, { ...modal, amount: amt }]);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {resultFlash && (
        <div
          style={{
            position: "fixed",
            top: "38%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 400,
            animation: "fadeIn .3s ease",
            textAlign: "center",
            minWidth: 220,
          }}
        >
          <div
            style={{
              background: "#111122",
              borderRadius: 20,
              padding: "24px 36px",
              boxShadow: "0 20px 60px #0008",
              border: "1px solid #ffffff15",
            }}
          >
            <Ball number={resultFlash.number} size={64} />
            <div
              style={{
                marginTop: 12,
                fontSize: 18,
                fontWeight: 800,
                color: resultFlash.won ? "#22C55E" : "#EF5350",
              }}
            >
              {resultFlash.won
                ? `🎉 Won ৳${resultFlash.amount.toFixed(2)}`
                : "😢 Better luck!"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   AVIATOR GAME — Canvas-based smooth curve
══════════════════════════════════════════════════════════════ */
function genBots() {
  const names = [
    "0***8","i***4","m***u","i***5","i***8","i***1","i***9","u***m",
    "p***r","k***i","a***z","b***7","c***3","d***9","e***5","f***2",
  ];
  return Array.from({ length: 14 }, (_, i) => {
    const bet = (Math.random() * 900 + 50).toFixed(2);
    const x = (Math.random() * 6 + 1.1).toFixed(2);
    return {
      name: names[i % 16],
      bet: parseFloat(bet),
      x: parseFloat(x),
      won: (parseFloat(bet) * parseFloat(x)).toFixed(2),
      flying: i >= 10,
    };
  });
}

function AviatorGame({ balance, setBalance, onBack }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(null);
  const crashRef = useRef(null);
  const phaseRef = useRef("waiting");
  const multRef = useRef(1.0);
  const pointsRef = useRef([]);

  const [phase, setPhase] = useState("waiting");
  const [mult, setMult] = useState(1.0);
  const [countdown, setCountdown] = useState(5);
  const [betAmt, setBetAmt] = useState(10);
  const [betAmt2, setBetAmt2] = useState(10);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betPlaced2, setBetPlaced2] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashedOut2, setCashedOut2] = useState(false);
  const [cashMult, setCashMult] = useState(null);
  const [cashMult2, setCashMult2] = useState(null);
  const [autoCash1, setAutoCash1] = useState(0);
  const [autoCash2, setAutoCash2] = useState(0);
  const [history, setHistory] = useState([
    1.28, 77.76, 1.76, 17.13, 7.33, 11.42, 1.05, 3.24, 2.14, 1.42,
  ]);
  const [activeTab, setActiveTab] = useState("allbets");
  const [betTab1, setBetTab1] = useState("bet");
  const [betTab2, setBetTab2] = useState("bet");
  const [allBets, setAllBets] = useState(() => genBots());
  const [crashedMult, setCrashedMult] = useState(null);

  const betPlacedRef = useRef(false);
  const betPlaced2Ref = useRef(false);
  const betAmtRef = useRef(10);
  const betAmt2Ref = useRef(10);
  useEffect(() => { betPlacedRef.current = betPlaced; }, [betPlaced]);
  useEffect(() => { betPlaced2Ref.current = betPlaced2; }, [betPlaced2]);
  useEffect(() => { betAmtRef.current = betAmt; }, [betAmt]);
  useEffect(() => { betAmt2Ref.current = betAmt2; }, [betAmt2]);

  const cashedOutRef = useRef(false);
  const cashedOut2Ref = useRef(false);
  const autoCash1Ref = useRef(0);
  const autoCash2Ref = useRef(0);
  useEffect(() => { cashedOutRef.current = cashedOut; }, [cashedOut]);
  useEffect(() => { cashedOut2Ref.current = cashedOut2; }, [cashedOut2]);
  useEffect(() => { autoCash1Ref.current = autoCash1; }, [autoCash1]);
  useEffect(() => { autoCash2Ref.current = autoCash2; }, [autoCash2]);

  const mc = (m) =>
    m < 2 ? "#FFD600" : m < 5 ? "#4ADE80" : m < 10 ? "#38BDF8" : "#F472B6";

  const drawFrame = useCallback((canvas, pts, currentMult, ph, cd) => {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0D0D1A";
    ctx.fillRect(0, 0, W, H);

    const ox = W * 0.05, oy = H * 0.98;
    const rays = 24;
    for (let i = 0; i < rays; i++) {
      const angle = -Math.PI / 2 + (i / (rays - 1)) * Math.PI * 0.65 - 0.1;
      const len = W * 2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(angle) * len, oy + Math.sin(angle) * len);
      ctx.strokeStyle = `rgba(255,255,255,${i % 2 === 0 ? 0.018 : 0.012})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const dotCount = 12;
    for (let i = 0; i < dotCount; i++) {
      const dx = W * 0.05 + i * ((W * 0.9) / (dotCount - 1));
      ctx.beginPath();
      ctx.arc(dx, H - 8, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
    }
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(8, H * 0.05 + i * ((H * 0.88) / 5), 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
    }

    if (ph === "waiting" || ph === "crashed") {
      if (ph === "crashed" && pts.length > 1) {
        drawCurve(ctx, pts, W, H, "#EF4444");
      }
      return;
    }

    if (pts.length < 2) return;
    drawCurve(ctx, pts, W, H, "#EF4444");

    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    drawPlane(ctx, last.x, last.y, angle, currentMult);
  }, []);

  function drawCurve(ctx, pts, W, H, color) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[pts.length - 1].x, H - 10);
    ctx.lineTo(pts[0].x, H - 10);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(239,68,68,0.35)");
    grad.addColorStop(1, "rgba(239,68,68,0.0)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = "rgba(255,160,160,0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawPlane(ctx, x, y, angle, m) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const sc = 1.3;
    ctx.scale(sc, sc);

    ctx.shadowColor = "#FF4400";
    ctx.shadowBlur = 28;
    const fireLen = 18 + Math.random() * 14;
    const fireGrad = ctx.createLinearGradient(-50 - fireLen, 0, -38, 0);
    fireGrad.addColorStop(0, "rgba(255,220,0,0)");
    fireGrad.addColorStop(0.3, "rgba(255,180,0,0.85)");
    fireGrad.addColorStop(0.7, "rgba(255,80,0,0.95)");
    fireGrad.addColorStop(1, "rgba(255,40,0,0.6)");
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.ellipse(-44 - fireLen / 2, 2, fireLen / 2, 4 + Math.random() * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,200,50,0.35)";
    ctx.beginPath();
    ctx.ellipse(-44 - fireLen * 0.7, 0, fireLen * 0.3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#C8000A";
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.bezierCurveTo(20, -8, 0, -10, -20, -8);
    ctx.bezierCurveTo(-36, -6, -44, -3, -46, 2);
    ctx.bezierCurveTo(-44, 7, -36, 8, -20, 8);
    ctx.bezierCurveTo(0, 10, 20, 7, 28, 0);
    ctx.fill();

    ctx.fillStyle = "rgba(255,80,80,0.25)";
    ctx.beginPath();
    ctx.ellipse(-5, -5, 18, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#A00008";
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.bezierCurveTo(26, -4, 34, -2, 38, 0);
    ctx.bezierCurveTo(34, 2, 26, 4, 22, 0);
    ctx.fill();

    ctx.fillStyle = "#B8000A";
    ctx.beginPath();
    ctx.moveTo(5, -2);
    ctx.lineTo(-8, -26);
    ctx.lineTo(-20, -28);
    ctx.lineTo(-24, -22);
    ctx.lineTo(-18, -10);
    ctx.lineTo(10, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,100,100,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.lineTo(-10, -24);
    ctx.stroke();

    ctx.fillStyle = "#900008";
    ctx.beginPath();
    ctx.moveTo(5, 2);
    ctx.lineTo(-8, 16);
    ctx.lineTo(-18, 12);
    ctx.lineTo(-14, 6);
    ctx.lineTo(10, 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#A00008";
    ctx.beginPath();
    ctx.moveTo(-34, -2);
    ctx.lineTo(-42, -18);
    ctx.lineTo(-32, -14);
    ctx.lineTo(-28, -2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#B0000A";
    ctx.beginPath();
    ctx.moveTo(-32, 2);
    ctx.lineTo(-44, 10);
    ctx.lineTo(-42, 4);
    ctx.lineTo(-30, 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#1A2A4A";
    ctx.beginPath();
    ctx.ellipse(8, -5, 9, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(150,200,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(10, -7, 5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4488CC";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(8, -5, 9, 5, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#880008";
    ctx.beginPath();
    ctx.arc(38, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    const propAngle = (Date.now() / 55) % (Math.PI * 2);
    ctx.save();
    ctx.translate(38, 0);
    ctx.rotate(propAngle);
    ctx.fillStyle = "rgba(180,0,10,0.7)";
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(200,50,50,0.12)";
    ctx.beginPath();
    ctx.arc(38, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const startRound = useCallback(() => {
    const r = Math.random();
    let crash;
    if (r < 0.04) crash = 1.0;
    else crash = parseFloat(Math.max(1.01, (1 / (1 - Math.random())) * 0.97).toFixed(2));
    crashRef.current = crash;
    phaseRef.current = "flying";
    multRef.current = 1.0;
    pointsRef.current = [];
    startRef.current = performance.now();

    if (betPlacedRef.current) setBalance((b) => b - betAmtRef.current);
    if (betPlaced2Ref.current) setBalance((b) => b - betAmt2Ref.current);

    setPhase("flying");
    setMult(1.0);

    const canvas = canvasRef.current;
    const W = canvas ? canvas.width : 460, H = canvas ? canvas.height : 240;
    const PAD_L = W * 0.07, PAD_B = H - 18, PAD_T = 18, PAD_R = W - 14;

    const tick = (now) => {
      if (phaseRef.current !== "flying") return;
      const elapsed = (now - startRef.current) / 1000;
      const m = parseFloat(Math.pow(Math.E, elapsed * 0.09).toFixed(3));
      multRef.current = m;
      setMult(parseFloat(m.toFixed(2)));

      const maxM = Math.max(crashRef.current * 1.1, 4);
      const t = Math.min((m - 1) / (maxM - 1), 1);
      const cx = PAD_L + t * (PAD_R - PAD_L);
      const cy = PAD_B - Math.pow(t, 0.7) * (PAD_B - PAD_T);

      const pts = pointsRef.current;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(cx - last.x, cy - last.y) > 3) {
        pointsRef.current = [...pts.slice(-120), { x: cx, y: cy }];
      }

      if (canvas) drawFrame(canvas, pointsRef.current, m, "flying", 0);

      if (autoCash1Ref.current > 0 && betPlacedRef.current && !cashedOutRef.current && m >= autoCash1Ref.current) {
        setBalance((b) => b + betAmtRef.current * m);
        setCashedOut(true);
        cashedOutRef.current = true;
        setCashMult(parseFloat(m.toFixed(2)));
      }
      if (autoCash2Ref.current > 0 && betPlaced2Ref.current && !cashedOut2Ref.current && m >= autoCash2Ref.current) {
        setBalance((b) => b + betAmt2Ref.current * m);
        setCashedOut2(true);
        cashedOut2Ref.current = true;
        setCashMult2(parseFloat(m.toFixed(2)));
      }

      if (m >= crashRef.current) {
        phaseRef.current = "crashed";
        setCrashedMult(crashRef.current);
        setPhase("crashed");
        setHistory((h) => [crashRef.current, ...h].slice(0, 20));
        setAllBets(genBots());
        setBetPlaced(false);
        setBetPlaced2(false);
        setCashedOut(false);
        setCashedOut2(false);
        cashedOutRef.current = false;
        cashedOut2Ref.current = false;
        if (canvas) drawFrame(canvas, pointsRef.current, m, "crashed", 0);
        setTimeout(() => {
          phaseRef.current = "waiting";
          setPhase("waiting");
          setCountdown(5);
          pointsRef.current = [];
          if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }, 3000);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [setBalance]);

  useEffect(() => {
    if (phase !== "waiting") return;
    if (countdown <= 0) {
      startRound();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, startRound]);

  useEffect(() => {
    if (phase === "waiting" && canvasRef.current) {
      drawFrame(canvasRef.current, [], "1.00", "waiting", countdown);
    }
  }, [phase, countdown]);

  useEffect(() => () => { cancelAnimationFrame(animRef.current); }, []);

  const cashOut = (slot) => {
    if (phaseRef.current !== "flying") return;
    const m = multRef.current;
    if (slot === 1 && betPlacedRef.current && !cashedOutRef.current) {
      setBalance((b) => b + betAmtRef.current * m);
      setCashedOut(true);
      cashedOutRef.current = true;
      setCashMult(parseFloat(m.toFixed(2)));
    }
    if (slot === 2 && betPlaced2Ref.current && !cashedOut2Ref.current) {
      setBalance((b) => b + betAmt2Ref.current * m);
      setCashedOut2(true);
      cashedOut2Ref.current = true;
      setCashMult2(parseFloat(m.toFixed(2)));
    }
  };

  const BetPanel = ({
    slot, amt, setAmt, placed, setPlaced, cashed, cashM,
    autoCash, setAutoCash, tab, setTab,
  }) => {
    const canBet = !placed && phase === "waiting" && balance >= amt;
    const canCash = placed && !cashed && phase === "flying";
    const btnBg = canBet ? "#22C55E" : canCash ? "#EF4444" : cashed ? "#1a2a1a" : "#2A2A3A";
    const btnText = canBet ? `BET\n৳${amt}` : canCash ? `CASH OUT\n৳${(amt * mult).toFixed(2)}` : cashed ? `✓ ${cashM?.toFixed(2)}×` : "Waiting...";
    const glowColor = canBet ? "#22C55E44" : canCash ? "#EF444466" : "transparent";
    return (
      <div style={{ background: "#161622", borderRadius: 14, padding: "12px 10px 14px", border: "1px solid #ffffff0D", flex: 1 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button onClick={() => setTab("bet")} style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", background: tab === "bet" ? "#22C55E22" : "transparent", color: tab === "bet" ? "#22C55E" : "#444", fontWeight: 700, fontSize: 11, fontFamily: "'Poppins',sans-serif" }}>Bet</button>
          <button onClick={() => setTab("auto")} style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", background: tab === "auto" ? "#FFD60022" : "transparent", color: tab === "auto" ? "#FFD600" : "#444", fontWeight: 700, fontSize: 11, fontFamily: "'Poppins',sans-serif" }}>Auto</button>
        </div>
        {tab === "auto" ? (
          <div>
            <div style={{ color: "#888", fontSize: 11, marginBottom: 6, fontWeight: 600 }}>Auto Cash Out at ×</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <button onClick={() => setAutoCash((v) => Math.max(0, parseFloat((v - 0.1).toFixed(2))))} disabled={placed} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#2A2A3A", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>−</button>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#FFD600", flex: 1, textAlign: "center" }}>{autoCash > 0 ? autoCash.toFixed(2) + "×" : "Off"}</span>
              <button onClick={() => setAutoCash((v) => parseFloat((Math.max(1.1, v) + 0.1).toFixed(2)))} disabled={placed} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#2A2A3A", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
              {[1.5, 2, 5, 10].map((p) => (
                <button key={p} onClick={() => setAutoCash(p)} disabled={placed} style={{ padding: "5px 0", borderRadius: 7, border: "none", cursor: "pointer", background: autoCash === p ? "#FFD60033" : "#2A2A3A", color: autoCash === p ? "#FFD600" : "#888", fontSize: 11, fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>{p}×</button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#555", textAlign: "center", marginBottom: 8 }}>Will auto cash out when multiplier reaches target</div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <button onClick={() => setAmt((a) => Math.max(1, a - 1))} disabled={placed} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#2A2A3A", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>−</button>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", flex: 1, textAlign: "center" }}>{amt.toFixed(2)}</span>
              <button onClick={() => setAmt((a) => a + 1)} disabled={placed} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#2A2A3A", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
              {[1, 2, 5, 10].map((p) => (
                <button key={p} onClick={() => setAmt(p)} disabled={placed} style={{ padding: "5px 0", borderRadius: 7, border: "none", cursor: "pointer", background: "#2A2A3A", color: "#888", fontSize: 11, fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>{p}</button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => { if (canBet) setPlaced(true); else if (canCash) cashOut(slot); }}
          style={{ width: "100%", height: 58, borderRadius: 12, border: "none", cursor: "pointer", background: btnBg, color: "#fff", fontWeight: 800, fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-line", boxShadow: `0 4px 20px ${glowColor}`, fontFamily: "'Poppins',sans-serif", animation: canCash ? "multPulse 0.8s infinite" : "none" }}
        >
          {btnText}
        </button>
      </div>
    );
  };

  const displayMult = phase === "waiting" ? 1.0 : mult;
  const multColor = displayMult < 2 ? "#ffffff" : displayMult < 5 ? "#4ADE80" : displayMult < 10 ? "#38BDF8" : "#F472B6";

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#0D0D1A", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#0A0A12", padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #ffffff0D" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#aaa", fontSize: 22, cursor: "pointer" }}>‹</button>
        <span style={{ color: "#EF4444", fontWeight: 900, fontSize: 20, fontStyle: "italic", letterSpacing: 2, textShadow: "0 0 20px #EF444466", fontFamily: "'Orbitron',monospace" }}>AVIATOR</span>
        <div style={{ flex: 1 }} />
        <span style={{ background: "#22C55E22", borderRadius: 20, padding: "4px 12px", color: "#22C55E", fontWeight: 700, fontSize: 13 }}>৳{balance.toFixed(2)}</span>
      </div>

      <div style={{ display: "flex", gap: 5, padding: "7px 10px", overflowX: "auto", background: "#0A0A12", borderBottom: "1px solid #ffffff08", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#444", flexShrink: 0 }}>History:</span>
        {history.map((m, i) => (
          <div key={i} style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 16, fontSize: 11, fontWeight: 800, background: "#1A1A28", color: mc(m), border: `1px solid ${mc(m)}22` }}>{m}×</div>
        ))}
      </div>

      <div style={{ position: "relative", flexShrink: 0, margin: "8px 8px 0", borderRadius: 16, overflow: "hidden", border: "1px solid #ffffff0A" }}>
        <canvas ref={canvasRef} width={460} height={240} style={{ width: "100%", height: "auto", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}>
          {phase === "waiting" && (
            <>
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13, marginBottom: 4, fontWeight: 600 }}>Starting in</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 68, fontWeight: 900, color: "#FFD600", textShadow: "0 0 40px #FFD600", lineHeight: 1 }}>{countdown}</div>
              {(betPlaced || betPlaced2) && <div style={{ color: "#22C55E", fontSize: 13, marginTop: 8, fontWeight: 700 }}>✓ Bet placed — waiting for round</div>}
            </>
          )}
          {phase === "flying" && (
            <>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 58, fontWeight: 900, color: multColor, textShadow: `0 0 50px ${multColor}`, lineHeight: 1, animation: "multPulse 1s infinite" }}>{mult.toFixed(2)}×</div>
              {(cashedOut || cashedOut2) && (
                <div style={{ color: "#22C55E", fontSize: 13, marginTop: 8, fontWeight: 700, background: "rgba(0,0,0,.5)", padding: "4px 14px", borderRadius: 20 }}>
                  ✓ Cashed {[cashedOut && cashMult, cashedOut2 && cashMult2].filter(Boolean).join(", ")}×
                </div>
              )}
            </>
          )}
          {phase === "crashed" && (
            <div style={{ animation: "crashShake .5s ease" }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 44, fontWeight: 900, color: "#EF4444", textShadow: "0 0 40px #EF4444", lineHeight: 1, textAlign: "center" }}>FLEW AWAY!</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 26, color: "#FF6666", textAlign: "center", marginTop: 4 }}>{crashedMult}×</div>
            </div>
          )}
        </div>
        {phase === "flying" && (
          <div style={{ position: "absolute", bottom: 10, right: 12, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#fff", border: "1px solid #ffffff10" }}>
            <span>👥</span>
            <span style={{ fontWeight: 700, color: "#FFD600" }}>{Math.floor(mult * 1234 + 3200).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div style={{ padding: "8px 8px 6px", display: "flex", gap: 8 }}>
        <BetPanel slot={1} amt={betAmt} setAmt={setBetAmt} placed={betPlaced} setPlaced={setBetPlaced} cashed={cashedOut} cashM={cashMult} autoCash={autoCash1} setAutoCash={setAutoCash1} tab={betTab1} setTab={setBetTab1} />
        <BetPanel slot={2} amt={betAmt2} setAmt={setBetAmt2} placed={betPlaced2} setPlaced={setBetPlaced2} cashed={cashedOut2} cashM={cashMult2} autoCash={autoCash2} setAutoCash={setAutoCash2} tab={betTab2} setTab={setBetTab2} />
      </div>

      <div style={{ margin: "0 8px 8px", background: "#111120", borderRadius: 14, overflow: "hidden", border: "1px solid #ffffff08", flex: 1 }}>
        <div style={{ display: "flex", borderBottom: "1px solid #ffffff0A" }}>
          {["allbets", "mybets", "top"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "transparent", color: activeTab === t ? "#fff" : "#444", borderBottom: activeTab === t ? "2px solid #EF4444" : "2px solid transparent", fontFamily: "'Poppins',sans-serif" }}>
              {t === "allbets" ? "All Bets" : t === "mybets" ? "My Bets" : "Top"}
            </button>
          ))}
        </div>
        <div style={{ padding: "8px 10px 4px", overflowY: "auto", maxHeight: 200 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr .8fr 1.2fr", marginBottom: 6, padding: "0 4px" }}>
            {["Player", "Bet ৳", "×", "Won ৳"].map((h) => (
              <span key={h} style={{ fontSize: 10, color: "#444", fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          {allBets.map((b, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr .8fr 1.2fr", padding: "6px 4px", borderTop: "1px solid #ffffff05", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `hsl(${i * 37 + 20},55%,30%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{"🎭🎨🎯🎮🎲🃏🎪🎸🦊🦁"[i % 10]}</div>
                <span style={{ fontSize: 11, color: "#777" }}>{b.name}</span>
              </div>
              <span style={{ fontSize: 11, color: "#888" }}>{b.bet.toFixed(2)}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: b.flying ? "#333" : mc(b.x) }}>{b.flying ? "—" : b.x + "×"}</span>
              <span style={{ fontSize: 11, color: b.flying ? "#333" : "#bbb" }}>{b.flying ? "—" : b.won}</span>
            </div>
          ))}
          <div style={{ textAlign: "center", padding: "8px 0 4px", fontSize: 10, color: "#333" }}>🛡️ Provably Fair</div>
        </div>
      </div>
    </div>
  );
}

/* ── HOME ── */
const GAMES = [
  { id: "wingo", name: "Win Go", desc: "Guess Number · Green/Red/Violet", emoji: "🔮", bg: "linear-gradient(135deg,#EF5350,#FF8A80)" },
  { id: "aviator", name: "Aviator", desc: "Cash out before it flies away!", emoji: "✈️", bg: "linear-gradient(135deg,#0F0F2A,#3949AB)" },
  { id: "k3", name: "K3", desc: "Guess Number · Big/Small/Odd/Even", emoji: "🎲", bg: "linear-gradient(135deg,#F97316,#FBBF24)", soon: true },
  { id: "5d", name: "5D", desc: "Guess Number · Big/Small/Odd/Even", emoji: "🎯", bg: "linear-gradient(135deg,#22C55E,#16A34A)", soon: true },
  { id: "trx", name: "Trx Win", desc: "Guess Number · Green/Red/Violet", emoji: "💎", bg: "linear-gradient(135deg,#7C3AED,#A855F7)", soon: true },
  { id: "trading", name: "FX Trader", desc: "Trade USD/JPY · EUR/USD · GBP/USD · XAU/USD", emoji: "📈", bg: "linear-gradient(135deg,#0F2027,#203A43,#2C5364)" },
];

function HomeScreen({ user, balance, onSelectGame, onGoProfile, onGoWallet }) {
  const [activeNav, setActiveNav] = useState("home");
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 80 }}>
      <div style={{ background: gradient, padding: "16px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>
            <span style={{ fontStyle: "italic", color: "#FFE082" }}>H</span>GNICE
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 20, padding: "5px 12px", color: "#fff", fontWeight: 700, fontSize: 13 }}>৳{balance.toFixed(2)}</div>
            <div onClick={onGoProfile} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20 }}>🎮</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 16, padding: "16px", backdropFilter: "blur(10px)" }}>
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, marginBottom: 2 }}>Total Balance</div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 900, marginBottom: 12 }}>৳{balance.toFixed(2)}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onGoWallet} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "rgba(255,255,255,.25)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>+ Deposit</button>
            <button onClick={onGoWallet} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.5)", background: "transparent", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>↓ Withdraw</button>
          </div>
        </div>
      </div>
      <div style={{ padding: "18px 14px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 4, height: 20, background: G.red, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 16, color: G.text }}>Lottery</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GAMES.map((g) => (
            <div key={g.id} onClick={() => !g.soon && onSelectGame(g.id)} style={{ background: g.bg, borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: g.soon ? "default" : "pointer", boxShadow: "0 4px 16px #0002", transition: "transform .15s" }}
              onMouseEnter={(e) => { if (!g.soon) e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{g.name}</div>
                <div style={{ color: "rgba(255,255,255,.8)", fontSize: 12, marginTop: 2 }}>{g.desc}</div>
                {g.soon && <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11, marginTop: 4, background: "rgba(0,0,0,.2)", display: "inline-block", padding: "2px 8px", borderRadius: 10 }}>Coming soon</div>}
              </div>
              <div style={{ fontSize: 44 }}>{g.emoji}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #f0f0f0", display: "flex", zIndex: 100 }}>
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "activity", icon: "🎁", label: "Activity" },
          { id: "promo", icon: "💎", label: "Promo" },
          { id: "wallet", icon: "👛", label: "Wallet" },
          { id: "account", icon: "👤", label: "Account" },
        ].map((n) => (
          <button key={n.id} onClick={() => { setActiveNav(n.id); if (n.id === "wallet") onGoWallet(); if (n.id === "account") onGoProfile(); }} style={{ flex: 1, padding: "10px 0 6px", border: "none", background: "transparent", cursor: "pointer", color: activeNav === n.id ? G.red : "#aaa", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "'Poppins',sans-serif" }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── PROFILE ── */
const AVATARS = ["🎮","🦊","🐉","🎯","🦁","🤖","👾","🎪","🦸","🧙","🐺","🦅","🐯","🦄","🎭","🎨"];
function ProfileScreen({ user, balance, accounts, onBack }) {
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const username = (user?.contact?.includes("@") ? user.contact.split("@")[0] : user?.contact) || "Member";
  const uidNum = useRef(Math.floor(100000 + Math.random() * 900000)).current;
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 20 }}>
      <div style={{ background: gradient, padding: "0 0 32px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 20px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>‹</button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, flex: 1, textAlign: "center" }}>My Account</span>
          <div style={{ width: 30 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 20px" }}>
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowAvatarPicker(true)} style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, border: "3px solid rgba(255,255,255,.6)", cursor: "pointer" }}>{AVATARS[avatarIdx]}</div>
            <div onClick={() => setShowAvatarPicker(true)} style={{ position: "absolute", bottom: -1, right: -1, width: 22, height: 22, borderRadius: "50%", background: "#FFE082", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#333" }}>✎</div>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              {username.toUpperCase()}
              <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>⭐ VIP0</span>
            </div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "2px 10px", fontSize: 11 }}>UID | {uidNum}</span>
              <span style={{ cursor: "pointer" }}>📋</span>
            </div>
            <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11, marginTop: 4 }}>{user?.method === "mobile" ? "📱" : "📧"} {user?.contact}</div>
          </div>
        </div>
      </div>
      {showAvatarPicker && (
        <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 400, display: "flex", alignItems: "flex-end" }} onClick={() => setShowAvatarPicker(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: "#1A1A2E", borderRadius: "20px 20px 0 0", padding: 20, animation: "slideUp .3s ease" }}>
            <div style={{ color: "#fff", fontWeight: 700, marginBottom: 14, textAlign: "center" }}>Choose Avatar</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 10 }}>
              {AVATARS.map((a, i) => (
                <div key={i} onClick={() => { setAvatarIdx(i); setShowAvatarPicker(false); }} style={{ width: 40, height: 40, borderRadius: "50%", background: avatarIdx === i ? "#EF5350" : "#2A2A40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer", border: avatarIdx === i ? "2px solid #fff" : "2px solid transparent" }}>{a}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ background: "#fff", margin: "0 14px", marginTop: -16, borderRadius: 16, padding: "16px", boxShadow: "0 4px 20px #0001", position: "relative", zIndex: 10 }}>
        <div style={{ color: G.sub, fontSize: 12, marginBottom: 4 }}>Total balance</div>
        <div style={{ fontWeight: 900, fontSize: 26, color: G.text }}>৳{balance.toFixed(2)}</div>
        <div style={{ display: "flex", gap: 0, marginTop: 14, justifyContent: "space-around" }}>
          {[{ icon: "💳", label: "Wallet" }, { icon: "📥", label: "Deposit" }, { icon: "📤", label: "Withdraw" }, { icon: "👑", label: "VIP" }].map((a) => (
            <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{a.icon}</div>
              <span style={{ fontSize: 11, color: G.sub, fontWeight: 600 }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 14px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[
            { icon: "📊", label: "Game History", sub: "My game records", bg: "#EEF4FF" },
            { icon: "💱", label: "Transaction", sub: "Transfer history", bg: "#EDFFF5" },
            { icon: "📥", label: "Deposit", sub: "Deposit history", bg: "#FFF0F0" },
            { icon: "📤", label: "Withdraw", sub: "Withdrawal history", bg: "#FFF8E1" },
          ].map((item) => (
            <div key={item.label} style={{ background: "#fff", borderRadius: 14, padding: "14px", cursor: "pointer", boxShadow: "0 2px 8px #0001", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: G.sub }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px #0001", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>💳 Payment Accounts</div>
          <div style={{ background: "#FFF8E1", borderRadius: 10, padding: "12px", marginBottom: 8, border: "1px solid #FFE082" }}>
            <div style={{ fontSize: 11, color: "#E65100", fontWeight: 600, marginBottom: 4 }}>Main Account (permanent)</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: G.text }}>{accounts?.main || "Not configured"}</div>
          </div>
          {accounts?.extras?.filter(Boolean).map((e, i) => (
            <div key={i} style={{ background: "#f5f5f5", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 2 }}>Withdrawal #{i + 2}</div>
              <div style={{ fontWeight: 600, color: G.text }}>{e}</div>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: "#FFF0F0", color: "#EF5350", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>🚪 Log Out</button>
      </div>
    </div>
  );
}

/* ── WALLET ── */
function WalletScreen({ balance, setBalance, accounts, onBack }) {
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState("");
  const presets = [100, 200, 500, 1000, 2000, 5000];
  const doDeposit = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    setBalance((b) => b + a);
    setDone(`✅ Deposited ৳${a.toFixed(2)} successfully!`);
    setAmount("");
    setTimeout(() => setDone(""), 3000);
  };
  const doWithdraw = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0 || a > balance) return;
    setBalance((b) => b - a);
    setDone(`✅ Withdrawal of ৳${a.toFixed(2)} requested!`);
    setAmount("");
    setTimeout(() => setDone(""), 3000);
  };
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ background: gradient, padding: "0 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 20px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>‹</button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, flex: 1, textAlign: "center" }}>Wallet</span>
          <div style={{ width: 30 }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>Total Balance</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginTop: 4 }}>৳{balance.toFixed(2)}</div>
        </div>
      </div>
      <div style={{ padding: "16px 14px" }}>
        <div style={{ display: "flex", background: "#fff", borderRadius: 14, padding: 4, gap: 4, marginBottom: 20, boxShadow: "0 2px 8px #0001" }}>
          {["deposit", "withdraw"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setDone(""); setAmount(""); }} style={{ flex: 1, padding: "11px 0", borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: tab === t ? gradient : "transparent", color: tab === t ? "#fff" : "#aaa", fontFamily: "'Poppins',sans-serif" }}>
              {t === "deposit" ? "📥 Deposit" : "📤 Withdraw"}
            </button>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 2px 8px #0001", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: G.sub, marginBottom: 10, fontWeight: 600 }}>Amount (৳)</div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount..." style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #eee", fontSize: 16, fontFamily: "'Poppins',sans-serif", marginBottom: 14, color: G.text, outline: "none" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
            {presets.map((p) => (
              <button key={p} onClick={() => setAmount(p.toString())} style={{ padding: "10px 0", borderRadius: 10, border: "1.5px solid #EF5350", background: amount == p ? "#EF5350" : "#fff", color: amount == p ? "#fff" : "#EF5350", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>৳{p}</button>
            ))}
          </div>
          {tab === "withdraw" && accounts && (
            <div style={{ background: "#f5f5f5", borderRadius: 10, padding: "12px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: G.sub, marginBottom: 6, fontWeight: 600 }}>Withdrawal account</div>
              <div style={{ fontWeight: 700, color: G.text }}>{accounts.main}</div>
            </div>
          )}
          {done && <div style={{ background: "#E8F5E9", borderRadius: 10, padding: "12px", marginBottom: 14, color: "#2E7D32", fontWeight: 600, fontSize: 13 }}>{done}</div>}
          <button onClick={tab === "deposit" ? doDeposit : doWithdraw} style={{ width: "100%", padding: "15px 0", borderRadius: 12, border: "none", background: gradient, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 6px 20px #EF535044" }}>
            {tab === "deposit" ? "Deposit Now" : "Request Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SUPPORT CHAT ── */
const QUICK = ["How to deposit?","Withdrawal issue","Account help","Bonus info","Check balance"];
const AUTO_REPLIES = [
  "Thanks for reaching out! Our team will assist you shortly. 😊",
  "I understand your concern. Let me check that for you.",
  "Please provide your UID and we'll resolve this quickly!",
  "Your issue has been noted. Expected resolution: 24 hours.",
  "Is there anything else I can help you with today?",
];
function SupportChat({ onClose, user }) {
  const [messages, setMessages] = useState([{ from: "support", text: "👋 Welcome to HGNICE Support! How can I help you today?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  const send = (text) => {
    const t = text || input.trim();
    if (!t) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { from: "user", text: t, time }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "support", text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1400 + Math.random() * 800);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", background: "#fff" }}>
      <div style={{ background: "#075E54", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", fontSize: 22, cursor: "pointer" }}>‹</button>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#128C7E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎧</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>HGNICE Support</div>
          <div style={{ color: "#B2DFDB", fontSize: 11 }}>{typing ? "typing..." : "🟢 Online"}</div>
        </div>
        <span style={{ color: "rgba(255,255,255,.7)", fontSize: 20, cursor: "pointer" }}>📞</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: "#E5DDD5", padding: "10px 10px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <span style={{ background: "rgba(255,255,255,.85)", borderRadius: 12, padding: "4px 14px", fontSize: 11, color: "#666" }}>TODAY</span>
        </div>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", animation: "msgIn .18s ease" }}>
            {msg.from === "support" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#128C7E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 6, marginTop: "auto" }}>🎧</div>}
            <div style={{ maxWidth: "76%", background: msg.from === "user" ? "#DCF8C6" : "#fff", borderRadius: msg.from === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding: "9px 12px 6px", boxShadow: "0 1px 3px #0001" }}>
              {msg.from === "support" && <div style={{ fontSize: 11, color: "#075E54", fontWeight: 700, marginBottom: 2 }}>Support Agent</div>}
              <div style={{ fontSize: 14, color: "#1A1A2E", lineHeight: 1.5, wordBreak: "break-word" }}>{msg.text}</div>
              <div style={{ fontSize: 10, color: "#999", textAlign: "right", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                {msg.time}
                {msg.from === "user" && <span style={{ color: "#34B7F1", fontSize: 12 }}>✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 6, alignItems: "flex-end" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#128C7E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎧</div>
            <div style={{ background: "#fff", borderRadius: "4px 16px 16px 16px", padding: "12px 16px", boxShadow: "0 1px 3px #0001", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#aaa", animation: `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ background: "#F0F0F0", padding: "8px 10px 4px", display: "flex", gap: 6, overflowX: "auto", borderTop: "1px solid #ddd", flexShrink: 0 }}>
        {QUICK.map((q, i) => <button key={i} onClick={() => send(q)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, border: "1px solid #128C7E", background: "#fff", color: "#075E54", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Poppins',sans-serif" }}>{q}</button>)}
      </div>
      <div style={{ background: "#F0F0F0", padding: "8px 10px 12px", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 24, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 1px 4px #0001" }}>
          <span style={{ fontSize: 20, cursor: "pointer" }}>😊</span>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Type your message..." style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", fontFamily: "'Poppins',sans-serif", color: "#1A1A2E" }} />
        </div>
        <button onClick={() => (input.trim() ? send() : null)} style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: "#128C7E", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 2px 10px #128C7E55", flexShrink: 0 }}>
          {input.trim() ? "➤" : "🎤"}
        </button>
      </div>
    </div>
  );
}

/* ── TRADING SIMULATOR ── */
const CANDLE_DURATION = 30;
const ENTRY_WINDOW    = 10;

const TRADE_MARKETS = [
  { id:"USDJPY", label:"USD/JPY", base:154.5,  vol:0.00035, decimals:2, prefix:"" },
  { id:"EURUSD", label:"EUR/USD", base:1.0845,  vol:0.00018, decimals:4, prefix:"" },
  { id:"GBPUSD", label:"GBP/USD", base:1.2710,  vol:0.00022, decimals:4, prefix:"" },
  { id:"XAUUSD", label:"XAU/USD", base:2345.0,  vol:0.00025, decimals:1, prefix:"$" },
  { id:"BTCUSD", label:"BTC/USD", base:43250.0, vol:0.0013,  decimals:2, prefix:"$" },
];

const AudioEngine = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const tone = (freq, type, dur, vol, delay) => {
    vol   = vol   || 0.18;
    delay = delay || 0;
    const c = getCtx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  };
  return {
    tradeEntry: function(dir) {
      if (dir === "UP") { tone(660,"sine",0.08,0.14); tone(880,"sine",0.12,0.10,0.06); tone(1100,"sine",0.10,0.08,0.12); }
      else              { tone(440,"sine",0.08,0.14); tone(330,"sine",0.12,0.10,0.06); tone(220,"sine",0.10,0.08,0.12); }
    },
    win:     function() { tone(660,"sine",0.15,0.14); tone(880,"sine",0.15,0.12,0.1); tone(1100,"sine",0.20,0.10,0.2); tone(1320,"sine",0.18,0.08,0.35); },
    loss:    function() { tone(330,"sine",0.15,0.14); tone(220,"sine",0.15,0.12,0.12); tone(165,"triangle",0.18,0.10,0.25); },
    uiClick: function() { tone(800,"sine",0.05,0.07); },
  };
})();

const GlobalMarkets = (function() {
  const stores = {};
  const intervals = { price: null, timer: null };
  const listeners = [];
  let initialized = false;

  function seedMarket(m) {
    let p = m.base * (0.99 + Math.random() * 0.02);
    const candles = [];
    for (let i = 0; i < 80; i++) {
      const move = (Math.random() - 0.5) * 2 * p * m.vol * 0.8;
      const o = p, c = p + move;
      const hi = Math.max(o, c) + Math.abs(move) * Math.random() * 0.4;
      const lo = Math.min(o, c) - Math.abs(move) * Math.random() * 0.4;
      candles.push({ o, c, hi, lo, closed: true });
      p = c;
    }
    candles.push({ o: p, c: p, hi: p, lo: p, closed: false });
    stores[m.id] = { candles, live: p, openRef: p, timeLeft: CANDLE_DURATION, resolved: false };
  }

  function notify() { listeners.forEach(function(fn) { fn(); }); }

  function init() {
    if (initialized) return;
    initialized = true;
    TRADE_MARKETS.forEach(function(m) { seedMarket(m); });

    intervals.price = setInterval(function() {
      TRADE_MARKETS.forEach(function(m) {
        const s    = stores[m.id];
        const prev = s.live;
        const rev  = (m.base - prev) / m.base * 0.0002;
        const move = (Math.random() - 0.488 + rev) * prev * m.vol * 0.18;
        const next = Math.max(prev + move, m.base * 0.5);
        s.live = next;
        const last = s.candles[s.candles.length - 1];
        if (last) { last.c = next; last.hi = Math.max(last.hi, next); last.lo = Math.min(last.lo, next); }
      });
      notify();
    }, 280);

    intervals.timer = setInterval(function() {
      TRADE_MARKETS.forEach(function(m) {
        const s = stores[m.id];
        s.timeLeft--;
        if (s.timeLeft <= 0) {
          const last = s.candles[s.candles.length - 1];
          if (last) last.closed = true;
          const cl = s.live;
          s.candles.push({ o: cl, c: cl, hi: cl, lo: cl, closed: false });
          if (s.candles.length > 120) s.candles.shift();
          s.openRef  = cl;
          s.timeLeft = CANDLE_DURATION;
          s.resolved = false;
        }
      });
      notify();
    }, 1000);
  }

  function getStore(id) { return stores[id]; }

  function subscribe(fn) {
    listeners.push(fn);
    return function() {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  return { init, getStore, subscribe };
})();

function TradingLoader({ onDone }) {
  const canvasRef = useRef(null);
  const onDoneRef = useRef(onDone);
  useEffect(function() { onDoneRef.current = onDone; }, [onDone]);

  useEffect(function() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 400, H = 650;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const startTime = Date.now();
    let raf;

    const pts = [];
    let py = 180, px = 0;
    while (px < W - 20) {
      py += (Math.random() - 0.46) * 14;
      py  = Math.max(80, Math.min(260, py));
      pts.push({ x: px, y: py });
      px += 5 + Math.random() * 5;
    }

    const draw = function() {
      const elapsed  = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / 2.0, 1);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, 220);
      grd.addColorStop(0, "rgba(0,180,100," + (0.08 + 0.04 * Math.sin(elapsed * 1.4)) + ")");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      const drawCount = Math.floor(progress * pts.length);
      if (drawCount > 1) {
        const slice = pts.slice(0, drawCount);
        const ox = 10, oy = 120;

        ctx.save();
        ctx.shadowColor = "#00cc88";
        ctx.shadowBlur  = 20;
        ctx.beginPath();
        slice.forEach(function(p, i) { i === 0 ? ctx.moveTo(ox+p.x, oy+p.y) : ctx.lineTo(ox+p.x, oy+p.y); });
        ctx.strokeStyle = "#00cc88";
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = "round";
        ctx.lineCap     = "round";
        ctx.stroke();
        ctx.restore();

        const ep = slice[slice.length - 1];
        ctx.save();
        ctx.beginPath();
        slice.forEach(function(p, i) { i === 0 ? ctx.moveTo(ox+p.x, oy+p.y) : ctx.lineTo(ox+p.x, oy+p.y); });
        ctx.lineTo(ox + ep.x, oy + 280);
        ctx.lineTo(ox, oy + 280);
        ctx.closePath();
        const fill = ctx.createLinearGradient(0, oy, 0, oy + 280);
        fill.addColorStop(0, "rgba(0,200,136,0.22)");
        fill.addColorStop(1, "rgba(0,200,136,0)");
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = "#00cc88";
        ctx.shadowBlur  = 24;
        ctx.beginPath();
        ctx.arc(ox + ep.x, oy + ep.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#00cc88";
        ctx.fill();
        ctx.restore();
      }

      const candleData = [36,22,48,30,52,18,42,34,50,26];
      candleData.forEach(function(h, i) {
        const bull  = i % 2 === 0;
        const alpha = Math.min(progress * 2 - i * 0.1, 1);
        if (alpha <= 0) return;
        const cx = 30 + i * 36;
        const cy = H - 80;
        ctx.globalAlpha = alpha * 0.45;
        ctx.fillStyle   = bull ? "#00cc88" : "#ff3355";
        ctx.fillRect(cx - 1, cy - h * 0.35, 2, h * 0.35);
        ctx.fillRect(cx - 6, cy - h, 12, h);
        ctx.fillRect(cx - 1, cy, 2, h * 0.2);
        ctx.globalAlpha = 1;
      });

      const titleAlpha = Math.min(progress * 2.5, 1);
      ctx.save();
      ctx.globalAlpha = titleAlpha;
      ctx.font        = "bold 30px monospace";
      ctx.textAlign   = "center";
      ctx.fillStyle   = "#00cc88";
      ctx.shadowColor = "#00cc88";
      ctx.shadowBlur  = 28;
      ctx.fillText("FX TRADER", W / 2, H * 0.14);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(Math.max(progress * 3 - 0.8, 0), 1);
      ctx.font        = "11px monospace";
      ctx.textAlign   = "center";
      ctx.fillStyle   = "rgba(0,200,136,0.5)";
      ctx.shadowBlur  = 0;
      ctx.fillText("HGNICE TRADING PLATFORM", W / 2, H * 0.21);
      ctx.restore();

      const bW = 240, bX = (W - bW) / 2, bY = H * 0.87;
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(bX, bY, bW, 3);
      ctx.save();
      ctx.shadowColor = "#00cc88";
      ctx.shadowBlur  = 10;
      ctx.fillStyle   = "#00cc88";
      ctx.fillRect(bX, bY, bW * progress, 3);
      ctx.restore();

      const dotCount = Math.floor(elapsed * 2) % 4;
      ctx.globalAlpha = 0.5;
      ctx.font        = "11px monospace";
      ctx.textAlign   = "center";
      ctx.fillStyle   = "#6a6a8a";
      ctx.fillText("Loading market data" + "...".slice(0, dotCount), W / 2, H * 0.93);
      ctx.globalAlpha = 1;

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        setTimeout(function() { onDoneRef.current && onDoneRef.current(); }, 250);
      }
    };

    raf = requestAnimationFrame(draw);
    return function() { cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"#050508", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <canvas ref={canvasRef} style={{ width:"100%", maxWidth:400, height:"auto", display:"block" }} />
    </div>
  );
}

function TradeChart({ store, activeTrades, market, chartOffset, onOffsetChange }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const isDrag    = useRef(false);
  const dragX     = useRef(0);
  const dragOff   = useRef(0);

  const draw = useCallback(function() {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 360, H = 210;
    if (canvas.width !== W*dpr || canvas.height !== H*dpr) {
      canvas.width = W*dpr; canvas.height = H*dpr;
      canvas.style.width = W+"px"; canvas.style.height = H+"px";
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#07070e"; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.028)"; ctx.lineWidth = 1;
    for (let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(0,H/5*i);ctx.lineTo(W,H/5*i);ctx.stroke();}
    for (let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(W/7*i,0);ctx.lineTo(W/7*i,H);ctx.stroke();}

    const allCdls = store.current.candles;
    if (!allCdls || allCdls.length < 2) return;
    const VISIBLE=44, total=allCdls.length;
    const maxOff = Math.max(0, total-VISIBLE);
    const off    = Math.min(Math.max(chartOffset,0), maxOff);
    const startI = Math.max(0, total-VISIBLE-off), endI = total-off;
    const disp   = allCdls.slice(startI, endI);
    if (disp.length < 2) return;

    const prices = disp.flatMap(function(c){return[c.hi,c.lo];});
    let minP = Math.min.apply(null,prices), maxP = Math.max.apply(null,prices);
    const pad = (maxP-minP)*0.08; minP-=pad; maxP+=pad;
    const range=maxP-minP||1, PADT=10, PADB=22, PADL=2, PADR=52;
    const cW = (W-PADL-PADR)/disp.length;
    const toY = function(p){ return PADT+((maxP-p)/range)*(H-PADT-PADB); };
    const m = market;

    ctx.font="bold 9px monospace"; ctx.fillStyle="rgba(255,255,255,0.22)"; ctx.textAlign="right";
    for (let i=0;i<=4;i++){const v=minP+(range*(4-i)/4);ctx.fillText(v.toFixed(m.decimals),W-2,toY(v)+3);}
    ctx.textAlign="left";

    disp.forEach(function(c,i){
      const x=PADL+i*cW, xc=x+cW*0.5, bull=c.c>=c.o;
      const isLive = !c.closed && off===0 && i===disp.length-1;
      const col = bull?"#00e878":"#ff3355";
      const bodyY=Math.min(toY(c.o),toY(c.c)), bodyH=Math.max(Math.abs(toY(c.o)-toY(c.c)),1.5), bW=Math.max(cW*0.7,2);
      ctx.strokeStyle=col+(isLive?"cc":"55"); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(xc,toY(c.hi)); ctx.lineTo(xc,toY(c.lo)); ctx.stroke();
      if(isLive){ctx.save();ctx.shadowColor=col;ctx.shadowBlur=10;}
      ctx.fillStyle=col+(isLive?"ff":"99");
      ctx.fillRect(x+cW*0.15,bodyY,bW,bodyH);
      if(isLive)ctx.restore();
    });

    activeTrades.forEach(function(trade){
      if(trade.entry<minP||trade.entry>maxP)return;
      const ey=toY(trade.entry);
      ctx.save(); ctx.shadowColor=trade.dir==="UP"?"#00cc88":"#ff3355"; ctx.shadowBlur=6;
      ctx.setLineDash([3,5]); ctx.strokeStyle=trade.dir==="UP"?"rgba(0,200,136,0.7)":"rgba(255,51,85,0.7)"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(PADL,ey); ctx.lineTo(W-PADR,ey); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      ctx.font="bold 9px monospace"; ctx.fillStyle=trade.dir==="UP"?"#00cc88":"#ff3355";
      ctx.fillText((trade.dir==="UP"?"▲":"▼")+" "+m.prefix+trade.entry.toFixed(m.decimals),PADL+4,ey-3);
    });

    if(off===0){
      const lp=store.current.live, cy=toY(lp);
      const up=lp>=store.current.openRef, lc=up?"#00cc88":"#ff3355";
      ctx.save(); ctx.shadowColor=lc; ctx.shadowBlur=6;
      ctx.setLineDash([2,4]); ctx.strokeStyle=lc+"55"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(PADL,cy); ctx.lineTo(W-PADR,cy); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      const priceStr=m.prefix+lp.toFixed(m.decimals), pw=priceStr.length*6.5+10;
      ctx.fillStyle=lc;
      if(ctx.roundRect){ctx.beginPath();ctx.roundRect(W-PADR+2,cy-8,pw,16,4);ctx.fill();}
      else{ctx.fillRect(W-PADR+2,cy-8,pw,16);}
      ctx.fillStyle="#000"; ctx.font="bold 9px monospace"; ctx.textAlign="left";
      ctx.fillText(priceStr,W-PADR+6,cy+3);
    }

    if(off>0){ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="10px sans-serif";ctx.textAlign="right";ctx.fillText("← "+off+" candles back",W-PADR-4,H-5);}
    if(off===0){ctx.fillStyle="rgba(255,255,255,0.1)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("← drag to pan history",W/2,H-4);}
  }, [store, activeTrades, market, chartOffset]);

  useEffect(function(){
    let running=true;
    const loop=function(){ if(!running)return; draw(); rafRef.current=requestAnimationFrame(loop); };
    rafRef.current=requestAnimationFrame(loop);
    return function(){ running=false; cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  const onDown = function(e){ isDrag.current=true; dragX.current=e.clientX||(e.touches&&e.touches[0].clientX)||0; dragOff.current=chartOffset; };
  const onMove = function(e){
    if(!isDrag.current)return;
    const cx=(e.clientX||(e.touches&&e.touches[0].clientX)||0);
    const dx=dragX.current-cx, max=Math.max(0,store.current.candles.length-44);
    onOffsetChange(Math.min(Math.max(Math.round(dragOff.current+dx/9),0),max));
  };
  const onUp = function(){ isDrag.current=false; };

  return (
    <div style={{ background:"#07070e", position:"relative", flexShrink:0, cursor:"grab", userSelect:"none" }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={function(e){onDown(e.touches[0]);}} onTouchMove={function(e){onMove(e.touches[0]);}} onTouchEnd={onUp}>
      <canvas ref={canvasRef} style={{ width:"100%", height:210, display:"block" }} />
    </div>
  );
}

function EntryRing({ timeLeft, total, entryWindow }) {
  total       = total       || CANDLE_DURATION;
  entryWindow = entryWindow || ENTRY_WINDOW;
  const canvasRef = useRef(null);
  const inWindow  = timeLeft > total - entryWindow;
  const windowPct = inWindow ? (timeLeft-(total-entryWindow))/entryWindow : 0;
  const totalPct  = timeLeft/total;

  useEffect(function(){
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const S=56,R=22,cx=S/2,cy=S/2;
    canvas.width=canvas.height=S;
    ctx.clearRect(0,0,S,S);
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=3; ctx.stroke();
    const tAngle=-Math.PI/2+totalPct*Math.PI*2;
    ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2,tAngle);
    ctx.strokeStyle=timeLeft>5?"rgba(255,255,255,0.15)":"rgba(255,51,85,0.3)"; ctx.lineWidth=3; ctx.stroke();
    if(inWindow&&windowPct>0){
      ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+windowPct*Math.PI*2);
      ctx.shadowColor="#00cc88"; ctx.shadowBlur=10;
      ctx.strokeStyle="#00cc88"; ctx.lineWidth=3; ctx.stroke(); ctx.shadowBlur=0;
    }
    ctx.font="bold 13px monospace"; ctx.textAlign="center";
    ctx.fillStyle=inWindow?"#00cc88":timeLeft<=5?"#ff3355":"rgba(255,255,255,0.6)";
    ctx.fillText(timeLeft+"s",cx,cy+5);
  }, [timeLeft,inWindow,windowPct,totalPct]);

  return <canvas ref={canvasRef} style={{ width:56, height:56, display:"block" }} />;
}

function PositionCard({ trade, livePrice, market }) {
  const up   = livePrice > trade.entry;
  const won  = (trade.dir==="UP")===up;
  const pnl  = won ? trade.amt*0.92 : -trade.amt;
  const col  = pnl>=0?"#00cc88":"#ff3355";
  return (
    <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid "+(pnl>=0?"rgba(0,200,136,0.18)":"rgba(255,51,85,0.18)"),borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,backdropFilter:"blur(6px)"}}>
      <div style={{width:34,height:34,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,background:trade.dir==="UP"?"rgba(0,200,136,0.12)":"rgba(255,51,85,0.12)",color:trade.dir==="UP"?"#00cc88":"#ff3355"}}>
        {trade.dir==="UP"?"▲":"▼"}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:"#e8e8ff"}}>{market.label}</div>
        <div style={{fontSize:10,color:"#5a5a7a",marginTop:1}}>Entry: {market.prefix}{trade.entry.toFixed(market.decimals)}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:14,fontWeight:900,fontFamily:"monospace",color:col,transition:"color 0.2s"}}>{pnl>=0?"+":""}{pnl.toFixed(2)}$</div>
        <div style={{fontSize:10,color:"#5a5a7a",marginTop:2}}>৳{trade.amt.toFixed(2)}</div>
      </div>
    </div>
  );
}

function TradingGame({ balance, setBalance, onBack }) {
  const [loading,      setLoading]      = useState(true);
  const [marketIdx,    setMarketIdx]    = useState(0);
  const [livePrice,    setLivePrice]    = useState(0);
  const [openRef,      setOpenRef]      = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(CANDLE_DURATION);
  const [betAmt,       setBetAmt]       = useState(10);
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [resultInfo,   setResultInfo]   = useState(null);
  const [activeTab,    setActiveTab]    = useState("trade");
  const [chartOffset,  setChartOffset]  = useState(0);
  const [soundOn,      setSoundOn]      = useState(true);
  const [stats, setStats] = useState({ trades:0, wins:0, losses:0, profit:0, totalLoss:0, streak:0, bestStreak:0, pnlCurve:[] });

  const market     = TRADE_MARKETS[marketIdx];
  const entryOpen  = timeLeft > CANDLE_DURATION - ENTRY_WINDOW;
  const pct        = openRef ? ((livePrice - openRef) / openRef * 100) : 0;
  const timerCol   = timeLeft > 10 ? "#00cc88" : timeLeft > 5 ? "#ffd700" : "#ff3355";

  const activeTradesRef = useRef([]);
  const tradeSeq        = useRef(0);
  const soundRef        = useRef(true);
  const marketIdxRef    = useRef(0);
  const resolvedRef     = useRef(false);
  const pnlCanvasRef    = useRef(null);

  const storeRef = useRef(null);
  storeRef.current = GlobalMarkets.getStore(market.id) || { candles:[], live:0, openRef:0 };

  useEffect(function(){ activeTradesRef.current = activeTrades; }, [activeTrades]);
  useEffect(function(){ soundRef.current = soundOn; }, [soundOn]);
  useEffect(function(){ marketIdxRef.current = marketIdx; }, [marketIdx]);

  useEffect(function() {
    GlobalMarkets.init();
    const unsub = GlobalMarkets.subscribe(function() {
      const idx = marketIdxRef.current;
      const m   = TRADE_MARKETS[idx];
      const s   = GlobalMarkets.getStore(m.id);
      if (!s) return;
      setLivePrice(s.live);
      setOpenRef(s.openRef);
      setTimeLeft(s.timeLeft);

      if (s.timeLeft === CANDLE_DURATION && !resolvedRef.current && activeTradesRef.current.length > 0) {
        resolvedRef.current = true;
        resolveTrades(s, m);
        setTimeout(function() { resolvedRef.current = false; }, 500);
      }
    });
    const s0 = GlobalMarkets.getStore(TRADE_MARKETS[0].id);
    if (s0) { setLivePrice(s0.live); setOpenRef(s0.openRef); setTimeLeft(s0.timeLeft); }
    return unsub;
  }, []); // eslint-disable-line

  const sound = useCallback(function(name) {
    if (!soundRef.current) return;
    if (AudioEngine[name]) AudioEngine[name]();
  }, []);

  function resolveTrades(s, m) {
    const trades = activeTradesRef.current;
    if (!trades.length) return;
    const closePrice = s.live;
    const openPrice  = s.openRef;
    const outcomeUp  = closePrice >= openPrice;
    const mLabel     = m.label;
    const now        = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    const resolved   = [];

    trades.forEach(function(t) {
      const won = (t.dir==="UP") === outcomeUp;
      const pnl = won ? t.amt * 0.92 : -t.amt;
      setBalance(function(b){ return Math.max(0, b + pnl); });
      resolved.push({ id:t.id, dir:t.dir, entry:t.entry, amt:t.amt, won, pnl, close:closePrice, market:mLabel, time:now });
    });

    setStats(function(prev) {
      const newWins  = prev.wins   + resolved.filter(function(r){return r.won;}).length;
      const newLoss  = prev.losses + resolved.filter(function(r){return !r.won;}).length;
      const newProfit= prev.profit + resolved.filter(function(r){return r.won;}).reduce(function(a,r){return a+r.pnl;},0);
      const newTLoss = prev.totalLoss + resolved.filter(function(r){return !r.won;}).reduce(function(a,r){return a+Math.abs(r.pnl);},0);
      const streak   = resolved.every(function(r){return r.won;}) ? prev.streak+1 : 0;
      return { ...prev, trades:prev.trades+resolved.length, wins:newWins, losses:newLoss, profit:newProfit, totalLoss:newTLoss, streak, bestStreak:Math.max(prev.bestStreak,streak), pnlCurve:[...prev.pnlCurve, newProfit-newTLoss] };
    });

    setTradeHistory(function(h){ return resolved.concat(h).slice(0,100); });
    setActiveTrades([]);
    activeTradesRef.current = [];

    const anyWon = resolved.some(function(r){return r.won;});
    const totPnl = resolved.reduce(function(acc,r){return acc+r.pnl;},0);
    setResultInfo({ won:anyWon, pnl:totPnl, close:closePrice, allWon:resolved.every(function(r){return r.won;}) });
    if (soundRef.current) { if (anyWon) AudioEngine.win(); else AudioEngine.loss(); }
    setTimeout(function(){ setResultInfo(null); }, 4200);
  }

  // ── ONLY ONE switchMarket — just changes view, markets keep running ──
  const switchMarket = useCallback(function(idx) {
    if (soundRef.current) AudioEngine.uiClick();
    setMarketIdx(idx);
    marketIdxRef.current = idx;
    const s = GlobalMarkets.getStore(TRADE_MARKETS[idx].id);
    if (s) { setLivePrice(s.live); setOpenRef(s.openRef); setTimeLeft(s.timeLeft); }
    setChartOffset(0);
  }, []);

  const placeBet = useCallback(function(dir) {
    if (betAmt > balance || betAmt < 1 || !entryOpen) return;
    if (soundRef.current) AudioEngine.tradeEntry(dir);
    navigator && navigator.vibrate && navigator.vibrate(12);
    const s     = GlobalMarkets.getStore(TRADE_MARKETS[marketIdxRef.current].id);
    const entry = s ? s.live : livePrice;
    const id    = ++tradeSeq.current;
    const trade = { id, dir, entry, amt:betAmt };
    setActiveTrades(function(p){ return p.concat([trade]); });
    activeTradesRef.current = activeTradesRef.current.concat([trade]);
    setBalance(function(b){ return b - betAmt; });
  }, [betAmt, balance, entryOpen, livePrice, setBalance]);

  const drawPnl = useCallback(function() {
    const canvas = pnlCanvasRef.current; if(!canvas)return;
    const dpr=window.devicePixelRatio||1, W=canvas.offsetWidth||320, H=80;
    canvas.width=W*dpr; canvas.height=H*dpr;
    canvas.style.width=W+"px"; canvas.style.height=H+"px";
    const ctx=canvas.getContext("2d"); ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H);
    const curve=stats.pnlCurve;
    if(curve.length<2){ ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.font="11px sans-serif"; ctx.textAlign="center"; ctx.fillText("Trade to see P&L curve",W/2,H/2); return; }
    const minV=Math.min.apply(null,curve.concat([0])), maxV=Math.max.apply(null,curve.concat([1])), range=maxV-minV||1, pad=8;
    const toX=function(i){return pad+(i/(curve.length-1))*(W-pad*2);};
    const toY=function(v){return H-pad-((v-minV)/range)*(H-pad*2);};
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"rgba(0,200,136,0.3)"); g.addColorStop(1,"rgba(0,200,136,0)");
    ctx.beginPath(); ctx.moveTo(toX(0),toY(curve[0]));
    curve.forEach(function(v,i){if(i>0)ctx.lineTo(toX(i),toY(v));});
    ctx.lineTo(toX(curve.length-1),H-pad); ctx.lineTo(toX(0),H-pad); ctx.closePath();
    ctx.fillStyle=g; ctx.fill();
    ctx.beginPath(); ctx.moveTo(toX(0),toY(curve[0]));
    curve.forEach(function(v,i){if(i>0)ctx.lineTo(toX(i),toY(v));});
    ctx.strokeStyle="#00cc88"; ctx.lineWidth=2; ctx.lineJoin="round"; ctx.stroke();
  }, [stats.pnlCurve]);

  useEffect(function(){ if(activeTab==="profile")drawPnl(); }, [activeTab, stats, drawPnl]);

  if (loading) return <TradingLoader onDone={function(){ setLoading(false); }} />;

  const headerStyle = { background:"rgba(7,7,14,0.95)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 };

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#050508", minHeight:"100vh", fontFamily:"'Inter',sans-serif", display:"flex", flexDirection:"column", color:"#e8e8ff", overflow:"hidden" }}>
      <style>{`
        @keyframes slideInPos { from{opacity:0;transform:translateY(-8px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes tabSlide   { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes entryClosed{ 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes blink2     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
      `}</style>

      <div style={headerStyle}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a5a7a", fontSize:22, cursor:"pointer", lineHeight:1, padding:"0 4px" }}>‹</button>
        <div style={{ fontFamily:"monospace", fontSize:15, fontWeight:900, color:"#00cc88", letterSpacing:2 }}>FX TRADER</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={function(){ setSoundOn(function(v){return !v;}); }} style={{ background:soundOn?"rgba(0,200,136,0.08)":"rgba(255,255,255,0.04)", border:"1px solid "+(soundOn?"rgba(0,200,136,0.2)":"rgba(255,255,255,0.08)"), borderRadius:8, padding:"5px 10px", fontSize:13, cursor:"pointer", color:soundOn?"#00cc88":"#4a4a6a", transition:"all 0.2s" }}>
            {soundOn ? "🔊 Sound" : "🔇 Sound"}
          </button>
          <div style={{ background:"rgba(0,200,136,0.08)", border:"1px solid rgba(0,200,136,0.18)", borderRadius:22, padding:"5px 14px", fontSize:13, fontWeight:800, color:"#00cc88", fontFamily:"monospace" }}>
            ৳{balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", background:"rgba(7,7,14,0.9)", borderBottom:"1px solid rgba(255,255,255,0.05)", flexShrink:0 }}>
        {[["trade","Trade"],["history","History"],["profile","Profile"]].map(function(kl){
          return (
            <button key={kl[0]} onClick={function(){ if(soundRef.current)AudioEngine.uiClick(); setActiveTab(kl[0]); }} style={{ flex:1, padding:"10px 0", border:"none", background:"transparent", color:activeTab===kl[0]?"#00cc88":"#4a4a6a", fontWeight:700, fontSize:12, borderBottom:activeTab===kl[0]?"2px solid #00cc88":"2px solid transparent", cursor:"pointer", fontFamily:"sans-serif", transition:"color 0.2s" }}>
              {kl[1]}
            </button>
          );
        })}
      </div>

      {activeTab === "trade" && (
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", animation:"tabSlide 0.2s ease" }}>
          <div style={{ display:"flex", gap:6, padding:"10px 12px", overflowX:"auto", background:"rgba(7,7,14,0.8)", borderBottom:"1px solid rgba(255,255,255,0.04)", flexShrink:0 }}>
            {TRADE_MARKETS.map(function(tm, i) {
              const active = marketIdx === i;
              return (
                <button key={tm.id} onClick={function(){ switchMarket(i); }} style={{ flexShrink:0, padding:"7px 14px", borderRadius:20, border:"1px solid "+(active?"rgba(0,200,136,0.4)":"rgba(255,255,255,0.06)"), background:active?"rgba(0,200,136,0.1)":"transparent", color:active?"#00cc88":"#5a5a7a", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"sans-serif", transition:"all 0.2s", boxShadow:active?"0 0 12px rgba(0,200,136,0.15)":"none", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:active?"#00cc88":"#2a2a44", boxShadow:active?"0 0 6px #00cc88":"none", display:"inline-block", animation:active?"blink2 1.5s infinite":"none" }} />
                  {tm.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding:"12px 16px", background:"rgba(10,10,20,0.9)", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <div style={{ fontSize:10, color:"#4a4a6a", fontWeight:600, letterSpacing:.8, textTransform:"uppercase", marginBottom:4 }}>{market.label}</div>
              <div style={{ fontFamily:"monospace", fontSize:24, fontWeight:700, color:pct>=0?"#00cc88":"#ff3355", transition:"color 0.2s" }}>
                {market.prefix}{livePrice.toFixed(market.decimals)}
              </div>
              <div style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:7, marginTop:5, display:"inline-block", background:pct>=0?"rgba(0,200,136,0.08)":"rgba(255,51,85,0.08)", color:pct>=0?"#00cc88":"#ff3355", border:"1px solid "+(pct>=0?"rgba(0,200,136,0.18)":"rgba(255,51,85,0.18)") }}>
                {pct>=0?"+":""}{pct.toFixed(3)}%
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <EntryRing timeLeft={timeLeft} />
              <div style={{ fontSize:9, fontWeight:800, color:entryOpen?"#00cc88":"#ff3355", letterSpacing:.5, animation:entryOpen?"none":"entryClosed 1s infinite" }}>
                {entryOpen ? "ENTRY OPEN" : "ENTRY CLOSED"}
              </div>
            </div>
          </div>

          <div style={{ height:3, background:"rgba(255,255,255,0.04)", flexShrink:0 }}>
            <div style={{ height:"100%", width:((timeLeft/CANDLE_DURATION)*100)+"%", background:"linear-gradient(90deg,"+timerCol+"88,"+timerCol+")", transition:"width 1s linear, background 0.3s" }} />
          </div>
          <div style={{ height:2, background:"rgba(255,255,255,0.02)", flexShrink:0 }}>
            <div style={{ height:"100%", width:entryOpen?((timeLeft-(CANDLE_DURATION-ENTRY_WINDOW))/ENTRY_WINDOW*100)+"%":"0%", background:"linear-gradient(90deg,rgba(0,200,136,0.4),#00cc88)", transition:"width 1s linear" }} />
          </div>

          <TradeChart store={storeRef} activeTrades={activeTrades} market={market} chartOffset={chartOffset} onOffsetChange={setChartOffset} />

          <div style={{ padding:"14px 14px 12px", background:"rgba(10,10,20,0.85)", borderTop:"1px solid rgba(255,255,255,0.05)", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#5a5a7a", fontWeight:600, letterSpacing:.6, textTransform:"uppercase", minWidth:52 }}>Amount</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {[10,25,50,100,200].map(function(p){
                  return (
                    <button key={p} onClick={function(){ if(soundRef.current)AudioEngine.uiClick(); setBetAmt(p); }} style={{ padding:"5px 11px", borderRadius:8, border:"1px solid "+(betAmt===p?"rgba(0,200,136,0.45)":"rgba(255,255,255,0.07)"), background:betAmt===p?"rgba(0,200,136,0.12)":"rgba(255,255,255,0.03)", color:betAmt===p?"#00cc88":"#5a5a7a", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"sans-serif", transition:"all 0.15s" }}>
                      ৳{p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"3px 3px 3px 14px" }}>
              <input type="number" value={betAmt} onChange={function(e){ setBetAmt(Math.max(1, parseFloat(e.target.value)||1)); }} style={{ flex:1, background:"transparent", border:"none", color:"#e8e8ff", fontSize:16, fontWeight:700, fontFamily:"sans-serif", outline:"none", minWidth:0 }} />
              <button onClick={function(){ setBetAmt(function(a){return Math.max(1,a-1);}); }} style={{ width:34,height:34,borderRadius:9,border:"none",background:"rgba(255,255,255,0.05)",color:"#e8e8ff",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>−</button>
              <button onClick={function(){ setBetAmt(function(a){return a+1;}); }} style={{ width:34,height:34,borderRadius:9,border:"none",background:"rgba(255,255,255,0.05)",color:"#e8e8ff",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>+</button>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              {["UP","DOWN"].map(function(dir){
                const isUp=dir==="UP", col=isUp?"#00cc88":"#ff3355", locked=!entryOpen, dis=balance<betAmt;
                return (
                  <button key={dir} onClick={function(){ placeBet(dir); }} disabled={dis} style={{ flex:1, height:62, borderRadius:16, border:"1.5px solid "+(locked?"#2a2a44":col+"55"), background:locked?"rgba(255,255,255,0.03)":(isUp?"rgba(0,200,136,0.12)":"rgba(255,51,85,0.12)"), color:locked?"#3a3a5a":col, fontWeight:800, fontSize:15, cursor:locked||dis?"not-allowed":"pointer", fontFamily:"sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, transition:"all 0.15s", boxShadow:locked?"none":"0 0 16px "+col+"33" }}>
                    <div style={{ fontSize:20 }}>{isUp?"▲":"▼"}</div>
                    <div style={{ fontSize:12, fontWeight:800, letterSpacing:1.5 }}>{dir}</div>
                  </button>
                );
              })}
            </div>

            {!entryOpen && (
              <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(255,51,85,0.06)", border:"1px solid rgba(255,51,85,0.18)", borderRadius:10, textAlign:"center", fontSize:12, fontWeight:700, color:"#ff3355", animation:"entryClosed 1.5s infinite" }}>
                Entry closed — next candle in {timeLeft}s
              </div>
            )}
          </div>

          <div style={{ background:"rgba(7,7,14,0.9)", borderTop:"1px solid rgba(255,255,255,0.04)", maxHeight:220, overflowY:"auto", flexShrink:0 }}>
            <div style={{ padding:"10px 14px 6px", display:"flex", alignItems:"center", gap:8, position:"sticky", top:0, background:"rgba(7,7,14,0.98)", zIndex:2 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"#00cc88",boxShadow:"0 0 8px #00cc88" }} />
              <span style={{ fontSize:12,fontWeight:700,color:"#8a8aaa",letterSpacing:.5,textTransform:"uppercase" }}>Active Positions</span>
              <span style={{ background:"rgba(0,200,136,0.1)",border:"1px solid rgba(0,200,136,0.2)",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#00cc88" }}>{activeTrades.length}</span>
            </div>
            <div style={{ padding:"0 10px 10px",display:"flex",flexDirection:"column",gap:6 }}>
              {activeTrades.length===0
                ? <div style={{ textAlign:"center",padding:18,color:"#3a3a5a",fontSize:13 }}>No active positions</div>
                : activeTrades.map(function(t){ return <PositionCard key={t.id} trade={t} livePrice={livePrice} market={market} />; })
              }
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ flex:1, overflowY:"auto", animation:"tabSlide 0.2s ease" }}>
          <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:15, fontWeight:700 }}>Trade History</div>
            <div style={{ background:"rgba(0,200,136,0.08)", border:"1px solid rgba(0,200,136,0.2)", borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:700, color:"#00cc88" }}>LIVE</div>
          </div>
          <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
            {tradeHistory.length===0
              ? <div style={{ textAlign:"center", padding:"50px 20px", color:"#4a4a6a", fontSize:13 }}>No trades yet</div>
              : tradeHistory.map(function(t,i){
                  return (
                    <div key={i} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid "+(t.won?"rgba(0,200,136,0.12)":"rgba(255,51,85,0.12)"), borderRadius:13, padding:"13px 14px", display:"flex", alignItems:"center", gap:11 }}>
                      <div style={{ width:38,height:38,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,flexShrink:0,background:t.dir==="UP"?"rgba(0,200,136,0.1)":"rgba(255,51,85,0.1)",color:t.dir==="UP"?"#00cc88":"#ff3355" }}>{t.dir==="UP"?"▲":"▼"}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:700 }}>{t.market} · {t.dir}</div>
                        <div style={{ fontSize:11,color:"#5a5a7a",marginTop:2 }}>{t.time} · ৳{t.amt.toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:15,fontWeight:900,fontFamily:"monospace",color:t.won?"#00cc88":"#ff3355" }}>{t.pnl>=0?"+":""}${Math.abs(t.pnl).toFixed(2)}</div>
                        <div style={{ fontSize:10,color:"#5a5a7a",marginTop:2 }}>{t.won?"WIN":"LOSS"}</div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div style={{ flex:1, overflowY:"auto", animation:"tabSlide 0.2s ease" }}>
          <div style={{ background:"radial-gradient(ellipse at 50% 0%,rgba(0,200,136,0.1),transparent 70%)", padding:"24px 16px 20px", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize:18,fontWeight:800,marginBottom:4 }}>Trading Stats</div>
            <div style={{ fontSize:11,color:"#5a5a7a",letterSpacing:1 }}>Performance Overview</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:14 }}>
            {[
              { val:"+$"+stats.profit.toFixed(2),    lbl:"Total Profit",  col:"#00cc88" },
              { val:"-$"+stats.totalLoss.toFixed(2), lbl:"Total Losses",  col:"#ff3355" },
              { val:(stats.trades>0?Math.round(stats.wins/stats.trades*100):0)+"%", lbl:"Win Rate", col:"#e8e8ff" },
              { val:""+stats.trades,                 lbl:"Total Trades",  col:"#e8e8ff" },
              { val:""+stats.bestStreak,             lbl:"Best Streak",   col:"#ffd700" },
              { val:""+stats.wins,                   lbl:"Total Wins",    col:"#00cc88" },
              { val:""+stats.losses,                 lbl:"Total Losses",  col:"#ff3355" },
              { val:((stats.profit-stats.totalLoss)/Math.max(balance,1)*100).toFixed(1)+"%", lbl:"ROI", col:"#e8e8ff" },
            ].map(function(s,i){
              return (
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:14, textAlign:"center" }}>
                  <div style={{ fontSize:20,fontWeight:900,fontFamily:"monospace",marginBottom:4,color:s.col }}>{s.val}</div>
                  <div style={{ fontSize:10,color:"#5a5a7a",fontWeight:600,letterSpacing:.4,textTransform:"uppercase" }}>{s.lbl}</div>
                </div>
              );
            })}
          </div>
          <div style={{ margin:"0 14px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#8a8aaa",marginBottom:10,letterSpacing:.4,textTransform:"uppercase" }}>P&L Curve</div>
            <canvas ref={pnlCanvasRef} style={{ width:"100%", height:80, display:"block" }} />
          </div>
        </div>
      )}

      {resultInfo && (
        <div style={{ position:"fixed", inset:0, zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.78)", backdropFilter:"blur(16px)", animation:"fadeIn 0.3s ease" }}>
          <div style={{ background:"rgba(15,15,25,0.95)", border:"1px solid "+(resultInfo.won?"rgba(0,200,136,0.25)":"rgba(255,51,85,0.25)"), borderRadius:28, padding:"38px 44px", textAlign:"center", maxWidth:280, width:"90%", backdropFilter:"blur(20px)" }}>
            <div style={{ fontSize:13, fontWeight:900, letterSpacing:2, color:resultInfo.won?"#00cc88":"#ff3355", marginBottom:10, textTransform:"uppercase" }}>
              {resultInfo.allWon ? "Trade Won" : resultInfo.won ? "Partial Win" : "Trade Lost"}
            </div>
            <div style={{ fontSize:36, fontWeight:900, fontFamily:"monospace", marginBottom:8, color:resultInfo.pnl>=0?"#00cc88":"#ff3355" }}>
              {resultInfo.pnl>=0?"+":""}{resultInfo.pnl.toFixed(2)}$
            </div>
            <div style={{ fontSize:12, color:"#5a5a7a", marginBottom:22 }}>Closed at {resultInfo.close&&resultInfo.close.toFixed(2)}</div>
            <button onClick={function(){ setResultInfo(null); }} style={{ width:"100%", padding:"13px", borderRadius:13, border:"none", background:"linear-gradient(135deg,#00aa55,#00cc88)", color:"#000", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"sans-serif" }}>
              Trade Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── FLOATING HELP ── */
function FloatingHelp({ show, user }) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  if (!show) return null;
  if (chatOpen) return <SupportChat onClose={() => setChatOpen(false)} user={user} />;
  return (
    <>
      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 16, background: "#fff", borderRadius: 18, padding: "16px", width: 235, boxShadow: "0 10px 40px #0004", zIndex: 1000, fontFamily: "'Poppins',sans-serif", animation: "fadeIn .2s ease", border: "1px solid #f0f0f0" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: G.text, display: "flex", alignItems: "center", gap: 6 }}>🎧 <span>Support Center</span></div>
          {["Deposit Not Received","Withdrawal Problem","Change Password","Modify E-Wallet","Add USDT Address","Check Official Website"].map((item, i) => (
            <div key={i} onClick={() => { setOpen(false); setChatOpen(true); }} style={{ padding: "8px 0", borderBottom: i < 5 ? "1px solid #f5f5f5" : "none", fontSize: 13, color: "#444", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {item}<span style={{ color: "#ddd", fontSize: 16 }}>›</span>
            </div>
          ))}
          <button onClick={() => { setOpen(false); setChatOpen(true); }} style={{ width: "100%", marginTop: 12, padding: "11px 0", borderRadius: 12, border: "none", background: "#128C7E", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Poppins',sans-serif" }}>
            💬 Live Chat
          </button>
        </div>
      )}
      <div onClick={() => setOpen((o) => !o)} style={{ position: "fixed", bottom: 92, right: 16, width: 54, height: 54, borderRadius: "50%", background: open ? "#128C7E" : gradient, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 6px 22px ${open ? "#128C7E55" : "#EF535066"}`, zIndex: 1001, animation: "pulse 2.5s infinite", fontSize: 24, transition: "background .3s" }}>
        {open ? "✕" : "💬"}
      </div>
    </>
  );
}

/* ── ROOT ── */
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [balance, setBalance] = useState(1000);
  const isPlaying = screen === "wingo" || screen === "aviator" || screen === "trading";
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{CSS}</style>
      {screen === "login" && <LoginScreen onLogin={(u) => { setUser(u); setScreen("register"); }} onGotoRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onRegister={(u) => { setUser(u); setScreen("deposit"); }} onBack={() => setScreen("login")} />}
      {screen === "deposit" && <DepositSetup contact={user?.contact} onDone={(acc) => { setAccounts(acc); setScreen("home"); }} />}
      {screen === "home" && <HomeScreen user={user} balance={balance} onSelectGame={(g) => setScreen(g)} onGoProfile={() => setScreen("profile")} onGoWallet={() => setScreen("wallet")} />}
      {screen === "wingo" && <WinGoGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "aviator" && <AviatorGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "trading" && <TradingGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "profile" && <ProfileScreen user={user} balance={balance} accounts={accounts} onBack={() => setScreen("home")} />}
      {screen === "wallet" && <WalletScreen balance={balance} setBalance={setBalance} accounts={accounts} onBack={() => setScreen("home")} />}
      <FloatingHelp show={!isPlaying} user={user} />
    </div>
  );
}

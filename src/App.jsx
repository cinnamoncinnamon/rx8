import { useState, useEffect, useRef, useCallback } from "react";

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
    "0***8",
    "i***4",
    "m***u",
    "i***5",
    "i***8",
    "i***1",
    "i***9",
    "u***m",
    "p***r",
    "k***i",
    "a***z",
    "b***7",
    "c***3",
    "d***9",
    "e***5",
    "f***2",
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
  const pointsRef = useRef([]); // stores {t,x,y} for drawn curve

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

  // refs for bet state accessible in RAF
  const betPlacedRef = useRef(false);
  const betPlaced2Ref = useRef(false);
  const betAmtRef = useRef(10);
  const betAmt2Ref = useRef(10);
  useEffect(() => {
    betPlacedRef.current = betPlaced;
  }, [betPlaced]);
  useEffect(() => {
    betPlaced2Ref.current = betPlaced2;
  }, [betPlaced2]);
  useEffect(() => {
    betAmtRef.current = betAmt;
  }, [betAmt]);
  useEffect(() => {
    betAmt2Ref.current = betAmt2;
  }, [betAmt2]);

  const cashedOutRef = useRef(false);
  const cashedOut2Ref = useRef(false);
  const autoCash1Ref = useRef(0);
  const autoCash2Ref = useRef(0);
  useEffect(() => {
    cashedOutRef.current = cashedOut;
  }, [cashedOut]);
  useEffect(() => {
    cashedOut2Ref.current = cashedOut2;
  }, [cashedOut2]);
  useEffect(() => {
    autoCash1Ref.current = autoCash1;
  }, [autoCash1]);
  useEffect(() => {
    autoCash2Ref.current = autoCash2;
  }, [autoCash2]);

  const mc = (m) =>
    m < 2 ? "#FFD600" : m < 5 ? "#4ADE80" : m < 10 ? "#38BDF8" : "#F472B6";

  // ── CANVAS DRAW ──────────────────────────────────────────────
  const drawFrame = useCallback((canvas, pts, currentMult, ph, cd) => {
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background: dark with radial rays
    ctx.fillStyle = "#0D0D1A";
    ctx.fillRect(0, 0, W, H);

    // Sunray lines from bottom-left
    const ox = W * 0.05,
      oy = H * 0.98;
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

    // Axis dots
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
      // During waiting / crashed: just show the text overlay
      if (ph === "crashed" && pts.length > 1) {
        // keep old curve visible briefly
        drawCurve(ctx, pts, W, H, "#EF4444");
      }
      return;
    }

    if (pts.length < 2) return;
    drawCurve(ctx, pts, W, H, "#EF4444");

    // Plane at tip
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    drawPlane(ctx, last.x, last.y, angle, currentMult);
  }, []);

  function drawCurve(ctx, pts, W, H, color) {
    if (pts.length < 2) return;
    // Glow layer
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

    // Filled area under curve
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

    // Bright core line
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

    // Engine fire
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

    // Main fuselage
    ctx.fillStyle = "#C8000A";
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.bezierCurveTo(20, -8, 0, -10, -20, -8);
    ctx.bezierCurveTo(-36, -6, -44, -3, -46, 2);
    ctx.bezierCurveTo(-44, 7, -36, 8, -20, 8);
    ctx.bezierCurveTo(0, 10, 20, 7, 28, 0);
    ctx.fill();

    // Fuselage shine
    ctx.fillStyle = "rgba(255,80,80,0.25)";
    ctx.beginPath();
    ctx.ellipse(-5, -5, 18, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#A00008";
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.bezierCurveTo(26, -4, 34, -2, 38, 0);
    ctx.bezierCurveTo(34, 2, 26, 4, 22, 0);
    ctx.fill();

    // Main wing
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

    // Lower wing stub
    ctx.fillStyle = "#900008";
    ctx.beginPath();
    ctx.moveTo(5, 2);
    ctx.lineTo(-8, 16);
    ctx.lineTo(-18, 12);
    ctx.lineTo(-14, 6);
    ctx.lineTo(10, 2);
    ctx.closePath();
    ctx.fill();

    // Tail vertical fin
    ctx.fillStyle = "#A00008";
    ctx.beginPath();
    ctx.moveTo(-34, -2);
    ctx.lineTo(-42, -18);
    ctx.lineTo(-32, -14);
    ctx.lineTo(-28, -2);
    ctx.closePath();
    ctx.fill();

    // Tail horizontal stabilizer
    ctx.fillStyle = "#B0000A";
    ctx.beginPath();
    ctx.moveTo(-32, 2);
    ctx.lineTo(-44, 10);
    ctx.lineTo(-42, 4);
    ctx.lineTo(-30, 4);
    ctx.closePath();
    ctx.fill();

    // Cockpit
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

    // Propeller hub
    ctx.fillStyle = "#880008";
    ctx.beginPath();
    ctx.arc(38, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Spinning propeller blades
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

    // Propeller blur disc
    ctx.fillStyle = "rgba(200,50,50,0.12)";
    ctx.beginPath();
    ctx.arc(38, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ── GAME LOOP ────────────────────────────────────────────────
  const startRound = useCallback(() => {
    // Generate crash point
    const r = Math.random();
    let crash;
    if (r < 0.04) crash = 1.0;
    else
      crash = parseFloat(
        Math.max(1.01, (1 / (1 - Math.random())) * 0.97).toFixed(2)
      );
    crashRef.current = crash;
    phaseRef.current = "flying";
    multRef.current = 1.0;
    pointsRef.current = [];
    startRef.current = performance.now();

    // deduct bets
    if (betPlacedRef.current) setBalance((b) => b - betAmtRef.current);
    if (betPlaced2Ref.current) setBalance((b) => b - betAmt2Ref.current);

    setPhase("flying");
    setMult(1.0);

    const canvas = canvasRef.current;
    const W = canvas ? canvas.width : 460,
      H = canvas ? canvas.height : 240;
    const PAD_L = W * 0.07,
      PAD_B = H - 18,
      PAD_T = 18,
      PAD_R = W - 14;

    const tick = (now) => {
      if (phaseRef.current !== "flying") return;
      const elapsed = (now - startRef.current) / 1000;
      const m = parseFloat(Math.pow(Math.E, elapsed * 0.09).toFixed(3));
      multRef.current = m;
      setMult(parseFloat(m.toFixed(2)));

      // Map multiplier to canvas coords using exponential curve
      // t goes 0→1 as mult goes 1→crashPoint
      const maxM = Math.max(crashRef.current * 1.1, 4);
      const t = Math.min((m - 1) / (maxM - 1), 1);
      // x: linear left→right
      const cx = PAD_L + t * (PAD_R - PAD_L);
      // y: exponential bottom→top
      const cy = PAD_B - Math.pow(t, 0.7) * (PAD_B - PAD_T);

      const pts = pointsRef.current;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(cx - last.x, cy - last.y) > 3) {
        pointsRef.current = [...pts.slice(-120), { x: cx, y: cy }];
      }

      if (canvas) drawFrame(canvas, pointsRef.current, m, "flying", 0);

      // Auto cash out
      if (
        autoCash1Ref.current > 0 &&
        betPlacedRef.current &&
        !cashedOutRef.current &&
        m >= autoCash1Ref.current
      ) {
        setBalance((b) => b + betAmtRef.current * m);
        setCashedOut(true);
        cashedOutRef.current = true;
        setCashMult(parseFloat(m.toFixed(2)));
      }
      if (
        autoCash2Ref.current > 0 &&
        betPlaced2Ref.current &&
        !cashedOut2Ref.current &&
        m >= autoCash2Ref.current
      ) {
        setBalance((b) => b + betAmt2Ref.current * m);
        setCashedOut2(true);
        cashedOut2Ref.current = true;
        setCashMult2(parseFloat(m.toFixed(2)));
      }

      if (m >= crashRef.current) {
        // CRASH
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

  // Countdown timer
  useEffect(() => {
    if (phase !== "waiting") return;
    if (countdown <= 0) {
      startRound();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, startRound]);

  // Redraw on waiting phase (blank + dots)
  useEffect(() => {
    if (phase === "waiting" && canvasRef.current) {
      drawFrame(canvasRef.current, [], "1.00", "waiting", countdown);
    }
  }, [phase, countdown]);

  useEffect(
    () => () => {
      cancelAnimationFrame(animRef.current);
    },
    []
  );

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

  // ── BET PANEL ────────────────────────────────────────────────
  const BetPanel = ({
    slot,
    amt,
    setAmt,
    placed,
    setPlaced,
    cashed,
    cashM,
    autoCash,
    setAutoCash,
    tab,
    setTab,
  }) => {
    const canBet = !placed && phase === "waiting" && balance >= amt;
    const canCash = placed && !cashed && phase === "flying";
    const btnBg = canBet
      ? "#22C55E"
      : canCash
      ? "#EF4444"
      : cashed
      ? "#1a2a1a"
      : "#2A2A3A";
    const btnText = canBet
      ? `BET\n৳${amt}`
      : canCash
      ? `CASH OUT\n৳${(amt * mult).toFixed(2)}`
      : cashed
      ? `✓ ${cashM?.toFixed(2)}×`
      : "Waiting...";
    const glowColor = canBet
      ? "#22C55E44"
      : canCash
      ? "#EF444466"
      : "transparent";
    return (
      <div
        style={{
          background: "#161622",
          borderRadius: 14,
          padding: "12px 10px 14px",
          border: "1px solid #ffffff0D",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button
            onClick={() => setTab("bet")}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: tab === "bet" ? "#22C55E22" : "transparent",
              color: tab === "bet" ? "#22C55E" : "#444",
              fontWeight: 700,
              fontSize: 11,
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Bet
          </button>
          <button
            onClick={() => setTab("auto")}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: tab === "auto" ? "#FFD60022" : "transparent",
              color: tab === "auto" ? "#FFD600" : "#444",
              fontWeight: 700,
              fontSize: 11,
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Auto
          </button>
        </div>
        {tab === "auto" ? (
          <div>
            <div
              style={{
                color: "#888",
                fontSize: 11,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Auto Cash Out at ×
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <button
                onClick={() =>
                  setAutoCash((v) =>
                    Math.max(0, parseFloat((v - 0.1).toFixed(2)))
                  )
                }
                disabled={placed}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "#2A2A3A",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                −
              </button>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#FFD600",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {autoCash > 0 ? autoCash.toFixed(2) + "×" : "Off"}
              </span>
              <button
                onClick={() =>
                  setAutoCash((v) =>
                    parseFloat((Math.max(1.1, v) + 0.1).toFixed(2))
                  )
                }
                disabled={placed}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "#2A2A3A",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                +
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                marginBottom: 10,
              }}
            >
              {[1.5, 2, 5, 10].map((p) => (
                <button
                  key={p}
                  onClick={() => setAutoCash(p)}
                  disabled={placed}
                  style={{
                    padding: "5px 0",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    background: autoCash === p ? "#FFD60033" : "#2A2A3A",
                    color: autoCash === p ? "#FFD600" : "#888",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  {p}×
                </button>
              ))}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#555",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Will auto cash out when multiplier reaches target
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <button
                onClick={() => setAmt((a) => Math.max(1, a - 1))}
                disabled={placed}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "#2A2A3A",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                −
              </button>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#fff",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {amt.toFixed(2)}
              </span>
              <button
                onClick={() => setAmt((a) => a + 1)}
                disabled={placed}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "#2A2A3A",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                +
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                marginBottom: 10,
              }}
            >
              {[1, 2, 5, 10].map((p) => (
                <button
                  key={p}
                  onClick={() => setAmt(p)}
                  disabled={placed}
                  style={{
                    padding: "5px 0",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    background: "#2A2A3A",
                    color: "#888",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (canBet) setPlaced(true);
            else if (canCash) cashOut(slot);
          }}
          style={{
            width: "100%",
            height: 58,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            background: btnBg,
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: "pre-line",
            boxShadow: `0 4px 20px ${glowColor}`,
            fontFamily: "'Poppins',sans-serif",
            animation: canCash ? "multPulse 0.8s infinite" : "none",
          }}
        >
          {btnText}
        </button>
      </div>
    );
  };

  const displayMult = phase === "waiting" ? 1.0 : mult;
  const multColor =
    displayMult < 2
      ? "#ffffff"
      : displayMult < 5
      ? "#4ADE80"
      : displayMult < 10
      ? "#38BDF8"
      : "#F472B6";

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
      <div
        style={{
          background: "#0A0A12",
          padding: "11px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid #ffffff0D",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#aaa",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ‹
        </button>
        <span
          style={{
            color: "#EF4444",
            fontWeight: 900,
            fontSize: 20,
            fontStyle: "italic",
            letterSpacing: 2,
            textShadow: "0 0 20px #EF444466",
            fontFamily: "'Orbitron',monospace",
          }}
        >
          AVIATOR
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            background: "#22C55E22",
            borderRadius: 20,
            padding: "4px 12px",
            color: "#22C55E",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          ৳{balance.toFixed(2)}
        </span>
      </div>

      {/* History pills */}
      <div
        style={{
          display: "flex",
          gap: 5,
          padding: "7px 10px",
          overflowX: "auto",
          background: "#0A0A12",
          borderBottom: "1px solid #ffffff08",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, color: "#444", flexShrink: 0 }}>
          History:
        </span>
        {history.map((m, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              padding: "3px 10px",
              borderRadius: 16,
              fontSize: 11,
              fontWeight: 800,
              background: "#1A1A28",
              color: mc(m),
              border: `1px solid ${mc(m)}22`,
            }}
          >
            {m}×
          </div>
        ))}
      </div>

      {/* Canvas area */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          margin: "8px 8px 0",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #ffffff0A",
        }}
      >
        <canvas
          ref={canvasRef}
          width={460}
          height={240}
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* Overlay: multiplier display */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            pointerEvents: "none",
          }}
        >
          {phase === "waiting" && (
            <>
              <div
                style={{
                  color: "rgba(255,255,255,.5)",
                  fontSize: 13,
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Starting in
              </div>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 68,
                  fontWeight: 900,
                  color: "#FFD600",
                  textShadow: "0 0 40px #FFD600",
                  lineHeight: 1,
                }}
              >
                {countdown}
              </div>
              {(betPlaced || betPlaced2) && (
                <div
                  style={{
                    color: "#22C55E",
                    fontSize: 13,
                    marginTop: 8,
                    fontWeight: 700,
                  }}
                >
                  ✓ Bet placed — waiting for round
                </div>
              )}
            </>
          )}
          {phase === "flying" && (
            <>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 58,
                  fontWeight: 900,
                  color: multColor,
                  textShadow: `0 0 50px ${multColor}`,
                  lineHeight: 1,
                  animation: "multPulse 1s infinite",
                }}
              >
                {mult.toFixed(2)}×
              </div>
              {(cashedOut || cashedOut2) && (
                <div
                  style={{
                    color: "#22C55E",
                    fontSize: 13,
                    marginTop: 8,
                    fontWeight: 700,
                    background: "rgba(0,0,0,.5)",
                    padding: "4px 14px",
                    borderRadius: 20,
                  }}
                >
                  ✓ Cashed{" "}
                  {[cashedOut && cashMult, cashedOut2 && cashMult2]
                    .filter(Boolean)
                    .join(", ")}
                  ×
                </div>
              )}
            </>
          )}
          {phase === "crashed" && (
            <div style={{ animation: "crashShake .5s ease" }}>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 44,
                  fontWeight: 900,
                  color: "#EF4444",
                  textShadow: "0 0 40px #EF4444",
                  lineHeight: 1,
                  textAlign: "center",
                }}
              >
                FLEW AWAY!
              </div>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 26,
                  color: "#FF6666",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                {crashedMult}×
              </div>
            </div>
          )}
        </div>

        {/* Live players */}
        {phase === "flying" && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 12,
              background: "rgba(0,0,0,.7)",
              backdropFilter: "blur(6px)",
              borderRadius: 20,
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "#fff",
              border: "1px solid #ffffff10",
            }}
          >
            <span>👥</span>
            <span style={{ fontWeight: 700, color: "#FFD600" }}>
              {Math.floor(mult * 1234 + 3200).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Bet panels */}
      <div style={{ padding: "8px 8px 6px", display: "flex", gap: 8 }}>
        <BetPanel
          slot={1}
          amt={betAmt}
          setAmt={setBetAmt}
          placed={betPlaced}
          setPlaced={setBetPlaced}
          cashed={cashedOut}
          cashM={cashMult}
          autoCash={autoCash1}
          setAutoCash={setAutoCash1}
          tab={betTab1}
          setTab={setBetTab1}
        />
        <BetPanel
          slot={2}
          amt={betAmt2}
          setAmt={setBetAmt2}
          placed={betPlaced2}
          setPlaced={setBetPlaced2}
          cashed={cashedOut2}
          cashM={cashMult2}
          autoCash={autoCash2}
          setAutoCash={setAutoCash2}
          tab={betTab2}
          setTab={setBetTab2}
        />
      </div>

      {/* All bets table */}
      <div
        style={{
          margin: "0 8px 8px",
          background: "#111120",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #ffffff08",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", borderBottom: "1px solid #ffffff0A" }}>
          {["allbets", "mybets", "top"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                background: "transparent",
                color: activeTab === t ? "#fff" : "#444",
                borderBottom:
                  activeTab === t
                    ? "2px solid #EF4444"
                    : "2px solid transparent",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              {t === "allbets"
                ? "All Bets"
                : t === "mybets"
                ? "My Bets"
                : "Top"}
            </button>
          ))}
        </div>
        <div
          style={{ padding: "8px 10px 4px", overflowY: "auto", maxHeight: 200 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1.2fr .8fr 1.2fr",
              marginBottom: 6,
              padding: "0 4px",
            }}
          >
            {["Player", "Bet ৳", "×", "Won ৳"].map((h) => (
              <span
                key={h}
                style={{ fontSize: 10, color: "#444", fontWeight: 600 }}
              >
                {h}
              </span>
            ))}
          </div>
          {allBets.map((b, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1.2fr .8fr 1.2fr",
                padding: "6px 4px",
                borderTop: "1px solid #ffffff05",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: `hsl(${i * 37 + 20},55%,30%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {"🎭🎨🎯🎮🎲🃏🎪🎸🦊🦁"[i % 10]}
                </div>
                <span style={{ fontSize: 11, color: "#777" }}>{b.name}</span>
              </div>
              <span style={{ fontSize: 11, color: "#888" }}>
                {b.bet.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: b.flying ? "#333" : mc(b.x),
                }}
              >
                {b.flying ? "—" : b.x + "×"}
              </span>
              <span style={{ fontSize: 11, color: b.flying ? "#333" : "#bbb" }}>
                {b.flying ? "—" : b.won}
              </span>
            </div>
          ))}
          <div
            style={{
              textAlign: "center",
              padding: "8px 0 4px",
              fontSize: 10,
              color: "#333",
            }}
          >
            🛡️ Provably Fair
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── HOME ── */
const GAMES = [
  {
    id: "wingo",
    name: "Win Go",
    desc: "Guess Number · Green/Red/Violet",
    emoji: "🔮",
    bg: "linear-gradient(135deg,#EF5350,#FF8A80)",
  },
  {
    id: "aviator",
    name: "Aviator",
    desc: "Cash out before it flies away!",
    emoji: "✈️",
    bg: "linear-gradient(135deg,#0F0F2A,#3949AB)",
  },
  {
    id: "k3",
    name: "K3",
    desc: "Guess Number · Big/Small/Odd/Even",
    emoji: "🎲",
    bg: "linear-gradient(135deg,#F97316,#FBBF24)",
    soon: true,
  },
  {
    id: "5d",
    name: "5D",
    desc: "Guess Number · Big/Small/Odd/Even",
    emoji: "🎯",
    bg: "linear-gradient(135deg,#22C55E,#16A34A)",
    soon: true,
  },
  {
    id: "trx",
    name: "Trx Win",
    desc: "Guess Number · Green/Red/Violet",
    emoji: "💎",
    bg: "linear-gradient(135deg,#7C3AED,#A855F7)",
    soon: true,
  },
  {
    id: "trading",
    name: "FX Trader",
    desc: "Trade USD/JPY · EUR/USD · GBP/USD · XAU/USD",
    emoji: "📈",
    bg: "linear-gradient(135deg,#0F2027,#203A43,#2C5364)",
  },
];

function HomeScreen({ user, balance, onSelectGame, onGoProfile, onGoWallet }) {
  const [activeNav, setActiveNav] = useState("home");
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: "#F4F4F8",
        minHeight: "100vh",
        fontFamily: "'Poppins',sans-serif",
        paddingBottom: 80,
      }}
    >
      <div style={{ background: gradient, padding: "16px 20px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: 1,
            }}
          >
            <span style={{ fontStyle: "italic", color: "#FFE082" }}>H</span>
            GNICE
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div
              style={{
                background: "rgba(255,255,255,.2)",
                borderRadius: 20,
                padding: "5px 12px",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              ৳{balance.toFixed(2)}
            </div>
            <div
              onClick={onGoProfile}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              🎮
            </div>
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,.15)",
            borderRadius: 16,
            padding: "16px",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,.7)",
              fontSize: 12,
              marginBottom: 2,
            }}
          >
            Total Balance
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: 900,
              marginBottom: 12,
            }}
          >
            ৳{balance.toFixed(2)}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onGoWallet}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 10,
                border: "none",
                background: "rgba(255,255,255,.25)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              + Deposit
            </button>
            <button
              onClick={onGoWallet}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 10,
                border: "1.5px solid rgba(255,255,255,.5)",
                background: "transparent",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              ↓ Withdraw
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: "18px 14px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div
            style={{ width: 4, height: 20, background: G.red, borderRadius: 2 }}
          />
          <span style={{ fontWeight: 800, fontSize: 16, color: G.text }}>
            Lottery
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GAMES.map((g) => (
            <div
              key={g.id}
              onClick={() => !g.soon && onSelectGame(g.id)}
              style={{
                background: g.bg,
                borderRadius: 16,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: g.soon ? "default" : "pointer",
                boxShadow: "0 4px 16px #0002",
                transition: "transform .15s",
              }}
              onMouseEnter={(e) => {
                if (!g.soon) e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>
                  {g.name}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,.8)",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {g.desc}
                </div>
                {g.soon && (
                  <div
                    style={{
                      color: "rgba(255,255,255,.5)",
                      fontSize: 11,
                      marginTop: 4,
                      background: "rgba(0,0,0,.2)",
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    Coming soon
                  </div>
                )}
              </div>
              <div style={{ fontSize: 44 }}>{g.emoji}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          zIndex: 100,
        }}
      >
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "activity", icon: "🎁", label: "Activity" },
          { id: "promo", icon: "💎", label: "Promo" },
          { id: "wallet", icon: "👛", label: "Wallet" },
          { id: "account", icon: "👤", label: "Account" },
        ].map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setActiveNav(n.id);
              if (n.id === "wallet") onGoWallet();
              if (n.id === "account") onGoProfile();
            }}
            style={{
              flex: 1,
              padding: "10px 0 6px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: activeNav === n.id ? G.red : "#aaa",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── PROFILE ── */
const AVATARS = [
  "🎮",
  "🦊",
  "🐉",
  "🎯",
  "🦁",
  "🤖",
  "👾",
  "🎪",
  "🦸",
  "🧙",
  "🐺",
  "🦅",
  "🐯",
  "🦄",
  "🎭",
  "🎨",
];
function ProfileScreen({ user, balance, accounts, onBack }) {
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const username =
    (user?.contact?.includes("@")
      ? user.contact.split("@")[0]
      : user?.contact) || "Member";
  const uidNum = useRef(Math.floor(100000 + Math.random() * 900000)).current;
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: "#F4F4F8",
        minHeight: "100vh",
        fontFamily: "'Poppins',sans-serif",
        paddingBottom: 20,
      }}
    >
      <div
        style={{
          background: gradient,
          padding: "0 0 32px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 20px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ‹
          </button>
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              flex: 1,
              textAlign: "center",
            }}
          >
            My Account
          </span>
          <div style={{ width: 30 }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 20px",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowAvatarPicker(true)}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(255,255,255,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                border: "3px solid rgba(255,255,255,.6)",
                cursor: "pointer",
              }}
            >
              {AVATARS[avatarIdx]}
            </div>
            <div
              onClick={() => setShowAvatarPicker(true)}
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#FFE082",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: "#333",
              }}
            >
              ✎
            </div>
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {username.toUpperCase()}
              <span
                style={{
                  background: "rgba(255,255,255,.2)",
                  borderRadius: 10,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                ⭐ VIP0
              </span>
            </div>
            <div
              style={{
                color: "rgba(255,255,255,.7)",
                fontSize: 12,
                marginTop: 3,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  background: "rgba(0,0,0,.2)",
                  borderRadius: 8,
                  padding: "2px 10px",
                  fontSize: 11,
                }}
              >
                UID | {uidNum}
              </span>
              <span style={{ cursor: "pointer" }}>📋</span>
            </div>
            <div
              style={{
                color: "rgba(255,255,255,.55)",
                fontSize: 11,
                marginTop: 4,
              }}
            >
              {user?.method === "mobile" ? "📱" : "📧"} {user?.contact}
            </div>
          </div>
        </div>
      </div>
      {showAvatarPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#0009",
            zIndex: 400,
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              margin: "0 auto",
              background: "#1A1A2E",
              borderRadius: "20px 20px 0 0",
              padding: 20,
              animation: "slideUp .3s ease",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              Choose Avatar
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(8,1fr)",
                gap: 10,
              }}
            >
              {AVATARS.map((a, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setAvatarIdx(i);
                    setShowAvatarPicker(false);
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: avatarIdx === i ? "#EF5350" : "#2A2A40",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    cursor: "pointer",
                    border:
                      avatarIdx === i
                        ? "2px solid #fff"
                        : "2px solid transparent",
                  }}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          background: "#fff",
          margin: "0 14px",
          marginTop: -16,
          borderRadius: 16,
          padding: "16px",
          boxShadow: "0 4px 20px #0001",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ color: G.sub, fontSize: 12, marginBottom: 4 }}>
          Total balance
        </div>
        <div style={{ fontWeight: 900, fontSize: 26, color: G.text }}>
          ৳{balance.toFixed(2)}
        </div>
        <div
          style={{
            display: "flex",
            gap: 0,
            marginTop: 14,
            justifyContent: "space-around",
          }}
        >
          {[
            { icon: "💳", label: "Wallet" },
            { icon: "📥", label: "Deposit" },
            { icon: "📤", label: "Withdraw" },
            { icon: "👑", label: "VIP" },
          ].map((a) => (
            <div
              key={a.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#FFF0F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {a.icon}
              </div>
              <span style={{ fontSize: 11, color: G.sub, fontWeight: 600 }}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 14px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {[
            {
              icon: "📊",
              label: "Game History",
              sub: "My game records",
              bg: "#EEF4FF",
            },
            {
              icon: "💱",
              label: "Transaction",
              sub: "Transfer history",
              bg: "#EDFFF5",
            },
            {
              icon: "📥",
              label: "Deposit",
              sub: "Deposit history",
              bg: "#FFF0F0",
            },
            {
              icon: "📤",
              label: "Withdraw",
              sub: "Withdrawal history",
              bg: "#FFF8E1",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 8px #0001",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: item.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: G.sub }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "16px",
            boxShadow: "0 2px 8px #0001",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            💳 Payment Accounts
          </div>
          <div
            style={{
              background: "#FFF8E1",
              borderRadius: 10,
              padding: "12px",
              marginBottom: 8,
              border: "1px solid #FFE082",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#E65100",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Main Account (permanent)
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: G.text }}>
              {accounts?.main || "Not configured"}
            </div>
          </div>
          {accounts?.extras?.filter(Boolean).map((e, i) => (
            <div
              key={i}
              style={{
                background: "#f5f5f5",
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 2 }}>
                Withdrawal #{i + 2}
              </div>
              <div style={{ fontWeight: 600, color: G.text }}>{e}</div>
            </div>
          ))}
        </div>
        <button
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 12,
            border: "none",
            background: "#FFF0F0",
            color: "#EF5350",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          🚪 Log Out
        </button>
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
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: "#F4F4F8",
        minHeight: "100vh",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <div style={{ background: gradient, padding: "0 0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 20px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ‹
          </button>
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              flex: 1,
              textAlign: "center",
            }}
          >
            Wallet
          </span>
          <div style={{ width: 30 }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
            Total Balance
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#fff",
              marginTop: 4,
            }}
          >
            ৳{balance.toFixed(2)}
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 14px" }}>
        <div
          style={{
            display: "flex",
            background: "#fff",
            borderRadius: 14,
            padding: 4,
            gap: 4,
            marginBottom: 20,
            boxShadow: "0 2px 8px #0001",
          }}
        >
          {["deposit", "withdraw"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setDone("");
                setAmount("");
              }}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                background: tab === t ? gradient : "transparent",
                color: tab === t ? "#fff" : "#aaa",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              {t === "deposit" ? "📥 Deposit" : "📤 Withdraw"}
            </button>
          ))}
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px",
            boxShadow: "0 2px 8px #0001",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: G.sub,
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            Amount (৳)
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "1.5px solid #eee",
              fontSize: 16,
              fontFamily: "'Poppins',sans-serif",
              marginBottom: 14,
              color: G.text,
              outline: "none",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p.toString())}
                style={{
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "1.5px solid #EF5350",
                  background: amount == p ? "#EF5350" : "#fff",
                  color: amount == p ? "#fff" : "#EF5350",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Poppins',sans-serif",
                }}
              >
                ৳{p}
              </button>
            ))}
          </div>
          {tab === "withdraw" && accounts && (
            <div
              style={{
                background: "#f5f5f5",
                borderRadius: 10,
                padding: "12px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: G.sub,
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Withdrawal account
              </div>
              <div style={{ fontWeight: 700, color: G.text }}>
                {accounts.main}
              </div>
            </div>
          )}
          {done && (
            <div
              style={{
                background: "#E8F5E9",
                borderRadius: 10,
                padding: "12px",
                marginBottom: 14,
                color: "#2E7D32",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {done}
            </div>
          )}
          <button
            onClick={tab === "deposit" ? doDeposit : doWithdraw}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 12,
              border: "none",
              background: gradient,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
              boxShadow: "0 6px 20px #EF535044",
            }}
          >
            {tab === "deposit" ? "Deposit Now" : "Request Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SUPPORT CHAT ── */
const QUICK = [
  "How to deposit?",
  "Withdrawal issue",
  "Account help",
  "Bonus info",
  "Check balance",
];
const AUTO_REPLIES = [
  "Thanks for reaching out! Our team will assist you shortly. 😊",
  "I understand your concern. Let me check that for you.",
  "Please provide your UID and we'll resolve this quickly!",
  "Your issue has been noted. Expected resolution: 24 hours.",
  "Is there anything else I can help you with today?",
];
function SupportChat({ onClose, user }) {
  const [messages, setMessages] = useState([
    {
      from: "support",
      text: "👋 Welcome to HGNICE Support! How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
  const send = (text) => {
    const t = text || input.trim();
    if (!t) return;
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((m) => [...m, { from: "user", text: t, time }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          from: "support",
          text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1400 + Math.random() * 800);
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        background: "#fff",
      }}
    >
      <div
        style={{
          background: "#075E54",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,.8)",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ‹
        </button>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#128C7E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          🎧
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            HGNICE Support
          </div>
          <div style={{ color: "#B2DFDB", fontSize: 11 }}>
            {typing ? "typing..." : "🟢 Online"}
          </div>
        </div>
        <span
          style={{
            color: "rgba(255,255,255,.7)",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          📞
        </span>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#E5DDD5",
          padding: "10px 10px 0",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <span
            style={{
              background: "rgba(255,255,255,.85)",
              borderRadius: 12,
              padding: "4px 14px",
              fontSize: 11,
              color: "#666",
            }}
          >
            TODAY
          </span>
        </div>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              animation: "msgIn .18s ease",
            }}
          >
            {msg.from === "support" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#128C7E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                  marginRight: 6,
                  marginTop: "auto",
                }}
              >
                🎧
              </div>
            )}
            <div
              style={{
                maxWidth: "76%",
                background: msg.from === "user" ? "#DCF8C6" : "#fff",
                borderRadius:
                  msg.from === "user"
                    ? "16px 4px 16px 16px"
                    : "4px 16px 16px 16px",
                padding: "9px 12px 6px",
                boxShadow: "0 1px 3px #0001",
              }}
            >
              {msg.from === "support" && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#075E54",
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  Support Agent
                </div>
              )}
              <div
                style={{
                  fontSize: 14,
                  color: "#1A1A2E",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#999",
                  textAlign: "right",
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 3,
                }}
              >
                {msg.time}
                {msg.from === "user" && (
                  <span style={{ color: "#34B7F1", fontSize: 12 }}>✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 6,
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#128C7E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              🎧
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "4px 16px 16px 16px",
                padding: "12px 16px",
                boxShadow: "0 1px 3px #0001",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#aaa",
                    animation: `dotBounce 1.2s ease-in-out ${
                      i * 0.15
                    }s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div
        style={{
          background: "#F0F0F0",
          padding: "8px 10px 4px",
          display: "flex",
          gap: 6,
          overflowX: "auto",
          borderTop: "1px solid #ddd",
          flexShrink: 0,
        }}
      >
        {QUICK.map((q, i) => (
          <button
            key={i}
            onClick={() => send(q)}
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 20,
              border: "1px solid #128C7E",
              background: "#fff",
              color: "#075E54",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            {q}
          </button>
        ))}
      </div>
      <div
        style={{
          background: "#F0F0F0",
          padding: "8px 10px 12px",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 24,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 1px 4px #0001",
          }}
        >
          <span style={{ fontSize: 20, cursor: "pointer" }}>😊</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type your message..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              background: "transparent",
              fontFamily: "'Poppins',sans-serif",
              color: "#1A1A2E",
            }}
          />
        </div>
        <button
          onClick={() => (input.trim() ? send() : null)}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: "none",
            background: "#128C7E",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: "0 2px 10px #128C7E55",
            flexShrink: 0,
          }}
        >
          {input.trim() ? "➤" : "🎤"}
        </button>
      </div>
    </div>
  );
}

/* ── TRADING SIMULATOR ── */
const LOTTIE_B64 = "eyJ2IjoiNS4xLjEzIiwiZnIiOjYwLCJpcCI6Miwib3AiOjE2OCwidyI6NTAwLCJoIjo1MDAsIm5tIjoiY2lyY2xlIGRlbGF5IiwiZGRkIjowLCJhc3NldHMiOltdLCJsYXllcnMiOlt7ImRkZCI6MCwiaW5kIjoxLCJ0eSI6NCwibm0iOiJTaGFwZSBMYXllciA2Iiwic3IiOjEsImtzIjp7Im8iOnsiYSI6MCwiayI6MTAwLCJpeCI6MTF9LCJyIjp7ImEiOjAsImsiOjAsIml4IjoxMH0sInAiOnsiYSI6MSwiayI6W3siaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6LTEzLCJzIjpbMTkzLDIyNC41LDBdLCJlIjpbMTkzLDI0NC41LDBdLCJ0byI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6MTQuMTY2LCJzIjpbMTkzLDI0NC41LDBdLCJlIjpbMTkzLDIyNC41LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6NDEuMzM0LCJzIjpbMTkzLDIyNC41LDBdLCJlIjpbMTkzLDI0NC41LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6NjguNSwicyI6WzE5MywyNDQuNSwwXSwiZSI6WzE5MywyMjQuNSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwzLjMzMzMzMzI1Mzg2MDQ3LDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjAuNjY3fSwibyI6eyJ4IjowLjMzMywieSI6MC4zMzN9LCJuIjoiMHA2NjdfMHA2NjdfMHAzMzNfMHAzMzMiLCJ0Ijo5NS42NjYsInMiOlsxOTMsMjI0LjUsMF0sImUiOlsxOTMsMjI0LjUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjc4NCwieSI6MH0sIm4iOiIwcDY2N18xXzBwNzg0XzAiLCJ0Ijo5NS43MjcsInMiOlsxOTMsMjI0LjUsMF0sImUiOlsxOTMsMjQ0LjUsMF0sInRvIjpbMCwzLjMzMzMzMzI1Mzg2MDQ3LDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjMzMywieSI6MH0sIm4iOiIwcDY2N18xXzBwMzMzXzAiLCJ0IjoxMjIuODM0LCJzIjpbMTkzLDI0NC41LDBdLCJlIjpbMTkzLDIyNC41LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDMuMzMzMzMzMjUzODYwNDcsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MC42Njd9LCJvIjp7IngiOjAuMzMzLCJ5IjowLjMzM30sIm4iOiIwcDY2N18wcDY2N18wcDMzM18wcDMzMyIsInQiOjE0OS45MzksInMiOlsxOTMsMjI0LjUsMF0sImUiOlsxOTMsMjI0LjUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjowLjY2N30sIm8iOnsieCI6MC4zMzMsInkiOjAuMzMzfSwibiI6IjBwNjY3XzBwNjY3XzBwMzMzXzBwMzMzIiwidCI6MTUwLCJzIjpbMTkzLDIyNC41LDBdLCJlIjpbMTkzLDIyNC41LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC43ODQsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDc4NF8wIiwidCI6MTUwLjA2MSwicyI6WzE5MywyMjQuNSwwXSwiZSI6WzE5MywyNDQuNSwwXSwidG8iOlswLDMuMzMzMzMzMjUzODYwNDcsMF0sInRpIjpbMCwwLDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuMzMzLCJ5IjowfSwibiI6IjBwNjY3XzFfMHAzMzNfMCIsInQiOjE3Ny4xNjgsInMiOlsxOTMsMjQ0LjUsMF0sImUiOlsxOTMsMjI0LjUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjowLjY2N30sIm8iOnsieCI6MC4zMzMsInkiOjAuMzMzfSwibiI6IjBwNjY3XzBwNjY3XzBwMzMzXzBwMzMzIiwidCI6MjA0LjI3MywicyI6WzE5MywyMjQuNSwwXSwiZSI6WzE5MywyMjQuNSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwwLDBdfSx7InQiOjIwNC4zMzM5ODQzNzV9XSwiaXgiOjIsIngiOiJ2YXIgJGJtX3J0O1xudmFyIG4sIG4sIHQsIHQsIHYsIGFtcCwgZnJlcSwgZGVjYXksIE07XG4kYm1fcnQgPSBuID0gMDtcbmlmIChudW1LZXlzID4gMCkge1xuICAgICRibV9ydCA9IG4gPSBuZWFyZXN0S2V5KHRpbWUpLmluZGV4O1xuICAgIGlmIChrZXkobikudGltZSA+IHRpbWUpIHtcbiAgICAgICAgbi0tO1xuICAgIH1cbn1cbmlmIChuID09IDApIHtcbiAgICAkYm1fcnQgPSB0ID0gMDtcbn0gZWxzZSB7XG4gICAgJGJtX3J0ID0gdCA9IHN1Yih0aW1lLCBrZXkobikudGltZSk7XG59XG5pZiAobiA+IDApIHtcbiAgICB2ID0gdmVsb2NpdHlBdFRpbWUoc3ViKGtleShuKS50aW1lLCBkaXYodGhpc0NvbXAuZnJhbWVEdXJhdGlvbiwgMTApKSk7XG4gICAgYW1wID0gMTtcbiAgICBmcmVxID0gMjtcbiAgICBkZWNheSA9IDg7XG4gICAgTSA9IGRpdihNYXRoLnNpbihtdWwobXVsKG11bChmcmVxLCB0KSwgMiksIE1hdGguUEkpKSwgTWF0aC5leHAobXVsKGRlY2F5LCB0KSkpO1xuICAgICRibV9ydCA9IHN1bSh2YWx1ZSwgbXVsKG11bCh2LCBhbXApLCBNKSk7XG59IGVsc2Uge1xuICAgICRibV9ydCA9IHZhbHVlO1xufSJ9LCJhIjp7ImEiOjAsImsiOlstMTAyLjUsLTM1LjUsMF0sIml4IjoxfSwicyI6eyJhIjowLCJrIjpbMTAwLDEwMCwxMDBdLCJpeCI6Nn19LCJhbyI6MCwiZWYiOlt7InR5Ijo1LCJubSI6IkdyYWRpZW50IFJhbXAiLCJucCI6MTEsIm1uIjoiQURCRSBSYW1wIiwiaXgiOjEsImVuIjowLCJlZiI6W3sidHkiOjMsIm5tIjoiU3RhcnQgb2YgUmFtcCIsIm1uIjoiQURCRSBSYW1wLTAwMDEiLCJpeCI6MSwidiI6eyJhIjowLCJrIjpbMTM3LDEzNV0sIml4IjoxfX0seyJ0eSI6Miwibm0iOiJTdGFydCBDb2xvciIsIm1uIjoiQURCRSBSYW1wLTAwMDIiLCJpeCI6MiwidiI6eyJhIjowLCJrIjpbMC4zOTgwNTUwMTY5OTQsMC43Njg2Mjc0NjQ3NzEsMC4xOTU5MjQ2Mzk3MDIsMV0sIml4IjoyfX0seyJ0eSI6Mywibm0iOiJFbmQgb2YgUmFtcCIsIm1uIjoiQURCRSBSYW1wLTAwMDMiLCJpeCI6MywidiI6eyJhIjowLCJrIjpbMzY0LDM2NF0sIml4IjozfX0seyJ0eSI6Miwibm0iOiJFbmQgQ29sb3IiLCJtbiI6IkFEQkUgUmFtcC0wMDA0IiwiaXgiOjQsInYiOnsiYSI6MCwiayI6WzAuNTY0NzA1OTA4Mjk4LDAuNzQ5MDE5NjIyODAzLDAuMDQzMTM3MjU2MDU2LDFdLCJpeCI6NH19LHsidHkiOjcsIm5tIjoiUmFtcCBTaGFwZSIsIm1uIjoiQURCRSBSYW1wLTAwMDUiLCJpeCI6NSwidiI6eyJhIjowLCJrIjoxLCJpeCI6NX19LHsidHkiOjAsIm5tIjoiUmFtcCBTY2F0dGVyIiwibW4iOiJBREJFIFJhbXAtMDAwNiIsIml4Ijo2LCJ2Ijp7ImEiOjAsImsiOjAsIml4Ijo2fX0seyJ0eSI6MCwibm0iOiJCbGVuZCBXaXRoIE9yaWdpbmFsIiwibW4iOiJBREJFIFJhbXAtMDAwNyIsIml4Ijo3LCJ2Ijp7ImEiOjAsImsiOjAsIml4Ijo3fX0seyJ0eSI6Niwibm0iOiIiLCJtbiI6IkFEQkUgUmFtcC0wMDA4IiwiaXgiOjgsInYiOjB9LHsidHkiOjcsIm5tIjoiR1BVIFJlbmRlcmluZyIsIm1uIjoiQURCRSBGb3JjZSBDUFUgR1BVIiwiaXgiOjksInYiOnsiYSI6MCwiayI6MSwiaXgiOjl9fV19XSwic2hhcGVzIjpbeyJ0eSI6ImdyIiwiaXQiOlt7ImluZCI6MCwidHkiOiJzaCIsIml4IjoxLCJrcyI6eyJhIjowLCJrIjp7ImkiOltbMCwwXSxbMCwwXV0sIm8iOltbMCwwXSxbMCwwXV0sInYiOltbLTEwMi41LDExXSxbLTEwMi41LC04Ml1dLCJjIjpmYWxzZX0sIml4IjoyfSwibm0iOiJQYXRoIDEiLCJtbiI6IkFEQkUgVmVjdG9yIFNoYXBlIC0gR3JvdXAiLCJoZCI6ZmFsc2V9LHsidHkiOiJncyIsIm8iOnsiYSI6MCwiayI6MTAwLCJpeCI6OX0sInciOnsiYSI6MCwiayI6NCwiaXgiOjEwfSwiZyI6eyJwIjozLCJrIjp7ImEiOjAsImsiOlswLDAuNTY1LDAuNzQ5LDAuMDQzLDAuNSwwLjQ4MSwwLjc1OSwwLjEyLDEsMC4zOTgsMC43NjksMC4xOTZdLCJpeCI6OH19LCJzIjp7ImEiOjAsImsiOlswLDE5MS41XSwiaXgiOjR9LCJlIjp7ImEiOjAsImsiOlstMS41LC0yMTFdLCJpeCI6NX0sInQiOjEsImxjIjoxLCJsaiI6MSwibWwiOjQsIm5tIjoiR3JhZGllbnQgU3Ryb2tlIDEiLCJtbiI6IkFEQkUgVmVjdG9yIEdyYXBoaWMgLSBHLVN0cm9rZSIsImhkIjpmYWxzZX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMCwwXSwiaXgiOjJ9LCJhIjp7ImEiOjAsImsiOlswLDBdLCJpeCI6MX0sInMiOnsiYSI6MCwiayI6WzEwMCwxMDBdLCJpeCI6M30sInIiOnsiYSI6MCwiayI6MCwiaXgiOjZ9LCJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjd9LCJzayI6eyJhIjowLCJrIjowLCJpeCI6NH0sInNhIjp7ImEiOjAsImsiOjAsIml4Ijo1fSwibm0iOiJUcmFuc2Zvcm0ifV0sIm5tIjoiU2hhcGUgMiIsIm5wIjozLCJjaXgiOjIsIml4IjoxLCJtbiI6IkFEQkUgVmVjdG9yIEdyb3VwIiwiaGQiOmZhbHNlfSx7InR5IjoiZ3IiLCJpdCI6W3siaW5kIjowLCJ0eSI6InNoIiwiaXgiOjEsImtzIjp7ImEiOjAsImsiOnsiaSI6W1swLDBdLFswLDBdXSwibyI6W1swLDBdLFswLDBdXSwidiI6W1stMTAyLjUsNC41XSxbLTEwMi41LC03NS41XV0sImMiOmZhbHNlfSwiaXgiOjJ9LCJubSI6IlBhdGggMSIsIm1uIjoiQURCRSBWZWN0b3IgU2hhcGUgLSBHcm91cCIsImhkIjpmYWxzZX0seyJ0eSI6ImdzIiwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo5fSwidyI6eyJhIjowLCJrIjoyMCwiaXgiOjEwfSwiZyI6eyJwIjozLCJrIjp7ImEiOjAsImsiOlswLDAuNTY1LDAuNzQ5LDAuMDQzLDAuNSwwLjQ4MSwwLjc1OSwwLjEyLDEsMC4zOTgsMC43NjksMC4xOTZdLCJpeCI6OH19LCJzIjp7ImEiOjAsImsiOlswLDIwNi41XSwiaXgiOjR9LCJlIjp7ImEiOjAsImsiOlswLC0yMDIuNV0sIml4Ijo1fSwidCI6MSwibGMiOjEsImxqIjoxLCJtbCI6NCwibm0iOiJHcmFkaWVudCBTdHJva2UgMSIsIm1uIjoiQURCRSBWZWN0b3IgR3JhcGhpYyAtIEctU3Ryb2tlIiwiaGQiOmZhbHNlfSx7InR5IjoidHIiLCJwIjp7ImEiOjAsImsiOlswLDBdLCJpeCI6Mn0sImEiOnsiYSI6MCwiayI6WzAsMF0sIml4IjoxfSwicyI6eyJhIjowLCJrIjpbMTAwLDEwMF0sIml4IjozfSwiciI6eyJhIjowLCJrIjowLCJpeCI6Nn0sIm8iOnsiYSI6MCwiayI6MTAwLCJpeCI6N30sInNrIjp7ImEiOjAsImsiOjAsIml4Ijo0fSwic2EiOnsiYSI6MCwiayI6MCwiaXgiOjV9LCJubSI6IlRyYW5zZm9ybSJ9XSwibm0iOiJTaGFwZSAxIiwibnAiOjMsImNpeCI6MiwiaXgiOjIsIm1uIjoiQURCRSBWZWN0b3IgR3JvdXAiLCJoZCI6ZmFsc2V9XSwiaXAiOjIsIm9wIjoyNDYsInN0IjoyLCJibSI6MH0seyJkZGQiOjAsImluZCI6MiwidHkiOjQsIm5tIjoiU2hhcGUgTGF5ZXIgMyIsInNyIjoxLCJrcyI6eyJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjExfSwiciI6eyJhIjowLCJrIjowLCJpeCI6MTB9LCJwIjp7ImEiOjEsImsiOlt7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuMzMzLCJ5IjowfSwibiI6IjBwNjY3XzFfMHAzMzNfMCIsInQiOi04LCJzIjpbMjMyLDI1NSwwXSwiZSI6WzIzMiwyNzUsMF0sInRvIjpbMCwzLjMzMzMzMzI1Mzg2MDQ3LDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjMzMywieSI6MH0sIm4iOiIwcDY2N18xXzBwMzMzXzAiLCJ0IjoxOS4xNjYsInMiOlsyMzIsMjc1LDBdLCJlIjpbMjMyLDI1NSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwwLDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuMzMzLCJ5IjowfSwibiI6IjBwNjY3XzFfMHAzMzNfMCIsInQiOjQ2LjMzNCwicyI6WzIzMiwyNTUsMF0sImUiOlsyMzIsMjc1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6NzMuNSwicyI6WzIzMiwyNzUsMF0sImUiOlsyMzIsMjU1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDMuMzMzMzMzMjUzODYwNDcsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MC42Njd9LCJvIjp7IngiOjAuMzMzLCJ5IjowLjMzM30sIm4iOiIwcDY2N18wcDY2N18wcDMzM18wcDMzMyIsInQiOjEwMC42NjYsInMiOlsyMzIsMjU1LDBdLCJlIjpbMjMyLDI1NSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwwLDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuNzg0LCJ5IjowfSwibiI6IjBwNjY3XzFfMHA3ODRfMCIsInQiOjEwMC43MjcsInMiOlsyMzIsMjU1LDBdLCJlIjpbMjMyLDI3NSwwXSwidG8iOlswLDMuMzMzMzMzMjUzODYwNDcsMF0sInRpIjpbMCwwLDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuMzMzLCJ5IjowfSwibiI6IjBwNjY3XzFfMHAzMzNfMCIsInQiOjEyNy44MzQsInMiOlsyMzIsMjc1LDBdLCJlIjpbMjMyLDI1NSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwzLjMzMzMzMzI1Mzg2MDQ3LDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjAuNjY3fSwibyI6eyJ4IjowLjMzMywieSI6MC4zMzN9LCJuIjoiMHA2NjdfMHA2NjdfMHAzMzNfMHAzMzMiLCJ0IjoxNTQuOTM5LCJzIjpbMjMyLDI1NSwwXSwiZSI6WzIzMiwyNTUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjowLjY2N30sIm8iOnsieCI6MC4zMzMsInkiOjAuMzMzfSwibiI6IjBwNjY3XzBwNjY3XzBwMzMzXzBwMzMzIiwidCI6MTU1LCJzIjpbMjMyLDI1NSwwXSwiZSI6WzIzMiwyNTUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjc4NCwieSI6MH0sIm4iOiIwcDY2N18xXzBwNzg0XzAiLCJ0IjoxNTUuMDYxLCJzIjpbMjMyLDI1NSwwXSwiZSI6WzIzMiwyNzUsMF0sInRvIjpbMCwzLjMzMzMzMzI1Mzg2MDQ3LDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjMzMywieSI6MH0sIm4iOiIwcDY2N18xXzBwMzMzXzAiLCJ0IjoxODIuMTY4LCJzIjpbMjMyLDI3NSwwXSwiZSI6WzIzMiwyNTUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjowLjY2N30sIm8iOnsieCI6MC4zMzMsInkiOjAuMzMzfSwibiI6IjBwNjY3XzBwNjY3XzBwMzMzXzBwMzMzIiwidCI6MjA5LjI3MywicyI6WzIzMiwyNTUsMF0sImUiOlsyMzIsMjU1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsidCI6MjA5LjMzMzk4NDM3NX1dLCJpeCI6MiwieCI6InZhciAkYm1fcnQ7XG52YXIgbiwgbiwgdCwgdCwgdiwgYW1wLCBmcmVxLCBkZWNheSwgTTtcbiRibV9ydCA9IG4gPSAwO1xuaWYgKG51bUtleXMgPiAwKSB7XG4gICAgJGJtX3J0ID0gbiA9IG5lYXJlc3RLZXkodGltZSkuaW5kZXg7XG4gICAgaWYgKGtleShuKS50aW1lID4gdGltZSkge1xuICAgICAgICBuLS07XG4gICAgfVxufVxuaWYgKG4gPT0gMCkge1xuICAgICRibV9ydCA9IHQgPSAwO1xufSBlbHNlIHtcbiAgICAkYm1fcnQgPSB0ID0gc3ViKHRpbWUsIGtleShuKS50aW1lKTtcbn1cbmlmIChuID4gMCkge1xuICAgIHYgPSB2ZWxvY2l0eUF0VGltZShzdWIoa2V5KG4pLnRpbWUsIGRpdih0aGlzQ29tcC5mcmFtZUR1cmF0aW9uLCAxMCkpKTtcbiAgICBhbXAgPSAxO1xuICAgIGZyZXEgPSAyO1xuICAgIGRlY2F5ID0gODtcbiAgICBNID0gZGl2KE1hdGguc2luKG11bChtdWwobXVsKGZyZXEsIHQpLCAyKSwgTWF0aC5QSSkpLCBNYXRoLmV4cChtdWwoZGVjYXksIHQpKSk7XG4gICAgJGJtX3J0ID0gc3VtKHZhbHVlLCBtdWwobXVsKHYsIGFtcCksIE0pKTtcbn0gZWxzZSB7XG4gICAgJGJtX3J0ID0gdmFsdWU7XG59In0sImEiOnsiYSI6MCwiayI6Wy02NSwtNSwwXSwiaXgiOjF9LCJzIjp7ImEiOjAsImsiOlsxMDAsMTAwLDEwMF0sIml4Ijo2fX0sImFvIjowLCJlZiI6W3sidHkiOjUsIm5tIjoiR3JhZGllbnQgUmFtcCAyIiwibnAiOjExLCJtbiI6IkFEQkUgUmFtcCIsIml4IjoxLCJlbiI6MCwiZWYiOlt7InR5IjozLCJubSI6IlN0YXJ0IG9mIFJhbXAiLCJtbiI6IkFEQkUgUmFtcC0wMDAxIiwiaXgiOjEsInYiOnsiYSI6MCwiayI6WzEzNywxMzVdLCJpeCI6MX19LHsidHkiOjIsIm5tIjoiU3RhcnQgQ29sb3IiLCJtbiI6IkFEQkUgUmFtcC0wMDAyIiwiaXgiOjIsInYiOnsiYSI6MCwiayI6WzAuNzM3MjU0OTE3NjIyLDAuMTU2MTI0NTYyMDI1LDAuMjY1NTEzODk2OTQyLDFdLCJpeCI6Mn19LHsidHkiOjMsIm5tIjoiRW5kIG9mIFJhbXAiLCJtbiI6IkFEQkUgUmFtcC0wMDAzIiwiaXgiOjMsInYiOnsiYSI6MCwiayI6WzM2NCwzNjRdLCJpeCI6M319LHsidHkiOjIsIm5tIjoiRW5kIENvbG9yIiwibW4iOiJBREJFIFJhbXAtMDAwNCIsIml4Ijo0LCJ2Ijp7ImEiOjAsImsiOlswLjY2Mjc0NTExODE0MSwwLjIxNTcxNzAzMjU1MiwwLjMxMDM4MTcxMDUyOSwxXSwiaXgiOjR9fSx7InR5Ijo3LCJubSI6IlJhbXAgU2hhcGUiLCJtbiI6IkFEQkUgUmFtcC0wMDA1IiwiaXgiOjUsInYiOnsiYSI6MCwiayI6MSwiaXgiOjV9fSx7InR5IjowLCJubSI6IlJhbXAgU2NhdHRlciIsIm1uIjoiQURCRSBSYW1wLTAwMDYiLCJpeCI6NiwidiI6eyJhIjowLCJrIjowLCJpeCI6Nn19LHsidHkiOjAsIm5tIjoiQmxlbmQgV2l0aCBPcmlnaW5hbCIsIm1uIjoiQURCRSBSYW1wLTAwMDciLCJpeCI6NywidiI6eyJhIjowLCJrIjowLCJpeCI6N319LHsidHkiOjYsIm5tIjoiIiwibW4iOiJBREJFIFJhbXAtMDAwOCIsIml4Ijo4LCJ2IjowfSx7InR5Ijo3LCJubSI6IkdQVSBSZW5kZXJpbmciLCJtbiI6IkFEQkUgRm9yY2UgQ1BVIEdQVSIsIml4Ijo5LCJ2Ijp7ImEiOjAsImsiOjEsIml4Ijo5fX1dfV0sInNoYXBlcyI6W3sidHkiOiJnciIsIml0IjpbeyJpbmQiOjAsInR5Ijoic2giLCJpeCI6MSwia3MiOnsiYSI6MCwiayI6eyJpIjpbWzAsMF0sWzAsMF1dLCJvIjpbWzAsMF0sWzAsMF1dLCJ2IjpbWy02NSwtNDFdLFstNjUsMzFdXSwiYyI6ZmFsc2V9LCJpeCI6Mn0sIm5tIjoiUGF0aCAxIiwibW4iOiJBREJFIFZlY3RvciBTaGFwZSAtIEdyb3VwIiwiaGQiOmZhbHNlfSx7InR5IjoiZ3MiLCJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjl9LCJ3Ijp7ImEiOjAsImsiOjIwLCJpeCI6MTB9LCJnIjp7InAiOjMsImsiOnsiYSI6MCwiayI6WzAsMC42NjMsMC4yMTYsMC4zMSwwLjUsMC43LDAuMTg2LDAuMjg4LDEsMC43MzcsMC4xNTYsMC4yNjZdLCJpeCI6OH19LCJzIjp7ImEiOjAsImsiOlswLDIxMS42NjddLCJpeCI6NH0sImUiOnsiYSI6MCwiayI6WzIsLTI1MS41XSwiaXgiOjV9LCJ0IjoxLCJsYyI6MSwibGoiOjEsIm1sIjo0LCJubSI6IkdyYWRpZW50IFN0cm9rZSAxIiwibW4iOiJBREJFIFZlY3RvciBHcmFwaGljIC0gRy1TdHJva2UiLCJoZCI6ZmFsc2V9LHsidHkiOiJ0ciIsInAiOnsiYSI6MCwiayI6WzAsMV0sIml4IjoyfSwiYSI6eyJhIjowLCJrIjpbMCwwXSwiaXgiOjF9LCJzIjp7ImEiOjAsImsiOlsxMDAsMTIwXSwiaXgiOjN9LCJyIjp7ImEiOjAsImsiOjAsIml4Ijo2fSwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo3fSwic2siOnsiYSI6MCwiayI6MCwiaXgiOjR9LCJzYSI6eyJhIjowLCJrIjowLCJpeCI6NX0sIm5tIjoiVHJhbnNmb3JtIn1dLCJubSI6IlNoYXBlIDQiLCJucCI6MiwiY2l4IjoyLCJpeCI6MSwibW4iOiJBREJFIFZlY3RvciBHcm91cCIsImhkIjpmYWxzZX0seyJ0eSI6ImdyIiwiaXQiOlt7ImluZCI6MCwidHkiOiJzaCIsIml4IjoxLCJrcyI6eyJhIjowLCJrIjp7ImkiOltbMCwwXSxbMCwwXV0sIm8iOltbMCwwXSxbMCwwXV0sInYiOltbLTY1LC00NS41ODNdLFstNjUsMzQuNzVdXSwiYyI6ZmFsc2V9LCJpeCI6Mn0sIm5tIjoiUGF0aCAxIiwibW4iOiJBREJFIFZlY3RvciBTaGFwZSAtIEdyb3VwIiwiaGQiOmZhbHNlfSx7InR5IjoiZ3MiLCJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjl9LCJ3Ijp7ImEiOjAsImsiOjQsIml4IjoxMH0sImciOnsicCI6MywiayI6eyJhIjowLCJrIjpbMCwwLjY2MywwLjIxNiwwLjMxLDAuNSwwLjcsMC4xODYsMC4yODgsMSwwLjczNywwLjE1NiwwLjI2Nl0sIml4Ijo4fX0sInMiOnsiYSI6MCwiayI6WzAsMjExLjY2N10sIml4Ijo0fSwiZSI6eyJhIjowLCJrIjpbMiwtMjUxLjVdLCJpeCI6NX0sInQiOjEsImxjIjoxLCJsaiI6MSwibWwiOjQsIm5tIjoiR3JhZGllbnQgU3Ryb2tlIDEiLCJtbiI6IkFEQkUgVmVjdG9yIEdyYXBoaWMgLSBHLVN0cm9rZSIsImhkIjpmYWxzZX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMCwxXSwiaXgiOjJ9LCJhIjp7ImEiOjAsImsiOlswLDBdLCJpeCI6MX0sInMiOnsiYSI6MCwiayI6WzEwMCwxMjBdLCJpeCI6M30sInIiOnsiYSI6MCwiayI6MCwiaXgiOjZ9LCJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjd9LCJzayI6eyJhIjowLCJrIjowLCJpeCI6NH0sInNhIjp7ImEiOjAsImsiOjAsIml4Ijo1fSwibm0iOiJUcmFuc2Zvcm0ifV0sIm5tIjoiU2hhcGUgMyIsIm5wIjoyLCJjaXgiOjIsIml4IjoyLCJtbiI6IkFEQkUgVmVjdG9yIEdyb3VwIiwiaGQiOmZhbHNlfV0sImlwIjoyLCJvcCI6MjQzLCJzdCI6MSwiYm0iOjB9LHsiZGRkIjowLCJpbmQiOjMsInR5Ijo0LCJubSI6IlNoYXBlIExheWVyIDQiLCJzciI6MSwia3MiOnsibyI6eyJhIjowLCJrIjoxMDAsIml4IjoxMX0sInIiOnsiYSI6MCwiayI6MCwiaXgiOjEwfSwicCI6eyJhIjoxLCJrIjpbeyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjMzMywieSI6MH0sIm4iOiIwcDY2N18xXzBwMzMzXzAiLCJ0IjotMywicyI6WzI3NCwyMjMuNzUsMF0sImUiOlsyNzQsMjQzLjc1LDBdLCJ0byI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6MjQuMTY2LCJzIjpbMjc0LDI0My43NSwwXSwiZSI6WzI3NCwyMjMuNzUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjMzMywieSI6MH0sIm4iOiIwcDY2N18xXzBwMzMzXzAiLCJ0Ijo1MS4zMzQsInMiOlsyNzQsMjIzLjc1LDBdLCJlIjpbMjc0LDI0My43NSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwwLDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuMzMzLCJ5IjowfSwibiI6IjBwNjY3XzFfMHAzMzNfMCIsInQiOjc4LjUsInMiOlsyNzQsMjQzLjc1LDBdLCJlIjpbMjc0LDIyMy43NSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwzLjMzMzMzMzI1Mzg2MDQ3LDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjAuNjY3fSwibyI6eyJ4IjowLjMzMywieSI6MC4zMzN9LCJuIjoiMHA2NjdfMHA2NjdfMHAzMzNfMHAzMzMiLCJ0IjoxMDUuNjY2LCJzIjpbMjc0LDIyMy43NSwwXSwiZSI6WzI3NCwyMjMuNzUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjc4NCwieSI6MH0sIm4iOiIwcDY2N18xXzBwNzg0XzAiLCJ0IjoxMDUuNzI3LCJzIjpbMjc0LDIyMy43NSwwXSwiZSI6WzI3NCwyNDMuNzUsMF0sInRvIjpbMCwzLjMzMzMzMzI1Mzg2MDQ3LDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjMzMywieSI6MH0sIm4iOiIwcDY2N18xXzBwMzMzXzAiLCJ0IjoxMzIuODM0LCJzIjpbMjc0LDI0My43NSwwXSwiZSI6WzI3NCwyMjMuNzUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjowLjY2N30sIm8iOnsieCI6MC4zMzMsInkiOjAuMzMzfSwibiI6IjBwNjY3XzBwNjY3XzBwMzMzXzBwMzMzIiwidCI6MTU5LjkzOSwicyI6WzI3NCwyMjMuNzUsMF0sImUiOlsyNzQsMjIzLjc1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MC42Njd9LCJvIjp7IngiOjAuMzMzLCJ5IjowLjMzM30sIm4iOiIwcDY2N18wcDY2N18wcDMzM18wcDMzMyIsInQiOjE2MCwicyI6WzI3NCwyMjMuNzUsMF0sImUiOlsyNzQsMjIzLjc1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC43ODQsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDc4NF8wIiwidCI6MTYwLjA2MSwicyI6WzI3NCwyMjMuNzUsMF0sImUiOlsyNzQsMjQzLjc1LDBdLCJ0byI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6MTg3LjE2OCwicyI6WzI3NCwyNDMuNzUsMF0sImUiOlsyNzQsMjIzLjc1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDMuMzMzMzMzMjUzODYwNDcsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MC42Njd9LCJvIjp7IngiOjAuMzMzLCJ5IjowLjMzM30sIm4iOiIwcDY2N18wcDY2N18wcDMzM18wcDMzMyIsInQiOjIxNC4yNzMsInMiOlsyNzQsMjIzLjc1LDBdLCJlIjpbMjc0LDIyMy43NSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwwLDBdfSx7InQiOjIxNC4zMzM5ODQzNzV9XSwiaXgiOjIsIngiOiJ2YXIgJGJtX3J0O1xudmFyIG4sIG4sIHQsIHQsIHYsIGFtcCwgZnJlcSwgZGVjYXksIE07XG4kYm1fcnQgPSBuID0gMDtcbmlmIChudW1LZXlzID4gMCkge1xuICAgICRibV9ydCA9IG4gPSBuZWFyZXN0S2V5KHRpbWUpLmluZGV4O1xuICAgIGlmIChrZXkobikudGltZSA+IHRpbWUpIHtcbiAgICAgICAgbi0tO1xuICAgIH1cbn1cbmlmIChuID09IDApIHtcbiAgICAkYm1fcnQgPSB0ID0gMDtcbn0gZWxzZSB7XG4gICAgJGJtX3J0ID0gdCA9IHN1Yih0aW1lLCBrZXkobikudGltZSk7XG59XG5pZiAobiA+IDApIHtcbiAgICB2ID0gdmVsb2NpdHlBdFRpbWUoc3ViKGtleShuKS50aW1lLCBkaXYodGhpc0NvbXAuZnJhbWVEdXJhdGlvbiwgMTApKSk7XG4gICAgYW1wID0gMTtcbiAgICBmcmVxID0gMjtcbiAgICBkZWNheSA9IDg7XG4gICAgTSA9IGRpdihNYXRoLnNpbihtdWwobXVsKG11bChmcmVxLCB0KSwgMiksIE1hdGguUEkpKSwgTWF0aC5leHAobXVsKGRlY2F5LCB0KSkpO1xuICAgICRibV9ydCA9IHN1bSh2YWx1ZSwgbXVsKG11bCh2LCBhbXApLCBNKSk7XG59IGVsc2Uge1xuICAgICRibV9ydCA9IHZhbHVlO1xufSJ9LCJhIjp7ImEiOjAsImsiOlstMjQuNSwtMzEuMjUsMF0sIml4IjoxfSwicyI6eyJhIjowLCJrIjpbMTAwLDEwMCwxMDBdLCJpeCI6Nn19LCJhbyI6MCwiZWYiOlt7InR5Ijo1LCJubSI6IkdyYWRpZW50IFJhbXAiLCJtbiI6IkFEQkUgUmFtcCIsIml4IjoxLCJlbiI6MCwibnAiOjExLCJlZiI6W3sidHkiOjMsIm5tIjoiU3RhcnQgb2YgUmFtcCIsIm1uIjoiQURCRSBSYW1wLTAwMDEiLCJpeCI6MSwidiI6eyJhIjowLCJrIjpbMTM3LDEzNV0sIml4IjoxfX0seyJ0eSI6Miwibm0iOiJTdGFydCBDb2xvciIsIm1uIjoiQURCRSBSYW1wLTAwMDIiLCJpeCI6MiwidiI6eyJhIjowLCJrIjpbMC4zOTgwNTUwMTY5OTQsMC43Njg2Mjc0NjQ3NzEsMC4xOTU5MjQ2Mzk3MDIsMV0sIml4IjoyfX0seyJ0eSI6Mywibm0iOiJFbmQgb2YgUmFtcCIsIm1uIjoiQURCRSBSYW1wLTAwMDMiLCJpeCI6MywidiI6eyJhIjowLCJrIjpbMzY0LDM2NF0sIml4IjozfX0seyJ0eSI6Miwibm0iOiJFbmQgQ29sb3IiLCJtbiI6IkFEQkUgUmFtcC0wMDA0IiwiaXgiOjQsInYiOnsiYSI6MCwiayI6WzAuNTY0NzA1OTA4Mjk4LDAuNzQ5MDE5NjIyODAzLDAuMDQzMTM3MjU2MDU2LDFdLCJpeCI6NH19LHsidHkiOjcsIm5tIjoiUmFtcCBTaGFwZSIsIm1uIjoiQURCRSBSYW1wLTAwMDUiLCJpeCI6NSwidiI6eyJhIjowLCJrIjoxLCJpeCI6NX19LHsidHkiOjAsIm5tIjoiUmFtcCBTY2F0dGVyIiwibW4iOiJBREJFIFJhbXAtMDAwNiIsIml4Ijo2LCJ2Ijp7ImEiOjAsImsiOjAsIml4Ijo2fX0seyJ0eSI6MCwibm0iOiJCbGVuZCBXaXRoIE9yaWdpbmFsIiwibW4iOiJBREJFIFJhbXAtMDAwNyIsIml4Ijo3LCJ2Ijp7ImEiOjAsImsiOjAsIml4Ijo3fX0seyJ0eSI6Niwibm0iOiIiLCJtbiI6IkFEQkUgUmFtcC0wMDA4IiwiaXgiOjgsInYiOjB9LHsidHkiOjcsIm5tIjoiR1BVIFJlbmRlcmluZyIsIm1uIjoiQURCRSBGb3JjZSBDUFUgR1BVIiwiaXgiOjksInYiOnsiYSI6MCwiayI6MSwiaXgiOjl9fV19XSwic2hhcGVzIjpbeyJ0eSI6ImdyIiwiaXQiOlt7ImluZCI6MCwidHkiOiJzaCIsIml4IjoxLCJrcyI6eyJhIjowLCJrIjp7ImkiOltbMCwwXSxbMCwwXV0sIm8iOltbMCwwXSxbMCwwXV0sInYiOltbLTI0LjUsLTddLFstMjQuNSwtNTUuNV1dLCJjIjpmYWxzZX0sIml4IjoyfSwibm0iOiJQYXRoIDEiLCJtbiI6IkFEQkUgVmVjdG9yIFNoYXBlIC0gR3JvdXAiLCJoZCI6ZmFsc2V9LHsidHkiOiJncyIsIm8iOnsiYSI6MCwiayI6MTAwLCJpeCI6OX0sInciOnsiYSI6MCwiayI6NCwiaXgiOjEwfSwiZyI6eyJwIjozLCJrIjp7ImEiOjAsImsiOlswLDAuNTY1LDAuNzQ5LDAuMDQzLDAuNSwwLjQ4MSwwLjc1OSwwLjEyLDEsMC4zOTgsMC43NjksMC4xOTZdLCJpeCI6OH19LCJzIjp7ImEiOjAsImsiOlswLDEyOS4xNjddLCJpeCI6NH0sImUiOnsiYSI6MCwiayI6Wy0wLjUsLTE0OC43NV0sIml4Ijo1fSwidCI6MSwibGMiOjEsImxqIjoxLCJtbCI6NCwibm0iOiJHcmFkaWVudCBTdHJva2UgMSIsIm1uIjoiQURCRSBWZWN0b3IgR3JhcGhpYyAtIEctU3Ryb2tlIiwiaGQiOmZhbHNlfSx7InR5IjoidHIiLCJwIjp7ImEiOjAsImsiOlswLDYuNV0sIml4IjoyfSwiYSI6eyJhIjowLCJrIjpbMCwwXSwiaXgiOjF9LCJzIjp7ImEiOjAsImsiOlsxMDAsMTIwXSwiaXgiOjN9LCJyIjp7ImEiOjAsImsiOjAsIml4Ijo2fSwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo3fSwic2siOnsiYSI6MCwiayI6MCwiaXgiOjR9LCJzYSI6eyJhIjowLCJrIjowLCJpeCI6NX0sIm5tIjoiVHJhbnNmb3JtIn1dLCJubSI6IlNoYXBlIDIiLCJucCI6MiwiY2l4IjoyLCJpeCI6MSwibW4iOiJBREJFIFZlY3RvciBHcm91cCIsImhkIjpmYWxzZX0seyJ0eSI6ImdyIiwiaXQiOlt7ImluZCI6MCwidHkiOiJzaCIsIml4IjoxLCJrcyI6eyJhIjowLCJrIjp7ImkiOltbMCwwXSxbMCwwXV0sIm8iOltbMCwwXSxbMCwwXV0sInYiOltbLTI0LjUsLTddLFstMjQuNSwtNTUuNV1dLCJjIjpmYWxzZX0sIml4IjoyfSwibm0iOiJQYXRoIDEiLCJtbiI6IkFEQkUgVmVjdG9yIFNoYXBlIC0gR3JvdXAiLCJoZCI6ZmFsc2V9LHsidHkiOiJncyIsIm8iOnsiYSI6MCwiayI6MTAwLCJpeCI6OX0sInciOnsiYSI6MCwiayI6MjAsIml4IjoxMH0sImciOnsicCI6MywiayI6eyJhIjowLCJrIjpbMCwwLjU2NSwwLjc0OSwwLjA0MywwLjUsMC40ODEsMC43NTksMC4xMiwxLDAuMzk4LDAuNzY5LDAuMTk2XSwiaXgiOjh9fSwicyI6eyJhIjowLCJrIjpbMCwxNjEuNV0sIml4Ijo0fSwiZSI6eyJhIjowLCJrIjpbLTEuNSwtMTgzLjVdLCJpeCI6NX0sInQiOjEsImxjIjoxLCJsaiI6MSwibWwiOjQsIm5tIjoiR3JhZGllbnQgU3Ryb2tlIDEiLCJtbiI6IkFEQkUgVmVjdG9yIEdyYXBoaWMgLSBHLVN0cm9rZSIsImhkIjpmYWxzZX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMC41LDBdLCJpeCI6Mn0sImEiOnsiYSI6MCwiayI6WzAsMF0sIml4IjoxfSwicyI6eyJhIjowLCJrIjpbMTAwLDEwMF0sIml4IjozfSwiciI6eyJhIjowLCJrIjowLCJpeCI6Nn0sIm8iOnsiYSI6MCwiayI6MTAwLCJpeCI6N30sInNrIjp7ImEiOjAsImsiOjAsIml4Ijo0fSwic2EiOnsiYSI6MCwiayI6MCwiaXgiOjV9LCJubSI6IlRyYW5zZm9ybSJ9XSwibm0iOiJTaGFwZSAxIiwibnAiOjMsImNpeCI6MiwiaXgiOjIsIm1uIjoiQURCRSBWZWN0b3IgR3JvdXAiLCJoZCI6ZmFsc2V9XSwiaXAiOjIsIm9wIjoyNDAsInN0IjowLCJibSI6MH0seyJkZGQiOjAsImluZCI6NCwidHkiOjQsIm5tIjoiU2hhcGUgTGF5ZXIgNSIsInNyIjoxLCJrcyI6eyJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjExfSwiciI6eyJhIjowLCJrIjowLCJpeCI6MTB9LCJwIjp7ImEiOjEsImsiOlt7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuMzMzLCJ5IjowfSwibiI6IjBwNjY3XzFfMHAzMzNfMCIsInQiOjIsInMiOlszMTQsMjQ5Ljc1LDBdLCJlIjpbMzE0LDI2OS43NSwwXSwidG8iOlswLDMuMzMzMzMzMjUzODYwNDcsMF0sInRpIjpbMCwwLDBdfSx7ImkiOnsieCI6MC42NjcsInkiOjF9LCJvIjp7IngiOjAuMzMzLCJ5IjowfSwibiI6IjBwNjY3XzFfMHAzMzNfMCIsInQiOjI5LjE2NiwicyI6WzMxNCwyNjkuNzUsMF0sImUiOlszMTQsMjQ5Ljc1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6NTYuMzM0LCJzIjpbMzE0LDI0OS43NSwwXSwiZSI6WzMxNCwyNjkuNzUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMCwwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjoxfSwibyI6eyJ4IjowLjMzMywieSI6MH0sIm4iOiIwcDY2N18xXzBwMzMzXzAiLCJ0Ijo4My41LCJzIjpbMzE0LDI2OS43NSwwXSwiZSI6WzMxNCwyNDkuNzUsMF0sInRvIjpbMCwwLDBdLCJ0aSI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXX0seyJpIjp7IngiOjAuNjY3LCJ5IjowLjY2N30sIm8iOnsieCI6MC4zMzMsInkiOjAuMzMzfSwibiI6IjBwNjY3XzBwNjY3XzBwMzMzXzBwMzMzIiwidCI6MTEwLjY2NiwicyI6WzMxNCwyNDkuNzUsMF0sImUiOlszMTQsMjQ5Ljc1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC43ODQsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDc4NF8wIiwidCI6MTEwLjcyNywicyI6WzMxNCwyNDkuNzUsMF0sImUiOlszMTQsMjY5Ljc1LDBdLCJ0byI6WzAsMy4zMzMzMzMyNTM4NjA0NywwXSwidGkiOlswLDAsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MX0sIm8iOnsieCI6MC4zMzMsInkiOjB9LCJuIjoiMHA2NjdfMV8wcDMzM18wIiwidCI6MTM3LjgzNCwicyI6WzMxNCwyNjkuNzUsMF0sImUiOlszMTQsMjQ5Ljc1LDBdLCJ0byI6WzAsMCwwXSwidGkiOlswLDMuMzMzMzMzMjUzODYwNDcsMF19LHsiaSI6eyJ4IjowLjY2NywieSI6MC42Njd9LCJvIjp7IngiOjAuMzMzLCJ5IjowLjMzM30sIm4iOiIwcDY2N18wcDY2N18wcDMzM18wcDMzMyIsInQiOjE2NC45MzksInMiOlszMTQsMjQ5Ljc1LDBdLCJlIjpbMzE0LDI0OS43NSwwXSwidG8iOlswLDAsMF0sInRpIjpbMCwwLDBdfSx7InQiOjE2NX1dLCJpeCI6MiwieCI6InZhciAkYm1fcnQ7XG52YXIgbiwgbiwgdCwgdCwgdiwgYW1wLCBmcmVxLCBkZWNheSwgTTtcbiRibV9ydCA9IG4gPSAwO1xuaWYgKG51bUtleXMgPiAwKSB7XG4gICAgJGJtX3J0ID0gbiA9IG5lYXJlc3RLZXkodGltZSkuaW5kZXg7XG4gICAgaWYgKGtleShuKS50aW1lID4gdGltZSkge1xuICAgICAgICBuLS07XG4gICAgfVxufVxuaWYgKG4gPT0gMCkge1xuICAgICRibV9ydCA9IHQgPSAwO1xufSBlbHNlIHtcbiAgICAkYm1fcnQgPSB0ID0gc3ViKHRpbWUsIGtleShuKS50aW1lKTtcbn1cbmlmIChuID4gMCkge1xuICAgIHYgPSB2ZWxvY2l0eUF0VGltZShzdWIoa2V5KG4pLnRpbWUsIGRpdih0aGlzQ29tcC5mcmFtZUR1cmF0aW9uLCAxMCkpKTtcbiAgICBhbXAgPSAxO1xuICAgIGZyZXEgPSAyO1xuICAgIGRlY2F5ID0gODtcbiAgICBNID0gZGl2KE1hdGguc2luKG11bChtdWwobXVsKGZyZXEsIHQpLCAyKSwgTWF0aC5QSSkpLCBNYXRoLmV4cChtdWwoZGVjYXksIHQpKSk7XG4gICAgJGJtX3J0ID0gc3VtKHZhbHVlLCBtdWwobXVsKHYsIGFtcCksIE0pKTtcbn0gZWxzZSB7XG4gICAgJGJtX3J0ID0gdmFsdWU7XG59In0sImEiOnsiYSI6MCwiayI6WzguNSwtNS4yNSwwXSwiaXgiOjF9LCJzIjp7ImEiOjAsImsiOlsxMDAsMTAwLDEwMF0sIml4Ijo2fX0sImFvIjowLCJlZiI6W3sidHkiOjUsIm5tIjoiR3JhZGllbnQgUmFtcCAyIiwibnAiOjExLCJtbiI6IkFEQkUgUmFtcCIsIml4IjoxLCJlbiI6MCwiZWYiOlt7InR5IjozLCJubSI6IlN0YXJ0IG9mIFJhbXAiLCJtbiI6IkFEQkUgUmFtcC0wMDAxIiwiaXgiOjEsInYiOnsiYSI6MCwiayI6WzEzNywxMzVdLCJpeCI6MX19LHsidHkiOjIsIm5tIjoiU3RhcnQgQ29sb3IiLCJtbiI6IkFEQkUgUmFtcC0wMDAyIiwiaXgiOjIsInYiOnsiYSI6MCwiayI6WzAuNzM3MjU0OTE3NjIyLDAuMTU2MTI0NTYyMDI1LDAuMjY1NTEzODk2OTQyLDFdLCJpeCI6Mn19LHsidHkiOjMsIm5tIjoiRW5kIG9mIFJhbXAiLCJtbiI6IkFEQkUgUmFtcC0wMDAzIiwiaXgiOjMsInYiOnsiYSI6MCwiayI6WzM2NCwzNjRdLCJpeCI6M319LHsidHkiOjIsIm5tIjoiRW5kIENvbG9yIiwibW4iOiJBREJFIFJhbXAtMDAwNCIsIml4Ijo0LCJ2Ijp7ImEiOjAsImsiOlswLjY2Mjc0NTExODE0MSwwLjIxNTcxNzAzMjU1MiwwLjMxMDM4MTcxMDUyOSwxXSwiaXgiOjR9fSx7InR5Ijo3LCJubSI6IlJhbXAgU2hhcGUiLCJtbiI6IkFEQkUgUmFtcC0wMDA1IiwiaXgiOjUsInYiOnsiYSI6MCwiayI6MSwiaXgiOjV9fSx7InR5IjowLCJubSI6IlJhbXAgU2NhdHRlciIsIm1uIjoiQURCRSBSYW1wLTAwMDYiLCJpeCI6NiwidiI6eyJhIjowLCJrIjowLCJpeCI6Nn19LHsidHkiOjAsIm5tIjoiQmxlbmQgV2l0aCBPcmlnaW5hbCIsIm1uIjoiQURCRSBSYW1wLTAwMDciLCJpeCI6NywidiI6eyJhIjowLCJrIjowLCJpeCI6N319LHsidHkiOjYsIm5tIjoiIiwibW4iOiJBREJFIFJhbXAtMDAwOCIsIml4Ijo4LCJ2IjowfSx7InR5Ijo3LCJubSI6IkdQVSBSZW5kZXJpbmciLCJtbiI6IkFEQkUgRm9yY2UgQ1BVIEdQVSIsIml4Ijo5LCJ2Ijp7ImEiOjAsImsiOjEsIml4Ijo5fX1dfV0sInNoYXBlcyI6W3sidHkiOiJnciIsIml0IjpbeyJpbmQiOjAsInR5Ijoic2giLCJpeCI6MSwia3MiOnsiYSI6MCwiayI6eyJpIjpbWzAsMF0sWzAsMF1dLCJvIjpbWzAsMF0sWzAsMF1dLCJ2IjpbWzguNSwtMjYuOTU4XSxbOC41LDE1XV0sImMiOmZhbHNlfSwiaXgiOjJ9LCJubSI6IlBhdGggMSIsIm1uIjoiQURCRSBWZWN0b3IgU2hhcGUgLSBHcm91cCIsImhkIjpmYWxzZX0seyJ0eSI6ImdzIiwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo5fSwidyI6eyJhIjowLCJrIjo0LCJpeCI6MTB9LCJnIjp7InAiOjMsImsiOnsiYSI6MCwiayI6WzAsMC42NjMsMC4yMTYsMC4zMSwwLjUsMC43LDAuMTg2LDAuMjg4LDEsMC43MzcsMC4xNTYsMC4yNjZdLCJpeCI6OH19LCJzIjp7ImEiOjAsImsiOlswLDIxMS42NjddLCJpeCI6NH0sImUiOnsiYSI6MCwiayI6WzIsLTI1MS41XSwiaXgiOjV9LCJ0IjoxLCJsYyI6MSwibGoiOjEsIm1sIjo0LCJubSI6IkdyYWRpZW50IFN0cm9rZSAxIiwibW4iOiJBREJFIFZlY3RvciBHcmFwaGljIC0gRy1TdHJva2UiLCJoZCI6ZmFsc2V9LHsidHkiOiJ0ciIsInAiOnsiYSI6MCwiayI6WzAsMl0sIml4IjoyfSwiYSI6eyJhIjowLCJrIjpbMCwwXSwiaXgiOjF9LCJzIjp7ImEiOjAsImsiOlsxMDAsMTIwXSwiaXgiOjN9LCJyIjp7ImEiOjAsImsiOjAsIml4Ijo2fSwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo3fSwic2siOnsiYSI6MCwiayI6MCwiaXgiOjR9LCJzYSI6eyJhIjowLCJrIjowLCJpeCI6NX0sIm5tIjoiVHJhbnNmb3JtIn1dLCJubSI6IlNoYXBlIDIiLCJucCI6MywiY2l4IjoyLCJpeCI6MSwibW4iOiJBREJFIFZlY3RvciBHcm91cCIsImhkIjpmYWxzZX0seyJ0eSI6ImdyIiwiaXQiOlt7ImluZCI6MCwidHkiOiJzaCIsIml4IjoxLCJrcyI6eyJhIjowLCJrIjp7ImkiOltbMCwwXSxbMCwwXV0sIm8iOltbMCwwXSxbMCwwXV0sInYiOltbOC41LC0yNS41XSxbOC41LDE1XV0sImMiOmZhbHNlfSwiaXgiOjJ9LCJubSI6IlBhdGggMSIsIm1uIjoiQURCRSBWZWN0b3IgU2hhcGUgLSBHcm91cCIsImhkIjpmYWxzZX0seyJ0eSI6ImdzIiwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo5fSwidyI6eyJhIjowLCJrIjoyMCwiaXgiOjEwfSwiZyI6eyJwIjozLCJrIjp7ImEiOjAsImsiOlswLDAuNjYzLDAuMjE2LDAuMzEsMC41LDAuNywwLjE4NiwwLjI4OCwxLDAuNzM3LDAuMTU2LDAuMjY2XSwiaXgiOjh9fSwicyI6eyJhIjowLCJrIjpbMCwyMTEuNjY3XSwiaXgiOjR9LCJlIjp7ImEiOjAsImsiOlsyLC0yNTEuNV0sIml4Ijo1fSwidCI6MSwibGMiOjEsImxqIjoxLCJtbCI6NCwibm0iOiJHcmFkaWVudCBTdHJva2UgMSIsIm1uIjoiQURCRSBWZWN0b3IgR3JhcGhpYyAtIEctU3Ryb2tlIiwiaGQiOmZhbHNlfSx7InR5IjoidHIiLCJwIjp7ImEiOjAsImsiOlswLDBdLCJpeCI6Mn0sImEiOnsiYSI6MCwiayI6WzAsMF0sIml4IjoxfSwicyI6eyJhIjowLCJrIjpbMTAwLDEwMF0sIml4IjozfSwiciI6eyJhIjowLCJrIjowLCJpeCI6Nn0sIm8iOnsiYSI6MCwiayI6MTAwLCJpeCI6N30sInNrIjp7ImEiOjAsImsiOjAsIml4Ijo0fSwic2EiOnsiYSI6MCwiayI6MCwiaXgiOjV9LCJubSI6IlRyYW5zZm9ybSJ9XSwibm0iOiJTaGFwZSAxIiwibnAiOjMsImNpeCI6MiwiaXgiOjIsIm1uIjoiQURCRSBWZWN0b3IgR3JvdXAiLCJoZCI6ZmFsc2V9XSwiaXAiOjIsIm9wIjoyNDAsInN0IjowLCJibSI6MH0seyJkZGQiOjAsImluZCI6NiwidHkiOjQsIm5tIjoiU2hhcGUgTGF5ZXIgMiIsInNyIjoxLCJrcyI6eyJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjExfSwiciI6eyJhIjowLCJrIjowLCJpeCI6MTB9LCJwIjp7ImEiOjAsImsiOlsyNTAsMjQ5LDBdLCJpeCI6Mn0sImEiOnsiYSI6MCwiayI6WzAsLTEsMF0sIml4IjoxfSwicyI6eyJhIjowLCJrIjpbMTAwLDEwMCwxMDBdLCJpeCI6Nn19LCJhbyI6MCwiZWYiOlt7InR5Ijo1LCJubSI6IkdyYWRpZW50IFJhbXAiLCJucCI6MTEsIm1uIjoiQURCRSBSYW1wIiwiaXgiOjEsImVuIjowLCJlZiI6W3sidHkiOjMsIm5tIjoiU3RhcnQgb2YgUmFtcCIsIm1uIjoiQURCRSBSYW1wLTAwMDEiLCJpeCI6MSwidiI6eyJhIjowLCJrIjpbMTM3LDEzNV0sIml4IjoxfX0seyJ0eSI6Miwibm0iOiJTdGFydCBDb2xvciIsIm1uIjoiQURCRSBSYW1wLTAwMDIiLCJpeCI6MiwidiI6eyJhIjowLCJrIjpbMC4zOTgwNTUwMTY5OTQsMC43Njg2Mjc0NjQ3NzEsMC4xOTU5MjQ2Mzk3MDIsMV0sIml4IjoyfX0seyJ0eSI6Mywibm0iOiJFbmQgb2YgUmFtcCIsIm1uIjoiQURCRSBSYW1wLTAwMDMiLCJpeCI6MywidiI6eyJhIjowLCJrIjpbMzY0LDM2NF0sIml4IjozfX0seyJ0eSI6Miwibm0iOiJFbmQgQ29sb3IiLCJtbiI6IkFEQkUgUmFtcC0wMDA0IiwiaXgiOjQsInYiOnsiYSI6MCwiayI6WzAuNTY0NzA1OTA4Mjk4LDAuNzQ5MDE5NjIyODAzLDAuMDQzMTM3MjU2MDU2LDFdLCJpeCI6NH19LHsidHkiOjcsIm5tIjoiUmFtcCBTaGFwZSIsIm1uIjoiQURCRSBSYW1wLTAwMDUiLCJpeCI6NSwidiI6eyJhIjowLCJrIjoxLCJpeCI6NX19LHsidHkiOjAsIm5tIjoiUmFtcCBTY2F0dGVyIiwibW4iOiJBREJFIFJhbXAtMDAwNiIsIml4Ijo2LCJ2Ijp7ImEiOjAsImsiOjAsIml4Ijo2fX0seyJ0eSI6MCwibm0iOiJCbGVuZCBXaXRoIE9yaWdpbmFsIiwibW4iOiJBREJFIFJhbXAtMDAwNyIsIml4Ijo3LCJ2Ijp7ImEiOjAsImsiOjAsIml4Ijo3fX0seyJ0eSI6Niwibm0iOiIiLCJtbiI6IkFEQkUgUmFtcC0wMDA4IiwiaXgiOjgsInYiOjB9LHsidHkiOjcsIm5tIjoiR1BVIFJlbmRlcmluZyIsIm1uIjoiQURCRSBGb3JjZSBDUFUgR1BVIiwiaXgiOjksInYiOnsiYSI6MCwiayI6MSwiaXgiOjl9fV19XSwic2hhcGVzIjpbeyJ0eSI6ImdyIiwiaXQiOlt7ImQiOjEsInR5IjoiZWwiLCJzIjp7ImEiOjAsImsiOlsyMjgsMjI4XSwiaXgiOjJ9LCJwIjp7ImEiOjAsImsiOlswLDBdLCJpeCI6M30sIm5tIjoiRWxsaXBzZSBQYXRoIDEiLCJtbiI6IkFEQkUgVmVjdG9yIFNoYXBlIC0gRWxsaXBzZSIsImhkIjpmYWxzZX0seyJ0eSI6ImdzIiwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo5fSwidyI6eyJhIjowLCJrIjoyMCwiaXgiOjEwfSwiZyI6eyJwIjozLCJrIjp7ImEiOjAsImsiOlswLDAuNTY1LDAuNzQ5LDAuMDQzLDAuNSwwLjQ4MiwwLjc1OSwwLjEyLDEsMC40LDAuNzY5LDAuMTk2XSwiaXgiOjh9fSwicyI6eyJhIjowLCJrIjpbMCwyNDFdLCJpeCI6NH0sImUiOnsiYSI6MCwiayI6WzIsLTE5N10sIml4Ijo1fSwidCI6MSwibGMiOjEsImxqIjoxLCJtbCI6NCwibm0iOiJHcmFkaWVudCBTdHJva2UgMSIsIm1uIjoiQURCRSBWZWN0b3IgR3JhcGhpYyAtIEctU3Ryb2tlIiwiaGQiOmZhbHNlfSx7InR5IjoidHIiLCJwIjp7ImEiOjAsImsiOlswLC0xXSwiaXgiOjJ9LCJhIjp7ImEiOjAsImsiOlswLDBdLCJpeCI6MX0sInMiOnsiYSI6MCwiayI6WzEwMCwxMDBdLCJpeCI6M30sInIiOnsiYSI6MCwiayI6MCwiaXgiOjZ9LCJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjd9LCJzayI6eyJhIjowLCJrIjowLCJpeCI6NH0sInNhIjp7ImEiOjAsImsiOjAsIml4Ijo1fSwibm0iOiJUcmFuc2Zvcm0ifV0sIm5tIjoiRWxsaXBzZSAxIiwibnAiOjMsImNpeCI6MiwiaXgiOjEsIm1uIjoiQURCRSBWZWN0b3IgR3JvdXAiLCJoZCI6ZmFsc2V9LHsidHkiOiJ0bSIsInMiOnsiYSI6MSwiayI6W3siaSI6eyJ4IjpbMC4xOTddLCJ5IjpbMV19LCJvIjp7IngiOlswLjY5OV0sInkiOlswXX0sIm4iOlsiMHAxOTdfMV8wcDY5OV8wIl0sInQiOjAsInMiOlswXSwiZSI6WzUwXX0seyJpIjp7IngiOlswLjA5NV0sInkiOlsxXX0sIm8iOnsieCI6WzAuNTU1XSwieSI6WzBdfSwibiI6WyIwcDA5NV8xXzBwNTU1XzAiXSwidCI6NTAsInMiOls1MF0sImUiOlsyNV19LHsiaSI6eyJ4IjpbMC4xOTJdLCJ5IjpbMV19LCJvIjp7IngiOlswLjg1XSwieSI6WzBdfSwibiI6WyIwcDE5Ml8xXzBwODVfMCJdLCJ0IjoxMDAsInMiOlsyNV0sImUiOls4NV19LHsidCI6MTcwfV0sIml4IjoxfSwiZSI6eyJhIjoxLCJrIjpbeyJpIjp7IngiOlswLjE5N10sInkiOlsxXX0sIm8iOnsieCI6WzAuNjk5XSwieSI6WzBdfSwibiI6WyIwcDE5N18xXzBwNjk5XzAiXSwidCI6MCwicyI6WzE1XSwiZSI6Wzc1XX0seyJpIjp7IngiOlswLjA5NV0sInkiOlsxXX0sIm8iOnsieCI6WzAuNTU1XSwieSI6WzBdfSwibiI6WyIwcDA5NV8xXzBwNTU1XzAiXSwidCI6NTAsInMiOls3NV0sImUiOls1MF19LHsiaSI6eyJ4IjpbMC4xOTJdLCJ5IjpbMV19LCJvIjp7IngiOlswLjg1XSwieSI6WzBdfSwibiI6WyIwcDE5Ml8xXzBwODVfMCJdLCJ0IjoxMDAsInMiOls1MF0sImUiOlsxMDBdfSx7InQiOjE3MH1dLCJpeCI6Mn0sIm8iOnsiYSI6MSwiayI6W3siaSI6eyJ4IjpbMC44MzNdLCJ5IjpbMV19LCJvIjp7IngiOlswLjE2N10sInkiOlswXX0sIm4iOlsiMHA4MzNfMV8wcDE2N18wIl0sInQiOjAsInMiOlstMzBdLCJlIjpbMF19LHsiaSI6eyJ4IjpbMC42NjddLCJ5IjpbMV19LCJvIjp7IngiOlswLjMzM10sInkiOlswXX0sIm4iOlsiMHAyNjdfMV8wcDMzM18wIl0sInQiOjEwMCwicyI6WzBdLCJlIjpbMzg1XX0seyJ0IjoxNzB9XSwiaXgiOjN9LCJtIjoxLCJpeCI6Miwibm0iOiJUcmltIFBhdGhzIDEiLCJtbiI6IkFEQkUgVmVjdG9yIEZpbHRlciAtIFRyaW0iLCJoZCI6ZmFsc2V9XSwiaXAiOjAsIm9wIjo1NDQsInN0IjowLCJibSI6MH0seyJkZGQiOjAsImluZCI6NiwidHkiOjQsIm5tIjoiU2hhcGUgTGF5ZXIgMSIsInNyIjoxLCJrcyI6eyJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjExfSwiciI6eyJhIjowLCJrIjowLCJpeCI6MTB9LCJwIjp7ImEiOjAsImsiOlsyNTAsMjQ5LDBdLCJpeCI6Mn0sImEiOnsiYSI6MCwiayI6WzAsLTEsMF0sIml4IjoxfSwicyI6eyJhIjowLCJrIjpbMTAwLDEwMCwxMDBdLCJpeCI6Nn19LCJhbyI6MCwiZWYiOlt7InR5Ijo1LCJubSI6IkdyYWRpZW50IFJhbXAiLCJucCI6MTEsIm1uIjoiQURCRSBSYW1wIiwiaXgiOjEsImVuIjowLCJlZiI6W3sidHkiOjMsIm5tIjoiU3RhcnQgb2YgUmFtcCIsIm1uIjoiQURCRSBSYW1wLTAwMDEiLCJpeCI6MSwidiI6eyJhIjowLCJrIjpbMTM3LDEzNV0sIml4IjoxfX0seyJ0eSI6Miwibm0iOiJTdGFydCBDb2xvciIsIm1uIjoiQURCRSBSYW1wLTAwMDIiLCJpeCI6MiwidiI6eyJhIjowLCJrIjpbMC44NTA5ODA0MDEwMzksMC45MzA0NTc1MzI0MDYsMSwxXSwiaXgiOjJ9fSx7InR5IjozLCJubSI6IkVuZCBvZiBSYW1wIiwibW4iOiJBREJFIFJhbXAtMDAwMyIsIml4IjozLCJ2Ijp7ImEiOjAsImsiOlszNjQsMzY0XSwiaXgiOjN9fSx7InR5IjoyLCJubSI6IkVuZCBDb2xvciIsIm1uIjoiQURCRSBSYW1wLTAwMDQiLCJpeCI6NCwidiI6eyJhIjowLCJrIjpbMC44Mjc3NDMxNzI2NDYsMC44NzE1MDg4OTYzNTEsMC45MDk4MDM5MjY5NDUsMV0sIml4Ijo0fX0seyJ0eSI6Nywibm0iOiJSYW1wIFNoYXBlIiwibW4iOiJBREJFIFJhbXAtMDAwNSIsIml4Ijo1LCJ2Ijp7ImEiOjAsImsiOjEsIml4Ijo1fX0seyJ0eSI6MCwibm0iOiJSYW1wIFNjYXR0ZXIiLCJtbiI6IkFEQkUgUmFtcC0wMDA2IiwiaXgiOjYsInYiOnsiYSI6MCwiayI6MCwiaXgiOjZ9fSx7InR5IjowLCJubSI6IkJsZW5kIFdpdGggT3JpZ2luYWwiLCJtbiI6IkFEQkUgUmFtcC0wMDA3IiwiaXgiOjcsInYiOnsiYSI6MCwiayI6MCwiaXgiOjd9fSx7InR5Ijo2LCJubSI6IiIsIm1uIjoiQURCRSBSYW1wLTAwMDgiLCJpeCI6OCwieSI6MH0seyJ0eSI6Nywibm0iOiJHUFUgUmVuZGVyaW5nIiwibW4iOiJBREJFIEZvcmNlIENQVSBHUFUiLCJpeCI6OSwidiI6eyJhIjowLCJrIjoxLCJpeCI6OX19XX1dLCJzaGFwZXMiOlt7InR5IjoiZ3IiLCJpdCI6W3siZCI6MSwidHkiOiJlbCIsInMiOnsiYSI6MCwiayI6WzIyOCwyMjhdLCJpeCI6Mn0sInAiOnsiYSI6MCwiayI6WzAsMF0sIml4IjozfSwibm0iOiJFbGxpcHNlIFBhdGggMSIsIm1uIjoiQURCRSBWZWN0b3IgU2hhcGUgLSBFbGxpcHNlIiwiaGQiOmZhbHNlfSx7InR5IjoiZ3MiLCJvIjp7ImEiOjAsImsiOjEwMCwiaXgiOjl9LCJ3Ijp7ImEiOjAsImsiOjIwLCJpeCI6MTB9LCJnIjp7InAiOjMsImsiOnsiYSI6MCwiayI6WzAsMC44MjcsMC44NzEsMC45MSwwLjUsMC44MzksMC45LDAuOTU1LDEsMC44NTEsMC45MjksMV0sIml4Ijo4fX0sInMiOnsiYSI6MCwiayI6WzAsNDEyXSwiaXgiOjR9LCJlIjp7ImEiOjAsImsiOlsxLC00MjBdLCJpeCI6NX0sInQiOjEsImxjIjoxLCJsaiI6MSwibWwiOjQsIm5tIjoiR3JhZGllbnQgU3Ryb2tlIDEiLCJtbiI6IkFEQkUgVmVjdG9yIEdyYXBoaWMgLSBHLVN0cm9rZSIsImhkIjpmYWxzZX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMCwtMV0sIml4IjoyfSwiYSI6eyJhIjowLCJrIjpbMCwwXSwiaXgiOjF9LCJzIjp7ImEiOjAsImsiOlsxMDAsMTAwXSwiaXgiOjN9LCJyIjp7ImEiOjAsImsiOjAsIml4Ijo2fSwibyI6eyJhIjowLCJrIjoxMDAsIml4Ijo3fSwic2siOnsiYSI6MCwiayI6MCwiaXgiOjR9LCJzYSI6eyJhIjowLCJrIjowLCJpeCI6NX0sIm5tIjoiVHJhbnNmb3JtIn1dLCJubSI6IkVsbGlwc2UgMSIsIm5wIjozLCJjaXgiOjIsIml4IjoxLCJtbiI6IkFEQkUgVmVjdG9yIEdyb3VwIiwiaGQiOmZhbHNlfV0sImlwIjowLCJvcCI6NTQ0LCJzdCI6MCwiYm0iOjB9XSwibWFya2VycyI6W3sidG0iOjIsImNtIjoiMSIsImRyIjowfSx7InRtIjoxNjcsImNtIjoiMiIsImRyIjowfV19";

const PAIRS = [
  { id: "USDJPY", label: "USD/JPY", base: 154.5, decimals: 2, vol: 0.00035 },
  { id: "EURUSD", label: "EUR/USD", base: 1.0845, decimals: 4, vol: 0.00018 },
  { id: "GBPUSD", label: "GBP/USD", base: 1.2710, decimals: 4, vol: 0.00022 },
  { id: "XAUUSD", label: "XAU/USD", base: 2345.0, decimals: 1, vol: 0.00025 },
];

function genCandles(pair, count = 60) {
  const candles = [];
  let price = pair.base;
  for (let i = 0; i < count; i++) {
    const move = (Math.random() - 0.49) * pair.base * 0.0018;
    const open = price;
    const close = price + move;
    const hi = Math.max(open, close) + Math.random() * Math.abs(move) * 0.5;
    const lo = Math.min(open, close) - Math.random() * Math.abs(move) * 0.5;
    candles.push({ open, close, high: hi, low: lo });
    price = close;
  }
  return candles;
}

function TradingGame({ balance, setBalance, onBack }) {
  const [pairIdx, setPairIdx] = useState(0);
  const pair = PAIRS[pairIdx];

  const [candles, setCandles] = useState(() => genCandles(PAIRS[0]));
  const [livePrice, setLivePrice] = useState(() => PAIRS[0].base);
  const [timeLeft, setTimeLeft] = useState(30);
  const [phase, setPhase] = useState("open"); // open | resolving | result
  const [bet, setBet] = useState(10);
  const [direction, setDirection] = useState(null); // "UP" | "DOWN" | null
  const [betPlaced, setBetPlaced] = useState(false);
  const [openPrice, setOpenPrice] = useState(null);
  const [result, setResult] = useState(null); // { won, pnl, closePrice }
  const [history, setHistory] = useState([]);

  const tickRef = useRef(null);
  const candleTickRef = useRef(null);
  const timeRef = useRef(30);
  const phaseRef = useRef("open");
  const livePriceRef = useRef(PAIRS[0].base);
  const betPlacedRef = useRef(false);
  const dirRef = useRef(null);
  const betAmtRef = useRef(10);
  const openPriceRef = useRef(null);

  useEffect(() => { betPlacedRef.current = betPlaced; }, [betPlaced]);
  useEffect(() => { dirRef.current = direction; }, [direction]);
  useEffect(() => { betAmtRef.current = bet; }, [bet]);
  useEffect(() => { openPriceRef.current = openPrice; }, [openPrice]);

  // Switch pair: reset everything
  const switchPair = (idx) => {
    clearInterval(tickRef.current);
    clearInterval(candleTickRef.current);
    const p = PAIRS[idx];
    setPairIdx(idx);
    const c = genCandles(p);
    setCandles(c);
    const lp = c[c.length - 1].close;
    setLivePrice(lp);
    livePriceRef.current = lp;
    setTimeLeft(30);
    timeRef.current = 30;
    setPhase("open");
    phaseRef.current = "open";
    setBetPlaced(false);
    betPlacedRef.current = false;
    setDirection(null);
    dirRef.current = null;
    setOpenPrice(null);
    openPriceRef.current = null;
    setResult(null);
    startTicks(p, lp);
  };

  const startTicks = (p, startPrice) => {
    let price = startPrice;

    // Price tick every 300ms
    tickRef.current = setInterval(() => {
      const move = (Math.random() - 0.5) * p.base * 0.0004;
      price = Math.max(price + move, p.base * 0.9);
      livePriceRef.current = price;
      setLivePrice(price);
    }, 300);

    // Candle + timer tick every second
    candleTickRef.current = setInterval(() => {
      if (phaseRef.current !== "open") return;
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);

      // Update current live candle
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const cur = livePriceRef.current;
        const updated = {
          ...last,
          close: cur,
          high: Math.max(last.high, cur),
          low: Math.min(last.low, cur),
        };
        return [...prev.slice(0, -1), updated];
      });

      if (timeRef.current <= 0) {
        // Candle closes — resolve
        phaseRef.current = "resolving";
        setPhase("resolving");
        clearInterval(tickRef.current);
        clearInterval(candleTickRef.current);

        const closePrice = livePriceRef.current;
        const op = openPriceRef.current;
        let won = false;
        let pnl = 0;
        if (betPlacedRef.current && op !== null) {
          const up = closePrice > op;
          won = (dirRef.current === "UP" && up) || (dirRef.current === "DOWN" && !up);
          pnl = won ? betAmtRef.current * 0.95 : -betAmtRef.current;
          setBalance((b) => b + (won ? betAmtRef.current * 0.95 : 0));
        }
        setResult({ won, pnl, closePrice });

        // Add closed candle to history, start new candle
        setTimeout(() => {
          setCandles((prev) => {
            const last = prev[prev.length - 1];
            return [...prev.slice(-59), { open: last.close, close: last.close, high: last.close, low: last.close }];
          });
          setHistory((h) => [
            { dir: dirRef.current, won, pnl, pair: p.label },
            ...h,
          ].slice(0, 20));
          timeRef.current = 30;
          setTimeLeft(30);
          phaseRef.current = "open";
          setPhase("open");
          setBetPlaced(false);
          betPlacedRef.current = false;
          setDirection(null);
          dirRef.current = null;
          setOpenPrice(null);
          openPriceRef.current = null;
          setResult(null);

          price = livePriceRef.current;
          tickRef.current = setInterval(() => {
            const move = (Math.random() - 0.5) * p.base * 0.0004;
            price = Math.max(price + move, p.base * 0.9);
            livePriceRef.current = price;
            setLivePrice(price);
          }, 300);
          candleTickRef.current = setInterval(() => {
            if (phaseRef.current !== "open") return;
            timeRef.current -= 1;
            setTimeLeft(timeRef.current);
            setCandles((prev) => {
              const last = prev[prev.length - 1];
              const cur = livePriceRef.current;
              const updated = { ...last, close: cur, high: Math.max(last.high, cur), low: Math.min(last.low, cur) };
              return [...prev.slice(0, -1), updated];
            });
            if (timeRef.current <= 0) {
              phaseRef.current = "resolving";
              setPhase("resolving");
              clearInterval(tickRef.current);
              clearInterval(candleTickRef.current);
              const cp = livePriceRef.current;
              const op2 = openPriceRef.current;
              let w = false, p2 = 0;
              if (betPlacedRef.current && op2 !== null) {
                const up2 = cp > op2;
                w = (dirRef.current === "UP" && up2) || (dirRef.current === "DOWN" && !up2);
                p2 = w ? betAmtRef.current * 0.95 : -betAmtRef.current;
                setBalance((b) => b + (w ? betAmtRef.current * 0.95 : 0));
              }
              setResult({ won: w, pnl: p2, closePrice: cp });
            }
          }, 1000);
        }, 3000);
      }
    }, 1000);
  };

  useEffect(() => {
    const p = PAIRS[0];
    const c = genCandles(p);
    const lp = c[c.length - 1].close;
    setCandles(c);
    setLivePrice(lp);
    livePriceRef.current = lp;
    startTicks(p, lp);
    return () => {
      clearInterval(tickRef.current);
      clearInterval(candleTickRef.current);
    };
  }, []);

  const placeBet = (dir) => {
    if (betPlaced || phase !== "open" || balance < bet) return;
    setDirection(dir);
    dirRef.current = dir;
    setBetPlaced(true);
    betPlacedRef.current = true;
    setOpenPrice(livePriceRef.current);
    openPriceRef.current = livePriceRef.current;
    setBalance((b) => b - bet);
  };

  // Chart drawing
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Dark bg
    ctx.fillStyle = "#0A0F1E";
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (H / 5) * i);
      ctx.lineTo(W, (H / 5) * i);
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const display = candles.slice(-40);
    if (display.length < 2) return;
    const prices = display.flatMap((c) => [c.high, c.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const PAD = 8;
    const cW = (W - PAD * 2) / display.length;

    const toY = (p) => PAD + ((maxP - p) / range) * (H - PAD * 2);

    display.forEach((c, i) => {
      const x = PAD + i * cW + cW * 0.1;
      const bW = cW * 0.8;
      const bull = c.close >= c.open;
      const col = bull ? "#26a69a" : "#ef5350";

      // Wick
      ctx.beginPath();
      ctx.moveTo(x + bW / 2, toY(c.high));
      ctx.lineTo(x + bW / 2, toY(c.low));
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Body
      const yO = toY(c.open), yC = toY(c.close);
      const bodyY = Math.min(yO, yC);
      const bodyH = Math.max(Math.abs(yO - yC), 1);
      ctx.fillStyle = col;
      ctx.fillRect(x, bodyY, bW, bodyH);
    });

    // Open price line
    if (openPrice) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, toY(openPrice));
      ctx.lineTo(W, toY(openPrice));
      ctx.strokeStyle = direction === "UP" ? "#26a69a" : "#ef5350";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, openPrice, direction]);

  const presets = [10, 25, 50, 100];
  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 10 ? "#26a69a" : timeLeft > 5 ? "#FFD600" : "#EF5350";
  const priceChange = candles.length >= 2
    ? ((candles[candles.length - 1].close - candles[candles.length - 2].open) / candles[candles.length - 2].open) * 100
    : 0;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#0A0F1E", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#060B14", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ffffff0D" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#aaa", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>‹</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📈</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>FX Trader</span>
        </div>
        <div style={{ background: "#1a2535", borderRadius: 12, padding: "5px 12px", color: "#26a69a", fontWeight: 700, fontSize: 13 }}>
          ৳{balance.toFixed(2)}
        </div>
      </div>

      {/* Pair Tabs */}
      <div style={{ display: "flex", background: "#060B14", padding: "0 8px 8px", gap: 6, overflowX: "auto" }}>
        {PAIRS.map((p, i) => (
          <button key={p.id} onClick={() => switchPair(i)} style={{
            padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap",
            background: pairIdx === i ? "#26a69a" : "#1a2535",
            color: pairIdx === i ? "#fff" : "#888",
            fontWeight: 700, fontSize: 12, fontFamily: "'Poppins',sans-serif",
          }}>{p.label}</button>
        ))}
      </div>

      {/* Live Price Bar */}
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0D1420" }}>
        <div>
          <div style={{ color: "#aaa", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{pair.label}</div>
          <div style={{ color: "#fff", fontSize: 24, fontWeight: 900, letterSpacing: 1 }}>{livePrice.toFixed(pair.decimals)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: priceChange >= 0 ? "#26a69a" : "#ef5350", fontWeight: 700, fontSize: 13 }}>
            {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(3)}%
          </div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>30s candle</div>
        </div>
      </div>

      {/* Timer Bar */}
      <div style={{ height: 4, background: "#1a2535", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 0.3s" }} />
      </div>

      {/* Chart */}
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} width={480} height={200} style={{ width: "100%", display: "block" }} />
        {/* Timer overlay */}
        <div style={{ position: "absolute", top: 8, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: timerColor, animation: "pulse 1s infinite" }} />
          <span style={{ color: timerColor, fontWeight: 800, fontSize: 14 }}>{timeLeft}s</span>
        </div>
        {/* Phase overlay */}
        {phase === "resolving" && result && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s ease" }}>
            <div style={{ fontSize: 48 }}>{result.won ? "🎉" : "💸"}</div>
            <div style={{ color: result.won ? "#26a69a" : "#ef5350", fontWeight: 900, fontSize: 28, marginTop: 8 }}>
              {result.won ? `+৳${(result.pnl).toFixed(2)}` : `-৳${bet.toFixed(2)}`}
            </div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{result.won ? "WIN" : "LOSS"} · Close: {result.closePrice.toFixed(pair.decimals)}</div>
          </div>
        )}
        {phase === "resolving" && !betPlaced && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>⏳ New candle starting...</div>
          </div>
        )}
      </div>

      {/* Betting Panel */}
      <div style={{ flex: 1, padding: "12px 14px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Amount */}
        <div style={{ background: "#0D1420", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ color: "#888", fontSize: 11, fontWeight: 600, marginBottom: 10 }}>TRADE AMOUNT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <button onClick={() => !betPlaced && setBet((a) => Math.max(1, a - 1))} disabled={betPlaced} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#1a2535", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>৳{bet}</span>
            <button onClick={() => !betPlaced && setBet((a) => Math.min(balance, a + 1))} disabled={betPlaced} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#1a2535", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {presets.map((p) => (
              <button key={p} onClick={() => !betPlaced && setBet(p)} disabled={betPlaced} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", background: bet === p ? "#26a69a22" : "#1a2535", color: bet === p ? "#26a69a" : "#888", fontWeight: 700, fontSize: 12, fontFamily: "'Poppins',sans-serif" }}>৳{p}</button>
            ))}
          </div>
        </div>

        {/* Direction Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => placeBet("UP")}
            disabled={betPlaced || phase !== "open" || balance < bet}
            style={{
              flex: 1, height: 62, borderRadius: 14, border: "none", cursor: betPlaced ? "default" : "pointer",
              background: betPlaced && direction === "UP" ? "#26a69a" : betPlaced ? "#1a2535" : "#26a69a22",
              color: betPlaced && direction === "UP" ? "#fff" : betPlaced ? "#444" : "#26a69a",
              fontWeight: 900, fontSize: 18, fontFamily: "'Poppins',sans-serif",
              boxShadow: !betPlaced ? "0 4px 20px #26a69a33" : "none",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              transition: "all .2s",
            }}
          >
            <span style={{ fontSize: 22 }}>▲</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>UP</span>
          </button>
          <button
            onClick={() => placeBet("DOWN")}
            disabled={betPlaced || phase !== "open" || balance < bet}
            style={{
              flex: 1, height: 62, borderRadius: 14, border: "none", cursor: betPlaced ? "default" : "pointer",
              background: betPlaced && direction === "DOWN" ? "#ef5350" : betPlaced ? "#1a2535" : "#ef535022",
              color: betPlaced && direction === "DOWN" ? "#fff" : betPlaced ? "#444" : "#ef5350",
              fontWeight: 900, fontSize: 18, fontFamily: "'Poppins',sans-serif",
              boxShadow: !betPlaced ? "0 4px 20px #ef535033" : "none",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              transition: "all .2s",
            }}
          >
            <span style={{ fontSize: 22 }}>▼</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>DOWN</span>
          </button>
        </div>

        {betPlaced && (
          <div style={{ background: "#0D1420", borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#888", fontSize: 12 }}>Your position</div>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ color: "#aaa", fontSize: 12 }}>Open: <span style={{ color: "#fff", fontWeight: 700 }}>{openPrice?.toFixed(pair.decimals)}</span></span>
              <span style={{ color: direction === "UP" ? "#26a69a" : "#ef5350", fontWeight: 800, fontSize: 13 }}>{direction === "UP" ? "▲ UP" : "▼ DOWN"}</span>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={{ background: "#0D1420", borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ color: "#888", fontSize: 11, fontWeight: 600, marginBottom: 10 }}>RECENT TRADES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < 4 ? "1px solid #ffffff08" : "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: h.dir === "UP" ? "#26a69a" : "#ef5350", fontWeight: 700, fontSize: 13 }}>{h.dir === "UP" ? "▲" : "▼"} {h.dir}</span>
                    <span style={{ color: "#555", fontSize: 11 }}>{h.pair}</span>
                  </div>
                  <span style={{ color: h.won ? "#26a69a" : "#ef5350", fontWeight: 700, fontSize: 13 }}>
                    {h.won ? `+৳${h.pnl.toFixed(2)}` : `-৳${Math.abs(h.pnl).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FLOATING HELP ── */
function FloatingHelp({ show, user }) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  if (!show) return null;
  if (chatOpen)
    return <SupportChat onClose={() => setChatOpen(false)} user={user} />;
  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 16,
            background: "#fff",
            borderRadius: 18,
            padding: "16px",
            width: 235,
            boxShadow: "0 10px 40px #0004",
            zIndex: 1000,
            fontFamily: "'Poppins',sans-serif",
            animation: "fadeIn .2s ease",
            border: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 12,
              color: G.text,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🎧 <span>Support Center</span>
          </div>
          {[
            "Deposit Not Received",
            "Withdrawal Problem",
            "Change Password",
            "Modify E-Wallet",
            "Add USDT Address",
            "Check Official Website",
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setOpen(false);
                setChatOpen(true);
              }}
              style={{
                padding: "8px 0",
                borderBottom: i < 5 ? "1px solid #f5f5f5" : "none",
                fontSize: 13,
                color: "#444",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {item}
              <span style={{ color: "#ddd", fontSize: 16 }}>›</span>
            </div>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              setChatOpen(true);
            }}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "11px 0",
              borderRadius: 12,
              border: "none",
              background: "#128C7E",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            💬 Live Chat
          </button>
        </div>
      )}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 92,
          right: 16,
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: open ? "#128C7E" : gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: `0 6px 22px ${open ? "#128C7E55" : "#EF535066"}`,
          zIndex: 1001,
          animation: "pulse 2.5s infinite",
          fontSize: 24,
          transition: "background .3s",
        }}
      >
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
      {screen === "login" && (
        <LoginScreen
          onLogin={(u) => {
            setUser(u);
            setScreen("register");
          }}
          onGotoRegister={() => setScreen("register")}
        />
      )}
      {screen === "register" && (
        <RegisterScreen
          onRegister={(u) => {
            setUser(u);
            setScreen("deposit");
          }}
          onBack={() => setScreen("login")}
        />
      )}
      {screen === "deposit" && (
        <DepositSetup
          contact={user?.contact}
          onDone={(acc) => {
            setAccounts(acc);
            setScreen("home");
          }}
        />
      )}
      {screen === "home" && (
        <HomeScreen
          user={user}
          balance={balance}
          onSelectGame={(g) => setScreen(g)}
          onGoProfile={() => setScreen("profile")}
          onGoWallet={() => setScreen("wallet")}
        />
      )}
      {screen === "wingo" && (
        <WinGoGame
          balance={balance}
          setBalance={setBalance}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "aviator" && (        <AviatorGame
          balance={balance}
          setBalance={setBalance}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "trading" && (
        <TradingGame
          balance={balance}
          setBalance={setBalance}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "profile" && (
        <ProfileScreen
          user={user}
          balance={balance}
          accounts={accounts}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "wallet" && (
        <WalletScreen
          balance={balance}
          setBalance={setBalance}
          accounts={accounts}
          onBack={() => setScreen("home")}
        />
      )}
      <FloatingHelp show={!isPlaying} user={user} />
    </div>
  );
}

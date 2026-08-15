import React from "react";
import { G, gradient } from "../constants";
import { sound } from "../sound/soundManager";

export default function BottomNav({ activeNav, setActiveNav, onGoWallet, onGoProfile, onGoHome, onGoActivity, onGoPromo }) {
  const navItems = [
    {
      id: "home",
      label: "Home",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      id: "promo",
      label: "Promotion",
      isCenter: true,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
      ),
    },
    {
      id: "wallet",
      label: "Wallet",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
          <path d="M4 6v12a2 2 0 002 2h14v-4" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      ),
    },
    {
      id: "account",
      label: "Account",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
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
        height: 60,
      }}
    >
      {navItems.map((n) => (
        <button
          key={n.id}
          onClick={() => {
            sound.unlock();
            sound.play("click");
            setActiveNav(n.id);
            if (n.id === "wallet") onGoWallet && onGoWallet();
            if (n.id === "account") onGoProfile && onGoProfile();
            if (n.id === "home") onGoHome && onGoHome();
            if (n.id === "activity") onGoActivity && onGoActivity();
            if (n.id === "promo") onGoPromo && onGoPromo();
          }}
          style={{
            flex: 1,
            padding: "6px 0 4px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: activeNav === n.id ? G.red : "#bbb",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            fontFamily: "'Poppins',sans-serif",
            position: "relative",
          }}
        >
          {n.isCenter ? (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 16px #EF535066",
                marginTop: -20,
              }}
            >
              {n.svg}
            </div>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {n.svg}
            </span>
          )}
          <span style={{ fontSize: 10, fontWeight: 600 }}>{n.label}</span>
        </button>
      ))}
    </div>
  );
}
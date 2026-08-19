import React, { useState, useEffect } from "react";
import { G, CSS, gradient } from "../constants";
import BottomNav from "../components/BottomNav";
import popularImg from "../assets/popular.png";
import lotteryImg from "../assets/lottery.png";
import slotsImg from "../assets/slots.png";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import sportsImg from "../assets/sports.png";
import casinoImg from "../assets/casino.png";
import fishingImg from "../assets/fishing.png";
import { apiGetUnreadNotificationCount } from "../api";

import iconWingo from "../assets/icons/wingo.png";
import iconK3 from "../assets/icons/k3.png";
import iconAviator from "../assets/icons/aviator.png";
import iconMoto from "../assets/icons/motoride.png";
import iconRoad from "../assets/icons/roadrush.png";
import iconFx from "../assets/icons/trading.png";
import icon5d from "../assets/icons/5d.png";
import iconTrx from "../assets/icons/trx.png";

import logoTomb from "../assets/logos/tomb-raiders.png";
import logoElements from "../assets/logos/elements-fury.png";
import logoGolden from "../assets/logos/golden-relics.png";

// HGNICE-style category tiles: solid color blocks, big icon, bold white label
// popOut: true → icon overflows half above the tile edge (Popular/Lottery/Slots)
const CATEGORIES = [
  { id: "popular", label: "Popular", img: popularImg, bg: "#0b6afd", popOut: true, variant: "square" },
  { id: "lottery", label: "Lottery", img: lotteryImg, bg: "#4a1292", popOut: true, variant: "square" },
  { id: "slots", label: "Slots", img: slotsImg, bg: "#0fc0cf", popOut: true, variant: "square" },
  { id: "sports", label: "Sports", img: sportsImg, bg: "#fb5619", variant: "square" },
  { id: "casino", label: "Casino", img: casinoImg, bg: "#fa3b94", variant: "square" },
  { id: "fishing", label: "Fishing", img: fishingImg, bg: "#fa6b01", variant: "square" },
];

// HGNICE-style solid coral/red row — sampled directly from their reference
// screenshot (rgb(250, 92, 92) across 4 points), not a gradient.
const PINK = "#FA5C5C";

const POPULAR_GAMES = [
  { id: "wingo", name: "Win Go", desc: "Guess Number\nGreen/Red/Violet to win", icon: iconWingo, bg: PINK, tag: "HOT" },
  { id: "aviator", name: "Aviator", desc: "Cash out before\nit flies away!", icon: iconAviator, bg: "linear-gradient(90deg, #5B6BC8 0%, #7B8AD4 50%, #A8B4F0 100%)", tag: "POPULAR" },
  { id: "plinko", name: "Plinko", desc: "Drop the ball\nHit big multipliers!", icon: iconAviator, bg: "linear-gradient(90deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)", tag: "NEW" },
  { id: "motoride", name: "Moto Ride", desc: "Race & cash out\nbefore crash!", icon: iconMoto, bg: "linear-gradient(90deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)", tag: "NEW" },
  { id: "roadrush", name: "Road Rush", desc: "Drive & cash out\nbefore you crash!", icon: iconRoad, bg: "linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)", tag: "NEW" },
  { id: "trading", name: "FX Trader", desc: "Trade USD/JPY\nEUR/USD · XAU/USD", icon: iconFx, bg: "linear-gradient(90deg, #0D9488 0%, #14B8A6 50%, #5EEAD4 100%)" },
];

const LOTTERY_GAMES = [
  { id: "wingo", name: "Win Go", desc: "Guess Number\nGreen/Red/Violet to win", icon: iconWingo, bg: PINK, tag: "HOT" },
  { id: "k3", name: "K3", desc: "Guess Number\nBig/Small/Odd/Even", icon: iconK3, bg: PINK, iconTop: -12, iconRight: 2, iconWidth: 108, iconHeight: 92 },
  { id: "5d", name: "5D", desc: "Guess Number\nBig/Small/Odd/Even", icon: icon5d, bg: PINK, soon: true },
  { id: "trx", name: "Trx Win", desc: "Guess Number\nGreen/Red/Violet to win", icon: iconTrx, bg: PINK, soon: true },
];

const SLOT_GAMES = [
  { id: "slots6", name: "Tomb Raiders", desc: "Ancient relics · Free spins", logo: logoTomb, tag: "NEW" },
  { id: "slots8", name: "Golden Relics", desc: "Underwater · Mega jackpot", logo: logoGolden, tag: "NEW" },
  { id: "slots7", name: "Elemental Fury", desc: "5x5 ways · Elements clash", logo: logoElements, tag: "NEW" },
];

function GameList({ games, onSelectGame }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {games.map((g) => (
        <div
          key={g.id}
          onClick={() => !g.soon && onSelectGame(g.id)}
          style={{
            background: g.bg,
            borderRadius: 12,
            padding: "12px 12px 12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: g.soon ? "default" : "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            position: "relative",
            overflow: "hidden",
            minHeight: 112,
            opacity: g.soon ? 0.75 : 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 48,
              top: -28,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.16)",
              pointerEvents: "none",
            }}
          />
          <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1, paddingRight: g.iconTop !== undefined ? 90 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{g.name}</div>
              {g.tag && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.32)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}
                >
                  {g.tag}
                </span>
              )}
              {g.soon && (
                <span
                  style={{
                    background: "rgba(0,0,0,0.18)",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}
                >
                  SOON
                </span>
              )}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.95)",
                fontSize: 12,
                lineHeight: 1.4,
                whiteSpace: "pre-line",
              }}
            >
              {g.desc}
            </div>
          </div>
          {g.iconTop !== undefined ? (
            <img
              src={g.icon}
              alt=""
              style={{
                position: "absolute",
                top: g.iconTop,
                right: g.iconRight ?? 10,
                width: g.iconWidth ?? 108,
                height: g.iconHeight ?? 92,
                objectFit: "contain",
                zIndex: 1,
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.18))",
                pointerEvents: "none",
              }}
            />
          ) : (
            <img
              src={g.icon}
              alt=""
              style={{
                width: 116,
                height: 92,
                objectFit: "contain",
                flexShrink: 0,
                position: "relative",
                right: -8,
                zIndex: 1,
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.18))",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SlotGrid({ games, onSelectGame }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        alignItems: "start",
        gap: 8,
      }}
    >
      {games.map((g) => (
        <div
          key={g.id}
          onClick={() => onSelectGame(g.id)}
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <img
            src={g.logo}
            alt={g.name}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function BellIcon({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function CategoryTile({ cat, active, onClick, radius = 16 }) {
  const baseStyle = {
    position: "relative",
    borderRadius: radius,
    overflow: "visible",
    cursor: "pointer",
    background: `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 45%), ${cat.bg}`,
    height: 92,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 10,
    boxShadow: active
      ? "0 4px 14px rgba(0,0,0,0.22), 0 0 0 2px rgba(255,255,255,0.55) inset"
      : "0 3px 10px rgba(0,0,0,0.14)",
    transform: active ? "scale(1.02)" : "scale(1)",
    transition: "transform 0.15s, box-shadow 0.15s",
  };

  const size = 68;

  return (
    <div onClick={onClick} style={baseStyle}>
      {cat.popOut ? (
        // Popular/Lottery/Slots: icon overflows exactly half above the tile's top edge
        <img
          src={cat.img}
          alt={cat.label}
          style={{
            position: "absolute",
            top: -(size / 2),
            left: "50%",
            transform: "translateX(-50%)",
            width: size,
            height: size,
            objectFit: "contain",
            zIndex: 2,
            filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.28))",
            pointerEvents: "none",
          }}
        />
      ) : (
        // Sports/Casino/Fishing: contained icon, no overflow
        <img
          src={cat.img}
          alt={cat.label}
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 56,
            height: 56,
            objectFit: "contain",
            zIndex: 2,
            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.22))",
            pointerEvents: "none",
          }}
        />
      )}
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#fff",
          position: "relative",
          zIndex: 1,
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        {cat.label}
      </span>
    </div>
  );
}

export default function HomeScreen({
  user,
  balance,
  onSelectGame,
  onGoProfile,
  onGoWallet,
  onGoActivity,
  onGoPromo,
  onGoNotifications,
}) {
  const [activeNav, setActiveNav] = useState("home");
  const [activeCat, setActiveCat] = useState("popular");
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const username =
    user?.name ||
    (user?.contact?.includes("@") ? user.contact.split("@")[0] : user?.contact) ||
    "Player";
  const displayBalance = balanceHidden ? "••••••" : `৳${balance.toFixed(2)}`;

  useEffect(() => {
    const fetchUnread = () =>
      apiGetUnreadNotificationCount().then(setUnreadCount).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

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
      <style>{CSS}</style>
      <div style={{ background: gradient, padding: "16px 20px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>
            SPIN<span style={{ color: "#FFE082" }}>OVA</span>
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
              {displayBalance}
            </div>
            <div
              onClick={onGoNotifications}
              style={{
                position: "relative",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: "#FFE082",
                    color: "#1A1A2E",
                    fontSize: 9,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    border: "2px solid #EF5350",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
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
                fontSize: 16,
                color: "#fff",
                fontWeight: 800,
              }}
            >
              {username[0]?.toUpperCase() || "G"}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>Total Balance</div>
            <button
              onClick={() => setBalanceHidden((v) => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
            >
              <img
                src={balanceHidden ? hideIcon : viewIcon}
                alt="toggle"
                style={{ width: 20, height: 20, opacity: 0.6, filter: "invert(1)" }}
              />
            </button>
          </div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
            {displayBalance}
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
              }}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* HGNICE-style colorful category grid: top row stays separated cards,
          bottom row is one connected strip (no gaps, only outer corners rounded).
          padding-top clears row 1's half-overflowing icons (Popular/Lottery/Slots). */}
      <div style={{ background: "#fff", padding: "34px 12px 4px", overflow: "visible" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {CATEGORIES.slice(0, 3).map((cat) => (
            <CategoryTile
              key={cat.id}
              cat={cat}
              active={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)}
            />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {CATEGORIES.slice(3, 6).map((cat, i) => (
            <CategoryTile
              key={cat.id}
              cat={cat}
              active={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)}
              radius={i === 0 ? "16px 0 0 16px" : i === 2 ? "0 16px 16px 0" : 0}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 4, height: 20, background: G.red, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: G.text }}>
            {activeCat === "popular"
              ? "Popular Games"
              : activeCat === "lottery"
              ? "Lottery Games"
              : activeCat === "slots"
              ? "Slot Games"
              : "Games"}
          </span>
        </div>
        {activeCat === "popular" && <GameList games={POPULAR_GAMES} onSelectGame={onSelectGame} />}
        {activeCat === "lottery" && <GameList games={LOTTERY_GAMES} onSelectGame={onSelectGame} />}
        {activeCat === "slots" && <SlotGrid games={SLOT_GAMES} onSelectGame={onSelectGame} />}
        {(activeCat === "sports" || activeCat === "casino" || activeCat === "fishing") && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>{"🚧"}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: G.text, marginBottom: 8 }}>
              Coming Soon!
            </div>
            <div style={{ fontSize: 13, color: G.sub }}>
              {"We're working hard to bring you this category"}
            </div>
          </div>
        )}
      </div>
      <BottomNav
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onGoWallet={onGoWallet}
        onGoProfile={onGoProfile}
        onGoHome={() => {}}
        onGoActivity={onGoActivity}
        onGoPromo={onGoPromo}
      />
    </div>
  );
}
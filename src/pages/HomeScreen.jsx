import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import BottomNav from "../components/BottomNav";
import popularImg from "../assets/popular.png";
import lotteryImg from "../assets/lottery.png";
import slotsImg from "../assets/slots.png";
import sportsImg from "../assets/sports.png";
import casinoImg from "../assets/casino.png";
import fishingImg from "../assets/fishing.png";

const CATEGORIES = [
  { id: "popular",  label: "Popular",  img: popularImg  },
  { id: "lottery",  label: "Lottery",  img: lotteryImg  },
  { id: "slots",    label: "Slots",    img: slotsImg    },
  { id: "sports",   label: "Sports",   img: sportsImg   },
  { id: "casino",   label: "Casino",   img: casinoImg   },
  { id: "fishing",  label: "Fishing",  img: fishingImg  },
];

const POPULAR_GAMES = [
  { id:"wingo",    name:"Win Go",     desc:"Guess Number · Green/Red/Violet",   emoji:"🔮", bg:"linear-gradient(135deg,#EF5350,#FF8A80)", tag:"HOT" },
  { id:"aviator",  name:"Aviator",    desc:"Cash out before it flies away!",     emoji:"✈️", bg:"linear-gradient(135deg,#0F0F2A,#3949AB)", tag:"POPULAR" },
  { id:"motoride", name:"Moto Crash", desc:"Race & cash out before crash!",      emoji:"🏍️", bg:"linear-gradient(135deg,#F97316,#EA580C)", tag:"NEW" },
  { id:"roadrush", name:"Road Rush",  desc:"Drive & cash out before you crash!", emoji:"🚗", bg:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", tag:"NEW" },
  { id:"trading",  name:"FX Trader",  desc:"Trade USD/JPY · EUR/USD · XAU/USD", emoji:"📈", bg:"linear-gradient(135deg,#0F2027,#203A43,#2C5364)" },
];

const LOTTERY_GAMES = [
  { id:"wingo",    name:"Win Go",    desc:"Guess Number · Green/Red/Violet",   emoji:"🔮", bg:"linear-gradient(135deg,#EF5350,#FF8A80)", tag:"HOT" },
  { id:"roadrush", name:"Road Rush", desc:"Drive & cash out before you crash!", emoji:"🚗", bg:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", tag:"NEW" },
  { id:"k3",       name:"K3",        desc:"Guess Number · Big/Small/Odd/Even", emoji:"🎲", bg:"linear-gradient(135deg,#F97316,#FBBF24)", soon:true },
  { id:"5d",       name:"5D",        desc:"5 digit prediction game",           emoji:"🎯", bg:"linear-gradient(135deg,#22C55E,#16A34A)", soon:true },
  { id:"trx",      name:"Trx Win",   desc:"Guess Number · Green/Red/Violet",   emoji:"💎", bg:"linear-gradient(135deg,#7C3AED,#A855F7)", soon:true },
];
const SLOT_GAMES = [
  { id:"slots1", name:"Lucky 777", desc:"Classic fruit slots · 3 reels", emoji:"🎰", bg:"linear-gradient(135deg,#7C3AED,#A855F7)", tag:"HOT" },
  { id:"slots2", name:"Gold Rush", desc:"Mine for gold · Big multipliers", emoji:"⛏️", bg:"linear-gradient(135deg,#F59E0B,#D97706)", tag:"NEW" },
  { id:"slots3", name:"Dragon Spin", desc:"Dragon wilds · Free spins", emoji:"🐉", bg:"linear-gradient(135deg,#DC2626,#991B1B)" },
  { id:"slots6", name:"Tomb Raiders", desc:"Ancient relics · Wild Idol · Free spins", emoji:"🏺", bg:"linear-gradient(135deg,#92400E,#B45309)", tag:"NEW" },
  { id:"slots4", name:"Ocean Deep", desc:"Underwater treasure hunt", emoji:"🌊", bg:"linear-gradient(135deg,#0891B2,#0E7490)" },
  { id:"slots5", name:"Star Burst", desc:"Galactic wins · Expanding wilds", emoji:"⭐", bg:"linear-gradient(135deg,#4F46E5,#7C3AED)" },
  { id:"slots8", name:"Golden Relics", desc:"Underwater treasure · Mega jackpot", emoji:"🔱", bg:"linear-gradient(135deg,#062347,#04162f)", tag:"NEW" },
  { id:"slots7", name:"Elemental Fury", desc:"5x5 ways · Elements clash", emoji:"⚡", bg:"linear-gradient(135deg,#1a3a8a,#2a1a6a)", tag:"NEW" },
  
];

function GameList({ games, onSelectGame }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {games.map((g) => (
        <div key={g.id} onClick={() => !g.soon && onSelectGame(g.id)}
          style={{ background:g.bg, borderRadius:18, padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:g.soon?"default":"pointer", boxShadow:"0 4px 16px rgba(0,0,0,0.15)", position:"relative", overflow:"hidden", transition:"transform 0.15s" }}
          onMouseEnter={e => { if(!g.soon) e.currentTarget.style.transform="scale(1.02)"; }}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
          <div style={{ position:"absolute", top:0, right:0, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.05)", transform:"translate(20px,-20px)" }} />
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>{g.name}</div>
              {g.tag && <span style={{ background:"rgba(255,255,255,0.25)", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:10, letterSpacing:1 }}>{g.tag}</span>}
              {g.soon && <span style={{ background:"rgba(0,0,0,0.2)", color:"rgba(255,255,255,0.6)", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:10, letterSpacing:1 }}>SOON</span>}
            </div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:12 }}>{g.desc}</div>
          </div>
          <div style={{ fontSize:46, opacity:g.soon?0.5:1 }}>{g.emoji}</div>
        </div>
      ))}
    </div>
  );
}

function SlotGrid({ games, onSelectGame }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      {games.map((g) => (
        <div key={g.id} onClick={() => onSelectGame(g.id)}
          style={{ background:g.bg, borderRadius:16, padding:"16px 14px", cursor:"pointer", boxShadow:"0 4px 16px rgba(0,0,0,0.15)", position:"relative", overflow:"hidden", minHeight:130, transition:"transform 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
          <div style={{ position:"absolute", bottom:-10, right:-10, fontSize:52, opacity:0.25 }}>{g.emoji}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
            <div style={{ color:"#fff", fontWeight:800, fontSize:14 }}>{g.name}</div>
          </div>
          {g.tag && <span style={{ background:"rgba(255,255,255,0.25)", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:8, letterSpacing:1 }}>{g.tag}</span>}
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:10, marginTop:6 }}>{g.desc}</div>
          <div style={{ fontSize:30, marginTop:8 }}>{g.emoji}</div>
        </div>
      ))}
    </div>
  );
}

export default function HomeScreen({ user, balance, onSelectGame, onGoProfile, onGoWallet, onGoActivity }) {
  const [activeNav, setActiveNav] = useState("home");
  const [activeCat, setActiveCat] = useState("popular");
  const username = (user?.contact?.includes("@") ? user.contact.split("@")[0] : user?.contact) || "Player";

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#F4F4F8", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", paddingBottom:80 }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background:gradient, padding:"16px 20px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:2 }}>
            SPIN<span style={{ color:"#FFE082" }}>OVA</span>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ background:"rgba(255,255,255,.2)", borderRadius:20, padding:"5px 12px", color:"#fff", fontWeight:700, fontSize:13 }}>৳{balance.toFixed(2)}</div>
            <div onClick={onGoProfile} style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16, color:"#fff", fontWeight:800 }}>
              {username[0]?.toUpperCase() || "🎮"}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div style={{ background:"rgba(255,255,255,.15)", borderRadius:16, padding:"16px", backdropFilter:"blur(10px)" }}>
          <div style={{ color:"rgba(255,255,255,.7)", fontSize:12, marginBottom:2 }}>Total Balance</div>
          <div style={{ color:"#fff", fontSize:32, fontWeight:900, marginBottom:12 }}>৳{balance.toFixed(2)}</div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onGoWallet} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:"rgba(255,255,255,.25)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>+ Deposit</button>
            <button onClick={onGoWallet} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"1.5px solid rgba(255,255,255,.5)", background:"transparent", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>↓ Withdraw</button>
          </div>
        </div>
      </div>

      {/* Category Icons */}
<div style={{ background: "#0d0d1a", padding: "14px 12px" }}>
  {/* Row 1 */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}>
    {CATEGORIES.slice(0, 3).map((cat) => (
      <div
        key={cat.id}
        onClick={() => setActiveCat(cat.id)}
        style={{
          borderRadius: 14,
          padding: "12px 6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 7,
          cursor: "pointer",
          background: activeCat === cat.id ? "linear-gradient(145deg,#1e1040,#2e1a5a)" : "linear-gradient(145deg,#14112a,#1c1838)",
          border: activeCat === cat.id ? "1.5px solid rgba(255,210,60,0.75)" : "1.5px solid rgba(255,255,255,0.07)",
          transition: "all 0.15s",
        }}
      >
        <img src={cat.img} alt={cat.label} style={{ width: 46, height: 46, objectFit: "contain" }} />
        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 700, color: activeCat === cat.id ? "#FFD23C" : "#c8c8e0" }}>{cat.label}</span>
        {activeCat === cat.id && <div style={{ width: 20, height: 3, borderRadius: 2, background: "#FFD23C" }} />}
      </div>
    ))}
  </div>

  {/* Row 2 */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
    {CATEGORIES.slice(3, 6).map((cat) => (
      <div
        key={cat.id}
        onClick={() => setActiveCat(cat.id)}
        style={{
          borderRadius: 14,
          padding: "12px 6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 7,
          cursor: "pointer",
          background: activeCat === cat.id ? "linear-gradient(145deg,#1e1040,#2e1a5a)" : "linear-gradient(145deg,#14112a,#1c1838)",
          border: activeCat === cat.id ? "1.5px solid rgba(255,210,60,0.75)" : "1.5px solid rgba(255,255,255,0.07)",
          transition: "all 0.15s",
          opacity: cat.soon ? 0.7 : 1,
        }}
      >
        <img src={cat.img} alt={cat.label} style={{ width: 46, height: 46, objectFit: "contain" }} />
        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 700, color: activeCat === cat.id ? "#FFD23C" : "#c8c8e0" }}>{cat.label}</span>
        {cat.soon && <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>SOON</span>}
        {activeCat === cat.id && !cat.soon && <div style={{ width: 20, height: 3, borderRadius: 2, background: "#FFD23C" }} />}
      </div>
    ))}
  </div>
</div> 
      {/* Game Content */}
      <div style={{ padding:"16px 14px" }}>
        {/* Section Title */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ width:4, height:20, background:G.red, borderRadius:2 }} />
          <span style={{ fontWeight:800, fontSize:15, color:G.text }}>
            {activeCat==="popular" ? "Popular Games" :
             activeCat==="lottery" ? "Lottery Games" :
             activeCat==="slots" ? "Slot Games" : "Games"}
          </span>
        </div>

        {(activeCat==="popular") && <GameList games={POPULAR_GAMES} onSelectGame={onSelectGame} />}
        {(activeCat==="lottery") && <GameList games={LOTTERY_GAMES} onSelectGame={onSelectGame} />}
        {(activeCat==="slots") && <SlotGrid games={SLOT_GAMES} onSelectGame={onSelectGame} />}

        {(activeCat==="sports" || activeCat==="casino" || activeCat==="fishing" || activeCat==="original") && (
          <div style={{ background:"#fff", borderRadius:20, padding:"40px 20px", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🚧</div>
            <div style={{ fontWeight:800, fontSize:18, color:G.text, marginBottom:8 }}>Coming Soon!</div>
            <div style={{ fontSize:13, color:G.sub }}>We're working hard to bring you this category</div>
          </div>
        )}
      </div>

    <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} onGoWallet={onGoWallet} onGoProfile={onGoProfile} onGoHome={() => {}} onGoActivity={onGoActivity} />
    </div>
  );
}
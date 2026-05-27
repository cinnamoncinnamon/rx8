import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import BottomNav from "../components/BottomNav";

const GAMES = [
  { id:"wingo", name:"Win Go", desc:"Guess Number · Green/Red/Violet", emoji:"🔮", bg:"linear-gradient(135deg,#EF5350,#FF8A80)" },
  { id:"aviator", name:"Aviator", desc:"Cash out before it flies away!", emoji:"✈️", bg:"linear-gradient(135deg,#0F0F2A,#3949AB)" },
  { id:"k3", name:"K3", desc:"Guess Number · Big/Small/Odd/Even", emoji:"🎲", bg:"linear-gradient(135deg,#F97316,#FBBF24)", soon:true },
  { id:"5d", name:"5D", desc:"Guess Number · Big/Small/Odd/Even", emoji:"🎯", bg:"linear-gradient(135deg,#22C55E,#16A34A)", soon:true },
  { id:"trx", name:"Trx Win", desc:"Guess Number · Green/Red/Violet", emoji:"💎", bg:"linear-gradient(135deg,#7C3AED,#A855F7)", soon:true },
  { id:"trading", name:"FX Trader", desc:"Trade USD/JPY · EUR/USD · GBP/USD · XAU/USD", emoji:"📈", bg:"linear-gradient(135deg,#0F2027,#203A43,#2C5364)" },
];

export default function HomeScreen({ user, balance, onSelectGame, onGoProfile, onGoWallet }) {
  const [activeNav, setActiveNav] = useState("home");
  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#F4F4F8", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", paddingBottom:80 }}>
      <style>{CSS}</style>
      <div style={{ background:gradient, padding:"16px 20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:1 }}>
            <span style={{ fontStyle:"italic", color:"#FFE082" }}>H</span>GNICE
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ background:"rgba(255,255,255,.2)", borderRadius:20, padding:"5px 12px", color:"#fff", fontWeight:700, fontSize:13 }}>৳{balance.toFixed(2)}</div>
            <div onClick={onGoProfile} style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:20 }}>🎮</div>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,.15)", borderRadius:16, padding:"16px", backdropFilter:"blur(10px)" }}>
          <div style={{ color:"rgba(255,255,255,.7)", fontSize:12, marginBottom:2 }}>Total Balance</div>
          <div style={{ color:"#fff", fontSize:32, fontWeight:900, marginBottom:12 }}>৳{balance.toFixed(2)}</div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onGoWallet} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:"rgba(255,255,255,.25)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>+ Deposit</button>
            <button onClick={onGoWallet} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"1.5px solid rgba(255,255,255,.5)", background:"transparent", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>↓ Withdraw</button>
          </div>
        </div>
      </div>
      <div style={{ padding:"18px 14px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ width:4, height:20, background:G.red, borderRadius:2 }} />
          <span style={{ fontWeight:800, fontSize:16, color:G.text }}>Lottery</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {GAMES.map((g) => (
            <div key={g.id} onClick={() => !g.soon && onSelectGame(g.id)}
              style={{ background:g.bg, borderRadius:16, padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:g.soon?"default":"pointer", boxShadow:"0 4px 16px #0002", transition:"transform .15s" }}
              onMouseEnter={(e) => { if(!g.soon) e.currentTarget.style.transform="scale(1.02)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.transform="scale(1)")}>
              <div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>{g.name}</div>
                <div style={{ color:"rgba(255,255,255,.8)", fontSize:12, marginTop:2 }}>{g.desc}</div>
                {g.soon && <div style={{ color:"rgba(255,255,255,.5)", fontSize:11, marginTop:4, background:"rgba(0,0,0,.2)", display:"inline-block", padding:"2px 8px", borderRadius:10 }}>Coming soon</div>}
              </div>
              <div style={{ fontSize:44 }}>{g.emoji}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} onGoWallet={onGoWallet} onGoProfile={onGoProfile} />
    </div>
  );
}
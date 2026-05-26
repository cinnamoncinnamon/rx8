import React, { useState } from "react";
import { G, gradient } from "../constants";
import SupportChat from "./SupportChat";

export default function FloatingHelp({ show, user }) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  if (!show) return null;
  if (chatOpen) return <SupportChat onClose={() => setChatOpen(false)} user={user} />;
  return (
    <>
      {open && (
        <div style={{ position:"fixed", bottom:92, right:16, background:"#fff", borderRadius:18, padding:"16px", width:235, boxShadow:"0 10px 40px #0004", zIndex:1000, fontFamily:"'Poppins',sans-serif", animation:"fadeIn .2s ease", border:"1px solid #f0f0f0" }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12, color:G.text, display:"flex", alignItems:"center", gap:6 }}>🎧 <span>Support Center</span></div>
          {["Deposit Not Received","Withdrawal Problem","Change Password","Modify E-Wallet","Add USDT Address","Check Official Website"].map((item, i) => (
            <div key={i} onClick={() => { setOpen(false); setChatOpen(true); }} style={{ padding:"8px 0", borderBottom:i<5?"1px solid #f5f5f5":"none", fontSize:13, color:"#444", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              {item}<span style={{ color:"#ddd", fontSize:16 }}>›</span>
            </div>
          ))}
          <button onClick={() => { setOpen(false); setChatOpen(true); }} style={{ width:"100%", marginTop:12, padding:"11px 0", borderRadius:12, border:"none", background:"#128C7E", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"'Poppins',sans-serif" }}>
            💬 Live Chat
          </button>
        </div>
      )}
      <div onClick={() => setOpen((o) => !o)} style={{ position:"fixed", bottom:92, right:16, width:54, height:54, borderRadius:"50%", background:open?"#128C7E":gradient, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:`0 6px 22px ${open?"#128C7E55":"#EF535066"}`, zIndex:1001, animation:"pulse 2.5s infinite", fontSize:24, transition:"background .3s" }}>
        {open ? "✕" : "💬"}
      </div>
    </>
  );
}
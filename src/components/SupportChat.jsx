import React, { useState, useEffect, useRef } from "react";
import { CSS } from "../constants";

const QUICK = ["How to deposit?","Withdrawal issue","Account help","Bonus info","Check balance"];
const AUTO_REPLIES = [
  "Thanks for reaching out! Our team will assist you shortly. 😊",
  "I understand your concern. Let me check that for you.",
  "Please provide your UID and we'll resolve this quickly!",
  "Your issue has been noted. Expected resolution: 24 hours.",
  "Is there anything else I can help you with today?",
];

export default function SupportChat({ onClose, user }) {
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
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", background:"#fff" }}>
      <style>{CSS}</style>
      <div style={{ background:"#075E54", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,.8)", fontSize:22, cursor:"pointer" }}>‹</button>
        <div style={{ width:38, height:38, borderRadius:"50%", background:"#128C7E", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🎧</div>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>HGNICE Support</div>
          <div style={{ color:"#B2DFDB", fontSize:11 }}>{typing ? "typing..." : "🟢 Online"}</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", background:"#E5DDD5", padding:"10px 10px 0", display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ textAlign:"center", marginBottom:4 }}>
          <span style={{ background:"rgba(255,255,255,.85)", borderRadius:12, padding:"4px 14px", fontSize:11, color:"#666" }}>TODAY</span>
        </div>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", justifyContent:msg.from==="user"?"flex-end":"flex-start", animation:"msgIn .18s ease" }}>
            {msg.from==="support" && <div style={{ width:28, height:28, borderRadius:"50%", background:"#128C7E", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, marginRight:6, marginTop:"auto" }}>🎧</div>}
            <div style={{ maxWidth:"76%", background:msg.from==="user"?"#DCF8C6":"#fff", borderRadius:msg.from==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px", padding:"9px 12px 6px", boxShadow:"0 1px 3px #0001" }}>
              {msg.from==="support" && <div style={{ fontSize:11, color:"#075E54", fontWeight:700, marginBottom:2 }}>Support Agent</div>}
              <div style={{ fontSize:14, color:"#1A1A2E", lineHeight:1.5, wordBreak:"break-word" }}>{msg.text}</div>
              <div style={{ fontSize:10, color:"#999", textAlign:"right", marginTop:4, display:"flex", alignItems:"center", justifyContent:"flex-end", gap:3 }}>
                {msg.time}
                {msg.from==="user" && <span style={{ color:"#34B7F1", fontSize:12 }}>✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:"flex", justifyContent:"flex-start", gap:6, alignItems:"flex-end" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"#128C7E", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎧</div>
            <div style={{ background:"#fff", borderRadius:"4px 16px 16px 16px", padding:"12px 16px", boxShadow:"0 1px 3px #0001", display:"flex", gap:4, alignItems:"center" }}>
              {[0,1,2].map((i) => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#aaa", animation:`dotBounce 1.2s ease-in-out ${i*0.15}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ background:"#F0F0F0", padding:"8px 10px 4px", display:"flex", gap:6, overflowX:"auto", borderTop:"1px solid #ddd", flexShrink:0 }}>
        {QUICK.map((q,i) => <button key={i} onClick={() => send(q)} style={{ flexShrink:0, padding:"6px 12px", borderRadius:20, border:"1px solid #128C7E", background:"#fff", color:"#075E54", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'Poppins',sans-serif" }}>{q}</button>)}
      </div>
      <div style={{ background:"#F0F0F0", padding:"8px 10px 12px", display:"flex", gap:8, alignItems:"flex-end", flexShrink:0 }}>
        <div style={{ flex:1, background:"#fff", borderRadius:24, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, boxShadow:"0 1px 4px #0001" }}>
          <span style={{ fontSize:20, cursor:"pointer" }}>😊</span>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }} placeholder="Type your message..." style={{ flex:1, border:"none", outline:"none", fontSize:14, background:"transparent", fontFamily:"'Poppins',sans-serif", color:"#1A1A2E" }} />
        </div>
        <button onClick={() => (input.trim() ? send() : null)} style={{ width:46, height:46, borderRadius:"50%", border:"none", background:"#128C7E", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:"0 2px 10px #128C7E55", flexShrink:0 }}>
          {input.trim() ? "➤" : "🎤"}
        </button>
      </div>
    </div>
  );
}
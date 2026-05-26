import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";

export default function WalletScreen({ balance, setBalance, accounts, onBack }) {
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
    <div style={{ maxWidth:480, margin:"0 auto", background:"#F4F4F8", minHeight:"100vh", fontFamily:"'Poppins',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ background:gradient, padding:"0 0 24px" }}>
        <div style={{ display:"flex", alignItems:"center", padding:"14px 20px" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}>‹</button>
          <span style={{ color:"#fff", fontWeight:700, fontSize:16, flex:1, textAlign:"center" }}>Wallet</span>
          <div style={{ width:30 }} />
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.7)" }}>Total Balance</div>
          <div style={{ fontSize:36, fontWeight:900, color:"#fff", marginTop:4 }}>৳{balance.toFixed(2)}</div>
        </div>
      </div>
      <div style={{ padding:"16px 14px" }}>
        <div style={{ display:"flex", background:"#fff", borderRadius:14, padding:4, gap:4, marginBottom:20, boxShadow:"0 2px 8px #0001" }}>
          {["deposit","withdraw"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setDone(""); setAmount(""); }} style={{ flex:1, padding:"11px 0", borderRadius:11, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, background:tab===t?gradient:"transparent", color:tab===t?"#fff":"#aaa", fontFamily:"'Poppins',sans-serif" }}>
              {t==="deposit"?"📥 Deposit":"📤 Withdraw"}
            </button>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:16, padding:"20px", boxShadow:"0 2px 8px #0001", marginBottom:16 }}>
          <div style={{ fontSize:13, color:G.sub, marginBottom:10, fontWeight:600 }}>Amount (৳)</div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount..." style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"1.5px solid #eee", fontSize:16, fontFamily:"'Poppins',sans-serif", marginBottom:14, color:G.text, outline:"none" }} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
            {presets.map((p) => (
              <button key={p} onClick={() => setAmount(p.toString())} style={{ padding:"10px 0", borderRadius:10, border:"1.5px solid #EF5350", background:amount==p?"#EF5350":"#fff", color:amount==p?"#fff":"#EF5350", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>৳{p}</button>
            ))}
          </div>
          {tab==="withdraw" && accounts && (
            <div style={{ background:"#f5f5f5", borderRadius:10, padding:"12px", marginBottom:16 }}>
              <div style={{ fontSize:12, color:G.sub, marginBottom:6, fontWeight:600 }}>Withdrawal account</div>
              <div style={{ fontWeight:700, color:G.text }}>{accounts.main}</div>
            </div>
          )}
          {done && <div style={{ background:"#E8F5E9", borderRadius:10, padding:"12px", marginBottom:14, color:"#2E7D32", fontWeight:600, fontSize:13 }}>{done}</div>}
          <button onClick={tab==="deposit"?doDeposit:doWithdraw} style={{ width:"100%", padding:"15px 0", borderRadius:12, border:"none", background:gradient, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"'Poppins',sans-serif", boxShadow:"0 6px 20px #EF535044" }}>
            {tab==="deposit"?"Deposit Now":"Request Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";

export default function DepositSetup({ contact, onDone }) {
  const [mainNum, setMainNum] = useState("");
  const [extraNums, setExtraNums] = useState(["", ""]);
  const [done, setDone] = useState(false);
  const save = () => {
    if (!mainNum) return;
    setDone(true);
    setTimeout(() => onDone({ main: mainNum, extras: extraNums }), 1000);
  };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#EF5350 0%,#FF8A80 42%,#fff 60%)", display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"'Poppins',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ paddingTop:50, paddingBottom:16, textAlign:"center" }}>
        <div style={{ fontSize:36, fontWeight:900, color:"#fff", letterSpacing:2 }}>
          <span style={{ fontStyle:"italic", color:"#FFE082" }}>S</span>PINOVA
        </div>
        <div style={{ color:"rgba(255,255,255,.8)", fontSize:13, marginTop:4 }}>💳 Payment Setup</div>
      </div>
      <div style={{ width:"92%", maxWidth:400, background:"#fff", borderRadius:24, padding:"28px 24px 36px", boxShadow:"0 20px 60px #EF535044" }}>
        <div style={{ fontWeight:800, fontSize:20, color:G.text, marginBottom:4 }}>💳 Payment Setup</div>
        <div style={{ color:G.sub, fontSize:12, marginBottom:20, lineHeight:1.7 }}>
          Set your deposit & withdrawal account. Main number cannot be changed later. Add up to 2 extra withdrawal numbers.
        </div>
        <div style={{ background:"#FFF3E0", borderRadius:12, padding:"12px 14px", marginBottom:20, fontSize:12, color:"#E65100", fontWeight:600 }}>
          ⚠️ Main number is permanent. Choose carefully.
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:G.text, marginBottom:6 }}>
            Main Account Number <span style={{ color:"#EF5350" }}>*</span>
          </div>
          <input value={mainNum} onChange={(e) => setMainNum(e.target.value)} placeholder="e.g. 01XXXXXXXXX"
            style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:"2px solid #EF5350", fontSize:14, fontFamily:"'Poppins',sans-serif", background:"#fff8f8", color:G.text }} />
          <div style={{ fontSize:11, color:G.sub, marginTop:4 }}>Used for both deposit and withdrawal</div>
        </div>
        {extraNums.map((n,i) => (
          <div key={i} style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:G.sub, marginBottom:6 }}>Withdrawal Number {i+2} (optional)</div>
            <input value={n} onChange={(e) => { const a=[...extraNums]; a[i]=e.target.value; setExtraNums(a); }}
              placeholder={`Alternative number ${i+2}`}
              style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:"1.5px solid #eee", fontSize:14, fontFamily:"'Poppins',sans-serif", background:"#fafafa", color:G.text }} />
          </div>
        ))}
        <button onClick={save} style={{ width:"100%", padding:"15px 0", borderRadius:14, border:"none", marginTop:12, background:done?"#ccc":gradient, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 20px #EF535044" }}>
          {done ? "Setting up..." : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}
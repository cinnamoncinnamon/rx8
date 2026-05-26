import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";

export default function SettingsScreen({ user, onBack }) {
  const [loginOld, setLoginOld] = useState(""); const [loginNew, setLoginNew] = useState(""); const [loginConfirm, setLoginConfirm] = useState("");
  const [withOld, setWithOld] = useState(""); const [withNew, setWithNew] = useState(""); const [withConfirm, setWithConfirm] = useState("");
  const [loginMsg, setLoginMsg] = useState(""); const [withMsg, setWithMsg] = useState("");
  const saveLogin = () => { if (!loginOld||!loginNew||!loginConfirm){setLoginMsg("Fill all fields.");return;} if(loginNew!==loginConfirm){setLoginMsg("Passwords don't match.");return;} setLoginMsg("✅ Login password updated!"); setTimeout(()=>setLoginMsg(""),3000); setLoginOld("");setLoginNew("");setLoginConfirm(""); };
  const saveWith  = () => { if (!withOld||!withNew||!withConfirm){setWithMsg("Fill all fields.");return;} if(withNew!==withConfirm){setWithMsg("Passwords don't match.");return;} setWithMsg("✅ Withdrawal password updated!"); setTimeout(()=>setWithMsg(""),3000); setWithOld("");setWithNew("");setWithConfirm(""); };
  const Field = ({label,val,set,ph}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:12,color:G.sub,fontWeight:600,marginBottom:5}}>{label}</div>
      <input type="password" value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",padding:"12px 14px",borderRadius:11,border:"1.5px solid #eee",fontSize:14,fontFamily:"'Poppins',sans-serif",background:"#fafafa",color:G.text,outline:"none"}} />
    </div>
  );
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif",paddingBottom:80}}>
      <style>{CSS}</style>
      <div style={{background:gradient,padding:"0 0 20px"}}>
        <div style={{display:"flex",alignItems:"center",padding:"14px 20px"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer"}}>‹</button>
          <span style={{color:"#fff",fontWeight:700,fontSize:16,flex:1,textAlign:"center"}}>Settings Center</span>
          <div style={{width:30}}/>
        </div>
      </div>
      <div style={{padding:"16px 14px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"#fff",borderRadius:16,padding:"18px",boxShadow:"0 2px 8px #0001"}}>
          <div style={{fontWeight:800,fontSize:15,color:G.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🔐</span> Login Password</div>
          <Field label="Current Password" val={loginOld} set={setLoginOld} ph="Enter current password" />
          <Field label="New Password" val={loginNew} set={setLoginNew} ph="Enter new password" />
          <Field label="Confirm New Password" val={loginConfirm} set={setLoginConfirm} ph="Confirm new password" />
          {loginMsg && <div style={{fontSize:12,color:loginMsg.startsWith("✅")?"#22C55E":"#EF5350",marginBottom:8,fontWeight:600}}>{loginMsg}</div>}
          <button onClick={saveLogin} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:gradient,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>Update Login Password</button>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:"18px",boxShadow:"0 2px 8px #0001"}}>
          <div style={{fontWeight:800,fontSize:15,color:G.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>💳</span> Withdrawal Password</div>
          <Field label="Current Password" val={withOld} set={setWithOld} ph="Enter current password" />
          <Field label="New Password" val={withNew} set={setWithNew} ph="Enter new password" />
          <Field label="Confirm New Password" val={withConfirm} set={setWithConfirm} ph="Confirm new password" />
          {withMsg && <div style={{fontSize:12,color:withMsg.startsWith("✅")?"#22C55E":"#EF5350",marginBottom:8,fontWeight:600}}>{withMsg}</div>}
          <button onClick={saveWith} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:gradient,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>Update Withdrawal Password</button>
        </div>
      </div>
    </div>
  );
}
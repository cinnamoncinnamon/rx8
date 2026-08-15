import React, { useState } from "react";
import { G, CSS, gradient } from "../constants";
import { sound } from "../sound/soundManager";

function censorContact(c) {
  if (!c) return "Not set";
  if (c.includes("@")) {
    const [local, domain] = c.split("@");
    return local.slice(0, 2) + "•••" + local.slice(-1) + "@" + domain;
  }
  if (c.length >= 11) return c.slice(0, 3) + "•••••" + c.slice(-3);
  return c;
}

function Row({ icon, label, value, onClick, last }) {
  return (
    <div onClick={onClick} style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"16px", cursor: onClick ? "pointer" : "default",
      borderBottom: last ? "none" : "1px solid #f2f2f5",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {icon && (
          <div style={{ width:36, height:36, borderRadius:10, background:"#FFF0F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>
            {icon}
          </div>
        )}
        <span style={{ fontSize:14, color: icon ? G.text : G.sub, fontWeight: icon ? 600 : 500 }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {value && <span style={{ fontSize:13, color:G.sub }}>{value}</span>}
        {onClick && <span style={{ color:"#ccc", fontSize:18 }}>›</span>}
      </div>
    </div>
  );
}

export default function SettingsScreen({ user, onBack, onGoSecurity }) {
  const username = user?.name || (user?.contact?.includes("@") ? user.contact.split("@")[0] : user?.contact) || "Member";
  const isEmail = user?.contact?.includes("@");
  const uid = user?.uid || "100000";

  const copyUid = () => {
    navigator.clipboard?.writeText(uid);
  };

  const [muted, setMutedState] = useState(sound.isMuted());
  const [volume, setVolumeState] = useState(sound.getVolume());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setMutedState(next);
    if (!next) sound.play("click");
  };

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value) / 100;
    sound.setVolume(v);
    setVolumeState(v);
  };

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#F4F4F8", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", paddingBottom:40 }}>
      <style>{CSS}</style>
      <div style={{ background:gradient, padding:"0 0 20px" }}>
        <div style={{ display:"flex", alignItems:"center", padding:"14px 20px" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}>‹</button>
          <span style={{ color:"#fff", fontWeight:700, fontSize:16, flex:1, textAlign:"center" }}>Settings Center</span>
          <div style={{ width:30 }} />
        </div>
      </div>

      <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Profile block */}
        <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 8px #0001", overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", borderBottom:"1px solid #f2f2f5" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#fff" }}>
                {username[0]?.toUpperCase() || "🎮"}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:G.sub, fontSize:13 }}>
              Change avatar <span style={{ color:"#ccc", fontSize:18 }}>›</span>
            </div>
          </div>
          <Row label="Nickname" value={username} onClick={() => {}} />
          <Row label="UID" value={
            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
              {uid}
              <span onClick={(e) => { e.stopPropagation(); copyUid(); }} style={{ cursor:"pointer", fontSize:12, color:"#EF5350" }}>⧉</span>
            </span>
          } last />
        </div>

        {/* Sound preferences */}
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:G.text, margin:"4px 0 10px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:4, height:16, background:"#EF5350", borderRadius:2, display:"inline-block" }} />
            Sound
          </div>
          <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 8px #0001", overflow:"hidden", padding:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"#FFF0F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>
                  {muted ? "🔇" : "🔊"}
                </div>
                <span style={{ fontSize:14, color:G.text, fontWeight:600 }}>Game sound</span>
              </div>
              <div
                onClick={handleToggleMute}
                style={{
                  width:44, height:26, borderRadius:13, cursor:"pointer",
                  background: muted ? "#e0e0e6" : gradient,
                  position:"relative", transition:"background 0.15s",
                }}
              >
                <div style={{
                  position:"absolute", top:2, left: muted ? 2 : 20,
                  width:22, height:22, borderRadius:"50%", background:"#fff",
                  boxShadow:"0 1px 4px #0003", transition:"left 0.15s",
                }} />
              </div>
            </div>
            <div style={{ marginTop:14, opacity: muted ? 0.4 : 1, pointerEvents: muted ? "none" : "auto" }}>
              <div style={{ fontSize:12, color:G.sub, marginBottom:6 }}>Volume</div>
              <input
                type="range" min="0" max="100" value={Math.round(volume * 100)}
                onChange={handleVolumeChange}
                style={{ width:"100%", accentColor:"#EF5350" }}
              />
            </div>
          </div>
        </div>

        {/* Security information */}
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:G.text, margin:"4px 0 10px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:4, height:16, background:"#EF5350", borderRadius:2, display:"inline-block" }} />
            Security information
          </div>
          <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 8px #0001", overflow:"hidden" }}>
            <Row icon="🔒" label="Login password" value="Edit" onClick={onGoSecurity} />
            <Row icon="✉️" label={isEmail ? "Mail" : "Mobile"} value={censorContact(user?.contact)} onClick={onGoSecurity} />
            <Row icon="ℹ️" label="Updated version" value="1.0.9" last />
          </div>
        </div>

      </div>
    </div>
  );
}
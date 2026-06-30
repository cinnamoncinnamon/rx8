import React, { useState, useRef } from "react";
import { G, CSS, gradient } from "../constants";
import SubHeader from "../components/SubHeader";
import BottomNav from "../components/BottomNav";
import SupportChat from "../components/SupportChat";
import { hasDepositHistory, isBonusClaimed, setBonusClaimed, getDeposits } from "../utils/activityStore";

const AVATARS = ["🎮","🦊","🐉","🎯","🦁","🤖","👾","🎪","🦸","🧙","🐺","🦅","🐯","🦄","🎭","🎨"];

function GameHistoryScreen({ onBack, myHistory }) {
  const items = myHistory && myHistory.length > 0 ? myHistory : [];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Game History" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        {items.length === 0 ? (
          <div style={{background:"#fff",borderRadius:16,padding:"60px 20px",textAlign:"center",boxShadow:"0 2px 8px #0001"}}>
            <div style={{fontSize:48,marginBottom:12}}>🎮</div>
            <div style={{fontWeight:700,fontSize:16,color:G.text,marginBottom:6}}>No game records yet</div>
            <div style={{fontSize:13,color:G.sub}}>Start playing to see your history here</div>
          </div>
        ) : items.map((row,i) => (
          <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 8px #0001"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,color:G.sub}}>{row.period?.slice(-8)} · {row.time}</span>
              <span style={{fontWeight:800,fontSize:14,color:row.totalWin>0?"#22C55E":"#EF5350"}}>{row.totalWin>0?`+৳${row.totalWin.toFixed(2)} Won 🎉`:"No win"}</span>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {row.bets?.map((b,j)=>(
                <span key={j} style={{padding:"3px 10px",background:"#F4F4F8",borderRadius:20,fontSize:11,fontWeight:600,color:G.text}}>{b.label} ৳{b.amount}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionScreen({ onBack, balance }) {
  const txns = [
    {type:"Deposit",amount:"+৳500.00",time:"Today, 10:32 AM",status:"Success",icon:"📥",col:"#22C55E"},
    {type:"Withdrawal",amount:"-৳200.00",time:"Yesterday, 3:15 PM",status:"Success",icon:"📤",col:"#EF5350"},
    {type:"Win Bonus",amount:"+৳90.00",time:"Yesterday, 2:00 PM",status:"Credited",icon:"🎉",col:"#22C55E"},
    {type:"Deposit",amount:"+৳1000.00",time:"May 15, 9:45 AM",status:"Success",icon:"📥",col:"#22C55E"},
    {type:"Withdrawal",amount:"-৳300.00",time:"May 14, 4:20 PM",status:"Processing",icon:"📤",col:"#F97316"},
  ];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Transaction History" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        {txns.map((t,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 8px #0001",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:t.col+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{t.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:G.text}}>{t.type}</div>
              <div style={{fontSize:11,color:G.sub,marginTop:2}}>{t.time}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,fontSize:15,color:t.col}}>{t.amount}</div>
              <div style={{fontSize:10,marginTop:2,color:t.status==="Processing"?"#F97316":"#22C55E",fontWeight:600}}>{t.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationScreen({ onBack }) {
  const notes = [
    {icon:"🎉",title:"Win Bonus Credited",body:"৳90.00 has been credited to your account.",time:"2 min ago",unread:true},
    {icon:"📢",title:"New Event: Double Win Weekend",body:"Play this weekend and earn 2x rewards on all games!",time:"1 hour ago",unread:true},
    {icon:"✅",title:"Deposit Successful",body:"Your deposit of ৳500 was processed successfully.",time:"Today, 10:32 AM",unread:false},
    {icon:"🔔",title:"Security Alert",body:"Your password was changed. If this wasn't you, contact support.",time:"Yesterday",unread:false},
    {icon:"🎁",title:"Daily Gift Available",body:"Your daily login bonus is ready to claim!",time:"Yesterday",unread:false},
  ];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Notifications" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        {notes.map((n,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 8px #0001",display:"flex",gap:14,alignItems:"flex-start",borderLeft:n.unread?"3px solid #EF5350":"3px solid transparent"}}>
            <div style={{width:42,height:42,borderRadius:12,background:n.unread?"#FFF0F0":"#F5F5F5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:G.text,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {n.title}
                {n.unread && <span style={{width:8,height:8,borderRadius:"50%",background:"#EF5350",display:"inline-block",flexShrink:0}}/>}
              </div>
              <div style={{fontSize:12,color:G.sub,marginTop:4,lineHeight:1.5}}>{n.body}</div>
              <div style={{fontSize:10,color:"#bbb",marginTop:4}}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GiftsScreen({ onBack, onGoPromo }) {
  const [, forceTick] = useState(0);
  const deposited = hasDepositHistory();
  const totalDeposit = getDeposits().total;
  const refData = JSON.parse(localStorage.getItem("spinova_referrals") || "{}");
  const pendingRefs = refData.pending || 0;

  const dailyClaimed = isBonusClaimed("daily");
  const firstDepClaimed = isBonusClaimed("firstdep");

  const claimDaily = () => {
    if (!deposited || dailyClaimed) return;
    setBonusClaimed("daily");
    forceTick(t => t + 1);
  };
  const claimFirstDeposit = () => {
    if (!deposited || firstDepClaimed) return;
    setBonusClaimed("firstdep");
    forceTick(t => t + 1);
  };

  const firstDepBonusAmt = Math.min(Math.round(totalDeposit * 0.10), 10);

  const gifts = [
    {
      id: 1, icon: "🎁", title: "Daily Login Bonus",
      desc: deposited ? "Log in every day to earn rewards" : "Make a deposit to unlock daily bonus",
      amount: "৳5.00",
      expires: deposited ? "Expires today" : "Requires deposit",
      claimable: deposited && !dailyClaimed,
      claimed: dailyClaimed,
      onClick: claimDaily,
    },
    {
      id: 2, icon: "🏆", title: "First Deposit Bonus",
      desc: "10% bonus on your first deposit (max ৳10)",
      amount: deposited ? `৳${firstDepBonusAmt.toFixed(2)}` : "Up to ৳10",
      expires: deposited ? "Limited time" : "Make a deposit to unlock",
      claimable: deposited && !firstDepClaimed,
      claimed: firstDepClaimed,
      onClick: claimFirstDeposit,
    },
    {
   
      id: 4, icon: "👥", title: "Referral Reward",
      desc: pendingRefs > 0
        ? `${pendingRefs} friend${pendingRefs > 1 ? "s" : ""} pending deposit — earn ৳10 each`
        : "Invite a friend — you both win once they deposit",
      amount: "৳10.00",
      expires: "Go to Promotions → Agency",
      claimable: false,
      claimed: false,
      onClick: () => onGoPromo?.(),
      buttonLabel: "View",
    },
  ];

  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Gifts & Bonuses" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        {!deposited && (
          <div style={{background:"#FFF3E0",borderRadius:14,padding:"12px 14px",marginBottom:14,fontSize:12,color:"#E65100",fontWeight:600}}>
            💡 Make your first deposit to unlock Daily Login and First Deposit bonuses.
          </div>
        )}
        {gifts.map((g)=>(
          <div key={g.id} style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:12,boxShadow:"0 2px 8px #0001",display:"flex",gap:14,alignItems:"center",opacity:(!g.claimable && !g.claimed && (g.id===1||g.id===2) && !deposited)?0.6:1}}>
            <div style={{width:52,height:52,borderRadius:16,background:g.claimable?"linear-gradient(135deg,#EF5350,#FF8A80)":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{g.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:G.text}}>{g.title}</div>
              <div style={{fontSize:11,color:G.sub,marginTop:2}}>{g.desc}</div>
              <div style={{fontSize:13,fontWeight:800,color:"#EF5350",marginTop:4}}>{g.amount}</div>
              <div style={{fontSize:10,color:"#bbb",marginTop:2}}>{g.expires}</div>
            </div>
            <button onClick={g.onClick} style={{padding:"8px 14px",borderRadius:20,border:"none",background:g.claimed?"#e0e0e0":(g.claimable||g.buttonLabel)?gradient:"#e0e0e0",color:g.claimed?"#999":(g.claimable||g.buttonLabel)?"#fff":"#999",fontWeight:700,fontSize:12,cursor:(g.claimable||g.buttonLabel)?"pointer":"default",fontFamily:"'Poppins',sans-serif",whiteSpace:"nowrap"}}>
              {g.claimed?"Claimed":g.buttonLabel?g.buttonLabel:g.claimable?"Claim":"Locked"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameStatsScreen({ onBack }) {
  const stats = [
    {label:"Total Bets",value:"0",icon:"🎮",col:"#3B82F6"},
    {label:"Total Wins",value:"0",icon:"🏆",col:"#22C55E"},
    {label:"Total Losses",value:"0",icon:"💔",col:"#EF5350"},
    {label:"Win Rate",value:"0%",icon:"📊",col:"#F97316"},
    {label:"Total Wagered",value:"৳0",icon:"💰",col:"#7C3AED"},
    {label:"Net Profit",value:"৳0",icon:"📈",col:"#22C55E"},
  ];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Game Statistics" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {stats.map((s,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px #0001",textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:s.col}}>{s.value}</div>
              <div style={{fontSize:11,color:G.sub,fontWeight:600,marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageScreen({ onBack }) {
  const [selected, setSelected] = useState("English");
  const langs = [
    {code:"en",name:"English",native:"English",flag:"🇬🇧"},
    {code:"bn",name:"Bengali",native:"বাংলা",flag:"🇧🇩"},
    {code:"hi",name:"Hindi",native:"हिन्दी",flag:"🇮🇳"},
    {code:"ur",name:"Urdu",native:"اردو",flag:"🇵🇰"},
  ];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Language" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        <div style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px #0001"}}>
          {langs.map((l,i)=>(
            <div key={l.code} onClick={()=>setSelected(l.name)} style={{display:"flex",alignItems:"center",padding:"16px",borderBottom:i<langs.length-1?"1px solid #f5f5f5":"none",cursor:"pointer",background:selected===l.name?"#FFF0F0":"#fff"}}>
              <span style={{fontSize:26,marginRight:14}}>{l.flag}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:G.text}}>{l.name}</div>
                <div style={{fontSize:12,color:G.sub}}>{l.native}</div>
              </div>
              <div style={{width:22,height:22,borderRadius:"50%",border:"2px solid",borderColor:selected===l.name?"#EF5350":"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {selected===l.name&&<div style={{width:12,height:12,borderRadius:"50%",background:"#EF5350"}}/>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onBack} style={{width:"100%",marginTop:16,padding:"14px",borderRadius:12,border:"none",background:gradient,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>Save Language</button>
      </div>
    </div>
  );
}

function FeedbackScreen({ onBack }) {
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("Bug");
  const [sent, setSent] = useState(false);
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Feedback" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        <div style={{background:"#fff",borderRadius:16,padding:"20px",boxShadow:"0 2px 8px #0001"}}>
          <div style={{fontSize:13,fontWeight:600,color:G.sub,marginBottom:8}}>Type</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {["Bug","Suggestion","Complaint","Other"].map(t=>(
              <button key={t} onClick={()=>setType(t)} style={{padding:"7px 16px",borderRadius:20,border:"none",background:type===t?gradient:"#f0f0f0",color:type===t?"#fff":"#666",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>{t}</button>
            ))}
          </div>
          <div style={{fontSize:13,fontWeight:600,color:G.sub,marginBottom:8}}>Your Message</div>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Describe your feedback..." rows={5} style={{width:"100%",padding:"12px",borderRadius:12,border:"1.5px solid #eee",fontSize:14,fontFamily:"'Poppins',sans-serif",resize:"none",outline:"none",color:G.text,background:"#fafafa"}}/>
          {sent && <div style={{color:"#22C55E",fontWeight:600,fontSize:13,marginTop:8}}>✅ Feedback submitted!</div>}
          <button onClick={()=>{if(msg.trim()){setSent(true);setMsg("");}}} style={{width:"100%",marginTop:14,padding:"14px",borderRadius:12,border:"none",background:gradient,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementScreen({ onBack }) {
  const items = [
    {title:"🎉 New Game: K3 Coming Soon!",body:"K3 Lottery will be launching next week.",date:"May 18, 2026",hot:true},
    {title:"💰 Double Rewards Weekend",body:"This Saturday and Sunday all WinGo bets earn 2x rewards.",date:"May 15, 2026",hot:true},
    {title:"🔧 Scheduled Maintenance",body:"Platform maintenance on May 20 from 2:00 AM to 4:00 AM.",date:"May 14, 2026",hot:false},
    {title:"🏆 VIP Program Upgraded",body:"Our VIP system has been upgraded with new tiers.",date:"May 10, 2026",hot:false},
  ];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Announcements" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        {items.map((a,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:10,boxShadow:"0 2px 8px #0001",borderLeft:a.hot?"4px solid #EF5350":"4px solid transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontWeight:700,fontSize:14,color:G.text,flex:1,paddingRight:8}}>{a.title}</div>
              {a.hot&&<span style={{background:"#EF5350",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,flexShrink:0}}>HOT</span>}
            </div>
            <div style={{fontSize:12,color:G.sub,lineHeight:1.6,marginBottom:8}}>{a.body}</div>
            <div style={{fontSize:10,color:"#bbb"}}>{a.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeginnerGuideScreen({ onBack }) {
  const steps = [
    {num:1,title:"Register & Verify",desc:"Create your account using your mobile number.",icon:"📱"},
    {num:2,title:"Deposit Funds",desc:"Go to Wallet → Deposit. Pay via bKash, Nagad, or bank transfer.",icon:"💳"},
    {num:3,title:"Choose a Game",desc:"Pick from WinGo, Aviator, or FX Trader.",icon:"🎮"},
    {num:4,title:"Place Your Bet",desc:"Select your prediction and set your amount.",icon:"🎯"},
    {num:5,title:"Watch the Result",desc:"Results are real-time and provably fair.",icon:"🏆"},
    {num:6,title:"Withdraw Winnings",desc:"Go to Wallet → Withdraw.",icon:"💰"},
  ];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="Beginner's Guide" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        <div style={{background:gradient,borderRadius:16,padding:"16px 20px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:6}}>👋</div>
          <div style={{color:"#fff",fontWeight:800,fontSize:16}}>Welcome to SPINOVA!</div>
          <div style={{color:"rgba(255,255,255,.8)",fontSize:12,marginTop:4}}>Follow these steps to start winning</div>
        </div>
        {steps.map((s,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:10,boxShadow:"0 2px 8px #0001",display:"flex",gap:14,alignItems:"flex-start"}}>
            <div style={{width:40,height:40,borderRadius:12,background:gradient,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16,flexShrink:0}}>{s.num}</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:G.text}}>{s.icon} {s.title}</div>
              <div style={{fontSize:12,color:G.sub,marginTop:4,lineHeight:1.6}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutUsScreen({ onBack }) {
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="About Us" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        <div style={{background:gradient,borderRadius:16,padding:"32px 20px",textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:44,fontWeight:900,color:"#fff",letterSpacing:2}}><span style={{fontStyle:"italic",color:"#FFE082"}}>S</span>PINOVA</div>
          <div style={{color:"rgba(255,255,255,.8)",fontSize:12,letterSpacing:4,marginTop:4}}>GAMING PLATFORM</div>
          <div style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"4px 16px",display:"inline-block",marginTop:12,color:"#fff",fontSize:12,fontWeight:600}}>Version 1.0.9</div>
        </div>
        {[
          {icon:"🏢",title:"Company",value:"SPINOVA Entertainment Ltd."},
          {icon:"🌍",title:"Region",value:"Bangladesh · Asia"},
          {icon:"📧",title:"Support Email",value:"support@spinova.com"},
          {icon:"💬",title:"Live Chat",value:"Available 24/7"},
          {icon:"🔒",title:"Security",value:"256-bit SSL Encrypted"},
          {icon:"⚖️",title:"License",value:"Certified RNG & Fair Play"},
        ].map((r,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:12,padding:"14px 16px",marginBottom:8,boxShadow:"0 2px 8px #0001",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22}}>{r.icon}</span>
            <div>
              <div style={{fontSize:11,color:G.sub,fontWeight:600}}>{r.title}</div>
              <div style={{fontWeight:700,fontSize:13,color:G.text,marginTop:2}}>{r.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VIPScreen({ onBack }) {
  const tiers = [
    {level:"VIP 0",req:"৳0",weekly:"৳0",badge:"⭐",col:"#888"},
    {level:"VIP 1",req:"৳1,000",weekly:"৳50",badge:"🥉",col:"#CD7F32"},
    {level:"VIP 2",req:"৳5,000",weekly:"৳200",badge:"🥈",col:"#C0C0C0"},
    {level:"VIP 3",req:"৳20,000",weekly:"৳500",badge:"🥇",col:"#FFD700"},
    {level:"VIP 4",req:"৳100,000",weekly:"৳2,000",badge:"💎",col:"#7C3AED"},
    {level:"VIP 5",req:"৳500,000",weekly:"৳10,000",badge:"👑",col:"#EF5350"},
  ];
  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <SubHeader title="VIP Club" onBack={onBack}/>
      <div style={{padding:"14px"}}>
        <div style={{background:"linear-gradient(135deg,#1A1A2E,#7C3AED)",borderRadius:16,padding:"24px 20px",textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:36}}>👑</div>
          <div style={{color:"#fff",fontWeight:800,fontSize:18,marginTop:8}}>VIP Program</div>
          <div style={{color:"rgba(255,255,255,.7)",fontSize:12,marginTop:4}}>Earn more as you play more</div>
          <div style={{background:"rgba(255,255,255,.15)",borderRadius:20,padding:"6px 20px",display:"inline-block",marginTop:12,color:"#FFE082",fontWeight:700,fontSize:13}}>Current: VIP 0 ⭐</div>
        </div>
        {tiers.map((t,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:12,padding:"14px 16px",marginBottom:8,boxShadow:"0 2px 8px #0001",display:"flex",alignItems:"center",gap:12,opacity:i===0?1:0.75}}>
            <div style={{fontSize:28,flexShrink:0}}>{t.badge}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:t.col}}>{t.level}</div>
              <div style={{fontSize:11,color:G.sub,marginTop:2}}>Total deposit: {t.req}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:G.sub}}>Weekly bonus</div>
              <div style={{fontWeight:800,fontSize:14,color:t.col}}>{t.weekly}</div>
            </div>
            {i===0&&<div style={{background:"#EF5350",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10}}>CURRENT</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityScreen({ onBack, user, accounts, setAccounts }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passMsg, setPassMsg] = useState("");

  const [newContact, setNewContact] = useState("");
  const [contactPass, setContactPass] = useState("");
  const [showContactPass, setShowContactPass] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [contactMsg, setContactMsg] = useState("");

  const [newExtra, setNewExtra] = useState("");
  const [extraPass, setExtraPass] = useState("");
  const [showExtraPass, setShowExtraPass] = useState(false);
  const [extraMsg, setExtraMsg] = useState("");

  const isEmail = user?.contact?.includes("@");

  const censorContact = (c) => {
    if (!c) return "Not set";
    if (c.includes("@")) {
      const [local, domain] = c.split("@");
      return local.slice(0, 2) + "•••" + local.slice(-1) + "@" + domain;
    }
    if (c.length >= 11) return c.slice(0, 3) + "•••••" + c.slice(-3);
    return c;
  };

  const savePass = () => {
    if (!oldPass || !newPass || !confirmPass) { setPassMsg("❌ Fill all fields."); return; }
    if (newPass.length < 6) { setPassMsg("❌ Min 6 characters."); return; }
    if (newPass !== confirmPass) { setPassMsg("❌ Passwords don't match."); return; }
    setPassMsg("✅ Password updated!");
    setTimeout(() => setPassMsg(""), 3000);
    setOldPass(""); setNewPass(""); setConfirmPass("");
  };

  const saveContact = () => {
    if (!newContact || !contactPass) { setContactMsg("❌ Fill all fields."); return; }
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact)) { setContactMsg("❌ Invalid email."); return; }
    } else {
      if (!/^(\+8801|01)[3-9]\d{8}$/.test(newContact.replace(/\s/g,""))) { setContactMsg("❌ Invalid BD number."); return; }
    }
    setContactMsg("✅ " + (isEmail ? "Email" : "Number") + " updated!");
    setTimeout(() => setContactMsg(""), 3000);
    setNewContact(""); setContactPass("");
  };

  const addExtraAccount = () => {
    const clean = newExtra.replace(/\s/g, "");
    if (!clean) { setExtraMsg("❌ Enter a number."); return; }
    if (!extraPass) { setExtraMsg("❌ Enter your password to confirm."); return; }
    if (!/^(\+8801|01)[3-9]\d{8}$/.test(clean)) { setExtraMsg("❌ Invalid BD number."); return; }
    const existing = accounts?.extras || [];
    if (existing.length >= 2) { setExtraMsg("❌ Max 2 extra numbers allowed."); return; }
    if (clean === accounts?.main || existing.includes(clean)) { setExtraMsg("❌ Number already added."); return; }
    setAccounts?.(a => ({ ...a, extras: [...(a?.extras || []), clean] }));
    setExtraMsg("✅ Withdrawal number added!");
    setTimeout(() => setExtraMsg(""), 3000);
    setNewExtra(""); setExtraPass("");
  };

  const removeExtraAccount = (num) => {
    setAccounts?.(a => ({ ...a, extras: (a?.extras || []).filter(e => e !== num) }));
  };

  const EyeBtn = ({ show, toggle }) => (
    <button onClick={toggle} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:0, fontSize:16, color:"#aaa" }}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  const PwField = ({ label, val, set, show, toggle, ph="••••••••" }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:12, color:G.sub, fontWeight:600, marginBottom:6 }}>{label}</div>
      <div style={{ position:"relative" }}>
        <input type={show ? "text" : "password"} value={val} onChange={e => set(e.target.value)}
          placeholder={ph} maxLength={64}
          style={{ width:"100%", padding:"13px 44px 13px 16px", borderRadius:12, border:"1.5px solid #eee", fontSize:14, fontFamily:"'Poppins',sans-serif", background:"#fafafa", color:G.text, boxSizing:"border-box" }} />
        <EyeBtn show={show} toggle={toggle} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#F4F4F8", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", paddingBottom:40 }}>
      <div style={{ background:gradient, padding:"0 0 20px" }}>
        <div style={{ display:"flex", alignItems:"center", padding:"14px 20px" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}>‹</button>
          <span style={{ color:"#fff", fontWeight:700, fontSize:16, flex:1, textAlign:"center" }}>Security</span>
          <div style={{ width:30 }} />
        </div>
      </div>

      <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Current contact (censored) */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px", boxShadow:"0 2px 8px #0001" }}>
          <div style={{ fontWeight:800, fontSize:15, color:G.text, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:20 }}>{isEmail ? "📧" : "📱"}</span>
            {isEmail ? "Email Address" : "Mobile Number"}
          </div>
          <div style={{ background:"#F8F8FF", borderRadius:12, padding:"14px 16px", border:"1.5px solid #eee", marginBottom:16 }}>
            <div style={{ fontSize:11, color:G.sub, fontWeight:600, marginBottom:4 }}>Current {isEmail ? "Email" : "Number"}</div>
            <div style={{ fontWeight:700, fontSize:17, color:G.text, letterSpacing:2 }}>{censorContact(user?.contact)}</div>
          </div>

          <div style={{ fontSize:13, fontWeight:700, color:G.text, marginBottom:12 }}>Change {isEmail ? "Email" : "Number"}</div>

          {/* New contact field with eye toggle */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:G.sub, fontWeight:600, marginBottom:6 }}>New {isEmail ? "Email" : "Mobile Number"}</div>
            <div style={{ position:"relative" }}>
              <input
                type={showNewContact ? "text" : "password"}
                value={newContact} onChange={e => setNewContact(e.target.value)}
                placeholder={isEmail ? "new@email.com" : "+880 XXXXXXXXXX"}
                maxLength={isEmail ? 100 : 15}
                style={{ width:"100%", padding:"13px 44px 13px 16px", borderRadius:12, border:"1.5px solid #eee", fontSize:14, fontFamily:"'Poppins',sans-serif", background:"#fafafa", color:G.text, boxSizing:"border-box" }}
              />
              <EyeBtn show={showNewContact} toggle={() => setShowNewContact(v => !v)} />
            </div>
          </div>

          <PwField label="Confirm with Password" val={contactPass} set={setContactPass} show={showContactPass} toggle={() => setShowContactPass(v => !v)} />
          {contactMsg && <div style={{ fontSize:12, fontWeight:600, color: contactMsg.startsWith("✅") ? "#22C55E" : "#EF5350", marginBottom:10 }}>{contactMsg}</div>}
          <button onClick={saveContact} style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:gradient, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
            Update {isEmail ? "Email" : "Number"}
          </button>
        </div>

        {/* Withdrawal Accounts */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px", boxShadow:"0 2px 8px #0001" }}>
          <div style={{ fontWeight:800, fontSize:15, color:G.text, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:20 }}>💳</span> Withdrawal Accounts
          </div>

          <div style={{ background:"#FFF8E1", borderRadius:12, padding:"12px 14px", marginBottom:10, border:"1px solid #FFE082" }}>
            <div style={{ fontSize:11, color:"#E65100", fontWeight:600, marginBottom:4 }}>Main Account (registered number)</div>
            <div style={{ fontWeight:700, fontSize:15, color:G.text }}>{censorContact(accounts?.main || user?.contact)}</div>
          </div>

          {(accounts?.extras || []).map((e, i) => (
            <div key={i} style={{ background:"#f5f5f5", borderRadius:10, padding:"10px 12px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:G.sub, marginBottom:2 }}>Withdrawal #{i+2}</div>
                <div style={{ fontWeight:600, color:G.text }}>{censorContact(e)}</div>
              </div>
              <button onClick={() => removeExtraAccount(e)} style={{ background:"none", border:"none", color:"#EF5350", fontSize:13, fontWeight:700, cursor:"pointer" }}>Remove</button>
            </div>
          ))}

          {(accounts?.extras || []).length < 2 && (
            <>
              <div style={{ fontSize:13, fontWeight:700, color:G.text, margin:"14px 0 10px" }}>Add Withdrawal Number</div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, color:G.sub, fontWeight:600, marginBottom:6 }}>New Number</div>
                <input
                  type="text" value={newExtra} onChange={e => setNewExtra(e.target.value)}
                  placeholder="+880 XXXXXXXXXX" maxLength={15}
                  style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:"1.5px solid #eee", fontSize:14, fontFamily:"'Poppins',sans-serif", background:"#fafafa", color:G.text, boxSizing:"border-box" }}
                />
              </div>
              <PwField label="Confirm with Password" val={extraPass} set={setExtraPass} show={showExtraPass} toggle={() => setShowExtraPass(v => !v)} />
              {extraMsg && <div style={{ fontSize:12, fontWeight:600, color: extraMsg.startsWith("✅") ? "#22C55E" : "#EF5350", marginBottom:10 }}>{extraMsg}</div>}
              <button onClick={addExtraAccount} style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:gradient, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                Add Number
              </button>
            </>
          )}
        </div>

        {/* Change Password */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px", boxShadow:"0 2px 8px #0001" }}>
          <div style={{ fontWeight:800, fontSize:15, color:G.text, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:20 }}>🔐</span> Change Password
          </div>
          <PwField label="Current Password" val={oldPass} set={setOldPass} show={showOld} toggle={() => setShowOld(v => !v)} />
          <PwField label="New Password" val={newPass} set={setNewPass} show={showNew} toggle={() => setShowNew(v => !v)} />
          <PwField label="Confirm New Password" val={confirmPass} set={setConfirmPass} show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
          {passMsg && <div style={{ fontSize:12, fontWeight:600, color: passMsg.startsWith("✅") ? "#22C55E" : "#EF5350", marginBottom:10 }}>{passMsg}</div>}
          <button onClick={savePass} style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:gradient, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
            Update Password
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ProfileScreen({ user, balance, accounts, setAccounts, onBack, onGoSettings, activeNav, setActiveNav, onGoWallet, onGoHome, myHistory, onLogout , onGoActivity, onGoPromo, initialSubScreen}) {
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [subScreen, setSubScreen] = useState(initialSubScreen || null);
  const username = user?.name || (user?.contact?.includes("@") ? user.contact.split("@")[0] : user?.contact) || "Member";
  const uidNum = useRef(Math.floor(100000 + Math.random() * 900000)).current;

  if (subScreen === "gamehistory") return <GameHistoryScreen onBack={()=>setSubScreen(null)} myHistory={myHistory||[]} />;
  if (subScreen === "transaction") return <TransactionScreen onBack={()=>setSubScreen(null)} balance={balance} />;
  if (subScreen === "notification") return <NotificationScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "gifts") return <GiftsScreen onBack={()=>setSubScreen(null)} onGoPromo={onGoPromo} />;
  if (subScreen === "stats") return <GameStatsScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "language") return <LanguageScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "feedback") return <FeedbackScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "announcement") return <AnnouncementScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "guide") return <BeginnerGuideScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "about") return <AboutUsScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "vip") return <VIPScreen onBack={()=>setSubScreen(null)} />;
  if (subScreen === "customerservice") return <SupportChat onClose={()=>setSubScreen(null)} user={user} />;
  if (subScreen === "security") return <SecurityScreen onBack={()=>setSubScreen(null)} user={user} accounts={accounts} setAccounts={setAccounts} />;

  const menuRow = (icon, label, right, onClick) => (
    <div key={label} onClick={onClick} style={{display:"flex",alignItems:"center",padding:"14px 16px",borderBottom:"1px solid #f5f5f5",cursor:"pointer",background:"#fff"}}>
      <span style={{fontSize:22,marginRight:14}}>{icon}</span>
      <span style={{flex:1,fontSize:14,fontWeight:600,color:G.text}}>{label}</span>
      <span style={{fontSize:13,color:G.sub,marginRight:4}}>{right||""}</span>
      <span style={{color:"#ccc",fontSize:16}}>›</span>
    </div>
  );

  return (
    <div style={{maxWidth:480,margin:"0 auto",background:"#F4F4F8",minHeight:"100vh",fontFamily:"'Poppins',sans-serif",paddingBottom:80}}>
      <style>{CSS}</style>
      <div style={{background:gradient,padding:"0 0 32px",position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",padding:"14px 20px"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer"}}>‹</button>
          <span style={{color:"#fff",fontWeight:700,fontSize:16,flex:1,textAlign:"center"}}>My Account</span>
          <button onClick={onGoSettings} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",borderRadius:8,padding:"5px 10px",fontFamily:"'Poppins',sans-serif"}}>⚙️ Settings</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16,padding:"0 20px"}}>
          <div style={{position:"relative"}}>
            <div onClick={()=>setShowAvatarPicker(true)} style={{width:72,height:72,borderRadius:"50%",background:"rgba(255,255,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,border:"3px solid rgba(255,255,255,.6)",cursor:"pointer"}}>{AVATARS[avatarIdx]}</div>
            <div onClick={()=>setShowAvatarPicker(true)} style={{position:"absolute",bottom:-1,right:-1,width:22,height:22,borderRadius:"50%",background:"#FFE082",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,fontWeight:700,color:"#333"}}>✎</div>
          </div>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:18,display:"flex",alignItems:"center",gap:8}}>
              {username.toUpperCase()}
              <span style={{background:"rgba(255,255,255,.2)",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:600}}>⭐ VIP0</span>
            </div>
            <div style={{color:"rgba(255,255,255,.7)",fontSize:12,marginTop:3,display:"flex",alignItems:"center",gap:6}}>
              <span style={{background:"rgba(0,0,0,.2)",borderRadius:8,padding:"2px 10px",fontSize:11}}>UID | {uidNum}</span>
            </div>
            <div style={{color:"rgba(255,255,255,.55)",fontSize:11,marginTop:4}}>{user?.method==="mobile"?"📱":"📧"} {user?.contact}</div>
          </div>
        </div>
      </div>

      {showAvatarPicker && (
        <div style={{position:"fixed",inset:0,background:"#0009",zIndex:400,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowAvatarPicker(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,margin:"0 auto",background:"#1A1A2E",borderRadius:"20px 20px 0 0",padding:20,animation:"slideUp .3s ease"}}>
            <div style={{color:"#fff",fontWeight:700,marginBottom:14,textAlign:"center"}}>Choose Avatar</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:10}}>
              {AVATARS.map((a,i)=>(
                <div key={i} onClick={()=>{setAvatarIdx(i);setShowAvatarPicker(false);}} style={{width:40,height:40,borderRadius:"50%",background:avatarIdx===i?"#EF5350":"#2A2A40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",border:avatarIdx===i?"2px solid #fff":"2px solid transparent"}}>{a}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{background:"#fff",margin:"0 14px",marginTop:-16,borderRadius:16,padding:"16px",boxShadow:"0 4px 20px #0001",position:"relative",zIndex:10}}>
        <div style={{color:G.sub,fontSize:12,marginBottom:4}}>Total balance</div>
        <div style={{fontWeight:900,fontSize:26,color:G.text}}>৳{balance.toFixed(2)}</div>
        <div style={{display:"flex",gap:0,marginTop:14,justifyContent:"space-around"}}>
          {[
            {icon:"💳",label:"Wallet",action:()=>onGoWallet()},
            {icon:"📥",label:"Deposit",action:()=>onGoWallet()},
            {icon:"📤",label:"Withdraw",action:()=>onGoWallet()},
            {icon:"👑",label:"VIP",action:()=>setSubScreen("vip")},
          ].map(a=>(
            <div key={a.label} onClick={a.action} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
              <div style={{width:44,height:44,borderRadius:12,background:"#FFF0F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{a.icon}</div>
              <span style={{fontSize:11,color:G.sub,fontWeight:600}}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          {[
            {icon:"📊",label:"Game History",sub:"My game records",bg:"#EEF4FF",action:()=>setSubScreen("gamehistory")},
            {icon:"💱",label:"Transaction",sub:"Transfer history",bg:"#EDFFF5",action:()=>setSubScreen("transaction")},
            {icon:"📥",label:"Deposit",sub:"Deposit history",bg:"#FFF0F0",action:()=>onGoWallet()},
            {icon:"📤",label:"Withdraw",sub:"Withdrawal history",bg:"#FFF8E1",action:()=>onGoWallet()},
          ].map(item=>(
            <div key={item.label} onClick={item.action} style={{background:"#fff",borderRadius:14,padding:"14px",cursor:"pointer",boxShadow:"0 2px 8px #0001",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:11,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{item.icon}</div>
              <div><div style={{fontWeight:700,fontSize:13}}>{item.label}</div><div style={{fontSize:11,color:G.sub}}>{item.sub}</div></div>
            </div>
          ))}
        </div>

        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 8px #0001",marginBottom:10,overflow:"hidden"}}>
          {menuRow("🔔","Notification","",()=>setSubScreen("notification"))}
          {menuRow("🎁","Gifts","",()=>setSubScreen("gifts"))}
          {menuRow("📊","Game Statistics","",()=>setSubScreen("stats"))}
          {menuRow("🌐","Language","English",()=>setSubScreen("language"))}
        </div>

        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 8px #0001",marginBottom:10,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px",fontWeight:700,fontSize:13,color:G.text,borderBottom:"1px solid #f5f5f5"}}>Service center</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"16px 10px",gap:16}}>
            {[
              {icon:"⚙️",label:"Settings",onClick:onGoSettings},
              {icon:"🔒",label:"Security",onClick:()=>setSubScreen("security")},
              {icon:"💬",label:"Feedback",onClick:()=>setSubScreen("feedback")},
              {icon:"📢",label:"Announcement",onClick:()=>setSubScreen("announcement")},
              {icon:"🎧",label:"Customer Service",onClick:()=>setSubScreen("customerservice")},
              {icon:"📖",label:"Beginner's Guide",onClick:()=>setSubScreen("guide")},
            ].map((item,i)=>(
              <div key={i} onClick={item.onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"#FFF0F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{item.icon}</div>
                <span style={{fontSize:11,color:G.sub,fontWeight:600,textAlign:"center"}}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onLogout} style={{width:"100%",padding:"14px 0",borderRadius:12,border:"1.5px solid #EF5350",background:"#fff",color:"#EF5350",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Poppins',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8}}>
          ⏻ Log Out
        </button>
      </div>

      <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} onGoWallet={onGoWallet} onGoProfile={()=>{}} onGoHome={onGoHome} onGoActivity={onGoActivity} onGoPromo={onGoPromo} />
    </div>
  );
}
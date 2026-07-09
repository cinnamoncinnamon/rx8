import React, { useState, useEffect } from "react";
import { CSS } from "./constants";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import HomeScreen from "./pages/HomeScreen";
import WinGoGame from "./games/lottery/WinGoGame";
import AviatorGame from "./games/aviator/AviatorGame";
import TradingGame from "./games/aviator/TradingGame";
import ProfileScreen from "./profile/ProfileScreen";
import SettingsScreen from "./pages/SettingsScreen";
import WalletScreen from "./wallet/WalletScreen";
import FloatingHelp from "./components/FloatingHelp";
import MotorideGame from "./games/motoride/MotorideGame";
import RoadRushGame from "./games/roadrush/RoadRushGame";
import TombRaidersSlot from "./games/slots/tombraiders/TombRaidersSlot";
import SuperElementSlot from "./games/slots/elementsfury/SuperElementSlot";
import GoldenRelicsSlot from "./games/slots/goldenrelics/GoldenRelicsSlot";
import ActivityScreen from "./pages/ActivityScreen";
import PromotionScreen from "./pages/PromotionScreen";
import K3DiceGame from "./games/K3DiceGame/K3DiceGame";
import { apiGetBalance, apiLogout, apiRefreshToken } from "./api";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [profileNav, setProfileNav] = useState("account");
  const [openSecurityOnProfile, setOpenSecurityOnProfile] = useState(false);

  const isPlaying = screen === "wingo" || screen === "aviator" || screen === "trading";
  const isLoggedIn = screen !== "login" && screen !== "register" && !!user;

  // Fetch real balance from server on load and every 15 seconds
  useEffect(() => {
    if (!user) return;
    const fetchBalance = () => {
      apiGetBalance()
        .then(b => setBalance(b))
        .catch(() => {}); // silently fail if token expired
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Try to restore session on app load using refresh token cookie
  useEffect(() => {
    apiRefreshToken()
      .then(() => {
        // token refreshed but we don't have user info yet
        // user will need to log in, this just keeps their session alive
      })
      .catch(() => {}); // no session, just show login
  }, []);

  async function handleLogout() {
    await apiLogout();
    setUser(null);
    setBalance(0);
    setScreen("login");
  }

  function handleLogin(u) {
    setUser(u);
    setScreen("home");
  }

  function handleRegister(u) {
    setUser(u);
    setScreen("home");
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", minHeight: "100vh", overflowY: "auto" }}>
      <style>{CSS}</style>
      {screen === "login" && <LoginScreen onLogin={handleLogin} onGotoRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onRegister={handleRegister} onBack={() => setScreen("login")} />}
      {screen === "home" && <HomeScreen user={user} balance={balance} onSelectGame={(g) => setScreen(g)} onGoProfile={() => { setProfileNav("account"); setOpenSecurityOnProfile(false); setScreen("profile"); }} onGoWallet={() => setScreen("wallet")} onGoActivity={() => setScreen("activity")} onGoPromo={() => setScreen("promotion")} />}
      {screen === "activity" && <ActivityScreen user={user} balance={balance} setBalance={setBalance} onGoHome={() => setScreen("home")} onGoWallet={() => setScreen("wallet")} onGoProfile={() => { setProfileNav("account"); setOpenSecurityOnProfile(false); setScreen("profile"); }} onGoPromo={() => setScreen("promotion")} />}
      {screen === "promotion" && <PromotionScreen user={user} balance={balance} setBalance={setBalance} onGoHome={() => setScreen("home")} onGoWallet={() => setScreen("wallet")} onGoProfile={() => { setProfileNav("account"); setOpenSecurityOnProfile(false); setScreen("profile"); }} onGoActivity={() => setScreen("activity")} />}
      {screen === "wingo" && <WinGoGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "aviator" && <AviatorGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "trading" && <TradingGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "motoride" && <MotorideGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "roadrush" && <RoadRushGame balance={balance} setBalance={setBalance} onExit={() => setScreen("home")} />}
      {screen === "k3" && <K3DiceGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "slots6" && <TombRaidersSlot balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "slots7" && <SuperElementSlot balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "slots8" && <GoldenRelicsSlot balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "profile" && <ProfileScreen user={user} balance={balance} onBack={() => setScreen("home")} onGoSettings={() => setScreen("settings")} activeNav={profileNav} setActiveNav={setProfileNav} onGoWallet={() => setScreen("wallet")} onGoHome={() => setScreen("home")} myHistory={[]} onLogout={handleLogout} onGoPromo={() => setScreen("promotion")} onGoActivity={() => setScreen("activity")} initialSubScreen={openSecurityOnProfile ? "security" : null} />}
      {screen === "settings" && <SettingsScreen user={user} onBack={() => setScreen("profile")} onGoSecurity={() => { setOpenSecurityOnProfile(true); setScreen("profile"); }} />}
      {screen === "wallet" && <WalletScreen user={user} balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      <FloatingHelp show={isLoggedIn && !isPlaying} user={user} />
    </div>
  );
}

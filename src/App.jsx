import React, { useState } from "react";
import { CSS } from "./constants";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import DepositSetup from "./pages/DepositSetup";
import HomeScreen from "./pages/HomeScreen";
import WinGoGame from "./games/lottery/WinGoGame";
import AviatorGame from "./games/aviator/AviatorGame";
import TradingGame from "./games/aviator/TradingGame";
import ProfileScreen from "./profile/ProfileScreen";
import SettingsScreen from "./pages/SettingsScreen";
import WalletScreen from "./wallet/WalletScreen";
import FloatingHelp from "./components/FloatingHelp";
import MotorideGame from "./games/motoride/MotorideGame";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [balance, setBalance] = useState(1000);
  const [profileNav, setProfileNav] = useState("account");
  const isPlaying = screen === "wingo" || screen === "aviator" || screen === "trading";
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{CSS}</style>
      {screen === "login" && <LoginScreen onLogin={(u) => { setUser(u); setScreen("register"); }} onGotoRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onRegister={(u) => { setUser(u); setScreen("deposit"); }} onBack={() => setScreen("login")} />}
      {screen === "deposit" && <DepositSetup contact={user?.contact} onDone={(acc) => { setAccounts(acc); setScreen("home"); }} />}
      {screen === "home" && <HomeScreen user={user} balance={balance} onSelectGame={(g) => setScreen(g)} onGoProfile={() => { setProfileNav("account"); setScreen("profile"); }} onGoWallet={() => setScreen("wallet")} />}
      {screen === "wingo" && <WinGoGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "aviator" && <AviatorGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
      {screen === "trading" && <TradingGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
        {screen === "motoride" && <MotorideGame balance={balance} setBalance={setBalance} onBack={() => setScreen("home")} />}
          
      {screen === "profile" && <ProfileScreen user={user} balance={balance} accounts={accounts} onBack={() => setScreen("home")} onGoSettings={() => setScreen("settings")} activeNav={profileNav} setActiveNav={setProfileNav} onGoWallet={() => setScreen("wallet")} onGoHome={() => setScreen("home")} myHistory={[]} onLogout={() => setScreen("login")} />}
      {screen === "settings" && <SettingsScreen user={user} onBack={() => setScreen("profile")} />}
      {screen === "wallet" && <WalletScreen balance={balance} setBalance={setBalance} accounts={accounts} onBack={() => setScreen("home")} />}
      <FloatingHelp show={!isPlaying} user={user} />
    </div>
  );
}
// activityStore.js — shared localStorage helpers for Activity features

const today = () => new Date().toDateString();
const thisWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toDateString();
};

// ── Bet tracking ──────────────────────────────────────────────────
export function recordBet(amount) {
  const key = "spinova_bets";
  const data = JSON.parse(localStorage.getItem(key) || "{}");
  const t = today();
  const w = thisWeek();
  data[t] = (data[t] || 0) + amount;
  data["week_" + w] = (data["week_" + w] || 0) + amount;
  data["total"] = (data["total"] || 0) + amount;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getBets() {
  const data = JSON.parse(localStorage.getItem("spinova_bets") || "{}");
  return {
    today: data[today()] || 0,
    week: data["week_" + thisWeek()] || 0,
    total: data["total"] || 0,
  };
}

// ── Deposit tracking ──────────────────────────────────────────────
export function recordDeposit(amount) {
  const key = "spinova_deposits";
  const data = JSON.parse(localStorage.getItem(key) || "{}");
  const t = today();
  data[t] = (data[t] || 0) + amount;
  data["total"] = (data["total"] || 0) + amount;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getDeposits() {
  const data = JSON.parse(localStorage.getItem("spinova_deposits") || "{}");
  return {
    today: data[today()] || 0,
    total: data["total"] || 0,
  };
}

export function hasDepositHistory() {
  const data = JSON.parse(localStorage.getItem("spinova_deposits") || "{}");
  return (data["total"] || 0) > 0;
}

export function hasTodayDeposit() {
  const data = JSON.parse(localStorage.getItem("spinova_deposits") || "{}");
  return (data[today()] || 0) > 0;
}

// ── Rebate ────────────────────────────────────────────────────────
export function getRebateData() {
  const data = JSON.parse(localStorage.getItem("spinova_rebate") || "{}");
  return {
    todayClaimed: data["claimed_" + today()] || false,
    todayBets: getBets().today,
    totalClaimed: data["total"] || 0,
  };
}

export function claimRebate() {
  const bets = getBets().today;
  const amount = parseFloat((bets * 0.003).toFixed(2));
  const data = JSON.parse(localStorage.getItem("spinova_rebate") || "{}");
  data["claimed_" + today()] = true;
  data["total"] = (data["total"] || 0) + amount;
  localStorage.setItem("spinova_rebate", JSON.stringify(data));
  return amount;
}

// ── Gift codes ────────────────────────────────────────────────────
const GIFT_CODES = {
  SPINOVA10: 10,
  WELCOME50: 50,
  LUCKY20: 20,
  BONUS100: 100,
};

export function redeemGiftCode(code) {
  const used = JSON.parse(localStorage.getItem("spinova_codes") || "[]");
  const upper = code.toUpperCase().trim();
  if (used.includes(upper)) return { success: false, msg: "Code already used!" };
  const amount = GIFT_CODES[upper];
  if (!amount) return { success: false, msg: "Invalid code!" };
  used.push(upper);
  localStorage.setItem("spinova_codes", JSON.stringify(used));
  return { success: true, amount };
}

// ── Daily Check-in ────────────────────────────────────────────────
const CHECKIN_REWARDS = [
  { day: 1, deposit: 200, bonus: 4 },
  { day: 2, deposit: 1000, bonus: 20 },
  { day: 3, deposit: 3000, bonus: 65 },
  { day: 4, deposit: 8000, bonus: 180 },
  { day: 5, deposit: 20000, bonus: 450 },
  { day: 6, deposit: 80000, bonus: 2200 },
  { day: 7, deposit: 200000, bonus: 6000 },
];

export function getCheckinData() {
  const data = JSON.parse(localStorage.getItem("spinova_checkin") || "{}");
  return {
    streak: data.streak || 0,
    lastCheckin: data.lastCheckin || null,
    claimedToday: data.lastCheckin === today(),
    rewards: CHECKIN_REWARDS,
  };
}

export function claimCheckin(totalDeposited) {
  const data = JSON.parse(localStorage.getItem("spinova_checkin") || "{}");
  if (data.lastCheckin === today()) return { success: false, msg: "Already checked in today!" };
  if (!hasDepositHistory()) return { success: false, msg: "You need a deposit history to check in!" };

  const streak = (data.streak || 0) % 7;
  const reward = CHECKIN_REWARDS[streak];
  if (totalDeposited < reward.deposit) {
    return { success: false, msg: `Need ৳${reward.deposit.toLocaleString()} total deposits for Day ${streak + 1}!` };
  }

  data.streak = streak + 1;
  data.lastCheckin = today();
  localStorage.setItem("spinova_checkin", JSON.stringify(data));
  return { success: true, amount: reward.bonus };
}

// ── Lucky Spin ────────────────────────────────────────────────────
export function getLuckySpinData() {
  const data = JSON.parse(localStorage.getItem("spinova_spin") || "{}");
  return { spunToday: data.lastSpin === today() };
}

export function claimLuckySpin() {
  if (!hasTodayDeposit()) return { success: false, msg: "You need to deposit first today!" };
  const data = JSON.parse(localStorage.getItem("spinova_spin") || "{}");
  if (data.lastSpin === today()) return { success: false, msg: "Already spun today!" };
  const amount = Math.random() < 0.5 ? 5 : 10;
  data.lastSpin = today();
  localStorage.setItem("spinova_spin", JSON.stringify(data));
  return { success: true, amount };
}

// ── Deposit Bonus ─────────────────────────────────────────────────
export function getDepositBonusData() {
  const data = JSON.parse(localStorage.getItem("spinova_depbonus") || "{}");
  return {
    claimedToday: data.lastClaim === today(),
    todayDeposit: getDeposits().today,
  };
}

export function claimDepositBonus() {
  const dep = getDeposits().today;
  if (dep <= 0) return { success: false, msg: "No deposit made today!" };
  const data = JSON.parse(localStorage.getItem("spinova_depbonus") || "{}");
  if (data.lastClaim === today()) return { success: false, msg: "Already claimed today's deposit bonus!" };
  const amount = parseFloat((dep * 0.05).toFixed(2));
  const capped = Math.min(amount, 10);
  data.lastClaim = today();
  localStorage.setItem("spinova_depbonus", JSON.stringify(data));
  return { success: true, amount: capped };
}

// ── Leaderboard ───────────────────────────────────────────────────
export function updateLeaderboard(username, betAmount) {
  const key = "spinova_leaderboard_" + thisWeek();
  const board = JSON.parse(localStorage.getItem(key) || "{}");
  board[username] = (board[username] || 0) + betAmount;
  localStorage.setItem(key, JSON.stringify(board));
}

export function getLeaderboard() {
  const key = "spinova_leaderboard_" + thisWeek();
  const board = JSON.parse(localStorage.getItem(key) || "{}");
  return Object.entries(board)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, amount], i) => ({ rank: i + 1, name, amount }));
}

// ── Bonus summary ─────────────────────────────────────────────────
export function getBonusSummary() {
  const rebate = JSON.parse(localStorage.getItem("spinova_rebate") || "{}");
  const spin = JSON.parse(localStorage.getItem("spinova_spin") || "{}");
  const dep = JSON.parse(localStorage.getItem("spinova_depbonus") || "{}");
  const codes = JSON.parse(localStorage.getItem("spinova_codes") || "[]");

  // rough today total from localStorage keys
  const todayTotal = 0; // would need per-event tracking for exactness
  const total = (rebate["total"] || 0);
  return { todayBonus: todayTotal, totalBonus: total };
}
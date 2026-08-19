// Central API service - all backend calls go through here
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
console.log("ENV DEBUG:", import.meta.env);

// Store JWT in memory (not localStorage - safer against XSS)
let accessToken = null;

export function setToken(t) { accessToken = t; }
export function getToken() { return accessToken; }
export function clearToken() { accessToken = null; }

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // sends the httpOnly refresh cookie automatically
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiLogin(mobile, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobile, password }),
  });
  setToken(data.accessToken);
  return data.user;
}

export async function apiRegister({ mobile, password, confirmPassword, name }) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ mobile, password, confirmPassword, name }),
  });
  setToken(data.accessToken);
  return { user: data.user, recoveryCode: data.recoveryCode };
}

export async function apiForgotPassword({ mobile, recoveryCode, newPassword, confirmNewPassword }) {
  const data = await request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ mobile, recoveryCode, newPassword, confirmNewPassword }),
  });
  return data.recoveryCode; // new one-time code, shown once
}

export async function apiLogout() {
  await request("/api/auth/logout", { method: "POST" }).catch(() => {});
  clearToken();
}

export async function apiRefreshToken() {
  const data = await request("/api/auth/refresh", { method: "POST" });
  setToken(data.accessToken);
  return data.accessToken;
}

// ── Wallet ────────────────────────────────────────────────────────────────────
export async function apiGetBalance() {
  const data = await request("/api/wallet/balance");
  return data.balance;
}

export async function apiGetTransactions() {
  const data = await request("/api/wallet/transactions");
  return data.transactions;
}

// ── Deposit ───────────────────────────────────────────────────────────────────
export async function apiGetDepositMethods() {
  const data = await request("/api/deposit/methods");
  return data.methods;
}

export async function apiSubmitDepositRequest({ deposit_method_id, amount, transaction_id }) {
  return request("/api/deposit/request", {
    method: "POST",
    body: JSON.stringify({ deposit_method_id, amount, transaction_id }),
  });
}

export async function apiGetDepositRequests() {
  const data = await request("/api/deposit/requests");
  return data.requests;
}

// ── Withdrawal ────────────────────────────────────────────────────────────────
export async function apiSubmitWithdrawalRequest({ method, account_details, amount }) {
  return request("/api/withdrawal/request", {
    method: "POST",
    body: JSON.stringify({ method, account_details, amount }),
  });
}

export async function apiGetWithdrawalRequests() {
  const data = await request("/api/withdrawal/requests");
  return data.requests;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function apiGetNotifications() {
  const data = await request("/api/notifications");
  return data.notifications;
}

export async function apiGetUnreadNotificationCount() {
  const data = await request("/api/notifications/unread-count");
  return data.count;
}

export async function apiMarkNotificationRead(id) {
  return request(`/api/notifications/${id}/read`, { method: "POST" });
}

export async function apiMarkAllNotificationsRead() {
  return request("/api/notifications/read-all", { method: "POST" });
}

// ── Promo Codes ─────────────────────────────────────────────────────────────
export async function apiRedeemPromoCode(code) {
  return request("/api/promo/redeem", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// ── Plinko ──────────────────────────────────────────────────────────────────
export async function apiPlinkoPlay({ betAmount, lines = 16 }) {
  return request("/api/plinko/play", {
    method: "POST",
    body: JSON.stringify({ betAmount, lines }),
  });
}

export async function apiPlinkoInfo() {
  return request("/api/plinko/info");
}

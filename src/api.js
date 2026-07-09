// Central API service - all backend calls go through here
const BASE = "http://localhost:4000";

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
  return data.user;
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

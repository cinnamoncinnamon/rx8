/**
 * SPINOVA Rate Limiter (localStorage-based, frontend layer)
 * Prevents brute-force on login/register and spam on deposit/withdraw.
 * Replace with backend enforcement once API is added.
 */

const LIMITS = {
  login:    { max: 5,  windowMs: 5 * 60 * 1000,  label: "Login"    }, // 5 tries / 5 min
  register: { max: 3,  windowMs: 10 * 60 * 1000, label: "Register" }, // 3 tries / 10 min
  deposit:  { max: 5,  windowMs: 60 * 60 * 1000, label: "Deposit"  }, // 5 tries / 1 hr
  withdraw: { max: 3,  windowMs: 60 * 60 * 1000, label: "Withdraw" }, // 3 tries / 1 hr
};

function storageKey(action) {
  return `spinova_rl_${action}`;
}

function getRecord(action) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(action))) || { count: 0, firstAt: null };
  } catch {
    return { count: 0, firstAt: null };
  }
}

function setRecord(action, record) {
  localStorage.setItem(storageKey(action), JSON.stringify(record));
}

/**
 * Call before allowing an action.
 * Returns { allowed: true } or { allowed: false, waitMs, message }
 */
export function checkRateLimit(action) {
  const limit = LIMITS[action];
  if (!limit) return { allowed: true };

  const now = Date.now();
  let rec = getRecord(action);

  // Reset window if expired
  if (rec.firstAt && now - rec.firstAt > limit.windowMs) {
    rec = { count: 0, firstAt: null };
  }

  if (rec.count >= limit.max) {
    const waitMs = limit.windowMs - (now - rec.firstAt);
    const waitMin = Math.ceil(waitMs / 60000);
    return {
      allowed: false,
      waitMs,
      message: `Too many ${limit.label.toLowerCase()} attempts. Try again in ${waitMin} min.`,
    };
  }

  return { allowed: true };
}

/**
 * Call after a failed attempt (wrong password, invalid input, etc.)
 */
export function recordFailedAttempt(action) {
  const now = Date.now();
  let rec = getRecord(action);
  const limit = LIMITS[action];
  if (!limit) return;

  // Reset window if expired
  if (rec.firstAt && now - rec.firstAt > limit.windowMs) {
    rec = { count: 0, firstAt: null };
  }

  rec.count += 1;
  rec.firstAt = rec.firstAt || now;
  setRecord(action, rec);
}

/**
 * Call after a successful action to clear the window.
 */
export function clearRateLimit(action) {
  localStorage.removeItem(storageKey(action));
}

/**
 * Returns remaining attempts before lockout (for UX display).
 */
export function remainingAttempts(action) {
  const limit = LIMITS[action];
  if (!limit) return Infinity;
  const now = Date.now();
  let rec = getRecord(action);
  if (rec.firstAt && now - rec.firstAt > limit.windowMs) return limit.max;
  return Math.max(0, limit.max - rec.count);
}

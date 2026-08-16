/* ─────────────────────────────────────────────────────────────────────────────
   SPINOVA Input Sanitizer
   Call sanitize(value) to clean, then validate*(value) to check.
───────────────────────────────────────────────────────────────────────────── */

// ── Strip dangerous characters ────────────────────────────────────────────────
export function sanitize(val) {
  if (typeof val !== "string") return "";
  return val
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/['"`;\\]/g, "")          // strip SQL/JS injection chars
    .replace(/--/g, "")                // strip SQL comment
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b/gi, "") // SQL keywords
    .trim();
}
// ── Mobile (Bangladesh) ───────────────────────────────────────────────────────
export function validateMobile(val) {
  // keep digits only: ignores spaces, dashes, etc.
  let digits = String(val || "").replace(/\D/g, "");

  // +8801XXXXXXXXX (13 digits) → 01XXXXXXXXX
  if (digits.startsWith("880") && digits.length === 13) {
    digits = digits.slice(2); // 88019… → 019…
  }

  if (/^01[3-9]\d{8}$/.test(digits)) {
    return { ok: true, value: "+880" + digits };
  }

  return {
    ok: false,
    message: "Enter a valid BD mobile number (e.g. 01XXXXXXXXX)",
  };
}

// ── Password ──────────────────────────────────────────────────────────────────
export function validatePassword(val) {
  if (val.length < 6)  return { ok: false, message: "Password must be at least 6 characters." };
  if (val.length > 64) return { ok: false, message: "Password too long." };
  if (val !== val.trim()) return { ok: false, message: "Password cannot start or end with spaces." };
  return { ok: true };
}

// ── Combined login validator ──────────────────────────────────────────────────
export function validateLoginInput(method, input, pass) {
  const cleanInput = sanitize(input);
  const cleanPass  = pass; // don't sanitize password — user may use special chars intentionally

  if (!cleanInput) return { ok: false, message: "Please fill all fields." };
  if (!cleanPass)  return { ok: false, message: "Please fill all fields." };

  const contactCheck = method === "mobile"
    ? validateMobile(cleanInput)
    : validateEmail(cleanInput);
  if (!contactCheck.ok) return contactCheck;

  const passCheck = validatePassword(cleanPass);
  if (!passCheck.ok) return passCheck;

  return { ok: true, contact: contactCheck.value };
}

// ── Combined register validator ───────────────────────────────────────────────
export function validateRegisterInput(method, input, pass, confirm) {
  const cleanInput = sanitize(input);

  if (!cleanInput || !pass || !confirm) return { ok: false, message: "Fill all fields." };

  const contactCheck = method === "mobile"
    ? validateMobile(cleanInput)
    : validateEmail(cleanInput);
  if (!contactCheck.ok) return contactCheck;

  const passCheck = validatePassword(pass);
  if (!passCheck.ok) return passCheck;

  if (pass !== confirm) return { ok: false, message: "Passwords don't match." };

  return { ok: true, contact: contactCheck.value };
}

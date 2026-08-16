/* ─────────────────────────────────────────────────────────────────────────────
   SPINOVA Input Sanitizer (frontend)
───────────────────────────────────────────────────────────────────────────── */

export function sanitize(val) {
  if (typeof val !== "string") return "";
  return val
    .replace(/<[^>]*>/g, "")
    .replace(/['"`;\\]/g, "")
    .replace(/--/g, "")
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b/gi, "")
    .trim();
}

// Always returns 01XXXXXXXXX (no +880 prefix — matches backend)
export function validateMobile(val) {
  let digits = String(val || "").replace(/\D/g, "");

  // 8801XXXXXXXXX → 01XXXXXXXXX
  if (digits.startsWith("880") && digits.length === 13) {
    digits = digits.slice(2);
  }

  // broken +8800… form → fix
  if (digits.startsWith("8800") && digits.length === 14) {
    digits = "0" + digits.slice(4);
  }

  if (/^01[3-9]\d{8}$/.test(digits)) {
    return { ok: true, value: digits };
  }

  return {
    ok: false,
    message: "Enter a valid BD mobile number (e.g. 01XXXXXXXXX)",
  };
}

export function validateEmail(val) {
  if (val.length > 100) return { ok: false, message: "Email too long." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  return { ok: true, value: val.toLowerCase() };
}

export function validatePassword(val) {
  if (val.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
  if (val.length > 64) return { ok: false, message: "Password too long." };
  if (val !== val.trim()) {
    return { ok: false, message: "Password cannot start or end with spaces." };
  }
  return { ok: true };
}

export function validateLoginInput(method, input, pass) {
  const cleanInput = sanitize(input);
  const cleanPass = pass;

  if (!cleanInput) return { ok: false, message: "Please fill all fields." };
  if (!cleanPass) return { ok: false, message: "Please fill all fields." };

  const contactCheck =
    method === "mobile" ? validateMobile(cleanInput) : validateEmail(cleanInput);
  if (!contactCheck.ok) return contactCheck;

  const passCheck = validatePassword(cleanPass);
  if (!passCheck.ok) return passCheck;

  return { ok: true, contact: contactCheck.value };
}

export function validateRegisterInput(method, input, pass, confirm) {
  const cleanInput = sanitize(input);

  if (!cleanInput || !pass || !confirm) {
    return { ok: false, message: "Fill all fields." };
  }

  const contactCheck =
    method === "mobile" ? validateMobile(cleanInput) : validateEmail(cleanInput);
  if (!contactCheck.ok) return contactCheck;

  const passCheck = validatePassword(pass);
  if (!passCheck.ok) return passCheck;

  if (pass !== confirm) return { ok: false, message: "Passwords don't match." };

  return { ok: true, contact: contactCheck.value };
}
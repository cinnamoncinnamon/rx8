/* ─────────────────────────────────────────────────────────────────────────────
   SPINOVA DevTools Shield
   Detects DevTools, disables right-click, blocks keyboard shortcuts.
   Call initDevtoolsBlock(onDetect) once in main.jsx.
   onDetect: optional callback when DevTools is opened (e.g. blur the UI).
───────────────────────────────────────────────────────────────────────────── */

// ── Detection ─────────────────────────────────────────────────────────────────
let _detected = false;
let _cb = null;

function _trigger() {
  if (_detected) return;
  _detected = true;
  if (_cb) _cb();
}

// Method 1: window size gap (DevTools docked = shrinks inner dimensions)
function _checkSize() {
  const threshold = 160;
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    _trigger();
  }
}

// Method 2: console timing trick (DevTools slows toString evaluation)
function _checkConsole() {
  const _t = new Date();
  // This string evaluation is near-instant normally, slow with DevTools open
  // We use a custom toString getter as the probe
  const _probe = /./;
  _probe.toString = () => { _trigger(); return ""; };
  console.log("%c", _probe); // DevTools evaluates this; normal console ignores
  // Suppress the output visually
  console.clear && console.clear();
}

// Method 3: debugger timing
function _checkDebugger() {
  const _start = performance.now();
  // eslint-disable-next-line no-debugger
  debugger;
  if (performance.now() - _start > 100) _trigger();
}

// ── Keyboard blocking ─────────────────────────────────────────────────────────
const _BLOCKED_KEYS = new Set(["F12", "F11"]);
const _BLOCKED_COMBOS = [
  { ctrl: true,  shift: true, key: "I" },
  { ctrl: true,  shift: true, key: "J" },
  { ctrl: true,  shift: true, key: "C" },
  { ctrl: true,  shift: true, key: "K" },
  { ctrl: true,  shift: false, key: "U" },
  { ctrl: true,  shift: false, key: "S" }, // Ctrl+S (save page)
];

function _onKeyDown(e) {
  if (_BLOCKED_KEYS.has(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  for (const combo of _BLOCKED_COMBOS) {
    if (
      e.ctrlKey === (combo.ctrl ?? false) &&
      e.shiftKey === (combo.shift ?? false) &&
      e.key.toUpperCase() === combo.key.toUpperCase()
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
}

// ── Right-click blocking ──────────────────────────────────────────────────────
function _onContextMenu(e) {
  e.preventDefault();
  return false;
}

// ── Text selection blocking ───────────────────────────────────────────────────
function _injectSelectionStyle() {
  const _s = document.createElement("style");
  _s.id = "spinova-noselect";
  _s.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(_s);
}

// ── Console warning ───────────────────────────────────────────────────────────
function _consoleWarning() {
  const _s1 = "color:#EF5350;font-size:28px;font-weight:900;";
  const _s2 = "color:#fff;font-size:14px;";
  console.log("%c⚠ SPINOVA", _s1);
  console.log("%cThis is a browser feature intended for developers. If someone told you to paste something here, it is a scam.", _s2);
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initDevtoolsBlock(onDetect) {
  _cb = onDetect || null;

  // Keyboard shortcuts
  window.addEventListener("keydown", _onKeyDown, true);

  // Right-click
  window.addEventListener("contextmenu", _onContextMenu, true);

  // Text selection
  _injectSelectionStyle();

  // Console warning
  _consoleWarning();

  // Size check — runs on resize and every 2s
  window.addEventListener("resize", _checkSize);
  _checkSize();
  setInterval(_checkSize, 2000);

  // Console probe — every 3s
  setInterval(_checkConsole, 3000);

  // Cleanup on unmount (for React StrictMode double-invoke safety)
  return () => {
    window.removeEventListener("keydown", _onKeyDown, true);
    window.removeEventListener("contextmenu", _onContextMenu, true);
    window.removeEventListener("resize", _checkSize);
    document.getElementById("spinova-noselect")?.remove();
  };
}

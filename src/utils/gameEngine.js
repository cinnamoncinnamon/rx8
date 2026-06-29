
/* ─────────────────────────────────────────────────────────────────────────────
   SPINOVA Game Engine  |  All outcome logic lives here.
   Variable names are intentionally opaque. Do NOT rename without updating
   every consumer.  When backend is ready, replace each export with an
   async API call — callers stay unchanged.
───────────────────────────────────────────────────────────────────────────── */

// ── internal entropy ─────────────────────────────────────────────────────────
const _xv = (n) => {
  let x = n ^ (n >>> 16); x = Math.imul(x, 0x45d9f3b);
  x = x ^ (x >>> 16); x = Math.imul(x, 0x45d9f3b);
  return (x ^ (x >>> 16)) >>> 0;
};
const _rv = () => {
  const t = _xv(Date.now() & 0xffffffff);
  const p = _xv(performance.now() * 1000 & 0xffffffff);
  return ((t ^ p) >>> 0) / 0x100000000;
};
const _ri = (n) => Math.floor(_rv() * n);          // random int [0, n)
const _rd6 = () => 1 + _ri(6);                     // single die [1-6]

// ── K3 Dice ──────────────────────────────────────────────────────────────────
const _K3P = {3:207.36,4:69.12,5:34.56,6:20.74,7:13.83,8:9.88,9:8.3,10:7.68,
               11:7.68,12:8.3,13:9.88,14:13.83,15:20.74,16:34.56,17:69.12,18:207.36};
const _K2S = [{pair:[1,1]},{pair:[2,2]},{pair:[3,3]},{pair:[4,4]},{pair:[5,5]},{pair:[6,6]}];

const _k3Roll = () => [_rd6(), _rd6(), _rd6()];
const _k3Cls  = (d) => { const s=d[0]+d[1]+d[2]; return {sum:s,big:s>=11?"Big":"Small",oddEven:s%2===0?"Even":"Odd"}; };

export function k3SmartRoll(betMap) {
  let best = null, bestW = Infinity;
  for (let _i = 0; _i < 60; _i++) {
    const d = _k3Roll();
    const { sum, big, oddEven } = _k3Cls(d);
    const _s = [...d].sort((a,b)=>a-b);
    let w = 0;
    w += betMap[`total-${sum}`]  || 0;
    w += betMap[`big-big`]       || 0;
    w += betMap[`small-small`]   || 0;
    w += betMap[`even-even`]     || 0;
    w += betMap[`odd-odd`]       || 0;
    if (d[0]===d[1] && d[1]===d[2]) {
      w += betMap[`3same-"any3"`] || 0;
      w += betMap[`3same-${d[0]}`] || 0;
    }
    _K2S.forEach(item => {
      if (d.filter(x=>x===item.pair[0]).length >= 2)
        w += betMap[`2same-${JSON.stringify(item.pair)}`] || 0;
    });
    w += betMap[`diff-"${_s.join(",")}"`] || 0;
    if (w < bestW) { bestW = w; best = d; }
  }
  return best || _k3Roll();
}

export function k3Evaluate(bet, dice) {
  if (!bet) return { won: false, payout: 0 };
  const { type, value, amount } = bet;
  const { sum, big, oddEven } = _k3Cls(dice);
  const _s = [...dice].sort((a,b)=>a-b);
  let won = false, mult = 0;
  if (type==="big"    && big==="Big")       { won=true; mult=2; }
  if (type==="small"  && big==="Small")     { won=true; mult=2; }
  if (type==="even"   && oddEven==="Even")  { won=true; mult=2; }
  if (type==="odd"    && oddEven==="Odd")   { won=true; mult=2; }
  if (type==="total"  && value===sum)       { won=true; mult=_K3P[value]; }
  if (type==="2same") {
    const [a,b] = value;
    const ca = dice.filter(x=>x===a).length, cb = dice.filter(x=>x===b).length;
    if (a===b && ca>=2)          { won=true; mult=17.64; }
    else if (a!==b && ca>=1 && cb>=1) { won=true; mult=17.64; }
  }
  if (type==="3same") {
    if (value==="any3" && dice[0]===dice[1] && dice[1]===dice[2]) { won=true; mult=29.4; }
    else if (typeof value==="number" && dice.every(d=>d===value)) { won=true; mult=176.4; }
  }
  if (type==="diff") {
    const nums = value.split(",").map(Number).sort((a,b)=>a-b);
    if (JSON.stringify(_s)===JSON.stringify(nums)) { won=true; mult=17.64; }
  }
  return { won, payout: won ? parseFloat((amount*mult).toFixed(2)) : 0 };
}

// ── WinGo ─────────────────────────────────────────────────────────────────────
export function wingoRoll() {
  return _ri(10);   // 0-9
}

// ── Crash games (Aviator + MotoRide) ─────────────────────────────────────────
export function aviatorCrashPoint() {
  const _r = _rv();
  if (_r < 0.03) return 1.0;
  const _e = Math.pow(2, 32);
  const _h = Math.floor(_rv() * _e);
  const _c = Math.max(1, Math.floor((100 * _e - _h) / (_e - _h)) / 100);
  return Math.min(_c, 200);
}

export function motorideCrashPoint() {
  const _r = _rv();
  if (_r < 0.01) return 1.00 + _rv() * 0.02;
  if (_r < 0.40) return 1.0  + Math.pow(_rv(), 0.6) * 1.5;
  if (_r < 0.70) return 2.5  + Math.pow(_rv(), 0.7) * 5;
  if (_r < 0.88) return 7    + _rv() * 20;
  if (_r < 0.96) return 27   + _rv() * 73;
  return 100 + _rv() * 400;
}

// ── Slots (weighted symbol picker) ────────────────────────────────────────────
// Pass in your WEIGHTED array (flatMap of symbol ids by weight)
export function slotPickSymbol(weightedArr) {
  return weightedArr[_ri(weightedArr.length)];
}

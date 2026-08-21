/** Lightweight WebAudio synth — no wav files required. */
let ctx = null;
let master = null;
let muted = false;
let lastPeg = 0;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.45;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ac();
}

export function setMuted(v) {
  muted = v;
  if (master) master.gain.value = v ? 0 : 0.45;
}

export function isMuted() {
  return muted;
}

function blip(freq, duration, type, gain) {
  const c = ac();
  if (!c || !master || muted) return;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  env.gain.setValueAtTime(0.0001, c.currentTime);
  env.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(env).connect(master);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

export function playPeg() {
  const now = performance.now();
  if (now - lastPeg < 28) return;
  lastPeg = now;
  blip(520 + Math.random() * 400, 0.07, "triangle", 0.11);
}

export function playDrop() {
  blip(180, 0.14, "sine", 0.15);
}

export function playLand(multiplier) {
  if (multiplier < 1) {
    blip(150, 0.2, "sawtooth", 0.09);
    return;
  }
  const steps = Math.min(4, 1 + Math.floor(Math.log2(multiplier + 1)));
  for (let i = 0; i < steps; i++) {
    window.setTimeout(
      () => blip(440 * Math.pow(1.26, i), 0.26, "sine", 0.14),
      i * 55
    );
  }
}

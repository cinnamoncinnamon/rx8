class SlotSounds {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.reelLoop = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.5;
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
    } catch (e) {
      this.ctx = null;
    }
  }

  setMuted(m) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.02);
    }
  }

  ensure() {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.master) return null;
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return { ctx: this.ctx, master: this.master };
  }

  blip({ freq, type = "sine", dur = 0.12, vol = 0.25, sweepTo, delay = 0 }) {
    const e = this.ensure(); if (!e) return;
    const { ctx, master } = e;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  noiseBurst(dur, vol, filterFreq = 2000) {
    const e = this.ensure(); if (!e) return;
    const { ctx, master } = e;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass"; filt.frequency.value = filterFreq;
    const gain = ctx.createGain(); gain.gain.value = vol;
    src.connect(filt); filt.connect(gain); gain.connect(master);
    src.start(); src.stop(ctx.currentTime + dur);
  }

  click() { this.blip({ freq: 600, type: "square", dur: 0.05, vol: 0.12 }); }
  betChange() { this.blip({ freq: 880, type: "triangle", dur: 0.06, vol: 0.15 }); }
  toggle() { this.blip({ freq: 520, type: "triangle", dur: 0.08, vol: 0.16, sweepTo: 720 }); }

  spinStart() {
    this.blip({ freq: 220, type: "sawtooth", dur: 0.18, vol: 0.2, sweepTo: 520 });
    this.startReelLoop();
  }

  startReelLoop() {
    this.stopReelLoop();
    const e = this.ensure(); if (!e) return;
    const { ctx, master } = e;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth"; osc.frequency.value = 90;
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.06, ctx.currentTime, 0.05);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 14; lfoGain.gain.value = 24;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    osc.connect(gain); gain.connect(master);
    osc.start(); lfo.start();
    osc._lfo = lfo;
    this.reelLoop = { osc, gain };
  }

  stopReelLoop() {
    if (!this.reelLoop || !this.ctx) return;
    const { osc, gain } = this.reelLoop;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setTargetAtTime(0.0001, t, 0.04);
    try { osc.stop(t + 0.2); if (osc._lfo) osc._lfo.stop(t + 0.2); } catch (e) {}
    this.reelLoop = null;
  }

  reelStop(index = 0) {
    const base = 320 - index * 30;
    this.blip({ freq: base, type: "square", dur: 0.07, vol: 0.18, sweepTo: base * 0.55 });
    this.noiseBurst(0.06, 0.08, 1500);
  }

  allReelsStopped() { this.stopReelLoop(); }

  tease() {
    const e = this.ensure(); if (!e) return;
    const { ctx, master } = e;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(70, t0);
    osc.frequency.linearRampToValueAtTime(110, t0 + 0.55);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
    osc.connect(gain); gain.connect(master);
    osc.start(t0); osc.stop(t0 + 0.65);
  }

  win(tier = "small") {
    const notes = tier === "epic" ? [523, 659, 784, 988, 1175]
      : tier === "mega" ? [523, 659, 784, 1047]
      : tier === "big" ? [523, 659, 880]
      : [659, 880];
    notes.forEach((f, i) => this.blip({ freq: f, type: "triangle", dur: 0.14, vol: 0.22, delay: i * 0.08 }));
  }

  jackpot(tier = "grand") {
    const seq = [523, 659, 784, 1047, 1319, 1568];
    seq.forEach((f, i) => this.blip({ freq: f, type: "triangle", dur: 0.22, vol: 0.28, delay: i * 0.09 }));
    for (let i = 0; i < 12; i++) {
      this.blip({ freq: 1800 + Math.random() * 1400, type: "sine", dur: 0.18, vol: 0.08, delay: 0.1 + i * 0.07 });
    }
    if (tier === "grand" || tier === "major") this.noiseBurst(0.8, 0.1, 4000);
  }

  freeSpins() {
    const seq = [392, 523, 659, 784, 1047];
    seq.forEach((f, i) => this.blip({ freq: f, type: "sine", dur: 0.2, vol: 0.24, delay: i * 0.1 }));
    this.noiseBurst(0.5, 0.06, 3000);
  }

  coin() {
    this.blip({ freq: 1320, type: "triangle", dur: 0.06, vol: 0.18 });
    this.blip({ freq: 1760, type: "triangle", dur: 0.08, vol: 0.14, delay: 0.04 });
  }

  gamblePick() { this.blip({ freq: 440, type: "square", dur: 0.08, vol: 0.18, sweepTo: 660 }); }
  gambleWin() { [523, 784, 1047].forEach((f, i) => this.blip({ freq: f, type: "triangle", dur: 0.2, vol: 0.26, delay: i * 0.09 })); }
  gambleLose() { this.blip({ freq: 320, type: "sawtooth", dur: 0.35, vol: 0.24, sweepTo: 90 }); }
  error() { this.blip({ freq: 180, type: "square", dur: 0.18, vol: 0.18, sweepTo: 120 }); }
}

export const sfx = new SlotSounds();

if (typeof window !== "undefined") {
  const wake = () => { sfx.init(); };
  window.addEventListener("pointerdown", wake, { once: true });
  window.addEventListener("keydown", wake, { once: true });
  window.addEventListener("touchstart", wake, { once: true });
}
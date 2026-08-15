// ── App-wide sound manager ───────────────────────────────────────────────
// Same synthesized-tone approach MotoRide already used (oscillators/noise
// via Web Audio API), pulled out into one shared module so every screen and
// game can use the same engine instead of re-implementing it per file.
//
// Usage:
//   import { sound } from "../../sound/soundManager";
//   sound.play("click");        // button/tab taps
//   sound.play("bet");          // placing a bet
//   sound.play("win");          // win / cashout
//   sound.play("lose");         // loss / crash
//   sound.play("notify");       // notifications, deposits approved, etc.
//   sound.unlock();             // call on first user gesture (see BottomNav)
//   sound.toggleMute();  sound.isMuted();  sound.setVolume(0.6);

const STORAGE_KEY = "rx8_sound_prefs";

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { muted: false, volume: 0.6 };
    const parsed = JSON.parse(raw);
    return {
      muted: !!parsed.muted,
      volume: typeof parsed.volume === "number" ? Math.min(1, Math.max(0, parsed.volume)) : 0.6,
    };
  } catch {
    return { muted: false, volume: 0.6 };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable (private mode etc.) — fail silently, sound still works this session
  }
}

class SoundManager {
  constructor() {
    const prefs = loadPrefs();
    this.muted = prefs.muted;
    this.volume = prefs.volume;
    this._ctx = null;
  }

  // Browsers block audio until a real user gesture happens. Call this from
  // the first tap/click in the app (BottomNav does this) so everything after
  // it can just call play() without worrying about autoplay restrictions.
  unlock() {
    try {
      const ctx = this._ac();
      if (ctx.state === "suspended") ctx.resume();
    } catch {
      // ignore — will retry lazily on next play()
    }
  }

  _ac() {
    if (!this._ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this._ctx = new AC();
    }
    return this._ctx;
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    savePrefs({ muted: this.muted, volume: this.volume });
    return this.muted;
  }

  setMuted(value) {
    this.muted = !!value;
    savePrefs({ muted: this.muted, volume: this.volume });
  }

  getVolume() {
    return this.volume;
  }

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, value));
    savePrefs({ muted: this.muted, volume: this.volume });
  }

  _tone(freq, type, dur, vol = 0.2, delay = 0, freqEnd) {
    if (this.muted || this.volume <= 0) return;
    try {
      const c = this._ac();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g);
      g.connect(c.destination);
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime + delay);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + delay + dur);
      const scaledVol = vol * this.volume;
      g.gain.setValueAtTime(scaledVol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      o.start(c.currentTime + delay);
      o.stop(c.currentTime + delay + dur + 0.01);
    } catch {
      // audio not available — never let a sound failure break gameplay
    }
  }

  _noise(dur, vol = 0.3, delay = 0) {
    if (this.muted || this.volume <= 0) return;
    try {
      const c = this._ac();
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      const g = c.createGain();
      src.buffer = buf;
      src.connect(g);
      g.connect(c.destination);
      const scaledVol = vol * this.volume;
      g.gain.setValueAtTime(scaledVol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      src.start(c.currentTime + delay);
      src.stop(c.currentTime + delay + dur + 0.01);
    } catch {
      // ignore
    }
  }

  play(name) {
    switch (name) {
      case "click":
        this._tone(700, "sine", 0.04, 0.12);
        break;
      case "bet":
        this._tone(400, "sine", 0.08, 0.22);
        this._tone(600, "sine", 0.06, 0.16, 0.06);
        break;
      case "win":
        this._tone(523, "sine", 0.15, 0.3);
        this._tone(659, "sine", 0.15, 0.28, 0.08);
        this._tone(784, "sine", 0.2, 0.32, 0.16);
        this._tone(1047, "sine", 0.25, 0.28, 0.26);
        break;
      case "lose":
        this._noise(0.4, 0.35);
        this._tone(160, "sawtooth", 0.35, 0.25, 0, 40);
        break;
      case "notify":
        this._tone(880, "sine", 0.1, 0.2);
        this._tone(1108, "sine", 0.1, 0.18, 0.1);
        break;
      default:
        break;
    }
  }
}

// Single shared instance — every screen/game imports this same object.
export const sound = new SoundManager();

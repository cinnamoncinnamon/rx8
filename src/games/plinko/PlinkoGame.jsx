/**
 * Plinko — Spinova (fixed ball logic)
 * - Server decides binIndex / multiplier / balance (apiPlinkoPlay)
 * - Client only animates: path of L/R moves that MUST end in that bin
 * - No Matter.js → no stuck balls / endless bounce
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { apiPlinkoPlay } from "../../api";
import "./PlinkoGame.css";

import sfxBall from "./ball.wav";
import sfxBest from "./multiplier.wav";
import sfxGood from "./multiplier-good.wav";
import sfxLow from "./multiplier-low.wav";
import sfxRegular from "./multiplier-regular.wav";
const BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const LINES_OPTIONS = [8, 12, 16];

/** Display multipliers for 16 rows (must match backend medium table order) */
const DISPLAY_MULTS_16 = [
  110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110,
];

function multColor(m) {
  if (m >= 40) return "#ff4d6d";
  if (m >= 10) return "#ff9f1c";
  if (m >= 2) return "#2ec4b6";
  if (m >= 1) return "#7bdff2";
  return "#6c757d";
}

function playSfx(src, volume = 0.45) {
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

function playMultiplierSfx(mult) {
  if (mult >= 40) playSfx(sfxBest, 0.55);
  else if (mult >= 5) playSfx(sfxGood, 0.5);
  else if (mult >= 1) playSfx(sfxRegular, 0.4);
  else playSfx(sfxLow, 0.35);
}

/** Path of 0=left / 1=right with exactly `rights` rights in `steps` moves */
function buildPath(steps, rights) {
  const r = Math.max(0, Math.min(steps, rights | 0));
  const path = Array(r).fill(1).concat(Array(steps - r).fill(0));
  for (let i = path.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [path[i], path[j]] = [path[j], path[i]];
  }
  return path;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Canvas board: pins + animated balls that follow a fixed L/R path to target bin.
 */
function createBoard(canvas, lines) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = 390;
  const cssH = 420;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const padX = 28;
  const padTop = 28;
  const padBottom = 36;
  const pinR = 3.4;
  const ballR = 6.5;

  const pins = [];
  const lastRowXs = [];
  for (let row = 0; row < lines; row++) {
    const pinsInRow = 3 + row;
    const y = padTop + (row / Math.max(lines - 1, 1)) * (cssH - padTop - padBottom);
    const rowPad = padX + ((lines - 1 - row) * ((cssW - padX * 2) / (lines + 2))) / 2;
    for (let col = 0; col < pinsInRow; col++) {
      const x =
        rowPad +
        (pinsInRow === 1
          ? 0
          : (col / (pinsInRow - 1)) * (cssW - rowPad * 2));
      pins.push({ x, y, row, col });
      if (row === lines - 1) lastRowXs.push(x);
    }
  }

  const binCount = lines + 1;
  const binW = lastRowXs.length > 1 ? lastRowXs[1] - lastRowXs[0] : (cssW - padX * 2) / binCount;
  const bins = [];
  for (let i = 0; i < binCount; i++) {
    const x =
      lastRowXs.length > 0
        ? lastRowXs[0] + i * binW
        : padX + binW * i + binW / 2;
    bins.push({ x, y: cssH - 8, w: binW });
  }

  /** Positions along a path: start → between pins each row → bin */
  function pathPoints(path) {
    const pts = [{ x: cssW / 2, y: 8 }];
    let slot = 0; // which gap we're in (0 .. row)
    for (let row = 0; row < lines; row++) {
      const dir = path[row] || 0;
      slot += dir;
      const pinsInRow = 3 + row;
      // land near pin slot / (slot+1) gap center under this row
      const rowPins = pins.filter((p) => p.row === row);
      let x;
      if (rowPins.length === 0) x = cssW / 2;
      else if (slot <= 0) x = rowPins[0].x;
      else if (slot >= rowPins.length) x = rowPins[rowPins.length - 1].x;
      else {
        // between pin[slot-1] and pin[slot]
        x = (rowPins[slot - 1].x + rowPins[slot].x) / 2;
      }
      // slight noise for organic look (does not change final bin)
      x += (Math.random() - 0.5) * 2.5;
      const y = rowPins[0]?.y ?? padTop + row * 20;
      pts.push({ x, y: y + pinR + 2 });
    }
    const bi = Math.min(bins.length - 1, Math.max(0, slot));
    pts.push({ x: bins[bi].x, y: bins[bi].y - 4 });
    return pts;
  }

  const balls = []; // { pts, t, speed, done, binIndex }
  let raf = 0;
  let hitPins = new Set();

  function draw() {
    ctx.clearRect(0, 0, cssW, cssH);

    // pins
    for (const p of pins) {
      const glow = hitPins.has(`${p.row}-${p.col}`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, pinR, 0, Math.PI * 2);
      ctx.fillStyle = glow ? "#a78bfa" : "#e9d5ff";
      ctx.fill();
      if (glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#7c3aed";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // balls
    for (const b of balls) {
      if (b.done) continue;
      const n = b.pts.length - 1;
      const f = Math.min(1, b.t);
      const seg = f * n;
      const i = Math.min(n - 1, Math.floor(seg));
      const local = easeInOut(seg - i);
      const a = b.pts[i];
      const c = b.pts[i + 1];
      const x = a.x + (c.x - a.x) * local;
      const y = a.y + (c.y - a.y) * local;

      // mark nearby pin hit for glow
      for (const p of pins) {
        if (Math.hypot(p.x - x, p.y - y) < pinR + ballR + 4) {
          hitPins.add(`${p.row}-${p.col}`);
        }
      }

      ctx.beginPath();
      ctx.arc(x, y, ballR, 0, Math.PI * 2);
      ctx.fillStyle = "#f472b6";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function tick() {
    // decay pin glow
    if (hitPins.size && Math.random() < 0.08) {
      const arr = [...hitPins];
      hitPins.delete(arr[0]);
    }

    let any = false;
    for (const b of balls) {
      if (b.done) continue;
      any = true;
      b.t += b.speed;
      if (b.t >= 1) {
        b.t = 1;
        b.done = true;
        if (b.onDone) b.onDone(b.binIndex);
      }
    }
    // purge finished
    for (let i = balls.length - 1; i >= 0; i--) {
      if (balls[i].done && balls[i].t >= 1.15) balls.splice(i, 1);
      else if (balls[i].done) balls[i].t += 0.05;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    stop();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function drop(binIndex, onDone) {
    const path = buildPath(lines, binIndex);
    // ensure sum matches (buildPath already does)
    const pts = pathPoints(path);
    playSfx(sfxBall, 0.35);
    balls.push({
      pts,
      t: 0,
      speed: 0.012 + Math.random() * 0.004, // duration ~1–1.2s
      done: false,
      binIndex,
      onDone,
    });
  }

  function destroy() {
    stop();
    balls.length = 0;
  }

  function setLines() {
    /* board is recreated by React when lines change */
  }

  return { start, stop, drop, destroy, setLines, bins, lines };
}

export default function PlinkoGame({ balance, setBalance, onBack }) {
  const canvasRef = useRef(null);
  const boardRef = useRef(null);

  const [bet, setBet] = useState(10);
  const [lines, setLines] = useState(16);
  const [busy, setBusy] = useState(false);
  const [lastWin, setLastWin] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // (re)build board when lines change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    boardRef.current?.destroy();
    const board = createBoard(canvas, lines);
    boardRef.current = board;
    board.start();
    return () => board.destroy();
  }, [lines]);

  const mults =
    lines === 16
      ? DISPLAY_MULTS_16
      : Array.from({ length: lines + 1 }, (_, i) => {
          const t = Math.abs(i - lines / 2) / (lines / 2 || 1);
          if (t > 0.9) return 40;
          if (t > 0.7) return 10;
          if (t > 0.5) return 3;
          if (t > 0.3) return 1.5;
          return 0.5;
        });

  async function handlePlay() {
    if (busy) return;
    setError("");
    setLastWin(null);

    if (bet > balance) {
      setError("Insufficient balance");
      return;
    }

    setBusy(true);
    try {
      const result = await apiPlinkoPlay({ betAmount: bet, lines });
      if (typeof result.balance === "number") setBalance(result.balance);

      const binIndex = Math.max(
        0,
        Math.min(lines, Number(result.binIndex) || 0)
      );

      setLastWin({
        multiplier: result.multiplier,
        winAmount: result.winAmount,
        binIndex,
      });
      setHistory((h) =>
        [{ mult: result.multiplier, win: result.winAmount }, ...h].slice(0, 12)
      );
      playMultiplierSfx(result.multiplier);

      // Animate to server bin — guaranteed finish
      boardRef.current?.drop(binIndex, () => {
        setBusy(false);
      });

      // safety unlock if animation callback missed
      setTimeout(() => setBusy(false), 2500);
    } catch (err) {
      setError(err.message || "Play failed");
      setBusy(false);
    }
  }

  return (
    <div className="plinko-root">
      <div className="plinko-topbar">
        <button type="button" className="plinko-back" onClick={onBack}>
          ← Back
        </button>
        <div className="plinko-title">Plinko</div>
        <div className="plinko-balance">৳{Number(balance).toFixed(2)}</div>
      </div>

      <div className="plinko-board-wrap">
        <canvas ref={canvasRef} className="plinko-canvas" />
        <div className="plinko-bins">
          {mults.map((m, i) => (
            <div
              key={i}
              className="plinko-bin"
              style={{
                background: multColor(m),
                opacity: lastWin?.binIndex === i ? 1 : 0.85,
                transform: lastWin?.binIndex === i ? "scale(1.08)" : "scale(1)",
              }}
            >
              {m}x
            </div>
          ))}
        </div>
      </div>

      {lastWin && (
        <div
          className={`plinko-result ${lastWin.winAmount > 0 ? "win" : "lose"}`}
        >
          {lastWin.winAmount > 0
            ? `+৳${Number(lastWin.winAmount).toFixed(2)} (${lastWin.multiplier}x)`
            : `No win (${lastWin.multiplier}x)`}
        </div>
      )}
      {error && <div className="plinko-error">{error}</div>}

      <div className="plinko-controls">
        <div className="plinko-row">
          <span className="plinko-label">Bet</span>
          <div className="plinko-steps">
            {BET_STEPS.filter((s) => s <= 500).map((s) => (
              <button
                key={s}
                type="button"
                className={bet === s ? "active" : ""}
                onClick={() => setBet(s)}
                disabled={busy}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="plinko-row">
          <span className="plinko-label">Lines</span>
          <div className="plinko-steps">
            {LINES_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={lines === n ? "active" : ""}
                onClick={() => setLines(n)}
                disabled={busy}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="plinko-play"
          onClick={handlePlay}
          disabled={busy || bet > balance}
        >
          {busy ? "Dropping…" : `Drop ৳${bet}`}
        </button>
      </div>

      {history.length > 0 && (
        <div className="plinko-history">
          {history.map((h, i) => (
            <span key={i} style={{ color: multColor(h.mult) }}>
              {h.mult}x
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

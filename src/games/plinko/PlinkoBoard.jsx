/**
 * PlinkoBoard — exact animation from the reference (ef32e795) game.
 * Server supplies path[] + bucket; client only draws.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { MULTIPLIERS, ROWS, bucketHeat, formatMultiplier } from "./plinko";

const W = 700;
const SX = 34;
const SY = 33;
const TOP = 74;
const CX = W / 2;
const BUCKET_Y = TOP + ROWS * SY + 26;
const BUCKET_H = 34;
const H = BUCKET_Y + BUCKET_H + 16;

const ROW_MS = 92;
const DROP_MS = 130;
const SETTLE_MS = 190;

const ballX = (k, r) => CX + (k - r / 2) * SX;
const rowY = (r) => TOP + r * SY;

function bucketColor(i, alpha = 1) {
  const heat = bucketHeat(i);
  const l = 0.58 + heat * 0.18;
  const c = 0.11 + heat * 0.08;
  const h = 168 - heat * 96;
  return `oklch(${l} ${c} ${h} / ${alpha})`;
}

export const PlinkoBoard = forwardRef(function PlinkoBoard({ risk = "medium" }, ref) {
  const canvasRef = useRef(null);
  const ballsRef = useRef([]);
  const hitsRef = useRef(new Array(ROWS + 1).fill(-99999));
  const pegHitsRef = useRef(new Map());
  const riskRef = useRef(risk);
  riskRef.current = risk;

  useImperativeHandle(ref, () => ({
    drop: (result) => {
      ballsRef.current.push({ result, start: performance.now(), landed: false });
    },
    activeCount: () => ballsRef.current.length,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now) => {
      ctx.clearRect(0, 0, W, H);

      // background glow
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "oklch(0.18 0.04 280 / 0.0)");
      bg.addColorStop(1, "oklch(0.16 0.05 280 / 0.35)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const table = MULTIPLIERS[riskRef.current] || MULTIPLIERS.medium;

      // pegs
      for (let r = 0; r < ROWS; r++) {
        for (let j = 0; j <= r; j++) {
          const x = ballX(j, r);
          const y = rowY(r);
          const key = `${r}:${j}`;
          const hitAt = pegHitsRef.current.get(key) || -99999;
          const age = now - hitAt;
          const glow = age >= 0 && age < 220;

          ctx.beginPath();
          ctx.arc(x, y, glow ? 4.2 : 3.4, 0, Math.PI * 2);
          ctx.fillStyle = glow
            ? "oklch(0.88 0.14 85)"
            : "oklch(0.78 0.06 280)";
          ctx.fill();

          if (glow) {
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = `oklch(0.8 0.18 85 / ${Math.max(0, 1 - age / 220) * 0.35})`;
            ctx.fill();
          }
        }
      }

      // buckets
      for (let i = 0; i <= ROWS; i++) {
        const x = ballX(i, ROWS);
        const age = now - (hitsRef.current[i] || -99999);
        const bump = age >= 0 && age < 280 ? 1 + Math.sin((age / 280) * Math.PI) * 0.12 : 1;
        const w = SX * 0.88 * bump;
        const h = BUCKET_H * bump;
        const y = BUCKET_Y + (BUCKET_H - h) / 2;

        ctx.beginPath();
        ctx.roundRect(x - w / 2, y, w, h, 6);
        ctx.fillStyle = bucketColor(i, age >= 0 && age < 280 ? 1 : 0.88);
        ctx.fill();

        ctx.fillStyle = "oklch(0.15 0.03 280)";
        ctx.font = `bold ${Math.max(9, 11 - (String(table[i]).length > 4 ? 1 : 0))}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(formatMultiplier(table[i]).replace("x", ""), x, y + h / 2);
      }

      // balls
      const next = [];
      for (const ball of ballsRef.current) {
        const t = now - ball.start;
        let x;
        let y;

        if (t < DROP_MS) {
          const p = t / DROP_MS;
          x = CX;
          const from = TOP - SY * 1.4;
          y = from + (rowY(0) - from) * p;
        } else {
          const rt = (t - DROP_MS) / ROW_MS;
          const r = Math.floor(rt);
          if (r >= ROWS) {
            const st = Math.min(1, (t - DROP_MS - ROWS * ROW_MS) / SETTLE_MS);
            const k = ball.result.binIndex ?? ball.result.bucket;
            x = ballX(k, ROWS);
            const from = rowY(ROWS);
            const to = BUCKET_Y + BUCKET_H / 2;
            y = from + (to - from) * (1 - Math.pow(1 - st, 2));
            if (!ball.landed && st >= 0.45) {
              ball.landed = true;
              hitsRef.current[k] = now;
            }
            if (st >= 1) continue;
          } else {
            const p = rt - r;
            const path = ball.result.path;
            const kFrom = path.slice(0, r).reduce((a, b) => a + b, 0);
            const dir = path[r] ?? 0;
            const kTo = kFrom + dir;
            const x0 = ballX(kFrom, r);
            const x1 = ballX(kTo, r + 1);
            const y0 = rowY(r);
            const y1 = rowY(r + 1);
            const ease = p * p * (3 - 2 * p);
            x = x0 + (x1 - x0) * ease;
            y = y0 + (y1 - y0) * (p * p * 0.75 + p * 0.25) - Math.sin(Math.PI * p) * 6;
            if (p < 0.08 && r >= 1) {
              const j = kFrom + (dir === 1 ? 0 : 1);
              pegHitsRef.current.set(`${r}:${j}`, now);
            }
          }
        }

        // soft halo
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = "oklch(0.85 0.16 84 / 0.18)";
        ctx.fill();

        const grad = ctx.createRadialGradient(x - 3, y - 4, 1, x, y, 8);
        grad.addColorStop(0, "oklch(0.97 0.08 96)");
        grad.addColorStop(1, "oklch(0.72 0.17 62)");
        ctx.beginPath();
        ctx.arc(x, y, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        next.push(ball);
      }
      ballsRef.current = next;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Plinko board"
      className="plinko-canvas"
      style={{ width: "100%", maxWidth: 700, aspectRatio: `${W} / ${H}`, display: "block" }}
    />
  );
});

export default PlinkoBoard;

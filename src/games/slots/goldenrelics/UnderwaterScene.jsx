import { useEffect, useRef } from "react";

export function UnderwaterScene() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let raf = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const bubbles = [];
    const motes   = [];
    const fishes  = [];
    const rays    = [];

    const seedBubble = (initial = false) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + Math.random() * 40,
      r: 1 + Math.random() * 5,
      vy: 0.25 + Math.random() * 0.9,
      wob: 0.5 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      a: 0.25 + Math.random() * 0.55,
    });
    const seedMote = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.4 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12,
      a: 0.15 + Math.random() * 0.55,
      hue: 180 + Math.random() * 40,
    });
    const seedRay = () => ({
      x: Math.random() * w,
      w: 60 + Math.random() * 140,
      speed: 0.02 + Math.random() * 0.05,
      a: 0.04 + Math.random() * 0.07,
    });
    const seedFish = () => {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const isSchool = Math.random() < 0.18;
      return {
        x: dir === 1 ? -40 : w + 40,
        y: 60 + Math.random() * (h - 120),
        vx: dir * (0.4 + Math.random() * 0.9),
        size: isSchool ? 4 + Math.random() * 3 : 8 + Math.random() * 14,
        dir,
        color: isSchool
          ? "rgba(150,220,255,0.55)"
          : `rgba(${120 + Math.random() * 60},${180 + Math.random() * 60},255,0.5)`,
        wob: 0.6 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        type: isSchool ? "school" : "fish",
      };
    };

    for (let i = 0; i < 70;  i++) bubbles.push(seedBubble(true));
    for (let i = 0; i < 110; i++) motes.push(seedMote());
    for (let i = 0; i < 5;   i++) rays.push(seedRay());

    let t = 0;
    let lastFish = 0;

    const drawBackdrop = () => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0,    "#062347");
      g.addColorStop(0.35, "#04162f");
      g.addColorStop(0.75, "#020a1c");
      g.addColorStop(1,    "#01060f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const surf = ctx.createLinearGradient(0, 0, 0, h * 0.35);
      surf.addColorStop(0, "rgba(120,220,255,0.18)");
      surf.addColorStop(1, "rgba(120,220,255,0)");
      ctx.fillStyle = surf;
      ctx.fillRect(0, 0, w, h * 0.35);

      const cave = ctx.createRadialGradient(w * 0.5, h * 0.55, 20, w * 0.5, h * 0.55, Math.max(w, h) * 0.55);
      cave.addColorStop(0,   "rgba(80,180,220,0.18)");
      cave.addColorStop(0.5, "rgba(20,80,140,0.08)");
      cave.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = cave;
      ctx.fillRect(0, 0, w, h);
    };

    const drawRuins = () => {
      const off = Math.sin(t * 0.0003) * 6;

      ctx.fillStyle = "rgba(8,30,55,0.85)";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.78);
      [
        [0.08,0.74],[0.14,0.68],[0.18,0.71],[0.22,0.62],
        [0.3,0.66],[0.4,0.58],[0.5,0.62],[0.6,0.55],
        [0.7,0.6],[0.78,0.5],[0.85,0.6],[0.92,0.55],[1,0.62],
      ].forEach(([px, py]) => ctx.lineTo(px * w + off * 0.3, py * h));
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(4,18,38,0.92)";
      [[0.05,0.55,0.06,0.45],[0.18,0.6,0.05,0.4],[0.78,0.5,0.06,0.5],[0.92,0.58,0.05,0.42]].forEach(([x,y,cw,ch]) => {
        const X = x * w + off * 0.6, Y = y * h, W = cw * w, H = ch * h;
        ctx.fillRect(X, Y, W, H);
        ctx.fillRect(X - W * 0.2, Y - 8, W * 1.4, 8);
        ctx.fillRect(X - W * 0.25, Y + H - 12, W * 1.5, 12);
      });

      ctx.fillStyle = "rgba(1,8,18,0.96)";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.86);
      [
        [0.05,0.92],[0.1,0.84],[0.16,0.9],[0.22,0.82],
        [0.3,0.88],[0.4,0.83],[0.5,0.9],[0.6,0.84],
        [0.7,0.88],[0.8,0.82],[0.88,0.9],[0.95,0.85],[1,0.9],
      ].forEach(([px, py]) => ctx.lineTo(px * w + off, py * h));
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      for (let i = 0; i < 14; i++) {
        const x = (i / 14) * w + 20;
        ctx.strokeStyle = `rgba(40,90,80,${0.55 + (i % 3) * 0.1})`;
        ctx.lineWidth = 3 + (i % 3);
        ctx.beginPath();
        ctx.moveTo(x, h);
        for (let s = 0; s < 6; s++) {
          ctx.lineTo(x + Math.sin(t * 0.0015 + i + s * 0.4) * 6 + Math.sin(t * 0.001 + i) * 8 * (s / 6), h - s * 18);
        }
        ctx.stroke();
      }

      const glintX = w * 0.35, glintY = h * 0.92;
      const ga = 0.4 + Math.sin(t * 0.004) * 0.3;
      const grad = ctx.createRadialGradient(glintX, glintY, 1, glintX, glintY, 60);
      grad.addColorStop(0, `rgba(255,220,120,${ga})`);
      grad.addColorStop(1, "rgba(255,220,120,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(glintX - 60, glintY - 60, 120, 120);
    };

    const drawRays = () => {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      rays.forEach((r) => {
        r.x += Math.sin(t * 0.0006 + r.w) * 0.3;
        const grad = ctx.createLinearGradient(r.x, 0, r.x + r.w, h);
        grad.addColorStop(0, `rgba(160,230,255,${r.a})`);
        grad.addColorStop(1, "rgba(160,230,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(r.x, 0);
        ctx.lineTo(r.x + r.w * 0.4, 0);
        ctx.lineTo(r.x + r.w * 1.4, h);
        ctx.lineTo(r.x + r.w * 0.6, h);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    };

    const drawBubbles = () => {
      ctx.save();
      bubbles.forEach((b, i) => {
        b.y -= b.vy;
        b.x += Math.sin(t * 0.002 + b.phase) * b.wob * 0.15;
        if (b.y < -10) bubbles[i] = seedBubble();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,230,255,${b.a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.a * 0.6})`;
        ctx.fill();
      });
      ctx.restore();
    };

    const drawMotes = () => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      motes.forEach((m) => {
        m.x += m.vx; m.y += m.vy;
        if (m.x < 0) m.x = w; if (m.x > w) m.x = 0;
        if (m.y < 0) m.y = h; if (m.y > h) m.y = 0;
        const flick = 0.5 + Math.sin(t * 0.005 + m.x) * 0.5;
        ctx.fillStyle = `hsla(${m.hue}, 100%, 75%, ${m.a * flick})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const drawFish = (f) => {
      const ny = f.y + Math.sin(t * 0.004 + f.phase) * f.wob * 2;
      ctx.save();
      ctx.translate(f.x, ny);
      ctx.scale(f.dir, 1);
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size, f.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.9, 0);
      ctx.lineTo(-f.size * 1.6, -f.size * 0.5);
      ctx.lineTo(-f.size * 1.6,  f.size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawFog = () => {
      const fg = ctx.createLinearGradient(0, h * 0.55, 0, h);
      fg.addColorStop(0, "rgba(8,40,70,0)");
      fg.addColorStop(1, "rgba(8,40,70,0.55)");
      ctx.fillStyle = fg;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
    };

    const tick = (now) => {
      t = now;
      ctx.clearRect(0, 0, w, h);
      drawBackdrop();
      drawRays();
      drawRuins();
      drawFog();
      drawMotes();
      drawBubbles();

      if (now - lastFish > 2500 && fishes.length < 8 && Math.random() < 0.6) {
        if (Math.random() < 0.25) {
          for (let i = 0; i < 6 + Math.floor(Math.random() * 5); i++) {
            const f = seedFish();
            f.type  = "school";
            f.size  = 3 + Math.random() * 2;
            f.y    += (Math.random() - 0.5) * 30;
            f.color = "rgba(170,225,255,0.55)";
            fishes.push(f);
          }
        } else {
          fishes.push(seedFish());
        }
        lastFish = now;
      }
      for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];
        f.x += f.vx;
        drawFish(f);
        if ((f.dir === 1 && f.x > w + 60) || (f.dir === -1 && f.x < -60)) fishes.splice(i, 1);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, height: "100%", width: "100%", display: "block" }}
    />
  );
}

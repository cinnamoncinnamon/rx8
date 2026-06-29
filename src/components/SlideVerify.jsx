/* ─────────────────────────────────────────────────────────────────────────────
   SPINOVA SlideVerify — drag-to-unlock captcha
   Props:
     onVerify(bool) — called with true when user slides past threshold
     reset          — increment this number to reset the component
───────────────────────────────────────────────────────────────────────────── */
import React, { useRef, useState, useEffect } from "react";

const TRACK_W = "100%";
const THUMB_W = 52;
const THRESHOLD = 0.85; // must drag 85% of track

export default function SlideVerify({ onVerify, reset = 0 }) {
  const trackRef  = useRef(null);
  const [pos, setPos]         = useState(0);       // px from left
  const [done, setDone]       = useState(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startPos = useRef(0);

  // Reset when parent increments reset prop
  useEffect(() => {
    setPos(0);
    setDone(false);
    setDragging(false);
    onVerify(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  function trackWidth() {
    return trackRef.current ? trackRef.current.offsetWidth : 300;
  }

  function clamp(v) {
    return Math.max(0, Math.min(v, trackWidth() - THUMB_W));
  }

  function finish(p) {
    const maxPos = trackWidth() - THUMB_W;
    if (p / maxPos >= THRESHOLD) {
      setPos(maxPos);
      setDone(true);
      onVerify(true);
    } else {
      // snap back
      setPos(0);
      onVerify(false);
    }
    setDragging(false);
  }

  // ── Mouse ──
  function onMouseDown(e) {
    if (done) return;
    e.preventDefault();
    startX.current   = e.clientX;
    startPos.current = pos;
    setDragging(true);

    function onMove(ev) {
      const delta = ev.clientX - startX.current;
      setPos(clamp(startPos.current + delta));
    }
    function onUp(ev) {
      const delta = ev.clientX - startX.current;
      finish(clamp(startPos.current + delta));
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // ── Touch ──
  function onTouchStart(e) {
    if (done) return;
    startX.current   = e.touches[0].clientX;
    startPos.current = pos;
    setDragging(true);
  }
  function onTouchMove(e) {
    if (done) return;
    const delta = e.touches[0].clientX - startX.current;
    setPos(clamp(startPos.current + delta));
  }
  function onTouchEnd() {
    finish(pos);
  }

  const pct = trackRef.current ? pos / (trackWidth() - THUMB_W) : 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 600 }}>
        Verification
      </div>
      <div
        ref={trackRef}
        style={{
          position: "relative",
          width: TRACK_W,
          height: 48,
          borderRadius: 12,
          background: done ? "#E8F5E9" : "#f0f0f0",
          border: `1.5px solid ${done ? "#66BB6A" : "#e0e0e0"}`,
          overflow: "hidden",
          transition: "background .3s, border .3s",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Fill bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: pos + THUMB_W / 2,
          background: done
            ? "linear-gradient(90deg,#66BB6A,#43A047)"
            : "linear-gradient(90deg,#EF535022,#EF535044)",
          transition: dragging ? "none" : "width .3s",
          borderRadius: 12,
        }} />

        {/* Label */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, letterSpacing: 1,
          color: done ? "#2E7D32" : "#aaa",
          pointerEvents: "none",
          transition: "color .3s",
        }}>
          {done ? "✓ Verified" : "Slide to verify →"}
        </div>

        {/* Thumb */}
        {!done && (
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              position: "absolute",
              left: pos,
              top: 0, bottom: 0,
              width: THUMB_W,
              background: "linear-gradient(135deg,#EF5350,#FF8A80)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: dragging ? "grabbing" : "grab",
              boxShadow: dragging
                ? "0 4px 20px #EF535066"
                : "0 2px 10px #EF535033",
              transition: dragging ? "none" : "left .25s cubic-bezier(.4,0,.2,1), box-shadow .2s",
              zIndex: 2,
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
            }}
          >
            <span style={{ color: "#fff", fontSize: 18, pointerEvents: "none" }}>
              {dragging ? "⟩⟩" : "⟩"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile-first Plinko — server-authoritative.
 * - No session dashboard / RTP text for players
 * - Risk + bet locked while balls are in play
 * - Clean multiplier labels, slower drop, synth sounds
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { apiPlinkoPlay } from "../../api";
import PlinkoBoard, { LAND_MS } from "./PlinkoBoard";
import {
  MULTIPLIERS,
  RISKS,
  BET_STEPS,
  formatCurrency,
  formatMultiplier,
} from "./plinko";
import { unlockAudio, setMuted, isMuted, playDrop } from "./sound";
import "./PlinkoGame.css";

export default function PlinkoGame({ balance, setBalance, onBack }) {
  const boardRef = useRef(null);
  const [bet, setBet] = useState(10);
  const [risk, setRisk] = useState("medium");
  const [ballsPerDrop, setBallsPerDrop] = useState(1);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeBalls, setActiveBalls] = useState(0);
  const [lastWin, setLastWin] = useState(null);
  const [soundOn, setSoundOn] = useState(!isMuted());

  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const locked = busy || activeBalls > 0;

  // poll active count so Risk/Bet stay locked until balls land
  useEffect(() => {
    const id = setInterval(() => {
      const n = boardRef.current?.activeCount?.() ?? 0;
      setActiveBalls(n);
    }, 120);
    return () => clearInterval(id);
  }, []);

  const onBallDone = useCallback((result) => {
    const payout = Number(result.winAmount) || 0;
    setLastWin({
      multiplier: result.multiplier,
      winAmount: payout,
    });
    setHistory((h) =>
      [
        {
          id: result.roundId || `${Date.now()}-${Math.random()}`,
          multiplier: result.multiplier,
        },
        ...h,
      ].slice(0, 8)
    );
  }, []);

  const play = useCallback(async () => {
    if (locked) return;
    const amount = bet;
    const count = ballsPerDrop;
    const cost = amount * count;
    if (cost > balanceRef.current) {
      setError("Insufficient balance");
      return;
    }
    setError("");
    setLastWin(null);
    unlockAudio();
    playDrop();
    setBusy(true);

    try {
      const res = await apiPlinkoPlay({
        betAmount: amount,
        risk,
        balls: count,
      });

      if (typeof res.balance === "number") setBalance(res.balance);

      const list =
        Array.isArray(res.results) && res.results.length
          ? res.results
          : res.binIndex != null
            ? [
                {
                  path: res.path,
                  binIndex: res.binIndex,
                  multiplier: res.multiplier,
                  winAmount: res.winAmount,
                  roundId: res.roundId,
                },
              ]
            : [];

      list.forEach((r, i) => {
        const dropResult = {
          path: r.path,
          binIndex: r.binIndex,
          bucket: r.binIndex,
          multiplier: r.multiplier,
          winAmount: r.winAmount,
          roundId: r.roundId,
        };
        window.setTimeout(() => {
          boardRef.current?.drop(dropResult);
          setActiveBalls((n) => n + 1);
        }, i * 140);
      });

      // sync final balance after last ball settles
      if (typeof res.balance === "number") {
        window.setTimeout(() => setBalance(res.balance), list.length * 140 + LAND_MS + 50);
      }
    } catch (e) {
      setError(e?.message || "Drop failed");
    } finally {
      setBusy(false);
    }
  }, [bet, risk, ballsPerDrop, locked, setBalance]);

  return (
    <div className="plinko-root">
      <header className="plinko-topbar">
        <button type="button" className="plinko-back" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="plinko-title">Plinko</div>
        <div className="plinko-balance">{formatCurrency(balance)}</div>
      </header>

      <div className="plinko-main">
        {/* History */}
        {history.length > 0 && (
          <div className="plinko-history">
            {history.map((h) => (
              <span key={h.id} className="plinko-hist-chip">
                {formatMultiplier(h.multiplier)}
              </span>
            ))}
          </div>
        )}

        {/* Board */}
        <div className="plinko-board-wrap">
          <PlinkoBoard ref={boardRef} risk={risk} onBallDone={onBallDone} />
        </div>

        {lastWin && (
          <div className={`plinko-result ${lastWin.winAmount > 0 ? "win" : "lose"}`}>
            {lastWin.winAmount > 0
              ? `+${formatCurrency(lastWin.winAmount)} (${formatMultiplier(lastWin.multiplier)})`
              : `${formatMultiplier(lastWin.multiplier)}`}
          </div>
        )}
        {error && <div className="plinko-error">{error}</div>}

        {/* Controls */}
        <section className="plinko-controls">
          <div className="plinko-row">
            <span className="plinko-label">Bet</span>
            <div className="plinko-steps">
              {BET_STEPS.filter((s) => s <= 200).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={bet === s ? "active" : ""}
                  onClick={() => setBet(s)}
                  disabled={locked}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="plinko-row">
            <span className="plinko-label">Risk</span>
            <div className="plinko-risk">
              {RISKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={risk === r ? `active risk-${r}` : ""}
                  onClick={() => setRisk(r)}
                  disabled={locked}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="plinko-row">
            <span className="plinko-label">Balls</span>
            <div className="plinko-steps">
              {[1, 2, 3, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={ballsPerDrop === n ? "active" : ""}
                  onClick={() => setBallsPerDrop(n)}
                  disabled={locked}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="plinko-sound"
              onClick={() => {
                unlockAudio();
                const next = !soundOn;
                setSoundOn(next);
                setMuted(!next);
              }}
              aria-label={soundOn ? "Mute" : "Unmute"}
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>

          <button
            type="button"
            className="plinko-play"
            onClick={play}
            disabled={locked || bet * ballsPerDrop > balance}
          >
            {busy ? "…" : activeBalls > 0 ? `Dropping…` : `Drop ৳${bet}${ballsPerDrop > 1 ? ` ×${ballsPerDrop}` : ""}`}
          </button>
        </section>
      </div>
    </div>
  );
}

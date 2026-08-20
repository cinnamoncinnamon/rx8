/**
 * PlinkoGame — UI + flow matching the reference (ef32e795) game.
 * Wired to spinova-backend /api/plinko/play (server path + ~96% RTP).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { apiPlinkoPlay } from "../../api";
import PlinkoBoard from "./PlinkoBoard";
import {
  MULTIPLIERS,
  RISKS,
  ROWS,
  BET_STEPS,
  formatCurrency,
  formatMultiplier,
} from "./plinko";
import "./PlinkoGame.css";

const LAND_DELAY = 130 + ROWS * 92 + 190; // matches board timing

export default function PlinkoGame({ balance, setBalance, onBack }) {
  const boardRef = useRef(null);

  const [bet, setBet] = useState(10);
  const [risk, setRisk] = useState("medium");
  const [ballsPerDrop, setBallsPerDrop] = useState(1);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("manual");

  // auto
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoBets, setAutoBets] = useState(25);
  const [autoSpeed, setAutoSpeed] = useState(350);
  const [autoLeft, setAutoLeft] = useState(0);
  const [session, setSession] = useState({ wagered: 0, returned: 0 });

  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const table = MULTIPLIERS[risk];
  const profit = session.returned - session.wagered;

  const play = useCallback(
    async (count) => {
      const amount = bet;
      const cost = amount * count;
      if (cost > balanceRef.current) {
        setError("Insufficient balance");
        return false;
      }
      setError("");
      setBusy(true);

      try {
        const res = await apiPlinkoPlay({
          betAmount: amount,
          risk,
          balls: count,
        });

        if (typeof res.balance === "number") {
          // optimistically deduct; credits applied as balls land
          setBalance(res.balance);
        }

        const results = res.results || [];
        // If API returned single-result legacy shape, normalize
        const list =
          results.length > 0
            ? results
            : res.binIndex != null
              ? [
                  {
                    path: res.path,
                    binIndex: res.binIndex,
                    multiplier: res.multiplier,
                    winAmount: res.winAmount,
                    betAmount: amount,
                    roundId: res.roundId,
                  },
                ]
              : [];

        // Apply session wager
        setSession((s) => ({ ...s, wagered: s.wagered + amount * list.length }));

        list.forEach((r, i) => {
          const dropResult = {
            path: r.path,
            binIndex: r.binIndex,
            bucket: r.binIndex,
            multiplier: r.multiplier,
          };
          window.setTimeout(() => boardRef.current?.drop(dropResult), i * 110);
          window.setTimeout(() => {
            const payout = Number(r.winAmount) || 0;
            setSession((s) => ({ ...s, returned: s.returned + payout }));
            setHistory((h) =>
              [
                {
                  id: r.roundId || `${Date.now()}-${i}`,
                  multiplier: r.multiplier,
                  payout,
                  bet: amount,
                },
                ...h,
              ].slice(0, 12)
            );
          }, i * 110 + LAND_DELAY);
        });

        // Final balance from server (already includes all wins)
        if (typeof res.balance === "number") {
          window.setTimeout(() => setBalance(res.balance), list.length * 110 + LAND_DELAY);
        }

        return true;
      } catch (e) {
        setError(e?.message || "Drop failed");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [bet, risk, setBalance]
  );

  const handleManual = async () => {
    if (busy || autoRunning) return;
    await play(ballsPerDrop);
  };

  // auto loop
  useEffect(() => {
    if (!autoRunning) return;
    let cancelled = false;
    let left = autoLeft;
    const interval = Math.max(80, Number(autoSpeed) || 350);

    const tick = async () => {
      if (cancelled) return;
      if (left <= 0) {
        setAutoRunning(false);
        return;
      }
      const ok = await play(ballsPerDrop);
      if (!ok) {
        setAutoRunning(false);
        return;
      }
      left -= 1;
      setAutoLeft(left);
      if (!cancelled) window.setTimeout(tick, interval);
    };
    const id = window.setTimeout(tick, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunning]);

  const startAuto = () => {
    const n = Math.max(1, Math.floor(Number(autoBets) || 0));
    setAutoLeft(n);
    setAutoRunning(true);
  };

  return (
    <div className="plinko-root">
      <div className="plinko-topbar">
        <button type="button" className="plinko-back" onClick={onBack}>
          ←
        </button>
        <div className="plinko-title">Plinko</div>
        <div className="plinko-balance">{formatCurrency(balance)}</div>
      </div>

      <div className="plinko-layout">
        {/* Controls */}
        <section className="plinko-panel">
          <div className="plinko-tabs">
            <button
              type="button"
              className={tab === "manual" ? "active" : ""}
              onClick={() => setTab("manual")}
            >
              Manual
            </button>
            <button
              type="button"
              className={tab === "auto" ? "active" : ""}
              onClick={() => setTab("auto")}
            >
              Auto
            </button>
          </div>

          <label className="plinko-field">
            <span>Bet amount</span>
            <div className="plinko-bet-row">
              <input
                type="number"
                min={1}
                step={1}
                value={bet}
                onChange={(e) => setBet(Math.max(1, Number(e.target.value) || 1))}
                disabled={busy || autoRunning}
              />
              <div className="plinko-steps">
                {BET_STEPS.filter((s) => s <= 500).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={bet === s ? "active" : ""}
                    onClick={() => setBet(s)}
                    disabled={busy || autoRunning}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </label>

          <label className="plinko-field">
            <span>Risk</span>
            <div className="plinko-risk">
              {RISKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={risk === r ? `active risk-${r}` : `risk-${r}`}
                  onClick={() => setRisk(r)}
                  disabled={busy || autoRunning}
                >
                  {r}
                </button>
              ))}
            </div>
          </label>

          <label className="plinko-field">
            <span>Balls per drop</span>
            <div className="plinko-steps">
              {[1, 2, 3, 5, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={ballsPerDrop === n ? "active" : ""}
                  onClick={() => setBallsPerDrop(n)}
                  disabled={busy || autoRunning}
                >
                  {n}
                </button>
              ))}
            </div>
          </label>

          {tab === "manual" ? (
            <button
              type="button"
              className="plinko-play"
              onClick={handleManual}
              disabled={busy || autoRunning || bet * ballsPerDrop > balance}
            >
              {busy ? "…" : `Drop ${ballsPerDrop > 1 ? `${ballsPerDrop}× ` : ""}৳${bet}`}
            </button>
          ) : (
            <div className="plinko-auto">
              <div className="plinko-auto-row">
                <label>
                  <span>Number of bets</span>
                  <input
                    type="number"
                    min={1}
                    value={autoBets}
                    onChange={(e) => setAutoBets(e.target.value)}
                    disabled={autoRunning}
                  />
                </label>
                <label>
                  <span>Speed (ms)</span>
                  <input
                    type="number"
                    min={80}
                    value={autoSpeed}
                    onChange={(e) => setAutoSpeed(e.target.value)}
                    disabled={autoRunning}
                  />
                </label>
              </div>
              <button
                type="button"
                className={`plinko-play ${autoRunning ? "stop" : ""}`}
                onClick={() => (autoRunning ? setAutoRunning(false) : startAuto())}
              >
                {autoRunning ? `Stop auto (${autoLeft} left)` : "Start auto"}
              </button>
            </div>
          )}

          {error && <div className="plinko-error">{error}</div>}

          <dl className="plinko-session">
            <div>
              <dt>Session profit</dt>
              <dd className={profit >= 0 ? "win" : "lose"}>
                {profit >= 0 ? "+" : "−"}
                {formatCurrency(Math.abs(profit)).replace("৳", "৳")}
              </dd>
            </div>
            <div>
              <dt>Wagered</dt>
              <dd>{formatCurrency(session.wagered)}</dd>
            </div>
            <div>
              <dt>RTP</dt>
              <dd>~96%</dd>
            </div>
          </dl>
        </section>

        {/* Board */}
        <section className="plinko-board-section">
          <div className="plinko-history">
            {history.map((h) => (
              <span key={h.id} className="plinko-hist-chip">
                {formatMultiplier(h.multiplier)}
              </span>
            ))}
          </div>
          <PlinkoBoard ref={boardRef} risk={risk} />
          <p className="plinko-fair">
            Server-authoritative · 16 rows · risk <strong>{risk}</strong> · house edge ~4%
          </p>
        </section>
      </div>
    </div>
  );
}

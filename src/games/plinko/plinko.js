/** Shared constants — must match backend MULTIPLIERS (~96% RTP). */
export const ROWS = 16;
export const BUCKETS = ROWS + 1;

export const MULTIPLIERS = {
  low: [
    15.5, 8.7, 1.94, 1.36, 1.36, 1.16, 1.07, 0.97, 0.48,
    0.97, 1.07, 1.16, 1.36, 1.36, 1.94, 8.7, 15.5,
  ],
  medium: [
    106.7, 39.8, 9.7, 4.85, 2.91, 1.45, 0.97, 0.48, 0.29,
    0.48, 0.97, 1.45, 2.91, 4.85, 9.7, 39.8, 106.7,
  ],
  high: [
    970, 126, 25.2, 8.73, 3.88, 1.94, 0.19, 0.19, 0.19,
    0.19, 0.19, 1.94, 3.88, 8.73, 25.2, 126, 970,
  ],
};

export const RISKS = ["low", "medium", "high"];
export const BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

export function bucketHeat(index) {
  const mid = (BUCKETS - 1) / 2;
  return Math.abs(index - mid) / mid;
}

/** Clean labels for players (payout still uses exact server value). */
export function formatMultiplier(m) {
  if (m >= 100) return `${Math.round(m)}x`;
  if (m >= 10) return `${Math.round(m)}x`;
  if (m >= 1) {
    const r = Math.round(m * 10) / 10;
    return `${r % 1 === 0 ? r.toFixed(0) : r}x`;
  }
  const r = Math.round(m * 10) / 10;
  return `${r}x`;
}

export function formatCurrency(v) {
  return `৳${Number(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

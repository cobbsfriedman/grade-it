/**
 * ranking.js — Player rank calculation
 *
 * Ranks are awarded based on accuracy percentage AND minimum round thresholds
 * to prevent rank inflation from small sample sizes.
 *
 * Thresholds from spec:
 *   Gold   → ≥ 80% accuracy after ≥ 20 rounds
 *   Silver → ≥ 65% accuracy after ≥ 10 rounds
 *   Bronze → ≥ 50% accuracy after ≥  5 rounds
 *   (none) → below thresholds
 */

export const RANKS = {
  GOLD:   { label: 'Gold',   emoji: '🥇', minAccuracy: 0.80, minRounds: 20 },
  SILVER: { label: 'Silver', emoji: '🥈', minAccuracy: 0.65, minRounds: 10 },
  BRONZE: { label: 'Bronze', emoji: '🥉', minAccuracy: 0.50, minRounds:  5 },
}

/**
 * getRank(correct, total) → rank object or null
 *
 * @param {number} correct – number of correct guesses
 * @param {number} total   – total rounds played
 * @returns {{ label, emoji, minAccuracy, minRounds } | null}
 */
export function getRank(correct, total) {
  if (total === 0) return null

  const accuracy = correct / total

  if (total >= RANKS.GOLD.minRounds   && accuracy >= RANKS.GOLD.minAccuracy)   return RANKS.GOLD
  if (total >= RANKS.SILVER.minRounds && accuracy >= RANKS.SILVER.minAccuracy) return RANKS.SILVER
  if (total >= RANKS.BRONZE.minRounds && accuracy >= RANKS.BRONZE.minAccuracy) return RANKS.BRONZE

  return null
}

/**
 * getAccuracyPercent(correct, total) → integer 0–100
 */
export function getAccuracyPercent(correct, total) {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

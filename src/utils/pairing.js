/**
 * pairing.js — Card pair validation helpers
 *
 * A valid pair must satisfy ALL of:
 *   1. Same player (playerName matches)
 *   2. Same grading company (PSA, BGS, SGC, or CGC)
 *   3. Grades at most MAX_GRADE_GAP apart (prevents trivially obvious comparisons)
 *   4. Grades are different (no ties)
 */

const SUPPORTED_COMPANIES = new Set(['PSA', 'BGS', 'SGC', 'CGC'])
const MAX_GRADE_GAP = 3

/**
 * isValidPair(cardA, cardB) → boolean
 *
 * Returns true if the pair passes all validation rules.
 */
export function isValidPair(cardA, cardB) {
  if (!cardA || !cardB) return false

  // Must be the exact same card (same player, year, set, card number)
  if (cardA.playerName !== cardB.playerName) return false
  if (cardA.year       !== cardB.year)       return false
  if (cardA.set        !== cardB.set)        return false
  if (cardA.number     !== cardB.number)     return false

  // Same supported grading company
  if (cardA.gradingCompany !== cardB.gradingCompany) return false
  if (!SUPPORTED_COMPANIES.has(cardA.gradingCompany)) return false

  // Grade gap constraint
  const gap = Math.abs(Number(cardA.grade) - Number(cardB.grade))
  if (gap === 0 || gap > MAX_GRADE_GAP) return false

  return true
}

/**
 * getCorrectAnswer(cardA, cardB) → 'A' | 'B' | null
 *
 * Returns which card has the higher grade, or null if tied / invalid.
 */
export function getCorrectAnswer(cardA, cardB) {
  if (!isValidPair(cardA, cardB)) return null
  const gradeA = Number(cardA.grade)
  const gradeB = Number(cardB.grade)
  if (gradeA === gradeB) return null
  return gradeA > gradeB ? 'A' : 'B'
}

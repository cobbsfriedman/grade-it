import { collection, getDocs } from 'firebase/firestore'
import { db } from './config'
import { isValidPair, getCorrectAnswer } from '../utils/pairing'

/**
 * getAllCards() — fetches every document from the 'cards' collection.
 *
 * Called once on game start; results are cached in useCardPairing so
 * Firestore is not re-queried on every round.
 */
export async function getAllCards() {
  const snap = await getDocs(collection(db, 'cards'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * buildPairs(cards) — finds every valid pairable combination in the card list.
 *
 * Groups cards by the four fields that define a unique physical card:
 *   playerName + year + set + number + gradingCompany
 *
 * Within each group, any two cards with a grade gap of 1–3 form a valid pair.
 * The A/B position is randomly assigned so the correct answer isn't always
 * on the same side.
 *
 * Returns an array of { cardA, cardB, correctAnswer } objects.
 */
export function buildPairs(cards) {
  // Group cards that are the same physical card, same grading company
  const groups = {}
  cards.forEach((card) => {
    const key = `${card.playerName}__${card.year}__${card.set}__${card.number}__${card.gradingCompany}`
    if (!groups[key]) groups[key] = []
    groups[key].push(card)
  })

  const pairs = []
  Object.values(groups).forEach((group) => {
    if (group.length < 2) return
    // Check every combination within the group
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        // Only pair cards that both have real images — no placeholder pairs
        if (!group[i].images?.front || !group[j].images?.front) continue
        if (isValidPair(group[i], group[j])) {
          // Randomly assign which copy is Card A and which is Card B
          const [cardA, cardB] =
            Math.random() < 0.5
              ? [group[i], group[j]]
              : [group[j], group[i]]
          pairs.push({
            cardA,
            cardB,
            correctAnswer: getCorrectAnswer(cardA, cardB),
          })
        }
      }
    }
  })

  return pairs
}

/**
 * shuffleArray(arr) — Fisher-Yates in-place shuffle, returns new array.
 */
export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

import { useState, useCallback } from 'react'
import useCardPairing from './useCardPairing'

/**
 * useGameState — top-level game session state
 *
 * Manages:
 *   • score (correct / total)
 *   • round counter
 *   • reveal state (has the player guessed yet?)
 *   • the current card pair (delegated to useCardPairing)
 *
 * Returns:
 *   { score, round, cardPair, revealed, guess, nextRound }
 */
export default function useGameState() {
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [round, setRound] = useState(1)
  const [playerGuess, setPlayerGuess] = useState(null)

  const { cardPair, loadNextPair, loading, error } = useCardPairing()

  // Player makes a guess: 'A' or 'B'
  const guess = useCallback((choice) => {
    if (playerGuess !== null) return // already guessed

    setPlayerGuess(choice)
    const correct = choice === cardPair?.correctAnswer
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }, [playerGuess, cardPair])

  // Advance to next round
  const nextRound = useCallback(() => {
    setPlayerGuess(null)
    setRound((r) => r + 1)
    loadNextPair()
  }, [loadNextPair])

  const revealed = playerGuess !== null

  // Augment cardPair with the player's guess so RevealSheet can read it
  const enrichedPair = cardPair
    ? { ...cardPair, playerGuess }
    : null

  return { score, round, cardPair: enrichedPair, revealed, guess, nextRound, loading, error }
}

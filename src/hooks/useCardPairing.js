import { useState, useEffect, useCallback, useRef } from 'react'
import { getAllCards, buildPairs, shuffleArray } from '../firebase/cardService'

const MAX_PAIRS = Infinity

/**
 * useCardPairing — loads all cards from Firestore once, builds a shuffled
 * pair queue, and vends one pair per round.
 *
 * Queue behaviour:
 *   • Up to MAX_PAIRS pairs are shuffled on load.
 *   • loadNextPair() advances through the queue.
 *   • When the queue is exhausted the deck reshuffles and restarts,
 *     so the game never runs out of rounds.
 */
export default function useCardPairing() {
  const [cardPair, setCardPair] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Refs so the queue survives re-renders without triggering them
  const queueRef = useRef([])
  const indexRef = useRef(0)

  // Advance to the next pair in the queue (reshuffles when exhausted)
  const loadNextPair = useCallback(() => {
    if (queueRef.current.length === 0) return
    if (indexRef.current >= queueRef.current.length) {
      queueRef.current = shuffleArray(queueRef.current)
      indexRef.current = 0
    }
    setCardPair(queueRef.current[indexRef.current])
    indexRef.current += 1
  }, [])

  // On mount: fetch all cards from Firestore, build pairs, serve the first one
  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const cards = await getAllCards()
        const pairs = buildPairs(cards).slice(0, MAX_PAIRS)

        if (pairs.length === 0) {
          throw new Error('No valid card pairs found. Make sure the seed script has been run.')
        }

        queueRef.current = shuffleArray(pairs)
        indexRef.current = 0
        setCardPair(queueRef.current[indexRef.current])
        indexRef.current = 1
      } catch (err) {
        console.error('useCardPairing:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  return { cardPair, loadNextPair, loading, error }
}

import { useState, useCallback, useRef } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 4

/**
 * useSharedTransform — shared zoom/pan state with rAF batching.
 *
 * Touch/wheel events fire much faster than the screen refresh rate.
 * Without batching every event queues a React re-render, causing jitter.
 * liveRef stays in perfect sync with every event; React state commits at
 * most once per animation frame via requestAnimationFrame.
 */
export default function useSharedTransform() {
  const [transform, setTransformState] = useState({ scale: 1, x: 0, y: 0 })

  // Source of truth — updated synchronously on every event
  const liveRef = useRef({ scale: 1, x: 0, y: 0 })
  const rafRef  = useRef(null)

  const setTransform = useCallback((updater) => {
    liveRef.current = typeof updater === 'function'
      ? updater(liveRef.current)
      : updater

    // Commit to React state at most once per frame
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setTransformState({ ...liveRef.current })
        rafRef.current = null
      })
    }
  }, []) // stable identity — never recreated

  const reset = useCallback(() => {
    const zero = { scale: 1, x: 0, y: 0 }
    liveRef.current = zero
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setTransformState(zero)
  }, []) // stable identity

  return { transform, setTransform, reset, MIN_SCALE, MAX_SCALE }
}

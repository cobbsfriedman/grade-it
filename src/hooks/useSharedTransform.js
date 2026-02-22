import { useState, useCallback } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 4

/**
 * useSharedTransform — shared zoom/pan state for synchronized card panels.
 *
 * Both panels in side-by-side and stacked mode receive the same transform,
 * so zooming or panning on either card moves both simultaneously.
 *
 * transform: { scale, x, y }
 *   scale  – zoom level (1 = fit, 4 = max)
 *   x, y   – pan offset in pixels (screen space)
 */
export default function useSharedTransform() {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })

  const reset = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 })
  }, [])

  return { transform, setTransform, reset, MIN_SCALE, MAX_SCALE }
}

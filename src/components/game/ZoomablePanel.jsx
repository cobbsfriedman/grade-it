import { useRef, useEffect } from 'react'
import CardPanel from './CardPanel'

const MIN_SCALE = 1
const MAX_SCALE = 4

/**
 * ZoomablePanel — wraps CardPanel with synchronized pinch-to-zoom and drag.
 *
 * Gestures (mobile):
 *   • Pinch            → zoom in/out (shared with the other panel)
 *   • Single-finger drag → pan (only when zoomed in)
 *   • Double-tap        → reset to fit
 *
 * Gestures (desktop):
 *   • Scroll wheel     → zoom
 *   • Mouse drag        → pan (only when zoomed in)
 *   • Double-click      → reset to fit
 *
 * Props:
 *   transform / setTransform / reset  — from useSharedTransform (shared state)
 *   card, label, revealed, isWinner   — forwarded to CardPanel
 */
export default function ZoomablePanel({
  card = null,
  label = 'A',
  imageFit = 'cover-left',
  revealed = false,
  isWinner = false,
  transform,
  setTransform,
  reset,
}) {
  const containerRef = useRef(null)

  // Keep mutable refs so event handlers (added once) always see latest values
  const setTransformRef = useRef(setTransform)
  const resetRef        = useRef(reset)
  useEffect(() => { setTransformRef.current = setTransform }, [setTransform])
  useEffect(() => { resetRef.current = reset }, [reset])

  // ── Touch / wheel event listeners (passive:false so we can preventDefault) ──
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const touchPoints = {}   // active touch positions keyed by identifier
    let lastTap = 0          // timestamp of last tap (for double-tap detection)

    // ── Wheel: zoom on desktop ──────────────────────────────────────────────
    function onWheel(e) {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 0.9
      setTransformRef.current(prev => {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor))
        if (newScale <= MIN_SCALE) return { scale: MIN_SCALE, x: 0, y: 0 }
        return { ...prev, scale: newScale }
      })
    }

    // ── Touch start ─────────────────────────────────────────────────────────
    function onTouchStart(e) {
      e.preventDefault()
      Array.from(e.changedTouches).forEach(t => {
        touchPoints[t.identifier] = { x: t.clientX, y: t.clientY }
      })

      // Double-tap to reset
      if (e.touches.length === 1) {
        const now = Date.now()
        if (now - lastTap < 280) resetRef.current()
        lastTap = now
      }
    }

    // ── Touch move ──────────────────────────────────────────────────────────
    function onTouchMove(e) {
      e.preventDefault()
      const list = Array.from(e.touches)

      if (list.length === 1) {
        // Single finger: pan (only when zoomed in)
        const t = list[0]
        const prev = touchPoints[t.identifier]
        if (prev) {
          const dx = t.clientX - prev.x
          const dy = t.clientY - prev.y
          setTransformRef.current(s => {
            if (s.scale <= MIN_SCALE) return s
            return { ...s, x: s.x + dx, y: s.y + dy }
          })
          touchPoints[t.identifier] = { x: t.clientX, y: t.clientY }
        }

      } else if (list.length === 2) {
        // Pinch: zoom
        const [t1, t2] = list
        const p1 = touchPoints[t1.identifier]
        const p2 = touchPoints[t2.identifier]
        if (p1 && p2) {
          const prevDist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
          const newDist  = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
          if (prevDist > 0) {
            const factor = newDist / prevDist
            setTransformRef.current(s => {
              const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.scale * factor))
              if (newScale <= MIN_SCALE) return { scale: MIN_SCALE, x: 0, y: 0 }
              return { ...s, scale: newScale }
            })
          }
          touchPoints[t1.identifier] = { x: t1.clientX, y: t1.clientY }
          touchPoints[t2.identifier] = { x: t2.clientX, y: t2.clientY }
        }
      }
    }

    // ── Touch end ───────────────────────────────────────────────────────────
    function onTouchEnd(e) {
      e.preventDefault()
      Array.from(e.changedTouches).forEach(t => delete touchPoints[t.identifier])
    }

    el.addEventListener('wheel',      onWheel,      { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: false })

    return () => {
      el.removeEventListener('wheel',      onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, []) // empty deps — handlers reach state through refs

  // ── Mouse drag (desktop) ────────────────────────────────────────────────
  const drag = useRef({ active: false, x: 0, y: 0 })

  function onMouseDown(e) {
    drag.current = { active: true, x: e.clientX, y: e.clientY }
  }
  function onMouseMove(e) {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = { active: true, x: e.clientX, y: e.clientY }
    setTransform(prev => {
      if (prev.scale <= MIN_SCALE) return prev
      return { ...prev, x: prev.x + dx, y: prev.y + dy }
    })
  }
  function onMouseUp() { drag.current.active = false }

  const { scale, x, y } = transform
  const isZoomed = scale > MIN_SCALE

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        flex: 1,
        touchAction: 'none',
        userSelect: 'none',
        cursor: isZoomed ? 'grab' : 'default',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDoubleClick={reset}
    >
      {/* Transform wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          // Smooth snap-back on reset; no transition during active gestures
          transition: isZoomed ? 'none' : 'transform 0.25s ease',
        }}
      >
        <CardPanel card={card} label={label} imageFit={imageFit} revealed={revealed} isWinner={isWinner} />
      </div>

      {/* "Reset" pill — visible only when zoomed in */}
      {isZoomed && (
        <button
          className="absolute top-2 right-2 z-10 text-[10px] font-condensed px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          onClick={e => { e.stopPropagation(); reset() }}
        >
          reset
        </button>
      )}
    </div>
  )
}

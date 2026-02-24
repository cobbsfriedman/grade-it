import { useState, useEffect } from 'react'
import ZoomablePanel from './ZoomablePanel'
import ViewModeTray from './ViewModeTray'
import useSharedTransform from '../../hooks/useSharedTransform'

/**
 * CardComparison — the card viewing area between TopBar and BottomBar.
 *
 * ── View modes ──────────────────────────────────────────────────────────────
 *
 *  side     Two panels left / right — the default.
 *           Both panels share one zoom/pan state, so moving or pinching
 *           on either card affects both simultaneously.
 *
 *  stack    Two panels top / bottom — same shared zoom/pan behaviour.
 *           Useful for spotting centering and corner differences.
 *
 *  overlay  One card fills the whole frame. A/B toggle at the bottom
 *           lets the player flip between the two grades.
 *           Swipe left/right (when not zoomed) also toggles A↔B.
 *
 * ── Synchronized zoom/pan ───────────────────────────────────────────────────
 *  The shared transform resets automatically when:
 *    • The view mode changes
 *    • A new card pair loads (new round)
 */
export default function CardComparison({ cardPair = null, revealed = false }) {
  const [mode, setMode]             = useState('side')
  const [overlayCard, setOverlayCard] = useState('A')

  const { transform, setTransform, reset } = useSharedTransform()

  // Reset zoom/pan on mode change
  useEffect(() => { reset() }, [mode, reset])

  // Reset zoom/pan and overlay position on new round
  useEffect(() => { reset(); setOverlayCard('A') }, [cardPair?.cardA?.id, reset])

  const cardA = cardPair?.cardA ?? null
  const cardB = cardPair?.cardB ?? null
  const isWinnerA = revealed && cardPair?.correctAnswer === 'A'
  const isWinnerB = revealed && cardPair?.correctAnswer === 'B'

  const shared = { transform, setTransform, reset }

  // Image crop/fit changes based on layout mode so the most useful edge is visible
  const imageFit =
    mode === 'side'    ? 'cover-left'   :
    mode === 'stack'   ? 'cover-bottom' :
    'contain'                             // overlay → full card visible

  // ── Overlay swipe detection ────────────────────────────────────────────────
  const swipeStart = { x: 0 }
  function onOverlayTouchStart(e) { swipeStart.x = e.touches[0]?.clientX ?? 0 }
  function onOverlayTouchEnd(e) {
    if (transform.scale > 1) return // don't swipe when zoomed
    const dx = (e.changedTouches[0]?.clientX ?? 0) - swipeStart.x
    if (Math.abs(dx) > 50) setOverlayCard(dx < 0 ? 'B' : 'A')
  }

  // ── Divider between panels ─────────────────────────────────────────────────
  const divider = (
    <div
      style={{
        flexShrink: 0,
        background: 'var(--border)',
        ...(mode === 'stack'
          ? { height: '1px', width: '100%' }
          : { width: '1px',  height: '100%' }),
      }}
    />
  )

  return (
    <div
      className="relative overflow-hidden"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: mode === 'stack' ? 'column' : 'row',
      }}
    >
      {mode === 'overlay' ? (
        /* ── Overlay mode ─────────────────────────────────────────────────── */
        <div
          className="flex flex-1"
          onTouchStart={onOverlayTouchStart}
          onTouchEnd={onOverlayTouchEnd}
        >
          {overlayCard === 'A' ? (
            <ZoomablePanel card={cardA} label="A" imageFit={imageFit} revealed={revealed} isWinner={isWinnerA} {...shared} />
          ) : (
            <ZoomablePanel card={cardB} label="B" imageFit={imageFit} revealed={revealed} isWinner={isWinnerB} {...shared} />
          )}

          {/* A / B sliding toggle — top-left (ViewModeTray owns top-right) */}
          <div
            className="absolute top-3 left-3 z-20 flex"
            style={{
              background: 'rgba(14,14,18,0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 2,
            }}
          >
            {/* Sliding indicator */}
            <div
              style={{
                position: 'absolute',
                top: 2, bottom: 2,
                width: 'calc(50% - 2px)',
                left: overlayCard === 'A' ? 2 : 'calc(50%)',
                background: 'var(--accent)',
                borderRadius: 6,
                transition: 'left 0.18s cubic-bezier(.4,0,.2,1)',
                pointerEvents: 'none',
              }}
            />
            {['A', 'B'].map(id => (
              <button
                key={id}
                onClick={() => setOverlayCard(id)}
                className="font-condensed font-bold tracking-wider"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: 36,
                  height: 28,
                  fontSize: 12,
                  color: overlayCard === id ? 'var(--bg)' : 'var(--text-muted)',
                  transition: 'color 0.18s ease',
                  borderRadius: 6,
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

      ) : (
        /* ── Side-by-side or Stacked mode ────────────────────────────────── */
        <>
          <ZoomablePanel card={cardA} label="A" imageFit={imageFit} revealed={revealed} isWinner={isWinnerA} {...shared} />
          {divider}
          <ZoomablePanel card={cardB} label="B" imageFit={imageFit} revealed={revealed} isWinner={isWinnerB} {...shared} />
        </>
      )}

      {/* Floating view mode tray */}
      <ViewModeTray mode={mode} onChange={setMode} />
    </div>
  )
}

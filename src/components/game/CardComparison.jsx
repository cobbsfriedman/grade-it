import { useEffect } from 'react'
import ZoomablePanel from './ZoomablePanel'
import useSharedTransform from '../../hooks/useSharedTransform'

/**
 * CardComparison — the card viewing area.
 *
 * mode / overlayCard / setOverlayCard are owned by GameScreen and passed
 * down so CardControls (sibling) can also read/write them.
 */
export default function CardComparison({
  cardPair     = null,
  revealed     = false,
  mode         = 'side',
  overlayCard  = 'A',
  setOverlayCard,
}) {
  const { transform, setTransform, reset } = useSharedTransform()

  // Reset zoom/pan on mode change or new round
  useEffect(() => { reset() }, [mode, reset])
  useEffect(() => { reset(); setOverlayCard?.('A') }, [cardPair?.cardA?.id, reset])

  const cardA     = cardPair?.cardA ?? null
  const cardB     = cardPair?.cardB ?? null
  const isWinnerA = revealed && cardPair?.correctAnswer === 'A'
  const isWinnerB = revealed && cardPair?.correctAnswer === 'B'
  const shared    = { transform, setTransform, reset }

  // When revealed, always show both cards in contain (full slab) mode
  const effectiveMode = revealed && mode === 'overlay' ? 'side' : mode
  const imageFit =
    revealed                  ? 'contain'      :
    effectiveMode === 'side'  ? 'cover-left'   :
    effectiveMode === 'stack' ? 'cover-bottom' :
    'contain'

  // Overlay swipe: left = B, right = A (only when not zoomed)
  const swipeStart = { x: 0 }
  function onOverlayTouchStart(e) { swipeStart.x = e.touches[0]?.clientX ?? 0 }
  function onOverlayTouchEnd(e) {
    if (transform.scale > 1) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - swipeStart.x
    if (Math.abs(dx) > 50) setOverlayCard?.(dx < 0 ? 'B' : 'A')
  }

  const divider = (
    <div style={{
      flexShrink: 0,
      opacity: 0.7,
      ...(mode === 'stack'
        ? { height: '3px', width: '100%', background: 'linear-gradient(90deg, transparent 0%, var(--accent) 20%, var(--accent) 80%, transparent 100%)' }
        : { width: '3px', height: '100%', background: 'linear-gradient(180deg, transparent 0%, var(--accent) 20%, var(--accent) 80%, transparent 100%)' }),
    }} />
  )

  return (
    <div
      className="relative overflow-hidden"
      style={{ flex: 1, display: 'flex', flexDirection: effectiveMode === 'stack' ? 'column' : 'row' }}
    >
      {effectiveMode === 'overlay' ? (
        <div
          className="flex flex-1"
          onTouchStart={onOverlayTouchStart}
          onTouchEnd={onOverlayTouchEnd}
        >
          {overlayCard === 'A'
            ? <ZoomablePanel card={cardA} label="A" imageFit={imageFit} revealed={revealed} isWinner={isWinnerA} {...shared} />
            : <ZoomablePanel card={cardB} label="B" imageFit={imageFit} revealed={revealed} isWinner={isWinnerB} {...shared} />
          }
        </div>
      ) : (
        <>
          <ZoomablePanel card={cardA} label="A" imageFit={imageFit} revealed={revealed} isWinner={isWinnerA} {...shared} />
          {divider}
          <ZoomablePanel card={cardB} label="B" imageFit={imageFit} revealed={revealed} isWinner={isWinnerB} {...shared} />
        </>
      )}
    </div>
  )
}

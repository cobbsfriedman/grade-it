/**
 * CardPanel — the card image, sized to overflow the panel so the
 * zoom/pan system can reveal the full card.
 *
 * imageFit controls the initial crop anchor (not a permanent crop):
 *   'cover-left'    fills panel height, left edge visible, right overflows → pan left to reveal
 *   'cover-bottom'  fills panel width, bottom edge visible, top overflows  → pan down to reveal
 *   'contain'       whole card visible (overlay / full mode)
 *
 * The A/B badge, grade badge, and winner glow all live in ZoomablePanel
 * (outside the transform) so they stay fixed while the card pans.
 */
export default function CardPanel({
  card     = null,
  label    = 'A',
  imageFit = 'cover-left',
  revealed = false,
}) {
  const imageUrl    = card?.images?.front ?? null
  const placeholder = label === 'A' ? '/placeholder-a.png' : '/placeholder-b.png'

  // Clip the top 20% of the image to hide the PSA/BGS grade label on slab photos.
  // clip-path lives on the image element itself, so it moves with the card during
  // pan/zoom — unlike a fixed overlay which can be bypassed by panning.
  // Fanatics vault images are consistently framed with the label at top ~17%.
  const labelClip = (!revealed && imageUrl) ? 'inset(20% 0 0 0)' : undefined

  // Image style varies by mode so the right edge/bottom overflows the panel
  // and can be revealed by panning, rather than being permanently cropped.
  let imgStyle = {}

  if (imageFit === 'cover-left') {
    // Fill panel height; natural width extends right → pan left to see more.
    // maxWidth: none overrides Tailwind Preflight's `max-width: 100%` which
    // would otherwise cap the width and cause the image to stretch.
    imgStyle = { position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', top: 0, left: 0, clipPath: labelClip }

  } else if (imageFit === 'cover-bottom') {
    // Fill panel width; natural height extends up → pan down to see more.
    // maxHeight: none overrides Tailwind Preflight's `height: auto` default.
    imgStyle = { position: 'absolute', width: '100%', height: 'auto', maxHeight: 'none', bottom: 0, left: 0, clipPath: labelClip }

  } else {
    // contain — whole card visible at once
    imgStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', clipPath: labelClip }
  }

  return (
    // No overflow-hidden here — the ZoomablePanel container handles clipping
    <div className="relative w-full h-full">
      <img
        src={imageUrl ?? placeholder}
        alt={`Card ${label}`}
        style={imgStyle}
        draggable={false}
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}

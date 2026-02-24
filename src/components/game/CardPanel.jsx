/**
 * CardPanel — the card image, sized to fill the panel.
 *
 * Pre-reveal: always uses height:125%/bottom:0/centered so the PSA/BGS
 * grade label (top ~17% of Fanatics vault images) sits above the panel
 * boundary and is hidden by the container's overflow-hidden. No clip-path,
 * no blank space.
 *
 * Post-reveal: switches to the selected imageFit mode so the full slab
 * (including grade label) is visible.
 *
 * imageFit (post-reveal only):
 *   'cover-left'   fills panel height, left-anchored, right overflows
 *   'cover-bottom' fills panel width, bottom-anchored, top overflows
 *   'contain'      whole card visible with letterbox
 */
export default function CardPanel({
  card     = null,
  label    = 'A',
  imageFit = 'cover-left',
  revealed = false,
}) {
  const imageUrl    = card?.images?.front ?? null
  const placeholder = label === 'A' ? '/placeholder-a.png' : '/placeholder-b.png'

  let imgStyle = {}

  if (!revealed && imageUrl) {
    // Fill panel height + 25% extra pushed above the top edge.
    // Label lives in that top 25% → hidden by container overflow-hidden.
    // Centered horizontally so the card face is in view.
    imgStyle = {
      position:  'absolute',
      height:    '125%',
      width:     'auto',
      maxWidth:  'none',
      maxHeight: 'none',
      bottom:    0,
      left:      '50%',
      transform: 'translateX(-50%)',
    }

  } else if (imageFit === 'cover-left') {
    imgStyle = { position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', top: 0, left: 0 }

  } else if (imageFit === 'cover-bottom') {
    imgStyle = { position: 'absolute', width: '100%', height: 'auto', maxHeight: 'none', bottom: 0, left: 0 }

  } else {
    // contain — whole card visible
    imgStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }
  }

  return (
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

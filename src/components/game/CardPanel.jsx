import { useState } from 'react'

/**
 * CardPanel — the card image, sized to fill the panel.
 *
 * Pre-reveal: hides the PSA/BGS grade label using overflow-hidden geometry.
 *   Portrait (tall) slab: label is at the TOP  → height:125%, bottom:0, centered horizontally
 *   Landscape (wide) slab: label is on the RIGHT → width:125%, left:0, centered vertically
 *   Orientation is detected from the image's natural dimensions on load.
 *
 * Post-reveal: switches to the selected imageFit mode so the full slab
 * (including grade label) is visible.
 *
 * Props:
 *   onOrientation(isLandscape) — called once after the image loads so
 *     ZoomablePanel can apply the correct pan clamp axis.
 *
 * imageFit (post-reveal only):
 *   'cover-left'   fills panel height, left-anchored, right overflows
 *   'cover-bottom' fills panel width, bottom-anchored, top overflows
 *   'contain'      whole card visible with letterbox
 */
export default function CardPanel({
  card          = null,
  label         = 'A',
  imageFit      = 'cover-left',
  revealed      = false,
  onOrientation = null,
}) {
  const [isLandscape, setIsLandscape] = useState(false)

  const imageUrl    = card?.images?.front ?? null
  const placeholder = label === 'A' ? '/placeholder-a.png' : '/placeholder-b.png'

  function handleLoad(e) {
    const img = e.currentTarget
    const landscape = img.naturalWidth > img.naturalHeight
    setIsLandscape(landscape)
    onOrientation?.(landscape)
  }

  let imgStyle = {}

  if (!revealed && imageUrl) {
    if (isLandscape) {
      // Landscape slab: label is on the RIGHT side.
      // Make image 125% wide anchored at left → right 25% (with label) overflows.
      // Center vertically so the card face fills the panel.
      imgStyle = {
        position:  'absolute',
        width:     '125%',
        height:    'auto',
        maxWidth:  'none',
        maxHeight: 'none',
        left:      0,
        top:       '50%',
        transform: 'translateY(-50%)',
      }
    } else {
      // Portrait slab: label is at the TOP.
      // Make image 125% tall anchored at bottom → top 25% (with label) overflows.
      // Center horizontally so the card face fills the panel.
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
        onLoad={handleLoad}
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}

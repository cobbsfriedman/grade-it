/**
 * CardPanel — single card display panel.
 *
 * The image always fills the entire panel (cover or contain depending on mode).
 * No padding — edge-to-edge, like a photo.
 *
 * imageFit controls how the image is cropped to fill the panel:
 *   'cover-left'    side-by-side: fills height, anchored to left edge
 *   'cover-bottom'  stacked:      fills width,  anchored to bottom edge
 *   'contain'       overlay/full: whole card visible, letterboxed if needed
 *
 * Placeholder images (shown until real eBay images arrive) live in /public:
 *   public/placeholder-a.png
 *   public/placeholder-b.png
 */
export default function CardPanel({
  card     = null,
  label    = 'A',
  imageFit = 'cover-left',
  revealed = false,
  isWinner = false,
}) {
  const imageUrl    = card?.images?.front ?? null
  const placeholder = label === 'A' ? '/placeholder-a.png' : '/placeholder-b.png'

  const objectFit      = imageFit === 'contain' ? 'contain' : 'cover'
  const objectPosition =
    imageFit === 'cover-left'   ? 'left center'   :
    imageFit === 'cover-bottom' ? 'center bottom'  :
    'center center'

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Card image — fills the whole panel */}
      <img
        src={imageUrl ?? placeholder}
        alt={`Card ${label}`}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit, objectPosition }}
        draggable={false}
        onError={e => { e.currentTarget.style.display = 'none' }}
      />

      {/* A / B badge — top corner, always visible over the image */}
      <div className="absolute top-2 left-2 z-10">
        <span
          className="font-condensed font-bold text-xs tracking-widest px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(0,0,0,0.55)',
            color: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {label}
        </span>
      </div>

      {/* Gold winner glow overlay */}
      {revealed && isWinner && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 2px var(--accent), inset 0 0 24px rgba(240,180,41,0.25)' }}
        />
      )}

      {/* Grade badge — bottom center, shown after reveal */}
      {revealed && card?.grade != null && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <span
            className="font-condensed font-bold text-xl px-4 py-1 rounded-full"
            style={{
              background: isWinner ? 'var(--accent)' : 'rgba(0,0,0,0.7)',
              color:      isWinner ? 'var(--bg)'     : 'var(--text-muted)',
              border:     isWinner ? 'none'           : '1px solid var(--border)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {card.gradingCompany} {card.grade}
          </span>
        </div>
      )}
    </div>
  )
}

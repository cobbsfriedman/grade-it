/**
 * CardControls — slim bar below the comparison area, above the bottom bar.
 *
 * Side / Stack mode:
 *   [ A ]  [ side | stack | overlay ]  [ B ]
 *
 * Overlay mode:
 *   [ A | B toggle ]  [ side | stack | overlay ]  [ — ]
 *
 * All controls are in the thumb zone, outside the card touch area.
 */

function SideIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <div style={{ width: 5, height: 11, borderRadius: 1, background: c }} />
      <div style={{ width: 5, height: 11, borderRadius: 1, background: c }} />
    </div>
  )
}

function StackIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <div style={{ width: 13, height: 4, borderRadius: 1, background: c }} />
      <div style={{ width: 13, height: 4, borderRadius: 1, background: c }} />
    </div>
  )
}

function OverlayIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return <div style={{ width: 13, height: 11, borderRadius: 1, background: c }} />
}

const VIEW_MODES = [
  { id: 'side',    Icon: SideIcon    },
  { id: 'stack',   Icon: StackIcon   },
  { id: 'overlay', Icon: OverlayIcon },
]

export default function CardControls({
  mode         = 'side',
  onModeChange,
  overlayCard  = 'A',
  onOverlayCard,
}) {
  const pillStyle = {
    background:          'rgba(14,14,18,0.82)',
    backdropFilter:      'blur(14px)',
    WebkitBackdropFilter:'blur(14px)',
    border:              '1px solid var(--border)',
    borderRadius:        8,
  }

  // A / B card label pill (side + stack modes)
  function CardLabel({ id }) {
    return (
      <div style={{ ...pillStyle, padding: '4px 14px' }}>
        <span
          className="font-condensed font-bold tracking-widest uppercase"
          style={{ fontSize: 13, color: 'var(--text-muted)' }}
        >
          {id}
        </span>
      </div>
    )
  }

  // A | B sliding toggle (overlay mode)
  function OverlayToggle() {
    return (
      <div className="flex" style={{ ...pillStyle, padding: 2 }}>
        {/* sliding indicator */}
        <div style={{
          position:   'absolute',
          top: 2, bottom: 2,
          width:      'calc(50% - 2px)',
          left:       overlayCard === 'A' ? 2 : 'calc(50%)',
          background: 'var(--accent)',
          borderRadius: 6,
          transition: 'left 0.18s cubic-bezier(.4,0,.2,1)',
          pointerEvents: 'none',
        }} />
        {['A', 'B'].map(id => (
          <button
            key={id}
            onClick={() => onOverlayCard?.(id)}
            className="font-condensed font-bold tracking-wider"
            style={{
              position: 'relative', zIndex: 1,
              width: 36, height: 28, fontSize: 12, borderRadius: 6,
              color: overlayCard === id ? 'var(--bg)' : 'var(--text-muted)',
              transition: 'color 0.18s ease',
            }}
          >
            {id}
          </button>
        ))}
      </div>
    )
  }

  // View mode icon buttons
  function ViewModeIcons() {
    return (
      <div className="flex items-center gap-0.5" style={{ ...pillStyle, padding: '3px 4px' }}>
        {VIEW_MODES.map(({ id, Icon }) => {
          const active = mode === id
          return (
            <button
              key={id}
              onClick={() => onModeChange?.(id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 24, borderRadius: 5,
                background: active ? 'var(--surface3)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
            >
              <Icon active={active} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between px-4"
      style={{ height: 44, flexShrink: 0 }}
    >
      {/* Left: card A label / overlay toggle */}
      <div style={{ position: 'relative' }}>
        {mode === 'overlay' ? <OverlayToggle /> : <CardLabel id="A" />}
      </div>

      {/* Center: view mode icons */}
      <ViewModeIcons />

      {/* Right: card B label / spacer */}
      {mode === 'overlay'
        ? <div style={{ width: 44 }} />
        : <CardLabel id="B" />
      }
    </div>
  )
}

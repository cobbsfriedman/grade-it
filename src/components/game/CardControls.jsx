/**
 * CardControls — bar below the comparison area, above the bottom bar.
 *
 * Side / Stack:  [ spacer ] [ view icons ]
 * Overlay:       [ spacer ] [ view icons ] | [ A | B toggle ]
 *
 * A/B toggle only appears in overlay (full-card) mode.
 * Vertical rule separates the two groups when both are visible.
 */

function SideIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <div style={{ width: 7, height: 15, borderRadius: 2, background: c }} />
      <div style={{ width: 7, height: 15, borderRadius: 2, background: c }} />
    </div>
  )
}

function StackIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      <div style={{ width: 17, height: 6, borderRadius: 2, background: c }} />
      <div style={{ width: 17, height: 6, borderRadius: 2, background: c }} />
    </div>
  )
}

// Tall vertical card shape — portrait proportions like an actual trading card
function OverlayIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return <div style={{ width: 10, height: 15, borderRadius: 2, background: c }} />
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
  const frosted = {
    background:           'rgba(14,14,18,0.82)',
    backdropFilter:       'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border:               '1px solid var(--border)',
    borderRadius:         8,
  }

  // Sized to match the A/B toggle button height (40px)
  const BTN_H = 40
  const BTN_W = 42

  function ViewModeIcons() {
    return (
      <div className="flex items-center gap-0.5" style={{ ...frosted, padding: '3px 4px' }}>
        {VIEW_MODES.map(({ id, Icon }) => {
          const active = mode === id
          return (
            <button
              key={id}
              onClick={() => onModeChange?.(id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: BTN_W, height: BTN_H, borderRadius: 6,
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

  // Sliding A | B toggle — only shown in overlay mode
  function OverlayToggle() {
    return (
      <div className="flex" style={{ ...frosted, padding: 2, position: 'relative' }}>
        {/* sliding indicator */}
        <div style={{
          position:      'absolute',
          top: 2, bottom: 2,
          width:         'calc(50% - 2px)',
          left:          overlayCard === 'A' ? 2 : 'calc(50%)',
          background:    'var(--accent)',
          borderRadius:  6,
          transition:    'left 0.18s cubic-bezier(.4,0,.2,1)',
          pointerEvents: 'none',
        }} />
        {['A', 'B'].map(id => (
          <button
            key={id}
            onClick={() => onOverlayCard?.(id)}
            className="font-condensed font-bold tracking-widest"
            style={{
              position:   'relative', zIndex: 1,
              width: BTN_W, height: BTN_H, fontSize: 18, borderRadius: 6,
              color:      overlayCard === id ? 'var(--bg)' : 'var(--accent)',
              transition: 'color 0.18s ease',
            }}
          >
            {id}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ height: 56, flexShrink: 0, gap: 0 }}
    >
      <ViewModeIcons />

      {/* Only show separator + A/B toggle in overlay (full-card) mode */}
      {mode === 'overlay' && (
        <>
          {/* Vertical rule */}
          <div style={{
            width: 1, height: 28,
            background: 'var(--border)',
            margin: '0 10px',
          }} />
          <OverlayToggle />
        </>
      )}
    </div>
  )
}

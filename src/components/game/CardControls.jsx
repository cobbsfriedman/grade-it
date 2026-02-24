/**
 * CardControls — slim bar below the comparison area, above the bottom bar.
 *
 * Layout: [ spacer ]  [ view icons ]  [ A ][ B ]
 *
 * All controls flush-right, thumb-accessible.
 * Overlay mode replaces A/B labels with a sliding A|B toggle.
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
  const frosted = {
    background:           'rgba(14,14,18,0.82)',
    backdropFilter:       'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border:               '1px solid var(--border)',
    borderRadius:         8,
  }

  // A / B card labels — right side, 50% bigger than before, gold-accented
  function ABLabels() {
    return (
      <div className="flex items-center gap-1.5">
        {['A', 'B'].map(id => (
          <div
            key={id}
            style={{
              ...frosted,
              border:  '1px solid var(--accent)',
              padding: '5px 20px',
            }}
          >
            <span
              className="font-condensed font-bold tracking-widest"
              style={{ fontSize: 20, color: 'var(--accent)' }}
            >
              {id}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Sliding A | B toggle for overlay mode — same gold style, 50% bigger
  function OverlayToggle() {
    return (
      <div className="flex" style={{ ...frosted, padding: 2, position: 'relative' }}>
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
              width: 52,  height: 40, fontSize: 18, borderRadius: 6,
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

  // View mode icon buttons — compact pill, sits just left of A/B
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
      className="flex items-center justify-end gap-3 pr-4 pl-4"
      style={{ height: 52, flexShrink: 0 }}
    >
      {/* View icons sit just left of A/B */}
      <ViewModeIcons />

      {/* A/B: labels in side/stack, toggle in overlay */}
      {mode === 'overlay' ? <OverlayToggle /> : <ABLabels />}
    </div>
  )
}

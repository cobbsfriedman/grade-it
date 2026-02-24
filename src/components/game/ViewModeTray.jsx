/**
 * ViewModeTray — compact icon-only tray, top-right of the comparison area.
 *
 * Modes:
 *   side    — cards side by side (default)
 *   stack   — cards stacked top/bottom
 *   overlay — one card fills the frame; A/B toggle to switch
 */

function SideIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <div style={{ width: 6, height: 12, borderRadius: 1, background: c }} />
      <div style={{ width: 6, height: 12, borderRadius: 1, background: c }} />
    </div>
  )
}

function StackIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <div style={{ width: 14, height: 5, borderRadius: 1, background: c }} />
      <div style={{ width: 14, height: 5, borderRadius: 1, background: c }} />
    </div>
  )
}

function OverlayIcon({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-muted)'
  return <div style={{ width: 14, height: 12, borderRadius: 1, background: c }} />
}

const MODES = [
  { id: 'side',    Icon: SideIcon    },
  { id: 'stack',   Icon: StackIcon   },
  { id: 'overlay', Icon: OverlayIcon },
]

export default function ViewModeTray({ mode = 'side', onChange }) {
  return (
    <div className="absolute top-3 right-3 z-30">
      <div
        className="flex items-center gap-0.5"
        style={{
          background: 'rgba(14,14,18,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '3px 4px',
        }}
      >
        {MODES.map(({ id, Icon }) => {
          const active = mode === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          28,
                height:         24,
                borderRadius:   5,
                background:     active ? 'var(--surface3)' : 'transparent',
                transition:     'background 0.15s ease',
              }}
            >
              <Icon active={active} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

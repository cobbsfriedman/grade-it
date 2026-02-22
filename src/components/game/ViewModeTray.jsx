/**
 * ViewModeTray — frosted glass floating tray with three layout mode buttons.
 *
 * Modes:
 *   side    — cards side by side (default), synchronized zoom/pan
 *   stack   — cards stacked top/bottom, synchronized zoom/pan
 *   overlay — one card fills the frame; A/B toggle to switch between them
 */

// CSS-drawn icons so we don't need an icon library
function SideIcon({ active }) {
  const color = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <div style={{ width: 9, height: 16, borderRadius: 2, background: color }} />
      <div style={{ width: 9, height: 16, borderRadius: 2, background: color }} />
    </div>
  )
}

function StackIcon({ active }) {
  const color = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      <div style={{ width: 20, height: 7, borderRadius: 2, background: color }} />
      <div style={{ width: 20, height: 7, borderRadius: 2, background: color }} />
    </div>
  )
}

function OverlayIcon({ active }) {
  const color = active ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <div style={{ width: 20, height: 16, borderRadius: 2, background: color }} />
  )
}

const MODES = [
  { id: 'side',    label: 'Side',  Icon: SideIcon    },
  { id: 'stack',   label: 'Stack', Icon: StackIcon   },
  { id: 'overlay', label: 'Full',  Icon: OverlayIcon },
]

export default function ViewModeTray({ mode = 'side', onChange }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
      <div className="frosted-tray flex items-center gap-1 px-2 py-1.5">
        {MODES.map(({ id, label, Icon }) => {
          const active = mode === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-full transition-colors"
              style={{
                background: active ? 'var(--surface3)' : 'transparent',
              }}
            >
              <Icon active={active} />
              <span
                className="text-[9px] font-condensed tracking-wide uppercase"
                style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

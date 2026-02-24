import { useNavigate } from 'react-router-dom'

/**
 * TopBar — top section
 *
 * Row 1: Wordmark (left) + quit (right)
 * Row 2: Card identity (left) + score (right)
 */
export default function TopBar({ score = { correct: 0, total: 0 }, card = null }) {
  const navigate = useNavigate()
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
  const rank = getRank(accuracy, score.total)

  return (
    <div className="flex flex-col px-4 pt-3 pb-2 gap-2">
      {/* Row 1: wordmark + quit */}
      <div className="flex items-center justify-between">
        <span className="wordmark text-sm">
          <span className="wordmark-grade">Grade</span>
          <span className="wordmark-it"> It</span>
        </span>
        <button
          onClick={() => navigate('/')}
          className="text-text-muted text-xs font-condensed tracking-wide"
        >
          ✕ Quit
        </button>
      </div>

      {/* Row 2: card identity (left) + score (right) */}
      <div className="flex items-center justify-between gap-3">
        {/* Card identity */}
        <div className="flex flex-col gap-0.5 min-w-0">
          {/* Player name — 20% larger than before (1.7rem → 2.04rem) */}
          <span
            className="font-condensed font-bold leading-tight text-text truncate"
            style={{ fontSize: '2.05rem' }}
          >
            {card?.playerName ?? 'Loading…'}
          </span>
          {/* Card details — lighter color, larger text */}
          {card && (
            <span
              className="font-condensed truncate"
              style={{ fontSize: '0.95rem', color: 'var(--text-mid)' }}
            >
              {card.year ?? '—'} · {card.set ?? '—'} · {card.gradingCompany ?? '—'}
            </span>
          )}
        </div>

        {/* Score — much bigger */}
        <div
          className="flex flex-col items-end flex-shrink-0 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--surface2)' }}
        >
          <span
            className="font-condensed font-bold leading-none text-text"
            style={{ fontSize: '1.9rem' }}
          >
            {score.correct}<span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}> / {score.total}</span>
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-condensed text-sm" style={{ color: 'var(--text-mid)' }}>
              {accuracy}%
            </span>
            {rank && (
              <span className="font-condensed text-sm" style={{ color: 'var(--accent)' }}>
                {rank}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getRank(accuracy, total) {
  if (total >= 20 && accuracy >= 80) return '🥇 Gold'
  if (total >= 10 && accuracy >= 65) return '🥈 Silver'
  if (total >= 5  && accuracy >= 50) return '🥉 Bronze'
  return null
}

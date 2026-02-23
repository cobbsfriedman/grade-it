import { useNavigate } from 'react-router-dom'

/**
 * TopBar — fixed 148px top section
 *
 * Contains:
 *   • Wordmark (left) + back arrow (right)
 *   • Score display: "34 / 51" + accuracy chip + rank badge
 *   • Card identity: "NOW GRADING" eyebrow + player name + meta pills
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
          <span className="font-condensed font-bold leading-tight text-text truncate" style={{ fontSize: '1.7rem' }}>
            {card?.playerName ?? 'Loading…'}
          </span>
          {card && (
            <span className="font-condensed text-sm truncate" style={{ color: 'var(--text-muted)' }}>
              {card.year ?? '—'} · {card.set ?? '—'} · {card.gradingCompany ?? '—'}
            </span>
          )}
        </div>

        {/* Score — single row with subtle background */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: 'var(--surface2)' }}
        >
          <span className="font-condensed font-bold text-base leading-none text-text">
            {score.correct} / {score.total}
          </span>
          <span style={{ color: 'var(--border)', fontSize: 10 }}>|</span>
          <span className="font-condensed text-sm" style={{ color: 'var(--text-mid)' }}>
            {accuracy}%
          </span>
          {rank && (
            <>
              <span style={{ color: 'var(--border)', fontSize: 10 }}>|</span>
              <span className="font-condensed text-sm" style={{ color: 'var(--accent)' }}>
                {rank}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Rank calculation from spec:
 * accuracy ≥ 80% after ≥ 20 rounds → Gold
 * accuracy ≥ 65% after ≥ 10 rounds → Silver
 * accuracy ≥ 50% after ≥ 5 rounds  → Bronze
 */
function getRank(accuracy, total) {
  if (total >= 20 && accuracy >= 80) return '🥇 Gold'
  if (total >= 10 && accuracy >= 65) return '🥈 Silver'
  if (total >= 5 && accuracy >= 50)  return '🥉 Bronze'
  return null
}

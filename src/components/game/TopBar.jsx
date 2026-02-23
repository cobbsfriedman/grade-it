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
        <span className="wordmark text-lg">
          <span className="wordmark-grade">Grade</span>
          <span className="wordmark-it"> It</span>
        </span>
        <button
          onClick={() => navigate('/')}
          className="text-text-muted text-sm font-condensed tracking-wide"
        >
          ✕ Quit
        </button>
      </div>

      {/* Row 2: card identity (left) + score (right) */}
      <div className="flex items-start justify-between gap-3">
        {/* Card identity */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-condensed font-bold text-lg leading-tight text-text truncate">
            {card?.playerName ?? 'Loading…'}
          </span>
          {card && (
            <div className="flex gap-1 flex-wrap">
              <MetaPill>{card.year ?? '—'}</MetaPill>
              <MetaPill>{card.set ?? '—'}</MetaPill>
              <MetaPill>{card.gradingCompany ?? '—'}</MetaPill>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="font-condensed font-bold text-xl leading-none text-text">
            {score.correct} / {score.total}
          </span>
          <div className="flex items-center gap-1">
            <span
              className="text-xs font-condensed font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface3)', color: 'var(--text-mid)' }}
            >
              {accuracy}%
            </span>
            {rank && (
              <span
                className="text-xs font-condensed font-semibold px-2 py-0.5 rounded-full"
                style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
              >
                {rank}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaPill({ children }) {
  return (
    <span
      className="text-[10px] font-condensed px-1.5 py-0.5 rounded"
      style={{ background: 'var(--surface3)', color: 'var(--text-mid)' }}
    >
      {children}
    </span>
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

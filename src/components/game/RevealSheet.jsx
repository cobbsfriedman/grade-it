/**
 * RevealSheet — bottom sheet that slides up after the player guesses
 *
 * Animation: translateY(100%) → translateY(0) in 0.45s cubic-bezier
 * NOT a separate route — it's an overlay inside GameScreen.
 *
 * Props:
 *   open       – bool, controls slide-up animation
 *   cardPair   – { cardA, cardB, correctAnswer, playerGuess }
 *   score      – { correct, total }
 *   onNext()   – called when player taps "Next Round"
 */
export default function RevealSheet({ open = false, cardPair = null, score = {}, onNext }) {
  const isCorrect = cardPair?.playerGuess === cardPair?.correctAnswer
  const winner = cardPair?.correctAnswer === 'A' ? cardPair?.cardA : cardPair?.cardB
  const loser  = cardPair?.correctAnswer === 'A' ? cardPair?.cardB : cardPair?.cardA

  return (
    <div className={`reveal-sheet ${open ? 'open' : ''}`}>
      {/* Sheet handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div
          className="w-10 h-1 rounded-full"
          style={{ background: 'var(--border)' }}
        />
      </div>

      <div className="px-5 pb-6 flex flex-col gap-5">
        {/* Verdict */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border))' }} />
          <span
            className="font-condensed font-bold text-2xl tracking-wide"
            style={{ color: isCorrect ? 'var(--correct)' : 'var(--wrong)' }}
          >
            {isCorrect ? '✓ Correct' : '✕ Wrong'}
          </span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--border), transparent)' }} />
        </div>

        {/* Grade cards side by side */}
        <div className="flex gap-3">
          <GradeCard label="Card A" card={cardPair?.cardA} isWinner={cardPair?.correctAnswer === 'A'} />
          <GradeCard label="Card B" card={cardPair?.cardB} isWinner={cardPair?.correctAnswer === 'B'} />
        </div>

        {/* Price info */}
        {(winner || loser) && (
          <div className="flex gap-3">
            <PriceCard card={winner} isWinner />
            <PriceCard card={loser} isWinner={false} />
          </div>
        )}

        {/* Next button */}
        <button
          onClick={onNext}
          className="w-full py-3.5 rounded-xl font-condensed font-bold text-xl tracking-widest uppercase transition-opacity active:opacity-80"
          style={
            isCorrect
              ? { background: 'linear-gradient(135deg, #f0b429 0%, #e05c2a 100%)', color: '#06060a' }
              : { background: 'var(--surface3)', color: 'var(--text-mid)', border: '1px solid var(--border)' }
          }
        >
          Next Round →
        </button>
      </div>
    </div>
  )
}

function GradeCard({ label, card, isWinner }) {
  return (
    <div
      className="flex-1 flex flex-col items-center py-3 rounded-xl gap-1"
      style={{
        background: 'var(--surface2)',
        border: `1px solid ${isWinner ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      <span className="text-xs font-condensed uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span
        className="font-condensed font-bold text-3xl"
        style={{ color: isWinner ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        {card?.grade ?? '—'}
      </span>
      <span className="text-[10px] font-condensed" style={{ color: 'var(--text-muted)' }}>
        {card?.gradingCompany ?? '—'}
      </span>
    </div>
  )
}

function PriceCard({ card, isWinner }) {
  if (!card?.price) return <div className="flex-1" />

  const href = card.psaUrl ?? (card.certNumber ? `https://www.psacard.com/cert/${card.certNumber}` : null)

  const inner = (
    <div
      className="flex-1 flex flex-col py-2 px-3 rounded-xl gap-0.5"
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
      }}
    >
      <span className="text-[9px] font-condensed uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {card.gradingCompany} {card.grade} · Est. value
      </span>
      <span className="font-condensed font-bold text-lg" style={{ color: isWinner ? 'var(--text)' : 'var(--text-muted)' }}>
        ${card.price.toLocaleString()}
      </span>
      {href && (
        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
          View on PSA ↗
        </span>
      )}
    </div>
  )

  if (!href) return inner

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex-1 no-underline">
      {inner}
    </a>
  )
}

/**
 * RevealSheet — centered modal overlay after the player guesses
 *
 * Props:
 *   open       – bool, controls fade/scale animation
 *   cardPair   – { cardA, cardB, correctAnswer, playerGuess }
 *   score      – { correct, total }
 *   onNext()   – called when player taps "Next Round"
 */
export default function RevealSheet({ open = false, cardPair = null, score = {}, onNext }) {
  const isCorrect = cardPair?.playerGuess === cardPair?.correctAnswer

  return (
    <div className={`reveal-backdrop ${open ? 'open' : ''}`}>
      <div className="reveal-modal">
        <div className="px-4 pt-5 pb-5 flex flex-col gap-4">

          {/* Verdict */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border))' }} />
            <span
              className="font-condensed font-bold text-2xl tracking-wide"
              style={{ color: isCorrect ? 'var(--correct)' : 'var(--wrong)' }}
            >
              {isCorrect ? '✓ Correct' : '✕ Wrong'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--border), transparent)' }} />
          </div>

          {/* Combined grade + buy cards */}
          <div className="flex gap-3">
            <CardBox label="A" card={cardPair?.cardA} isWinner={cardPair?.correctAnswer === 'A'} />
            <CardBox label="B" card={cardPair?.cardB} isWinner={cardPair?.correctAnswer === 'B'} />
          </div>

          {/* Next button */}
          <button
            onClick={onNext}
            className="w-full py-3.5 rounded-xl font-condensed font-bold text-xl tracking-widest uppercase transition-opacity active:opacity-80"
            style={{ background: 'linear-gradient(135deg, #f0b429 0%, #e05c2a 100%)', color: '#06060a' }}
          >
            Next Round →
          </button>

        </div>
      </div>
    </div>
  )
}

function CardBox({ label, card, isWinner }) {
  const href = card?.fanaticUrl ?? null

  // Corner tab: A sits in upper-right, B in upper-left
  const tabStyle = label === 'A'
    ? { top: -1, right: -1, borderRadius: '0 10px 0 10px', paddingLeft: 8,  paddingRight: 6  }
    : { top: -1, left:  -1, borderRadius: '10px 0 10px 0', paddingLeft: 6,  paddingRight: 8  }

  const buyButton = card?.price ? (
    <div
      className="relative flex flex-col rounded-lg transition-opacity active:opacity-70"
      style={{
        background: 'var(--surface3)',
        border: '1px solid rgba(255,255,255,0.16)',
        padding: '8px 10px 6px',
        cursor: href ? 'pointer' : 'default',
      }}
    >
      {/* External link arrow */}
      <span
        className="absolute font-bold leading-none"
        style={{ top: 6, right: 8, color: '#4ade80', fontSize: 11 }}
      >
        ↗
      </span>

      {/* Logo + price */}
      <div className="flex items-center gap-2">
        <img
          src="https://www.fanaticscollect.com/favicon.ico"
          alt="Fanatics"
          style={{ width: 18, height: 18, borderRadius: 3, flexShrink: 0 }}
        />
        <span
          className="font-condensed font-bold leading-none"
          style={{ color: 'var(--text)', fontSize: '1.15rem' }}
        >
          ${card.price.toLocaleString()}
        </span>
      </div>

      {/* Label */}
      <span
        className="font-condensed uppercase tracking-wider"
        style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}
      >
        Buy It Now Price
      </span>
    </div>
  ) : null

  return (
    <div
      className="flex-1 relative flex flex-col rounded-xl"
      style={{
        background: 'var(--surface2)',
        border: `1px solid ${isWinner ? 'var(--accent)' : 'var(--border)'}`,
        overflow: 'visible',
      }}
    >
      {/* A/B corner tag */}
      <div
        className="absolute font-condensed font-bold"
        style={{
          ...tabStyle,
          background: isWinner ? 'var(--accent)' : 'var(--surface3)',
          color:      isWinner ? 'var(--bg)'     : 'var(--text-muted)',
          fontSize: '1rem',
          paddingTop: 2,
          paddingBottom: 2,
          lineHeight: 1.4,
          zIndex: 1,
        }}
      >
        {label}
      </div>

      {/* Grade */}
      <div className="flex flex-col items-center pt-6 pb-3 px-2">
        <span
          className="font-condensed uppercase tracking-wider"
          style={{ fontSize: 9, color: 'var(--text-muted)' }}
        >
          {card?.gradingCompany ?? '—'}
        </span>
        <span
          className="font-condensed font-bold leading-none"
          style={{
            fontSize: '2.8rem',
            color: isWinner ? 'var(--accent)' : 'var(--text-muted)',
            marginTop: 2,
          }}
        >
          {card?.grade ?? '—'}
        </span>
      </div>

      {/* Buy button */}
      {buyButton && (
        <div className="px-2 pb-3">
          {href
            ? <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline block">{buyButton}</a>
            : buyButton
          }
        </div>
      )}
    </div>
  )
}

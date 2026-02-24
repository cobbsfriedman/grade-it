/**
 * RevealSheet — centered modal overlay after the player guesses
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

function CurvedArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 12 C2 4 8 2 12 2" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 2 L12 2 L12 5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CardBox({ label, card, isWinner }) {
  const href = card?.fanaticUrl ?? null
  const gradeColor = isWinner ? 'var(--accent)' : 'var(--text-muted)'

  // Corner tab: A sits in upper-right, B in upper-left
  const tabStyle = label === 'A'
    ? { top: -1, right: -1, borderRadius: '0 10px 0 10px', paddingLeft: 8,  paddingRight: 6  }
    : { top: -1, left:  -1, borderRadius: '10px 0 10px 0', paddingLeft: 6,  paddingRight: 8  }

  const buyButton = card?.price ? (
    <div
      className="relative flex flex-col rounded-lg transition-opacity active:opacity-70"
      style={{
        background: 'linear-gradient(180deg, #36363f 0%, #2c2c34 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '8px 10px 7px',
        cursor: href ? 'pointer' : 'default',
      }}
    >
      {/* Curved external link arrow */}
      <div className="absolute" style={{ top: 7, right: 8 }}>
        <CurvedArrow />
      </div>

      {/* Logo + price */}
      <div className="flex items-center gap-2">
        <img
          src="https://www.fanaticscollect.com/favicon.ico"
          alt="Fanatics"
          style={{ width: 18, height: 18, borderRadius: 3, flexShrink: 0 }}
        />
        <span
          className="font-condensed font-bold leading-none"
          style={{ color: 'var(--text)', fontSize: '1.5rem' }}
        >
          ${card.price.toLocaleString()}
        </span>
      </div>

      {/* Buy It Now Price label */}
      <span
        className="font-condensed uppercase tracking-wider text-center"
        style={{ fontSize: '0.72rem', color: '#ffffff', marginTop: 5 }}
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

      {/* Grade — company + number as a tight single unit */}
      <div className="flex flex-col items-center pt-6 pb-3 px-2">
        <span
          className="font-condensed font-bold uppercase tracking-wide leading-none"
          style={{ fontSize: '0.85rem', color: gradeColor, marginBottom: -2 }}
        >
          {card?.gradingCompany ?? '—'}
        </span>
        <span
          className="font-condensed font-bold leading-none"
          style={{ fontSize: '2.8rem', color: gradeColor }}
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

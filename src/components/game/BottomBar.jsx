/**
 * BottomBar — fixed 148px bottom section
 *
 * Contains:
 *   • Question prompt text
 *   • Two equal-width guess buttons: "Card A" and "Card B"
 *
 * Props:
 *   onGuess(choice)  – called with 'A' or 'B' when player taps a button
 *   disabled         – true after a guess is made (prevent double-tap)
 */
export default function BottomBar({ onGuess, disabled = false }) {
  return (
    <div
      className="flex flex-col justify-center gap-3 px-4 py-4"
      style={{ minHeight: 148 }}
    >
      {/* Prompt */}
      <p className="text-center font-condensed text-base tracking-wide text-text-mid uppercase">
        Which card graded higher?
      </p>

      {/* Guess buttons */}
      <div className="flex gap-3">
        <GuessButton label="Card A" choice="A" onGuess={onGuess} disabled={disabled} />
        <GuessButton label="Card B" choice="B" onGuess={onGuess} disabled={disabled} />
      </div>
    </div>
  )
}

function GuessButton({ label, choice, onGuess, disabled }) {
  return (
    <button
      onClick={() => !disabled && onGuess(choice)}
      disabled={disabled}
      className="
        flex-1 py-3
        font-condensed font-semibold text-lg tracking-widest uppercase
        rounded-xl
        transition-all active:scale-95
      "
      style={{
        background: 'var(--surface2)',
        color: disabled ? 'var(--text-muted)' : 'var(--text)',
        border: '1px solid var(--border)',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}

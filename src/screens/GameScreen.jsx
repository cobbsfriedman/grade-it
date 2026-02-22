import TopBar from '../components/game/TopBar'
import CardComparison from '../components/game/CardComparison'
import BottomBar from '../components/game/BottomBar'
import RevealSheet from '../components/game/RevealSheet'
import useGameState from '../hooks/useGameState'

export default function GameScreen() {
  const { score, round, cardPair, revealed, guess, nextRound, loading, error } = useGameState()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-condensed text-lg text-text">Failed to load cards</p>
        <p className="text-sm text-text-muted">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <span className="wordmark text-3xl">
          <span className="wordmark-grade">Grade</span>
          <span className="wordmark-it"> It</span>
        </span>
        <p className="text-text-muted text-sm font-condensed tracking-widest uppercase animate-pulse">
          Loading cards…
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* ── Top section ─────────────────────────────── */}
      <TopBar score={score} round={round} card={cardPair?.cardA} />
      <div className="gold-rule" />

      {/* ── Comparison area ──────────────────────────── */}
      <CardComparison cardPair={cardPair} revealed={revealed} />
      <div className="gold-rule" />

      {/* ── Bottom bar ───────────────────────────────── */}
      <BottomBar onGuess={guess} disabled={revealed} />

      {/* ── Reveal sheet (slides up on guess) ────────── */}
      <RevealSheet
        open={revealed}
        cardPair={cardPair}
        score={score}
        onNext={nextRound}
      />
    </div>
  )
}

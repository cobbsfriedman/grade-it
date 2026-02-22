import { useNavigate } from 'react-router-dom'

/**
 * HomeScreen — splash / landing page
 *
 * Shows the Grade It wordmark, a tagline, and a Play button.
 * Tapping Play navigates to /game.
 */
export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
      {/* Wordmark */}
      <div className="text-center">
        <h1 className="wordmark text-5xl">
          <span className="wordmark-grade">Grade</span>
          <span className="wordmark-it"> It</span>
        </h1>
        <p className="text-text-mid text-sm mt-2 font-barlow">
          Which card graded higher?
        </p>
      </div>

      {/* Play button */}
      <button
        onClick={() => navigate('/game')}
        className="
          w-full max-w-xs
          py-4
          font-condensed font-bold text-xl tracking-widest uppercase
          rounded-xl
          text-bg
          transition-opacity active:opacity-80
        "
        style={{
          background: 'linear-gradient(135deg, #f0b429 0%, #e05c2a 100%)',
        }}
      >
        Play
      </button>

      <p className="text-text-muted text-xs font-barlow text-center">
        PSA · BGS · SGC · CGC
      </p>
    </div>
  )
}

import { Logo } from '../brand/Logo';
import { READ } from '../story/script';

/**
 * The open read — the only thing in the whole kiosk that decides the mood.
 *
 * Deliberately gives no target expression. The visitor picks what to show,
 * which is the difference between "how I feel" and "a face I can pull", and it
 * is why this replaced a version that scored the game instead.
 *
 * There is no meter and no pass mark, on purpose. A bar to clear would turn
 * this back into a performance, and "nothing in particular" is a real answer
 * with its own mood attached.
 */
export function Read({
  strongest,
  seconds,
  seed,
}: {
  /** How strong the clearest expression is right now, 0..1. */
  strongest: number;
  /** Seconds left in the read window, for the countdown ring. */
  seconds: number;
  seed: number;
}) {
  const seeing = strongest > 0.35;

  return (
    <div className="scene">
      <Logo size={96} />

      {/* A soft halo instead of a meter: it acknowledges without grading. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 490,
          width: 560,
          height: 560,
          marginLeft: -280,
          borderRadius: '50%',
          boxShadow: `0 0 ${40 + strongest * 90}px ${8 + strongest * 26}px rgba(229,6,149,${0.06 + strongest * 0.3})`,
          transition: 'box-shadow 420ms ease',
          pointerEvents: 'none',
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 110 }}>
        <span
          style={{
            fontSize: 30,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            marginBottom: 22,
          }}
        >
          {Math.max(0, Math.ceil(seconds))}
        </span>

        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--w-display)',
            fontSize: 82,
            lineHeight: 1.06,
            letterSpacing: '-0.04em',
            color: 'var(--blue)',
          }}
        >
          {READ.prompt}
        </h2>

        <p
          key={seeing ? 'seeing' : 'waiting'}
          className="rise"
          style={{
            margin: '28px 0 0',
            fontSize: 44,
            lineHeight: 1.3,
            minHeight: 116,
            color: seeing ? 'var(--magenta)' : 'var(--ink-dim)',
            fontFamily: seeing ? 'var(--font-display)' : 'var(--font-body)',
            fontWeight: seeing ? 'var(--w-display-strong)' : 'var(--w-body)',
          }}
        >
          {seeing ? pick(READ.seeing, seed) : pick(READ.nudge, seed + Math.floor(seconds / 2))}
        </p>
      </div>
    </div>
  );
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(Math.floor(seed)) % items.length] as T;
}

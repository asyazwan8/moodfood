import { Logo } from '../brand/Logo';
import { SmileMeter } from '../ui/SmileMeter';
import { EXERCISES as EXERCISE_DEFS } from '../mood/classify';
import { EXERCISES, EXERCISE_COPY, reactionLine } from '../story/script';

/**
 * The four face exercises.
 *
 * This is the heart of the kiosk now. It replaced a passive read taken while
 * the visitor stood still, which returned "Steady" for nearly everybody — a
 * resting face at a kiosk is just neutral.
 *
 * The scene itself is presentational; App drives the round timing, so all the
 * timers stay in one place with the rest of the story's pacing.
 */
export function Exercises({
  index,
  value,
  progress,
  hit,
  escaped,
  flashing,
  seed,
}: {
  /** Which round, 0-based. */
  index: number;
  /** Live value of this round's channel, 0..1 — drives the meter. */
  value: number;
  /** How far toward this round's threshold, 0..1+. Drives the copy. */
  progress: number;
  /** True once the threshold is crossed. */
  hit: boolean;
  /** True when the round ran out of time and we are moving on anyway. */
  escaped: boolean;
  flashing: boolean;
  seed: number;
}) {
  const exercise = EXERCISE_DEFS[index];
  if (!exercise) return null;
  const copy = EXERCISE_COPY[exercise.id];

  let line: string;
  if (escaped) line = pick(EXERCISES.escape, seed + index);
  else if (hit) line = pick(EXERCISES.got, seed + index);
  else line = reactionLine(exercise.id, progress);

  return (
    <div className="scene">
      <Logo size={96} />

      {/* The meter rings the camera blob, which App positions behind this. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 420,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      >
        <SmileMeter value={Math.min(1, progress)} target={1} holding={hit || escaped} />
      </div>

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
          {EXERCISES.counter(index + 1, EXERCISE_DEFS.length)}
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
          {copy?.prompt ?? ''}
        </h2>

        <p
          key={line}
          className="rise"
          style={{
            margin: '28px 0 0',
            fontSize: 44,
            lineHeight: 1.3,
            minHeight: 116,
            color: hit || escaped ? 'var(--magenta)' : 'var(--ink-dim)',
            fontFamily: hit || escaped ? 'var(--font-display)' : 'var(--font-body)',
            fontWeight: hit || escaped ? 'var(--w-display-strong)' : 'var(--w-body)',
          }}
        >
          {line}
        </p>
      </div>

      {flashing && <div className="flash" />}
      {/* Unused here but keeps the live channel value available for debugging. */}
      <span hidden>{value.toFixed(2)}</span>
    </div>
  );
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(Math.floor(seed)) % items.length] as T;
}

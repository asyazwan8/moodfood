import { Logo } from '../brand/Logo';
import { SmileMeter } from '../ui/SmileMeter';
import { EXERCISES as EXERCISE_DEFS } from '../mood/classify';
import { GAME, GAME_COPY, reactionLine } from '../story/script';

/**
 * The four-face game.
 *
 * Purely entertainment: the mood was already decided by the open read and
 * announced two screens ago, and nothing here can change it. That separation
 * is the point — the game gets to be a game, and the read gets to be about how
 * someone actually feels rather than which face they can pull fastest.
 *
 * The scene is presentational; App drives the round timing, so all the timers
 * stay in one place with the rest of the story's pacing.
 */
export function Game({
  index,
  value,
  progress,
  hit,
  escaped,
  flashing,
  total,
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
  /** Running score so far, out of 400. */
  total: number;
  seed: number;
}) {
  const exercise = EXERCISE_DEFS[index];
  if (!exercise) return null;
  const copy = GAME_COPY[exercise.id];

  let line: string;
  if (escaped) line = pick(GAME.escape, seed + index);
  else if (hit) line = pick(GAME.got, seed + index);
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 22,
            fontSize: 30,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
          }}
        >
          <span>{GAME.counter(index + 1, EXERCISE_DEFS.length)}</span>
          <span style={{ color: 'var(--magenta)' }}>{total}</span>
        </div>

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

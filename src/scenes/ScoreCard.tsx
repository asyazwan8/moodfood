import { Logo } from '../brand/Logo';
import { PhotoStrip } from '../ui/PhotoStrip';
import { PressCue } from '../ui/PressCue';
import { SCORE } from '../story/script';

/**
 * The game's payoff: four faces, a number, and a line about the one they were
 * best at.
 *
 * The strip is doing the real work here. Anyone can be told a machine was
 * watching them; a set of their own four faces is the thing they believe, and
 * the thing they turn round and show whoever they came with.
 */
export function ScoreCard({
  shots,
  scores,
  bestFace,
}: {
  shots: (string | null)[];
  scores: number[];
  /** The round they scored highest on, already in display form. */
  bestFace: string | null;
}) {
  const total = scores.reduce((a, b) => a + b, 0);
  const band = SCORE.bands.find((b) => total > b.above) ?? SCORE.bands[SCORE.bands.length - 1];

  return (
    <div className="scene">
      <Logo size={96} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 44,
        }}
      >
        <PhotoStrip shots={shots} width={500} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--w-display)',
              fontSize: 128,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              color: 'var(--blue)',
            }}
          >
            {total}
          </span>
          <span style={{ fontSize: 32, letterSpacing: '0.16em', color: 'var(--ink-faint)' }}>
            OUT OF 400
          </span>
        </div>

        <p
          className="rise"
          style={{
            margin: 0,
            fontSize: 42,
            lineHeight: 1.4,
            color: 'var(--ink-dim)',
            textAlign: 'center',
            maxWidth: 820,
          }}
        >
          {band?.line}
          {bestFace && ` ${SCORE.best(bestFace)}`}
        </p>
      </div>

      <PressCue />
    </div>
  );
}

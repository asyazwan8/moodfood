import { ThinkingMark } from '../brand/Logo';
import { READING, pickFrom } from '../story/script';

/**
 * The beat of drama between the photo and the answer.
 *
 * Nothing is actually being computed here — the mood was decided back in
 * warmup. This pause exists because an instant answer feels like a lookup
 * table, and two seconds of the lava lamp turning your colour feels like
 * being considered.
 */
export function Reading({ seed }: { seed: number }) {
  return (
    <div className="scene">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 70,
        }}
      >
        <ThinkingMark size={200} />
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 62,
            letterSpacing: '-0.03em',
            color: 'var(--paper-dim)',
          }}
        >
          {pickFrom(READING, seed)}
        </p>
      </div>
    </div>
  );
}

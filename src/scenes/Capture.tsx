import { CAPTURE } from '../story/script';

/** 3 — 2 — 1 — flash. */
export function Capture({ count, flashing }: { count: number; flashing: boolean }) {
  const numeral = CAPTURE.count[count];

  return (
    <div className="scene">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {numeral && (
          <span
            key={numeral}
            className="count"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--w-display)',
              fontSize: 420,
              lineHeight: 1,
              color: 'var(--blue)',
              textShadow: '0 8px 50px rgba(255,255,255,.9)',
            }}
          >
            {numeral}
          </span>
        )}
      </div>

      {flashing && <div className="flash" />}
    </div>
  );
}

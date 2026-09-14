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
              fontWeight: 900,
              fontSize: 420,
              lineHeight: 1,
              color: 'var(--cream)',
              textShadow: '0 0 120px rgba(0,0,0,.6)',
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

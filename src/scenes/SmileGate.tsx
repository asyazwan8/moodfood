import { Logo } from '../brand/Logo';
import { SmileMeter } from '../ui/SmileMeter';
import { SMILE, smileLine } from '../story/script';

/**
 * "Give me your best smile."
 *
 * The beat that earns the photo. It is NOT how the mood gets measured — if it
 * were, every visitor would come out Bright and the reveal would be worthless.
 * This exists because it is fun, because it makes people commit to the thing,
 * and because it gets a genuine smile into the photo.
 */
export function SmileGate({
  smile,
  target,
  holding,
}: {
  smile: number;
  target: number;
  holding: boolean;
}) {
  return (
    <div className="scene">
      <Logo size={96} />

      {/* The ring sits around the camera blob, which App positions behind this. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 470,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      >
        <SmileMeter value={smile} target={target} holding={holding} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 120 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 84,
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
          }}
        >
          {SMILE.prompt}
        </h2>

        <p
          key={smileLine(smile)}
          className="rise"
          style={{
            margin: '30px 0 0',
            fontSize: 46,
            lineHeight: 1.3,
            color: holding ? 'var(--magenta-lit)' : 'var(--paper-dim)',
            fontWeight: holding ? 800 : 400,
            fontFamily: holding ? 'var(--font-display)' : 'var(--font-body)',
            minHeight: 120,
          }}
        >
          {holding ? SMILE.holding : smileLine(smile)}
        </p>
      </div>
    </div>
  );
}

import { Logo } from '../brand/Logo';
import { Typewriter } from '../ui/Typewriter';
import { WARMUP, pickFrom } from '../story/script';

/**
 * The camera comes on and the kiosk finds you.
 *
 * This is also where the REAL mood read happens — quietly, while the visitor
 * is just standing there reading the screen and not performing for it. See the
 * note in src/mood/classify.ts for why that matters so much.
 */
export function Warmup({ faceFound, seed }: { faceFound: boolean; seed: number }) {
  return (
    <div className="scene">
      <Logo size={64} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 150 }}>
        <h2
          key={faceFound ? 'found' : 'searching'}
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 88,
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
            minHeight: 190,
          }}
        >
          <Typewriter
            text={faceFound ? pickFrom(WARMUP.found, seed) : pickFrom(WARMUP.searching, seed)}
            speed={34}
          />
        </h2>

        <p
          style={{
            margin: '24px 0 0',
            fontSize: 38,
            color: 'var(--cream-dim)',
            opacity: faceFound ? 1 : 0,
            transition: 'opacity 600ms ease',
          }}
        >
          {WARMUP.holding}
        </p>
      </div>
    </div>
  );
}

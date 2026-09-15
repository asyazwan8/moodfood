import { useState } from 'react';
import { Logo } from '../brand/Logo';
import { PressCue } from '../ui/PressCue';
import { TypedLines } from '../ui/Typewriter';
import { ENCOURAGEMENT, pickFrom } from '../story/script';
import type { MoodId } from '../mood/moods';

/**
 * The kind bit.
 *
 * The press cue is held back until the last line has finished typing — putting
 * "touch anywhere" on screen while the kiosk is still mid-sentence trains
 * people to skip the one part of this that is actually about them.
 */
export function Encouragement({ mood, seed }: { mood: MoodId; seed: number }) {
  const lines = pickFrom(ENCOURAGEMENT[mood], seed);
  const [finished, setFinished] = useState(false);

  return (
    <div className="scene">
      <Logo size={96} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <TypedLines
          lines={lines}
          speed={24}
          gap={40}
          onDone={() => setFinished(true)}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--w-display-strong)',
            fontSize: 62,
            lineHeight: 1.22,
            letterSpacing: '-0.03em',
            display: 'block',
            maxWidth: 880,
          }}
        />
      </div>

      <PressCue show={finished} />
    </div>
  );
}

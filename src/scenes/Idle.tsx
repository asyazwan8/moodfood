import { useEffect, useState } from 'react';
import { Logo, DalaMark } from '../brand/Logo';
import { PressCue } from '../ui/PressCue';
import { ATTRACT, GREETINGS, IDLE_CUE, pickFrom } from '../story/script';
import type { Daypart } from '../mood/classify';

/**
 * The attract loop. This screen is what IPC's visitors actually see 99% of the
 * time, so it has to look like something worth walking up to from ten metres
 * away — hence the enormous greeting and the very small everything else.
 */
export function Idle({ daypart, seed }: { daypart: Daypart; seed: number }) {
  const greeting = pickFrom(GREETINGS[daypart], seed);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setLine((n) => n + 1), 6000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="scene">
      <Logo size={64} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
        <DalaMark
          size={150}
          className="dala-drift"
          style={{ color: 'var(--amber)', marginBottom: 20, opacity: 0.95 }}
        />

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 132,
            lineHeight: 0.95,
            letterSpacing: '-0.045em',
          }}
        >
          {greeting.hello}
        </h1>

        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: 'var(--amber)',
            maxWidth: 820,
          }}
        >
          {greeting.ask}
        </p>

        <p
          key={line}
          className="rise"
          style={{
            margin: '28px 0 0',
            fontSize: 38,
            lineHeight: 1.45,
            color: 'var(--cream-dim)',
            maxWidth: 760,
          }}
        >
          {pickFrom(ATTRACT, seed + line)}
        </p>
      </div>

      <PressCue label={IDLE_CUE} />
    </div>
  );
}

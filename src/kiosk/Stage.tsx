import { type ReactNode, useEffect, useState } from 'react';
import { STAGE } from '../brand/tokens';

/**
 * The kiosk is built for one screen: a 1080 x 1920 vertical panel.
 *
 * Rather than making every scene responsive, we lay everything out at that
 * exact pixel size and scale the whole thing to fit whatever screen it lands
 * on. The demo then looks pixel-identical on the real kiosk, on a laptop, and
 * in a screenshot — which is the whole point when you are rehearsing a
 * walkthrough on a MacBook for a screen you have not stood in front of yet.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(() => fitScale());

  useEffect(() => {
    const onResize = () => setScale(fitScale());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        // The lava lamp lives behind this, full-bleed, so a non-9:16 screen
        // reads as intentional rather than letterboxed.
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: STAGE.width,
          height: STAGE.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          position: 'relative',
          flex: 'none',
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function fitScale() {
  return Math.min(
    window.innerWidth / STAGE.width,
    window.innerHeight / STAGE.height,
  );
}

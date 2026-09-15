import { type ReactNode, useEffect, useState } from 'react';
import { STAGE } from '../brand/tokens';

const ASPECT = STAGE.width / STAGE.height; // 9:16

/**
 * The kiosk is built for one screen: a 1080 x 1920 vertical panel.
 *
 * Everything — the background artwork included — lives inside a single element
 * locked to that 9:16 shape, sized to fit whatever viewport it lands in. The
 * design is then laid out at exact pixel sizes and scaled as one piece, so the
 * demo looks identical on the real kiosk, on a laptop, and on a phone.
 *
 * The background MUST be in here rather than behind the whole viewport. IPC's
 * artwork is 9:16; cover-fitting it to a landscape browser window blows it up
 * to a few times its size and you see a tiny corner of it. Inside this box it
 * is always shown whole.
 *
 * Scaling uses an explicit size plus a top-left transform origin rather than
 * centring an oversized element, which browsers resolve inconsistently once
 * the element is taller than its container.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState(fitScreen);

  useEffect(() => {
    const onResize = () => setScreen(fitScreen());
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // The surround on a screen that is not 9:16. Paper, so letterboxing
        // reads as a deliberate frame rather than a broken layout.
        background: 'var(--paper-soft)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: screen.width,
          height: screen.height,
          overflow: 'hidden',
          flex: 'none',
        }}
      >
        <div
          style={{
            width: STAGE.width,
            height: STAGE.height,
            transform: `scale(${screen.width / STAGE.width})`,
            transformOrigin: 'top left',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** The largest 9:16 box that fits the current viewport. */
function fitScreen() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(vw, vh * ASPECT);
  return { width, height: width / ASPECT };
}

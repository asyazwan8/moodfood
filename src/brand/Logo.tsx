import type { CSSProperties } from 'react';

/**
 * The IPC logo — the real artwork, at its true brand colours.
 *
 * It no longer needs a light chip behind it: IPC's mark is built for white,
 * and the kiosk background is now IPC's own near-white artwork, so it sits
 * directly on the page exactly as intended.
 *
 * Swapping the artwork is a one-file change: replace
 * public/brand/IPC_logo.png.
 */
export function Logo({ size = 96, style }: { size?: number; style?: CSSProperties }) {
  return (
    <img
      src="/brand/IPC_logo.png"
      alt="IPC Shopping Centre"
      style={{ height: size, width: 'auto', display: 'block', flex: 'none', alignSelf: 'flex-start', ...style }}
    />
  );
}

/**
 * The "thinking" mark used while the kiosk is reading you.
 *
 * Deliberately abstract rather than the logo: a soft blob breathing in the
 * same visual language as the background behind it. A pulsing logo would read
 * as a loading spinner with branding bolted on.
 */
export function ThinkingMark({ size = 180, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className="blob thinking"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 36% 32%, var(--magenta), var(--blue) 62%, rgba(0,71,185,0) 78%)',
        ...style,
      }}
    />
  );
}

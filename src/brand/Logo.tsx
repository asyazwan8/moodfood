import type { CSSProperties } from 'react';

/**
 * The IPC logo.
 *
 * Renders `public/brand/logo.svg` directly, so replacing that one file swaps
 * the logo everywhere in the kiosk at once — no component changes, no rebuild
 * of anything else. That file is currently a plain wordmark placeholder.
 */
export function Logo({ size = 56, style }: { size?: number; style?: CSSProperties }) {
  return (
    <img
      src="/brand/logo.svg"
      alt="IPC"
      // alignSelf stops a flex column from stretching the image; pass
      // alignSelf in `style` to override it where the logo should be centred.
      style={{ height: size, width: 'auto', display: 'block', flex: 'none', alignSelf: 'flex-start', ...style }}
    />
  );
}

/**
 * The "thinking" mark used while the kiosk is reading you.
 *
 * Deliberately abstract rather than the logo: it is a soft blob that breathes
 * in the same visual language as the lava lamp behind it. A pulsing logo would
 * read as a loading spinner with branding bolted on.
 */
export function ThinkingMark({ size = 180, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className="blob thinking"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 38% 34%, var(--cream), var(--amber) 62%, transparent 76%)',
        ...style,
      }}
    />
  );
}

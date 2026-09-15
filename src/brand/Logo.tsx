import type { CSSProperties } from 'react';

/**
 * The IPC logo — the real artwork, untouched.
 *
 * It sits on a light chip rather than straight on the background. That is not
 * decoration: IPC's mark is a deep blue built for white, and on the kiosk's
 * dark ground it scores 2.38:1 contrast, which is unreadable. Recolouring
 * someone's logo is not ours to do, so the logo keeps its exact brand colours
 * and we give it the light surface it was designed for.
 *
 * Swapping the artwork is still a one-file change: replace
 * public/brand/IPC_logo.png.
 */
export function Logo({ size = 96, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: `${size * 0.26}px ${size * 0.34}px`,
        borderRadius: size * 0.34,
        background: 'var(--paper)',
        boxShadow: '0 18px 44px rgba(0,0,0,.34)',
        alignSelf: 'flex-start',
        flex: 'none',
        ...style,
      }}
    >
      <img
        src="/brand/IPC_logo.png"
        alt="IPC Shopping Centre"
        style={{ height: size, width: 'auto', display: 'block' }}
      />
    </div>
  );
}

/**
 * The "thinking" mark used while the kiosk is reading you.
 *
 * Deliberately abstract rather than the logo: a soft blob breathing in the
 * same visual language as the lava lamp behind it. A pulsing logo would read
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
          'radial-gradient(circle at 38% 34%, var(--paper), var(--magenta-lit) 58%, transparent 76%)',
        ...style,
      }}
    />
  );
}

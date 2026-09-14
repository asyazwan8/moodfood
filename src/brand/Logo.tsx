import type { CSSProperties } from 'react';

/**
 * The IPC lockup: the Dala horse mark plus the wordmark.
 *
 * The horse is drawn as a CSS mask over `public/brand/dala.svg`, so it takes
 * `color` from its parent and so that replacing that one file with IPC's real
 * artwork swaps the mark everywhere at once. The wordmark is live text in
 * --font-display, so it picks up IPC's real typeface the moment that font is
 * installed in brand.css.
 */
export function Logo({
  size = 56,
  showWordmark = true,
  style,
}: {
  size?: number;
  showWordmark?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.28,
        color: 'var(--red)',
        ...style,
      }}
    >
      <DalaMark size={size} />
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: size * 0.92,
            letterSpacing: '-0.03em',
            color: 'var(--cream)',
            lineHeight: 1,
          }}
        >
          IPC
        </span>
      )}
    </div>
  );
}

/** The horse on its own — used in the idle drift and the loading state. */
export function DalaMark({
  size = 56,
  style,
  className,
}: {
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const mask = {
    WebkitMaskImage: 'url(/brand/dala.svg)',
    maskImage: 'url(/brand/dala.svg)',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label="IPC Dala horse"
      className={className}
      style={{
        width: size * (240 / 200),
        height: size,
        background: 'currentColor',
        flex: 'none',
        ...mask,
        ...style,
      }}
    />
  );
}

import { useEffect, useState } from 'react';
import type { BackdropTint } from '../mood/moods';

/**
 * The background: IPC's artwork at public/brand/background.webp.
 *
 * This replaced a hand-written WebGL metaball shader once IPC supplied their
 * own background. Their art is the brand, and a static image is also far
 * cheaper — the shader was fragment-bound and could starve the main thread on
 * a weak kiosk GPU, which slowed every timer in the story.
 *
 * It still reacts. The reveal shifts the image's hue and saturation toward the
 * visitor's mood over a slow transition, so the background changing colour is
 * still the moment the mood lands. A very slow drift keeps it from reading as
 * a flat JPEG behind glass.
 */
export function Backdrop({ tint, intensity = 0 }: { tint: BackdropTint; intensity?: number }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/brand/background.webp';
    if (img.complete) setLoaded(true);
    else img.onload = () => setLoaded(true);
  }, []);

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--paper)' }}>
      <div
        className="backdrop-drift"
        style={{
          position: 'absolute',
          // Oversized so the slow drift never exposes an edge.
          inset: '-6%',
          backgroundImage: 'url(/brand/background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: loaded ? 1 : 0,
          filter: `hue-rotate(${tint.hue}deg) saturate(${tint.saturate + intensity * 0.35}) brightness(${tint.brightness})`,
          transition: 'filter 1600ms cubic-bezier(.4,0,.2,1), opacity 900ms ease',
          willChange: 'filter, transform',
        }}
      />
      {/* Softens the blob so dark text stays readable wherever it falls. The
          blob's core is #0008AB — without this, any line crossing it drops to
          about 1.5:1 and disappears. */}
      <div className="backdrop-veil" />
    </div>
  );
}

import type { MutableRefObject } from 'react';

/**
 * The live camera feed, as a circle.
 *
 * Mounted once by App and kept alive across warmup → exercises. If each scene
 * rendered its own <video>, React would tear down and re-create the element on
 * every transition, restarting the MediaStream and dropping a second of black
 * in the middle of the story.
 *
 * TWO iOS SAFARI WORKAROUNDS, both found on a real phone and neither
 * reproducible in headless Chromium:
 *
 * 1. The rounding is on the <video> ITSELF, not on a parent with
 *    `overflow: hidden`. This video carries `transform: scaleX(-1)`, which puts
 *    it in its own compositing layer, and iOS then ignores the parent's rounded
 *    clip — so it rendered as a hard square over the meter ring.
 * 2. Hidden state uses `visibility`, not just `opacity`. iOS composites video
 *    separately and does not reliably honour an opacity-0 ancestor, which left
 *    a stray disc of camera floating on the mood reveal.
 */
export function CameraView({
  videoRef,
  diameter,
  top,
  visible,
}: {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  diameter: number;
  top: number;
  visible: boolean;
}) {
  const move =
    'width 700ms cubic-bezier(.22,.9,.28,1), height 700ms cubic-bezier(.22,.9,.28,1), top 700ms cubic-bezier(.22,.9,.28,1), margin-left 700ms cubic-bezier(.22,.9,.28,1)';

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top,
        width: diameter,
        height: diameter,
        marginLeft: -diameter / 2,
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: `${move}, opacity 500ms ease, visibility 0s linear ${visible ? '0s' : '500ms'}`,
        pointerEvents: 'none',
        borderRadius: '50%',
        background: 'var(--paper-soft)',
        boxShadow: '0 0 0 3px rgba(255,255,255,.9), 0 40px 90px rgba(10,19,48,.22)',
        display: 'grid',
        placeItems: 'center',
        isolation: 'isolate',
      }}
    >
      {/* Sits under the video. Visible only while there is no stream — during
          ?mock=1 walkthroughs, or the moment before the camera wakes — so the
          circle is never just a hole in the screen. */}
      <div
        aria-hidden
        className="thinking"
        style={{
          position: 'absolute',
          width: diameter * 0.34,
          height: diameter * 0.34,
          borderRadius: '50%',
          border: '3px solid rgba(10,19,48,.12)',
        }}
      />

      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // The clip lives here rather than on the parent — see the note above.
          borderRadius: '50%',
          // Mirrored, so the kiosk behaves like a mirror rather than a stranger
          // looking back at you.
          transform: 'scaleX(-1)',
          display: 'block',
          position: 'relative',
        }}
      />
    </div>
  );
}

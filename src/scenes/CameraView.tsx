import type { MutableRefObject } from 'react';

const MOVE = 'cubic-bezier(.22,.9,.28,1)';

/**
 * The live camera feed, as a circle.
 *
 * Mounted once by App and kept alive across warmup → exercises. If each scene
 * rendered its own <video>, React would tear down and re-create the element on
 * every transition, restarting the MediaStream and dropping a second of black
 * in the middle of the story.
 *
 * THREE iOS SAFARI WORKAROUNDS, all found on a real phone and none of them
 * reproducible in headless Chromium:
 *
 * 1. The video is sized in EXPLICIT PIXELS, not `width/height: 100%`.
 *    Percentage heights do not reliably resolve against a grid item on iOS, so
 *    the video fell back to its intrinsic aspect ratio — and an iPhone front
 *    camera hands back a PORTRAIT 9:16 stream, which turned a 560px circle
 *    into a 560x996 ellipse overflowing its own container.
 * 2. The rounding is on the <video> ITSELF, not on a parent with
 *    `overflow: hidden`. The mirroring transform gives the video its own
 *    compositing layer, and iOS then ignores the parent's rounded clip, so it
 *    drew as a hard square over the meter ring.
 * 3. Hidden state uses `visibility`, not just `opacity`. iOS does not reliably
 *    honour an opacity-0 ancestor for video, which left a stray disc of live
 *    camera floating on the mood reveal.
 *
 * The through-line: do not let this element's size or clip depend on anything
 * inherited. State both outright.
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
  const resize = `width 700ms ${MOVE}, height 700ms ${MOVE}`;

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
        transition: `${resize}, top 700ms ${MOVE}, margin-left 700ms ${MOVE}, opacity 500ms ease, visibility 0s linear ${visible ? '0s' : '500ms'}`,
        pointerEvents: 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'var(--paper-soft)',
        boxShadow: '0 0 0 3px rgba(255,255,255,.9), 0 40px 90px rgba(10,19,48,.22)',
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
          left: '50%',
          top: '50%',
          width: diameter * 0.34,
          height: diameter * 0.34,
          marginLeft: -diameter * 0.17,
          marginTop: -diameter * 0.17,
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
          // Explicit pixels and absolute placement: the box must not be able to
          // pick up the stream's own aspect ratio. See note 1 above.
          position: 'absolute',
          left: 0,
          top: 0,
          width: diameter,
          height: diameter,
          objectFit: 'cover',
          // The clip lives here rather than on the parent. See note 2 above.
          borderRadius: '50%',
          // Mirrored, so the kiosk behaves like a mirror rather than a stranger
          // looking back at you.
          transform: 'scaleX(-1)',
          transition: resize,
          display: 'block',
        }}
      />
    </div>
  );
}

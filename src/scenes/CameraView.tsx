import type { MutableRefObject } from 'react';

/**
 * The live camera feed, masked into a slowly morphing blob.
 *
 * Mounted once by App and kept alive across warmup → smile → capture. If each
 * scene rendered its own <video>, React would tear down and re-create the
 * element on every transition, which restarts the MediaStream and drops a
 * second of black right in the middle of the story.
 */
export function CameraView({
  videoRef,
  diameter,
  top,
  visible,
  dim = false,
}: {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  diameter: number;
  top: number;
  visible: boolean;
  dim?: boolean;
}) {
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
        transition: 'width 700ms cubic-bezier(.22,.9,.28,1), height 700ms cubic-bezier(.22,.9,.28,1), top 700ms cubic-bezier(.22,.9,.28,1), margin-left 700ms cubic-bezier(.22,.9,.28,1), opacity 500ms ease',
        pointerEvents: 'none',
      }}
    >
      <div
        className="blob"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'var(--ink-soft)',
          boxShadow: '0 0 0 3px rgba(242,246,255,.16), 0 50px 120px rgba(0,0,0,.6)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
        }}
      >
        {/* Sits under the video. Visible only while there is no stream —
            during ?mock=1 walkthroughs, or the moment before the camera
            wakes — so the blob is never just a hole in the screen. */}
        <div
          aria-hidden
          className="thinking"
          style={{
            position: 'absolute',
            width: diameter * 0.34,
            height: diameter * 0.34,
            borderRadius: '50%',
            border: '3px solid rgba(242,246,255,.14)',
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
            // Mirrored, so the kiosk behaves like a mirror rather than a
            // stranger looking back at you.
            transform: 'scaleX(-1)',
            filter: dim ? 'brightness(.55) saturate(.8)' : 'none',
            transition: 'filter 500ms ease',
            display: 'block',
            position: 'relative',
          }}
        />
      </div>
    </div>
  );
}

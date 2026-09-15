/**
 * The photo, in a slightly crooked polaroid.
 *
 * The tilt is deliberate: a perfectly square photo reads as a security camera
 * still, which is exactly the wrong feeling for a machine that just asked you
 * to smile. Three degrees makes it a keepsake instead.
 */
export function Polaroid({
  src,
  caption,
  width = 520,
  tilt = -3,
}: {
  src: string | null;
  caption?: string;
  width?: number;
  tilt?: number;
}) {
  const photoHeight = width * 1.25;

  return (
    <div
      style={{
        width,
        padding: width * 0.055,
        paddingBottom: caption ? width * 0.18 : width * 0.055,
        background: 'var(--paper)',
        borderRadius: 10,
        transform: `rotate(${tilt}deg)`,
        boxShadow: '0 34px 70px rgba(10,19,48,.20), 0 2px 6px rgba(10,19,48,.10)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: photoHeight,
          background: 'var(--paper-soft)',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {src ? (
          <img
            src={src}
            alt="Your photo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span style={{ color: 'var(--ink-faint)', fontSize: 26 }}>no photo</span>
        )}
      </div>

      {caption && (
        <div
          className="no-shadow"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: width * 0.045,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--w-display-strong)',
            fontSize: width * 0.078,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

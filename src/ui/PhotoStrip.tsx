/**
 * The four exercise photos, as a photo-booth strip.
 *
 * This is the proof. Anyone can be told a machine was watching them; a strip
 * of their own four faces is the thing they actually believe — and the thing
 * they turn round and show the person they came with.
 *
 * Laid out as a 2x2 rather than a vertical strip because the reveal screen
 * also has to carry a mood word and a line of copy on a 1920px-tall panel.
 */
export function PhotoStrip({
  shots,
  width = 520,
}: {
  shots: (string | null)[];
  width?: number;
}) {
  const frames = shots.slice(0, 4);
  while (frames.length < 4) frames.push(null);

  const pad = width * 0.035;
  const cell = (width - pad * 3) / 2;

  return (
    <div
      style={{
        width,
        padding: pad,
        paddingBottom: pad * 2.6,
        background: '#FFFFFF',
        borderRadius: 12,
        transform: 'rotate(-2deg)',
        boxShadow: '0 34px 70px rgba(10,19,48,.20), 0 2px 6px rgba(10,19,48,.10)',
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${cell}px)`,
        gap: pad,
        position: 'relative',
      }}
    >
      {frames.map((src, i) => (
        <div
          key={i}
          style={{
            width: cell,
            height: cell * 1.15,
            background: 'var(--paper-soft)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {src && (
            <img
              src={src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const SIZE = 700;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The ring that fills as you smile.
 *
 * This is the one moment the kiosk gives live, continuous feedback on a face —
 * you move your mouth and the screen reacts in the same instant. It is the
 * beat that convinces people the camera is genuinely looking, so it is worth
 * the extra polish: the ring colour warms as it fills, and the whole thing
 * pulses when it crosses the line.
 */
export function SmileMeter({
  value,
  target,
  holding,
}: {
  /** Live smile score, 0..1. */
  value: number;
  /** The score that has to be held to pass. */
  target: number;
  /** True while the visitor is above target and the hold timer is running. */
  holding: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const dash = CIRCUMFERENCE * clamped;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{
        transform: `rotate(-90deg) scale(${holding ? 1.04 : 1})`,
        transition: 'transform 320ms cubic-bezier(.2,.9,.3,1.4)',
        filter: holding ? 'drop-shadow(0 0 40px rgba(255,176,59,.55))' : 'none',
      }}
      aria-hidden
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(255,244,230,.14)"
        strokeWidth={STROKE}
      />
      {/* The bar the visitor has to clear. */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(255,244,230,.34)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`3 ${CIRCUMFERENCE}`}
        strokeDashoffset={-CIRCUMFERENCE * target}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={clamped > target ? 'var(--amber)' : 'var(--rose)'}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
        style={{ transition: 'stroke-dasharray 90ms linear, stroke 300ms ease' }}
      />
    </svg>
  );
}

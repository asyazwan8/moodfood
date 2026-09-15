/**
 * The "press" affordance. A kiosk visitor has about a second to work out that
 * the screen wants to be touched, so this sits at the bottom of every scene
 * that waits on a press, breathing gently.
 *
 * It only appears once the kiosk has finished saying its piece — prompting
 * someone to tap while a sentence is still typing makes them skip the line.
 */
export function PressCue({ label = 'Touch anywhere', show = true }: { label?: string; show?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 96,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        opacity: show ? 1 : 0,
        transition: 'opacity 700ms ease',
        pointerEvents: 'none',
      }}
    >
      <div className="press-ring" />
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 30,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ink-dim)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

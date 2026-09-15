import { Logo } from '../brand/Logo';
import { PressCue } from '../ui/PressCue';
import { FOOD, pickFrom } from '../story/script';
import type { Outlet } from '../data/ipcFood';

/**
 * The payoff — and the commercial point of the whole thing.
 *
 * Everything before this was building enough goodwill that a stranger will
 * actually walk to the restaurant named on this card. So it leads with the
 * DISH, not the brand: "quarter chicken, hot" is a thing you can want, while
 * a logo is a thing you scroll past.
 */
export function FoodPick({
  outlet,
  seed,
  blind,
  canSwap,
  onSwap,
}: {
  outlet: Outlet;
  seed: number;
  /** True when the camera was refused and we never actually read a face. */
  blind: boolean;
  canSwap: boolean;
  onSwap: () => void;
}) {
  return (
    <div className="scene">
      <Logo size={96} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--w-display-strong)',
            fontSize: 54,
            letterSpacing: '-0.03em',
            color: 'var(--magenta)',
          }}
        >
          {blind ? 'Cannot read you — but I can still feed you.' : pickFrom(FOOD.intro, seed)}
        </p>

        <div
          className="rise"
          style={{
            background: 'rgba(255,255,255,.72)',
            border: '1px solid rgba(10,19,48,.08)',
            boxShadow: '0 30px 80px rgba(10,19,48,.10)',
            borderRadius: 'var(--r-lg)',
            padding: 56,
            backdropFilter: 'blur(26px)',
            WebkitBackdropFilter: 'blur(26px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
          }}
        >
          <span style={{ fontSize: 30, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
            {outlet.cuisine}
          </span>

          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--w-display)',
              fontSize: 78,
              lineHeight: 1.04,
              letterSpacing: '-0.04em',
            }}
          >
            {outlet.dish}
          </h2>

          <p style={{ margin: 0, fontSize: 38, lineHeight: 1.45, color: 'var(--ink-dim)' }}>{outlet.why}</p>

          <div style={{ height: 2, background: 'rgba(242,246,255,.14)', margin: '6px 0' }} />

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--w-display)',
                fontSize: 54,
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
              }}
            >
              {outlet.name}
            </span>
            <span style={{ fontSize: 34, color: 'var(--magenta)', fontWeight: 'var(--w-label)' }}>
              {outlet.lot ? `${outlet.where} · ${outlet.lot}` : outlet.where}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, minHeight: 92 }}>
          {canSwap ? (
            <>
              <span style={{ fontSize: 32, color: 'var(--ink-faint)' }}>{FOOD.again}</span>
              <button data-stop-press onClick={onSwap} style={swapButton}>
                {FOOD.againCta}
              </button>
            </>
          ) : (
            <span style={{ fontSize: 30, color: 'var(--ink-faint)' }}>{FOOD.exhausted}</span>
          )}
        </div>
      </div>

      <PressCue label="Touch anywhere to finish" />
    </div>
  );
}

const swapButton: React.CSSProperties = {
  appearance: 'none',
  border: '1px solid rgba(10,19,48,.22)',
  background: 'transparent',
  color: 'var(--ink)',
  borderRadius: 'var(--r-pill)',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--w-label)',
  fontSize: 32,
  padding: '20px 38px',
  cursor: 'pointer',
};

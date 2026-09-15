import { Logo } from '../brand/Logo';
import { CONSENT } from '../story/script';
import type { CameraState } from '../vision/useVision';

/**
 * The camera ask.
 *
 * A camera in a public mall is a real obligation, not a checkbox — so this is
 * a deliberate stop in the story rather than a permission dialog the visitor
 * dismisses. The privacy line is stated plainly and it is true: nothing is
 * stored, nothing is transmitted, and useVision drops the frames on the way
 * back to idle.
 */
export function Consent({
  cameraState,
  errorMessage,
  onAccept,
  onSkip,
}: {
  cameraState: CameraState;
  errorMessage: string | null;
  onAccept: () => void;
  onSkip: () => void;
}) {
  const refused = cameraState === 'denied' || cameraState === 'error';

  return (
    <div className="scene">
      <Logo size={96} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 44 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--w-display)',
            fontSize: 96,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            maxWidth: 860,
          }}
        >
          {refused ? CONSENT.denied.title : CONSENT.title}
        </h2>

        {refused ? (
          <>
            <p style={bodyStyle}>{CONSENT.denied.body}</p>
            {errorMessage && (
              <p style={{ ...bodyStyle, fontSize: 30, color: 'var(--ink-faint)' }}>{errorMessage}</p>
            )}
          </>
        ) : (
          CONSENT.body.map((line) => (
            <p key={line} style={bodyStyle}>
              {line}
            </p>
          ))
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>
        <button
          data-stop-press
          onClick={refused ? onSkip : onAccept}
          disabled={cameraState === 'requesting'}
          style={primaryButton}
        >
          {cameraState === 'requesting'
            ? 'Waking the camera…'
            : refused
              ? CONSENT.denied.cta
              : CONSENT.cta}
        </button>

        {!refused && (
          <button data-stop-press onClick={onSkip} style={secondaryButton}>
            {CONSENT.bail}
          </button>
        )}
      </div>
    </div>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 42,
  lineHeight: 1.5,
  color: 'var(--ink-dim)',
  maxWidth: 840,
};

const primaryButton: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  borderRadius: 'var(--r-pill)',
  background: 'var(--blue)',
  color: 'var(--paper)',
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--w-display)',
  fontSize: 46,
  padding: '42px 56px',
  cursor: 'pointer',
  letterSpacing: '-0.02em',
};

const secondaryButton: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  background: 'transparent',
  color: 'var(--ink-faint)',
  fontFamily: 'var(--font-body)',
  fontSize: 32,
  padding: 18,
  cursor: 'pointer',
};

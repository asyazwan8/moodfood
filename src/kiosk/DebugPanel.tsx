import { SCENES, type SceneId, type Session } from '../story/machine';
import type { VisionState } from '../vision/useVision';

/**
 * On-site diagnostics. Opened with ?debug=1 or a three-second long-press in the
 * top-left corner — because when this misbehaves it will be on a mall floor
 * with no keyboard, no console and a queue forming.
 *
 * The expression read-out is the useful part: if the mood is coming out wrong
 * you can watch the raw probabilities against a real face and see whether the
 * classifier or the lighting is at fault.
 */
export function DebugPanel({
  scene,
  session,
  vision,
  smileTarget,
  onJump,
  onReset,
  onClose,
}: {
  scene: SceneId;
  session: Session;
  vision: VisionState;
  smileTarget: number;
  onJump: (scene: SceneId) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const expressions = Object.entries(vision.expressions).sort((a, b) => b[1] - a[1]);

  return (
    <div data-stop-press style={panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase' }}>debug</strong>
        <button onClick={onClose} style={miniButton}>
          close
        </button>
      </div>

      <Row label="scene" value={scene} />
      <Row label="camera" value={vision.cameraState} />
      <Row label="models" value={vision.modelsReady ? 'ready' : 'loading'} />
      <Row label="face" value={vision.faceFound ? 'found' : '—'} />
      <Row label="mood" value={session.mood ?? '—'} />
      <Row label="daypart" value={session.daypart} />
      {vision.errorMessage && <Row label="error" value={vision.errorMessage} />}

      <div style={{ margin: '12px 0 6px', opacity: 0.6, fontSize: 11 }}>
        smile {vision.smile.toFixed(2)} / target {smileTarget}
      </div>
      <div style={{ height: 6, background: '#333', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
        <div
          style={{
            width: `${Math.min(100, vision.smile * 100)}%`,
            height: '100%',
            background: vision.smile >= smileTarget ? '#7CFF9B' : '#FFB03B',
          }}
        />
      </div>

      {expressions.map(([name, value]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 74, opacity: 0.7 }}>{name}</span>
          <div style={{ flex: 1, height: 4, background: '#333', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${value * 100}%`, height: '100%', background: '#8B5CF6' }} />
          </div>
          <span style={{ width: 34, textAlign: 'right', opacity: 0.7 }}>{value.toFixed(2)}</span>
        </div>
      ))}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
        {SCENES.map((id) => (
          <button key={id} onClick={() => onJump(id)} style={{ ...miniButton, opacity: id === scene ? 1 : 0.55 }}>
            {id}
          </button>
        ))}
      </div>

      <button onClick={onReset} style={{ ...miniButton, width: '100%', marginTop: 8 }}>
        reset to idle
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 2 }}>
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const panel: React.CSSProperties = {
  position: 'fixed',
  right: 12,
  top: 12,
  width: 300,
  padding: 14,
  background: 'rgba(10,6,16,.92)',
  border: '1px solid rgba(255,255,255,.16)',
  borderRadius: 12,
  color: '#fff',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  lineHeight: 1.5,
  zIndex: 1000,
  backdropFilter: 'blur(12px)',
};

const miniButton: React.CSSProperties = {
  appearance: 'none',
  border: '1px solid rgba(255,255,255,.2)',
  background: 'rgba(255,255,255,.06)',
  color: '#fff',
  borderRadius: 6,
  fontSize: 11,
  padding: '4px 8px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

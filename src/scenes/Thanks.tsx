import { Logo } from '../brand/Logo';
import { QrCode } from '../ui/QrCode';
import { THANKS } from '../story/script';

/** Where the kiosk hands you back to the mall. */
const IPC_DIRECTORY = 'https://www.ipc.com.my/store-guide/a-z-directory/';

export function Thanks() {
  return (
    <div className="scene">
      <Logo size={96} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--w-display)',
            fontSize: 92,
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
            textAlign: 'center',
            maxWidth: 880,
          }}
        >
          {THANKS.title}
        </h2>

        {THANKS.body.map((line) => (
          <p
            key={line}
            style={{ margin: 0, fontSize: 42, lineHeight: 1.4, color: 'var(--ink-dim)', textAlign: 'center', maxWidth: 800 }}
          >
            {line}
          </p>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 20 }}>
          <div style={{ padding: 18, background: '#FFFFFF', borderRadius: 'var(--r-md)', boxShadow: '0 20px 50px rgba(10,19,48,.14)' }}>
            <QrCode value={IPC_DIRECTORY} size={240} />
          </div>
          <span style={{ fontSize: 30, color: 'var(--ink-dim)', letterSpacing: '0.06em' }}>
            {THANKS.qrCaption}
          </span>
        </div>
      </div>

      <p style={{ margin: 0, textAlign: 'center', fontSize: 28, color: 'var(--ink-faint)', paddingBottom: 30 }}>
        {THANKS.footer}
      </p>
    </div>
  );
}

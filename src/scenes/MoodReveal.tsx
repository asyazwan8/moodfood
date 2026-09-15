import { Logo } from '../brand/Logo';
import { Polaroid } from '../ui/Polaroid';
import { PressCue } from '../ui/PressCue';
import { MOOD_INTRO } from '../story/script';
import { MOODS, type MoodId } from '../mood/moods';

/** The reveal: the photo, the word, and one line saying what we think we saw. */
export function MoodReveal({ mood, photo }: { mood: MoodId; photo: string | null }) {
  const m = MOODS[mood];

  return (
    <div className="scene">
      <Logo size={96} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 56 }}>
        <p style={{ margin: 0, fontSize: 34, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
          {MOOD_INTRO}
        </p>

        <Polaroid src={photo} width={470} tilt={-3} />

        <h1
          className="mood-word"
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--w-display)',
            // The mood words are not all the same length — "Bright" and
            // "Running on empty" have to sit on the same screen — so the size
            // steps down for the long ones instead of wrapping awkwardly.
            fontSize: m.word.length > 10 ? 104 : 168,
            lineHeight: 0.96,
            letterSpacing: '-0.05em',
            color: 'var(--blue)',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          {m.word}
        </h1>

        <p
          className="rise"
          style={{
            margin: 0,
            fontSize: 40,
            lineHeight: 1.45,
            color: 'var(--ink-dim)',
            textAlign: 'center',
            maxWidth: 820,
          }}
        >
          {m.read}
        </p>
      </div>

      <PressCue />
    </div>
  );
}

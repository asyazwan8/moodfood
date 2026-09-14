import { useEffect, useRef, useState } from 'react';

const REDUCED = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Types text out a character at a time.
 *
 * This is the single biggest reason the kiosk reads as "something is talking to
 * me" rather than "a screen showed me some text". The pause on punctuation
 * matters more than the speed does — it is what gives the voice a breath.
 */
export function Typewriter({
  text,
  speed = 28,
  delay = 0,
  onDone,
  className,
  style,
}: {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  delay?: number;
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (REDUCED()) {
      setShown(text.length);
      const t = window.setTimeout(() => doneRef.current?.(), delay + 200);
      return () => window.clearTimeout(t);
    }

    setShown(0);
    let index = 0;
    let timer = 0;

    const step = () => {
      index += 1;
      setShown(index);
      if (index >= text.length) {
        timer = window.setTimeout(() => doneRef.current?.(), 260);
        return;
      }
      timer = window.setTimeout(step, pauseAfter(text[index - 1], speed));
    };

    timer = window.setTimeout(step, delay);
    return () => window.clearTimeout(timer);
  }, [text, speed, delay]);

  return (
    <span className={className} style={style}>
      {text.slice(0, shown)}
      {/* Zero-width placeholder keeps the line from reflowing as it fills. */}
      <span style={{ opacity: 0 }}>{text.slice(shown)}</span>
    </span>
  );
}

/** A beat after a full stop, a shorter one after a comma. Like breathing. */
function pauseAfter(char: string | undefined, speed: number): number {
  if (char === '.' || char === '?' || char === '!') return speed * 11;
  if (char === ',' || char === '—' || char === ';') return speed * 6;
  return speed;
}

/**
 * Types several lines one after another, then reports done. Used wherever the
 * kiosk says more than one sentence in a row.
 */
export function TypedLines({
  lines,
  speed = 26,
  onDone,
  className,
  style,
  gap = 22,
}: {
  lines: string[];
  speed?: number;
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
  gap?: number;
}) {
  const [visible, setVisible] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => setVisible(0), [lines]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {lines.map((line, i) =>
        i <= visible ? (
          <Typewriter
            key={`${i}-${line}`}
            text={line}
            speed={speed}
            className={className}
            style={style}
            onDone={() => {
              if (i === visible) {
                if (i + 1 < lines.length) setVisible(i + 1);
                else doneRef.current?.();
              }
            }}
          />
        ) : null,
      )}
    </div>
  );
}

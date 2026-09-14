import type { MoodId } from './moods';

/** The seven probabilities face-api's expression model returns, 0..1. */
export type Expressions = {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
};

export const EMPTY_EXPRESSIONS: Expressions = {
  neutral: 0,
  happy: 0,
  sad: 0,
  angry: 0,
  fearful: 0,
  disgusted: 0,
  surprised: 0,
};

export type Daypart = 'morning' | 'afternoon' | 'evening' | 'latenight';

export function daypartFor(date = new Date()): Daypart {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'latenight';
}

/**
 * Turn an averaged expression read into a mood.
 *
 * IMPORTANT: the expressions passed here are sampled during `warmup`, while the
 * visitor is just reading the screen — BEFORE we ask them to smile. If we
 * classified after the smile gate every single visitor would come out "Bright"
 * and the reveal would mean nothing. The smile is a ritual, not a measurement.
 *
 * Time of day is folded in because the same flat face reads very differently at
 * 10am and at 8pm: neutral in the morning is composed, neutral at the end of a
 * long evening is spent.
 */
export function classifyMood(expr: Expressions, daypart: Daypart = daypartFor()): MoodId {
  const entries = Object.entries(expr) as [keyof Expressions, number][];
  let dominant: keyof Expressions = 'neutral';
  let peak = -1;
  for (const [key, value] of entries) {
    if (value > peak) {
      peak = value;
      dominant = key;
    }
  }

  // A weak read is not a sad read. If the model is not confident about
  // anything, treat it as level rather than inventing drama.
  if (peak < 0.3) return tired(daypart, expr.happy) ? 'drifting' : 'steady';

  switch (dominant) {
    case 'happy':
      return expr.happy > 0.8 ? 'bright' : 'warm';
    case 'sad':
      return 'heavy';
    case 'angry':
      return 'fired';
    case 'surprised':
      return 'sparked';
    case 'fearful':
      return 'wound';
    case 'disgusted':
      return 'over';
    case 'neutral':
      return tired(daypart, expr.happy) ? 'drifting' : 'steady';
  }
}

/** Flat face + late in the day + no warmth behind it reads as spent, not calm. */
function tired(daypart: Daypart, happy: number): boolean {
  return (daypart === 'evening' || daypart === 'latenight') && happy < 0.15;
}

/**
 * Running average over the candid sampling window. Weighting every frame
 * equally keeps one odd blink from swinging the whole read.
 */
export function averageExpressions(samples: Expressions[]): Expressions {
  if (samples.length === 0) return { ...EMPTY_EXPRESSIONS };
  const total = { ...EMPTY_EXPRESSIONS };
  for (const sample of samples) {
    total.neutral += sample.neutral;
    total.happy += sample.happy;
    total.sad += sample.sad;
    total.angry += sample.angry;
    total.fearful += sample.fearful;
    total.disgusted += sample.disgusted;
    total.surprised += sample.surprised;
  }
  const n = samples.length;
  return {
    neutral: total.neutral / n,
    happy: total.happy / n,
    sad: total.sad / n,
    angry: total.angry / n,
    fearful: total.fearful / n,
    disgusted: total.disgusted / n,
    surprised: total.surprised / n,
  };
}

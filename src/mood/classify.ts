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

/** The channel an exercise is scored against. */
export type Channel = keyof Expressions;

export type Exercise = {
  id: string;
  /** Which expression probability this round watches. */
  channel: Channel;
  /**
   * The score that counts as "done".
   *
   * These are NOT equal across channels, and that is the whole point.
   * face-api reads `happy` superbly and `angry`/`sad` badly — a genuinely
   * furious face often peaks around 0.35. Holding every round to the same
   * number would make the angry and sad rounds impossible and the smile round
   * trivial. TUNE THESE AGAINST REAL FACES with ?debug=1 before demoing.
   */
  threshold: number;
  /** The mood awarded if this is the face that came easiest. */
  mood: MoodId;
};

export const EXERCISES: Exercise[] = [
  { id: 'smile', channel: 'happy', threshold: 0.5, mood: 'warm' },
  { id: 'angry', channel: 'angry', threshold: 0.3, mood: 'fired' },
  { id: 'sad', channel: 'sad', threshold: 0.25, mood: 'heavy' },
  { id: 'laugh', channel: 'happy', threshold: 0.85, mood: 'bright' },
];

/** How long a game round runs before the kiosk says "close enough". */
export const ROUND_TIMEOUT_MS = 8000;

/** How long the open read watches before taking whatever it has. */
export const READ_WINDOW_MS = 5000;

export type Attempt = {
  exerciseId: string;
  /** Highest value the channel reached during the round. */
  peak: number;
  /** ms taken to cross the threshold, or null if it never did. */
  timeToHit: number | null;
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
 * How readily a face arrived during the GAME. 1.0 means "hit the threshold
 * instantly". This is the game's score — it no longer decides the mood.
 *
 * Scored RELATIVE TO THE ROUND'S OWN THRESHOLD, because the raw numbers are
 * not comparable: `happy` routinely peaks near 1.0 while `angry` struggles
 * past 0.4. And strength is CAPPED AT 1.0 — clearing the bar is clearing it,
 * so a huge laugh does not score more on the easy smile round than on the
 * hard laugh round.
 */
export function easeOf(attempt: Attempt, exercise: Exercise): number {
  const strength = Math.min(attempt.peak / exercise.threshold, 1);

  // A miss can never score more than MISS_CEILING, and a hit can never score
  // less than SLOWEST_HIT. Those two bands must not overlap, or a near miss
  // outscores a slow but genuine hit — which it did, 24 to 15, until the
  // floor was raised. In a game, reaching the target always wins.
  if (attempt.timeToHit === null) return strength * MISS_CEILING;

  // A hit means peak >= threshold, so strength is exactly 1 here.
  const speed = clamp(1 - attempt.timeToHit / ROUND_TIMEOUT_MS, SLOWEST_HIT, 1);
  return strength * speed;
}

/** The most a round can score without ever reaching its threshold. */
const MISS_CEILING = 0.25;
/** The least a round can score having reached it. Must exceed MISS_CEILING. */
const SLOWEST_HIT = 0.3;

/** The game's per-round score, 0-100. */
export function scoreOf(attempt: Attempt, exercise: Exercise): number {
  return Math.round(Math.min(easeOf(attempt, exercise), 1) * 100);
}

/** The six channels the read considers. `neutral` is deliberately absent. */
export const READ_CHANNELS = [
  'happy',
  'sad',
  'angry',
  'surprised',
  'fearful',
  'disgusted',
] as const satisfies readonly Channel[];

/**
 * Below this, the strongest channel is noise rather than an expression.
 *
 * It matters more than it looks: a resting face idles with `sad` around 0.1
 * and it is frequently the largest non-neutral channel, so without a floor the
 * kiosk would tell people standing perfectly still that they are Carrying
 * something.
 */
const READ_FLOOR = 0.25;

/** A smile this big is not a smile any more. */
const BEAMING = 0.8;

/**
 * The mood, from the one open read.
 *
 * The visitor is asked to show how they feel and picks the expression
 * themselves, so this is a straight argmax over the six real emotions — no
 * cross-channel comparison problem, because nothing is competing against a
 * different question.
 *
 * `neutral` is excluded on purpose. It dominates every resting face, and
 * letting it compete is exactly what made an earlier version answer "Steady"
 * to virtually everybody.
 */
export function moodFromRead(peaks: Expressions, daypart: Daypart = daypartFor()): MoodId {
  let best: Channel = 'happy';
  let top = -1;
  for (const channel of READ_CHANNELS) {
    if (peaks[channel] > top) {
      top = peaks[channel];
      best = channel;
    }
  }

  // Showed us nothing. Not a failure — a face that gives nothing away is its
  // own kind of read, and late in the day it means something different.
  if (top < READ_FLOOR) return tired(daypart) ? 'drifting' : 'steady';

  switch (best) {
    case 'happy':
      return top >= BEAMING ? 'bright' : 'warm';
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
    default:
      return tired(daypart) ? 'drifting' : 'steady';
  }
}

/** Late in the day, a face with nothing in it reads as spent, not composed. */
function tired(daypart: Daypart): boolean {
  return daypart === 'evening' || daypart === 'latenight';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

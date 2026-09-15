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

/** How long a round runs before the kiosk says "close enough" and moves on. */
export const ROUND_TIMEOUT_MS = 8000;

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

/** Did the round actually reach its threshold? */
export function wasHit(attempt: Attempt): boolean {
  return attempt.timeToHit !== null;
}

/**
 * How readily a face arrived. 1.0 means "hit the threshold instantly".
 *
 * Two things here are load-bearing:
 *
 * Scored RELATIVE TO THE ROUND'S OWN THRESHOLD, because the raw numbers are
 * not comparable: `happy` routinely peaks near 1.0 while `angry` struggles
 * past 0.4. Comparing raw peaks would hand the win to the smile round every
 * time, and the kiosk would be back to giving everyone the same answer.
 *
 * And strength is CAPPED AT 1.0 — clearing the bar is clearing it, and
 * clearing it by more earns nothing. Without the cap the easiest round wins
 * automatically: a proper laugh registers about 0.95 happy, which is 1.9x the
 * smile threshold but only 1.1x the laugh threshold, so the person would be
 * told they were merely "Warm" for laughing their head off.
 */
export function easeOf(attempt: Attempt, exercise: Exercise): number {
  const strength = Math.min(attempt.peak / exercise.threshold, 1);
  if (!wasHit(attempt)) return strength * 0.25;
  const speed = clamp(1 - (attempt.timeToHit ?? 0) / ROUND_TIMEOUT_MS, 0.15, 1);
  return strength * speed;
}

/**
 * Drops rounds that a harder round on the same channel has already beaten.
 *
 * Smile and laugh are both `happy`, just at different thresholds. If someone
 * reached the laugh threshold then they necessarily sailed through the smile
 * one, and the laugh is the stronger claim about them — so the smile result
 * carries no information and must not compete.
 */
function dropSuperseded(attempts: Attempt[]): Attempt[] {
  return attempts.filter((attempt) => {
    const mine = EXERCISES.find((e) => e.id === attempt.exerciseId);
    if (!mine) return false;
    return !attempts.some((other) => {
      const theirs = EXERCISES.find((e) => e.id === other.exerciseId);
      return (
        theirs &&
        theirs.channel === mine.channel &&
        theirs.threshold > mine.threshold &&
        wasHit(other)
      );
    });
  });
}

/** A miss this close counts — face-api is strict, the visitor clearly tried. */
const NEAR_MISS = 0.7;

/**
 * Decides the mood from the four rounds.
 *
 * The primary read is "which face came easiest" — the one that was already
 * loaded and ready. Before that, three secondary signals get a look in, since
 * they are strong enough to mean something on their own and they keep the
 * moods the rounds cannot reach from going dead.
 */
export function moodFromExercises(
  attempts: Attempt[],
  peaks: Expressions,
  daypart: Daypart = daypartFor(),
): MoodId {
  // Secondary signals first. Someone who spent the whole sequence visibly
  // startled is telling us more than which face they performed best.
  if (peaks.surprised > 0.45) return 'sparked';
  if (peaks.fearful > 0.4) return 'wound';
  if (peaks.disgusted > 0.4) return 'over';

  const live = dropSuperseded(attempts);
  const scored = live.flatMap((attempt) => {
    const exercise = EXERCISES.find((e) => e.id === attempt.exerciseId);
    return exercise ? [{ attempt, exercise, ease: easeOf(attempt, exercise) }] : [];
  });

  // A round that was actually reached always beats one that was not, however
  // close the near miss came.
  const hits = scored.filter((entry) => wasHit(entry.attempt));
  if (hits.length > 0) {
    return hits.reduce((a, b) => (b.ease > a.ease ? b : a)).exercise.mood;
  }

  // Nothing was reached. If one came genuinely close, take it — face-api is
  // strict about angry and sad, and someone straining to look furious should
  // not be told they are Steady.
  const near = scored
    .filter((entry) => entry.attempt.peak / entry.exercise.threshold >= NEAR_MISS)
    .sort((a, b) => b.ease - a.ease)[0];
  if (near) return near.exercise.mood;

  // A face that gives nothing away is its own kind of read, and late in the
  // day it means something different.
  return tired(daypart) ? 'drifting' : 'steady';
}

/** Late in the day, a face with nothing in it reads as spent, not composed. */
function tired(daypart: Daypart): boolean {
  return daypart === 'evening' || daypart === 'latenight';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

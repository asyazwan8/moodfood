import { OUTLETS, type Outlet } from '../data/ipcFood';
import type { Daypart } from '../mood/classify';
import { MOODS, type MoodId } from '../mood/moods';

/**
 * Picks where to send someone.
 *
 * Scored rather than filtered: a hard filter on daypart would leave some moods
 * with two options at 9pm, and a kiosk that recommends the same nasi lemak to
 * every visitor all evening stops feeling like it is talking to anyone. So
 * daypart is a strong nudge, not a gate.
 */
export function rankOutlets(mood: MoodId, daypart: Daypart): Outlet[] {
  const craves = MOODS[mood].craves;

  return OUTLETS.map((outlet) => {
    const matches = outlet.craves.filter((tag) => craves.includes(tag)).length;

    // Earlier entries in `craves` matter more — they are the mood's primary
    // hunger, the rest are acceptable substitutes.
    const weighted = outlet.craves.reduce((sum, tag) => {
      const rank = craves.indexOf(tag);
      return rank === -1 ? sum : sum + (craves.length - rank);
    }, 0);

    const fitsTime = outlet.dayparts.includes(daypart) ? 6 : 0;

    return { outlet, score: matches * 2 + weighted + fitsTime };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.outlet);
}

/**
 * The session's shortlist: the best match first, then a couple of alternates
 * behind the "something else?" press.
 *
 * The top few are shuffled within a small band so that two people in the same
 * mood at the same time of day do not watch each other get the identical
 * answer — which, standing side by side at a kiosk, instantly breaks the
 * illusion that it is reading anyone at all.
 */
export function pickFood(mood: MoodId, daypart: Daypart, count = 4): Outlet[] {
  const ranked = rankOutlets(mood, daypart);
  if (ranked.length === 0) return OUTLETS.slice(0, count);

  const band = ranked.slice(0, Math.min(ranked.length, count + 3));
  return shuffle(band).slice(0, count);
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

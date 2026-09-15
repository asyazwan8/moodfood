/**
 * Tests for the mood read and the game's scoring.
 *
 * Run with `npm test`. The read is the whole product — if it is wrong the
 * kiosk goes back to telling everyone the same thing, which is the bug this
 * design replaced. Several cases below are regressions caught here and
 * nowhere else.
 */
import {
  EXERCISES,
  EMPTY_EXPRESSIONS,
  moodFromRead,
  scoreOf,
  type Expressions,
} from './classify.ts';

const ok = (label: string, got: unknown, want: unknown) => {
  const pass = got === want;
  console.log(`${pass ? '  ✓' : '  ✗'} ${label} → ${got}${pass ? '' : `  (wanted ${want})`}`);
  if (!pass) process.exitCode = 1;
};

/** Peaks for a read, with everything unmentioned left at zero. */
const read = (p: Partial<Expressions>): Expressions => ({ ...EMPTY_EXPRESSIONS, ...p });
const day = 'afternoon' as const;

console.log('\nthe six channels each reach their own mood:');
ok('big smile → bright', moodFromRead(read({ happy: 0.94 }), day), 'bright');
ok('small smile → warm', moodFromRead(read({ happy: 0.55 }), day), 'warm');
ok('sad → heavy', moodFromRead(read({ sad: 0.6 }), day), 'heavy');
ok('angry → fired', moodFromRead(read({ angry: 0.45 }), day), 'fired');
ok('surprised → sparked', moodFromRead(read({ surprised: 0.7 }), day), 'sparked');
ok('fearful → wound', moodFromRead(read({ fearful: 0.5 }), day), 'wound');
ok('disgusted → over', moodFromRead(read({ disgusted: 0.5 }), day), 'over');

console.log('\nthe happy split:');
ok('0.79 is still warm', moodFromRead(read({ happy: 0.79 }), day), 'warm');
ok('0.80 is bright', moodFromRead(read({ happy: 0.8 }), day), 'bright');

console.log('\nneutral must never win (this was the original bug):');
// A resting face is overwhelmingly neutral. If neutral competed, it would win
// every single time and every visitor would be told the same thing.
ok('huge neutral does not suppress a real smile',
  moodFromRead(read({ neutral: 0.96, happy: 0.9 }), day), 'bright');
ok('huge neutral does not suppress a real angry face',
  moodFromRead(read({ neutral: 0.93, angry: 0.4 }), day), 'fired');

console.log('\nthe noise floor:');
// A resting face idles with sad around 0.1 and it is frequently the largest
// non-neutral channel. Without a floor, standing still reads as "Carrying
// something", which is both wrong and unkind.
ok('resting face with sad 0.12 → steady, not heavy',
  moodFromRead(read({ neutral: 0.85, sad: 0.12, happy: 0.03 }), day), 'steady');
ok('the same face in the evening → drifting',
  moodFromRead(read({ neutral: 0.85, sad: 0.12, happy: 0.03 }), 'evening'), 'drifting');
ok('completely blank → steady', moodFromRead(read({ neutral: 1 }), day), 'steady');
ok('just over the floor still counts',
  moodFromRead(read({ neutral: 0.7, sad: 0.26 }), day), 'heavy');

console.log('\nclosest channel wins, not the loudest-sounding one:');
ok('angry 0.4 beats sad 0.3', moodFromRead(read({ angry: 0.4, sad: 0.3 }), day), 'fired');
ok('sad 0.5 beats angry 0.35', moodFromRead(read({ angry: 0.35, sad: 0.5 }), day), 'heavy');

// ── the game's scoring, which no longer touches the mood ───────────────────

const A = (id: string, peak: number, timeToHit: number | null) => ({ exerciseId: id, peak, timeToHit });
const ex = (id: string) => EXERCISES.find((e) => e.id === id)!;

console.log('\ngame scoring is comparable across channels:');
for (const e of EXERCISES) {
  console.log(`  ${e.id.padEnd(6)} hit its ${e.threshold} bar at 1s → ${scoreOf(A(e.id, e.threshold, 1000), e)}`);
}
const scores = EXERCISES.map((e) => scoreOf(A(e.id, e.threshold, 1000), e));
ok('all four score the same for an equivalent effort', new Set(scores).size, 1);

console.log('\ngame scoring rewards speed and conviction:');
ok('instant beats slow', scoreOf(A('smile', 0.9, 300), ex('smile')) > scoreOf(A('smile', 0.9, 6000), ex('smile')), true);
ok('a miss scores below any hit', scoreOf(A('angry', 0.29, null), ex('angry')) < scoreOf(A('angry', 0.3, 7900), ex('angry')), true);
ok('score is capped at 100', scoreOf(A('smile', 1, 0), ex('smile')) <= 100, true);
ok('over-performing an easy round does not exceed the cap',
  scoreOf(A('smile', 1, 0), ex('smile')), scoreOf(A('laugh', 1, 0), ex('laugh')));

console.log(process.exitCode ? '\nFAILURES' : '\nall assertions passed');

/**
 * Scoring tests for the face-exercise mood read.
 *
 * Run with `npm test`. These exist because the scoring is the whole feature —
 * if it is wrong the kiosk goes back to telling everybody the same thing,
 * which is the bug this replaced. Two of the cases below are regressions that
 * were caught here and nowhere else:
 *
 *  · a real laugh being downgraded to "Warm", because smile and laugh share
 *    the `happy` channel and the smile threshold is lower;
 *  · a big raw smile beating a genuinely hard-won angry face.
 */
import { EXERCISES, easeOf, moodFromExercises, EMPTY_EXPRESSIONS } from './classify.ts';

const ok = (label: string, got: unknown, want: unknown) => {
  const pass = got === want;
  console.log(`${pass ? '  ✓' : '  ✗'} ${label} → ${got}${pass ? '' : `  (wanted ${want})`}`);
  if (!pass) process.exitCode = 1;
};

const A = (id: string, peak: number, timeToHit: number | null) => ({ exerciseId: id, peak, timeToHit });
const none = { ...EMPTY_EXPRESSIONS };
const day = 'afternoon' as const;

console.log('\nwhich face came easiest:');
// Snapped into an angry face instantly; smiled slowly and weakly.
ok('fast angry beats slow smile',
  moodFromExercises([A('smile', 0.55, 6000), A('angry', 0.62, 900), A('sad', 0.1, null), A('laugh', 0.5, null)], none, day),
  'fired');
// Big instant laugh.
ok('instant laugh wins',
  moodFromExercises([A('smile', 0.9, 400), A('angry', 0.3, 7000), A('sad', 0.1, null), A('laugh', 0.97, 700)], none, day),
  'bright');
// Sad came easily, nothing else did.
ok('easy sad wins',
  moodFromExercises([A('smile', 0.4, null), A('angry', 0.1, null), A('sad', 0.55, 800), A('laugh', 0.2, null)], none, day),
  'heavy');
// A comfortable smile but never a real laugh.
ok('smile without laugh → warm',
  moodFromExercises([A('smile', 0.72, 700), A('angry', 0.12, null), A('sad', 0.08, null), A('laugh', 0.6, null)], none, day),
  'warm');

console.log('\nthe raw-score trap this scoring exists to avoid:');
// happy 0.88 vs angry 0.34 — on RAW peaks the smile wins. But 0.34 against a
// 0.3 threshold is a better angry face than 0.88 against 0.85 is a laugh, and
// the angry one landed faster.
ok('strong-for-its-channel angry beats a bigger raw smile',
  moodFromExercises([A('smile', 0.88, 5200), A('angry', 0.34, 1200), A('sad', 0.05, null), A('laugh', 0.88, 6000)], none, day),
  'fired');

console.log('\nsmile and laugh share the happy channel:');
// Someone who properly laughs also sails through the smile round. The laugh is
// the stronger claim, so the smile result must not compete with it.
ok('a real laugh is not downgraded to warm',
  moodFromExercises([A('smile', 0.95, 400), A('angry', 0.05, null), A('sad', 0.05, null), A('laugh', 0.95, 600)], none, day),
  'bright');

console.log('\nnear misses:');
ok('strained angry that never crossed still beats steady',
  moodFromExercises([A('smile', 0.1, null), A('angry', 0.26, null), A('sad', 0.03, null), A('laugh', 0.1, null)], none, day),
  'fired');
ok('a slow but real hit beats a near miss',
  moodFromExercises([A('smile', 0.52, 7600), A('angry', 0.29, null), A('sad', 0.03, null), A('laugh', 0.1, null)], none, day),
  'warm');

console.log('\nnobody performed:');
ok('nothing landed, daytime → steady',
  moodFromExercises([A('smile', 0.1, null), A('angry', 0.02, null), A('sad', 0.03, null), A('laugh', 0.05, null)], none, day),
  'steady');
ok('nothing landed, evening → drifting',
  moodFromExercises([A('smile', 0.1, null), A('angry', 0.02, null), A('sad', 0.03, null), A('laugh', 0.05, null)], none, 'evening'),
  'drifting');

console.log('\nsecondary signals override:');
ok('startled throughout → sparked',
  moodFromExercises([A('smile', 0.9, 300)], { ...none, surprised: 0.6 }, day), 'sparked');
ok('fearful throughout → wound',
  moodFromExercises([A('smile', 0.9, 300)], { ...none, fearful: 0.5 }, day), 'wound');
ok('disgusted throughout → over',
  moodFromExercises([A('smile', 0.9, 300)], { ...none, disgusted: 0.5 }, day), 'over');

console.log('\nease is comparable across channels (that is the whole point):');
for (const e of EXERCISES) {
  const atThreshold = easeOf(A(e.id, e.threshold, 1000), e);
  console.log(`  ${e.id.padEnd(6)} peak=${e.threshold} hit@1s → ease ${atThreshold.toFixed(2)}`);
}

console.log(process.exitCode ? '\nFAILURES' : '\nall scoring assertions passed');

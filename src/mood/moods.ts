/**
 * The mood vocabulary.
 *
 * Deliberately NOT clinical. A stranger in a shopping mall is being handed
 * this word in public, on a big screen, possibly with friends watching — so
 * every mood here is one a person can be told without feeling diagnosed,
 * judged or exposed. "Carrying something" not "depressed". "Fired up" not
 * "angry". The read is warm and a bit cheeky, never a verdict.
 */
export type MoodId =
  | 'bright'
  | 'warm'
  | 'steady'
  | 'drifting'
  | 'heavy'
  | 'fired'
  | 'sparked'
  | 'wound'
  | 'over';

/**
 * How the background artwork shifts for this mood.
 *
 * IPC's background is a fixed blue-and-magenta gradient, so the moods are
 * expressed by pushing its hue and saturation rather than by swapping colours.
 * Positive hue moves toward magenta, negative toward cyan — which happens to
 * map neatly onto warm and cool moods.
 */
export type BackdropTint = {
  /** Degrees of hue rotation. + toward magenta, − toward cyan. */
  hue: number;
  saturate: number;
  brightness: number;
};

export type Mood = {
  id: MoodId;
  /** The big word on the reveal screen. */
  word: string;
  /** One line under it — what we think we just saw. */
  read: string;
  /** Tags used to match food. See src/data/ipcFood.ts. */
  craves: string[];
  tint: BackdropTint;
};

export const MOODS: Record<MoodId, Mood> = {
  bright: {
    id: 'bright',
    word: 'Bright',
    read: 'You walked in already lit up. I did not have to work for this one.',
    craves: ['celebratory', 'shareable', 'sweet', 'fun'],
    tint: { hue: 26, saturate: 1.16, brightness: 1.04 },
  },
  warm: {
    id: 'warm',
    word: 'Warm',
    read: 'Quietly fine. Not performing it — just fine.',
    craves: ['comforting', 'shareable', 'classic'],
    tint: { hue: 15, saturate: 1.06, brightness: 1.03 },
  },
  steady: {
    id: 'steady',
    word: 'Steady',
    read: 'Level, all the way through. Nothing is rattling you.',
    craves: ['classic', 'quick', 'comforting'],
    tint: { hue: 0, saturate: 1, brightness: 1.02 },
  },
  drifting: {
    id: 'drifting',
    word: 'Running on empty',
    read: 'It is in the eyes. You have been going a long time.',
    craves: ['comforting', 'hearty', 'caffeine', 'sweet'],
    tint: { hue: 10, saturate: 0.78, brightness: 1 },
  },
  heavy: {
    id: 'heavy',
    word: 'Carrying something',
    read: 'It sits in the shoulders more than the face, honestly.',
    craves: ['comforting', 'warm-broth', 'sweet', 'gentle'],
    tint: { hue: -10, saturate: 0.72, brightness: 0.97 },
  },
  fired: {
    id: 'fired',
    word: 'Fired up',
    read: 'Jaw set. Shoulders up. You are not relaxed.',
    craves: ['spicy', 'grilled', 'bold', 'hearty'],
    tint: { hue: 34, saturate: 1.32, brightness: 1.01 },
  },
  sparked: {
    id: 'sparked',
    word: 'Wide awake',
    read: 'Eyebrows up, eyes everywhere, taking it all in.',
    craves: ['adventurous', 'new', 'shareable', 'fun'],
    tint: { hue: -26, saturate: 1.34, brightness: 1.05 },
  },
  wound: {
    id: 'wound',
    word: 'Wound up',
    read: 'Everything a little too quick. Shoulders up by your ears.',
    craves: ['warm-broth', 'gentle', 'caffeine', 'comforting'],
    tint: { hue: -16, saturate: 0.92, brightness: 0.99 },
  },
  over: {
    id: 'over',
    word: 'Over it',
    read: 'Nothing left in the face at all. Today has used you up.',
    craves: ['bold', 'spicy', 'comforting', 'quick'],
    tint: { hue: -36, saturate: 0.86, brightness: 1.01 },
  },
};

/** Before we know anything about you: IPC's artwork exactly as supplied. */
export const IDLE_TINT: BackdropTint = { hue: 0, saturate: 1, brightness: 1 };

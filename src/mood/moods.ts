import type { LavaPalette } from '../lava/palette';

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

export type Mood = {
  id: MoodId;
  /** The big word on the reveal screen. */
  word: string;
  /** One line under it — what we think we just saw. */
  read: string;
  /** Tags used to match food. See src/data/ipcFood.ts. */
  craves: string[];
  palette: LavaPalette;
};

const INK = '#070C1C';
const INK_BLUE = '#05102A';
/* Deep purple ground for the magenta-led moods — still inside IPC's range. */
const INK_PLUM = '#180A2E';

export const MOODS: Record<MoodId, Mood> = {
  bright: {
    id: 'bright',
    word: 'Bright',
    read: 'You walked in already lit up. I did not have to work for this one.',
    craves: ['celebratory', 'shareable', 'sweet', 'fun'],
    palette: { a: '#E50695', b: '#FF6FA8', c: '#FF8AC9', bgA: INK, bgB: INK_PLUM },
  },
  warm: {
    id: 'warm',
    word: 'Warm',
    read: 'Quietly fine. Not performing it — just fine.',
    craves: ['comforting', 'shareable', 'classic'],
    palette: { a: '#E50695', b: '#7B5BFF', c: '#FF6FBE', bgA: INK, bgB: INK_PLUM },
  },
  steady: {
    id: 'steady',
    word: 'Steady',
    read: 'Level, all the way through. Nothing is rattling you.',
    craves: ['classic', 'quick', 'comforting'],
    palette: { a: '#2E7BFF', b: '#00CFE0', c: '#6FE3F0', bgA: INK, bgB: INK_BLUE },
  },
  drifting: {
    id: 'drifting',
    word: 'Running on empty',
    read: 'It is in the eyes. You have been going a long time.',
    craves: ['comforting', 'hearty', 'caffeine', 'sweet'],
    palette: { a: '#4A3FA8', b: '#2E7BFF', c: '#8B7BFF', bgA: INK, bgB: INK_BLUE },
  },
  heavy: {
    id: 'heavy',
    word: 'Carrying something',
    read: 'It sits in the shoulders more than the face, honestly.',
    craves: ['comforting', 'warm-broth', 'sweet', 'gentle'],
    palette: { a: '#1E5BD6', b: '#3B2F8F', c: '#5B9BFF', bgA: INK, bgB: INK_BLUE },
  },
  fired: {
    id: 'fired',
    word: 'Fired up',
    read: 'Jaw set. Shoulders up. You are not relaxed.',
    craves: ['spicy', 'grilled', 'bold', 'hearty'],
    palette: { a: '#E50695', b: '#FF3DAE', c: '#FF7AC4', bgA: INK, bgB: INK_PLUM },
  },
  sparked: {
    id: 'sparked',
    word: 'Wide awake',
    read: 'Eyebrows up, eyes everywhere, taking it all in.',
    craves: ['adventurous', 'new', 'shareable', 'fun'],
    palette: { a: '#E50695', b: '#00CFE0', c: '#FF6FD0', bgA: INK, bgB: INK_PLUM },
  },
  wound: {
    id: 'wound',
    word: 'Wound up',
    read: 'Everything a little too quick. Shoulders up by your ears.',
    craves: ['warm-broth', 'gentle', 'caffeine', 'comforting'],
    palette: { a: '#7B5BFF', b: '#00CFE0', c: '#9D8AFF', bgA: INK, bgB: INK_BLUE },
  },
  over: {
    id: 'over',
    word: 'Over it',
    read: 'Nothing left in the face at all. Today has used you up.',
    craves: ['bold', 'spicy', 'comforting', 'quick'],
    palette: { a: '#00CFE0', b: '#2E7BFF', c: '#6FE3F0', bgA: INK, bgB: INK_BLUE },
  },
};

/** The ambient palette before we know anything about you — IPC's own colours. */
export const IDLE_PALETTE: LavaPalette = {
  a: '#2E7BFF',
  b: '#E50695',
  c: '#7B5BFF',
  bgA: INK,
  bgB: INK_BLUE,
};

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

const INK = '#140A1E';
const INK_WARM = '#2A1020';
const INK_COOL = '#0E1330';

export const MOODS: Record<MoodId, Mood> = {
  bright: {
    id: 'bright',
    word: 'Bright',
    read: 'You walked in already lit up. I did not have to work for this one.',
    craves: ['celebratory', 'shareable', 'sweet', 'fun'],
    palette: { a: '#FFB03B', b: '#E8467F', c: '#FFD84D', bgA: INK, bgB: INK_WARM },
  },
  warm: {
    id: 'warm',
    word: 'Warm',
    read: 'Quietly fine. Not performing it — just fine.',
    craves: ['comforting', 'shareable', 'classic'],
    palette: { a: '#FFB03B', b: '#E4322B', c: '#FF8A3D', bgA: INK, bgB: INK_WARM },
  },
  steady: {
    id: 'steady',
    word: 'Steady',
    read: 'Level, all the way through. Nothing is rattling you.',
    craves: ['classic', 'quick', 'comforting'],
    palette: { a: '#17A79C', b: '#3D6BE5', c: '#4FD9CE', bgA: INK, bgB: INK_COOL },
  },
  drifting: {
    id: 'drifting',
    word: 'Running on empty',
    read: 'It is in the eyes. You have been going a long time.',
    craves: ['comforting', 'hearty', 'caffeine', 'sweet'],
    palette: { a: '#8B5CF6', b: '#3D6BE5', c: '#A98BFF', bgA: INK, bgB: '#1A1038' },
  },
  heavy: {
    id: 'heavy',
    word: 'Carrying something',
    read: 'It sits in the shoulders more than the face, honestly.',
    craves: ['comforting', 'warm-broth', 'sweet', 'gentle'],
    palette: { a: '#3D6BE5', b: '#8B5CF6', c: '#6B93FF', bgA: INK, bgB: INK_COOL },
  },
  fired: {
    id: 'fired',
    word: 'Fired up',
    read: 'Jaw set. Shoulders up. You are not relaxed.',
    craves: ['spicy', 'grilled', 'bold', 'hearty'],
    palette: { a: '#E4322B', b: '#FFB03B', c: '#FF7A3C', bgA: INK, bgB: '#30101A' },
  },
  sparked: {
    id: 'sparked',
    word: 'Wide awake',
    read: 'Eyebrows up, eyes everywhere, taking it all in.',
    craves: ['adventurous', 'new', 'shareable', 'fun'],
    palette: { a: '#E8467F', b: '#FFB03B', c: '#FF8FB8', bgA: INK, bgB: '#2A1030' },
  },
  wound: {
    id: 'wound',
    word: 'Wound up',
    read: 'Everything a little too quick. Shoulders up by your ears.',
    craves: ['warm-broth', 'gentle', 'caffeine', 'comforting'],
    palette: { a: '#8B5CF6', b: '#17A79C', c: '#8FE0D8', bgA: INK, bgB: '#141A38' },
  },
  over: {
    id: 'over',
    word: 'Over it',
    read: 'Nothing left in the face at all. Today has used you up.',
    craves: ['bold', 'spicy', 'comforting', 'quick'],
    palette: { a: '#17A79C', b: '#8B5CF6', c: '#5FD3C8', bgA: INK, bgB: '#101A2E' },
  },
};

/** The ambient palette before we know anything about you — IPC's own colours. */
export const IDLE_PALETTE: LavaPalette = {
  a: '#E4322B',
  b: '#FFB03B',
  c: '#FF6B3D',
  bgA: INK,
  bgB: INK_WARM,
};

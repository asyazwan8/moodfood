import type { Outlet } from '../data/ipcFood';
import { daypartFor, type Daypart } from '../mood/classify';
import type { MoodId } from '../mood/moods';
import { newSeed } from './script';

export type SceneId =
  | 'idle'
  | 'consent'
  | 'warmup'
  | 'read'
  | 'reading'
  | 'mood'
  | 'encouragement'
  | 'game'
  | 'score'
  | 'food'
  | 'thanks';

/** Ordered, for the debug panel's scene jumper. */
export const SCENES: SceneId[] = [
  'idle',
  'consent',
  'warmup',
  'read',
  'reading',
  'mood',
  'encouragement',
  'game',
  'score',
  'food',
  'thanks',
];

export type Session = {
  scene: SceneId;
  /** Fixed per visitor so copy choices stay stable across re-renders. */
  seed: number;
  daypart: Daypart;
  mood: MoodId | null;
  /** The portrait taken during the read. Shown on the mood reveal. */
  readPhoto: string | null;
  /** One photo per game round, in order. Nulls where a round got none. */
  shots: (string | null)[];
  /** One score per game round, out of 100. */
  scores: number[];
  /** The round they scored highest on, for the score card's closing line. */
  bestFace: string | null;
  shortlist: Outlet[];
  foodIndex: number;
  /** True when we finished the story without ever seeing a face. */
  blind: boolean;
};

export type Action =
  | { type: 'start' }
  | { type: 'cameraReady' }
  | { type: 'cameraRefused' }
  | { type: 'faceFound' }
  | { type: 'readDone'; mood: MoodId; photo: string | null }
  | { type: 'readingDone' }
  | { type: 'gameDone'; shots: (string | null)[]; scores: number[]; bestFace: string | null }
  | { type: 'next' }
  | { type: 'shortlist'; outlets: Outlet[] }
  | { type: 'anotherFood' }
  | { type: 'reset' };

export function freshSession(): Session {
  return {
    scene: 'idle',
    seed: newSeed(),
    daypart: daypartFor(),
    mood: null,
    readPhoto: null,
    shots: [],
    scores: [],
    bestFace: null,
    shortlist: [],
    foodIndex: 0,
    blind: false,
  };
}

/** Which scene a press moves you to. Scenes not listed advance on their own. */
const ON_PRESS: Partial<Record<SceneId, SceneId>> = {
  idle: 'consent',
  mood: 'encouragement',
  encouragement: 'game',
  score: 'food',
  food: 'thanks',
};

export function canPress(scene: SceneId): boolean {
  return scene in ON_PRESS;
}

export function reduce(state: Session, action: Action): Session {
  switch (action.type) {
    case 'start':
      // A fresh seed and a fresh daypart for every visitor — the kiosk runs
      // for days at a time and would otherwise still be saying "morning" at 9pm.
      return { ...freshSession(), scene: 'consent', seed: newSeed(), daypart: daypartFor() };

    case 'cameraReady':
      return state.scene === 'consent' ? { ...state, scene: 'warmup' } : state;

    case 'cameraRefused':
      // No face, but we still owe them the ending we promised: skip the parts
      // that would be a lie and go straight to feeding them.
      return { ...state, scene: 'food', mood: 'steady', blind: true, shots: [], readPhoto: null };

    case 'faceFound':
      return state.scene === 'warmup' ? { ...state, scene: 'read' } : state;

    case 'readDone':
      return state.scene === 'read'
        ? { ...state, scene: 'reading', mood: action.mood, readPhoto: action.photo }
        : state;

    case 'gameDone':
      return state.scene === 'game'
        ? {
            ...state,
            scene: 'score',
            shots: action.shots,
            scores: action.scores,
            bestFace: action.bestFace,
          }
        : state;

    case 'readingDone':
      return state.scene === 'reading' ? { ...state, scene: 'mood' } : state;

    case 'next': {
      const nextScene = ON_PRESS[state.scene];
      return nextScene ? { ...state, scene: nextScene } : state;
    }

    case 'shortlist':
      return { ...state, shortlist: action.outlets, foodIndex: 0 };

    case 'anotherFood':
      return state.foodIndex + 1 < state.shortlist.length
        ? { ...state, foodIndex: state.foodIndex + 1 }
        : state;

    case 'reset':
      return freshSession();
  }
}

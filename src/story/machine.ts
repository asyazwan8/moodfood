import type { Outlet } from '../data/ipcFood';
import { daypartFor, type Daypart } from '../mood/classify';
import type { MoodId } from '../mood/moods';
import { newSeed } from './script';

export type SceneId =
  | 'idle'
  | 'consent'
  | 'warmup'
  | 'smile'
  | 'capture'
  | 'reading'
  | 'mood'
  | 'encouragement'
  | 'food'
  | 'thanks';

/** Ordered, for the debug panel's scene jumper. */
export const SCENES: SceneId[] = [
  'idle',
  'consent',
  'warmup',
  'smile',
  'capture',
  'reading',
  'mood',
  'encouragement',
  'food',
  'thanks',
];

export type Session = {
  scene: SceneId;
  /** Fixed per visitor so copy choices stay stable across re-renders. */
  seed: number;
  daypart: Daypart;
  mood: MoodId | null;
  photo: string | null;
  shortlist: Outlet[];
  foodIndex: number;
  /** True when we finished the story without ever seeing a face. */
  blind: boolean;
};

export type Action =
  | { type: 'start' }
  | { type: 'cameraReady' }
  | { type: 'cameraRefused' }
  | { type: 'moodRead'; mood: MoodId }
  | { type: 'smiled' }
  | { type: 'captured'; photo: string | null }
  | { type: 'readingDone' }
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
    photo: null,
    shortlist: [],
    foodIndex: 0,
    blind: false,
  };
}

/** Which scene a press moves you to. Scenes not listed advance on their own. */
const ON_PRESS: Partial<Record<SceneId, SceneId>> = {
  idle: 'consent',
  mood: 'encouragement',
  encouragement: 'food',
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
      return { ...state, scene: 'food', mood: 'steady', blind: true, photo: null };

    case 'moodRead':
      return state.scene === 'warmup' ? { ...state, scene: 'smile', mood: action.mood } : state;

    case 'smiled':
      return state.scene === 'smile' ? { ...state, scene: 'capture' } : state;

    case 'captured':
      return state.scene === 'capture'
        ? { ...state, scene: 'reading', photo: action.photo }
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

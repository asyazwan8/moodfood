import type { Daypart } from '../mood/classify';
import type { MoodId } from '../mood/moods';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY WORD THE KIOSK SAYS LIVES IN THIS FILE.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Voice notes, for whoever edits this next:
 *
 *  · It talks like a person, not a product. Short sentences. Contractions.
 *    It is allowed to trail off.
 *  · Malaysian English, lightly. "lah" and "makan" where they land naturally,
 *    never sprinkled on to perform localness.
 *  · It notices, it does not diagnose. "You look like today has been long" —
 *    not "You are sad."
 *  · It is never sincere for more than two lines without undercutting itself.
 *    A screen in a shopping mall that gets too earnest is embarrassing.
 *  · The whole thing is walking someone to a restaurant. Warmth is the method,
 *    not the goal — but the warmth has to be real or the ending feels like a
 *    bait and switch.
 */

// ── 1. idle ────────────────────────────────────────────────────────────────

export const GREETINGS: Record<Daypart, { hello: string; ask: string }[]> = {
  morning: [
    { hello: 'Selamat pagi.', ask: 'How are you, really?' },
    { hello: 'Morning.', ask: 'You are up early. How is it going?' },
    { hello: 'Hi. Good morning.', ask: 'How are we starting today?' },
  ],
  afternoon: [
    { hello: 'Afternoon.', ask: 'How are you, really?' },
    { hello: 'Hi there.', ask: 'Have you eaten yet?' },
    { hello: 'Afternoon, you.', ask: 'How is the day treating you?' },
  ],
  evening: [
    { hello: 'Evening.', ask: 'Long one, was it?' },
    { hello: 'Hi. Good evening.', ask: 'How are you, really?' },
    { hello: 'Evening lah.', ask: 'You made it. How are you doing?' },
  ],
  latenight: [
    { hello: 'Still here?', ask: 'Same. How are you holding up?' },
    { hello: 'Hi. It is late.', ask: 'How are you, really?' },
    { hello: 'Oh — hello.', ask: 'What are we still doing here?' },
  ],
};

/** Rotates on the idle screen while nobody is standing there. */
export const ATTRACT = [
  'I can read a face. Let me try yours.',
  'Tell me how you are and I will tell you what to eat.',
  'Thirty seconds. Then food.',
  'No app. No sign up. Just your face.',
  'I have been standing here all day. Come say hi.',
];

export const IDLE_CUE = 'Touch anywhere to start';

// ── 2. consent ─────────────────────────────────────────────────────────────

export const CONSENT = {
  title: 'First — may I look at you?',
  body: [
    'I need the camera for about twenty seconds to read your face.',
    'Nothing is saved. Nothing is sent anywhere. It all happens on this screen and disappears when you walk away.',
  ],
  cta: 'Okay, go ahead',
  bail: 'Actually, not now',
  denied: {
    title: 'No camera, no problem.',
    body: 'I cannot see you without it — but I can still point you at something good to eat.',
    cta: 'Just feed me',
  },
};

// ── 3. warmup ──────────────────────────────────────────────────────────────

export const WARMUP = {
  searching: ['Looking for you…', 'Hold on, let me find you…', 'Where are you…'],
  found: ['Ah — there you are.', 'Oh, hello.', 'Got you.', 'There. Hi.'],
  holding: 'Stay there. Just be normal for a second.',
};

// ── 4. smile gate ──────────────────────────────────────────────────────────

/** Tiers are checked from the top down against the live smile score. */
export const SMILE = {
  prompt: 'Now. Best smile you have got.',
  tiers: [
    { above: 0.82, line: 'THERE it is!' },
    { above: 0.55, line: 'Yes — more of that.' },
    { above: 0.28, line: 'That is a polite smile lah. Give me a real one.' },
    { above: 0.0, line: 'Come on. Nobody is watching. Well. I am.' },
  ],
  holding: 'Hold it…',
};

// ── 5. capture ─────────────────────────────────────────────────────────────

export const CAPTURE = { hold: 'Hold it…', count: ['3', '2', '1'] };

// ── 6. reading ─────────────────────────────────────────────────────────────

export const READING = ['Reading you…', 'Give me a second…', 'Hmm.'];

// ── 7 & 8. mood reveal and encouragement ───────────────────────────────────

export const MOOD_INTRO = 'Here is what I saw.';

/**
 * Two or three lines per mood. The first line acknowledges, the last one turns
 * toward food — that turn is what stops this being a fortune cookie.
 */
export const ENCOURAGEMENT: Record<MoodId, string[][]> = {
  bright: [
    ['Days like this are not owed to you — they just turn up.', 'So take the win, and do not spend it checking your phone.', 'Let us put something good in front of you while it lasts.'],
    ['You are in a good one. I can see it from here.', 'Go be insufferable about it.', 'But eat first.'],
  ],
  warm: [
    ['Nothing dramatic. Just quietly okay.', 'Honestly? That is the good stuff. Most days do not even manage that.', 'Let us not waste it on a sad desk lunch.'],
    ['You look settled. Comfortable in it.', 'Keep that. It is harder to hold than people admit.', 'Come, makan.'],
  ],
  steady: [
    ['Level. Nothing rattling you today.', 'That is not boring, that is expensive. A lot of people are paying good money for what you have got right now.', 'Let us feed it properly.'],
    ['You are cruising.', 'No notes. Genuinely.', 'So let us pick something worth the trip.'],
  ],
  drifting: [
    ['You have been going since this morning, and it is showing around the eyes.', 'Nothing is wrong with you. You are just running low, and low is not the same as broken.', 'Sit down. Let something warm do the next bit of work.'],
    ['That is the face of someone who has been useful to too many people today.', 'Be useless for twenty minutes. I insist.', 'Here is where to do it.'],
  ],
  heavy: [
    ['Something is sitting on you today.', 'You do not have to explain that to a screen in a shopping mall. I am not going to ask.', 'But I am going to insist you eat something warm before you carry it any further.'],
    ['Today looks like it has been heavier than you are letting on.', 'That is allowed. It does not need fixing right this second.', 'One warm thing, one proper chair. Start there.'],
  ],
  fired: [
    ['There is heat behind that face.', 'Not going to tell you to calm down — that has never once worked on anybody.', 'Let us point it somewhere useful instead. Preferably at something grilled.'],
    ['Something got you going today.', 'Hold on to it, honestly. Flat is worse.', 'But feed it before it turns into a mood.'],
  ],
  sparked: [
    ['Eyes wide open. Everything is interesting to you right now.', 'That does not happen every day — most days you are just getting through.', 'So today is the day you order the thing you cannot pronounce.'],
    ['You look properly awake. Switched on.', 'Do something with that.', 'Starting with lunch.'],
  ],
  wound: [
    ['A bit tight in the shoulders. A bit fast in the head.', 'Nothing here needs you for the next twenty minutes. I checked.', 'Let us slow this down with something hot and slightly too big.'],
    ['You are wound up. It is in the jaw.', 'Whatever is waiting can wait a bit longer.', 'Sit. Eat. Then go handle it.'],
  ],
  over: [
    ['That is the face of somebody who is finished with today.', 'Fair enough. Today has been a lot for a lot of people.', 'Good news is this part I can actually fix.'],
    ['You are done. Completely done.', 'No argument from me.', 'Let us get you fed and out of here.'],
  ],
};

// ── 9. food ────────────────────────────────────────────────────────────────

export const FOOD = {
  intro: ['So here is what you need.', 'Right. I know exactly where to send you.', 'This one. Trust me.'],
  again: 'Not feeling it?',
  againCta: 'Show me another',
  exhausted: 'That is everything I have got for this mood. Go with the first one lah.',
};

// ── 10. thanks ─────────────────────────────────────────────────────────────

export const THANKS = {
  title: 'Thank you for saying hi.',
  body: [
    'That was nicer than standing here alone.',
    'Now go makan something good.',
  ],
  qrCaption: 'Everything else to eat at IPC',
  footer: 'Your face has already been forgotten. Promise.',
};

// ── picking ────────────────────────────────────────────────────────────────

/**
 * Deterministic pick from a seed.
 *
 * Two people in a row must not get word-for-word the same session, or anyone
 * watching the queue works out it is a script. But within ONE session the same
 * seed has to give the same answer every render, or lines would reshuffle
 * themselves mid-sentence on every React re-render.
 */
export function pickFrom<T>(items: readonly T[], seed: number): T {
  if (items.length === 0) throw new Error('pickFrom: nothing to pick from');
  const index = Math.abs(Math.floor(seed)) % items.length;
  return items[index] as T;
}

/** A fresh seed per visitor. */
export function newSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

export function smileLine(smile: number): string {
  for (const tier of SMILE.tiers) {
    if (smile > tier.above) return tier.line;
  }
  return SMILE.tiers[SMILE.tiers.length - 1]?.line ?? SMILE.prompt;
}

# MoodFood — IPC Shopping Centre mood kiosk

An interactive kiosk demo for **IPC Shopping Centre, Mutiara Damansara**, built for a
**9:16 vertical screen**.

Someone walks up. The kiosk greets them by time of day, asks for the camera, reads their
face, asks for their best smile, takes their photo, tells them their mood, says something
kind, and then walks them to a real restaurant inside IPC. It ends with a thank you.

It is not a form with steps. It is a short piece of theatre with a commercial ending.

**It runs entirely offline.** No API keys, no backend, no network at runtime. Unplug the
wifi mid-demo and it still finishes the story.

---

## Run it

```bash
npm install          # also copies the face models into public/models
npm run dev          # http://localhost:5173
```

Then open Chrome DevTools → device toolbar → add a custom device at **1080 × 1920**.

| URL flag | What it does |
|---|---|
| `?mock=1` | Skips the camera entirely and drives a scripted face. Walk the whole story with no webcam and no permission prompt. |
| `?debug=1` | Live expression probabilities, camera state, smile score, and buttons to jump to any scene. |
| `?mood=heavy` | Forces a mood, so you can rehearse a specific ending. Any id from `src/mood/moods.ts`. |

On the kiosk itself, a **three-second long-press in the top-left corner** opens the debug
panel — there is no keyboard on a mall floor.

## Deploy it

```bash
npm run build        # -> dist/, a static folder
```

Serve `dist/` over **HTTPS** (or `localhost`). This is not optional: browsers refuse
`getUserMedia` on an insecure origin, so on plain `http://` over a LAN the camera will
never start.

Launch full screen:

```bash
chrome --kiosk --app=https://your-host/ --autoplay-policy=no-user-gesture-required
```

Grant the camera permission once and Chrome remembers it for that origin.

---

## How it actually works

### The mood is read *before* the smile

The brief asks for both "analyse the face and show a mood" and "smile to continue". Those
two fight each other: if the mood were classified after the smile gate, **every single
visitor would come out Bright** and the reveal would mean nothing.

So the mood is sampled candidly during `warmup`, while the visitor is just standing there
reading the screen. The smile is a ritual that earns the photo — it is not the
measurement. See `src/mood/classify.ts`.

### Offline by construction

`@vladmandic/face-api` ships its model weights inside the npm package.
`scripts/copy-models.mjs` copies the three this kiosk uses into `public/models/` at install
time (~600 KB), the service worker precaches them, and the app loads them from its own
origin. Fonts come from `@fontsource-variable/*` for the same reason, and the closing QR
code is generated locally.

### Privacy

A camera in a public mall is a real obligation, not a checkbox.

- Frames never leave the device. No upload, no `fetch`, no storage of any kind.
- The photo lives in a canvas in memory only.
- `MediaStreamTrack.stop()` and the photo drop happen on every return to idle, so one
  visitor's face is gone before the next walks up.
- The consent scene says all of this in plain language before the camera turns on.

### Weight

The kiosk precaches everything so it can run offline, so every asset in `public/` is paid
for on install. IPC's background arrived as a 5.2 MB PNG; it ships as a 666 KB WebP, an 87%
saving with no visible loss on a soft gradient. The original lives in `assets-src/`, outside
`public/`, so it is never served — see the note there for how to regenerate.

Total precache: about 3.3 MB, most of which is the face-detection library.

---

## Making it properly IPC's

The logo and the palette are **IPC's real ones**: `public/brand/IPC_logo.png` is the
official mark, and the brand colours in `src/brand/tokens.ts` were sampled straight out of
that file (`#0047B9` blue, `#E50695` magenta). The typeface is still a stand-in.

One thing worth knowing if you touch the colours: IPC's logo is built for a white
background, and its blue scores **2.38:1** against the kiosk's dark ground — unreadable. So
the palette has two tiers: the true brand colours for the logo itself, and lifted variants
(`blueLit`, `magentaLit`) for text and accents on dark. The logo sits on a light chip so its
artwork stays exactly correct rather than being recoloured.

| To change | Edit |
|---|---|
| Brand colours | `src/brand/tokens.ts` and the matching vars in `src/brand/brand.css` |
| The logo | Replace `public/brand/IPC_logo.png` — every place the logo appears renders that one file |
| The typeface | Add `@font-face` in `src/brand/brand.css`, point `--font-display` / `--font-body` at it |
| **Every word the kiosk says** | `src/story/script.ts` — all of it, one file |
| Mood words and palettes | `src/mood/moods.ts` |
| **The restaurants** | `src/data/ipcFood.ts` |

### ⚠️ Verify the restaurant list before demoing

`src/data/ipcFood.ts` holds 25 real IPC tenants, but the list was assembled from press
coverage and third-party directories — **not** from IPC's live store guide. Tenancies
change. Only Nando's carries a lot number (G.19), because that is the only one with a
source behind it; everything else gives a floor and stops there, since sending a visitor
confidently to a unit that does not exist is worse than sending them to the right floor.

Check every row against `ipc.com.my/store-guide`, fill in the real lot numbers, and delete
anything that has moved out. It is one flat array, on purpose.

---

## Layout

```
src/
  brand/      tokens, CSS vars, the logo lockup      ← all IPC identity
  story/      machine.ts (the 10 scenes) + script.ts ← all the words
  scenes/     one component per beat
  mood/       classifier, mood vocabulary, palettes
  vision/     camera, face-api loader, candid sampling, photo capture
  lava/       the WebGL lava lamp
  recommend/  mood + time of day -> restaurant
  data/       the IPC outlet list
  kiosk/      1080x1920 stage, press handling, idle timeout, debug panel
  ui/         typewriter, smile meter, polaroid, QR, press cue
```

## The ten beats

`idle → consent → warmup → smile → capture → reading → mood → encouragement → food → thanks`

Each one advances on a press, except the ones the kiosk drives itself. Every self-driven
scene has a timeout so nobody is ever stranded: no face found, no smile given, camera
refused — the story still reaches a restaurant.

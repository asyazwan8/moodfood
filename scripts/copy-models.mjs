/**
 * Copies only the face-api model weights this kiosk actually uses out of
 * node_modules and into public/models, so the app loads them from its own
 * origin and never touches a CDN. That is what makes the offline demo work.
 *
 * Runs on postinstall. Safe to run repeatedly.
 */
import { createRequire } from 'node:module';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

// tiny_face_detector  — fast enough for a live kiosk loop
// face_expression_model — the 7 expression probabilities we read mood from
// face_landmark_68_tiny — landmarks, used to frame and steady the face
const WANTED = [
  'tiny_face_detector',
  'face_expression_model',
  'face_landmark_68_tiny',
];

let modelDir;
try {
  modelDir = join(dirname(require.resolve('@vladmandic/face-api/package.json')), 'model');
} catch {
  console.warn('[models] @vladmandic/face-api not installed yet — skipping.');
  process.exit(0);
}

if (!existsSync(modelDir)) {
  console.warn(`[models] no model folder at ${modelDir} — skipping.`);
  process.exit(0);
}

const outDir = new URL('../public/models/', import.meta.url);
mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const file of readdirSync(modelDir)) {
  if (!WANTED.some((name) => file.startsWith(name))) continue;
  copyFileSync(join(modelDir, file), new URL(file, outDir));
  copied += 1;
}

console.log(`[models] copied ${copied} weight files into public/models`);

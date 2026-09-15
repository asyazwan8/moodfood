/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE BRAND FILE. This is the one place IPC's identity is defined.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * These values are a STAND-IN. They are NOT sampled from IPC's brand guide,
 * which was not reachable when this was built.
 *
 * TO MAKE THIS OFFICIAL:
 *   1. Replace `public/brand/logo.svg` with IPC's real logo.
 *   2. Replace the hex values in `palette` below with IPC's real brand colours
 *      (sampling them straight out of the logo artwork is the quickest way).
 *   3. Point `fonts.display` / `fonts.body` at IPC's real typeface — see
 *      src/brand/brand.css for where the @font-face goes.
 * Nothing else in the app needs to be touched.
 */

export const palette = {
  /** Deep plum ground the whole kiosk sits on. */
  ink: '#140A1E',
  inkSoft: '#241236',

  /** The primary red. */
  red: '#E4322B',
  /** Warm amber highlight. */
  amber: '#FFB03B',
  /** Rose. */
  rose: '#E8467F',
  /** Blue-green. */
  teal: '#17A79C',
  /** Blue. */
  blue: '#3D6BE5',
  /** Soft violet for the cooler moods. */
  violet: '#8B5CF6',

  /** Paper — all body copy sits on ink in this colour. */
  cream: '#FFF4E6',
  creamDim: 'rgba(255, 244, 230, 0.62)',
  creamFaint: 'rgba(255, 244, 230, 0.28)',
} as const;

export const fonts = {
  /** Headlines, mood words, the wordmark. */
  display: "'Nunito Variable', 'Nunito', system-ui, sans-serif",
  /** Everything else. */
  body: "'Inter Variable', 'Inter', system-ui, sans-serif",
} as const;

/** The kiosk screen this is designed for. Everything scales from here. */
export const STAGE = { width: 1080, height: 1920 } as const;

export type PaletteKey = keyof typeof palette;

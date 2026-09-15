/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE BRAND FILE. This is the one place IPC's identity is defined.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `blue` and `magenta` are SAMPLED FROM public/brand/IPC_logo.png — IPC's real
 * brand colours, not an approximation.
 *
 * The kiosk is light, because IPC's supplied background
 * (public/brand/background.webp) is a near-white paper with a blue/magenta
 * gradient on it. Measured against that paper:
 *
 *   IPC blue    #0047B9   8.04:1  — good for anything
 *   IPC magenta #E50695   4.37:1  — large text only, never body copy
 *   ink         #0A1330  18.22:1  — body copy
 *
 * TO CHANGE THE ARTWORK: replace public/brand/background.webp and
 * public/brand/IPC_logo.png. Nothing else needs touching.
 */

export const palette = {
  /** #0047B9 — the dominant colour of the mark. Headings and accents. */
  blue: '#0047B9',
  /** #E50695 — "SHOPPING CENTRE" and the dots. Large text only. */
  magenta: '#E50695',

  /** Body copy. A deep navy rather than black, to sit with the blue. */
  ink: '#0A1330',
  inkDim: 'rgba(10, 19, 48, 0.68)',
  inkFaint: 'rgba(10, 19, 48, 0.42)',

  /** The paper, matching the background artwork's field. */
  paper: '#FDFEFF',
  paperSoft: '#F2F5FC',
} as const;

/**
 * Type is thin throughout — the background is soft and airy, and heavy
 * weights fight it. Nothing here goes above 400.
 */
export const weight = {
  /** Big display lines. */
  display: 250,
  /** Mood words and anything that needs a touch more presence. */
  displayStrong: 300,
  /** Body copy. */
  body: 300,
  /** Small labels and buttons. */
  label: 400,
} as const;

export const fonts = {
  display: "'Nunito Variable', 'Nunito', system-ui, sans-serif",
  body: "'Inter Variable', 'Inter', system-ui, sans-serif",
} as const;

/** The kiosk screen this is designed for. Everything scales from here. */
export const STAGE = { width: 1080, height: 1920 } as const;

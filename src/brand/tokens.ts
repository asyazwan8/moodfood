/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE BRAND FILE. This is the one place IPC's identity is defined.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `blue` and `magenta` are SAMPLED FROM public/brand/IPC_logo.png — they are
 * IPC's real brand colours, not an approximation.
 *
 * The catch: IPC's logo is built for a white background. On the kiosk's dark
 * ground the brand blue scores 2.38:1 contrast, which is unreadable. So the
 * palette has two tiers:
 *
 *   · `blue` / `magenta`      — the true brand colours. Used for the logo
 *                               itself and anything sitting on light.
 *   · `blueLit` / `magentaLit` — the same hues lifted into legibility for use
 *                               as text and accents on the dark ground.
 *
 * Never put raw `blue` on the dark ground. Use `blueLit`.
 */

export const palette = {
  // ── IPC's real brand colours, sampled from the logo ──────────────────────
  /** #0047B9 — the dominant colour of the mark. */
  blue: '#0047B9',
  /** #E50695 — "SHOPPING CENTRE" and the two dots. */
  magenta: '#E50695',

  // ── The same hues, lifted for use on the dark ground ─────────────────────
  blueLit: '#5B9BFF',
  magentaLit: '#FF4FB8',

  // ── Derived supporting hues, all inside IPC's blue→magenta range ─────────
  violet: '#7B5BFF',
  cyan: '#00CFE0',
  sky: '#2E7BFF',
  pink: '#FF6FA8',

  /** The ground. Deep navy rather than neutral black, to sit under the blue. */
  ink: '#070C1C',
  inkSoft: '#101A3A',

  /** Paper — a cool white, because a warm cream fights IPC's blue. */
  paper: '#F2F6FF',
  paperDim: 'rgba(242, 246, 255, 0.64)',
  paperFaint: 'rgba(242, 246, 255, 0.3)',
} as const;

export const fonts = {
  /** Headlines and mood words. Swap for IPC's real typeface when available. */
  display: "'Nunito Variable', 'Nunito', system-ui, sans-serif",
  /** Everything else. */
  body: "'Inter Variable', 'Inter', system-ui, sans-serif",
} as const;

/** The kiosk screen this is designed for. Everything scales from here. */
export const STAGE = { width: 1080, height: 1920 } as const;

export type PaletteKey = keyof typeof palette;

/** The five colours the lava shader needs. Everything else it derives. */
export type LavaPalette = {
  /** Blob colour at the bottom of the vertical gradient. */
  a: string;
  /** Blob colour at the top. */
  b: string;
  /** Hot core, where blobs overlap. */
  c: string;
  /** Ground, bottom. */
  bgA: string;
  /** Ground, top. */
  bgB: string;
};

export type Rgb = [number, number, number];

/** '#E4322B' -> [0.894, 0.196, 0.169] */
export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean;
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export type RgbPalette = Record<keyof LavaPalette, Rgb>;

export function toRgbPalette(p: LavaPalette): RgbPalette {
  return { a: hexToRgb(p.a), b: hexToRgb(p.b), c: hexToRgb(p.c), bgA: hexToRgb(p.bgA), bgB: hexToRgb(p.bgB) };
}

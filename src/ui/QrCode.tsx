import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * Rendered locally rather than pulled from a QR image service — the kiosk has
 * to work with the network unplugged, and a broken image at the final beat
 * would undo the whole story.
 */
export function QrCode({ value, size = 260 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      color: { dark: '#0047B9', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).catch(() => {
      /* nothing useful to do at a kiosk — the caption still tells them where to go */
    });
  }, [value, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 14, display: 'block' }}
    />
  );
}

import { useEffect, useRef } from 'react';

/**
 * Kiosk hygiene: people wander off mid-story all the time. If the kiosk has
 * been waiting on a human for too long, abandon the session and go back to
 * idle — which also releases the camera, so the next person starts clean.
 *
 * Two things this has to get right, both learned the hard way:
 *
 *  1. It must only run on scenes that are actually WAITING for a person. The
 *     stretch from warmup through reading can legitimately take half a minute
 *     with no touch at all — someone slow to smile is still standing right
 *     there. Timing that out drops them back to idle mid-story, which is far
 *     worse than waiting.
 *  2. It must restart whenever the story moves on. Progress is evidence that
 *     somebody is still there, even when it came from a timer rather than a
 *     finger.
 */
export function useIdleTimeout(
  onTimeout: () => void,
  ms: number,
  enabled = true,
  /** Restarts the countdown whenever this changes — pass the current scene. */
  resetKey?: unknown,
) {
  const saved = useRef(onTimeout);
  saved.current = onTimeout;

  useEffect(() => {
    if (!enabled) return;

    let timer = window.setTimeout(() => saved.current(), ms);

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => saved.current(), ms);
    };

    window.addEventListener('pointerdown', reset);
    window.addEventListener('keydown', reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [ms, enabled, resetKey]);
}

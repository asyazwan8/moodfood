import { useEffect } from 'react';

/**
 * "Each step is a press." A kiosk visitor should never have to find a button,
 * so the whole screen is the button. Space and Enter mirror it for anyone
 * driving the demo from a keyboard.
 */
export function usePress(onPress: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const fire = (event: Event) => {
      // Let real buttons (the consent CTA, "something else") handle their own
      // clicks without also advancing the scene underneath them.
      if (event.target instanceof Element && event.target.closest('[data-stop-press]')) {
        return;
      }
      onPress();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onPress();
      }
    };

    window.addEventListener('pointerdown', fire);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', fire);
      window.removeEventListener('keydown', onKey);
    };
  }, [onPress, enabled]);
}

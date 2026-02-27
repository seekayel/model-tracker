const pressed = new Set<string>();

export function initInput() {
  window.addEventListener('keydown', (e) => {
    pressed.add(e.key.toLowerCase());
    // Prevent scrolling with arrow keys / space
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    pressed.delete(e.key.toLowerCase());
  });
  // Clear all keys on window blur to avoid stuck keys
  window.addEventListener('blur', () => pressed.clear());
}

export function isDown(key: string): boolean {
  return pressed.has(key.toLowerCase());
}

/** Consume a key press (returns true once, then false until released & pressed again) */
const consumed = new Set<string>();
export function wasPressed(key: string): boolean {
  const k = key.toLowerCase();
  if (pressed.has(k) && !consumed.has(k)) {
    consumed.add(k);
    return true;
  }
  if (!pressed.has(k)) {
    consumed.delete(k);
  }
  return false;
}

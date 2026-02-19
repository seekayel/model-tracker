/**
 * Tracks which keys are currently held down.
 */
const keys = new Set();

export function initInput() {
  window.addEventListener('keydown', (e) => keys.add(e.code));
  window.addEventListener('keyup', (e) => keys.delete(e.code));
}

export function isKeyDown(code) {
  return keys.has(code);
}

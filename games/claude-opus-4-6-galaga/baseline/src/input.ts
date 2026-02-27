const keysDown = new Set<string>();
const keysPressed = new Set<string>();

export function initInput(): void {
  window.addEventListener('keydown', (e) => {
    keysDown.add(e.key);
    keysPressed.add(e.key);
    // Prevent scrolling with arrow keys / space
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keysDown.delete(e.key);
  });
}

export function isKeyDown(key: string): boolean {
  return keysDown.has(key);
}

export function isKeyPressed(key: string): boolean {
  return keysPressed.has(key);
}

export function clearPressed(): void {
  keysPressed.clear();
}

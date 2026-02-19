// ── Keyboard input manager ──

const held = new Set<string>();
const justPressed = new Set<string>();

function onKeyDown(e: KeyboardEvent) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter", "Escape"].includes(e.key)) {
    e.preventDefault();
  }
  if (!held.has(e.key)) {
    justPressed.add(e.key);
  }
  held.add(e.key);
}

function onKeyUp(e: KeyboardEvent) {
  held.delete(e.key);
}

export function initInput() {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

export function isHeld(key: string): boolean {
  return held.has(key);
}

export function wasPressed(key: string): boolean {
  return justPressed.has(key);
}

export function clearFrame() {
  justPressed.clear();
}

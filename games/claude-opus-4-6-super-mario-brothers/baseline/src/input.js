const keys = {};

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Prevent scrolling with arrow keys and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}

export function isKeyDown(code) {
  return !!keys[code];
}

export function isLeft() {
  return keys['ArrowLeft'] || keys['KeyA'];
}

export function isRight() {
  return keys['ArrowRight'] || keys['KeyD'];
}

export function isJump() {
  return keys['ArrowUp'] || keys['KeyW'] || keys['Space'];
}

export function isRun() {
  return keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyX'];
}

export function isDown() {
  return keys['ArrowDown'] || keys['KeyS'];
}

export function isEnter() {
  return keys['Enter'];
}

export function clearKey(code) {
  keys[code] = false;
}

export function clearAll() {
  for (const k in keys) keys[k] = false;
}

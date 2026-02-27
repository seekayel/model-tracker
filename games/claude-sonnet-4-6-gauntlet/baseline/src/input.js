export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();
    this.justReleased = new Set();

    window.addEventListener('keydown', e => {
      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
      // Prevent scrolling with arrow keys and space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys.delete(e.code);
      this.justReleased.add(e.code);
    });
  }

  isDown(code) {
    return this.keys.has(code);
  }

  wasPressed(code) {
    return this.justPressed.has(code);
  }

  clearFrame() {
    this.justPressed.clear();
    this.justReleased.clear();
  }

  // Movement direction from WASD/Arrows
  getMovement() {
    let dx = 0, dy = 0;
    if (this.isDown('KeyW') || this.isDown('ArrowUp')) dy -= 1;
    if (this.isDown('KeyS') || this.isDown('ArrowDown')) dy += 1;
    if (this.isDown('KeyA') || this.isDown('ArrowLeft')) dx -= 1;
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) dx += 1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      const len = Math.SQRT2;
      dx /= len;
      dy /= len;
    }
    return { dx, dy };
  }

  // Shoot direction: Shift + direction key
  getShootDirection() {
    if (!this.isDown('ShiftLeft') && !this.isDown('ShiftRight')) return null;
    if (this.isDown('KeyW') || this.isDown('ArrowUp')) return { dx: 0, dy: -1 };
    if (this.isDown('KeyS') || this.isDown('ArrowDown')) return { dx: 0, dy: 1 };
    if (this.isDown('KeyA') || this.isDown('ArrowLeft')) return { dx: -1, dy: 0 };
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) return { dx: 1, dy: 0 };
    return null;
  }

  isShootPressed() {
    return this.wasPressed('Space') || this.wasPressed('Enter');
  }

  isMagicPressed() {
    return this.wasPressed('KeyE') || this.wasPressed('KeyQ');
  }
}

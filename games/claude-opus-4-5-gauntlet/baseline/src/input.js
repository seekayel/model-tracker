// Input handling module
export class InputManager {
  constructor() {
    this.keys = {};
    this.lastDirection = { x: 0, y: 1 }; // Default facing down

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  getMovement() {
    let dx = 0;
    let dy = 0;

    // WASD and Arrow keys
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy = -1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy = 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx = -1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx = 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const factor = 1 / Math.sqrt(2);
      dx *= factor;
      dy *= factor;
    }

    // Update last direction for shooting
    if (dx !== 0 || dy !== 0) {
      this.lastDirection = { x: dx, y: dy };
      // Normalize for shooting direction
      const mag = Math.sqrt(dx * dx + dy * dy);
      this.lastDirection.x /= mag;
      this.lastDirection.y /= mag;
    }

    return { dx, dy };
  }

  isAttacking() {
    return this.keys['Space'];
  }

  getAimDirection() {
    return this.lastDirection;
  }

  reset() {
    this.keys = {};
  }
}

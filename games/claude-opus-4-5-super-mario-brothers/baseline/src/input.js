// Input handler for keyboard controls
export class InputHandler {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      enter: false
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    switch(e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        e.preventDefault();
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.keys.up = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.keys.down = true;
        e.preventDefault();
        break;
      case 'Space':
        this.keys.jump = true;
        e.preventDefault();
        break;
      case 'Enter':
        this.keys.enter = true;
        e.preventDefault();
        break;
    }
  }

  handleKeyUp(e) {
    switch(e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.keys.up = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.keys.down = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
      case 'Enter':
        this.keys.enter = false;
        break;
    }
  }

  isPressed(key) {
    return this.keys[key] || false;
  }

  // Consume a key press (for one-time actions)
  consume(key) {
    if (this.keys[key]) {
      this.keys[key] = false;
      return true;
    }
    return false;
  }
}

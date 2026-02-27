export class InputHandler {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      fire: false,
      pause: false,
      start: false
    };

    this.keyDownHandlers = [];

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    switch(e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.fire = true;
        this.keys.start = true;
        break;
      case 'Enter':
        this.keys.start = true;
        break;
      case 'KeyP':
      case 'Escape':
        this.keys.pause = true;
        break;
    }

    // Prevent scrolling with arrow keys and space
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    // Notify handlers
    this.keyDownHandlers.forEach(handler => handler(e.code));
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
      case 'Space':
        this.keys.fire = false;
        this.keys.start = false;
        break;
      case 'Enter':
        this.keys.start = false;
        break;
      case 'KeyP':
      case 'Escape':
        this.keys.pause = false;
        break;
    }
  }

  onKeyDown(handler) {
    this.keyDownHandlers.push(handler);
  }

  isLeft() {
    return this.keys.left;
  }

  isRight() {
    return this.keys.right;
  }

  isFiring() {
    return this.keys.fire;
  }

  consumeStart() {
    const wasPressed = this.keys.start;
    this.keys.start = false;
    return wasPressed;
  }

  consumePause() {
    const wasPressed = this.keys.pause;
    this.keys.pause = false;
    return wasPressed;
  }
}

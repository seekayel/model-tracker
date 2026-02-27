export class InputHandler {
  constructor() {
    this.keys = {};
    this.onSpacePress = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    this.keys[e.code] = true;

    // Prevent default for game keys to avoid scrolling
    if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    // Handle space press callback
    if (e.code === 'Space' && this.onSpacePress) {
      this.onSpacePress();
    }
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
  }

  isKeyPressed(keyCode) {
    return this.keys[keyCode] === true;
  }

  // Player 1 controls (W/S)
  isPlayer1Up() {
    return this.isKeyPressed('KeyW');
  }

  isPlayer1Down() {
    return this.isKeyPressed('KeyS');
  }

  // Player 2 controls (Arrow keys)
  isPlayer2Up() {
    return this.isKeyPressed('ArrowUp');
  }

  isPlayer2Down() {
    return this.isKeyPressed('ArrowDown');
  }

  setSpaceCallback(callback) {
    this.onSpacePress = callback;
  }
}

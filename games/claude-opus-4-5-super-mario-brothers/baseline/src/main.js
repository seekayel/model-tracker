import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';

// Main entry point
class MarioGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.game = new Game();
    this.renderer = new Renderer(this.canvas);
    this.input = new InputHandler();

    this.lastTime = 0;
    this.running = true;

    // Start game loop
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    // Calculate delta time
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap delta time to prevent huge jumps
    const cappedDelta = Math.min(deltaTime, 33);

    // Update game state
    this.game.update(this.input, cappedDelta);

    // Update renderer animations
    this.renderer.update(cappedDelta);

    // Render
    this.renderer.render(this.game);

    // Continue loop
    requestAnimationFrame(this.gameLoop);
  }

  stop() {
    this.running = false;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MarioGame();
});

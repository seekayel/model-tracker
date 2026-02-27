import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import './style.css';

class PongApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.overlay = document.getElementById('overlay');

    this.game = new Game();
    this.renderer = new Renderer(this.canvas);
    this.input = new InputHandler();

    this.setupInput();
    this.startGameLoop();
  }

  setupInput() {
    this.input.setSpaceCallback(() => {
      if (this.game.isWaiting() || this.game.isGameOver()) {
        this.hideOverlay();
        this.game.start();
      } else if (this.game.isPlaying() || this.game.isPaused()) {
        this.game.togglePause();
      }
    });
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  showOverlay() {
    this.overlay.classList.remove('hidden');
  }

  startGameLoop() {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    this.game.update(this.input);
  }

  render() {
    this.renderer.render(this.game);
  }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PongApp();
});

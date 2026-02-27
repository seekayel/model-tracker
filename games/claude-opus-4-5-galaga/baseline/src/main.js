import { Game } from './game.js';
import './style.css';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');

  if (!canvas) {
    console.error('Could not find game canvas element');
    return;
  }

  const game = new Game(canvas);
  game.run();
});

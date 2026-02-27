import { Game } from './game.js';
import './style.css';

class GameApp {
  constructor() {
    this.game = null;
    this.currentScreen = 'start';

    this.screens = {
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      gameOver: document.getElementById('game-over-screen')
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Character selection buttons
    const charButtons = document.querySelectorAll('.char-btn');
    charButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const characterClass = btn.dataset.class;
        this.startGame(characterClass);
      });
    });

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.showScreen('start');
    });
  }

  showScreen(screenName) {
    for (const [name, element] of Object.entries(this.screens)) {
      if (name === screenName) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
    this.currentScreen = screenName;
  }

  startGame(characterClass) {
    this.showScreen('game');

    const canvas = document.getElementById('game-canvas');
    this.game = new Game(canvas);

    this.game.onGameOver = (score, level) => {
      document.getElementById('final-score').textContent = score;
      document.getElementById('final-level').textContent = level;
      this.showScreen('gameOver');
    };

    this.game.onLevelComplete = (newLevel) => {
      // Could add level transition effects here
      console.log(`Level ${newLevel} reached!`);
    };

    this.game.start(characterClass);
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});

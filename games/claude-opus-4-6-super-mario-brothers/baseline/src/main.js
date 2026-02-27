import './style.css';
import { initInput } from './input.js';
import { createRenderer, renderGame, renderTitleScreen, renderGameOver, renderWinScreen } from './renderer.js';
import { createGame, updateGame } from './game.js';
import { STATE } from './constants.js';

const canvas = document.getElementById('game-canvas');
const renderer = createRenderer(canvas);

initInput();

let game = createGame();

function gameLoop() {
  updateGame(game);

  switch (game.state) {
    case STATE.TITLE:
      renderTitleScreen(renderer);
      break;
    case STATE.PLAYING:
    case STATE.DYING:
    case STATE.LEVEL_COMPLETE:
      renderGame(renderer, game);
      break;
    case STATE.GAME_OVER:
      renderGameOver(renderer, game.player);
      break;
    case STATE.WIN:
      renderWinScreen(renderer, game.player);
      break;
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

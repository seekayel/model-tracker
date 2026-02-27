import Game from './game.js';

window.addEventListener('load', () => {
  const canvas = document.getElementById('game-canvas');
  const startScreen = document.getElementById('start-screen');
  const gameOverScreen = document.getElementById('game-over-screen');
  const startButton = document.getElementById('start-button');
  const restartButton = document.getElementById('restart-button');
  const finalScoreEl = document.getElementById('final-score');

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  const ctx = canvas.getContext('2d');
  let game;

  function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    game = new Game(GAME_WIDTH, GAME_HEIGHT);
    gameLoop();
  }

  function showGameOver(score) {
    gameOverScreen.style.display = 'flex';
    finalScoreEl.textContent = score;
  }

  let lastTime = 0;
  function gameLoop(timestamp) {
    if (game.gameOver) {
      showGameOver(game.score);
      return;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    game.update(deltaTime);
    game.draw(ctx);

    requestAnimationFrame(gameLoop);
  }

  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);
});

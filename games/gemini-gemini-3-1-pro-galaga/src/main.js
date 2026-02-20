import Game from './Game.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const messageEl = document.getElementById('message');
const scoreEl = document.getElementById('score');

const game = new Game(canvas.width, canvas.height, messageEl, scoreEl);

let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.update(deltaTime);
  game.draw(ctx);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

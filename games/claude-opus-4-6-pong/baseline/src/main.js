import { Input } from './input.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('game-canvas');
const input = new Input();
const game = new Game(input);
const renderer = new Renderer(canvas);

function loop() {
  game.update();
  renderer.render(game);
  requestAnimationFrame(loop);
}

loop();

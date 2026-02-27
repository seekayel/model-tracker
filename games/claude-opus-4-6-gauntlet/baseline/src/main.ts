import { initInput } from './input';
import { initRenderer } from './renderer';
import { Game } from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
initRenderer(canvas);
initInput();

const game = new Game();

let lastTime = performance.now();

function loop(now: number) {
  const dt = Math.min(now - lastTime, 50); // Cap delta to avoid spiral on tab switch
  lastTime = now;

  game.update(now, dt);
  game.draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

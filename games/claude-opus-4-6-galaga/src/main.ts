// ── Entry point ──

import { initRenderer } from "./renderer";
import { initInput } from "./input";
import { initGame, update } from "./game";

initRenderer();
initInput();
initGame();

let lastTime = performance.now();

function frame(now: number) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  update(dt);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

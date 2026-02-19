import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLOR_BG,
  COLOR_NET,
  COLOR_HUD,
  COLOR_PADDLE_LEFT,
  COLOR_PADDLE_RIGHT,
} from './constants.js';
import { drawPaddle } from './paddle.js';
import { drawBall } from './ball.js';

export function drawScene(ctx, state) {
  // Background
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Net (dashed center line)
  drawNet(ctx);

  // Paddles
  drawPaddle(ctx, state.leftPaddle, COLOR_PADDLE_LEFT);
  drawPaddle(ctx, state.rightPaddle, COLOR_PADDLE_RIGHT);

  // Ball
  if (state.phase === 'playing') {
    drawBall(ctx, state.ball);
  }

  // HUD scores
  drawHUD(ctx, state);
}

function drawNet(ctx) {
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = COLOR_NET;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawHUD(ctx, state) {
  ctx.fillStyle = COLOR_HUD;
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Left score
  ctx.fillText(String(state.scoreLeft), CANVAS_WIDTH / 2 - 60, 20);
  // Right score
  ctx.fillText(String(state.scoreRight), CANVAS_WIDTH / 2 + 60, 20);
}

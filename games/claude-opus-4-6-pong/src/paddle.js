import { CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED } from './constants.js';

export function createPaddle(x) {
  return {
    x,
    y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
  };
}

export function movePaddle(paddle, direction) {
  paddle.dy = direction * PADDLE_SPEED;
}

export function updatePaddle(paddle) {
  paddle.y += paddle.dy;

  // Clamp to canvas bounds
  if (paddle.y < 0) paddle.y = 0;
  if (paddle.y + paddle.height > CANVAS_HEIGHT) {
    paddle.y = CANVAS_HEIGHT - paddle.height;
  }
}

export function drawPaddle(ctx, paddle, color) {
  ctx.fillStyle = color;
  // Rounded rectangle
  const r = 4;
  const { x, y, width: w, height: h } = paddle;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

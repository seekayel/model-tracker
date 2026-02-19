import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_SIZE,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
  COLOR_BALL,
} from './constants.js';

export function createBall() {
  return resetBall({});
}

export function resetBall(ball, directionX = 0) {
  const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30° to 30°
  const dir = directionX || (Math.random() > 0.5 ? 1 : -1);
  const speed = BALL_INITIAL_SPEED;

  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  ball.size = BALL_SIZE;
  ball.speed = speed;
  ball.dx = Math.cos(angle) * speed * dir;
  ball.dy = Math.sin(angle) * speed;
  return ball;
}

export function updateBall(ball, leftPaddle, rightPaddle) {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top/bottom wall bounce
  if (ball.y - ball.size / 2 <= 0) {
    ball.y = ball.size / 2;
    ball.dy = Math.abs(ball.dy);
  }
  if (ball.y + ball.size / 2 >= CANVAS_HEIGHT) {
    ball.y = CANVAS_HEIGHT - ball.size / 2;
    ball.dy = -Math.abs(ball.dy);
  }

  // Left paddle collision
  if (
    ball.dx < 0 &&
    ball.x - ball.size / 2 <= leftPaddle.x + leftPaddle.width &&
    ball.x - ball.size / 2 >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height
  ) {
    handlePaddleHit(ball, leftPaddle, 1);
  }

  // Right paddle collision
  if (
    ball.dx > 0 &&
    ball.x + ball.size / 2 >= rightPaddle.x &&
    ball.x + ball.size / 2 <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height
  ) {
    handlePaddleHit(ball, rightPaddle, -1);
  }

  // Score detection: ball exits left or right
  if (ball.x + ball.size / 2 < 0) return 'right';
  if (ball.x - ball.size / 2 > CANVAS_WIDTH) return 'left';

  return null;
}

function handlePaddleHit(ball, paddle, dirX) {
  // Where on the paddle did it hit? -1 (top) to 1 (bottom)
  const hitPos = ((ball.y - paddle.y) / paddle.height) * 2 - 1;
  const maxAngle = Math.PI / 4; // 45°
  const angle = hitPos * maxAngle;

  ball.speed = Math.min(ball.speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
  ball.dx = Math.cos(angle) * ball.speed * dirX;
  ball.dy = Math.sin(angle) * ball.speed;

  // Push ball out of paddle to prevent double-hit
  if (dirX === 1) {
    ball.x = paddle.x + paddle.width + ball.size / 2;
  } else {
    ball.x = paddle.x - ball.size / 2;
  }
}

export function drawBall(ctx, ball) {
  ctx.fillStyle = COLOR_BALL;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Subtle glow
  ctx.shadowColor = COLOR_BALL;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

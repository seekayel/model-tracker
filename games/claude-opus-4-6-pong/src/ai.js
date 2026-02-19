import { CANVAS_HEIGHT, PADDLE_SPEED } from './constants.js';

/**
 * Simple AI that tracks the ball with slight imperfection.
 */
export function updateAI(paddle, ball) {
  const paddleCenter = paddle.y + paddle.height / 2;
  const diff = ball.y - paddleCenter;

  // Dead zone so AI doesn't jitter
  const deadZone = 15;

  if (Math.abs(diff) < deadZone) {
    paddle.dy = 0;
  } else if (diff > 0) {
    paddle.dy = Math.min(PADDLE_SPEED * 0.85, diff);
  } else {
    paddle.dy = Math.max(-PADDLE_SPEED * 0.85, diff);
  }

  // Apply movement
  paddle.y += paddle.dy;
  if (paddle.y < 0) paddle.y = 0;
  if (paddle.y + paddle.height > CANVAS_HEIGHT) {
    paddle.y = CANVAS_HEIGHT - paddle.height;
  }
}

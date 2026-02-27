import { PADDLE_SPEED, AI_SPEED_FACTOR, PADDLE_HEIGHT } from './constants.js';

// Simple AI: tracks the ball with imperfect reaction zone
export class AI {
  constructor(paddle) {
    this.paddle = paddle;
    this.speed = PADDLE_SPEED * AI_SPEED_FACTOR;
    // Dead zone: fraction of paddle height where AI won't move
    this.deadZone = PADDLE_HEIGHT * 0.12;
  }

  update(ball) {
    const paddleCenter = this.paddle.centerY;
    const diff = ball.y - paddleCenter;

    if (diff > this.deadZone) {
      this.paddle.dy = this.speed;
    } else if (diff < -this.deadZone) {
      this.paddle.dy = -this.speed;
    } else {
      this.paddle.dy = 0;
    }
  }
}

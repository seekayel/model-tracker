import { AI_REACTION_SPEED } from './constants.js';

export class AI {
  constructor(paddle) {
    this.paddle = paddle;
  }

  update(ball) {
    const targetY = ball.y;
    const currentY = this.paddle.centerY();
    const diff = targetY - currentY;

    // Smoothly track the ball with limited reaction speed
    this.paddle.y += diff * AI_REACTION_SPEED;
    this.paddle.clamp();
  }
}

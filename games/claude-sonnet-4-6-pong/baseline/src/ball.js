import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_SIZE,
  BALL_INITIAL_SPEED,
  BALL_SPEED_INCREMENT,
  BALL_MAX_SPEED,
} from './constants.js';

export class Ball {
  constructor() {
    this.size = BALL_SIZE;
    this.reset();
  }

  reset(direction = 0) {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;

    // Random angle between -40 and 40 degrees from horizontal
    const angle = (Math.random() * 80 - 40) * (Math.PI / 180);
    const speed = BALL_INITIAL_SPEED;

    // direction: 1 = right, -1 = left, 0 = random
    const dir = direction !== 0 ? direction : (Math.random() < 0.5 ? 1 : -1);
    this.dx = Math.cos(angle) * speed * dir;
    this.dy = Math.sin(angle) * speed;
    this.speed = speed;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    // Bounce off top and bottom walls
    if (this.y - this.size / 2 <= 0) {
      this.y = this.size / 2;
      this.dy = Math.abs(this.dy);
    }
    if (this.y + this.size / 2 >= CANVAS_HEIGHT) {
      this.y = CANVAS_HEIGHT - this.size / 2;
      this.dy = -Math.abs(this.dy);
    }
  }

  bouncePaddle(paddle) {
    // Relative hit position: -1 (top) to 1 (bottom)
    const relHit = (this.y - paddle.centerY) / (paddle.height / 2);
    const clampedHit = Math.max(-1, Math.min(1, relHit));

    // Bounce angle: up to 75 degrees
    const bounceAngle = clampedHit * 75 * (Math.PI / 180);

    // Increase speed slightly
    this.speed = Math.min(this.speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);

    // Determine direction based on which paddle was hit
    const dir = this.dx < 0 ? 1 : -1;
    this.dx = Math.cos(bounceAngle) * this.speed * dir;
    this.dy = Math.sin(bounceAngle) * this.speed;
  }

  // Check collision with a paddle rect
  collidesWithPaddle(paddle) {
    return (
      this.x - this.size / 2 < paddle.x + paddle.width &&
      this.x + this.size / 2 > paddle.x &&
      this.y - this.size / 2 < paddle.y + paddle.height &&
      this.y + this.size / 2 > paddle.y
    );
  }

  // Returns 'left', 'right', or null
  getScoredSide() {
    if (this.x + this.size / 2 < 0) return 'left';
    if (this.x - this.size / 2 > CANVAS_WIDTH) return 'right';
    return null;
  }
}

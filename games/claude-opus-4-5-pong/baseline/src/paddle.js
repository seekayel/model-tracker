import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, CANVAS_HEIGHT } from './constants.js';

export class Paddle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.speed = PADDLE_SPEED;
    this.velocityY = 0;
  }

  moveUp() {
    this.velocityY = -this.speed;
  }

  moveDown() {
    this.velocityY = this.speed;
  }

  stop() {
    this.velocityY = 0;
  }

  update() {
    this.y += this.velocityY;

    // Keep paddle within canvas bounds
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y + this.height > CANVAS_HEIGHT) {
      this.y = CANVAS_HEIGHT - this.height;
    }
  }

  reset(y) {
    this.y = y;
    this.velocityY = 0;
  }

  // Get center Y position for ball collision calculations
  getCenterY() {
    return this.y + this.height / 2;
  }

  // Check if a point is within the paddle bounds
  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

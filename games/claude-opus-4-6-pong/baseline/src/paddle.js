import {
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
} from './constants.js';

export class Paddle {
  constructor(x) {
    this.x = x;
    this.y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.speed = PADDLE_SPEED;
    this.dy = 0;
  }

  moveUp() {
    this.dy = -this.speed;
  }

  moveDown() {
    this.dy = this.speed;
  }

  stop() {
    this.dy = 0;
  }

  moveTo(targetY) {
    this.y = targetY - this.height / 2;
    this.clamp();
  }

  update() {
    this.y += this.dy;
    this.clamp();
  }

  clamp() {
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > CANVAS_HEIGHT) this.y = CANVAS_HEIGHT - this.height;
  }

  centerY() {
    return this.y + this.height / 2;
  }

  reset() {
    this.y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    this.dy = 0;
  }
}

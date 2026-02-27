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
    this.reset(1);
  }

  reset(direction) {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.speed = BALL_INITIAL_SPEED;

    const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
    this.dx = Math.cos(angle) * this.speed * direction;
    this.dy = Math.sin(angle) * this.speed;
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

  bounceOffPaddle(paddle) {
    const relativeHit = (this.y - paddle.centerY()) / (paddle.height / 2);
    const bounceAngle = relativeHit * (Math.PI / 3);

    this.speed = Math.min(this.speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);

    const direction = this.dx > 0 ? -1 : 1;
    this.dx = Math.cos(bounceAngle) * this.speed * direction;
    this.dy = Math.sin(bounceAngle) * this.speed;
  }

  collidesWithPaddle(paddle) {
    return (
      this.x - this.size / 2 < paddle.x + paddle.width &&
      this.x + this.size / 2 > paddle.x &&
      this.y + this.size / 2 > paddle.y &&
      this.y - this.size / 2 < paddle.y + paddle.height
    );
  }

  isOutLeft() {
    return this.x + this.size / 2 < 0;
  }

  isOutRight() {
    return this.x - this.size / 2 > CANVAS_WIDTH;
  }
}

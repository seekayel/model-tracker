import {
  BALL_SIZE,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from './constants.js';

export class Ball {
  constructor() {
    this.size = BALL_SIZE;
    this.reset();
  }

  reset() {
    // Center the ball
    this.x = CANVAS_WIDTH / 2 - this.size / 2;
    this.y = CANVAS_HEIGHT / 2 - this.size / 2;

    // Random initial direction
    const angle = (Math.random() * Math.PI / 4) - Math.PI / 8; // -22.5 to 22.5 degrees
    const direction = Math.random() < 0.5 ? 1 : -1;

    this.speed = BALL_INITIAL_SPEED;
    this.velocityX = Math.cos(angle) * this.speed * direction;
    this.velocityY = Math.sin(angle) * this.speed;
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Bounce off top and bottom walls
    if (this.y <= 0) {
      this.y = 0;
      this.velocityY = -this.velocityY;
    }
    if (this.y + this.size >= CANVAS_HEIGHT) {
      this.y = CANVAS_HEIGHT - this.size;
      this.velocityY = -this.velocityY;
    }
  }

  // Check collision with a paddle
  checkPaddleCollision(paddle) {
    const ballLeft = this.x;
    const ballRight = this.x + this.size;
    const ballTop = this.y;
    const ballBottom = this.y + this.size;

    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    // Check if ball overlaps with paddle
    if (
      ballRight >= paddleLeft &&
      ballLeft <= paddleRight &&
      ballBottom >= paddleTop &&
      ballTop <= paddleBottom
    ) {
      return true;
    }
    return false;
  }

  // Handle bounce off paddle with angle variation
  bounceOffPaddle(paddle) {
    // Calculate where the ball hit the paddle (normalized -1 to 1)
    const ballCenterY = this.y + this.size / 2;
    const paddleCenterY = paddle.y + paddle.height / 2;
    const relativeIntersectY = (ballCenterY - paddleCenterY) / (paddle.height / 2);

    // Calculate new angle based on where ball hit paddle
    const maxBounceAngle = Math.PI / 4; // 45 degrees max
    const bounceAngle = relativeIntersectY * maxBounceAngle;

    // Increase speed slightly
    this.speed = Math.min(this.speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);

    // Determine direction based on which paddle was hit
    const direction = this.velocityX > 0 ? -1 : 1;

    this.velocityX = Math.cos(bounceAngle) * this.speed * direction;
    this.velocityY = Math.sin(bounceAngle) * this.speed;

    // Prevent ball from getting stuck inside paddle
    if (direction === -1) {
      this.x = paddle.x - this.size;
    } else {
      this.x = paddle.x + paddle.width;
    }
  }

  // Check if ball went out of bounds (scored)
  checkOutOfBounds() {
    if (this.x + this.size < 0) {
      return 'right'; // Right player scores
    }
    if (this.x > CANVAS_WIDTH) {
      return 'left'; // Left player scores
    }
    return null;
  }

  getCenterX() {
    return this.x + this.size / 2;
  }

  getCenterY() {
    return this.y + this.size / 2;
  }
}

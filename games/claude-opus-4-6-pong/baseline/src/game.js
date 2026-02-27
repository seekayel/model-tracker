import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  WINNING_SCORE,
} from './constants.js';
import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { AI } from './ai.js';

export class Game {
  constructor(input) {
    this.input = input;
    this.winScore = WINNING_SCORE;

    this.playerPaddle = new Paddle(PADDLE_MARGIN);
    this.aiPaddle = new Paddle(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH);
    this.ball = new Ball();
    this.ai = new AI(this.aiPaddle);

    this.playerScore = 0;
    this.aiScore = 0;
    this.state = 'waiting'; // waiting | playing | scored | gameover
    this.scorePauseTimer = 0;
  }

  start() {
    this.playerScore = 0;
    this.aiScore = 0;
    this.playerPaddle.reset();
    this.aiPaddle.reset();
    this.ball.reset(1);
    this.state = 'playing';
  }

  update() {
    if (this.state === 'waiting' || this.state === 'gameover') {
      if (this.input.isDown(' ')) {
        this.start();
      }
      return;
    }

    if (this.state === 'scored') {
      this.scorePauseTimer--;
      if (this.scorePauseTimer <= 0) {
        this.state = 'playing';
      }
      return;
    }

    // Player movement
    if (this.input.isDown('ArrowUp') || this.input.isDown('w')) {
      this.playerPaddle.moveUp();
    } else if (this.input.isDown('ArrowDown') || this.input.isDown('s')) {
      this.playerPaddle.moveDown();
    } else {
      this.playerPaddle.stop();
    }

    this.playerPaddle.update();
    this.ai.update(this.ball);
    this.ball.update();

    // Ball-paddle collisions
    if (this.ball.collidesWithPaddle(this.playerPaddle)) {
      this.ball.x = this.playerPaddle.x + this.playerPaddle.width + this.ball.size / 2;
      this.ball.bounceOffPaddle(this.playerPaddle);
    }

    if (this.ball.collidesWithPaddle(this.aiPaddle)) {
      this.ball.x = this.aiPaddle.x - this.ball.size / 2;
      this.ball.bounceOffPaddle(this.aiPaddle);
    }

    // Scoring
    if (this.ball.isOutRight()) {
      this.playerScore++;
      this.onScore(-1);
    } else if (this.ball.isOutLeft()) {
      this.aiScore++;
      this.onScore(1);
    }
  }

  onScore(nextServeDirection) {
    if (this.playerScore >= this.winScore || this.aiScore >= this.winScore) {
      this.state = 'gameover';
    } else {
      this.state = 'scored';
      this.scorePauseTimer = 45; // ~0.75s at 60fps
      this.playerPaddle.reset();
      this.aiPaddle.reset();
      this.ball.reset(nextServeDirection);
    }
  }
}

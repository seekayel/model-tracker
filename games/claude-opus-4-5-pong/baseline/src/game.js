import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_HEIGHT,
  WINNING_SCORE,
  GAME_STATE
} from './constants.js';

export class Game {
  constructor() {
    this.state = GAME_STATE.WAITING;
    this.player1Score = 0;
    this.player2Score = 0;

    // Create paddles
    const paddleStartY = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    this.paddle1 = new Paddle(PADDLE_MARGIN, paddleStartY);
    this.paddle2 = new Paddle(CANVAS_WIDTH - PADDLE_MARGIN - this.paddle1.width, paddleStartY);

    // Create ball
    this.ball = new Ball();
  }

  start() {
    if (this.state === GAME_STATE.WAITING || this.state === GAME_STATE.GAME_OVER) {
      this.reset();
      this.state = GAME_STATE.PLAYING;
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
    }
  }

  pause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
    }
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
    }
  }

  reset() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.resetRound();
  }

  resetRound() {
    const paddleStartY = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    this.paddle1.reset(paddleStartY);
    this.paddle2.reset(paddleStartY);
    this.ball.reset();
  }

  update(input) {
    if (this.state !== GAME_STATE.PLAYING) {
      return;
    }

    // Handle paddle input
    this.handleInput(input);

    // Update paddles
    this.paddle1.update();
    this.paddle2.update();

    // Update ball
    this.ball.update();

    // Check collisions
    this.checkCollisions();

    // Check for scoring
    this.checkScoring();
  }

  handleInput(input) {
    // Player 1 (left paddle)
    if (input.isPlayer1Up()) {
      this.paddle1.moveUp();
    } else if (input.isPlayer1Down()) {
      this.paddle1.moveDown();
    } else {
      this.paddle1.stop();
    }

    // Player 2 (right paddle)
    if (input.isPlayer2Up()) {
      this.paddle2.moveUp();
    } else if (input.isPlayer2Down()) {
      this.paddle2.moveDown();
    } else {
      this.paddle2.stop();
    }
  }

  checkCollisions() {
    // Ball collision with paddle 1 (left)
    if (this.ball.velocityX < 0 && this.ball.checkPaddleCollision(this.paddle1)) {
      this.ball.bounceOffPaddle(this.paddle1);
    }

    // Ball collision with paddle 2 (right)
    if (this.ball.velocityX > 0 && this.ball.checkPaddleCollision(this.paddle2)) {
      this.ball.bounceOffPaddle(this.paddle2);
    }
  }

  checkScoring() {
    const scorer = this.ball.checkOutOfBounds();

    if (scorer === 'left') {
      this.player1Score++;
      this.checkWinCondition();
      if (this.state === GAME_STATE.PLAYING) {
        this.resetRound();
      }
    } else if (scorer === 'right') {
      this.player2Score++;
      this.checkWinCondition();
      if (this.state === GAME_STATE.PLAYING) {
        this.resetRound();
      }
    }
  }

  checkWinCondition() {
    if (this.player1Score >= WINNING_SCORE || this.player2Score >= WINNING_SCORE) {
      this.state = GAME_STATE.GAME_OVER;
    }
  }

  isPlaying() {
    return this.state === GAME_STATE.PLAYING;
  }

  isPaused() {
    return this.state === GAME_STATE.PAUSED;
  }

  isWaiting() {
    return this.state === GAME_STATE.WAITING;
  }

  isGameOver() {
    return this.state === GAME_STATE.GAME_OVER;
  }

  getWinner() {
    if (this.player1Score >= WINNING_SCORE) {
      return 1;
    }
    if (this.player2Score >= WINNING_SCORE) {
      return 2;
    }
    return null;
  }
}

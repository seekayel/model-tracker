import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { AI } from './ai.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import {
  CANVAS_WIDTH,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  GAME_STATE,
  WINNING_SCORE,
} from './constants.js';

export class Game {
  constructor(canvas) {
    this.renderer = new Renderer(canvas);
    this.input = new Input();

    // Left paddle = player, Right paddle = AI
    this.paddleLeft = new Paddle(PADDLE_MARGIN);
    this.paddleRight = new Paddle(
      CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH
    );
    this.ball = new Ball();
    this.ai = new AI(this.paddleRight);

    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.state = GAME_STATE.WAITING;
    this.winner = null;

    this._lastTime = null;
    this._rafId = null;
    this._loop = this._loop.bind(this);
  }

  start() {
    this._rafId = requestAnimationFrame(this._loop);
  }

  stop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this.input.destroy();
  }

  _loop(timestamp) {
    this._rafId = requestAnimationFrame(this._loop);
    // Cap delta to avoid spiral of death on tab focus return
    const delta = Math.min(timestamp - (this._lastTime ?? timestamp), 50);
    this._lastTime = timestamp;

    this._update(delta);
    this._draw();
  }

  _update(_delta) {
    const { input, state } = this;

    // Space to advance state
    if (input.isDown('Space')) {
      if (!this._spaceWasDown) {
        this._spaceWasDown = true;
        if (state === GAME_STATE.WAITING || state === GAME_STATE.GAME_OVER) {
          this._newGame();
        } else if (state === GAME_STATE.SCORED) {
          this._newRound();
        }
      }
    } else {
      this._spaceWasDown = false;
    }

    if (state !== GAME_STATE.PLAYING) return;

    // Player controls (W/S or Up/Down arrows)
    if (input.isAnyDown('KeyW', 'ArrowUp')) {
      this.paddleLeft.moveUp();
    } else if (input.isAnyDown('KeyS', 'ArrowDown')) {
      this.paddleLeft.moveDown();
    } else {
      this.paddleLeft.stop();
    }

    this.paddleLeft.update();

    // AI controls right paddle
    this.ai.update(this.ball);
    this.paddleRight.update();

    // Ball update
    this.ball.update();

    // Ball-paddle collision
    if (
      this.ball.dx < 0 &&
      this.ball.collidesWithPaddle(this.paddleLeft)
    ) {
      // Push ball out of paddle before bouncing
      this.ball.x = this.paddleLeft.x + this.paddleLeft.width + this.ball.size / 2;
      this.ball.bouncePaddle(this.paddleLeft);
    } else if (
      this.ball.dx > 0 &&
      this.ball.collidesWithPaddle(this.paddleRight)
    ) {
      this.ball.x = this.paddleRight.x - this.ball.size / 2;
      this.ball.bouncePaddle(this.paddleRight);
    }

    // Check scoring
    const scored = this.ball.getScoredSide();
    if (scored === 'left') {
      // AI scores
      this.scoreRight += 1;
      this._handleScore();
    } else if (scored === 'right') {
      // Player scores
      this.scoreLeft += 1;
      this._handleScore();
    }
  }

  _handleScore() {
    if (this.scoreLeft >= WINNING_SCORE) {
      this.winner = 'player';
      this.state = GAME_STATE.GAME_OVER;
    } else if (this.scoreRight >= WINNING_SCORE) {
      this.winner = 'ai';
      this.state = GAME_STATE.GAME_OVER;
    } else {
      this.state = GAME_STATE.SCORED;
    }
  }

  _newGame() {
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.winner = null;
    this.paddleLeft.reset();
    this.paddleRight.reset();
    this._newRound();
  }

  _newRound() {
    this.paddleLeft.reset();
    this.paddleRight.reset();
    // Serve toward the player who just got scored on (or random)
    this.ball.reset(0);
    this.state = GAME_STATE.PLAYING;
  }

  _draw() {
    this.renderer.render(
      this.state,
      this.paddleLeft,
      this.paddleRight,
      this.ball,
      this.scoreLeft,
      this.scoreRight,
      this.winner
    );
  }
}

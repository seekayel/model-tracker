import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  GAME_STATE,
  WINNING_SCORE,
} from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
  }

  clear() {
    const { ctx } = this;
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawCenterLine() {
    const { ctx } = this;
    ctx.setLineDash([12, 16]);
    ctx.strokeStyle = COLORS.centerLine;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawPaddle(paddle) {
    const { ctx } = this;
    ctx.fillStyle = COLORS.paddle;
    const r = 6;
    const { x, y, width: w, height: h } = paddle;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  drawBall(ball) {
    const { ctx } = this;
    ctx.fillStyle = COLORS.ball;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawScores(scoreLeft, scoreRight) {
    const { ctx } = this;
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = COLORS.score;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(scoreLeft, CANVAS_WIDTH / 4, 24);
    ctx.fillText(scoreRight, (CANVAS_WIDTH * 3) / 4, 24);
  }

  drawHUD(playerLabel, aiLabel) {
    const { ctx } = this;
    ctx.font = '14px monospace';
    ctx.fillStyle = COLORS.hud;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(playerLabel, CANVAS_WIDTH / 4, CANVAS_HEIGHT - 8);
    ctx.fillText(aiLabel, (CANVAS_WIDTH * 3) / 4, CANVAS_HEIGHT - 8);
  }

  drawOverlay(state, winner) {
    const { ctx } = this;

    if (state === GAME_STATE.WAITING) {
      this._drawCenteredText(
        'PONG',
        72,
        COLORS.winText,
        CANVAS_HEIGHT / 2 - 60
      );
      this._drawCenteredText(
        'Press SPACE to start',
        22,
        COLORS.hud,
        CANVAS_HEIGHT / 2 + 10
      );
      this._drawCenteredText(
        `First to ${WINNING_SCORE} wins`,
        16,
        COLORS.dimText,
        CANVAS_HEIGHT / 2 + 46
      );
    } else if (state === GAME_STATE.SCORED) {
      this._drawCenteredText(
        'Press SPACE to continue',
        20,
        COLORS.hud,
        CANVAS_HEIGHT / 2 + 10
      );
    } else if (state === GAME_STATE.GAME_OVER) {
      const msg = winner === 'player' ? 'YOU WIN!' : 'AI WINS!';
      this._drawCenteredText(msg, 64, COLORS.winText, CANVAS_HEIGHT / 2 - 50);
      this._drawCenteredText(
        'Press SPACE to play again',
        22,
        COLORS.hud,
        CANVAS_HEIGHT / 2 + 20
      );
    }
  }

  _drawCenteredText(text, fontSize, color, y) {
    const { ctx } = this;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, CANVAS_WIDTH / 2, y);
  }

  render(state, paddleLeft, paddleRight, ball, scoreLeft, scoreRight, winner) {
    this.clear();
    this.drawCenterLine();
    this.drawScores(scoreLeft, scoreRight);
    this.drawHUD('PLAYER  W/S', 'CPU  AI');

    if (state !== GAME_STATE.WAITING) {
      this.drawPaddle(paddleLeft);
      this.drawPaddle(paddleRight);
    }

    if (state === GAME_STATE.PLAYING) {
      this.drawBall(ball);
    }

    if (state !== GAME_STATE.PLAYING) {
      this.drawOverlay(state, winner);
    }
  }
}

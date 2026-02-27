import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
} from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
  }

  clear() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawMidline() {
    this.ctx.setLineDash([8, 8]);
    this.ctx.strokeStyle = COLORS.midline;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(CANVAS_WIDTH / 2, 0);
    this.ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawPaddle(paddle) {
    this.ctx.fillStyle = COLORS.paddle;
    this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  drawBall(ball) {
    this.ctx.fillStyle = COLORS.ball;
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawScore(leftScore, rightScore) {
    this.ctx.fillStyle = COLORS.score;
    this.ctx.font = '48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(leftScore, CANVAS_WIDTH / 4, 60);
    this.ctx.fillText(rightScore, (CANVAS_WIDTH * 3) / 4, 60);
  }

  drawMessage(text, subtext) {
    this.ctx.fillStyle = COLORS.message;
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

    if (subtext) {
      this.ctx.font = '16px monospace';
      this.ctx.fillText(subtext, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }
  }

  render(game) {
    this.clear();
    this.drawMidline();
    this.drawPaddle(game.playerPaddle);
    this.drawPaddle(game.aiPaddle);
    this.drawScore(game.playerScore, game.aiScore);

    if (game.state === 'waiting') {
      this.drawMessage('PONG', 'Press SPACE to start');
    } else if (game.state === 'playing') {
      this.drawBall(game.ball);
    } else if (game.state === 'scored') {
      this.drawBall(game.ball);
    } else if (game.state === 'gameover') {
      const winner = game.playerScore >= game.winScore ? 'You win!' : 'CPU wins!';
      this.drawMessage(winner, 'Press SPACE to play again');
    }
  }
}

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Set canvas size
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
  }

  clear() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawCenterLine() {
    this.ctx.strokeStyle = COLORS.centerLine;
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([20, 15]);

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
    this.ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
  }

  drawScore(player1Score, player2Score) {
    this.ctx.fillStyle = COLORS.score;
    this.ctx.font = 'bold 64px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    // Player 1 score (left side)
    this.ctx.fillText(player1Score.toString(), CANVAS_WIDTH / 4, 30);

    // Player 2 score (right side)
    this.ctx.fillText(player2Score.toString(), (CANVAS_WIDTH * 3) / 4, 30);
  }

  drawGameOver(winner) {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Winner text
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`PLAYER ${winner} WINS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    // Restart instruction
    this.ctx.font = '24px monospace';
    this.ctx.fillText('Press SPACE to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  }

  drawPaused() {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Paused text
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  render(game) {
    this.clear();
    this.drawCenterLine();
    this.drawPaddle(game.paddle1);
    this.drawPaddle(game.paddle2);
    this.drawBall(game.ball);
    this.drawScore(game.player1Score, game.player2Score);

    if (game.isGameOver()) {
      this.drawGameOver(game.getWinner());
    } else if (game.isPaused()) {
      this.drawPaused();
    }
  }
}

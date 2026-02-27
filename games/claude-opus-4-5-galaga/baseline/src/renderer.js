import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, PLAYER_START_LIVES } from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
  }

  clear() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawHUD(score, lives, highScore, wave) {
    this.ctx.font = '16px "Courier New", monospace';
    this.ctx.textAlign = 'left';

    // Score
    this.ctx.fillStyle = COLORS.hud;
    this.ctx.fillText('SCORE', 20, 25);
    this.ctx.fillStyle = COLORS.hudScore;
    this.ctx.fillText(score.toString().padStart(6, '0'), 20, 45);

    // High Score
    this.ctx.fillStyle = COLORS.hud;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('HIGH SCORE', CANVAS_WIDTH / 2, 25);
    this.ctx.fillStyle = COLORS.hudScore;
    this.ctx.fillText(highScore.toString().padStart(6, '0'), CANVAS_WIDTH / 2, 45);

    // Wave
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = COLORS.hud;
    this.ctx.fillText('WAVE', CANVAS_WIDTH - 20, 25);
    this.ctx.fillStyle = COLORS.hudScore;
    this.ctx.fillText(wave.toString(), CANVAS_WIDTH - 20, 45);

    // Lives (draw ship icons)
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = COLORS.hud;
    this.ctx.fillText('LIVES', 20, CANVAS_HEIGHT - 30);

    for (let i = 0; i < lives; i++) {
      this.drawLifeIcon(80 + i * 25, CANVAS_HEIGHT - 35);
    }
  }

  drawLifeIcon(x, y) {
    this.ctx.fillStyle = COLORS.player;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 6);
    this.ctx.lineTo(x + 6, y + 6);
    this.ctx.lineTo(x, y + 2);
    this.ctx.lineTo(x - 6, y + 6);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawWaveIntro(wave) {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px "Courier New", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`WAVE ${wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.ctx.font = '16px "Courier New", monospace';
    this.ctx.fillText('GET READY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  }

  getContext() {
    return this.ctx;
  }
}

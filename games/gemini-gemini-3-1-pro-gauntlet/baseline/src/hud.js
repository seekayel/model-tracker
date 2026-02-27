export default class HUD {
  constructor(game) {
    this.game = game;
    this.fontSize = 25;
    this.fontFamily = 'Courier New';
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    
    // Score
    ctx.fillText(`Score: ${this.game.score}`, 20, 40);

    // Health
    ctx.fillText(`Health: ${this.game.health}`, 20, 80);

    // Game Over
    if (this.game.gameOver) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'red';
      ctx.font = `50px ${this.fontFamily}`;
      ctx.fillText('GAME OVER', this.game.width / 2, this.game.height / 2);
    }
    ctx.restore();
  }
}

export default class Projectile {
  constructor(game, x, y, speedX, speedY) {
    this.game = game;
    this.width = 10;
    this.height = 10;
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    this.speedX = speedX;
    this.speedY = speedY;
    this.markedForDeletion = false;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > this.game.width || this.y < 0 || this.y > this.game.height) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

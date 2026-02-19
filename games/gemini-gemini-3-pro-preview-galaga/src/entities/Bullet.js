export default class Bullet {
  constructor(x, y, dy, color) {
    this.x = x;
    this.y = y;
    this.dy = dy;
    this.color = color;
    this.width = 4;
    this.height = 10;
    this.markedForDeletion = false;
  }

  update() {
    this.y += this.dy;
    if (this.y < 0 || this.y > 800) { // Screen height is around 640 but give buffer
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  }
}

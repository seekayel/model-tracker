export class Paddle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public speed: number;
  private canvasHeight: number;

  constructor(x: number, y: number, width: number, height: number, speed: number, canvasHeight: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.canvasHeight = canvasHeight;
  }

  moveUp() {
    this.y -= this.speed;
    if (this.y < 0) {
      this.y = 0;
    }
  }

  moveDown() {
    this.y += this.speed;
    if (this.y + this.height > this.canvasHeight) {
      this.y = this.canvasHeight - this.height;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

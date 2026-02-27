export class Ball {
    public x: number;
    public y: number;
    public radius: number;
    public speedX: number;
    public speedY: number;
    private canvasWidth: number;
    private canvasHeight: number;
  
    constructor(x: number, y: number, radius: number, speedX: number, speedY: number, canvasWidth: number, canvasHeight: number) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.speedX = speedX;
      this.speedY = speedY;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
    }
  
    move() {
      this.x += this.speedX;
      this.y += this.speedY;
    }

    reset(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.speedX = -this.speedX;
        this.speedY = Math.random() > 0.5 ? Math.random() * 3 + 2 : -(Math.random() * 3 + 2);
    }
  
    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
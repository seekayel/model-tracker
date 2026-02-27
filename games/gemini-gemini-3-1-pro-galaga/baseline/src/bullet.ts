export class Bullet {
    public x: number;
    public y: number;
    public width: number = 5;
    public height: number = 10;
    public speed: number = 7;
    public color: string = 'yellow';

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    update() {
        this.y -= this.speed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

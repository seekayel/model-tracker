import { Bullet } from './bullet';
import { InputHandler } from './input';

export class Player {
    public x: number;
    public y: number;
    public width: number = 50;
    public height: number = 30;
    public speed: number = 5;
    public color: string = 'blue';
    private canvasWidth: number;
    private bullets: Bullet[] = [];
    private shootCooldown: number = 30; // frames
    private shootTimer: number = 0;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height - 20;
    }

    update(input: InputHandler) {
        if (input.isKeyPressed('ArrowLeft') && this.x > 0) {
            this.x -= this.speed;
        }
        if (input.isKeyPressed('ArrowRight') && this.x < this.canvasWidth - this.width) {
            this.x += this.speed;
        }

        if (this.shootTimer > 0) {
            this.shootTimer--;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    shoot(): Bullet | null {
        if (this.shootTimer <= 0) {
            this.shootTimer = this.shootCooldown;
            return new Bullet(this.x + this.width / 2 - 2.5, this.y);
        }
        return null;
    }
}

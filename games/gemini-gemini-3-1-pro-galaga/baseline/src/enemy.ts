export class Enemy {
    public x: number;
    public y: number;
    public width: number = 40;
    public height: number = 30;
    public color: string = 'red';
    public isAlive: boolean = true;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.isAlive) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

export class EnemyFleet {
    public enemies: Enemy[] = [];
    private x: number;
    private y: number;
    private direction: number = 1;
    private speed: number = 0.5;
    private dropAmount: number = 30;
    private canvasWidth: number;

    constructor(canvasWidth: number) {
        this.canvasWidth = canvasWidth;
        this.x = 0;
        this.y = 50;
        this.createFleet();
    }

    createFleet() {
        const rows = 4;
        const cols = 8;
        const enemySpacing = 50;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * (enemySpacing + 10) + 50;
                const y = r * (enemySpacing) + 50;
                this.enemies.push(new Enemy(x, y));
            }
        }
    }

    update() {
        let reachedEdge = false;
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            enemy.x += this.speed * this.direction;
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvasWidth) {
                reachedEdge = true;
            }
        }

        if (reachedEdge) {
            this.direction *= -1;
            for (const enemy of this.enemies) {
                enemy.y += this.dropAmount;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }
}

export default class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.width = 40;
        this.height = 30;
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.fillStyle = '#f00'; // Red enemies
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

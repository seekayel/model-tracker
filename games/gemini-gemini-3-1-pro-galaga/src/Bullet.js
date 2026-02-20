export default class Bullet {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = -8;
        this.isBullet = true;
    }

    update(keys, deltaTime) {
        this.y += this.speed * (deltaTime / 16); // Normalize speed
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

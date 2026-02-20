import Bullet from './Bullet.js';

export default class Player {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 30;
        this.reset();

        this.speed = 0.5;
        this.bulletCooldown = 0;
        this.bulletReady = true;
    }

    reset() {
        this.x = (this.game.gameWidth - this.width) / 2;
        this.y = this.game.gameHeight - this.height - 20;
    }

    update(keys, deltaTime) {
        // Movement
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.x -= this.speed * deltaTime;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.x += this.speed * deltaTime;
        }

        // Clamp position
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.gameWidth - this.width) {
            this.x = this.game.gameWidth - this.width;
        }

        // Shooting
        if (!this.bulletReady) {
            this.bulletCooldown -= deltaTime;
            if (this.bulletCooldown <= 0) {
                this.bulletReady = true;
            }
        }

        if (keys['Space'] && this.bulletReady) {
            this.shoot();
        }
    }

    shoot() {
        const bullet = new Bullet(this.x + this.width / 2 - 2.5, this.y, 5, 10, '#0f0');
        this.game.gameObjects.push(bullet);
        this.bulletReady = false;
        this.bulletCooldown = 300; // ms
    }

    draw(ctx) {
        ctx.fillStyle = '#00f';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Simple triangle shape
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y - 10);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fillStyle = '#00f';
        ctx.fill();
    }
}

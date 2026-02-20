import Enemy from './Enemy.js';

export default class EnemyController {
    constructor(game) {
        this.game = game;
        this.rows = 4;
        this.cols = 8;
        this.enemies = [];
        this.speed = 0.5;
        this.direction = 1; // 1 for right, -1 for left
        this.edge = false; // Flag to know when to move down
    }

    reset() {
        this.enemies = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * 60 + 50;
                const y = r * 50 + 50;
                this.enemies.push(new Enemy(this.game, x, y));
            }
        }
    }

    update(keys, deltaTime) {
        this.edge = false;
        for (const enemy of this.enemies) {
            enemy.x += this.speed * this.direction * (deltaTime / 16); // Normalize speed
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.game.gameWidth) {
                this.edge = true;
            }
             // Check collision with player
            if (this.checkCollision(enemy, this.game.player)) {
                this.game.gameOver();
            }
        }

        if (this.edge) {
            this.direction *= -1;
            for (const enemy of this.enemies) {
                enemy.y += 20; // Move down
            }
        }
        
        // Check bullet collisions
        const bullets = this.game.gameObjects.filter(obj => obj.isBullet);
        bullets.forEach(bullet => {
            this.enemies.forEach((enemy, index) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.game.gameObjects = this.game.gameObjects.filter(o => o !== bullet);
                    this.enemies.splice(index, 1);
                    this.game.addScore(10);
                }
            });
        });

        if (this.enemies.length === 0) {
            this.reset(); // For now, just reset the wave
        }
    }

    draw(ctx) {
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }

    checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}

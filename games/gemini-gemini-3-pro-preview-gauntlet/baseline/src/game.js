import { Input } from './input.js';
import { Level } from './level.js';
import { Player, Enemy, Spawner, Projectile, Item } from './entities.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new Input();
        this.lastTime = 0;
        this.isRunning = false;
        
        this.healthVal = document.getElementById('health-val');
        this.scoreVal = document.getElementById('score-val');
        this.keysVal = document.getElementById('keys-val');
        this.levelVal = document.getElementById('level-val');
    }

    start() {
        this.score = 0;
        this.levelNum = 1;
        this.initLevel();
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    initLevel() {
        this.level = new Level(this.levelNum, this.canvas.width, this.canvas.height);
        this.player = new Player(this.level.spawnPoint.x, this.level.spawnPoint.y);
        this.entities = [this.player];
        this.projectiles = [];
        
        this.level.spawners.forEach(s => this.entities.push(new Spawner(s.x, s.y, s.type)));
        this.level.items.forEach(i => this.entities.push(new Item(i.x, i.y, i.type)));
        
        this.camera = { x: 0, y: 0 };
    }

    loop(time) {
        if (!this.isRunning) return;
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(dt);
        this.draw();

        if (this.isRunning) {
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    update(dt) {
        // Player health decay
        this.player.health -= 10 * dt;
        if (this.player.health <= 0) {
            this.gameOver();
            return;
        }

        // Player input
        const move = this.input.getMovement();
        this.player.move(move.dx, move.dy, dt, this.level);
        
        const shoot = this.input.getShooting();
        if (shoot.dx !== 0 || shoot.dy !== 0) {
            const proj = this.player.shoot(shoot.dx, shoot.dy);
            if (proj) {
                this.projectiles.push(proj);
            }
        }
        
        // Update entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            ent.update(dt, this);
            if (ent.dead) {
                this.entities.splice(i, 1);
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt, this.level);
            
            // Check collisions with entities
            if (!p.dead) {
                for (const ent of this.entities) {
                    if (ent !== this.player && !ent.dead && p.isEnemy !== ent.isEnemy) {
                        if (this.checkCollision(p, ent)) {
                            ent.takeDamage(p.damage);
                            p.dead = true;
                            if (ent.dead && ent.isEnemy) {
                                this.score += ent.scoreValue || 10;
                            }
                            break;
                        }
                    }
                }
            }
            
            // Check collision with player if enemy projectile
            if (p.isEnemy && !p.dead && this.checkCollision(p, this.player)) {
                this.player.takeDamage(p.damage);
                p.dead = true;
            }

            if (p.dead) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Check player collisions with items and exit
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            if (ent.isItem && this.checkCollision(this.player, ent)) {
                this.collectItem(ent);
                ent.dead = true;
                this.entities.splice(i, 1);
            } else if (ent.isEnemy && this.checkCollision(this.player, ent)) {
                // Enemies deal melee damage
                this.player.takeDamage(200 * dt);
            }
        }
        
        if (this.level.checkExit(this.player)) {
            this.levelNum++;
            this.initLevel();
            return;
        }

        // Camera follow
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        this.updateUI();
    }

    checkCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        return dist < (a.radius + b.radius);
    }

    collectItem(item) {
        switch (item.type) {
            case 'food':
                this.player.health = Math.min(2000, this.player.health + 500);
                this.score += 50;
                break;
            case 'key':
                this.player.keys++;
                this.score += 100;
                break;
            case 'treasure':
                this.score += 500;
                break;
        }
    }

    draw() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.level.draw(this.ctx, this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);

        for (const ent of this.entities) {
            ent.draw(this.ctx);
        }

        for (const p of this.projectiles) {
            p.draw(this.ctx);
        }

        this.ctx.restore();
    }

    updateUI() {
        this.healthVal.innerText = Math.max(0, Math.ceil(this.player.health));
        this.scoreVal.innerText = this.score;
        this.keysVal.innerText = this.player.keys;
        this.levelVal.innerText = this.levelNum;
    }

    gameOver() {
        this.isRunning = false;
        if (this.onGameOver) {
            this.onGameOver(this.score);
        }
    }
}

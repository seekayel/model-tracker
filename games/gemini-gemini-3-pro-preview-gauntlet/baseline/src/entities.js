export class Entity {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dead = false;
    }
    
    update(dt, game) {}
    draw(ctx) {}
}

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 12);
        this.health = 2000;
        this.keys = 0;
        this.speed = 150;
        this.lastShot = 0;
        this.shootDelay = 200; // ms
        this.facing = { x: 1, y: 0 };
    }

    move(dx, dy, dt, level) {
        if (dx !== 0 || dy !== 0) {
            this.facing = { x: dx, y: dy };
        }
        
        let newX = this.x + dx * this.speed * dt;
        let newY = this.y + dy * this.speed * dt;

        // Collision with walls and doors
        if (!level.isSolid(newX, this.y, this.radius, this)) {
            this.x = newX;
        }
        if (!level.isSolid(this.x, newY, this.radius, this)) {
            this.y = newY;
        }
    }

    shoot(dx, dy) {
        const now = performance.now();
        if (now - this.lastShot > this.shootDelay) {
            this.lastShot = now;
            return new Projectile(this.x, this.y, dx, dy, 400, false, 10, '#0af');
        }
        return null;
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    draw(ctx) {
        ctx.fillStyle = '#0af';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Direction indicator
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.facing.x * this.radius, this.y + this.facing.y * this.radius);
        ctx.stroke();
    }
}

export class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y, 10);
        this.type = type; // 'grunt', 'ghost'
        this.isEnemy = true;
        this.health = type === 'grunt' ? 20 : 10;
        this.speed = type === 'grunt' ? 80 : 100;
        this.scoreValue = type === 'grunt' ? 10 : 20;
    }

    update(dt, game) {
        // Move towards player
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 0 && dist < 400) { // Agro range
            let mx = (dx / dist) * this.speed * dt;
            let my = (dy / dist) * this.speed * dt;
            
            // Basic collision with walls
            if (!game.level.isSolid(this.x + mx, this.y, this.radius)) {
                this.x += mx;
            }
            if (!game.level.isSolid(this.x, this.y + my, this.radius)) {
                this.y += my;
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'grunt' ? '#d33' : '#a3a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Spawner extends Entity {
    constructor(x, y, type) {
        super(x, y, 16);
        this.type = type; // 'grunt_spawner', 'ghost_spawner'
        this.enemyType = type === 'grunt_spawner' ? 'grunt' : 'ghost';
        this.isEnemy = true;
        this.health = 50;
        this.scoreValue = 100;
        this.lastSpawn = performance.now();
        this.spawnRate = 3000; // spawn every 3 seconds
    }

    update(dt, game) {
        const now = performance.now();
        if (now - this.lastSpawn > this.spawnRate) {
            // Check distance to player, only spawn if near
            const dx = game.player.x - this.x;
            const dy = game.player.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 500) {
                this.lastSpawn = now;
                // Spawn enemy slightly offset
                const ex = this.x + (Math.random() - 0.5) * 40;
                const ey = this.y + (Math.random() - 0.5) * 40;
                if (!game.level.isSolid(ex, ey, 10)) {
                    game.entities.push(new Enemy(ex, ey, this.enemyType));
                }
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#611';
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        ctx.strokeStyle = '#f55';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
}

export class Projectile extends Entity {
    constructor(x, y, dx, dy, speed, isEnemy, damage, color) {
        super(x, y, 4);
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.isEnemy = isEnemy;
        this.damage = damage;
        this.color = color;
        this.life = 2.0; // seconds
    }

    update(dt, level) {
        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;
        this.life -= dt;
        
        if (this.life <= 0 || level.isSolid(this.x, this.y, this.radius)) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Item extends Entity {
    constructor(x, y, type) {
        super(x, y, 12);
        this.type = type; // 'food', 'key', 'treasure'
        this.isItem = true;
    }

    draw(ctx) {
        if (this.type === 'food') {
            ctx.fillStyle = '#2d2';
            ctx.fillRect(this.x - 8, this.y - 3, 16, 6);
            ctx.fillRect(this.x - 3, this.y - 8, 6, 16);
        } else if (this.type === 'key') {
            ctx.fillStyle = '#fd0';
            ctx.beginPath();
            ctx.moveTo(this.x - 8, this.y);
            ctx.lineTo(this.x + 8, this.y - 6);
            ctx.lineTo(this.x + 8, this.y + 6);
            ctx.fill();
        } else if (this.type === 'treasure') {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

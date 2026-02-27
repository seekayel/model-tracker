import { TILE_SIZE, ENEMY_STATS, COLORS, TILE } from './constants.js';

export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;

    const stats = ENEMY_STATS[type];
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.score = stats.score;
    this.canShoot = stats.canShoot;
    this.shootInterval = stats.shootInterval || 0;
    this.lastShootTime = 0;

    this.width = TILE_SIZE - 8;
    this.height = TILE_SIZE - 8;

    this.moveTimer = 0;
    this.moveDirection = { x: 0, y: 0 };
    this.changeDirInterval = 500 + Math.random() * 1000;
  }

  update(dt, player, level, now) {
    // Simple AI: move toward player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.moveTimer += dt;

    if (this.moveTimer > this.changeDirInterval) {
      this.moveTimer = 0;
      this.changeDirInterval = 500 + Math.random() * 1000;

      // Move toward player with some randomness
      if (dist > 0) {
        this.moveDirection.x = dx / dist;
        this.moveDirection.y = dy / dist;

        // Add randomness
        this.moveDirection.x += (Math.random() - 0.5) * 0.5;
        this.moveDirection.y += (Math.random() - 0.5) * 0.5;

        // Normalize
        const mag = Math.sqrt(
          this.moveDirection.x * this.moveDirection.x +
          this.moveDirection.y * this.moveDirection.y
        );
        if (mag > 0) {
          this.moveDirection.x /= mag;
          this.moveDirection.y /= mag;
        }
      }
    }

    // Move
    const newX = this.x + this.moveDirection.x * this.speed;
    const newY = this.y + this.moveDirection.y * this.speed;

    if (!this.checkCollision(newX, this.y, level)) {
      this.x = newX;
    } else {
      this.moveDirection.x = -this.moveDirection.x;
    }

    if (!this.checkCollision(this.x, newY, level)) {
      this.y = newY;
    } else {
      this.moveDirection.y = -this.moveDirection.y;
    }

    // Try to shoot
    if (this.canShoot && now - this.lastShootTime > this.shootInterval && dist < 300) {
      this.lastShootTime = now;
      return this.shoot(player);
    }

    return null;
  }

  checkCollision(x, y, level) {
    const left = x;
    const right = x + this.width;
    const top = y;
    const bottom = y + this.height;

    const corners = [
      { x: left, y: top },
      { x: right, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom }
    ];

    for (const corner of corners) {
      const tileX = Math.floor(corner.x / TILE_SIZE);
      const tileY = Math.floor(corner.y / TILE_SIZE);
      const tile = level.getTile(tileX, tileY);

      if (tile === TILE.WALL || tile === TILE.DOOR) {
        return true;
      }
    }

    return false;
  }

  shoot(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return null;

    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      dx: dx / dist,
      dy: dy / dist,
      speed: 4,
      damage: this.damage,
      isPlayerProjectile: false
    };
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  collidesWithPlayer(player) {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  getColor() {
    const colorMap = {
      ghost: COLORS.GHOST,
      demon: COLORS.DEMON,
      grunt: COLORS.GRUNT,
      sorcerer: COLORS.SORCERER
    };
    return colorMap[this.type];
  }

  draw(ctx) {
    // Body
    ctx.fillStyle = this.getColor();

    if (this.type === 'ghost') {
      // Draw ghost shape
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2 - 2, this.width / 2, Math.PI, 0);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x + this.width * 0.75, this.y + this.height - 4);
      ctx.lineTo(this.x + this.width * 0.5, this.y + this.height);
      ctx.lineTo(this.x + this.width * 0.25, this.y + this.height - 4);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Eyes
    ctx.fillStyle = '#000';
    const eyeSize = 3;
    ctx.fillRect(this.x + this.width * 0.3 - eyeSize/2, this.y + this.height * 0.4, eyeSize, eyeSize);
    ctx.fillRect(this.x + this.width * 0.7 - eyeSize/2, this.y + this.height * 0.4, eyeSize, eyeSize);

    // Health bar
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent < 1) {
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x, this.y - 6, this.width, 4);
      ctx.fillStyle = healthPercent > 0.3 ? '#0f0' : '#f00';
      ctx.fillRect(this.x, this.y - 6, this.width * healthPercent, 4);
    }
  }
}

export class Spawner {
  constructor(x, y, enemyType) {
    this.x = x * TILE_SIZE;
    this.y = y * TILE_SIZE;
    this.tileX = x;
    this.tileY = y;
    this.enemyType = enemyType;
    this.health = 100;
    this.maxHealth = 100;
    this.lastSpawnTime = 0;
    this.spawnInterval = 3000;
    this.spawnedCount = 0;
    this.maxSpawns = 4;
    this.active = true;
  }

  update(now, enemies) {
    if (!this.active) return null;

    // Count how many of our enemies are alive
    const aliveCount = enemies.filter(e => e.spawnerRef === this).length;

    if (aliveCount < this.maxSpawns && now - this.lastSpawnTime > this.spawnInterval) {
      this.lastSpawnTime = now;
      return this.spawn();
    }

    return null;
  }

  spawn() {
    // Spawn at adjacent tile
    const offsets = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 }
    ];
    const offset = offsets[Math.floor(Math.random() * offsets.length)];

    const enemy = new Enemy(
      this.x + offset.x * TILE_SIZE + 4,
      this.y + offset.y * TILE_SIZE + 4,
      this.enemyType
    );
    enemy.spawnerRef = this;

    return enemy;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  draw(ctx) {
    if (!this.active) return;

    // Draw spawner
    ctx.fillStyle = COLORS.SPAWNER;
    ctx.fillRect(this.x + 4, this.y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

    // Pulsing effect
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(128, 0, 255, ${pulse})`;
    ctx.fillRect(this.x + 8, this.y + 8, TILE_SIZE - 16, TILE_SIZE - 16);

    // Health bar
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent < 1) {
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x, this.y - 6, TILE_SIZE, 4);
      ctx.fillStyle = '#f0f';
      ctx.fillRect(this.x, this.y - 6, TILE_SIZE * healthPercent, 4);
    }
  }
}

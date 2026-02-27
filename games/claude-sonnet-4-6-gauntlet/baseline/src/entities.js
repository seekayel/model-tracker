import {
  TILE_SIZE, MAP_WIDTH, MAP_HEIGHT,
  PLAYER_SPEED, PLAYER_SHOOT_COOLDOWN, PLAYER_START_HEALTH,
  PROJECTILE_SPEED, PROJECTILE_DAMAGE, PROJECTILE_LIFETIME,
  ENEMY_CONFIG, ENEMY_TYPE,
  SPAWNER_HEALTH, SPAWNER_SPAWN_INTERVAL, SPAWNER_MAX_ENEMIES,
  ITEM_CONFIG, ITEM_TYPE,
  COLORS,
} from './constants.js';
import { isSolid, isSolidForGhost, worldToTile } from './dungeon.js';

// ─── Player ────────────────────────────────────────────────────────────────

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.health = PLAYER_START_HEALTH;
    this.maxHealth = PLAYER_START_HEALTH;
    this.score = 0;
    this.shootCooldown = 0;
    this.magicCharges = 3;
    this.facingX = 1;
    this.facingY = 0;
    this.alive = true;
    this.invincible = 0; // ms
    this.keys = 0;
  }

  update(dt, input, map, projectiles) {
    if (!this.alive) return;

    // Decrease invincibility timer
    if (this.invincible > 0) this.invincible -= dt;

    // Movement
    const { dx, dy } = input.getMovement();
    if (dx !== 0 || dy !== 0) {
      this.facingX = dx !== 0 ? Math.sign(dx) : this.facingX;
      this.facingY = dy !== 0 ? Math.sign(dy) : this.facingY;

      const speed = PLAYER_SPEED;
      const nx = this.x + dx * speed;
      const ny = this.y + dy * speed;

      // Axis-separated collision
      if (canMove(map, nx, this.y, this.width, this.height)) {
        this.x = nx;
      }
      if (canMove(map, this.x, ny, this.width, this.height)) {
        this.y = ny;
      }
    }

    // Normalize facing if diagonal movement stopped
    if (dx === 0 && dy === 0) {
      // keep last facing
    }

    // Shoot cooldown
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    // Shooting: Shift+direction continuously, or Space/Enter once
    const shootDir = input.getShootDirection();
    if (shootDir && this.shootCooldown <= 0) {
      this.shoot(projectiles, shootDir.dx, shootDir.dy);
    } else if (input.isShootPressed() && this.shootCooldown <= 0) {
      this.shoot(projectiles, this.facingX, this.facingY);
    }

    // Magic (clear screen of enemies near player)
    if (input.isMagicPressed() && this.magicCharges > 0) {
      this.magicCharges--;
      projectiles.push(new MagicBurst(this.x, this.y));
    }
  }

  shoot(projectiles, dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    projectiles.push(new Projectile(this.x, this.y, dx / len, dy / len, false));
    this.shootCooldown = PLAYER_SHOOT_COOLDOWN;
  }

  takeDamage(amount) {
    if (this.invincible > 0) return;
    this.health -= amount;
    this.invincible = 300;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addScore(pts) {
    this.score += pts;
  }
}

// ─── Projectile ────────────────────────────────────────────────────────────

export class Projectile {
  constructor(x, y, dx, dy, isEnemy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.speed = PROJECTILE_SPEED;
    this.damage = isEnemy ? 80 : PROJECTILE_DAMAGE;
    this.isEnemy = isEnemy;
    this.lifetime = PROJECTILE_LIFETIME;
    this.alive = true;
    this.radius = isEnemy ? 5 : 5;
  }

  update(dt, map) {
    this.lifetime -= dt;
    if (this.lifetime <= 0) { this.alive = false; return; }

    const nx = this.x + this.dx * this.speed;
    const ny = this.y + this.dy * this.speed;

    const { tileX, tileY } = worldToTile(nx, ny);
    if (isSolid(map, tileX, tileY)) {
      this.alive = false;
      return;
    }

    this.x = nx;
    this.y = ny;
  }
}

// MagicBurst expands and kills nearby enemies
export class MagicBurst {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.maxRadius = 200;
    this.speed = 8;
    this.alive = true;
    this.isEnemy = false;
    this.isMagic = true;
    this.damage = 500;
    this.hitsLeft = 30;
  }

  update(dt) {
    this.radius += this.speed;
    if (this.radius >= this.maxRadius || this.hitsLeft <= 0) {
      this.alive = false;
    }
  }
}

// ─── Enemy ─────────────────────────────────────────────────────────────────

export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    const cfg = ENEMY_CONFIG[type];
    this.speed = cfg.speed;
    this.health = cfg.health;
    this.maxHealth = cfg.health;
    this.damage = cfg.damage;
    this.color = cfg.color;
    this.points = cfg.points;
    this.size = cfg.size;
    this.attackRange = cfg.attackRange;
    this.attackCooldown = 0;
    this.attackCooldownMax = cfg.attackCooldown;
    this.canPassWalls = cfg.canPassWalls || false;
    this.canShoot = cfg.canShoot || false;
    this.alive = true;
    this.aggro = false;
    this.aggroRange = 180;
    this.dx = 0;
    this.dy = 0;
    this.wanderTimer = 0;
    this.wanderDx = 0;
    this.wanderDy = 0;
  }

  update(dt, player, map, projectiles) {
    if (!this.alive) return;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const distToPlayer = dist(this.x, this.y, player.x, player.y);

    // Aggro check
    if (distToPlayer < this.aggroRange) {
      this.aggro = true;
    }

    if (this.aggro) {
      this.chasePlayer(dt, player, map, projectiles, distToPlayer);
    } else {
      this.wander(dt, map);
    }
  }

  chasePlayer(dt, player, map, projectiles, distToPlayer) {
    const tdx = player.x - this.x;
    const tdy = player.y - this.y;
    const len = Math.sqrt(tdx * tdx + tdy * tdy);

    if (this.canShoot && distToPlayer < 250) {
      // Sorcerer shoots at player
      if (this.attackCooldown <= 0) {
        const nx = tdx / len;
        const ny = tdy / len;
        projectiles.push(new Projectile(this.x, this.y, nx, ny, true));
        this.attackCooldown = this.attackCooldownMax;
      }
      // Sorcerer keeps distance
      if (distToPlayer < 100) {
        const nx = -tdx / len;
        const ny = -tdy / len;
        this.moveInDir(nx, ny, map);
      }
      return;
    }

    if (distToPlayer > this.attackRange) {
      // Move toward player
      const nx = tdx / len;
      const ny = tdy / len;
      this.moveInDir(nx, ny, map);
    } else {
      // Attack player in melee range
      if (this.attackCooldown <= 0) {
        // damage applied in game.js collision check
        this.attackCooldown = this.attackCooldownMax;
      }
    }
  }

  moveInDir(nx, ny, map) {
    const speed = this.speed;
    const nextX = this.x + nx * speed;
    const nextY = this.y + ny * speed;

    const solidCheck = this.canPassWalls ? isSolidForGhost : isSolid;

    const canX = canMoveEnemy(map, nextX, this.y, this.size, solidCheck);
    const canY = canMoveEnemy(map, this.x, nextY, this.size, solidCheck);

    if (canX) this.x = nextX;
    else if (canY) this.y = nextY;
    else {
      // Try slight nudge around obstacle
      const perp = { dx: -ny * speed, dy: nx * speed };
      if (canMoveEnemy(map, this.x + perp.dx, this.y, this.size, solidCheck)) this.x += perp.dx;
      else if (canMoveEnemy(map, this.x, this.y + perp.dy, this.size, solidCheck)) this.y += perp.dy;
    }
  }

  wander(dt, map) {
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      this.wanderDx = Math.cos(angle);
      this.wanderDy = Math.sin(angle);
      this.wanderTimer = 800 + Math.random() * 1200;
    }
    this.moveInDir(this.wanderDx, this.wanderDy, map);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }
}

// ─── Spawner ───────────────────────────────────────────────────────────────

export class Spawner {
  constructor(x, y, tileX, tileY, enemyType) {
    this.x = x;
    this.y = y;
    this.tileX = tileX;
    this.tileY = tileY;
    this.enemyType = enemyType;
    this.health = SPAWNER_HEALTH;
    this.maxHealth = SPAWNER_HEALTH;
    this.alive = true;
    this.spawnTimer = SPAWNER_SPAWN_INTERVAL;
    this.spawnCount = 0;
    this.maxSpawnCount = SPAWNER_MAX_ENEMIES;
    this.size = 14;
    this.color = '#aa2222';
  }

  update(dt, enemies, liveEnemyCount) {
    if (!this.alive) return;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && liveEnemyCount < 40) {
      this.spawnTimer = SPAWNER_SPAWN_INTERVAL;
      // Spawn enemy near spawner
      const offset = 30;
      const ex = this.x + (Math.random() - 0.5) * offset;
      const ey = this.y + (Math.random() - 0.5) * offset;
      enemies.push(new Enemy(ex, ey, this.enemyType));
      this.spawnCount++;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }
}

// ─── Item ──────────────────────────────────────────────────────────────────

export class Item {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = ITEM_CONFIG[type];
    this.color = this.config.color;
    this.collected = false;
    this.alive = true;
    this.size = 8;
    this.pulse = 0;
  }

  update(dt) {
    this.pulse = (this.pulse + dt * 0.003) % (Math.PI * 2);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function dist(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function circlesOverlap(ax, ay, ar, bx, by, br) {
  return dist(ax, ay, bx, by) < ar + br;
}

function canMove(map, x, y, w, h) {
  const half = w / 2;
  const corners = [
    worldToTile(x - half + 2, y - half + 2),
    worldToTile(x + half - 2, y - half + 2),
    worldToTile(x - half + 2, y + half - 2),
    worldToTile(x + half - 2, y + half - 2),
  ];
  return corners.every(c => !isSolid(map, c.tileX, c.tileY));
}

function canMoveEnemy(map, x, y, size, solidFn) {
  const half = size - 2;
  const corners = [
    worldToTile(x - half, y - half),
    worldToTile(x + half, y - half),
    worldToTile(x - half, y + half),
    worldToTile(x + half, y + half),
  ];
  return corners.every(c => !solidFn(map, c.tileX, c.tileY));
}

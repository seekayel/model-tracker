import { TILE_SIZE, TILE, COLORS } from './constants.js';

export class Projectile {
  constructor(x, y, dx, dy, speed, damage, isPlayerProjectile) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
    this.damage = damage;
    this.isPlayerProjectile = isPlayerProjectile;
    this.radius = 4;
    this.active = true;
  }

  update(dt, level) {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;

    // Check wall collision
    const tileX = Math.floor(this.x / TILE_SIZE);
    const tileY = Math.floor(this.y / TILE_SIZE);
    const tile = level.getTile(tileX, tileY);

    if (tile === TILE.WALL || tile === TILE.DOOR) {
      this.active = false;
    }

    // Check bounds
    if (this.x < 0 || this.x > level.width * TILE_SIZE ||
        this.y < 0 || this.y > level.height * TILE_SIZE) {
      this.active = false;
    }
  }

  collidesWithEntity(entity) {
    const dx = this.x - (entity.x + entity.width / 2);
    const dy = this.y - (entity.y + entity.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < this.radius + entity.width / 2;
  }

  draw(ctx) {
    ctx.fillStyle = this.isPlayerProjectile ? COLORS.PLAYER_PROJECTILE : COLORS.ENEMY_PROJECTILE;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.isPlayerProjectile ? COLORS.PLAYER_PROJECTILE : COLORS.ENEMY_PROJECTILE;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export class ProjectileManager {
  constructor() {
    this.projectiles = [];
  }

  add(projectileData) {
    if (projectileData) {
      this.projectiles.push(new Projectile(
        projectileData.x,
        projectileData.y,
        projectileData.dx,
        projectileData.dy,
        projectileData.speed,
        projectileData.damage,
        projectileData.isPlayerProjectile
      ));
    }
  }

  update(dt, level, player, enemies, spawners) {
    for (const proj of this.projectiles) {
      proj.update(dt, level);

      if (!proj.active) continue;

      // Check collision with player (enemy projectiles)
      if (!proj.isPlayerProjectile && proj.collidesWithEntity(player)) {
        player.takeDamage(proj.damage);
        proj.active = false;
        continue;
      }

      // Check collision with enemies (player projectiles)
      if (proj.isPlayerProjectile) {
        for (const enemy of enemies) {
          if (proj.collidesWithEntity(enemy)) {
            const killed = enemy.takeDamage(proj.damage);
            if (killed) {
              player.score += enemy.score;
            }
            proj.active = false;
            break;
          }
        }

        // Check collision with spawners
        for (const spawner of spawners) {
          if (spawner.active && proj.collidesWithEntity({
            x: spawner.x,
            y: spawner.y,
            width: TILE_SIZE,
            height: TILE_SIZE
          })) {
            const destroyed = spawner.takeDamage(proj.damage);
            if (destroyed) {
              player.score += 500;
            }
            proj.active = false;
            break;
          }
        }
      }
    }

    // Remove inactive projectiles
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  draw(ctx) {
    for (const proj of this.projectiles) {
      proj.draw(ctx);
    }
  }

  clear() {
    this.projectiles = [];
  }
}

import {
  Tile, EntityKind, HeroClass, HERO_STATS, Phase, Dir, DIR_NONE, DIRS,
  TILE_SIZE, HEALTH_DRAIN_INTERVAL, SPAWN_INTERVAL, ENEMY_MOVE_INTERVAL,
} from './types';
import { Entity, createEnemy, createSpawner, createItem, createProjectile } from './entities';
import { DungeonDef, generateDungeon } from './dungeon';
import { isDown, wasPressed } from './input';
import { render, updateCamera, getClassSelectIndex, setClassSelectIndex } from './renderer';
import { sfxShoot, sfxHit, sfxPickup, sfxDeath, sfxExit, sfxDoor, sfxMelee } from './sound';

export class Game {
  phase = Phase.Title;
  heroClass = HeroClass.Warrior;
  level = 1;
  score = 0;
  keys = 0;
  potions = 0;

  dungeon!: DungeonDef;
  player!: Entity;
  entities: Entity[] = [];

  health = 0;
  maxHealth = 0;

  // Timers
  lastHealthDrain = 0;
  playerMoveTimer = 0;
  playerAttackTimer = 0;
  lastFacing: Dir = DIRS.right;

  // Level complete transition
  levelCompleteTimer = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.phase = Phase.Title;
    this.level = 1;
    this.score = 0;
    this.keys = 0;
    this.potions = 0;
  }

  startLevel() {
    this.dungeon = generateDungeon(this.level);
    const stats = HERO_STATS[this.heroClass];

    // Create player
    this.player = {
      kind: EntityKind.Player,
      x: this.dungeon.playerStart.x,
      y: this.dungeon.playerStart.y,
      health: this.health > 0 ? this.health : stats.maxHealth,
      maxHealth: stats.maxHealth,
      dir: DIR_NONE,
      moveTimer: 0,
      attackTimer: 0,
      alive: true,
    };
    this.health = this.player.health;
    this.maxHealth = stats.maxHealth;

    // Create entities from dungeon definition
    this.entities = [];
    for (const def of this.dungeon.entities) {
      switch (def.kind) {
        case EntityKind.Ghost:
        case EntityKind.Demon:
        case EntityKind.Sorcerer:
        case EntityKind.Death:
          this.entities.push(createEnemy(def.kind, def.x, def.y));
          break;
        case EntityKind.Spawner:
          this.entities.push(createSpawner(def.x, def.y));
          break;
        case EntityKind.Food:
        case EntityKind.Treasure:
        case EntityKind.Key:
        case EntityKind.Potion:
          this.entities.push(createItem(def.kind, def.x, def.y));
          break;
      }
    }

    this.lastHealthDrain = performance.now();
    this.playerMoveTimer = 0;
    this.playerAttackTimer = 0;
    this.levelCompleteTimer = 0;
    this.phase = Phase.Playing;
  }

  update(now: number, dt: number) {
    switch (this.phase) {
      case Phase.Title:
        this.updateTitle();
        break;
      case Phase.ClassSelect:
        this.updateClassSelect();
        break;
      case Phase.Playing:
        this.updatePlaying(now, dt);
        break;
      case Phase.GameOver:
        if (wasPressed('enter')) this.reset();
        break;
      case Phase.LevelComplete:
        this.levelCompleteTimer += dt;
        if (wasPressed('enter') || this.levelCompleteTimer > 3000) {
          this.level++;
          this.startLevel();
        }
        break;
    }
  }

  private updateTitle() {
    if (wasPressed('enter')) {
      this.phase = Phase.ClassSelect;
      setClassSelectIndex(0);
    }
  }

  private updateClassSelect() {
    const classes = Object.values(HeroClass);
    let idx = getClassSelectIndex();
    if (wasPressed('arrowup') || wasPressed('w')) {
      idx = (idx - 1 + classes.length) % classes.length;
      setClassSelectIndex(idx);
    }
    if (wasPressed('arrowdown') || wasPressed('s')) {
      idx = (idx + 1) % classes.length;
      setClassSelectIndex(idx);
    }
    if (wasPressed('enter')) {
      this.heroClass = classes[idx];
      this.health = 0; // reset for new game
      this.startLevel();
    }
  }

  private updatePlaying(now: number, dt: number) {
    // Health drain over time (Gauntlet signature mechanic)
    if (now - this.lastHealthDrain >= HEALTH_DRAIN_INTERVAL) {
      this.lastHealthDrain = now;
      this.health = Math.max(0, this.health - 1);
      if (this.health <= 0) {
        this.phase = Phase.GameOver;
        sfxDeath();
        return;
      }
    }

    this.updatePlayer(dt);
    this.updateEnemies(now, dt);
    this.updateProjectiles(dt);
    this.checkItemPickups();

    // Update camera
    updateCamera(this.player.x, this.player.y, this.dungeon.width, this.dungeon.height);
  }

  private updatePlayer(dt: number) {
    const stats = HERO_STATS[this.heroClass];
    this.playerMoveTimer -= dt;
    this.playerAttackTimer -= dt;

    // Movement
    let dx = 0, dy = 0;
    if (isDown('arrowleft') || isDown('a')) dx = -1;
    else if (isDown('arrowright') || isDown('d')) dx = 1;
    if (isDown('arrowup') || isDown('w')) dy = -1;
    else if (isDown('arrowdown') || isDown('s')) dy = 1;

    if ((dx !== 0 || dy !== 0) && this.playerMoveTimer <= 0) {
      // Update facing direction
      if (dx !== 0 || dy !== 0) {
        this.lastFacing = { dx, dy };
      }

      const nx = this.player.x + dx;
      const ny = this.player.y + dy;

      if (this.canMove(nx, ny, true)) {
        this.player.x = nx;
        this.player.y = ny;
        this.playerMoveTimer = 1000 / (stats.speed * TILE_SIZE);

        // Check exit
        if (this.dungeon.tiles[ny][nx] === Tile.Exit) {
          this.phase = Phase.LevelComplete;
          this.score += 500 * this.level;
          sfxExit();
        }
      }
    }

    // Attack (Space or Z)
    if ((isDown(' ') || isDown('z')) && this.playerAttackTimer <= 0) {
      this.playerAttackTimer = 250; // attack cooldown

      if (stats.projectileSpeed > 0) {
        // Ranged attack
        const dir = this.lastFacing;
        const len = Math.sqrt(dir.dx * dir.dx + dir.dy * dir.dy) || 1;
        const vx = (dir.dx / len) * stats.projectileSpeed;
        const vy = (dir.dy / len) * stats.projectileSpeed;
        this.entities.push(
          createProjectile(this.player.x, this.player.y, vx, vy, stats.projectileDamage, 'player')
        );
        sfxShoot();
      } else {
        // Melee attack (hit adjacent tiles)
        this.meleeAttack(stats.meleeDamage);
        sfxMelee();
      }
    }

    // Use potion (X)
    if (wasPressed('x') && this.potions > 0) {
      this.potions--;
      this.health = Math.min(this.maxHealth, this.health + 200);
      sfxPickup();
    }
  }

  private meleeAttack(damage: number) {
    const fd = this.lastFacing;
    // Attack in a 3-tile arc in front of player
    const targets: { x: number; y: number }[] = [
      { x: this.player.x + fd.dx, y: this.player.y + fd.dy },
    ];
    // Add perpendicular tiles for wider sweep
    if (fd.dx !== 0) {
      targets.push({ x: this.player.x + fd.dx, y: this.player.y - 1 });
      targets.push({ x: this.player.x + fd.dx, y: this.player.y + 1 });
    }
    if (fd.dy !== 0) {
      targets.push({ x: this.player.x - 1, y: this.player.y + fd.dy });
      targets.push({ x: this.player.x + 1, y: this.player.y + fd.dy });
    }

    for (const t of targets) {
      // Destroy destructible walls
      if (t.y >= 0 && t.y < this.dungeon.height && t.x >= 0 && t.x < this.dungeon.width) {
        if (this.dungeon.tiles[t.y][t.x] === Tile.WallDestructible) {
          this.dungeon.tiles[t.y][t.x] = Tile.Floor;
          this.score += 5;
        }
      }
      // Damage enemies at target
      for (const e of this.entities) {
        if (!e.alive) continue;
        if (e.x === t.x && e.y === t.y && this.isEnemy(e)) {
          this.damageEntity(e, damage);
        }
      }
    }
  }

  private updateEnemies(now: number, dt: number) {
    for (const e of this.entities) {
      if (!e.alive) continue;

      // Spawners
      if (e.kind === EntityKind.Spawner) {
        e.spawnTimer = (e.spawnTimer ?? 0) + dt;
        if (e.spawnTimer! >= SPAWN_INTERVAL) {
          e.spawnTimer = 0;
          // Find an adjacent free tile
          const dirs = [DIRS.up, DIRS.down, DIRS.left, DIRS.right];
          for (const d of dirs) {
            const nx = e.x + d.dx;
            const ny = e.y + d.dy;
            if (this.isTileWalkable(nx, ny) && !this.entityAt(nx, ny)) {
              const maxEnemies = this.entities.filter(en => en.alive && this.isEnemy(en)).length;
              if (maxEnemies < 40 + this.level * 5) {
                this.entities.push(createEnemy(e.spawnKind ?? EntityKind.Ghost, nx, ny));
              }
              break;
            }
          }
        }
        continue;
      }

      // Enemy AI
      if (!this.isEnemy(e)) continue;

      e.moveTimer += dt;
      const moveInterval = e.kind === EntityKind.Death
        ? ENEMY_MOVE_INTERVAL * 1.5
        : ENEMY_MOVE_INTERVAL - this.level * 10;

      if (e.moveTimer >= Math.max(200, moveInterval)) {
        e.moveTimer = 0;

        // Move toward player
        const pdx = this.player.x - e.x;
        const pdy = this.player.y - e.y;
        const dist = Math.abs(pdx) + Math.abs(pdy);

        if (dist <= 1) {
          // Adjacent to player - attack
          this.attackPlayer(e);
        } else if (dist < 15) {
          // Chase player
          let dx = 0, dy = 0;
          if (Math.abs(pdx) >= Math.abs(pdy)) {
            dx = pdx > 0 ? 1 : -1;
          } else {
            dy = pdy > 0 ? 1 : -1;
          }

          const nx = e.x + dx;
          const ny = e.y + dy;
          if (this.canEnemyMove(nx, ny)) {
            e.x = nx;
            e.y = ny;
          } else {
            // Try perpendicular
            if (dx !== 0) {
              const alt = pdy > 0 ? 1 : -1;
              if (this.canEnemyMove(e.x, e.y + alt)) {
                e.y += alt;
              }
            } else {
              const alt = pdx > 0 ? 1 : -1;
              if (this.canEnemyMove(e.x + alt, e.y)) {
                e.x += alt;
              }
            }
          }
        } else {
          // Random movement
          const dirs = [DIRS.up, DIRS.down, DIRS.left, DIRS.right];
          const d = dirs[Math.floor(Math.random() * 4)];
          if (this.canEnemyMove(e.x + d.dx, e.y + d.dy)) {
            e.x += d.dx;
            e.y += d.dy;
          }
        }

        // Sorcerers shoot projectiles
        if (e.kind === EntityKind.Sorcerer && dist < 10 && dist > 2) {
          e.attackTimer += dt + e.moveTimer;
          if (e.attackTimer > 2000) {
            e.attackTimer = 0;
            const len = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
            this.entities.push(
              createProjectile(e.x, e.y, (pdx / len) * 3, (pdy / len) * 3, 2, 'enemy')
            );
          }
        }
      }
    }

    // Clean up dead entities
    this.entities = this.entities.filter(e => e.alive);
  }

  private attackPlayer(e: Entity) {
    const stats = HERO_STATS[this.heroClass];
    let damage = 1;
    switch (e.kind) {
      case EntityKind.Ghost: damage = 2; break;
      case EntityKind.Demon: damage = 3; break;
      case EntityKind.Sorcerer: damage = 2; break;
      case EntityKind.Death: damage = 10; break;
    }
    // Reduce by armor
    damage = Math.max(1, damage - Math.floor(stats.armor / 2));
    this.health -= damage;
    sfxHit();

    if (this.health <= 0) {
      this.health = 0;
      this.phase = Phase.GameOver;
      sfxDeath();
    }
  }

  private updateProjectiles(dt: number) {
    for (const e of this.entities) {
      if (!e.alive || e.kind !== EntityKind.Projectile) continue;

      e.lifetime = (e.lifetime ?? 0) - dt;
      if (e.lifetime! <= 0) {
        e.alive = false;
        continue;
      }

      // Move projectile (sub-tile movement)
      const speed = dt / 1000;
      const nx = e.x + (e.vx ?? 0) * speed;
      const ny = e.y + (e.vy ?? 0) * speed;

      const tileX = Math.round(nx);
      const tileY = Math.round(ny);

      // Check wall collision
      if (tileY < 0 || tileY >= this.dungeon.height || tileX < 0 || tileX >= this.dungeon.width
        || this.dungeon.tiles[tileY][tileX] === Tile.Wall
        || this.dungeon.tiles[tileY][tileX] === Tile.Door) {
        // Destroy destructible walls
        if (tileY >= 0 && tileY < this.dungeon.height && tileX >= 0 && tileX < this.dungeon.width) {
          if (this.dungeon.tiles[tileY][tileX] === Tile.WallDestructible) {
            this.dungeon.tiles[tileY][tileX] = Tile.Floor;
            this.score += 5;
          }
        }
        e.alive = false;
        continue;
      }

      e.x = nx;
      e.y = ny;

      // Check entity collisions
      if (e.owner === 'player') {
        for (const target of this.entities) {
          if (!target.alive || target === e) continue;
          if (this.isEnemy(target) || target.kind === EntityKind.Spawner) {
            if (Math.abs(target.x - nx) < 0.8 && Math.abs(target.y - ny) < 0.8) {
              this.damageEntity(target, e.damage ?? 1);
              e.alive = false;
              break;
            }
          }
        }
      } else if (e.owner === 'enemy') {
        if (Math.abs(this.player.x - nx) < 0.8 && Math.abs(this.player.y - ny) < 0.8) {
          const stats = HERO_STATS[this.heroClass];
          const damage = Math.max(1, (e.damage ?? 1) - Math.floor(stats.armor / 2));
          this.health -= damage;
          sfxHit();
          e.alive = false;
          if (this.health <= 0) {
            this.health = 0;
            this.phase = Phase.GameOver;
            sfxDeath();
          }
        }
      }
    }
  }

  private checkItemPickups() {
    const px = this.player.x;
    const py = this.player.y;

    for (const e of this.entities) {
      if (!e.alive) continue;
      if (e.x !== px || e.y !== py) continue;

      switch (e.kind) {
        case EntityKind.Food:
          this.health = Math.min(this.maxHealth, this.health + 100);
          this.score += 10;
          e.alive = false;
          sfxPickup();
          break;
        case EntityKind.Treasure:
          this.score += 100 + this.level * 25;
          e.alive = false;
          sfxPickup();
          break;
        case EntityKind.Key:
          this.keys++;
          this.score += 50;
          e.alive = false;
          sfxPickup();
          break;
        case EntityKind.Potion:
          this.potions++;
          this.score += 25;
          e.alive = false;
          sfxPickup();
          break;
      }
    }
  }

  private damageEntity(e: Entity, damage: number) {
    e.health -= damage;
    sfxHit();
    if (e.health <= 0) {
      e.alive = false;
      // Score for kills
      switch (e.kind) {
        case EntityKind.Ghost: this.score += 20; break;
        case EntityKind.Demon: this.score += 30; break;
        case EntityKind.Sorcerer: this.score += 40; break;
        case EntityKind.Death: this.score += 100; break;
        case EntityKind.Spawner: this.score += 200; break;
      }
    }
  }

  private isEnemy(e: Entity): boolean {
    return [EntityKind.Ghost, EntityKind.Demon, EntityKind.Sorcerer, EntityKind.Death].includes(e.kind);
  }

  private isTileWalkable(x: number, y: number): boolean {
    if (y < 0 || y >= this.dungeon.height || x < 0 || x >= this.dungeon.width) return false;
    const t = this.dungeon.tiles[y][x];
    return t === Tile.Floor || t === Tile.Exit;
  }

  private canMove(x: number, y: number, isPlayer: boolean): boolean {
    if (y < 0 || y >= this.dungeon.height || x < 0 || x >= this.dungeon.width) return false;
    const t = this.dungeon.tiles[y][x];
    if (t === Tile.Wall || t === Tile.WallDestructible) return false;
    if (t === Tile.Door) {
      if (isPlayer && this.keys > 0) {
        this.keys--;
        this.dungeon.tiles[y][x] = Tile.Floor;
        sfxDoor();
        return true;
      }
      return false;
    }
    return true;
  }

  private canEnemyMove(x: number, y: number): boolean {
    if (!this.isTileWalkable(x, y)) return false;
    // Don't stack enemies on same tile
    for (const e of this.entities) {
      if (e.alive && this.isEnemy(e) && e.x === x && e.y === y) return false;
    }
    return true;
  }

  private entityAt(x: number, y: number): Entity | undefined {
    return this.entities.find(e => e.alive && e.x === x && e.y === y);
  }

  draw() {
    render(
      this.dungeon?.tiles ?? [],
      this.entities,
      this.player,
      this.heroClass,
      this.health,
      this.maxHealth,
      this.score,
      this.keys,
      this.level,
      this.phase,
      this.potions,
    );
  }
}

import { TILE_SIZE, CHARACTER_STATS, COLORS, TILE } from './constants.js';

export class Player {
  constructor(x, y, characterClass) {
    this.x = x;
    this.y = y;
    this.characterClass = characterClass;

    const stats = CHARACTER_STATS[characterClass];
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.speed = stats.speed;
    this.attackPower = stats.attackPower;
    this.attackSpeed = stats.attackSpeed;
    this.armor = stats.armor;
    this.projectileSpeed = stats.projectileSpeed;

    this.keys = 0;
    this.score = 0;
    this.lastAttackTime = 0;

    this.width = TILE_SIZE - 4;
    this.height = TILE_SIZE - 4;

    this.invulnerableUntil = 0;
  }

  update(dt, input, level) {
    const movement = input.getMovement();

    const newX = this.x + movement.dx * this.speed;
    const newY = this.y + movement.dy * this.speed;

    // Check collision and move
    if (!this.checkCollision(newX, this.y, level)) {
      this.x = newX;
    }
    if (!this.checkCollision(this.x, newY, level)) {
      this.y = newY;
    }

    // Check for item pickups
    this.checkPickups(level);
  }

  checkCollision(x, y, level) {
    const left = x;
    const right = x + this.width;
    const top = y;
    const bottom = y + this.height;

    // Check corners
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

      if (tile === TILE.WALL) return true;
      if (tile === TILE.DOOR) {
        if (this.keys > 0) {
          this.keys--;
          level.setTile(tileX, tileY, TILE.FLOOR);
          return false;
        }
        return true;
      }
    }

    return false;
  }

  checkPickups(level) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const tileX = Math.floor(centerX / TILE_SIZE);
    const tileY = Math.floor(centerY / TILE_SIZE);
    const tile = level.getTile(tileX, tileY);

    switch (tile) {
      case TILE.FOOD:
        this.heal(30);
        level.setTile(tileX, tileY, TILE.FLOOR);
        this.score += 50;
        break;
      case TILE.KEY:
        this.keys++;
        level.setTile(tileX, tileY, TILE.FLOOR);
        this.score += 100;
        break;
      case TILE.TREASURE:
        this.score += 200;
        level.setTile(tileX, tileY, TILE.FLOOR);
        break;
      case TILE.POTION:
        this.heal(50);
        level.setTile(tileX, tileY, TILE.FLOOR);
        this.score += 75;
        break;
    }
  }

  canAttack(now) {
    return now - this.lastAttackTime >= this.attackSpeed;
  }

  attack(now, aimDirection) {
    this.lastAttackTime = now;
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      dx: aimDirection.x,
      dy: aimDirection.y,
      speed: this.projectileSpeed,
      damage: this.attackPower,
      isPlayerProjectile: true
    };
  }

  takeDamage(amount) {
    const now = Date.now();
    if (now < this.invulnerableUntil) return;

    const reducedDamage = Math.max(1, amount - this.armor);
    this.health -= reducedDamage;
    this.invulnerableUntil = now + 200; // Brief invulnerability

    if (this.health < 0) this.health = 0;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  isAtExit(level) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const tileX = Math.floor(centerX / TILE_SIZE);
    const tileY = Math.floor(centerY / TILE_SIZE);
    return level.getTile(tileX, tileY) === TILE.EXIT;
  }

  getColor() {
    const colorMap = {
      warrior: COLORS.WARRIOR,
      valkyrie: COLORS.VALKYRIE,
      wizard: COLORS.WIZARD,
      elf: COLORS.ELF
    };
    return colorMap[this.characterClass];
  }

  draw(ctx) {
    const isFlashing = Date.now() < this.invulnerableUntil;

    if (isFlashing && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Body
    ctx.fillStyle = this.getColor();
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Class indicator
    ctx.fillStyle = '#fff';
    ctx.font = '16px Courier New';
    ctx.textAlign = 'center';
    const initial = this.characterClass[0].toUpperCase();
    ctx.fillText(initial, this.x + this.width / 2, this.y + this.height / 2 + 5);

    ctx.globalAlpha = 1;
  }
}

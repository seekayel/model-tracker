import {
  TILE_SIZE,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_BIG_HEIGHT,
  PLAYER_SPEED,
  PLAYER_MAX_SPEED,
  PLAYER_JUMP_FORCE,
  GOOMBA_SPEED,
  KOOPA_SPEED,
  COIN_VALUE,
  MUSHROOM_POINTS,
  FRICTION
} from './constants.js';
import { applyGravity, resolveTileCollision, checkEntityCollision, isStomping } from './physics.js';

// Base Entity class
export class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.active = true;
    this.onGround = false;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

// Player (Mario)
export class Player extends Entity {
  constructor(x, y) {
    super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.isBig = false;
    this.facingRight = true;
    this.isMoving = false;
    this.isJumping = false;
    this.isDead = false;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.jumpHeld = false;
    this.canJump = true;
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.deathTimer = 0;
    this.winTimer = 0;
    this.hasWon = false;
  }

  update(input, tiles, levelWidth, levelHeight, deltaTime) {
    if (this.isDead) {
      this.deathTimer += deltaTime;
      // Death animation - jump up then fall
      if (this.deathTimer < 500) {
        this.vy = -5;
      } else {
        applyGravity(this);
      }
      this.y += this.vy;
      return;
    }

    if (this.hasWon) {
      this.winTimer += deltaTime;
      return;
    }

    // Handle invincibility frames
    if (this.isInvincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    }

    // Horizontal movement
    this.isMoving = false;
    if (input.isPressed('left')) {
      this.vx -= PLAYER_SPEED;
      this.facingRight = false;
      this.isMoving = true;
    }
    if (input.isPressed('right')) {
      this.vx += PLAYER_SPEED;
      this.facingRight = true;
      this.isMoving = true;
    }

    // Apply friction
    this.vx *= FRICTION;

    // Clamp horizontal speed
    if (Math.abs(this.vx) > PLAYER_MAX_SPEED) {
      this.vx = Math.sign(this.vx) * PLAYER_MAX_SPEED;
    }
    if (Math.abs(this.vx) < 0.1) {
      this.vx = 0;
    }

    // Jumping
    const wantToJump = input.isPressed('jump') || input.isPressed('up');

    if (wantToJump && this.onGround && this.canJump) {
      this.vy = PLAYER_JUMP_FORCE;
      this.onGround = false;
      this.isJumping = true;
      this.jumpHeld = true;
      this.canJump = false;
    }

    // Variable jump height
    if (!wantToJump) {
      this.canJump = true;
      this.jumpHeld = false;
      if (this.vy < -4) {
        this.vy = -4;
      }
    }

    // Apply gravity
    applyGravity(this);

    // Resolve tile collisions
    const collisions = resolveTileCollision(this, tiles, levelWidth, levelHeight);

    if (collisions.bottom) {
      this.isJumping = false;
    }

    return collisions;
  }

  grow() {
    if (!this.isBig) {
      this.isBig = true;
      this.height = PLAYER_BIG_HEIGHT;
      this.y -= TILE_SIZE; // Adjust position so feet stay in place
    }
  }

  shrink() {
    if (this.isBig) {
      this.isBig = false;
      this.height = PLAYER_HEIGHT;
      this.isInvincible = true;
      this.invincibleTimer = 2000;
    }
  }

  takeDamage() {
    if (this.isInvincible || this.isDead) return false;

    if (this.isBig) {
      this.shrink();
      return false;
    } else {
      this.die();
      return true;
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.lives--;
    this.vy = PLAYER_JUMP_FORCE;
    this.vx = 0;
    this.deathTimer = 0;
  }

  collectCoin() {
    this.coins++;
    this.score += COIN_VALUE;
    if (this.coins >= 100) {
      this.coins = 0;
      this.lives++;
    }
  }

  collectMushroom() {
    this.score += MUSHROOM_POINTS;
    this.grow();
  }

  win() {
    this.hasWon = true;
    this.winTimer = 0;
    this.vx = 0;
    this.vy = 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.isDead = false;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.deathTimer = 0;
    this.hasWon = false;
    this.winTimer = 0;
    this.onGround = false;
    this.isJumping = false;
    // Don't reset isBig - keep power-up state unless fully resetting
  }
}

// Goomba enemy
export class Goomba extends Entity {
  constructor(x, y) {
    super(x, y, TILE_SIZE - 4, TILE_SIZE - 4);
    this.speed = GOOMBA_SPEED;
    this.vx = -this.speed;
    this.isSquished = false;
    this.squishedTimer = 0;
    this.points = 100;
  }

  update(tiles, levelWidth, levelHeight, deltaTime) {
    if (!this.active) return;

    if (this.isSquished) {
      this.squishedTimer += deltaTime;
      if (this.squishedTimer > 500) {
        this.active = false;
      }
      return;
    }

    applyGravity(this);
    const collisions = resolveTileCollision(this, tiles, levelWidth, levelHeight);

    // Reverse direction on wall collision
    if (collisions.left || collisions.right) {
      this.vx = -this.vx;
    }
  }

  stomp() {
    this.isSquished = true;
    this.height = 8;
    this.y += TILE_SIZE - 12;
    this.vx = 0;
  }
}

// Koopa Troopa enemy
export class Koopa extends Entity {
  constructor(x, y) {
    super(x, y, TILE_SIZE - 4, TILE_SIZE + 8);
    this.speed = KOOPA_SPEED;
    this.vx = -this.speed;
    this.facingRight = false;
    this.isShell = false;
    this.shellMoving = false;
    this.shellTimer = 0;
    this.points = 100;
    this.shellPoints = 200;
  }

  update(tiles, levelWidth, levelHeight, deltaTime) {
    if (!this.active) return;

    if (this.isShell && !this.shellMoving) {
      this.shellTimer += deltaTime;
      if (this.shellTimer > 5000) {
        // Koopa comes out of shell
        this.isShell = false;
        this.height = TILE_SIZE + 8;
        this.vx = -this.speed;
        this.shellTimer = 0;
      }
      return;
    }

    applyGravity(this);
    const collisions = resolveTileCollision(this, tiles, levelWidth, levelHeight);

    if (collisions.left || collisions.right) {
      this.vx = -this.vx;
      this.facingRight = !this.facingRight;
    }
  }

  stomp() {
    if (!this.isShell) {
      this.isShell = true;
      this.height = TILE_SIZE - 4;
      this.y += 12;
      this.vx = 0;
      this.shellMoving = false;
      this.shellTimer = 0;
      return 'shell';
    } else if (!this.shellMoving) {
      // Kick shell
      this.shellMoving = true;
      this.vx = 8; // Will be set based on player position
      return 'kick';
    } else {
      // Stop moving shell
      this.shellMoving = false;
      this.vx = 0;
      this.shellTimer = 0;
      return 'stop';
    }
  }

  kickShell(direction) {
    this.shellMoving = true;
    this.vx = direction * 8;
  }
}

// Coin collectible
export class Coin extends Entity {
  constructor(x, y) {
    super(x, y, TILE_SIZE - 8, TILE_SIZE - 8);
    this.collected = false;
    this.floatOffset = 0;
    this.floatSpeed = 0.05;
  }

  update(deltaTime) {
    if (!this.active) return;

    // Floating animation
    this.floatOffset = Math.sin(Date.now() * this.floatSpeed) * 3;
  }

  collect() {
    this.active = false;
    this.collected = true;
  }
}

// Mushroom power-up
export class Mushroom extends Entity {
  constructor(x, y) {
    super(x, y, TILE_SIZE - 4, TILE_SIZE - 4);
    this.emerging = true;
    this.emergeProgress = 0;
    this.originalY = y;
    this.vx = 2;
  }

  update(tiles, levelWidth, levelHeight, deltaTime) {
    if (!this.active) return;

    if (this.emerging) {
      this.emergeProgress += deltaTime / 500;
      this.y = this.originalY - (TILE_SIZE * this.emergeProgress);
      if (this.emergeProgress >= 1) {
        this.emerging = false;
        this.y = this.originalY - TILE_SIZE;
      }
      return;
    }

    applyGravity(this);
    const collisions = resolveTileCollision(this, tiles, levelWidth, levelHeight);

    if (collisions.left || collisions.right) {
      this.vx = -this.vx;
    }
  }

  collect() {
    this.active = false;
  }
}

// Particle effect for block hit, coin pop, etc.
export class Particle extends Entity {
  constructor(x, y, type) {
    super(x, y, 8, 8);
    this.type = type;
    this.lifetime = 0;
    this.maxLifetime = type === 'coin' ? 600 : 400;

    switch(type) {
      case 'coin':
        this.vy = -10;
        break;
      case 'brick':
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = -8 - Math.random() * 4;
        break;
      case 'score':
        this.vy = -2;
        this.value = 100;
        break;
    }
  }

  update(deltaTime) {
    if (!this.active) return;

    this.lifetime += deltaTime;
    if (this.lifetime >= this.maxLifetime) {
      this.active = false;
      return;
    }

    if (this.type !== 'score') {
      applyGravity(this);
    }

    this.x += this.vx;
    this.y += this.vy;
  }
}

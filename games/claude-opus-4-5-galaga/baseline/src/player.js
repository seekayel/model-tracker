import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED,
  PLAYER_FIRE_RATE, PLAYER_MAX_BULLETS, PLAYER_START_LIVES,
  COLORS
} from './constants.js';
import { Bullet } from './bullet.js';

export class Player {
  constructor() {
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.reset();
    this.lives = PLAYER_START_LIVES;
  }

  reset() {
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.y = CANVAS_HEIGHT - 60;
    this.bullets = [];
    this.lastFireTime = 0;
    this.invulnerable = false;
    this.invulnerableTime = 0;
    this.visible = true;
    this.active = true;
  }

  fullReset() {
    this.reset();
    this.lives = PLAYER_START_LIVES;
  }

  update(input, currentTime) {
    if (!this.active) return;

    // Movement
    if (input.isLeft() && this.x > 0) {
      this.x -= PLAYER_SPEED;
    }
    if (input.isRight() && this.x < CANVAS_WIDTH - this.width) {
      this.x += PLAYER_SPEED;
    }

    // Firing
    if (input.isFiring() && this.canFire(currentTime)) {
      this.fire(currentTime);
    }

    // Update bullets
    this.bullets.forEach(bullet => bullet.update());
    this.bullets = this.bullets.filter(bullet => bullet.active);

    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerableTime -= 16; // Approximate frame time
      this.visible = Math.floor(this.invulnerableTime / 100) % 2 === 0;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
        this.visible = true;
      }
    }
  }

  canFire(currentTime) {
    return this.bullets.length < PLAYER_MAX_BULLETS &&
           currentTime - this.lastFireTime >= PLAYER_FIRE_RATE;
  }

  fire(currentTime) {
    const bullet = new Bullet(
      this.x + this.width / 2,
      this.y,
      true
    );
    this.bullets.push(bullet);
    this.lastFireTime = currentTime;
  }

  hit() {
    if (this.invulnerable) return false;

    this.lives--;
    if (this.lives > 0) {
      this.invulnerable = true;
      this.invulnerableTime = 2000; // 2 seconds of invulnerability
    }
    return true;
  }

  draw(ctx) {
    // Draw bullets
    this.bullets.forEach(bullet => bullet.draw(ctx));

    if (!this.visible || !this.active) return;

    // Draw player ship (Galaga-style fighter)
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Main body
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    // Nose
    ctx.moveTo(0, -this.height / 2);
    // Right side
    ctx.lineTo(this.width / 4, -this.height / 4);
    ctx.lineTo(this.width / 2, this.height / 4);
    ctx.lineTo(this.width / 2, this.height / 2);
    // Bottom
    ctx.lineTo(this.width / 4, this.height / 3);
    ctx.lineTo(0, this.height / 2);
    ctx.lineTo(-this.width / 4, this.height / 3);
    ctx.lineTo(-this.width / 2, this.height / 2);
    // Left side
    ctx.lineTo(-this.width / 2, this.height / 4);
    ctx.lineTo(-this.width / 4, -this.height / 4);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-3, this.height / 2 - 2, 6, 4);

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x + 4,
      y: this.y + 4,
      width: this.width - 8,
      height: this.height - 8
    };
  }
}

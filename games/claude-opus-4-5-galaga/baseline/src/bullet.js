import { BULLET_WIDTH, BULLET_HEIGHT, PLAYER_BULLET_SPEED, ENEMY_BULLET_SPEED, COLORS } from './constants.js';

export class Bullet {
  constructor(x, y, isPlayerBullet = true) {
    this.x = x - BULLET_WIDTH / 2;
    this.y = y;
    this.width = BULLET_WIDTH;
    this.height = BULLET_HEIGHT;
    this.isPlayerBullet = isPlayerBullet;
    this.speed = isPlayerBullet ? -PLAYER_BULLET_SPEED : ENEMY_BULLET_SPEED;
    this.active = true;
  }

  update() {
    this.y += this.speed;

    // Deactivate if off screen
    if (this.y < -this.height || this.y > 700) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.isPlayerBullet ? COLORS.playerBullet : COLORS.enemyBullet;

    if (this.isPlayerBullet) {
      // Player bullets are white elongated
      ctx.fillRect(this.x, this.y, this.width, this.height);
      // Add glow effect
      ctx.shadowColor = COLORS.playerBullet;
      ctx.shadowBlur = 5;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.shadowBlur = 0;
    } else {
      // Enemy bullets are red circular
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
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

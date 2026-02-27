import {
  ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_DIVE_SPEED,
  COLORS, ENEMY_TYPE, SCORE_BEE, SCORE_BUTTERFLY, SCORE_BOSS,
  SCORE_DIVING_BONUS, CANVAS_WIDTH, CANVAS_HEIGHT
} from './constants.js';
import { Bullet } from './bullet.js';

export class Enemy {
  constructor(type, gridX, gridY, formationX, formationY) {
    this.type = type;
    this.gridX = gridX;
    this.gridY = gridY;
    this.formationX = formationX;
    this.formationY = formationY;
    this.x = formationX;
    this.y = formationY;
    this.width = ENEMY_WIDTH;
    this.height = ENEMY_HEIGHT;
    this.active = true;

    // State
    this.state = 'formation'; // 'formation', 'diving', 'returning'
    this.animFrame = 0;
    this.animTimer = 0;

    // Diving properties
    this.divePathProgress = 0;
    this.divePath = [];
    this.diveTarget = { x: 0, y: 0 };

    // Health (bosses have 2 hp)
    this.health = type === ENEMY_TYPE.BOSS ? 2 : 1;
    this.damaged = false;

    // Firing
    this.canShoot = true;
    this.bullets = [];
  }

  update(playerX, playerY) {
    this.animTimer++;
    if (this.animTimer >= 15) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    if (this.state === 'formation') {
      // Smoothly move to formation position
      this.x += (this.formationX - this.x) * 0.1;
      this.y += (this.formationY - this.y) * 0.1;
    } else if (this.state === 'diving') {
      this.updateDive(playerX);
    } else if (this.state === 'returning') {
      this.updateReturn();
    }

    // Update bullets
    this.bullets.forEach(bullet => bullet.update());
    this.bullets = this.bullets.filter(bullet => bullet.active);
  }

  startDive(playerX) {
    if (this.state !== 'formation') return;

    this.state = 'diving';
    this.divePathProgress = 0;

    // Create a curved dive path toward the player
    const startX = this.x;
    const startY = this.y;
    const targetX = playerX;
    const targetY = CANVAS_HEIGHT + 50;

    // Control point for bezier curve
    const controlX = startX + (Math.random() - 0.5) * 200;
    const controlY = (startY + targetY) / 2;

    this.divePath = this.createBezierPath(
      startX, startY,
      controlX, controlY,
      targetX, targetY,
      60 // Number of points
    );
  }

  createBezierPath(x1, y1, cx, cy, x2, y2, points) {
    const path = [];
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
      path.push({ x, y });
    }
    return path;
  }

  updateDive(playerX) {
    this.divePathProgress += ENEMY_DIVE_SPEED / 60;

    if (this.divePathProgress >= 1) {
      // Wrap around and return to formation
      this.y = -50;
      this.x = this.formationX;
      this.state = 'returning';
      return;
    }

    const index = Math.floor(this.divePathProgress * (this.divePath.length - 1));
    if (index < this.divePath.length) {
      this.x = this.divePath[index].x;
      this.y = this.divePath[index].y;
    }

    // Chance to fire during dive
    if (this.canShoot && Math.random() < 0.02) {
      this.fire();
    }
  }

  updateReturn() {
    // Move back up to formation
    const dx = this.formationX - this.x;
    const dy = this.formationY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.x = this.formationX;
      this.y = this.formationY;
      this.state = 'formation';
    } else {
      this.x += (dx / dist) * ENEMY_DIVE_SPEED;
      this.y += (dy / dist) * ENEMY_DIVE_SPEED;
    }
  }

  fire() {
    const bullet = new Bullet(
      this.x + this.width / 2,
      this.y + this.height,
      false
    );
    this.bullets.push(bullet);
  }

  hit() {
    this.health--;
    if (this.health <= 0) {
      this.active = false;
      return this.getScore();
    }
    this.damaged = true;
    return 0;
  }

  getScore() {
    let baseScore;
    switch (this.type) {
      case ENEMY_TYPE.BEE:
        baseScore = SCORE_BEE;
        break;
      case ENEMY_TYPE.BUTTERFLY:
        baseScore = SCORE_BUTTERFLY;
        break;
      case ENEMY_TYPE.BOSS:
        baseScore = SCORE_BOSS;
        break;
      default:
        baseScore = SCORE_BEE;
    }
    return this.state === 'diving' ? baseScore * SCORE_DIVING_BONUS : baseScore;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Rotate based on movement direction during dive
    if (this.state === 'diving' && this.divePath.length > 0) {
      const index = Math.floor(this.divePathProgress * (this.divePath.length - 1));
      if (index < this.divePath.length - 1) {
        const next = this.divePath[Math.min(index + 1, this.divePath.length - 1)];
        const current = this.divePath[index];
        const angle = Math.atan2(next.y - current.y, next.x - current.x) + Math.PI / 2;
        ctx.rotate(angle);
      }
    }

    this.drawSprite(ctx);

    ctx.restore();

    // Draw bullets
    this.bullets.forEach(bullet => bullet.draw(ctx));
  }

  drawSprite(ctx) {
    const w = this.width / 2;
    const h = this.height / 2;

    switch (this.type) {
      case ENEMY_TYPE.BEE:
        this.drawBee(ctx, w, h);
        break;
      case ENEMY_TYPE.BUTTERFLY:
        this.drawButterfly(ctx, w, h);
        break;
      case ENEMY_TYPE.BOSS:
        this.drawBoss(ctx, w, h);
        break;
    }
  }

  drawBee(ctx, w, h) {
    ctx.fillStyle = COLORS.bee;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings (animated)
    const wingAngle = this.animFrame === 0 ? 0.3 : -0.3;
    ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';

    // Left wing
    ctx.save();
    ctx.rotate(-0.5 + wingAngle);
    ctx.beginPath();
    ctx.ellipse(-w * 0.5, 0, w * 0.4, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.rotate(0.5 - wingAngle);
    ctx.beginPath();
    ctx.ellipse(w * 0.5, 0, w * 0.4, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-3, -h * 0.3, 2, 0, Math.PI * 2);
    ctx.arc(3, -h * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawButterfly(ctx, w, h) {
    ctx.fillStyle = COLORS.butterfly;

    // Body
    ctx.fillRect(-2, -h * 0.8, 4, h * 1.6);

    // Wings (animated)
    const wingScale = this.animFrame === 0 ? 1 : 0.7;

    // Left wing
    ctx.save();
    ctx.scale(wingScale, 1);
    ctx.beginPath();
    ctx.moveTo(-2, -h * 0.5);
    ctx.quadraticCurveTo(-w, -h, -w * 0.8, 0);
    ctx.quadraticCurveTo(-w, h * 0.8, -2, h * 0.5);
    ctx.fill();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.scale(wingScale, 1);
    ctx.beginPath();
    ctx.moveTo(2, -h * 0.5);
    ctx.quadraticCurveTo(w, -h, w * 0.8, 0);
    ctx.quadraticCurveTo(w, h * 0.8, 2, h * 0.5);
    ctx.fill();
    ctx.restore();

    // Wing spots
    ctx.fillStyle = '#ff88ff';
    ctx.beginPath();
    ctx.arc(-w * 0.4 * wingScale, -h * 0.2, 3, 0, Math.PI * 2);
    ctx.arc(w * 0.4 * wingScale, -h * 0.2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBoss(ctx, w, h) {
    ctx.fillStyle = this.damaged ? '#008888' : COLORS.boss;

    // Main body (helmet shape)
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.quadraticCurveTo(w, -h * 0.5, w, h * 0.3);
    ctx.lineTo(w * 0.6, h);
    ctx.lineTo(-w * 0.6, h);
    ctx.lineTo(-w, h * 0.3);
    ctx.quadraticCurveTo(-w, -h * 0.5, 0, -h);
    ctx.fill();

    // Horn/antenna
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -h);
    ctx.lineTo(0, -h * 1.3);
    ctx.lineTo(w * 0.3, -h);
    ctx.fill();

    // Eyes
    const eyeY = -h * 0.2;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(-w * 0.4, eyeY, 4, 0, Math.PI * 2);
    ctx.arc(w * 0.4, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye glow
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-w * 0.4, eyeY, 2, 0, Math.PI * 2);
    ctx.arc(w * 0.4, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  updateFormationPosition(x, y) {
    this.formationX = x;
    this.formationY = y;
  }
}

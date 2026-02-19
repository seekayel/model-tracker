import Bullet from './Bullet.js';

export default class Player {
  constructor(game) {
    this.game = game;
    this.width = 32;
    this.height = 32;
    this.x = game.width / 2;
    this.y = game.height - 50;
    this.speed = 4;
    this.shootTimer = 0;
    this.shootInterval = 15; // frames between shots
    this.color = '#fff';
    this.active = true;
  }

  update(input) {
    if (!this.active) return;

    // Movement
    if (input.isDown('ArrowLeft')) {
      this.x -= this.speed;
    }
    if (input.isDown('ArrowRight')) {
      this.x += this.speed;
    }

    // Clamp to screen
    if (this.x < this.width / 2) this.x = this.width / 2;
    if (this.x > this.game.width - this.width / 2)
      this.x = this.game.width - this.width / 2;

    // Shooting
    if (this.shootTimer > 0) this.shootTimer--;
    if ((input.isDown('Space') || input.isDown('ArrowUp')) && this.shootTimer <= 0) {
      this.shoot();
      this.shootTimer = this.shootInterval;
    }
  }

  shoot() {
    // Create two bullets for a bit more power feel
    this.game.bullets.push(new Bullet(this.x - 10, this.y, -8, '#f00'));
    this.game.bullets.push(new Bullet(this.x + 10, this.y, -8, '#f00'));
    // Simple sound effect could go here
  }

  draw(ctx) {
    if (!this.active) return;
    
    // Draw fighter ship
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Body
    ctx.fillStyle = '#ccc';
    ctx.fillRect(-6, -8, 12, 24);
    
    // Wings
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-16, 16);
    ctx.lineTo(-6, 8);
    ctx.lineTo(6, 8);
    ctx.lineTo(16, 16);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#f00';
    ctx.fillRect(-2, 0, 4, 8);
    
    // Engine glow
    ctx.fillStyle = '#0ff';
    ctx.fillRect(-4, 16, 2, 4);
    ctx.fillRect(2, 16, 2, 4);

    ctx.restore();
  }
}

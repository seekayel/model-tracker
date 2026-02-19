import Bullet from './Bullet.js';

export default class Enemy {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.type = type; // 0: Bee, 1: Butterfly, 2: Boss
    this.markedForDeletion = false;
    
    // Movement relative to formation origin
    this.relX = x;
    this.relY = y;
    
    // Animation
    this.frame = 0;
    this.flapSpeed = Math.random() * 0.2 + 0.1;
  }

  update(formationX, formationY) {
    this.x = this.relX + formationX;
    this.y = this.relY + formationY;
    
    this.frame += this.flapSpeed;
    
    // Random shooting
    if (Math.random() < 0.0005) { // Low probability per frame
       this.shoot();
    }
  }

  shoot() {
    this.game.enemyBullets.push(new Bullet(this.x, this.y + 10, 4, '#ff0'));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Flapping animation
    const wingOffset = Math.sin(this.frame) * 4;

    if (this.type === 0) { // Blue Bee
      ctx.fillStyle = '#00f';
      ctx.fillRect(-8, -8, 16, 16); // Body
      ctx.fillStyle = '#0ff';
      ctx.fillRect(-14, -8 + wingOffset, 6, 12); // Left Wing
      ctx.fillRect(8, -8 + wingOffset, 6, 12);  // Right Wing
      ctx.fillStyle = '#fff'; // Eyes
      ctx.fillRect(-4, -4, 2, 2);
      ctx.fillRect(2, -4, 2, 2);
    } else if (this.type === 1) { // Red Butterfly
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(-8, -8);
      ctx.lineTo(8, -8);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#ff0'; // Wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-16, -10 + wingOffset);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, -10 + wingOffset);
      ctx.lineTo(10, 10);
      ctx.closePath();
      ctx.fill();
    } else { // Green Boss (takes 2 hits? keep simple for now)
      ctx.fillStyle = '#0f0';
      ctx.beginPath(); // Shield shape
      ctx.moveTo(0, 10);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-6, -12);
      ctx.lineTo(6, -12);
      ctx.lineTo(10, -5);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#fff'; // Detail
      ctx.fillRect(-4, -6, 8, 4);
    }

    ctx.restore();
  }
}

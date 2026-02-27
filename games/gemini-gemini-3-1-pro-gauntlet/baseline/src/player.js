import Projectile from './projectile.js';

export default class Player {
  constructor(game) {
    this.game = game;
    this.width = 40;
    this.height = 40;
    this.x = this.game.width / 2 - this.width / 2;
    this.y = this.game.height - this.height - 20;
    this.speed = 0;
    this.maxSpeed = 5;
    this.shootCooldown = 0;
    this.shootInterval = 300; // ms
  }

  update(deltaTime) {
    // Movement
    if (this.game.input.keys.includes('ArrowRight')) {
        this.speed = this.maxSpeed;
        this.x += this.speed;
    } else if (this.game.input.keys.includes('ArrowLeft')) {
        this.speed = -this.maxSpeed;
        this.x += this.speed;
    } else if (this.game.input.keys.includes('ArrowUp')) {
        this.speed = -this.maxSpeed;
        this.y += this.speed;
    } else if (this.game.input.keys.includes('ArrowDown')) {
        this.speed = this.maxSpeed;
        this.y += this.speed;
    } else {
        this.speed = 0;
    }

    // Shooting
    if (this.game.input.keys.includes(' ') && this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = this.shootInterval;
    }

    if (this.shootCooldown > 0) {
        this.shootCooldown -= deltaTime;
    }

    // Boundaries
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y > this.game.height - this.height) this.y = this.game.height - this.height;

    // Wall collision
    const gridX = Math.floor((this.x + this.width/2) / this.game.level.tileSize);
    const gridY = Math.floor((this.y + this.height/2) / this.game.level.tileSize);

    if (this.game.level.isWall(gridX, gridY)) {
        // A simple pushback - could be improved
        if(this.speed > 0) {
            if(this.game.input.keys.includes('ArrowRight')) this.x -= this.maxSpeed;
            if(this.game.input.keys.includes('ArrowDown')) this.y -= this.maxSpeed;
        } else {
            if(this.game.input.keys.includes('ArrowLeft')) this.x += this.maxSpeed;
            if(this.game.input.keys.includes('ArrowUp')) this.y += this.maxSpeed;
        }
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  shoot() {
      // For simplicity, we shoot in 4 directions based on last move, default to up
      let projectileSpeedX = 0;
      let projectileSpeedY = -10; // default up

      const lastVertical = this.game.input.keys.find(k => k === 'ArrowUp' || k === 'ArrowDown');
      const lastHorizontal = this.game.input.keys.find(k => k === 'ArrowLeft' || k === 'ArrowRight');

      if (lastVertical === 'ArrowUp') {
          projectileSpeedY = -10;
          projectileSpeedX = 0;
      } else if (lastVertical === 'ArrowDown') {
          projectileSpeedY = 10;
          projectileSpeedX = 0;
      }

      if (lastHorizontal === 'ArrowLeft') {
          projectileSpeedX = -10;
          projectileSpeedY = 0;
      } else if (lastHorizontal === 'ArrowRight') {
          projectileSpeedX = 10;
          projectileSpeedY = 0;
      }


      this.game.projectiles.push(new Projectile(this.game, this.x + this.width / 2, this.y + this.height / 2, projectileSpeedX, projectileSpeedY));
  }
}

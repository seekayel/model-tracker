import Player from './player.js';
import InputHandler from './input.js';
import Level from './level.js';
import { Ghost, Demon } from './enemy.js';
import HUD from './hud.js';

export default class Game {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.level = new Level(this);
    this.player = new Player(this);
    this.input = new InputHandler(this);
    this.hud = new HUD(this);
    this.projectiles = [];
    this.enemies = [];
    this.enemyTimer = 0;
    this.enemyInterval = 2000; // spawn enemy every 2 seconds
    this.score = 0;
    this.gameOver = false;
    this.health = 1000;

    // Initial enemy spawn
    this.addEnemies();
  }

  addEnemies() {
      // simple spawner for now
      for (let i = 0; i < 5; i++) {
          const isGhost = Math.random() > 0.5;
          const x = Math.random() * (this.width - 50) + 50;
          const y = Math.random() * (this.height - 50) + 50;
          if(isGhost) {
            this.enemies.push(new Ghost(this, x, y));
          } else {
            this.enemies.push(new Demon(this, x, y));
          }
      }
  }

  update(deltaTime) {
    if(this.health <= 0) {
        this.gameOver = true;
    }
    this.player.update(deltaTime);
    this.projectiles.forEach(p => p.update());
    this.enemies.forEach(e => e.update(deltaTime));

    // check collisions
    this.projectiles.forEach(projectile => {
        this.enemies.forEach(enemy => {
            const dx = enemy.x - projectile.x;
            const dy = enemy.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < enemy.width / 2 + projectile.width / 2) {
                enemy.markedForDeletion = true;
                projectile.markedForDeletion = true;
                this.score += enemy.scoreValue;
            }
        });
    });

    this.enemies.forEach(enemy => {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < this.player.width/2 + enemy.width/2) {
            this.health--;
        }
    });

    this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    this.enemies = this.enemies.filter(e => !e.markedForDeletion);

    // add new enemies
    if(this.enemyTimer > this.enemyInterval) {
        this.addEnemies();
        this.enemyTimer = 0;
    } else {
        this.enemyTimer += deltaTime;
    }

  }

  draw(ctx) {
    this.level.draw(ctx);
    this.player.draw(ctx);
    this.projectiles.forEach(p => p.draw(ctx));
    this.enemies.forEach(e => e.draw(ctx));
    this.hud.draw(ctx);
  }
}

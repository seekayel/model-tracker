import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, HEALTH_DRAIN_RATE } from './constants.js';
import { InputManager } from './input.js';
import { Player } from './player.js';
import { Enemy } from './enemies.js';
import { Level } from './level.js';
import { ProjectileManager } from './projectiles.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.input = new InputManager();
    this.projectiles = new ProjectileManager();

    this.player = null;
    this.level = null;
    this.enemies = [];
    this.levelNumber = 1;

    this.lastTime = 0;
    this.running = false;
    this.gameOver = false;

    this.onGameOver = null;
    this.onLevelComplete = null;
  }

  start(characterClass) {
    this.levelNumber = 1;
    this.gameOver = false;
    this.loadLevel(characterClass);
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  loadLevel(characterClass) {
    this.level = new Level(this.levelNumber);
    this.enemies = [];
    this.projectiles.clear();

    if (!this.player || characterClass) {
      this.player = new Player(
        this.level.playerStart.x * TILE_SIZE + 2,
        this.level.playerStart.y * TILE_SIZE + 2,
        characterClass || 'warrior'
      );
    } else {
      // Keep player stats, just reposition
      this.player.x = this.level.playerStart.x * TILE_SIZE + 2;
      this.player.y = this.level.playerStart.y * TILE_SIZE + 2;
      // Small health bonus for completing level
      this.player.heal(20);
    }

    this.updateHUD();
  }

  nextLevel() {
    this.levelNumber++;
    this.loadLevel();

    if (this.onLevelComplete) {
      this.onLevelComplete(this.levelNumber);
    }
  }

  gameLoop() {
    if (!this.running) return;

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(dt, now);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  update(dt, now) {
    if (this.gameOver) return;

    // Health drain (classic Gauntlet mechanic)
    this.player.health -= HEALTH_DRAIN_RATE * dt;

    // Player update
    this.player.update(dt, this.input, this.level);

    // Player attacking
    if (this.input.isAttacking() && this.player.canAttack(now)) {
      const projectile = this.player.attack(now, this.input.getAimDirection());
      this.projectiles.add(projectile);
    }

    // Spawner updates
    for (const spawner of this.level.spawners) {
      const newEnemy = spawner.update(now, this.enemies);
      if (newEnemy) {
        this.enemies.push(newEnemy);
      }
    }

    // Enemy updates
    for (const enemy of this.enemies) {
      const projectile = enemy.update(dt, this.player, this.level, now);
      if (projectile) {
        this.projectiles.add(projectile);
      }

      // Check collision with player
      if (enemy.collidesWithPlayer(this.player)) {
        this.player.takeDamage(enemy.damage);
      }
    }

    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.health > 0);

    // Projectile updates
    this.projectiles.update(dt, this.level, this.player, this.enemies, this.level.spawners);

    // Check for level exit
    if (this.player.isAtExit(this.level)) {
      this.nextLevel();
    }

    // Check for game over
    if (this.player.health <= 0) {
      this.endGame();
    }

    this.updateHUD();
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw level
    this.level.draw(this.ctx);

    // Draw spawners
    for (const spawner of this.level.spawners) {
      spawner.draw(this.ctx);
    }

    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }

    // Draw player
    this.player.draw(this.ctx);

    // Draw projectiles
    this.projectiles.draw(this.ctx);

    // Draw game over overlay
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#e74c3c';
      this.ctx.font = '48px Courier New';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  updateHUD() {
    document.getElementById('health').textContent = Math.max(0, Math.floor(this.player.health));
    document.getElementById('score').textContent = this.player.score;
    document.getElementById('keys').textContent = this.player.keys;
    document.getElementById('level').textContent = this.levelNumber;
    document.getElementById('player-class').textContent =
      this.player.characterClass.charAt(0).toUpperCase() + this.player.characterClass.slice(1);
  }

  endGame() {
    this.gameOver = true;
    this.running = false;

    if (this.onGameOver) {
      this.onGameOver(this.player.score, this.levelNumber);
    }
  }

  stop() {
    this.running = false;
  }
}

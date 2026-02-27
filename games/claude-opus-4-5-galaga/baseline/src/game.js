import { GAME_STATE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { Player } from './player.js';
import { Formation } from './formation.js';
import { Explosion } from './explosion.js';
import { Stars } from './stars.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';

export class Game {
  constructor(canvas) {
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    this.ctx = this.renderer.getContext();

    this.player = new Player();
    this.formation = new Formation();
    this.stars = new Stars();
    this.explosions = [];

    this.state = GAME_STATE.START;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.wave = 1;

    this.stateTimer = 0;
    this.lastTime = 0;

    // UI elements
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.finalScoreElement = document.getElementById('final-score');

    this.setupInput();
  }

  setupInput() {
    this.input.onKeyDown((code) => {
      if (this.state === GAME_STATE.START && (code === 'Space' || code === 'Enter')) {
        this.startGame();
      } else if (this.state === GAME_STATE.GAME_OVER && (code === 'Space' || code === 'Enter')) {
        this.restartGame();
      } else if (this.state === GAME_STATE.PLAYING && (code === 'KeyP' || code === 'Escape')) {
        this.pauseGame();
      } else if (this.state === GAME_STATE.PAUSED && (code === 'KeyP' || code === 'Escape')) {
        this.resumeGame();
      }
    });
  }

  loadHighScore() {
    try {
      const saved = localStorage.getItem('galaga-high-score');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem('galaga-high-score', this.highScore.toString());
    } catch (e) {
      // localStorage not available
    }
  }

  startGame() {
    this.state = GAME_STATE.PLAYING;
    this.score = 0;
    this.wave = 1;
    this.player.fullReset();
    this.formation.createWave(this.wave);
    this.explosions = [];
    this.hideAllScreens();
  }

  restartGame() {
    this.startGame();
  }

  pauseGame() {
    this.state = GAME_STATE.PAUSED;
    this.pauseScreen.classList.remove('hidden');
  }

  resumeGame() {
    this.state = GAME_STATE.PLAYING;
    this.pauseScreen.classList.add('hidden');
  }

  gameOver() {
    this.state = GAME_STATE.GAME_OVER;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    this.finalScoreElement.textContent = `Final Score: ${this.score}`;
    this.gameOverScreen.classList.remove('hidden');
  }

  hideAllScreens() {
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
  }

  nextWave() {
    this.wave++;
    this.stateTimer = 120; // 2 seconds at 60fps
    this.state = GAME_STATE.STAGE_CLEAR;
  }

  update(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Always update stars for background effect
    this.stars.update();

    if (this.state === GAME_STATE.PLAYING) {
      this.updatePlaying(currentTime);
    } else if (this.state === GAME_STATE.STAGE_CLEAR) {
      this.updateStageClear();
    } else if (this.state === GAME_STATE.PLAYER_DEATH) {
      this.updatePlayerDeath();
    }

    // Update explosions
    this.explosions.forEach(exp => exp.update());
    this.explosions = this.explosions.filter(exp => exp.active);
  }

  updatePlaying(currentTime) {
    // Update player
    this.player.update(this.input, currentTime);

    // Update formation
    this.formation.update(
      this.player.x + this.player.width / 2,
      this.player.y
    );

    // Check collisions
    this.checkCollisions();

    // Check for wave clear
    if (this.formation.isEmpty()) {
      this.nextWave();
    }

    // Check for game over
    if (this.player.lives <= 0) {
      this.createExplosion(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        'large'
      );
      this.player.active = false;
      this.stateTimer = 90;
      this.state = GAME_STATE.PLAYER_DEATH;
    }
  }

  updateStageClear() {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.formation.createWave(this.wave);
      this.state = GAME_STATE.PLAYING;
    }
  }

  updatePlayerDeath() {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.gameOver();
    }
  }

  checkCollisions() {
    const enemies = this.formation.getEnemies();
    const enemyBullets = this.formation.getAllBullets();

    // Player bullets vs enemies
    this.player.bullets.forEach(bullet => {
      if (!bullet.active) return;

      enemies.forEach(enemy => {
        if (!enemy.active) return;

        if (this.checkCollision(bullet.getBounds(), enemy.getBounds())) {
          bullet.active = false;
          const points = enemy.hit();
          if (points > 0) {
            this.score += points;
            this.createExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              'normal'
            );
          }
        }
      });
    });

    // Enemy bullets vs player
    if (!this.player.invulnerable && this.player.active) {
      enemyBullets.forEach(bullet => {
        if (!bullet.active) return;

        if (this.checkCollision(bullet.getBounds(), this.player.getBounds())) {
          bullet.active = false;
          if (this.player.hit()) {
            this.createExplosion(
              this.player.x + this.player.width / 2,
              this.player.y + this.player.height / 2,
              'normal'
            );
          }
        }
      });

      // Enemies vs player (collision)
      enemies.forEach(enemy => {
        if (!enemy.active) return;

        if (this.checkCollision(enemy.getBounds(), this.player.getBounds())) {
          enemy.active = false;
          if (this.player.hit()) {
            this.createExplosion(
              this.player.x + this.player.width / 2,
              this.player.y + this.player.height / 2,
              'large'
            );
          }
          this.createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            'normal'
          );
        }
      });
    }
  }

  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  createExplosion(x, y, size) {
    this.explosions.push(new Explosion(x, y, size));
  }

  draw() {
    this.renderer.clear();

    // Draw background stars
    this.stars.draw(this.ctx);

    if (this.state === GAME_STATE.START) {
      // Just show HUD on start screen
      this.renderer.drawHUD(0, 3, this.highScore, 1);
      return;
    }

    // Draw game elements
    this.formation.draw(this.ctx);
    this.player.draw(this.ctx);
    this.explosions.forEach(exp => exp.draw(this.ctx));

    // Draw HUD
    this.renderer.drawHUD(this.score, this.player.lives, this.highScore, this.wave);

    // Draw wave intro
    if (this.state === GAME_STATE.STAGE_CLEAR) {
      this.renderer.drawWaveIntro(this.wave);
    }
  }

  run(currentTime = 0) {
    this.update(currentTime);
    this.draw();
    requestAnimationFrame((time) => this.run(time));
  }
}

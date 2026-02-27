import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  GAME_STATE
} from './constants.js';
import { Player, Mushroom, Particle } from './entities.js';
import { Level } from './level.js';
import { checkEntityCollision, isStomping } from './physics.js';

export class Game {
  constructor() {
    this.state = GAME_STATE.START;
    this.level = new Level();
    this.player = new Player(this.level.spawnX, this.level.spawnY);
    this.mushrooms = [];
    this.particles = [];
    this.timeRemaining = 400; // Game time in seconds
    this.timeAccumulator = 0;

    // Screens
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.winScreen = document.getElementById('win-screen');
  }

  start() {
    this.state = GAME_STATE.PLAYING;
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.winScreen.classList.add('hidden');
  }

  update(input, deltaTime) {
    // Handle state-based input
    if (this.state === GAME_STATE.START) {
      if (input.consume('enter')) {
        this.start();
      }
      return;
    }

    if (this.state === GAME_STATE.GAME_OVER) {
      if (input.consume('enter')) {
        this.reset();
        this.start();
      }
      return;
    }

    if (this.state === GAME_STATE.WIN) {
      if (input.consume('enter')) {
        this.reset();
        this.start();
      }
      return;
    }

    if (this.state !== GAME_STATE.PLAYING) return;

    // Update game time
    this.timeAccumulator += deltaTime;
    if (this.timeAccumulator >= 1000) {
      this.timeAccumulator -= 1000;
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.player.die();
      }
    }

    // Update player
    const collisions = this.player.update(
      input,
      this.level.tiles,
      this.level.width,
      this.level.height,
      deltaTime
    );

    // Check if player hit a block from below
    if (collisions && collisions.hitBlock) {
      this.handleBlockHit(collisions.hitBlock);
    }

    // Check if player fell into pit
    if (this.player.y > CANVAS_HEIGHT + 100) {
      if (!this.player.isDead) {
        this.player.die();
      }
    }

    // Check if player reached flag
    if (!this.player.hasWon && this.player.x >= this.level.flagX) {
      this.player.win();
      this.player.score += this.timeRemaining * 10;
    }

    // Handle player death
    if (this.player.isDead && this.player.deathTimer > 2000) {
      if (this.player.lives <= 0) {
        this.showGameOver();
      } else {
        this.respawnPlayer();
      }
    }

    // Handle win
    if (this.player.hasWon && this.player.winTimer > 3000) {
      this.showWin();
    }

    // Update enemies
    for (const enemy of this.level.enemies) {
      enemy.update(this.level.tiles, this.level.width, this.level.height, deltaTime);

      // Check collision with player
      if (enemy.active && !enemy.isSquished && !this.player.isDead && !this.player.hasWon) {
        if (checkEntityCollision(this.player, enemy)) {
          this.handleEnemyCollision(enemy);
        }
      }
    }

    // Update coins
    for (const coin of this.level.coins) {
      coin.update(deltaTime);

      // Check collection
      if (coin.active && checkEntityCollision(this.player, coin)) {
        coin.collect();
        this.player.collectCoin();
        this.spawnCoinParticle(coin.x, coin.y);
      }
    }

    // Update mushrooms
    for (const mushroom of this.mushrooms) {
      mushroom.update(this.level.tiles, this.level.width, this.level.height, deltaTime);

      // Check collection
      if (mushroom.active && !mushroom.emerging && checkEntityCollision(this.player, mushroom)) {
        mushroom.collect();
        this.player.collectMushroom();
      }
    }

    // Update particles
    for (const particle of this.particles) {
      particle.update(deltaTime);
    }

    // Clean up inactive entities
    this.particles = this.particles.filter(p => p.active);
    this.mushrooms = this.mushrooms.filter(m => m.active);
  }

  handleBlockHit(block) {
    const result = this.level.hitBlock(block.x, block.y);

    if (!result) return;

    if (result.type === 'brick' && result.break && this.player.isBig) {
      // Break brick
      this.level.setTile(block.x, block.y, 0);
      // Spawn brick particles
      for (let i = 0; i < 4; i++) {
        this.particles.push(new Particle(
          block.x * TILE_SIZE + TILE_SIZE / 2,
          block.y * TILE_SIZE + TILE_SIZE / 2,
          'brick'
        ));
      }
    } else if (result.type === 'question') {
      if (result.content === 'coin') {
        this.player.collectCoin();
        this.spawnCoinParticle(block.x * TILE_SIZE, block.y * TILE_SIZE - TILE_SIZE);
      } else if (result.content === 'mushroom') {
        this.mushrooms.push(new Mushroom(
          block.x * TILE_SIZE + 2,
          block.y * TILE_SIZE
        ));
      }
    }
  }

  handleEnemyCollision(enemy) {
    if (isStomping(this.player, enemy)) {
      // Player stomped enemy
      const result = enemy.stomp();
      this.player.vy = -8; // Bounce

      // Add score
      if (enemy.constructor.name === 'Koopa') {
        if (result === 'shell') {
          this.player.score += enemy.points;
        } else if (result === 'kick') {
          // Kick direction based on player position
          const direction = this.player.x < enemy.x ? 1 : -1;
          enemy.kickShell(direction);
        }
      } else {
        this.player.score += enemy.points;
      }

      this.particles.push(new Particle(enemy.x, enemy.y, 'score'));
      this.particles[this.particles.length - 1].value = enemy.points;
    } else {
      // Player hit enemy from side
      if (enemy.constructor.name === 'Koopa' && enemy.isShell && !enemy.shellMoving) {
        // Kick stationary shell
        const direction = this.player.x < enemy.x ? 1 : -1;
        enemy.kickShell(direction);
      } else {
        // Take damage
        this.player.takeDamage();
      }
    }
  }

  spawnCoinParticle(x, y) {
    const particle = new Particle(x, y, 'coin');
    this.particles.push(particle);
  }

  respawnPlayer() {
    this.player.reset(this.level.spawnX, this.level.spawnY);
    this.player.isBig = false;
    this.player.height = 32;
    this.timeRemaining = 400;
    this.timeAccumulator = 0;
  }

  showGameOver() {
    this.state = GAME_STATE.GAME_OVER;
    this.gameOverScreen.classList.remove('hidden');
    const scoreDisplay = this.gameOverScreen.querySelector('.final-score');
    scoreDisplay.textContent = `Score: ${this.player.score}`;
  }

  showWin() {
    this.state = GAME_STATE.WIN;
    this.winScreen.classList.remove('hidden');
    const scoreDisplay = this.winScreen.querySelector('.final-score');
    scoreDisplay.textContent = `Score: ${this.player.score}`;
  }

  reset() {
    this.level.reset();
    this.player = new Player(this.level.spawnX, this.level.spawnY);
    this.mushrooms = [];
    this.particles = [];
    this.timeRemaining = 400;
    this.timeAccumulator = 0;
    this.state = GAME_STATE.START;
  }
}

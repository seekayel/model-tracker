import {
  GAME_STATE, CANVAS_WIDTH, CANVAS_HEIGHT,
  TILE, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT,
  HEALTH_DRAIN_INTERVAL, HEALTH_DRAIN_RATE,
  ITEM_TYPE, ITEM_CONFIG, ENEMY_TYPE, SPAWNER_MAX_ENEMIES,
  COLORS,
} from './constants.js';
import { generateDungeon, worldToTile } from './dungeon.js';
import { Player, Enemy, Spawner, Item, Projectile, MagicBurst, dist, circlesOverlap } from './entities.js';
import { InputHandler } from './input.js';
import { Renderer, FloatingText } from './renderer.js';

const TOTAL_LEVELS = 5;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();

    this.state = GAME_STATE.MENU;
    this.level = 1;
    this.player = null;
    this.dungeon = null;
    this.enemies = [];
    this.spawners = [];
    this.items = [];
    this.projectiles = [];
    this.floatingTexts = [];

    this.healthDrainTimer = 0;
    this.lastTime = 0;

    this.overlay = document.getElementById('overlay');
    this.overlayBody = document.getElementById('overlay-body');
    this.startBtn = document.getElementById('startBtn');

    this.startBtn.addEventListener('click', () => this.handleStartButton());

    this.hudHealth = document.getElementById('hud-health');
    this.hudScore = document.getElementById('hud-score');
    this.hudLevel = document.getElementById('hud-level');
    this.hudClass = document.getElementById('hud-class');
    this.hudMagic = null;
  }

  handleStartButton() {
    if (this.state === GAME_STATE.MENU || this.state === GAME_STATE.GAME_OVER || this.state === GAME_STATE.WIN) {
      this.startGame();
    } else if (this.state === GAME_STATE.LEVEL_COMPLETE) {
      this.nextLevel();
    }
  }

  startGame() {
    this.level = 1;
    this.loadLevel();
    this.state = GAME_STATE.PLAYING;
    this.hideOverlay();
  }

  nextLevel() {
    this.level++;
    if (this.level > TOTAL_LEVELS) {
      this.showWin();
      return;
    }
    const savedScore = this.player.score;
    const savedHealth = Math.max(100, this.player.health);
    const savedMagic = this.player.magicCharges;
    this.loadLevel();
    this.player.score = savedScore;
    this.player.health = savedHealth;
    this.player.magicCharges = savedMagic;
    this.state = GAME_STATE.PLAYING;
    this.hideOverlay();
  }

  loadLevel() {
    this.dungeon = generateDungeon(this.level);
    const { playerStart, spawners: spawnerData, items: itemData } = this.dungeon;

    this.player = new Player(playerStart.x, playerStart.y);
    this.enemies = [];
    this.projectiles = [];
    this.floatingTexts = [];

    // Create spawner entities
    this.spawners = spawnerData.map(s =>
      new Spawner(s.x, s.y, s.tileX, s.tileY, s.enemyType)
    );

    // Spawn initial enemies for each spawner
    this.spawners.forEach(spawner => {
      const count = 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ex = spawner.x + Math.cos(angle) * 40;
        const ey = spawner.y + Math.sin(angle) * 40;
        this.enemies.push(new Enemy(ex, ey, spawner.enemyType));
      }
    });

    // Create item entities
    this.items = itemData.map(d => new Item(d.x, d.y, d.type));
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  loop(timestamp) {
    const dt = Math.min(timestamp - this.lastTime, 50); // cap at 50ms
    this.lastTime = timestamp;

    this.update(dt);
    this.render();
    this.input.clearFrame();

    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    if (this.state !== GAME_STATE.PLAYING) return;

    const { map } = this.dungeon;

    // Update player
    this.player.update(dt, this.input, map, this.projectiles);

    // Health drain over time (Gauntlet signature mechanic)
    this.healthDrainTimer += dt;
    if (this.healthDrainTimer >= HEALTH_DRAIN_INTERVAL) {
      this.healthDrainTimer -= HEALTH_DRAIN_INTERVAL;
      this.player.health = Math.max(0, this.player.health - HEALTH_DRAIN_RATE);
      if (this.player.health <= 0) {
        this.player.alive = false;
      }
    }

    // Update spawners
    const liveEnemyCount = this.enemies.filter(e => e.alive).length;
    this.spawners.forEach(s => s.update(dt, this.enemies, liveEnemyCount));

    // Update enemies
    this.enemies.forEach(e => e.update(dt, this.player, map, this.projectiles));

    // Update projectiles
    this.projectiles.forEach(p => {
      if (p.isMagic) p.update(dt);
      else p.update(dt, map);
    });

    // Update items
    this.items.forEach(item => item.update(dt));

    // Update floating texts
    this.floatingTexts.forEach(t => t.update(dt));

    // Collision detection
    this.handleCollisions();

    // Check win/lose conditions
    if (!this.player.alive) {
      this.showGameOver();
      return;
    }

    // Check exit reached
    const { tileX, tileY } = worldToTile(this.player.x, this.player.y);
    if (map[tileY] && map[tileY][tileX] === TILE.EXIT) {
      this.showLevelComplete();
      return;
    }

    // Cleanup dead entities
    this.enemies = this.enemies.filter(e => e.alive);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.items = this.items.filter(i => i.alive);
    this.floatingTexts = this.floatingTexts.filter(t => t.alive);

    // Update camera
    this.renderer.updateCamera(this.player.x, this.player.y);

    // Update HUD
    this.updateHUD();
  }

  handleCollisions() {
    const player = this.player;
    const playerR = 10;

    // Player vs items
    this.items.forEach(item => {
      if (!item.alive) return;
      if (dist(player.x, player.y, item.x, item.y) < playerR + item.size + 5) {
        this.collectItem(item);
      }
    });

    // Projectiles vs enemies/spawners/player
    this.projectiles.forEach(proj => {
      if (!proj.alive) return;

      if (proj.isMagic) {
        // Magic burst hits all enemies in radius
        this.enemies.forEach(enemy => {
          if (!enemy.alive) return;
          if (dist(proj.x, proj.y, enemy.x, enemy.y) < proj.radius + enemy.size) {
            enemy.takeDamage(proj.damage);
            proj.hitsLeft--;
            if (enemy.health <= 0) {
              this.onEnemyKilled(enemy);
            }
          }
        });
        this.spawners.forEach(spawner => {
          if (!spawner.alive) return;
          if (dist(proj.x, proj.y, spawner.x, spawner.y) < proj.radius + spawner.size) {
            spawner.takeDamage(proj.damage);
            if (!spawner.alive) this.onSpawnerDestroyed(spawner);
          }
        });
        return;
      }

      if (!proj.isEnemy) {
        // Player projectiles hit enemies
        this.enemies.forEach(enemy => {
          if (!enemy.alive || !proj.alive) return;
          if (dist(proj.x, proj.y, enemy.x, enemy.y) < proj.radius + enemy.size) {
            enemy.takeDamage(proj.damage);
            proj.alive = false;
            if (!enemy.alive) this.onEnemyKilled(enemy);
          }
        });
        // Player projectiles hit spawners
        this.spawners.forEach(spawner => {
          if (!spawner.alive || !proj.alive) return;
          if (dist(proj.x, proj.y, spawner.x, spawner.y) < proj.radius + spawner.size) {
            spawner.takeDamage(proj.damage);
            proj.alive = false;
            if (!spawner.alive) this.onSpawnerDestroyed(spawner);
          }
        });
      } else {
        // Enemy projectiles hit player
        if (dist(proj.x, proj.y, player.x, player.y) < proj.radius + playerR) {
          player.takeDamage(proj.damage);
          proj.alive = false;
          if (player.health <= 500) {
            this.addFloatingText(player.x, player.y - 20, 'LOW HEALTH!', '#ff4444');
          }
        }
      }
    });

    // Enemies melee attack player
    this.enemies.forEach(enemy => {
      if (!enemy.alive || enemy.attackCooldown > 0) return;
      if (dist(enemy.x, enemy.y, player.x, player.y) < enemy.attackRange + playerR) {
        player.takeDamage(enemy.damage);
        enemy.attackCooldown = enemy.attackCooldownMax;
      }
    });
  }

  collectItem(item) {
    item.alive = false;
    const cfg = item.config;

    switch (item.type) {
      case ITEM_TYPE.FOOD:
        this.player.heal(cfg.health);
        this.addFloatingText(item.x, item.y, `+${cfg.health} HP`, '#44cc44');
        break;
      case ITEM_TYPE.KEY:
        this.player.keys++;
        this.addFloatingText(item.x, item.y, 'KEY!', '#ffcc00');
        break;
      case ITEM_TYPE.POTION:
        this.player.magicCharges++;
        this.addFloatingText(item.x, item.y, '+MAGIC', '#8888ff');
        break;
      case ITEM_TYPE.TREASURE:
        // Already counted in points below
        this.addFloatingText(item.x, item.y, `+${cfg.points}`, '#ffaa00');
        break;
    }

    this.player.addScore(cfg.points);
  }

  onEnemyKilled(enemy) {
    this.player.addScore(enemy.points);
    this.addFloatingText(enemy.x, enemy.y - 15, `+${enemy.points}`, '#ffee44');
  }

  onSpawnerDestroyed(spawner) {
    this.player.addScore(200);
    this.addFloatingText(spawner.x, spawner.y - 20, '+200 SPAWNER!', '#ff8844');
  }

  addFloatingText(x, y, text, color) {
    this.floatingTexts.push(new FloatingText(x, y, text, color));
  }

  render() {
    this.renderer.clear();

    if (this.state !== GAME_STATE.PLAYING) return;

    const { map } = this.dungeon;
    this.renderer.renderMap(map);
    this.renderer.renderItems(this.items);
    this.renderer.renderSpawners(this.spawners);
    this.renderer.renderEnemies(this.enemies);
    this.renderer.renderProjectiles(this.projectiles);
    this.renderer.renderPlayer(this.player);
    this.renderer.renderFloatingText(this.floatingTexts);
  }

  updateHUD() {
    const player = this.player;
    const hpColor = player.health > 1000 ? '#44cc44' : player.health > 500 ? '#ccaa00' : '#cc4444';
    this.hudHealth.style.color = hpColor;
    this.hudHealth.textContent = `♥ ${Math.ceil(player.health)}`;
    this.hudScore.textContent = `Score: ${player.score}`;
    this.hudLevel.textContent = `Level ${this.level} / ${TOTAL_LEVELS}`;
    this.hudClass.textContent = `Warrior ⚔ Magic: ${'★'.repeat(player.magicCharges)}${'☆'.repeat(Math.max(0, 3 - player.magicCharges))}`;
  }

  showOverlay(html, btnText) {
    this.overlayBody.innerHTML = html;
    this.startBtn.textContent = btnText;
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  showLevelComplete() {
    this.state = GAME_STATE.LEVEL_COMPLETE;
    const nextLvl = this.level + 1;
    const html = `
      <p class="result success">Level ${this.level} Complete!</p>
      <p>Score: <strong>${this.player.score}</strong></p>
      <p>Health remaining: <strong>${Math.ceil(this.player.health)}</strong></p>
      ${nextLvl <= TOTAL_LEVELS ? `<p>Get ready for Level ${nextLvl}...</p>` : '<p>Final level cleared!</p>'}
    `;
    this.showOverlay(html, nextLvl <= TOTAL_LEVELS ? `Continue to Level ${nextLvl}` : 'See Final Score');
  }

  showGameOver() {
    this.state = GAME_STATE.GAME_OVER;
    const html = `
      <p class="result fail">Game Over</p>
      <p>You reached Level <strong>${this.level}</strong></p>
      <p>Final Score: <strong>${this.player.score}</strong></p>
      <p style="color:#aaa;font-size:0.85em">Your health drained to zero in the dungeon...</p>
    `;
    this.showOverlay(html, 'Play Again');
  }

  showWin() {
    this.state = GAME_STATE.WIN;
    const html = `
      <p class="result win">Victory!</p>
      <p>You conquered all <strong>${TOTAL_LEVELS}</strong> dungeon levels!</p>
      <p>Final Score: <strong>${this.player.score}</strong></p>
      <p style="color:#ffee44">The dungeon has been cleared!</p>
    `;
    this.showOverlay(html, 'Play Again');
  }
}

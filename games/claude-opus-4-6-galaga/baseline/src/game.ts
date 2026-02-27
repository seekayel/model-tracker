import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_FIRE_COOLDOWN, PLAYER_START_LIVES,
  BULLET_WIDTH, BULLET_HEIGHT, PLAYER_BULLET_SPEED, ENEMY_BULLET_SPEED,
  ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_COLS, ENEMY_ROWS, ENEMY_SPACING_X, ENEMY_SPACING_Y,
  FORMATION_TOP, FORMATION_LEFT,
  DIVE_SPEED, DIVE_CHANCE_PER_FRAME, DIVE_SHOOT_CHANCE,
  SCORE_BEE, SCORE_BUTTERFLY, SCORE_BOSS,
  STAR_COUNT, STAR_SPEED_MIN, STAR_SPEED_MAX,
  EnemyType, GameState,
  type Vec2, type Bullet, type Star, type Enemy, type Explosion,
} from './types';
import { isKeyDown, isKeyPressed, clearPressed } from './input';
import { playShoot, playEnemyHit, playPlayerHit, playDive, playStageStart } from './sound';
import {
  initRenderer, clearScreen,
  renderStars, renderPlayer, renderEnemies, renderBullets, renderExplosions,
  renderHUD, renderTitleScreen, renderStageIntro, renderGameOver, renderPaused,
} from './renderer';

// Game state
let state: GameState = GameState.Title;
let paused = false;
let score = 0;
let highScore = 0;
let lives = PLAYER_START_LIVES;
let stage = 1;

// Player
let playerX = 0;
let playerY = 0;
let playerVisible = true;
let lastFireTime = 0;

// Entities
let bullets: Bullet[] = [];
let enemies: Enemy[] = [];
let explosions: Explosion[] = [];
let stars: Star[] = [];

// Timers
let stageIntroTimer = 0;
let dyingTimer = 0;
let gameOverTimer = 0;

// Formation sway
let formationX = 0;
let formationDir = 1;
const FORMATION_SWAY_SPEED = 0.3;
const FORMATION_SWAY_RANGE = 20;

export function startGame(): void {
  initRenderer();
  initStars();
  requestAnimationFrame(gameLoop);
}

function initStars(): void {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      speed: STAR_SPEED_MIN + Math.random() * (STAR_SPEED_MAX - STAR_SPEED_MIN),
      brightness: 0.3 + Math.random() * 0.7,
    });
  }
}

function resetPlayer(): void {
  playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
  playerY = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
  playerVisible = true;
  lastFireTime = 0;
}

function spawnEnemies(): void {
  enemies = [];
  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
      let type: EnemyType;
      if (row === 0) {
        type = EnemyType.Boss;
      } else if (row === 1) {
        type = EnemyType.Butterfly;
      } else {
        type = EnemyType.Bee;
      }

      const homeX = FORMATION_LEFT + col * ENEMY_SPACING_X;
      const homeY = FORMATION_TOP + row * ENEMY_SPACING_Y;

      enemies.push({
        type,
        gridCol: col,
        gridRow: row,
        x: homeX,
        y: -30 - row * 30 - col * 5, // Start off-screen, staggered
        alive: true,
        diving: false,
        divePath: [],
        diveIndex: 0,
        diveT: 0,
        homeX,
        homeY,
        animFrame: 0,
        animTimer: 0,
      });
    }
  }
}

function startNewGame(): void {
  score = 0;
  lives = PLAYER_START_LIVES;
  stage = 1;
  bullets = [];
  explosions = [];
  startStage();
}

function startStage(): void {
  state = GameState.StageIntro;
  stageIntroTimer = 120; // frames
  bullets = [];
  explosions = [];
  resetPlayer();
  spawnEnemies();
  playStageStart();
}

function createExplosion(x: number, y: number, colors: string[]): void {
  const particles: { dx: number; dy: number; color: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
    const speed = 0.5 + Math.random() * 1;
    particles.push({
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  explosions.push({ x, y, timer: 30, maxTimer: 30, particles });
}

function generateDivePath(enemy: Enemy): Vec2[] {
  const startX = enemy.x + ENEMY_WIDTH / 2;
  const startY = enemy.y + ENEMY_HEIGHT / 2;
  const targetX = playerX + PLAYER_WIDTH / 2;
  const path: Vec2[] = [];

  // Swooping curve down toward the player, then off-screen
  const curveDir = startX < CANVAS_WIDTH / 2 ? 1 : -1;
  const midX = startX + curveDir * 80;
  const midY = startY + 120;
  const steps = 80;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier: start -> mid -> target bottom
    const endX = targetX + (Math.random() - 0.5) * 60;
    const endY = CANVAS_HEIGHT + 40;
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
    path.push({ x: x - ENEMY_WIDTH / 2, y: y - ENEMY_HEIGHT / 2 });
  }

  return path;
}

// --- Update functions ---

function updateStars(): void {
  for (const s of stars) {
    s.y += s.speed;
    if (s.y > CANVAS_HEIGHT) {
      s.y = 0;
      s.x = Math.random() * CANVAS_WIDTH;
    }
  }
}

function updatePlayer(): void {
  if (!playerVisible) return;

  if (isKeyDown('ArrowLeft') || isKeyDown('a') || isKeyDown('A')) {
    playerX -= PLAYER_SPEED;
  }
  if (isKeyDown('ArrowRight') || isKeyDown('d') || isKeyDown('D')) {
    playerX += PLAYER_SPEED;
  }

  // Clamp position
  playerX = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, playerX));

  // Fire
  const now = performance.now();
  if ((isKeyDown(' ') || isKeyDown('z') || isKeyDown('Z')) && now - lastFireTime > PLAYER_FIRE_COOLDOWN) {
    lastFireTime = now;
    bullets.push({
      x: playerX + PLAYER_WIDTH / 2,
      y: playerY,
      dy: -PLAYER_BULLET_SPEED,
      isPlayer: true,
      alive: true,
    });
    playShoot();
  }
}

function updateEnemies(): void {
  // Formation sway
  formationX += FORMATION_SWAY_SPEED * formationDir;
  if (Math.abs(formationX) > FORMATION_SWAY_RANGE) {
    formationDir *= -1;
  }

  const diveChance = DIVE_CHANCE_PER_FRAME + stage * 0.0005;

  for (const e of enemies) {
    if (!e.alive) continue;

    e.animFrame++;

    if (e.diving) {
      // Follow dive path
      e.diveT += DIVE_SPEED;
      const idx = Math.floor(e.diveT);
      if (idx >= e.divePath.length) {
        // Dive complete: return to formation
        e.diving = false;
        e.diveT = 0;
        e.divePath = [];
      } else {
        e.x = e.divePath[idx].x;
        e.y = e.divePath[idx].y;

        // Shoot during dive
        if (Math.random() < DIVE_SHOOT_CHANCE) {
          bullets.push({
            x: e.x + ENEMY_WIDTH / 2,
            y: e.y + ENEMY_HEIGHT,
            dy: ENEMY_BULLET_SPEED,
            isPlayer: false,
            alive: true,
          });
        }
      }
    } else {
      // Smoothly move toward home position with formation sway
      const targetX = e.homeX + formationX;
      const targetY = e.homeY;
      e.x += (targetX - e.x) * 0.08;
      e.y += (targetY - e.y) * 0.08;

      // Maybe start a dive
      if (Math.random() < diveChance && Math.abs(e.y - e.homeY) < 5) {
        e.diving = true;
        e.diveT = 0;
        e.divePath = generateDivePath(e);
        playDive();
      }
    }
  }
}

function updateBullets(): void {
  for (const b of bullets) {
    if (!b.alive) continue;
    b.y += b.dy;
    if (b.y < -20 || b.y > CANVAS_HEIGHT + 20) {
      b.alive = false;
    }
  }
  // Clean up dead bullets
  bullets = bullets.filter((b) => b.alive);
}

function updateExplosions(): void {
  for (const exp of explosions) {
    exp.timer--;
  }
  explosions = explosions.filter((exp) => exp.timer > 0);
}

function checkCollisions(): void {
  // Player bullets vs enemies
  for (const b of bullets) {
    if (!b.alive || !b.isPlayer) continue;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (
        b.x > e.x && b.x < e.x + ENEMY_WIDTH &&
        b.y > e.y && b.y < e.y + ENEMY_HEIGHT
      ) {
        b.alive = false;
        e.alive = false;

        // Score
        switch (e.type) {
          case EnemyType.Bee:
            score += e.diving ? SCORE_BEE * 2 : SCORE_BEE;
            break;
          case EnemyType.Butterfly:
            score += e.diving ? SCORE_BUTTERFLY * 2 : SCORE_BUTTERFLY;
            break;
          case EnemyType.Boss:
            score += e.diving ? SCORE_BOSS * 2 : SCORE_BOSS;
            break;
        }

        // Explosion
        const colors = e.type === EnemyType.Bee
          ? ['#ffdd00', '#ff8800', '#ffffff']
          : e.type === EnemyType.Butterfly
            ? ['#ff44aa', '#ff88cc', '#ffffff']
            : ['#44ff44', '#88ff88', '#ffffff'];
        createExplosion(e.x + ENEMY_WIDTH / 2, e.y + ENEMY_HEIGHT / 2, colors);
        playEnemyHit();
        break;
      }
    }
  }

  // Enemy bullets vs player
  if (playerVisible) {
    for (const b of bullets) {
      if (!b.alive || b.isPlayer) continue;
      if (
        b.x > playerX && b.x < playerX + PLAYER_WIDTH &&
        b.y > playerY && b.y < playerY + PLAYER_HEIGHT
      ) {
        b.alive = false;
        killPlayer();
        return;
      }
    }

    // Enemy bodies vs player (during dives)
    for (const e of enemies) {
      if (!e.alive || !e.diving) continue;
      if (
        playerX < e.x + ENEMY_WIDTH &&
        playerX + PLAYER_WIDTH > e.x &&
        playerY < e.y + ENEMY_HEIGHT &&
        playerY + PLAYER_HEIGHT > e.y
      ) {
        e.alive = false;
        createExplosion(e.x + ENEMY_WIDTH / 2, e.y + ENEMY_HEIGHT / 2, ['#ff8800', '#ffcc00', '#ffffff']);
        killPlayer();
        return;
      }
    }
  }
}

function killPlayer(): void {
  playerVisible = false;
  createExplosion(playerX + PLAYER_WIDTH / 2, playerY + PLAYER_HEIGHT / 2, ['#00ccff', '#88eeff', '#ffffff', '#ff8800']);
  playPlayerHit();
  lives--;
  if (lives <= 0) {
    state = GameState.GameOver;
    gameOverTimer = 60;
    if (score > highScore) {
      highScore = score;
    }
  } else {
    state = GameState.Dying;
    dyingTimer = 90;
  }
}

function checkStageComplete(): boolean {
  return enemies.every((e) => !e.alive);
}

// --- Main loop ---

let lastTime = 0;

function gameLoop(timestamp: number): void {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  updateStars();
  clearScreen();
  renderStars(stars);

  switch (state) {
    case GameState.Title:
      renderTitleScreen();
      if (isKeyPressed('Enter')) {
        startNewGame();
      }
      break;

    case GameState.StageIntro:
      renderPlayer(playerX, playerY, true);
      renderEnemies(enemies);
      renderHUD(score, lives, stage, highScore);
      renderStageIntro(stage);

      // Move enemies toward formation during intro
      for (const e of enemies) {
        if (!e.alive) continue;
        const targetX = e.homeX + formationX;
        const targetY = e.homeY;
        e.x += (targetX - e.x) * 0.06;
        e.y += (targetY - e.y) * 0.06;
        e.animFrame++;
      }

      stageIntroTimer--;
      if (stageIntroTimer <= 0) {
        state = GameState.Playing;
      }
      break;

    case GameState.Playing:
      if (isKeyPressed('p') || isKeyPressed('P')) {
        paused = !paused;
      }

      if (!paused) {
        updatePlayer();
        updateEnemies();
        updateBullets();
        updateExplosions();
        checkCollisions();

        if (state === GameState.Playing && checkStageComplete()) {
          stage++;
          startStage();
        }
      }

      renderPlayer(playerX, playerY, playerVisible);
      renderEnemies(enemies);
      renderBullets(bullets);
      renderExplosions(explosions);
      renderHUD(score, lives, stage, highScore);

      if (paused) {
        renderPaused();
      }
      break;

    case GameState.Dying:
      updateBullets();
      updateExplosions();
      updateEnemies();

      renderEnemies(enemies);
      renderBullets(bullets);
      renderExplosions(explosions);
      renderHUD(score, lives, stage, highScore);

      dyingTimer--;
      if (dyingTimer <= 0) {
        resetPlayer();
        bullets = [];
        // Reset diving enemies
        for (const e of enemies) {
          if (e.alive) {
            e.diving = false;
            e.divePath = [];
            e.diveT = 0;
          }
        }
        state = GameState.Playing;
      }
      break;

    case GameState.GameOver:
      updateExplosions();
      renderExplosions(explosions);
      renderHUD(score, lives, stage, highScore);

      if (gameOverTimer > 0) {
        gameOverTimer--;
      }
      renderGameOver(score, highScore);

      if (gameOverTimer <= 0 && isKeyPressed('Enter')) {
        state = GameState.Title;
      }
      break;
  }

  clearPressed();
  requestAnimationFrame(gameLoop);
}

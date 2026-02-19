// ── Main game logic ──

import { GAME_W, GAME_H, GameState, rectsOverlap } from "./types";
import { isHeld, wasPressed, clearFrame } from "./input";
import { clear, getCtx } from "./renderer";
import { createStarfield, updateAndDrawStars, Star } from "./sprites";
import { shootSound, enemyShootSound, explosionSound, playerDeathSound, stageStartSound } from "./sound";
import {
  Player, createPlayer, drawPlayer, playerRect,
  Bullet, createBullet, updateBullet, drawBullet, bulletRect,
  Explosion, createExplosion, updateExplosion, drawExplosion,
  Enemy, EnemyState, EnemyType, updateEnemy, drawEnemy, enemyRect,
  scoreForEnemy, generateDivePath,
} from "./entities";
import { StageData, buildStage, getFormationOffsetX } from "./formation";

// ── Game state ──

let state: GameState = GameState.Title;
let player: Player;
let bullets: Bullet[];
let explosions: Explosion[];
let enemies: Enemy[];
let stageData: StageData | null;
let score: number;
let highScore: number;
let stage: number;
let stageTimer: number;
let gameTime: number;
let diveTimer: number;
let stageIntroTimer: number;
let maxPlayerBullets: number;
let stars: Star[];

export function initGame() {
  highScore = parseInt(localStorage.getItem("galaga_hi") || "0", 10) || 0;
  stars = createStarfield(120, GAME_W, GAME_H);
  resetGame();
}

function resetGame() {
  player = createPlayer();
  bullets = [];
  explosions = [];
  enemies = [];
  stageData = null;
  score = 0;
  stage = 0;
  stageTimer = 0;
  gameTime = 0;
  diveTimer = 0;
  stageIntroTimer = 0;
  maxPlayerBullets = 2;
}

function startStage() {
  stage++;
  stageData = buildStage(stage);
  enemies = stageData.enemies;
  bullets = [];
  stageIntroTimer = 2.0;
  state = GameState.StageIntro;
  stageStartSound();
}

// ── Update ──

export function update(dt: number) {
  const ctx = getCtx();

  // Cap dt to avoid huge jumps
  dt = Math.min(dt, 1 / 20);

  switch (state) {
    case GameState.Title:
      updateTitle(ctx, dt);
      break;
    case GameState.StageIntro:
      updateStageIntro(ctx, dt);
      break;
    case GameState.Playing:
      updatePlaying(ctx, dt);
      break;
    case GameState.GameOver:
      updateGameOver(ctx, dt);
      break;
  }

  clearFrame();
}

// ── Title screen ──

function updateTitle(ctx: CanvasRenderingContext2D, dt: number) {
  clear();
  gameTime += dt;
  updateAndDrawStars(ctx, stars, dt, GAME_H);

  // Title
  ctx.textAlign = "center";
  ctx.fillStyle = "#f55";
  ctx.font = "bold 48px monospace";
  ctx.fillText("GALAGA", GAME_W / 2, 180);

  ctx.fillStyle = "#5cf";
  ctx.font = "16px monospace";
  ctx.fillText("CLONE", GAME_W / 2, 210);

  // Blinking text
  if (Math.floor(gameTime * 2) % 2 === 0) {
    ctx.fillStyle = "#fff";
    ctx.font = "18px monospace";
    ctx.fillText("PRESS ENTER OR SPACE TO START", GAME_W / 2, 380);
  }

  ctx.fillStyle = "#888";
  ctx.font = "14px monospace";
  ctx.fillText("ARROW KEYS TO MOVE", GAME_W / 2, 440);
  ctx.fillText("SPACE TO SHOOT", GAME_W / 2, 460);

  if (highScore > 0) {
    ctx.fillStyle = "#ff0";
    ctx.font = "16px monospace";
    ctx.fillText(`HIGH SCORE: ${highScore}`, GAME_W / 2, 520);
  }

  if (wasPressed("Enter") || wasPressed(" ")) {
    resetGame();
    startStage();
  }
}

// ── Stage intro ──

function updateStageIntro(ctx: CanvasRenderingContext2D, dt: number) {
  clear();
  gameTime += dt;
  updateAndDrawStars(ctx, stars, dt, GAME_H);

  stageIntroTimer -= dt;

  ctx.textAlign = "center";
  ctx.fillStyle = "#5cf";
  ctx.font = "bold 32px monospace";
  ctx.fillText(`STAGE ${stage}`, GAME_W / 2, GAME_H / 2 - 20);

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText("GET READY", GAME_W / 2, GAME_H / 2 + 20);

  drawHUD(ctx);

  if (stageIntroTimer <= 0) {
    state = GameState.Playing;
    stageTimer = 0;
    diveTimer = 2.0;
  }
}

// ── Main gameplay ──

function updatePlaying(ctx: CanvasRenderingContext2D, dt: number) {
  clear();
  gameTime += dt;
  stageTimer += dt;
  updateAndDrawStars(ctx, stars, dt, GAME_H);

  // — Player —
  updatePlayerMovement(dt);
  updatePlayerShooting();
  handlePlayerRespawn(dt);

  // — Enemies —
  const formOff = getFormationOffsetX(gameTime);
  for (const e of enemies) {
    updateEnemy(e, dt, formOff);
  }

  // Enemy dive logic
  updateEnemyDiving(dt);

  // Enemy shooting
  updateEnemyShooting(dt);

  // — Bullets —
  for (const b of bullets) {
    updateBullet(b, dt);
  }

  // — Collisions —
  checkCollisions();

  // — Explosions —
  explosions = explosions.filter(e => updateExplosion(e, dt));

  // — Drawing (order matters) —
  for (const e of enemies) drawEnemy(ctx, e);
  for (const b of bullets) drawBullet(ctx, b);
  drawPlayer(ctx, player);
  for (const e of explosions) drawExplosion(ctx, e);

  // Cleanup dead
  bullets = bullets.filter(b => b.alive);
  enemies = enemies.filter(e => e.alive);

  drawHUD(ctx);

  // Check stage complete
  if (enemies.length === 0 && stageTimer > 2) {
    startStage();
  }

  // Check game over
  if (player.lives <= 0 && player.respawnTimer <= 0) {
    state = GameState.GameOver;
    gameTime = 0;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("galaga_hi", String(highScore));
    }
  }
}

function updatePlayerMovement(dt: number) {
  if (!player.alive) return;

  if (isHeld("ArrowLeft") || isHeld("a")) {
    player.x -= player.speed * dt;
  }
  if (isHeld("ArrowRight") || isHeld("d")) {
    player.x += player.speed * dt;
  }

  // Clamp
  player.x = Math.max(player.w / 2, Math.min(GAME_W - player.w / 2, player.x));
}

function updatePlayerShooting() {
  if (!player.alive) return;

  const playerBulletCount = bullets.filter(b => !b.isEnemy).length;
  if ((wasPressed(" ") || wasPressed("ArrowUp")) && playerBulletCount < maxPlayerBullets) {
    bullets.push(createBullet(player.x, player.y - player.h / 2, -500));
    shootSound();
  }
}

function handlePlayerRespawn(dt: number) {
  if (player.invincibleTimer > 0) {
    player.invincibleTimer -= dt;
  }

  if (!player.alive) {
    player.respawnTimer -= dt;
    if (player.respawnTimer <= 0 && player.lives > 0) {
      player.alive = true;
      player.x = GAME_W / 2;
      player.y = GAME_H - 60;
      player.invincibleTimer = 2.0;
    }
  }
}

function updateEnemyDiving(dt: number) {
  diveTimer -= dt;
  if (diveTimer <= 0) {
    // Pick a random in-formation enemy to dive
    const inFormation = enemies.filter(e => e.alive && e.state === EnemyState.InFormation);
    if (inFormation.length > 0) {
      // Higher stages = more simultaneous divers
      const numDivers = Math.min(1 + Math.floor(stage / 2), 3);
      for (let i = 0; i < numDivers && inFormation.length > 0; i++) {
        const idx = Math.floor(Math.random() * inFormation.length);
        const diver = inFormation.splice(idx, 1)[0];
        diver.state = EnemyState.Diving;
        diver.divePath = generateDivePath(diver, player.x);
        diver.diveT = 0;
      }
    }
    diveTimer = Math.max(0.8, 2.5 - stage * 0.15) + Math.random() * 1.5;
  }
}

function updateEnemyShooting(dt: number) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.shootTimer -= dt;
    if (e.shootTimer <= 0 && e.state === EnemyState.Diving) {
      // Fire toward player
      bullets.push(createBullet(e.x, e.y + e.h / 2, 300));
      enemyShootSound();
      e.shootTimer = 1.5 + Math.random() * 2;
    } else if (e.shootTimer <= 0 && e.state === EnemyState.InFormation) {
      // Occasional formation shot (rare)
      if (Math.random() < 0.15) {
        bullets.push(createBullet(e.x, e.y + e.h / 2, 250));
        enemyShootSound();
      }
      e.shootTimer = 3 + Math.random() * 4;
    }
  }
}

function checkCollisions() {
  const pRect = playerRect(player);

  for (const b of bullets) {
    if (!b.alive) continue;
    const bRect = bulletRect(b);

    if (!b.isEnemy) {
      // Player bullet hits enemy
      for (const e of enemies) {
        if (!e.alive) continue;
        const eRect = enemyRect(e);
        if (rectsOverlap(bRect, eRect)) {
          b.alive = false;
          e.hp--;
          if (e.hp <= 0) {
            e.alive = false;
            score += scoreForEnemy(e.type, e.state === EnemyState.Diving);
            explosions.push(createExplosion(e.x, e.y));
            explosionSound();
          }
          break;
        }
      }
    } else {
      // Enemy bullet hits player
      if (player.alive && player.invincibleTimer <= 0 && rectsOverlap(bRect, pRect)) {
        b.alive = false;
        killPlayer();
      }
    }
  }

  // Enemy body collision with player
  if (player.alive && player.invincibleTimer <= 0) {
    for (const e of enemies) {
      if (!e.alive) continue;
      if (rectsOverlap(enemyRect(e), pRect)) {
        e.alive = false;
        explosions.push(createExplosion(e.x, e.y));
        explosionSound();
        killPlayer();
        break;
      }
    }
  }
}

function killPlayer() {
  player.alive = false;
  player.lives--;
  player.respawnTimer = 1.5;
  explosions.push(createExplosion(player.x, player.y));
  playerDeathSound();
}

// ── Game Over screen ──

function updateGameOver(ctx: CanvasRenderingContext2D, dt: number) {
  clear();
  gameTime += dt;
  updateAndDrawStars(ctx, stars, dt, GAME_H);

  // Draw remaining enemies fading
  for (const e of enemies) drawEnemy(ctx, e);
  for (const ex of explosions) drawExplosion(ctx, ex);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f55";
  ctx.font = "bold 40px monospace";
  ctx.fillText("GAME OVER", GAME_W / 2, GAME_H / 2 - 40);

  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`SCORE: ${score}`, GAME_W / 2, GAME_H / 2 + 10);

  if (score >= highScore && highScore > 0) {
    ctx.fillStyle = "#ff0";
    ctx.font = "18px monospace";
    ctx.fillText("NEW HIGH SCORE!", GAME_W / 2, GAME_H / 2 + 40);
  }

  if (gameTime > 1.5) {
    if (Math.floor(gameTime * 2) % 2 === 0) {
      ctx.fillStyle = "#fff";
      ctx.font = "16px monospace";
      ctx.fillText("PRESS ENTER OR SPACE TO CONTINUE", GAME_W / 2, GAME_H / 2 + 90);
    }
    if (wasPressed("Enter") || wasPressed(" ")) {
      state = GameState.Title;
      gameTime = 0;
    }
  }

  drawHUD(ctx);
}

// ── HUD ──

function drawHUD(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "14px monospace";
  ctx.fillText(`SCORE`, 10, 22);
  ctx.fillStyle = "#ff0";
  ctx.font = "18px monospace";
  ctx.fillText(`${score}`, 10, 42);

  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.font = "14px monospace";
  ctx.fillText(`HIGH`, GAME_W - 10, 22);
  ctx.fillStyle = "#ff0";
  ctx.font = "18px monospace";
  ctx.fillText(`${highScore}`, GAME_W - 10, 42);

  // Lives
  ctx.textAlign = "left";
  ctx.fillStyle = "#5cf";
  ctx.font = "14px monospace";
  const livesToShow = state === GameState.Playing ? Math.max(0, player.lives - 1) : player.lives;
  for (let i = 0; i < livesToShow; i++) {
    // Simple triangle ships for lives display
    ctx.beginPath();
    ctx.moveTo(15 + i * 22, GAME_H - 14);
    ctx.lineTo(15 + i * 22 + 8, GAME_H - 14);
    ctx.lineTo(15 + i * 22 + 4, GAME_H - 26);
    ctx.closePath();
    ctx.fillStyle = "#5cf";
    ctx.fill();
  }

  // Stage indicator
  ctx.textAlign = "center";
  ctx.fillStyle = "#888";
  ctx.font = "12px monospace";
  if (stage > 0) {
    ctx.fillText(`STAGE ${stage}`, GAME_W / 2, GAME_H - 12);
  }
}

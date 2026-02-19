// ── Game entities ──

import { GAME_W, GAME_H, Rect } from "./types";
import { getPlayerSprite, getBeeSprite, getButterflySprite, getBossSprite } from "./sprites";

// ── Player ──

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  lives: number;
  alive: boolean;
  respawnTimer: number;
  invincibleTimer: number;
}

export function createPlayer(): Player {
  return {
    x: GAME_W / 2,
    y: GAME_H - 60,
    w: 45,
    h: 45,
    speed: 260,
    lives: 3,
    alive: true,
    respawnTimer: 0,
    invincibleTimer: 0,
  };
}

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  if (!p.alive) return;
  // Blink during invincibility
  if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer * 10) % 2 === 0) return;
  const sprite = getPlayerSprite();
  ctx.drawImage(sprite, Math.floor(p.x - p.w / 2), Math.floor(p.y - p.h / 2), p.w, p.h);
}

export function playerRect(p: Player): Rect {
  return { x: p.x - p.w / 2 + 6, y: p.y - p.h / 2 + 4, w: p.w - 12, h: p.h - 8 };
}

// ── Bullets ──

export interface Bullet {
  x: number;
  y: number;
  vy: number;
  alive: boolean;
  isEnemy: boolean;
}

export function createBullet(x: number, y: number, vy: number, isEnemy = false): Bullet {
  return { x, y, vy, alive: true, isEnemy };
}

export function updateBullet(b: Bullet, dt: number) {
  b.y += b.vy * dt;
  if (b.y < -10 || b.y > GAME_H + 10) b.alive = false;
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  if (!b.alive) return;
  if (b.isEnemy) {
    ctx.fillStyle = "#f88";
    ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
  } else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(b.x - 1.5, b.y - 6, 3, 12);
    ctx.fillStyle = "#8ef";
    ctx.fillRect(b.x - 0.5, b.y - 6, 1, 12);
  }
}

export function bulletRect(b: Bullet): Rect {
  if (b.isEnemy) return { x: b.x - 2, y: b.y - 5, w: 4, h: 10 };
  return { x: b.x - 1.5, y: b.y - 6, w: 3, h: 12 };
}

// ── Explosions ──

export interface Explosion {
  x: number;
  y: number;
  timer: number;
  maxTime: number;
}

export function createExplosion(x: number, y: number): Explosion {
  return { x, y, timer: 0, maxTime: 0.35 };
}

export function updateExplosion(e: Explosion, dt: number): boolean {
  e.timer += dt;
  return e.timer < e.maxTime;
}

export function drawExplosion(ctx: CanvasRenderingContext2D, e: Explosion) {
  const t = e.timer / e.maxTime;
  const r = 8 + t * 24;
  const alpha = 1 - t;

  // Outer ring
  ctx.beginPath();
  ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 160, 50, ${alpha * 0.5})`;
  ctx.fill();

  // Inner flash
  ctx.beginPath();
  ctx.arc(e.x, e.y, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
  ctx.fill();

  // Particles
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + t * 2;
    const dist = r * (0.6 + t * 0.5);
    const px = e.x + Math.cos(angle) * dist;
    const py = e.y + Math.sin(angle) * dist;
    ctx.fillStyle = `rgba(255, 100, 30, ${alpha})`;
    ctx.fillRect(px - 2, py - 2, 4, 4);
  }
}

// ── Enemies ──

export const enum EnemyType {
  Bee,
  Butterfly,
  Boss,
}

export const enum EnemyState {
  Entering,   // Flying into formation
  InFormation, // Sitting in formation grid
  Diving,     // Dive-bombing the player
  Dead,
}

export interface Enemy {
  type: EnemyType;
  state: EnemyState;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  // Formation position
  formX: number;
  formY: number;
  // Entry path
  entryPath: Vec2Path | null;
  entryT: number;
  // Dive path
  divePath: Vec2Path | null;
  diveT: number;
  diveSpeed: number;
  // Shooting timer
  shootTimer: number;
  alive: boolean;
}

interface Vec2Path {
  points: { x: number; y: number }[];
}

function lerpPath(path: Vec2Path, t: number): { x: number; y: number } {
  const n = path.points.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const frac = t * n - i;
  const a = path.points[i];
  const b = path.points[Math.min(i + 1, n)];
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
}

export function createEnemy(type: EnemyType, formX: number, formY: number, entryPath: Vec2Path | null): Enemy {
  const startPos = entryPath ? entryPath.points[0] : { x: formX, y: formY };
  const size = type === EnemyType.Boss ? 45 : 39;
  return {
    type,
    state: entryPath ? EnemyState.Entering : EnemyState.InFormation,
    x: startPos.x,
    y: startPos.y,
    w: size,
    h: size,
    hp: type === EnemyType.Boss ? 2 : 1,
    formX,
    formY,
    entryPath,
    entryT: 0,
    divePath: null,
    diveT: 0,
    diveSpeed: 1.0,
    shootTimer: 2 + Math.random() * 5,
    alive: true,
  };
}

export function enemyRect(e: Enemy): Rect {
  return { x: e.x - e.w / 2 + 3, y: e.y - e.h / 2 + 3, w: e.w - 6, h: e.h - 6 };
}

export function updateEnemy(e: Enemy, dt: number, formationOffsetX: number) {
  if (!e.alive) return;

  switch (e.state) {
    case EnemyState.Entering:
      if (e.entryPath) {
        e.entryT += dt * 0.7;
        if (e.entryT >= 1) {
          e.state = EnemyState.InFormation;
          e.entryPath = null;
        } else {
          const pos = lerpPath(e.entryPath, Math.min(e.entryT, 1));
          e.x = pos.x;
          e.y = pos.y;
        }
      }
      break;

    case EnemyState.InFormation: {
      // Smoothly move toward formation position + global offset
      const targetX = e.formX + formationOffsetX;
      const targetY = e.formY;
      e.x += (targetX - e.x) * Math.min(dt * 5, 1);
      e.y += (targetY - e.y) * Math.min(dt * 5, 1);
      break;
    }

    case EnemyState.Diving:
      if (e.divePath) {
        e.diveT += dt * e.diveSpeed * 0.5;
        if (e.diveT >= 1) {
          // Return to formation
          e.state = EnemyState.InFormation;
          e.divePath = null;
          e.shootTimer = 3 + Math.random() * 4;
        } else {
          const pos = lerpPath(e.divePath, Math.min(e.diveT, 1));
          e.x = pos.x;
          e.y = pos.y;
        }
      }
      break;
  }
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
  if (!e.alive) return;
  let sprite: HTMLCanvasElement;
  switch (e.type) {
    case EnemyType.Bee:
      sprite = getBeeSprite();
      break;
    case EnemyType.Butterfly:
      sprite = getButterflySprite();
      break;
    case EnemyType.Boss:
      sprite = getBossSprite();
      break;
  }
  ctx.drawImage(sprite, Math.floor(e.x - e.w / 2), Math.floor(e.y - e.h / 2), e.w, e.h);

  // Show boss damage: flash when HP == 1
  if (e.type === EnemyType.Boss && e.hp === 1) {
    ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
    ctx.fillStyle = "#f00";
    ctx.fillRect(Math.floor(e.x - e.w / 2), Math.floor(e.y - e.h / 2), e.w, e.h);
    ctx.globalAlpha = 1;
  }
}

// ── Score values ──

export function scoreForEnemy(type: EnemyType, diving: boolean): number {
  switch (type) {
    case EnemyType.Bee: return diving ? 100 : 50;
    case EnemyType.Butterfly: return diving ? 160 : 80;
    case EnemyType.Boss: return diving ? 400 : 150;
  }
}

// ── Dive path generation ──

export function generateDivePath(enemy: Enemy, playerX: number): Vec2Path {
  const startX = enemy.x;
  const startY = enemy.y;

  // Dive down toward the player, then loop back up off-screen and return to formation
  const midY = GAME_H * 0.55;
  const bottomY = GAME_H + 40;
  const loopSide = (startX > GAME_W / 2) ? -1 : 1;

  const points = [
    { x: startX, y: startY },
    { x: startX + loopSide * 40, y: startY + 60 },
    { x: playerX + loopSide * 30, y: midY },
    { x: playerX, y: midY + 80 },
    { x: playerX - loopSide * 60, y: bottomY },
    // Loop around
    { x: playerX - loopSide * 120, y: bottomY - 100 },
    { x: enemy.formX - loopSide * 40, y: -40 },
    { x: enemy.formX, y: -20 },
    { x: enemy.formX, y: enemy.formY },
  ];

  return { points };
}

// ── Entry path generation ──

export function generateEntryPath(formX: number, formY: number, side: "left" | "right" | "top"): Vec2Path {
  let points: { x: number; y: number }[];

  switch (side) {
    case "left":
      points = [
        { x: -30, y: GAME_H * 0.3 },
        { x: GAME_W * 0.2, y: GAME_H * 0.15 },
        { x: GAME_W * 0.5, y: GAME_H * 0.1 },
        { x: formX, y: formY },
      ];
      break;
    case "right":
      points = [
        { x: GAME_W + 30, y: GAME_H * 0.3 },
        { x: GAME_W * 0.8, y: GAME_H * 0.15 },
        { x: GAME_W * 0.5, y: GAME_H * 0.1 },
        { x: formX, y: formY },
      ];
      break;
    case "top":
    default:
      points = [
        { x: formX + (Math.random() - 0.5) * 200, y: -40 },
        { x: formX + (Math.random() - 0.5) * 100, y: GAME_H * 0.15 },
        { x: formX, y: formY },
      ];
      break;
  }

  return { points };
}

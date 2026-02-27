import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  PLAYER_WIDTH, PLAYER_HEIGHT,
  ENEMY_WIDTH, ENEMY_HEIGHT,
  BULLET_WIDTH, BULLET_HEIGHT,
  COLOR_PLAYER_BULLET, COLOR_ENEMY_BULLET,
  COLOR_HUD,
  GameState,
  type Star,
  type Bullet,
  type Enemy,
  type Explosion,
} from './types';
import { drawPlayer, drawEnemy, drawExplosion } from './sprites';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export function initRenderer(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

export function clearScreen(): void {
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function renderStars(stars: Star[]): void {
  for (const s of stars) {
    ctx.globalAlpha = s.brightness;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(s.x, s.y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

export function renderPlayer(x: number, y: number, visible: boolean): void {
  if (!visible) return;
  drawPlayer(ctx, x, y);
}

export function renderEnemies(enemies: Enemy[]): void {
  for (const e of enemies) {
    if (!e.alive) continue;
    drawEnemy(ctx, e.x, e.y, e.type, e.animFrame);
  }
}

export function renderBullets(bullets: Bullet[]): void {
  for (const b of bullets) {
    if (!b.alive) continue;
    ctx.fillStyle = b.isPlayer ? COLOR_PLAYER_BULLET : COLOR_ENEMY_BULLET;
    if (b.isPlayer) {
      // Player bullets: bright rectangle with glow
      ctx.shadowColor = COLOR_PLAYER_BULLET;
      ctx.shadowBlur = 6;
      ctx.fillRect(b.x - BULLET_WIDTH / 2, b.y - BULLET_HEIGHT / 2, BULLET_WIDTH, BULLET_HEIGHT);
      ctx.shadowBlur = 0;
    } else {
      // Enemy bullets: round-ish
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function renderExplosions(explosions: Explosion[]): void {
  for (const exp of explosions) {
    const progress = 1 - exp.timer / exp.maxTimer;
    drawExplosion(ctx, exp.x, exp.y, progress, exp.particles);
  }
}

export function renderHUD(score: number, lives: number, stage: number, highScore: number): void {
  ctx.fillStyle = COLOR_HUD;
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 20);
  ctx.textAlign = 'right';
  ctx.fillText(`HI: ${highScore}`, CANVAS_WIDTH - 10, 20);
  ctx.textAlign = 'center';
  ctx.fillText(`STAGE ${stage}`, CANVAS_WIDTH / 2, 20);

  // Draw lives as small ships
  for (let i = 0; i < lives - 1; i++) {
    const lx = 14 + i * 24;
    const ly = CANVAS_HEIGHT - 24;
    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + 6, ly + 10);
    ctx.lineTo(lx + 10, ly + 14);
    ctx.lineTo(lx - 4, ly + 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx - 6, ly + 10);
    ctx.lineTo(lx - 10, ly + 14);
    ctx.lineTo(lx + 4, ly + 8);
    ctx.closePath();
    ctx.fill();
  }
}

export function renderTitleScreen(): void {
  // Title
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GALAGA', CANVAS_WIDTH / 2, 200);

  // Subtitle
  ctx.fillStyle = '#00ccff';
  ctx.font = '16px monospace';
  ctx.fillText('A CLASSIC SPACE SHOOTER', CANVAS_WIDTH / 2, 240);

  // Instructions
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px monospace';
  ctx.fillText('ARROW KEYS or A/D to move', CANVAS_WIDTH / 2, 340);
  ctx.fillText('SPACE or Z to fire', CANVAS_WIDTH / 2, 365);
  ctx.fillText('P to pause', CANVAS_WIDTH / 2, 390);

  // Blink prompt
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#ffff00';
    ctx.font = '18px monospace';
    ctx.fillText('PRESS ENTER TO START', CANVAS_WIDTH / 2, 460);
  }

  // Credits
  ctx.fillStyle = '#666666';
  ctx.font = '11px monospace';
  ctx.fillText('claude-opus-4-6 / baseline', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
}

export function renderStageIntro(stage: number): void {
  ctx.fillStyle = '#00ccff';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`STAGE ${stage}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

  ctx.fillStyle = '#ffdd00';
  ctx.font = '16px monospace';
  ctx.fillText('GET READY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}

export function renderGameOver(score: number, highScore: number): void {
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.fillText(`FINAL SCORE: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

  if (score >= highScore && score > 0) {
    ctx.fillStyle = '#ffdd00';
    ctx.font = '16px monospace';
    ctx.fillText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
  }

  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText('PRESS ENTER TO CONTINUE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
  }
}

export function renderPaused(): void {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.font = '14px monospace';
  ctx.fillText('Press P to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
}

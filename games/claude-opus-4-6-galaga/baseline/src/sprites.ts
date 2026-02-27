import {
  PLAYER_WIDTH, PLAYER_HEIGHT,
  ENEMY_WIDTH, ENEMY_HEIGHT,
  COLOR_PLAYER, COLOR_BEE, COLOR_BUTTERFLY, COLOR_BOSS,
  EnemyType,
} from './types';

// Draw all sprites procedurally on the canvas (no external assets)

export function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + PLAYER_WIDTH / 2;
  const cy = y + PLAYER_HEIGHT / 2;

  // Main body
  ctx.fillStyle = COLOR_PLAYER;
  ctx.beginPath();
  ctx.moveTo(cx, y + 2);           // nose
  ctx.lineTo(cx + 12, cy + 4);     // right wing top
  ctx.lineTo(cx + 14, y + PLAYER_HEIGHT - 2); // right wing bottom
  ctx.lineTo(cx + 4, cy + 6);
  ctx.lineTo(cx + 4, y + PLAYER_HEIGHT);
  ctx.lineTo(cx - 4, y + PLAYER_HEIGHT);
  ctx.lineTo(cx - 4, cy + 6);
  ctx.lineTo(cx - 14, y + PLAYER_HEIGHT - 2);
  ctx.lineTo(cx - 12, cy + 4);
  ctx.closePath();
  ctx.fill();

  // Cockpit highlight
  ctx.fillStyle = '#88eeff';
  ctx.beginPath();
  ctx.moveTo(cx, y + 6);
  ctx.lineTo(cx + 4, cy + 2);
  ctx.lineTo(cx - 4, cy + 2);
  ctx.closePath();
  ctx.fill();

  // Engine glow
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(cx - 3, y + PLAYER_HEIGHT - 2, 6, 3);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(cx - 1, y + PLAYER_HEIGHT - 1, 2, 2);
}

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: EnemyType,
  frame: number,
): void {
  const cx = x + ENEMY_WIDTH / 2;
  const cy = y + ENEMY_HEIGHT / 2;
  const wingFlap = Math.sin(frame * 0.3) * 3;

  switch (type) {
    case EnemyType.Bee:
      drawBee(ctx, cx, cy, wingFlap);
      break;
    case EnemyType.Butterfly:
      drawButterfly(ctx, cx, cy, wingFlap);
      break;
    case EnemyType.Boss:
      drawBoss(ctx, cx, cy, wingFlap);
      break;
  }
}

function drawBee(ctx: CanvasRenderingContext2D, cx: number, cy: number, wingFlap: number): void {
  // Body
  ctx.fillStyle = COLOR_BEE;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stripes
  ctx.fillStyle = '#886600';
  ctx.fillRect(cx - 5, cy - 3, 10, 3);
  ctx.fillRect(cx - 4, cy + 3, 8, 2);

  // Wings
  ctx.fillStyle = 'rgba(255,255,200,0.7)';
  ctx.beginPath();
  ctx.ellipse(cx - 8, cy - 2 + wingFlap, 5, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 8, cy - 2 + wingFlap, 5, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(cx - 3, cy - 8, 2, 2);
  ctx.fillRect(cx + 1, cy - 8, 2, 2);
}

function drawButterfly(ctx: CanvasRenderingContext2D, cx: number, cy: number, wingFlap: number): void {
  // Body
  ctx.fillStyle = COLOR_BUTTERFLY;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings
  const wScale = 1 + wingFlap * 0.05;
  ctx.fillStyle = COLOR_BUTTERFLY;
  ctx.beginPath();
  ctx.ellipse(cx - 9 * wScale, cy - 2, 7 * wScale, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 9 * wScale, cy - 2, 7 * wScale, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Wing patterns
  ctx.fillStyle = '#ff88cc';
  ctx.beginPath();
  ctx.ellipse(cx - 9 * wScale, cy - 2, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 9 * wScale, cy - 2, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 3, cy - 8, 2, 2);
  ctx.fillRect(cx + 1, cy - 8, 2, 2);
}

function drawBoss(ctx: CanvasRenderingContext2D, cx: number, cy: number, wingFlap: number): void {
  // Larger body
  ctx.fillStyle = COLOR_BOSS;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horns / antennae
  ctx.strokeStyle = COLOR_BOSS;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 10);
  ctx.lineTo(cx - 10, cy - 16 + wingFlap);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 5, cy - 10);
  ctx.lineTo(cx + 10, cy - 16 + wingFlap);
  ctx.stroke();

  // Horn tips
  ctx.fillStyle = '#88ff88';
  ctx.beginPath();
  ctx.arc(cx - 10, cy - 16 + wingFlap, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 10, cy - 16 + wingFlap, 2, 0, Math.PI * 2);
  ctx.fill();

  // Face detail
  ctx.fillStyle = '#004400';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3, cy - 4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.fillStyle = COLOR_BOSS;
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 3, 0, Math.PI);
  ctx.fill();
}

export function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  particles: { dx: number; dy: number; color: string }[],
): void {
  const alpha = 1 - progress;
  ctx.globalAlpha = alpha;
  for (const p of particles) {
    const px = x + p.dx * progress * 40;
    const py = y + p.dy * progress * 40;
    const size = (1 - progress) * 4 + 1;
    ctx.fillStyle = p.color;
    ctx.fillRect(px - size / 2, py - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

import { TILE, TILE_SIZE } from './constants.js';

// ─── Tile rendering ───────────────────────────────────────────────────────────

export function drawTile(ctx, tileType, screenX, screenY, animTick) {
  const S = TILE_SIZE;
  switch (tileType) {
    case TILE.GROUND:    drawGround(ctx, screenX, screenY, S); break;
    case TILE.BRICK:     drawBrick(ctx, screenX, screenY, S); break;
    case TILE.QUESTION:
    case TILE.QUESTION_MU: drawQuestion(ctx, screenX, screenY, S, animTick); break;
    case TILE.USED:      drawUsed(ctx, screenX, screenY, S); break;
    case TILE.PIPE_TL:   drawPipeTopLeft(ctx, screenX, screenY, S); break;
    case TILE.PIPE_TR:   drawPipeTopRight(ctx, screenX, screenY, S); break;
    case TILE.PIPE_BL:   drawPipeBodyLeft(ctx, screenX, screenY, S); break;
    case TILE.PIPE_BR:   drawPipeBodyRight(ctx, screenX, screenY, S); break;
    case TILE.SOLID:     drawSolid(ctx, screenX, screenY, S); break;
    case TILE.COIN:      drawCoinTile(ctx, screenX, screenY, S, animTick); break;
  }
}

function drawGround(ctx, x, y, S) {
  ctx.fillStyle = '#a05030';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#4ab740';
  ctx.fillRect(x, y, S, 6);
  ctx.fillStyle = '#c06030';
  ctx.fillRect(x, y + 6, S, 2);
  // Texture dots
  ctx.fillStyle = '#8b4020';
  ctx.fillRect(x + 4, y + 10, 4, 4);
  ctx.fillRect(x + 16, y + 18, 4, 4);
  ctx.fillRect(x + 8, y + 22, 4, 4);
  ctx.fillRect(x + 22, y + 12, 4, 4);
}

function drawBrick(ctx, x, y, S) {
  ctx.fillStyle = '#c84020';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#804010';
  // Horizontal mortar
  ctx.fillRect(x, y + 10, S, 2);
  ctx.fillRect(x, y + 22, S, 2);
  // Vertical mortar (offset pattern)
  ctx.fillRect(x + 8, y, 2, 10);
  ctx.fillRect(x + 8, y + 12, 2, 10);
  ctx.fillRect(x + 8, y + 24, 2, 8);
  ctx.fillRect(x + 24, y, 2, 10);
  ctx.fillRect(x + 16, y + 12, 2, 10);
  ctx.fillRect(x + 24, y + 24, 2, 8);
  // Highlight
  ctx.fillStyle = '#e05030';
  ctx.fillRect(x, y, 8, 3);
  ctx.fillRect(x + 10, y + 12, 13, 3);
}

function drawQuestion(ctx, x, y, S, tick) {
  const blink = Math.floor(tick / 20) % 2 === 0;
  ctx.fillStyle = blink ? '#e8a820' : '#f0c040';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#c08000';
  ctx.fillRect(x, y, S, 2);
  ctx.fillRect(x, y, 2, S);
  ctx.fillRect(x + S - 2, y, 2, S);
  ctx.fillRect(x, y + S - 2, S, 2);
  // '?' mark
  ctx.fillStyle = blink ? '#ffffff' : '#fff8c0';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x + S / 2, y + S / 2 + 1);
}

function drawUsed(ctx, x, y, S) {
  ctx.fillStyle = '#806040';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#604030';
  ctx.fillRect(x, y, S, 2);
  ctx.fillRect(x, y, 2, S);
  ctx.fillRect(x + S - 2, y, 2, S);
  ctx.fillRect(x, y + S - 2, S, 2);
}

function drawSolid(ctx, x, y, S) {
  ctx.fillStyle = '#887766';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#665544';
  ctx.fillRect(x, y, S, 2);
  ctx.fillRect(x, y, 2, S);
}

function drawPipeTopLeft(ctx, x, y, S) {
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(x, y, 6, S);
  ctx.fillRect(x, y, S, 4);
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(x + S - 2, y, 2, S);
}

function drawPipeTopRight(ctx, x, y, S) {
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(x, y, 2, S);
  ctx.fillRect(x, y, S, 4);
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(x + S - 6, y, 6, S);
}

function drawPipeBodyLeft(ctx, x, y, S) {
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(x, y, 6, S);
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(x + S - 2, y, 2, S);
}

function drawPipeBodyRight(ctx, x, y, S) {
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(x, y, 2, S);
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(x + S - 6, y, 6, S);
}

function drawCoinTile(ctx, x, y, S, tick) {
  const bob = Math.sin(tick * 0.15) * 3;
  drawCoin(ctx, x + S / 2, y + S / 2 + bob, 9);
}

// ─── Coin shape ───────────────────────────────────────────────────────────────

export function drawCoin(ctx, cx, cy, r) {
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff8a0';
  ctx.beginPath();
  ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Mario ───────────────────────────────────────────────────────────────────

export function drawMario(ctx, x, y, width, height, facing, form, animFrame, invincible) {
  if (invincible && Math.floor(invincible / 4) % 2 === 1) return; // blink

  ctx.save();
  // Flip for left-facing
  if (facing === -1) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, y);
  }

  if (form === 'big') {
    _drawBigMario(ctx, width, height, animFrame);
  } else {
    _drawSmallMario(ctx, width, height, animFrame);
  }
  ctx.restore();
}

function _drawSmallMario(ctx, w, h, frame) {
  // Hat
  ctx.fillStyle = '#c00000';
  ctx.fillRect(4, 0, w - 4, 6);
  ctx.fillRect(1, 4, w - 2, 4);
  // Face
  ctx.fillStyle = '#ffb090';
  ctx.fillRect(5, 8, w - 7, 7);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(8, 9, 2, 2);
  // Mustache
  ctx.fillStyle = '#6b3000';
  ctx.fillRect(5, 13, 5, 2);
  ctx.fillRect(12, 13, 6, 2);
  // Body (red shirt)
  ctx.fillStyle = '#c00000';
  ctx.fillRect(3, 15, w - 6, 8);
  // Overalls (blue)
  ctx.fillStyle = '#0050c0';
  ctx.fillRect(5, 20, w - 10, 5);
  // Walking legs
  if (frame === 1 || frame === 3) {
    ctx.fillStyle = '#0050c0';
    ctx.fillRect(3, 25, 7, 3);
    ctx.fillRect(w - 10, 25, 7, 3);
    ctx.fillStyle = '#5c2e00';
    ctx.fillRect(2, 23, 8, 5);
    ctx.fillRect(w - 10, 23, 8, 5);
  } else {
    ctx.fillStyle = '#5c2e00';
    ctx.fillRect(4, 22, 7, 6);
    ctx.fillRect(w - 11, 22, 7, 6);
  }
}

function _drawBigMario(ctx, w, h, frame) {
  // Hat
  ctx.fillStyle = '#c00000';
  ctx.fillRect(4, 0, w - 4, 7);
  ctx.fillRect(1, 5, w - 2, 5);
  // Face
  ctx.fillStyle = '#ffb090';
  ctx.fillRect(4, 10, w - 6, 10);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(7, 12, 3, 3);
  // Mustache
  ctx.fillStyle = '#6b3000';
  ctx.fillRect(5, 18, 6, 2);
  ctx.fillRect(13, 18, 6, 2);
  // Body (red shirt)
  ctx.fillStyle = '#c00000';
  ctx.fillRect(1, 20, w - 2, 12);
  // Overalls (blue)
  ctx.fillStyle = '#0050c0';
  ctx.fillRect(4, 28, w - 8, 10);
  // Buckles
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(5, 30, 3, 3);
  ctx.fillRect(w - 8, 30, 3, 3);
  // Walking legs
  if (frame === 1 || frame === 3) {
    ctx.fillStyle = '#0050c0';
    ctx.fillRect(2, 38, 9, 4);
    ctx.fillRect(w - 11, 38, 9, 4);
    ctx.fillStyle = '#5c2e00';
    ctx.fillRect(1, 36, 10, 8);
    ctx.fillRect(w - 11, 36, 10, 8);
  } else {
    ctx.fillStyle = '#5c2e00';
    ctx.fillRect(3, 36, 9, 8);
    ctx.fillRect(w - 12, 36, 9, 8);
  }
}

// ─── Goomba ───────────────────────────────────────────────────────────────────

export function drawGoomba(ctx, x, y, width, height, squished) {
  ctx.save();
  ctx.translate(x, y);
  const w = width, h = squished ? 10 : height;
  const yOff = squished ? height - 10 : 0;

  // Feet
  ctx.fillStyle = '#5a1a00';
  if (!squished) {
    ctx.fillRect(1, h - 8, 10, 8);
    ctx.fillRect(w - 11, h - 8, 10, 8);
  }
  // Main body (cap)
  ctx.fillStyle = '#8b3000';
  ctx.fillRect(2, yOff, w - 4, h - (squished ? 0 : 8));
  ctx.beginPath();
  ctx.arc(w / 2, yOff + (squished ? 5 : 14), w / 2 - 2, Math.PI, 0, false);
  ctx.fill();
  // Face
  ctx.fillStyle = '#d4965c';
  ctx.fillRect(4, yOff + (squished ? 2 : 12), w - 8, squished ? 6 : 12);
  if (!squished) {
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(5, yOff + 14, 6, 6);
    ctx.fillRect(w - 11, yOff + 14, 6, 6);
    // Pupils (cross-eyed)
    ctx.fillStyle = '#000';
    ctx.fillRect(8, yOff + 16, 3, 3);
    ctx.fillRect(w - 11, yOff + 16, 3, 3);
    // Frown
    ctx.fillStyle = '#3a0000';
    ctx.fillRect(8, yOff + 22, 3, 2);
    ctx.fillRect(w - 11, yOff + 22, 3, 2);
    ctx.fillRect(11, yOff + 20, 6, 2);
  }
  ctx.restore();
}

// ─── Mushroom ─────────────────────────────────────────────────────────────────

export function drawMushroom(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  // Stem
  ctx.fillStyle = '#f0d0b0';
  ctx.fillRect(6, h / 2, w - 12, h / 2);
  // Cap
  ctx.fillStyle = '#e02020';
  ctx.fillRect(0, 4, w, h / 2 + 2);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2, Math.PI, 0, false);
  ctx.fill();
  // White dots
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(8, 10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w - 8, 10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w / 2, 5, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ─── Flagpole ─────────────────────────────────────────────────────────────────

export function drawFlagpole(ctx, x, groundY) {
  const poleH = groundY - 4 * TILE_SIZE;
  // Pole
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(x + TILE_SIZE / 2 - 2, 4 * TILE_SIZE, 4, poleH);
  // Ball on top
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE / 2, 4 * TILE_SIZE, 8, 0, Math.PI * 2);
  ctx.fill();
  // Flag
  ctx.fillStyle = '#00cc44';
  ctx.fillRect(x + TILE_SIZE / 2, 4 * TILE_SIZE + 6, 28, 20);
  // Flag highlight
  ctx.fillStyle = '#00ee66';
  ctx.fillRect(x + TILE_SIZE / 2, 4 * TILE_SIZE + 6, 28, 4);
}

// ─── HUD ──────────────────────────────────────────────────────────────────────

export function drawHUD(ctx, score, coins, lives, world, timeLeft) {
  const W = ctx.canvas.width;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, 36);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.textBaseline = 'middle';

  // Left: MARIO / score
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffdd88';
  ctx.fillText('MARIO', 16, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(score).padStart(6, '0'), 16, 26);

  // Center-left: coins
  const cx = W / 2 - 80;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffdd88';
  ctx.fillText('COINS', cx, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('x' + String(coins).padStart(2, '0'), cx, 26);

  // Center: world
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffdd88';
  ctx.fillText('WORLD', W / 2, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(world, W / 2, 26);

  // Center-right: lives
  const lx = W / 2 + 80;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffdd88';
  ctx.fillText('LIVES', lx, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('x' + lives, lx, 26);

  // Right: time
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffdd88';
  ctx.fillText('TIME', W - 16, 10);
  ctx.fillStyle = timeLeft <= 100 ? '#ff4444' : '#ffffff';
  ctx.fillText(String(Math.ceil(timeLeft)).padStart(3, '0'), W - 16, 26);
}

// ─── Title / Overlay screens ──────────────────────────────────────────────────

export function drawTitleScreen(ctx, W, H) {
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#000';
  ctx.fillRect(W / 2 - 270, H / 2 - 110, 540, 220);
  ctx.fillStyle = '#e8a020';
  ctx.fillRect(W / 2 - 266, H / 2 - 106, 532, 212);

  ctx.fillStyle = '#000';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SUPER MARIO', W / 2 + 2, H / 2 - 52);
  ctx.fillText('BROTHERS', W / 2 + 2, H / 2 - 10);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('SUPER MARIO', W / 2, H / 2 - 54);
  ctx.fillText('BROTHERS', W / 2, H / 2 - 12);

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = Math.floor(Date.now() / 500) % 2 ? '#fff' : '#ffdd44';
  ctx.fillText('PRESS ENTER or SPACE to START', W / 2, H / 2 + 50);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#ccc';
  ctx.fillText('Arrow Keys / WASD to move   Z/X/Shift to run', W / 2, H / 2 + 85);
}

export function drawGameOverScreen(ctx, W, H, score) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.font = 'bold 48px monospace';
  ctx.fillStyle = '#ff4444';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', W / 2, H / 2 - 40);
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText('Score: ' + String(score).padStart(6, '0'), W / 2, H / 2 + 10);
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = Math.floor(Date.now() / 500) % 2 ? '#fff' : '#ffdd44';
  ctx.fillText('PRESS ENTER or SPACE to Restart', W / 2, H / 2 + 55);
}

export function drawLevelClearScreen(ctx, W, H, score, bonusScore) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEVEL CLEAR!', W / 2, H / 2 - 50);
  ctx.font = '20px monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText('Time Bonus: +' + bonusScore, W / 2, H / 2);
  ctx.fillText('Score: ' + String(score).padStart(6, '0'), W / 2, H / 2 + 36);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('(Restarting...)', W / 2, H / 2 + 80);
}

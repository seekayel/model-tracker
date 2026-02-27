import { TILE_SIZE, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT, TILE } from './constants.js';
import {
  getTileSprite, getMarioSprite, getDeadMarioSprite,
  getGoombaSprite, getKoopaSprite, getShellSprite,
  getCoinSprite, getMushroomSprite, getFireFlowerSprite, getStarSprite,
  getFlagSprite, getFireballSprite,
} from './sprites.js';
import { getTileNameForSprite } from './level.js';

export function createRenderer(canvas) {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  return { canvas, ctx };
}

export function renderGame(renderer, gameState) {
  const { ctx } = renderer;
  const { player, camera, level, enemies, items, coinPopups, particles, scorePopups, flagY } = gameState;

  // Clear with sky color
  ctx.fillStyle = '#6888ff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw background decorations (clouds, hills, bushes)
  drawBackground(ctx, camera);

  // Draw tiles
  const startCol = Math.floor(camera.x / TILE_SIZE);
  const endCol = startCol + Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 1;

  for (let col = startCol; col <= endCol && col < level.tiles.length; col++) {
    for (let row = 0; row < ROWS; row++) {
      const tileType = level.tiles[col][row];
      if (tileType === TILE.EMPTY) continue;

      const spriteName = getTileNameForSprite(tileType);
      if (spriteName) {
        const sprite = getTileSprite(spriteName);
        const sx = col * TILE_SIZE - camera.x;
        const sy = row * TILE_SIZE;
        ctx.drawImage(sprite, sx, sy);
      }
    }
  }

  // Draw flag on pole
  if (flagY !== undefined) {
    const flagSprite = getFlagSprite();
    ctx.drawImage(flagSprite, 198 * TILE_SIZE - camera.x - 24, flagY);
  }

  // Draw items
  for (const item of items) {
    if (!item.active) continue;
    const sx = item.x - camera.x;
    const sy = item.y;

    if (item.type === 'mushroom') {
      ctx.drawImage(getMushroomSprite(), sx, sy, 42, 42);
    } else if (item.type === 'fireflower') {
      ctx.drawImage(getFireFlowerSprite(item.animFrame), sx, sy, 42, 42);
    } else if (item.type === 'star') {
      ctx.drawImage(getStarSprite(item.animFrame), sx, sy, 42, 42);
    }
  }

  // Draw coin popups
  for (const coin of coinPopups) {
    if (!coin.active) continue;
    const frame = Math.floor(coin.timer / 4) % 4;
    ctx.drawImage(getCoinSprite(frame), coin.x - camera.x, coin.y, 42, 42);
  }

  // Draw enemies
  for (const enemy of enemies) {
    if (!enemy.active && !enemy.squished) continue;
    const sx = enemy.x - camera.x;
    const sy = enemy.y;

    if (enemy.type === 'goomba') {
      if (enemy.squished) {
        ctx.drawImage(getGoombaSprite('flat'), sx, sy - 6, 48, 48);
      } else {
        ctx.drawImage(getGoombaSprite(enemy.animFrame), sx - 3, sy + 6, 48, 48);
      }
    } else if (enemy.type === 'koopa') {
      if (enemy.shell) {
        ctx.drawImage(getShellSprite(), sx, sy, 48, 42);
      } else {
        ctx.drawImage(getKoopaSprite(enemy.animFrame, enemy.direction), sx - 3, sy - 6, 48, 72);
      }
    }
  }

  // Draw fireballs
  for (const fb of player.fireballs) {
    const sprite = getFireballSprite(fb.animFrame);
    ctx.drawImage(sprite, fb.x - camera.x, fb.y, 24, 24);
  }

  // Draw particles (brick fragments)
  ctx.fillStyle = '#c84c0c';
  for (const p of particles) {
    if (!p.active) continue;
    ctx.fillRect(p.x - camera.x, p.y, p.size, p.size);
  }

  // Draw score popups
  ctx.font = '16px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  for (const popup of scorePopups) {
    ctx.fillText(popup.text, popup.x - camera.x, popup.y);
  }

  // Draw player
  if (!player.dead) {
    // Blink during invincibility
    if (player.invincible && Math.floor(player.invincibleTimer / 3) % 2 === 0) {
      // skip drawing (blink)
    } else {
      const sprite = getMarioSprite(
        player.animFrame,
        player.big,
        player.direction,
        player.ducking,
        player.hasFireFlower,
      );
      const sx = player.x - camera.x;
      const sy = player.y;

      if (player.starPower) {
        // Rainbow effect during star power
        const hue = (Date.now() / 10) % 360;
        ctx.filter = `hue-rotate(${hue}deg) brightness(1.3)`;
      }

      if (player.big) {
        ctx.drawImage(sprite, sx, sy, 48, player.ducking ? 48 : 96);
      } else {
        ctx.drawImage(sprite, sx, sy, 48, 48);
      }

      ctx.filter = 'none';
    }
  } else {
    // Draw dead Mario
    const sprite = getDeadMarioSprite();
    ctx.drawImage(sprite, player.x - camera.x, player.y, 48, 48);
  }

  // Draw HUD
  drawHUD(ctx, gameState);
}

function drawBackground(ctx, camera) {
  const offset = camera.x * 0.3; // Parallax

  // Hills
  for (let i = 0; i < 15; i++) {
    const hx = i * 600 - (offset % 600);
    drawHill(ctx, hx, CANVAS_HEIGHT - 144, 120, 72);
    drawHill(ctx, hx + 300, CANVAS_HEIGHT - 144, 80, 48);
  }

  // Clouds
  for (let i = 0; i < 20; i++) {
    const cx = i * 500 - (offset * 0.5 % 500);
    const cy = 40 + (i % 3) * 60;
    drawCloud(ctx, cx, cy);
  }

  // Bushes
  for (let i = 0; i < 15; i++) {
    const bx = i * 700 - (camera.x % 700) + 200;
    drawBush(ctx, bx, CANVAS_HEIGHT - 144);
  }
}

function drawHill(ctx, x, y, w, h) {
  ctx.fillStyle = '#00a800';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + w / 2, y - h, x + w, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#80d010';
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.quadraticCurveTo(x + w / 2, y - h + 12, x + w - 10, y);
  ctx.closePath();
  ctx.fill();
}

function drawCloud(ctx, x, y) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y + 15, 20, 0, Math.PI * 2);
  ctx.arc(x + 25, y, 28, 0, Math.PI * 2);
  ctx.arc(x + 50, y + 10, 22, 0, Math.PI * 2);
  ctx.arc(x + 25, y + 20, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawBush(ctx, x, y) {
  ctx.fillStyle = '#00a800';
  ctx.beginPath();
  ctx.arc(x, y, 24, Math.PI, 0);
  ctx.arc(x + 30, y - 4, 20, Math.PI, 0);
  ctx.arc(x + 55, y, 22, Math.PI, 0);
  ctx.fill();
}

function drawHUD(ctx, gameState) {
  const { player, timer } = gameState;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 44);

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';

  // Mario label and score
  ctx.fillText('MARIO', 24, 16);
  ctx.fillText(String(player.score).padStart(6, '0'), 24, 36);

  // Coins
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`\u00D7${String(player.coins).padStart(2, '0')}`, 220, 36);

  // World
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('WORLD', CANVAS_WIDTH / 2, 16);
  ctx.fillText('1-1', CANVAS_WIDTH / 2, 36);

  // Timer
  ctx.textAlign = 'right';
  ctx.fillText('TIME', CANVAS_WIDTH - 24, 16);
  ctx.fillText(String(Math.max(0, Math.ceil(timer))).padStart(3, '0'), CANVAS_WIDTH - 24, 36);

  // Lives
  ctx.textAlign = 'left';
  ctx.fillText(`\u2665 ${player.lives}`, 380, 36);
}

export function renderTitleScreen(renderer) {
  const { ctx } = renderer;

  ctx.fillStyle = '#6888ff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw some ground
  for (let i = 0; i < 16; i++) {
    const sprite = getTileSprite('ground');
    ctx.drawImage(sprite, i * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 2, TILE_SIZE, TILE_SIZE);
    ctx.drawImage(sprite, i * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  // Draw a pipe
  ctx.drawImage(getTileSprite('pipe_tl'), TILE_SIZE * 11, CANVAS_HEIGHT - TILE_SIZE * 4);
  ctx.drawImage(getTileSprite('pipe_tr'), TILE_SIZE * 12, CANVAS_HEIGHT - TILE_SIZE * 4);
  ctx.drawImage(getTileSprite('pipe_bl'), TILE_SIZE * 11, CANVAS_HEIGHT - TILE_SIZE * 3);
  ctx.drawImage(getTileSprite('pipe_br'), TILE_SIZE * 12, CANVAS_HEIGHT - TILE_SIZE * 3);

  // Question blocks
  ctx.drawImage(getTileSprite('question'), TILE_SIZE * 4, CANVAS_HEIGHT - TILE_SIZE * 5);
  ctx.drawImage(getTileSprite('brick'), TILE_SIZE * 5, CANVAS_HEIGHT - TILE_SIZE * 5);
  ctx.drawImage(getTileSprite('question'), TILE_SIZE * 6, CANVAS_HEIGHT - TILE_SIZE * 5);

  // Title
  ctx.fillStyle = '#000000';
  ctx.fillRect(100, 100, CANVAS_WIDTH - 200, 180);
  ctx.fillStyle = '#e52521';
  ctx.fillRect(104, 104, CANVAS_WIDTH - 208, 172);

  ctx.font = 'bold 52px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SUPER MARIO', CANVAS_WIDTH / 2, 160);
  ctx.fillText('BROTHERS', CANVAS_WIDTH / 2, 220);

  // Draw Mario sprite on title
  const marioSprite = getMarioSprite(0, false, 1, false, false);
  ctx.drawImage(marioSprite, CANVAS_WIDTH / 2 - 24, 290, 48, 48);

  // Blinking "Press Enter" text
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PRESS ENTER TO START', CANVAS_WIDTH / 2, 400);
  }

  // Controls info
  ctx.font = '16px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Arrow Keys / WASD - Move & Jump', CANVAS_WIDTH / 2, 470);
  ctx.fillText('Shift / X - Run & Fire', CANVAS_WIDTH / 2, 500);
  ctx.fillText('Down / S - Duck', CANVAS_WIDTH / 2, 530);
}

export function renderGameOver(renderer, player) {
  const { ctx } = renderer;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.font = 'bold 48px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

  ctx.font = 'bold 24px monospace';
  ctx.fillText(`Score: ${player.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.font = '20px monospace';
    ctx.fillText('PRESS ENTER TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
  }
}

export function renderWinScreen(renderer, player) {
  const { ctx } = renderer;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.font = 'bold 48px monospace';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEVEL COMPLETE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Score: ${player.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.fillText(`Coins: ${player.coins}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);

  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.font = '20px monospace';
    ctx.fillText('PRESS ENTER TO PLAY AGAIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);
  }
}

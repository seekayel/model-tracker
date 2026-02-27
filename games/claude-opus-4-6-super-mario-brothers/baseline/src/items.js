import { TILE_SIZE, ROWS, GRAVITY, MAX_FALL_SPEED } from './constants.js';
import { isSolidTile } from './level.js';
import { aabb } from './physics.js';
import { growPlayer, giveFireFlower, giveStar } from './player.js';
import { playCoinSound, playPowerUpSound } from './sound.js';

export function createItem(col, row, type) {
  return {
    type, // 'mushroom', 'fireflower', 'star', 'coin_popup'
    x: col * TILE_SIZE,
    y: row * TILE_SIZE,
    targetY: (row - 1) * TILE_SIZE,
    w: 42,
    h: 42,
    vx: type === 'mushroom' ? 2.5 : type === 'star' ? 3 : 0,
    vy: 0,
    onGround: false,
    active: true,
    emerging: true,
    animFrame: 0,
    animTimer: 0,
  };
}

export function createCoinPopup(x, y) {
  return {
    type: 'coin_popup',
    x,
    y,
    startY: y,
    vy: -8,
    active: true,
    timer: 30,
  };
}

export function createBrickParticle(x, y) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 6,
    vy: -8 - Math.random() * 4,
    size: 12,
    active: true,
    timer: 40,
  };
}

export function createScorePopup(x, y, score) {
  return {
    x,
    y,
    text: score.toString(),
    vy: -2,
    active: true,
    timer: 40,
  };
}

export function updateItem(item, tiles) {
  if (!item.active) return;

  if (item.type === 'coin_popup') {
    item.y += item.vy;
    item.vy += 0.4;
    item.timer--;
    if (item.timer <= 0) item.active = false;
    return;
  }

  // Emerging from block animation
  if (item.emerging) {
    item.y -= 2;
    if (item.y <= item.targetY) {
      item.y = item.targetY;
      item.emerging = false;
    }
    return;
  }

  if (item.type === 'fireflower') {
    // Fire flowers don't move, just animate
    item.animTimer++;
    if (item.animTimer >= 8) {
      item.animTimer = 0;
      item.animFrame = (item.animFrame + 1) % 4;
    }
    return;
  }

  // Stars bounce
  if (item.type === 'star') {
    item.animTimer++;
    if (item.animTimer >= 6) {
      item.animTimer = 0;
      item.animFrame = (item.animFrame + 1) % 4;
    }
  }

  // Apply gravity
  item.vy += GRAVITY;
  if (item.vy > MAX_FALL_SPEED) item.vy = MAX_FALL_SPEED;

  // Move horizontally
  item.x += item.vx;

  const sideCol = Math.floor((item.vx > 0 ? item.x + item.w : item.x) / TILE_SIZE);
  const topRow = Math.floor(item.y / TILE_SIZE);
  const botRow = Math.floor((item.y + item.h - 1) / TILE_SIZE);

  for (let row = topRow; row <= botRow; row++) {
    if (sideCol >= 0 && sideCol < tiles.length && row >= 0 && row < ROWS) {
      if (isSolidTile(tiles[sideCol][row])) {
        if (item.vx > 0) {
          item.x = sideCol * TILE_SIZE - item.w;
        } else {
          item.x = (sideCol + 1) * TILE_SIZE;
        }
        item.vx = -item.vx;
        break;
      }
    }
  }

  // Move vertically
  item.y += item.vy;

  const left = Math.floor(item.x / TILE_SIZE);
  const right = Math.floor((item.x + item.w - 1) / TILE_SIZE);
  const bottom = Math.floor((item.y + item.h - 1) / TILE_SIZE);

  for (let col = left; col <= right; col++) {
    if (col >= 0 && col < tiles.length && bottom >= 0 && bottom < ROWS) {
      if (isSolidTile(tiles[col][bottom])) {
        if (item.vy > 0) {
          item.y = bottom * TILE_SIZE - item.h;
          item.vy = item.type === 'star' ? -10 : 0;
          item.onGround = true;
        }
      }
    }
  }

  // Fall into pit
  if (item.y > ROWS * TILE_SIZE + 50) {
    item.active = false;
  }
}

export function collectItem(item, player) {
  if (!item.active || item.emerging) return false;
  if (item.type === 'coin_popup') return false;

  if (!aabb(player, item)) return false;

  item.active = false;

  switch (item.type) {
    case 'mushroom':
      growPlayer(player);
      playPowerUpSound();
      player.score += 1000;
      break;
    case 'fireflower':
      giveFireFlower(player);
      playPowerUpSound();
      player.score += 1000;
      break;
    case 'star':
      giveStar(player);
      playPowerUpSound();
      player.score += 1000;
      break;
  }

  return true;
}

export function updateParticles(particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += GRAVITY;
    p.timer--;
    if (p.timer <= 0 || p.y > ROWS * TILE_SIZE + 50) {
      particles.splice(i, 1);
    }
  }
}

export function updateScorePopups(popups) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy;
    p.timer--;
    if (p.timer <= 0) {
      popups.splice(i, 1);
    }
  }
}

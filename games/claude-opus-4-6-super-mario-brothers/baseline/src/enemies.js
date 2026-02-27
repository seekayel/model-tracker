import { TILE_SIZE, ROWS, GOOMBA_SPEED, KOOPA_SPEED, SHELL_SPEED, GRAVITY, MAX_FALL_SPEED } from './constants.js';
import { isSolidTile } from './level.js';
import { aabb } from './physics.js';

export function createEnemy(col, row, type) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  if (type === 'goomba') {
    return {
      type: 'goomba',
      x,
      y,
      w: 42,
      h: 42,
      vx: -GOOMBA_SPEED,
      vy: 0,
      onGround: false,
      active: true,
      squished: false,
      squishTimer: 0,
      animFrame: 0,
      animTimer: 0,
      direction: -1,
    };
  } else if (type === 'koopa') {
    return {
      type: 'koopa',
      x,
      y: y - 24,
      w: 42,
      h: 66,
      vx: -KOOPA_SPEED,
      vy: 0,
      onGround: false,
      active: true,
      shell: false,
      shellMoving: false,
      animFrame: 0,
      animTimer: 0,
      direction: -1,
    };
  }
}

export function updateEnemy(enemy, tiles) {
  if (!enemy.active) return;

  if (enemy.squished) {
    enemy.squishTimer--;
    if (enemy.squishTimer <= 0) {
      enemy.active = false;
    }
    return;
  }

  // Apply gravity
  enemy.vy += GRAVITY;
  if (enemy.vy > MAX_FALL_SPEED) enemy.vy = MAX_FALL_SPEED;

  // Move horizontally
  enemy.x += enemy.vx;

  // Check wall collisions
  const sideCol = Math.floor((enemy.vx > 0 ? enemy.x + enemy.w : enemy.x) / TILE_SIZE);
  const topRow = Math.floor(enemy.y / TILE_SIZE);
  const botRow = Math.floor((enemy.y + enemy.h - 1) / TILE_SIZE);

  for (let row = topRow; row <= botRow; row++) {
    if (sideCol >= 0 && sideCol < tiles.length && row >= 0 && row < ROWS) {
      if (isSolidTile(tiles[sideCol][row])) {
        if (enemy.vx > 0) {
          enemy.x = sideCol * TILE_SIZE - enemy.w;
        } else {
          enemy.x = (sideCol + 1) * TILE_SIZE;
        }
        enemy.vx = -enemy.vx;
        enemy.direction = enemy.vx > 0 ? 1 : -1;
        break;
      }
    }
  }

  // Move vertically
  enemy.y += enemy.vy;

  const left = Math.floor(enemy.x / TILE_SIZE);
  const right = Math.floor((enemy.x + enemy.w - 1) / TILE_SIZE);
  const bottom = Math.floor((enemy.y + enemy.h - 1) / TILE_SIZE);

  for (let col = left; col <= right; col++) {
    if (col >= 0 && col < tiles.length && bottom >= 0 && bottom < ROWS) {
      if (isSolidTile(tiles[col][bottom])) {
        if (enemy.vy > 0) {
          enemy.y = bottom * TILE_SIZE - enemy.h;
          enemy.vy = 0;
          enemy.onGround = true;
        }
      }
    }
  }

  // Fall into pit
  if (enemy.y > ROWS * TILE_SIZE + 100) {
    enemy.active = false;
  }

  // Animation
  enemy.animTimer++;
  if (enemy.animTimer >= 10) {
    enemy.animTimer = 0;
    enemy.animFrame = (enemy.animFrame + 1) % 2;
  }
}

export function stompEnemy(enemy, player) {
  if (enemy.type === 'goomba') {
    enemy.squished = true;
    enemy.squishTimer = 30;
    enemy.vx = 0;
    enemy.h = 24;
    enemy.y += 18;
    player.vy = -8;
    player.score += 100;
    return true;
  } else if (enemy.type === 'koopa') {
    if (!enemy.shell) {
      // Turn into shell
      enemy.shell = true;
      enemy.shellMoving = false;
      enemy.vx = 0;
      enemy.h = 42;
      enemy.y += 24;
      player.vy = -8;
      player.score += 100;
      return true;
    } else if (!enemy.shellMoving) {
      // Kick shell
      enemy.shellMoving = true;
      enemy.vx = player.x + player.w / 2 < enemy.x + enemy.w / 2 ? SHELL_SPEED : -SHELL_SPEED;
      player.vy = -6;
      player.score += 400;
      return true;
    } else {
      // Stop moving shell
      enemy.shellMoving = false;
      enemy.vx = 0;
      player.vy = -8;
      return true;
    }
  }
  return false;
}

export function checkShellHit(shell, enemies) {
  if (!shell.shellMoving) return;

  for (const enemy of enemies) {
    if (enemy === shell || !enemy.active || enemy.squished) continue;
    if (aabb(shell, enemy)) {
      enemy.active = false;
      enemy.vy = -6;
    }
  }
}

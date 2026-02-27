import {
  TILE_SIZE, GRAVITY, PLAYER_ACCEL, PLAYER_MAX_SPEED, PLAYER_RUN_MAX_SPEED,
  PLAYER_JUMP_FORCE, PLAYER_BIG_JUMP_FORCE, PLAYER_WIDTH, PLAYER_HEIGHT,
  PLAYER_BIG_HEIGHT, FRICTION, CANVAS_WIDTH, ROWS,
} from './constants.js';
import { isLeft, isRight, isJump, isRun, isDown, clearKey } from './input.js';
import { moveX, moveY, aabb } from './physics.js';
import { isSolidTile, isBreakable, isQuestion } from './level.js';
import { playJumpSound, playFireballSound } from './sound.js';

export function createPlayer(x, y) {
  return {
    x,
    y,
    w: PLAYER_WIDTH,
    h: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    onGround: false,
    direction: 1, // 1 = right, -1 = left
    big: false,
    hasFireFlower: false,
    invincible: false,
    invincibleTimer: 0,
    starPower: false,
    starTimer: 0,
    animFrame: 0,
    animTimer: 0,
    ducking: false,
    dead: false,
    jumpHeld: false,
    lives: 3,
    coins: 0,
    score: 0,
    fireballs: [],
    fireballCooldown: 0,
  };
}

export function updatePlayer(player, tiles, camera, dt) {
  if (player.dead) return;

  const wasOnGround = player.onGround;
  const running = isRun();
  const maxSpeed = running ? PLAYER_RUN_MAX_SPEED : PLAYER_MAX_SPEED;

  // Horizontal movement
  if (isLeft()) {
    player.vx -= PLAYER_ACCEL;
    if (player.vx < -maxSpeed) player.vx = -maxSpeed;
    player.direction = -1;
  } else if (isRight()) {
    player.vx += PLAYER_ACCEL;
    if (player.vx > maxSpeed) player.vx = maxSpeed;
    player.direction = 1;
  } else {
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.3) player.vx = 0;
  }

  // Ducking (big Mario only)
  if (player.big && isDown() && player.onGround) {
    player.ducking = true;
    player.h = PLAYER_HEIGHT; // reduced height while ducking
    player.vx *= 0.8;
  } else {
    if (player.ducking && player.big) {
      // Check if we can stand up
      const testY = player.y - (PLAYER_BIG_HEIGHT - PLAYER_HEIGHT);
      let canStand = true;
      const left = Math.floor(player.x / TILE_SIZE);
      const right = Math.floor((player.x + player.w - 1) / TILE_SIZE);
      const topRow = Math.floor(testY / TILE_SIZE);
      for (let col = left; col <= right; col++) {
        if (col >= 0 && col < tiles.length && topRow >= 0 && topRow < ROWS) {
          if (isSolidTile(tiles[col][topRow])) {
            canStand = false;
            break;
          }
        }
      }
      if (canStand) {
        player.ducking = false;
        player.h = PLAYER_BIG_HEIGHT;
        player.y = testY;
      }
    } else {
      player.ducking = false;
    }
  }

  // Jumping
  if (isJump() && player.onGround && !player.jumpHeld) {
    const jumpForce = player.big ? PLAYER_BIG_JUMP_FORCE : PLAYER_JUMP_FORCE;
    player.vy = jumpForce;
    player.onGround = false;
    player.jumpHeld = true;
    playJumpSound();
  }

  // Variable jump height - release early to jump lower
  if (!isJump()) {
    player.jumpHeld = false;
    if (player.vy < -4) {
      player.vy = -4;
    }
  }

  // Fire fireballs
  if (player.hasFireFlower && isRun() && player.fireballCooldown <= 0 && player.fireballs.length < 2) {
    player.fireballs.push({
      x: player.x + (player.direction === 1 ? player.w : -12),
      y: player.y + player.h / 2 - 6,
      vx: player.direction * 7,
      vy: -2,
      w: 12,
      h: 12,
      bounces: 0,
      active: true,
      animFrame: 0,
    });
    player.fireballCooldown = 15;
    playFireballSound();
  }
  if (player.fireballCooldown > 0) player.fireballCooldown--;

  // Apply physics
  const hitX = moveX(player, tiles);
  const hitY = moveY(player, tiles);

  // Keep player in bounds (left side only, can scroll right)
  if (player.x < camera.x) {
    player.x = camera.x;
    player.vx = 0;
  }

  // Fall into pit
  if (player.y > ROWS * TILE_SIZE) {
    player.dead = true;
  }

  // Animation
  if (player.onGround) {
    if (Math.abs(player.vx) > 0.5) {
      player.animTimer++;
      const speed = Math.abs(player.vx) > 4 ? 4 : 6;
      if (player.animTimer >= speed) {
        player.animTimer = 0;
        player.animFrame = (player.animFrame + 1) % 3;
      }
    } else {
      player.animFrame = 0;
      player.animTimer = 0;
    }
  } else {
    player.animFrame = 3; // jump frame
  }

  // Invincibility timer (after taking damage)
  if (player.invincible) {
    player.invincibleTimer--;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
    }
  }

  // Star power timer
  if (player.starPower) {
    player.starTimer--;
    if (player.starTimer <= 0) {
      player.starPower = false;
    }
  }

  // Update fireballs
  updateFireballs(player, tiles);

  return { hitX, hitY };
}

function updateFireballs(player, tiles) {
  for (let i = player.fireballs.length - 1; i >= 0; i--) {
    const fb = player.fireballs[i];
    fb.x += fb.vx;
    fb.vy += GRAVITY * 0.5;
    fb.y += fb.vy;
    fb.animFrame = (fb.animFrame + 1) % 4;

    // Bounce off ground
    const bottomRow = Math.floor((fb.y + fb.h) / TILE_SIZE);
    const col = Math.floor((fb.x + fb.w / 2) / TILE_SIZE);
    if (col >= 0 && col < tiles.length && bottomRow >= 0 && bottomRow < ROWS) {
      if (isSolidTile(tiles[col][bottomRow])) {
        fb.y = bottomRow * TILE_SIZE - fb.h;
        fb.vy = -6;
        fb.bounces++;
      }
    }

    // Wall collision
    const sideCol = Math.floor((fb.vx > 0 ? fb.x + fb.w : fb.x) / TILE_SIZE);
    const sideRow = Math.floor((fb.y + fb.h / 2) / TILE_SIZE);
    if (sideCol >= 0 && sideCol < tiles.length && sideRow >= 0 && sideRow < ROWS) {
      if (isSolidTile(tiles[sideCol][sideRow])) {
        fb.active = false;
      }
    }

    // Remove if out of bounds or too many bounces
    if (fb.y > ROWS * TILE_SIZE || fb.bounces > 5 || !fb.active) {
      player.fireballs.splice(i, 1);
    }
  }
}

export function damagePlayer(player) {
  if (player.invincible || player.starPower) return false;

  if (player.hasFireFlower) {
    player.hasFireFlower = false;
    player.invincible = true;
    player.invincibleTimer = 90;
    return false;
  } else if (player.big) {
    player.big = false;
    player.h = PLAYER_HEIGHT;
    player.invincible = true;
    player.invincibleTimer = 90;
    return false;
  } else {
    player.dead = true;
    player.vy = PLAYER_JUMP_FORCE;
    return true;
  }
}

export function growPlayer(player) {
  if (!player.big) {
    player.big = true;
    player.y -= (PLAYER_BIG_HEIGHT - PLAYER_HEIGHT);
    player.h = PLAYER_BIG_HEIGHT;
  }
}

export function giveFireFlower(player) {
  if (!player.big) {
    growPlayer(player);
  }
  player.hasFireFlower = true;
}

export function giveStar(player) {
  player.starPower = true;
  player.starTimer = 600; // ~10 seconds
}

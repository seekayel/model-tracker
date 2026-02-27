import { TILE_SIZE, ROWS, GRAVITY, MAX_FALL_SPEED } from './constants.js';
import { isSolidTile } from './level.js';

// Axis-Aligned Bounding Box collision
export function aabb(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// Get tile at pixel position
export function getTileAt(tiles, px, py) {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  if (col < 0 || col >= tiles.length || row < 0 || row >= ROWS) {
    return 0;
  }
  return tiles[col][row];
}

// Get tile coordinates from pixel position
export function getTileCoords(px, py) {
  return {
    col: Math.floor(px / TILE_SIZE),
    row: Math.floor(py / TILE_SIZE),
  };
}

// Check for solid tile collision in a rectangle
export function checkTileCollision(tiles, x, y, w, h) {
  const left = Math.floor(x / TILE_SIZE);
  const right = Math.floor((x + w - 1) / TILE_SIZE);
  const top = Math.floor(y / TILE_SIZE);
  const bottom = Math.floor((y + h - 1) / TILE_SIZE);

  for (let col = left; col <= right; col++) {
    for (let row = top; row <= bottom; row++) {
      if (col < 0 || col >= tiles.length || row < 0 || row >= ROWS) continue;
      if (isSolidTile(tiles[col][row])) {
        return { col, row, type: tiles[col][row] };
      }
    }
  }
  return null;
}

// Resolve movement along X axis with tile collision
export function moveX(entity, tiles) {
  entity.x += entity.vx;

  const left = Math.floor(entity.x / TILE_SIZE);
  const right = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
  const top = Math.floor(entity.y / TILE_SIZE);
  const bottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);

  for (let col = left; col <= right; col++) {
    for (let row = top; row <= bottom; row++) {
      if (col < 0 || col >= tiles.length || row < 0 || row >= ROWS) continue;
      if (isSolidTile(tiles[col][row])) {
        if (entity.vx > 0) {
          entity.x = col * TILE_SIZE - entity.w;
          entity.vx = 0;
        } else if (entity.vx < 0) {
          entity.x = (col + 1) * TILE_SIZE;
          entity.vx = 0;
        }
        return { col, row, type: tiles[col][row] };
      }
    }
  }
  return null;
}

// Resolve movement along Y axis with tile collision
export function moveY(entity, tiles) {
  entity.vy += GRAVITY;
  if (entity.vy > MAX_FALL_SPEED) entity.vy = MAX_FALL_SPEED;

  entity.y += entity.vy;

  const left = Math.floor(entity.x / TILE_SIZE);
  const right = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
  const top = Math.floor(entity.y / TILE_SIZE);
  const bottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);

  const hitBlocks = [];

  for (let col = left; col <= right; col++) {
    for (let row = top; row <= bottom; row++) {
      if (col < 0 || col >= tiles.length || row < 0 || row >= ROWS) continue;
      if (isSolidTile(tiles[col][row])) {
        if (entity.vy > 0) {
          // Landing
          entity.y = row * TILE_SIZE - entity.h;
          entity.vy = 0;
          entity.onGround = true;
          return { col, row, type: tiles[col][row], side: 'bottom' };
        } else if (entity.vy < 0) {
          // Hitting head
          entity.y = (row + 1) * TILE_SIZE;
          entity.vy = 0;
          hitBlocks.push({ col, row, type: tiles[col][row], side: 'top' });
        }
      }
    }
  }

  if (hitBlocks.length > 0) return hitBlocks[0];

  // Check if still on ground
  if (entity.vy >= 0) {
    const belowLeft = Math.floor(entity.x / TILE_SIZE);
    const belowRight = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    const belowRow = Math.floor((entity.y + entity.h) / TILE_SIZE);

    let onSolid = false;
    for (let col = belowLeft; col <= belowRight; col++) {
      if (col < 0 || col >= tiles.length || belowRow < 0 || belowRow >= ROWS) continue;
      if (isSolidTile(tiles[col][belowRow])) {
        onSolid = true;
        break;
      }
    }
    entity.onGround = onSolid && entity.vy === 0;
  }

  return null;
}

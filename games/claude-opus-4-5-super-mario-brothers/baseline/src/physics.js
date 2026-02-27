import { GRAVITY, MAX_FALL_SPEED, TILE_SIZE } from './constants.js';

// Check axis-aligned bounding box collision
export function checkAABB(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Get collision side
export function getCollisionSide(a, b) {
  const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

  if (overlapX < overlapY) {
    return a.x < b.x ? 'right' : 'left';
  } else {
    return a.y < b.y ? 'bottom' : 'top';
  }
}

// Apply gravity to an entity
export function applyGravity(entity) {
  entity.vy += GRAVITY;
  if (entity.vy > MAX_FALL_SPEED) {
    entity.vy = MAX_FALL_SPEED;
  }
}

// Check if entity is standing on a platform
export function isOnGround(entity, tiles, levelWidth) {
  const checkY = entity.y + entity.height + 1;
  const leftTile = Math.floor(entity.x / TILE_SIZE);
  const rightTile = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
  const tileY = Math.floor(checkY / TILE_SIZE);

  for (let tx = leftTile; tx <= rightTile; tx++) {
    const tileIndex = tileY * levelWidth + tx;
    if (tiles[tileIndex] && tiles[tileIndex] > 0) {
      return true;
    }
  }
  return false;
}

// Resolve tile collision for an entity
export function resolveTileCollision(entity, tiles, levelWidth, levelHeight) {
  const collisions = {
    top: false,
    bottom: false,
    left: false,
    right: false,
    hitBlock: null
  };

  // Horizontal collision
  const newX = entity.x + entity.vx;
  const leftTile = Math.floor(newX / TILE_SIZE);
  const rightTile = Math.floor((newX + entity.width - 1) / TILE_SIZE);
  const topTile = Math.floor(entity.y / TILE_SIZE);
  const bottomTile = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);

  // Check horizontal movement
  for (let ty = topTile; ty <= bottomTile; ty++) {
    for (let tx = leftTile; tx <= rightTile; tx++) {
      if (tx < 0 || tx >= levelWidth || ty < 0 || ty >= levelHeight) continue;
      const tileIndex = ty * levelWidth + tx;
      const tile = tiles[tileIndex];

      if (tile && tile > 0) {
        const tileRect = {
          x: tx * TILE_SIZE,
          y: ty * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE
        };

        const entityRect = {
          x: newX,
          y: entity.y,
          width: entity.width,
          height: entity.height
        };

        if (checkAABB(entityRect, tileRect)) {
          if (entity.vx > 0) {
            entity.x = tileRect.x - entity.width;
            collisions.right = true;
          } else if (entity.vx < 0) {
            entity.x = tileRect.x + TILE_SIZE;
            collisions.left = true;
          }
          entity.vx = 0;
        }
      }
    }
  }

  // Apply horizontal movement if no collision
  if (!collisions.left && !collisions.right) {
    entity.x += entity.vx;
  }

  // Vertical collision
  const newY = entity.y + entity.vy;
  const leftTile2 = Math.floor(entity.x / TILE_SIZE);
  const rightTile2 = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
  const topTile2 = Math.floor(newY / TILE_SIZE);
  const bottomTile2 = Math.floor((newY + entity.height - 1) / TILE_SIZE);

  for (let ty = topTile2; ty <= bottomTile2; ty++) {
    for (let tx = leftTile2; tx <= rightTile2; tx++) {
      if (tx < 0 || tx >= levelWidth || ty < 0 || ty >= levelHeight) continue;
      const tileIndex = ty * levelWidth + tx;
      const tile = tiles[tileIndex];

      if (tile && tile > 0) {
        const tileRect = {
          x: tx * TILE_SIZE,
          y: ty * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE
        };

        const entityRect = {
          x: entity.x,
          y: newY,
          width: entity.width,
          height: entity.height
        };

        if (checkAABB(entityRect, tileRect)) {
          if (entity.vy > 0) {
            entity.y = tileRect.y - entity.height;
            entity.vy = 0;
            entity.onGround = true;
            collisions.bottom = true;
          } else if (entity.vy < 0) {
            entity.y = tileRect.y + TILE_SIZE;
            entity.vy = 0;
            collisions.top = true;
            collisions.hitBlock = { x: tx, y: ty, index: tileIndex, type: tile };
          }
        }
      }
    }
  }

  // Apply vertical movement if no collision
  if (!collisions.top && !collisions.bottom) {
    entity.y += entity.vy;
    entity.onGround = false;
  }

  return collisions;
}

// Check collision between two entities
export function checkEntityCollision(a, b) {
  return checkAABB(a, b);
}

// Determine if one entity is stomping another (attacking from above)
export function isStomping(attacker, target) {
  const attackerBottom = attacker.y + attacker.height;
  const targetTop = target.y;
  const attackerPrevBottom = attacker.y - attacker.vy + attacker.height;

  // Attacker was above target's top and is now overlapping
  return (
    attacker.vy > 0 &&
    attackerPrevBottom <= targetTop + 8 &&
    attackerBottom > targetTop
  );
}

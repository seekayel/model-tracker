import { TILE, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, ENEMY_TYPE, ITEM_TYPE } from './constants.js';

// Simple dungeon generator using BSP-like room placement
export function generateDungeon(level) {
  const map = createFilledMap(TILE.WALL);
  const rooms = [];

  // Place rooms
  const numRooms = 6 + Math.min(level * 2, 8);
  let attempts = 0;

  while (rooms.length < numRooms && attempts < 200) {
    attempts++;
    const w = randInt(4, 9);
    const h = randInt(4, 8);
    const x = randInt(1, MAP_WIDTH - w - 1);
    const y = randInt(1, MAP_HEIGHT - h - 1);
    const room = { x, y, w, h };

    if (!overlapsAny(room, rooms)) {
      carveRoom(map, room);
      rooms.push(room);
    }
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const a = roomCenter(rooms[i - 1]);
    const b = roomCenter(rooms[i]);
    carveCorridor(map, a, b);
  }

  // Find floor tiles for placement
  const floorTiles = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (map[y][x] === TILE.FLOOR) {
        floorTiles.push({ x, y });
      }
    }
  }

  // Player start in first room center
  const playerStart = roomCenter(rooms[0]);

  // Exit in last room
  const exitRoom = rooms[rooms.length - 1];
  const exitPos = roomCenter(exitRoom);
  map[exitPos.y][exitPos.x] = TILE.EXIT;

  // Place spawners (monster generators)
  const spawners = [];
  const spawnerRooms = rooms.slice(1, -1);
  spawnerRooms.forEach((room, i) => {
    if (i % 2 === 0 || level > 2) {
      const cx = room.x + Math.floor(room.w / 2);
      const cy = room.y + Math.floor(room.h / 2);
      const enemyTypes = getEnemyTypesForLevel(level);
      const enemyType = enemyTypes[i % enemyTypes.length];
      spawners.push({
        x: cx * TILE_SIZE + TILE_SIZE / 2,
        y: cy * TILE_SIZE + TILE_SIZE / 2,
        tileX: cx,
        tileY: cy,
        enemyType,
        spawnCount: 0,
      });
      map[cy][cx] = TILE.SPAWNER;
    }
  });

  // Place items on random floor tiles
  const items = [];
  const usedTiles = new Set();
  usedTiles.add(`${playerStart.x},${playerStart.y}`);
  usedTiles.add(`${exitPos.x},${exitPos.y}`);
  spawners.forEach(s => usedTiles.add(`${s.tileX},${s.tileY}`));

  const availableTiles = floorTiles.filter(t => !usedTiles.has(`${t.x},${t.y}`));
  shuffle(availableTiles);

  const itemCount = 5 + level;
  for (let i = 0; i < Math.min(itemCount, availableTiles.length); i++) {
    const t = availableTiles[i];
    const type = pickItemType(i);
    items.push({
      x: t.x * TILE_SIZE + TILE_SIZE / 2,
      y: t.y * TILE_SIZE + TILE_SIZE / 2,
      tileX: t.x,
      tileY: t.y,
      type,
      collected: false,
    });
    if (type !== ITEM_TYPE.TREASURE) {
      map[t.y][t.x] = tileForItem(type);
    }
  }

  return {
    map,
    playerStart: {
      x: playerStart.x * TILE_SIZE + TILE_SIZE / 2,
      y: playerStart.y * TILE_SIZE + TILE_SIZE / 2,
    },
    spawners,
    items,
    rooms,
    level,
  };
}

function createFilledMap(tile) {
  return Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(tile));
}

function carveRoom(map, room) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      map[y][x] = TILE.FLOOR;
    }
  }
}

function carveCorridor(map, a, b) {
  let { x: ax, y: ay } = a;
  const { x: bx, y: by } = b;

  // Horizontal then vertical (L-shaped corridor)
  while (ax !== bx) {
    map[ay][ax] = TILE.FLOOR;
    ax += ax < bx ? 1 : -1;
  }
  while (ay !== by) {
    map[ay][ax] = TILE.FLOOR;
    ay += ay < by ? 1 : -1;
  }
  map[by][bx] = TILE.FLOOR;
}

function roomCenter(room) {
  return {
    x: room.x + Math.floor(room.w / 2),
    y: room.y + Math.floor(room.h / 2),
  };
}

function overlapsAny(room, rooms) {
  const pad = 1;
  return rooms.some(r =>
    room.x < r.x + r.w + pad &&
    room.x + room.w + pad > r.x &&
    room.y < r.y + r.h + pad &&
    room.y + room.h + pad > r.y
  );
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getEnemyTypesForLevel(level) {
  if (level === 1) return [ENEMY_TYPE.GRUNT];
  if (level === 2) return [ENEMY_TYPE.GRUNT, ENEMY_TYPE.GHOST];
  if (level === 3) return [ENEMY_TYPE.GRUNT, ENEMY_TYPE.GHOST, ENEMY_TYPE.SORCERER];
  return [ENEMY_TYPE.GRUNT, ENEMY_TYPE.GHOST, ENEMY_TYPE.SORCERER, ENEMY_TYPE.DEMON];
}

function pickItemType(index) {
  const roll = index % 6;
  if (roll < 2) return ITEM_TYPE.FOOD;
  if (roll < 3) return ITEM_TYPE.KEY;
  if (roll < 4) return ITEM_TYPE.POTION;
  return ITEM_TYPE.TREASURE;
}

function tileForItem(type) {
  switch (type) {
    case ITEM_TYPE.FOOD: return TILE.FOOD;
    case ITEM_TYPE.KEY: return TILE.KEY;
    case ITEM_TYPE.POTION: return TILE.POTION;
    default: return TILE.FLOOR;
  }
}

export function isSolid(map, tileX, tileY) {
  if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return true;
  const t = map[tileY][tileX];
  return t === TILE.WALL || t === TILE.SPAWNER;
}

export function isSolidForGhost(map, tileX, tileY) {
  if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return true;
  return false; // Ghosts pass through walls
}

export function worldToTile(worldX, worldY) {
  return {
    tileX: Math.floor(worldX / TILE_SIZE),
    tileY: Math.floor(worldY / TILE_SIZE),
  };
}

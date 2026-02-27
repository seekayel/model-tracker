import { Tile, EntityKind } from './types';

export interface DungeonDef {
  width: number;
  height: number;
  tiles: Tile[][];
  entities: { kind: EntityKind; x: number; y: number }[];
  playerStart: { x: number; y: number };
}

// Random helper seeded by level number
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateDungeon(level: number): DungeonDef {
  const rand = rng(level * 7919 + 31);
  const W = 40 + Math.floor(rand() * 10) * 2;
  const H = 35 + Math.floor(rand() * 8) * 2;

  // Start with all walls
  const tiles: Tile[][] = [];
  for (let y = 0; y < H; y++) {
    tiles[y] = [];
    for (let x = 0; x < W; x++) {
      tiles[y][x] = Tile.Wall;
    }
  }

  // Carve rooms connected by corridors using BSP-like approach
  interface Rect { x: number; y: number; w: number; h: number }
  const rooms: Rect[] = [];

  function carveRect(r: Rect) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (y > 0 && y < H - 1 && x > 0 && x < W - 1) {
          tiles[y][x] = Tile.Floor;
        }
      }
    }
  }

  function carveCorridor(x1: number, y1: number, x2: number, y2: number) {
    let cx = x1, cy = y1;
    while (cx !== x2) {
      if (cy > 0 && cy < H - 1 && cx > 0 && cx < W - 1) {
        tiles[cy][cx] = Tile.Floor;
      }
      cx += cx < x2 ? 1 : -1;
    }
    while (cy !== y2) {
      if (cy > 0 && cy < H - 1 && cx > 0 && cx < W - 1) {
        tiles[cy][cx] = Tile.Floor;
      }
      cy += cy < y2 ? 1 : -1;
    }
  }

  // Place rooms
  const numRooms = 8 + Math.floor(rand() * 5) + level;
  for (let i = 0; i < numRooms; i++) {
    const rw = 4 + Math.floor(rand() * 5);
    const rh = 4 + Math.floor(rand() * 4);
    const rx = 2 + Math.floor(rand() * (W - rw - 4));
    const ry = 2 + Math.floor(rand() * (H - rh - 4));
    const room: Rect = { x: rx, y: ry, w: rw, h: rh };
    carveRect(room);
    if (rooms.length > 0) {
      const prev = rooms[rooms.length - 1];
      const px = Math.floor(prev.x + prev.w / 2);
      const py = Math.floor(prev.y + prev.h / 2);
      const nx = Math.floor(room.x + room.w / 2);
      const ny = Math.floor(room.y + room.h / 2);
      carveCorridor(px, py, nx, ny);
    }
    rooms.push(room);
  }

  // Ensure borders are walls
  for (let y = 0; y < H; y++) {
    tiles[y][0] = Tile.Wall;
    tiles[y][W - 1] = Tile.Wall;
  }
  for (let x = 0; x < W; x++) {
    tiles[0][x] = Tile.Wall;
    tiles[H - 1][x] = Tile.Wall;
  }

  // Scatter destructible walls in corridors
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      if (tiles[y][x] === Tile.Floor && rand() < 0.04) {
        tiles[y][x] = Tile.WallDestructible;
      }
    }
  }

  // Place doors between rooms (on corridor tiles adjacent to walls)
  let doorsPlaced = 0;
  for (let y = 2; y < H - 2 && doorsPlaced < 4 + level; y++) {
    for (let x = 2; x < W - 2 && doorsPlaced < 4 + level; x++) {
      if (tiles[y][x] === Tile.Floor) {
        const horizDoor = tiles[y][x - 1] === Tile.Wall && tiles[y][x + 1] === Tile.Wall
          && tiles[y - 1][x] === Tile.Floor && tiles[y + 1][x] === Tile.Floor;
        const vertDoor = tiles[y - 1][x] === Tile.Wall && tiles[y + 1][x] === Tile.Wall
          && tiles[y][x - 1] === Tile.Floor && tiles[y][x + 1] === Tile.Floor;
        if ((horizDoor || vertDoor) && rand() < 0.3) {
          tiles[y][x] = Tile.Door;
          doorsPlaced++;
        }
      }
    }
  }

  // Player start in first room
  const startRoom = rooms[0];
  const playerStart = {
    x: Math.floor(startRoom.x + startRoom.w / 2),
    y: Math.floor(startRoom.y + startRoom.h / 2),
  };

  // Exit in last room
  const exitRoom = rooms[rooms.length - 1];
  const exitX = Math.floor(exitRoom.x + exitRoom.w / 2);
  const exitY = Math.floor(exitRoom.y + exitRoom.h / 2);
  tiles[exitY][exitX] = Tile.Exit;

  // Place entities
  const entities: DungeonDef['entities'] = [];

  function placeInRoom(room: Rect, kind: EntityKind) {
    for (let attempts = 0; attempts < 20; attempts++) {
      const ex = room.x + 1 + Math.floor(rand() * (room.w - 2));
      const ey = room.y + 1 + Math.floor(rand() * (room.h - 2));
      if (tiles[ey][ex] === Tile.Floor
        && !(ex === playerStart.x && ey === playerStart.y)
        && !(ex === exitX && ey === exitY)) {
        entities.push({ kind, x: ex, y: ey });
        return;
      }
    }
  }

  // Spawners (skip first room)
  for (let i = 1; i < rooms.length; i++) {
    if (rand() < 0.6 + level * 0.05) {
      placeInRoom(rooms[i], EntityKind.Spawner);
    }
  }

  // Enemies
  const enemyTypes = [EntityKind.Ghost, EntityKind.Demon, EntityKind.Sorcerer];
  const numEnemies = 10 + level * 4;
  for (let i = 0; i < numEnemies; i++) {
    const room = rooms[1 + Math.floor(rand() * (rooms.length - 1))];
    placeInRoom(room, enemyTypes[Math.floor(rand() * enemyTypes.length)]);
  }

  // Death enemies on higher levels
  if (level >= 3) {
    const numDeaths = Math.floor((level - 2) * 1.5);
    for (let i = 0; i < numDeaths; i++) {
      const room = rooms[1 + Math.floor(rand() * (rooms.length - 1))];
      placeInRoom(room, EntityKind.Death);
    }
  }

  // Items
  for (let i = 0; i < rooms.length; i++) {
    if (rand() < 0.5) placeInRoom(rooms[i], EntityKind.Food);
    if (rand() < 0.6) placeInRoom(rooms[i], EntityKind.Treasure);
    if (rand() < 0.3) placeInRoom(rooms[i], EntityKind.Key);
    if (rand() < 0.2) placeInRoom(rooms[i], EntityKind.Potion);
  }

  return { width: W, height: H, tiles, entities, playerStart };
}

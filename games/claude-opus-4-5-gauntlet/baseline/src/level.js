import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, TILE, COLORS } from './constants.js';
import { Spawner } from './enemies.js';

export class Level {
  constructor(levelNumber) {
    this.levelNumber = levelNumber;
    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
    this.tiles = [];
    this.spawners = [];
    this.playerStart = { x: 1, y: 1 };

    this.generate();
  }

  generate() {
    // Initialize with walls
    this.tiles = Array(this.height).fill(null).map(() =>
      Array(this.width).fill(TILE.WALL)
    );

    // Generate maze using recursive backtracking
    this.generateMaze();

    // Add rooms
    this.addRooms();

    // Place items and entities
    this.placeItems();

    // Place spawners
    this.placeSpawners();

    // Place exit
    this.placeExit();

    // Make sure player start is clear
    this.setTile(1, 1, TILE.FLOOR);
    this.setTile(2, 1, TILE.FLOOR);
    this.setTile(1, 2, TILE.FLOOR);
    this.playerStart = { x: 1, y: 1 };
  }

  generateMaze() {
    const visited = Array(this.height).fill(null).map(() =>
      Array(this.width).fill(false)
    );

    const stack = [];
    const startX = 1;
    const startY = 1;

    visited[startY][startX] = true;
    this.tiles[startY][startX] = TILE.FLOOR;
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y, visited);

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }

      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Carve passage
      const midX = current.x + (next.x - current.x) / 2;
      const midY = current.y + (next.y - current.y) / 2;

      this.tiles[midY][midX] = TILE.FLOOR;
      this.tiles[next.y][next.x] = TILE.FLOOR;

      visited[next.y][next.x] = true;
      stack.push({ x: next.x, y: next.y });
    }
  }

  getUnvisitedNeighbors(x, y, visited) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 }
    ];

    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1) {
        if (!visited[ny][nx]) {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }

    return neighbors;
  }

  addRooms() {
    // Add some rectangular rooms
    const numRooms = 2 + Math.floor(this.levelNumber / 2);

    for (let i = 0; i < numRooms; i++) {
      const roomWidth = 3 + Math.floor(Math.random() * 3);
      const roomHeight = 3 + Math.floor(Math.random() * 3);
      const roomX = 2 + Math.floor(Math.random() * (this.width - roomWidth - 4));
      const roomY = 2 + Math.floor(Math.random() * (this.height - roomHeight - 4));

      // Carve room
      for (let y = roomY; y < roomY + roomHeight && y < this.height - 1; y++) {
        for (let x = roomX; x < roomX + roomWidth && x < this.width - 1; x++) {
          this.tiles[y][x] = TILE.FLOOR;
        }
      }
    }
  }

  placeItems() {
    const itemCount = {
      [TILE.FOOD]: 3 + this.levelNumber,
      [TILE.KEY]: 2 + Math.floor(this.levelNumber / 2),
      [TILE.TREASURE]: 4 + this.levelNumber,
      [TILE.POTION]: 1 + Math.floor(this.levelNumber / 3),
      [TILE.DOOR]: 2 + Math.floor(this.levelNumber / 2)
    };

    for (const [itemType, count] of Object.entries(itemCount)) {
      for (let i = 0; i < count; i++) {
        this.placeItemRandomly(parseInt(itemType));
      }
    }
  }

  placeItemRandomly(itemType) {
    let attempts = 100;
    while (attempts > 0) {
      const x = 1 + Math.floor(Math.random() * (this.width - 2));
      const y = 1 + Math.floor(Math.random() * (this.height - 2));

      if (this.tiles[y][x] === TILE.FLOOR && !(x <= 2 && y <= 2)) {
        this.tiles[y][x] = itemType;
        return;
      }
      attempts--;
    }
  }

  placeSpawners() {
    const spawnerCount = 2 + this.levelNumber;
    const enemyTypes = ['ghost', 'grunt', 'demon', 'sorcerer'];

    for (let i = 0; i < spawnerCount; i++) {
      let attempts = 100;
      while (attempts > 0) {
        const x = 3 + Math.floor(Math.random() * (this.width - 6));
        const y = 3 + Math.floor(Math.random() * (this.height - 6));

        if (this.tiles[y][x] === TILE.FLOOR && this.isValidSpawnerLocation(x, y)) {
          this.tiles[y][x] = TILE.SPAWNER;

          // Choose enemy type based on level
          let typeIndex = Math.floor(Math.random() * Math.min(enemyTypes.length, 1 + this.levelNumber));
          const spawner = new Spawner(x, y, enemyTypes[typeIndex]);
          this.spawners.push(spawner);
          break;
        }
        attempts--;
      }
    }
  }

  isValidSpawnerLocation(x, y) {
    // Check if there's floor space around for spawning
    const adjacent = [
      this.getTile(x + 1, y),
      this.getTile(x - 1, y),
      this.getTile(x, y + 1),
      this.getTile(x, y - 1)
    ];

    return adjacent.filter(t => t === TILE.FLOOR).length >= 2;
  }

  placeExit() {
    // Place exit far from player start
    let bestX = this.width - 2;
    let bestY = this.height - 2;
    let bestDist = 0;

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.tiles[y][x] === TILE.FLOOR) {
          const dist = Math.abs(x - 1) + Math.abs(y - 1);
          if (dist > bestDist) {
            bestDist = dist;
            bestX = x;
            bestY = y;
          }
        }
      }
    }

    this.tiles[bestY][bestX] = TILE.EXIT;
  }

  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return TILE.WALL;
    }
    return this.tiles[y][x];
  }

  setTile(x, y, type) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = type;
    }
  }

  draw(ctx) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        switch (tile) {
          case TILE.FLOOR:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            break;

          case TILE.WALL:
            ctx.fillStyle = COLORS.WALL;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = COLORS.WALL_BORDER;
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            break;

          case TILE.DOOR:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = COLORS.DOOR;
            ctx.fillRect(px + 4, py + 2, TILE_SIZE - 8, TILE_SIZE - 4);
            ctx.fillStyle = COLORS.KEY;
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE - 10, py + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            break;

          case TILE.EXIT:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Animated exit
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
            ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            break;

          case TILE.FOOD:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Draw food (meat)
            ctx.fillStyle = COLORS.FOOD;
            ctx.beginPath();
            ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 10, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 6, py + TILE_SIZE / 2 - 2, 4, 4);
            break;

          case TILE.KEY:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Draw key
            ctx.fillStyle = COLORS.KEY;
            ctx.beginPath();
            ctx.arc(px + 10, py + TILE_SIZE / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(px + 14, py + TILE_SIZE / 2 - 2, 10, 4);
            ctx.fillRect(px + 20, py + TILE_SIZE / 2 - 4, 2, 8);
            break;

          case TILE.TREASURE:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Draw treasure chest
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(px + 6, py + 10, TILE_SIZE - 12, TILE_SIZE - 14);
            ctx.fillStyle = COLORS.TREASURE;
            ctx.fillRect(px + 12, py + 14, 8, 6);
            break;

          case TILE.POTION:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Draw potion bottle
            ctx.fillStyle = COLORS.POTION;
            ctx.fillRect(px + 12, py + 6, 8, 6);
            ctx.beginPath();
            ctx.moveTo(px + 10, py + 12);
            ctx.lineTo(px + 22, py + 12);
            ctx.lineTo(px + 24, py + 26);
            ctx.lineTo(px + 8, py + 26);
            ctx.closePath();
            ctx.fill();
            break;

          case TILE.SPAWNER:
            ctx.fillStyle = COLORS.FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Spawners are drawn by the spawner objects
            break;
        }
      }
    }
  }
}

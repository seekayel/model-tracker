import { MAP_WIDTH, MAP_HEIGHT, TerrainType, TERRAIN_DATA } from './constants.js';

// ── Simple value noise ────────────────────────────────────────────────────────
function valueNoise(seed) {
  // LCG-based pseudo-random using seed
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Smooth noise by sampling at multiple octaves
function generateHeightMap(width, height, seed) {
  const rand = valueNoise(seed);
  // Build a grid of random values
  const gw = width + 2, gh = height + 2;
  const grid = [];
  for (let i = 0; i < gh; i++) {
    grid[i] = [];
    for (let j = 0; j < gw; j++) grid[i][j] = rand();
  }

  function sample(gx, gy) {
    const ix = Math.floor(gx), iy = Math.floor(gy);
    const fx = gx - ix, fy = gy - iy;
    // Smooth step
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = grid[iy % gh][ix % gw];
    const b = grid[iy % gh][(ix + 1) % gw];
    const c = grid[(iy + 1) % gh][ix % gw];
    const d = grid[(iy + 1) % gh][(ix + 1) % gw];
    return a + ux * (b - a) + uy * (c - a) + ux * uy * (a - b - c + d);
  }

  const map = [];
  for (let y = 0; y < height; y++) {
    map[y] = [];
    for (let x = 0; x < width; x++) {
      let val = 0, amp = 1, freq = 1, max = 0;
      // 4 octaves
      for (let o = 0; o < 4; o++) {
        val += sample(x * freq / width * 3, y * freq / height * 3) * amp;
        max += amp;
        amp *= 0.5;
        freq *= 2;
      }
      map[y][x] = val / max;
    }
  }
  return map;
}

// ── Map class ─────────────────────────────────────────────────────────────────
export class GameMap {
  constructor(seed) {
    this.width  = MAP_WIDTH;
    this.height = MAP_HEIGHT;
    this.tiles  = [];
    this._generate(seed ?? Math.random() * 99999 | 0);
  }

  _generate(seed) {
    const heightMap   = generateHeightMap(this.width, this.height, seed);
    const humidityMap = generateHeightMap(this.width, this.height, seed + 7777);

    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        const h = heightMap[y][x];
        const humidity = humidityMap[y][x];

        // Edge bias: force ocean at map edges to frame the landmass
        const edgeDist = Math.min(x, this.width - 1 - x, y, this.height - 1 - y);
        const edgeFactor = Math.min(1, edgeDist / 3);
        const eff = h * edgeFactor;

        let terrain;
        if (eff < 0.28) {
          terrain = TerrainType.OCEAN;
        } else if (eff < 0.35) {
          terrain = TerrainType.GRASSLAND;  // coastal lowlands
        } else if (eff < 0.50) {
          if (humidity > 0.55) terrain = TerrainType.FOREST;
          else if (humidity < 0.35) terrain = TerrainType.DESERT;
          else terrain = TerrainType.PLAINS;
        } else if (eff < 0.65) {
          if (humidity > 0.55) terrain = TerrainType.FOREST;
          else terrain = TerrainType.HILLS;
        } else {
          terrain = TerrainType.MOUNTAINS;
        }

        this.tiles[y][x] = {
          type:        terrain,
          improvement: null,   // 'farm' | 'mine' | 'road'
          x, y,
        };
      }
    }

    this._smoothOceans();
  }

  // Remove isolated ocean tiles surrounded by land (and vice-versa) — reduces noise
  _smoothOceans() {
    const isOcean = (x, y) => {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
      return this.tiles[y][x].type === TerrainType.OCEAN;
    };

    for (let iter = 0; iter < 2; iter++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const tile = this.tiles[y][x];
          const neighbors = [
            isOcean(x-1, y), isOcean(x+1, y),
            isOcean(x, y-1), isOcean(x, y+1),
          ];
          const oceanCount = neighbors.filter(Boolean).length;

          if (tile.type === TerrainType.OCEAN && oceanCount <= 1) {
            tile.type = TerrainType.GRASSLAND;
          } else if (tile.type !== TerrainType.OCEAN && oceanCount === 4) {
            tile.type = TerrainType.OCEAN;
          }
        }
      }
    }
  }

  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.tiles[y][x];
  }

  isPassable(x, y) {
    const t = this.getTile(x, y);
    if (!t) return false;
    return TERRAIN_DATA[t.type].passable;
  }

  getYields(x, y) {
    const t = this.getTile(x, y);
    if (!t) return { food: 0, prod: 0, gold: 0 };
    const base = { ...TERRAIN_DATA[t.type].yields };
    // Improvements
    if (t.improvement === 'farm')  base.food += 1;
    if (t.improvement === 'mine')  base.prod += 1;
    return base;
  }

  // Find a good land start position in the left third of the map
  findStartPos(side = 'left', excludeRegions = []) {
    const candidates = [];
    for (let y = 2; y < this.height - 2; y++) {
      const xStart = side === 'left' ? 1 : Math.floor(this.width * 0.55);
      const xEnd   = side === 'left' ? Math.floor(this.width * 0.35) : this.width - 2;
      for (let x = xStart; x < xEnd; x++) {
        const t = this.getTile(x, y);
        if (!t || !TERRAIN_DATA[t.type].passable) continue;

        // Avoid being too close to other starts
        let tooClose = false;
        for (const [ex, ey] of excludeRegions) {
          if (Math.abs(x - ex) < 6 && Math.abs(y - ey) < 6) { tooClose = true; break; }
        }
        if (tooClose) continue;

        // Score: prefer grassland/plains with adjacent land
        let score = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nt = this.getTile(x + dx, y + dy);
            if (nt && TERRAIN_DATA[nt.type].passable) score++;
          }
        }
        candidates.push({ x, y, score });
      }
    }
    if (!candidates.length) {
      // Fallback
      return side === 'left' ? { x: 3, y: Math.floor(this.height / 2) }
                             : { x: this.width - 4, y: Math.floor(this.height / 2) };
    }
    candidates.sort((a, b) => b.score - a.score);
    // Pick from top 5 randomly for variety
    const top = candidates.slice(0, Math.min(5, candidates.length));
    return top[Math.floor(Math.random() * top.length)];
  }

  // BFS reachable cells within `moves` steps
  reachable(x, y, moves, occupiedByEnemy = () => false) {
    const visited = new Map();
    const queue = [{ x, y, mp: moves }];
    visited.set(`${x},${y}`, moves);
    const result = [];

    while (queue.length) {
      const { x: cx, y: cy, mp } = queue.shift();
      if (mp === 0) continue;

      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = cx + dx, ny = cy + dy;
        const key = `${nx},${ny}`;
        if (!this.isPassable(nx, ny)) continue;
        if (visited.has(key) && visited.get(key) >= mp - 1) continue;
        visited.set(key, mp - 1);
        result.push({ x: nx, y: ny });
        if (!occupiedByEnemy(nx, ny)) queue.push({ x: nx, y: ny, mp: mp - 1 });
      }
    }
    return result;
  }

  // BFS path-finding (returns array of steps or null)
  findPath(sx, sy, tx, ty, maxSteps = 20) {
    if (sx === tx && sy === ty) return [];
    const key = (x, y) => `${x},${y}`;
    const visited = new Set([key(sx, sy)]);
    const queue = [{ x: sx, y: sy, path: [] }];

    while (queue.length) {
      const { x, y, path } = queue.shift();
      if (path.length >= maxSteps) continue;

      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = x + dx, ny = y + dy;
        const nk = key(nx, ny);
        if (visited.has(nk)) continue;
        if (!this.isPassable(nx, ny)) continue;
        visited.add(nk);
        const newPath = [...path, { x: nx, y: ny }];
        if (nx === tx && ny === ty) return newPath;
        queue.push({ x: nx, y: ny, path: newPath });
      }
    }
    return null;
  }
}

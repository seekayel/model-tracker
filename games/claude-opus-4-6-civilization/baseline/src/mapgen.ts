import { Terrain, Tile, MAP_WIDTH, MAP_HEIGHT, NUM_PLAYERS } from './types';

// Simple seeded RNG
class RNG {
  private s: number;
  constructor(seed: number) { this.s = seed; }
  next(): number {
    this.s = (this.s * 16807 + 0) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

function smoothNoise(rng: RNG, w: number, h: number, octaves: number): number[][] {
  const noise: number[][] = Array.from({ length: h }, () => Array(w).fill(0));
  // Base noise
  const base: number[][] = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => rng.next())
  );

  for (let oct = 0; oct < octaves; oct++) {
    const scale = 1 << oct;
    const weight = 1 / (1 << (octaves - oct - 1));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Sample at reduced resolution and interpolate
        const sx = x / scale;
        const sy = y / scale;
        const x0 = Math.floor(sx) % w;
        const x1 = (x0 + 1) % w;
        const y0 = Math.floor(sy) % h;
        const y1 = (y0 + 1) % h;
        const fx = sx - Math.floor(sx);
        const fy = sy - Math.floor(sy);
        const v00 = base[(y0 * scale) % h][(x0 * scale) % w];
        const v10 = base[(y0 * scale) % h][(x1 * scale) % w];
        const v01 = base[(y1 * scale) % h][(x0 * scale) % w];
        const v11 = base[(y1 * scale) % h][(x1 * scale) % w];
        const top = v00 * (1 - fx) + v10 * fx;
        const bot = v01 * (1 - fx) + v11 * fx;
        noise[y][x] += (top * (1 - fy) + bot * fy) * weight;
      }
    }
  }

  // Normalize
  let min = Infinity, max = -Infinity;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      min = Math.min(min, noise[y][x]);
      max = Math.max(max, noise[y][x]);
    }
  }
  const range = max - min || 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      noise[y][x] = (noise[y][x] - min) / range;
    }
  }
  return noise;
}

function elevationToTerrain(e: number, moisture: number): Terrain {
  if (e < 0.25) return Terrain.Ocean;
  if (e < 0.32) return Terrain.Coast;
  if (e > 0.85) return Terrain.Mountain;
  if (e > 0.72) return Terrain.Hills;
  if (moisture < 0.3) return Terrain.Desert;
  if (moisture < 0.5) return Terrain.Plains;
  if (moisture > 0.7) return Terrain.Forest;
  return Terrain.Grassland;
}

export function generateMap(seed?: number): Tile[][] {
  const rng = new RNG(seed ?? Math.floor(Math.random() * 999999));
  const elevation = smoothNoise(rng, MAP_WIDTH, MAP_HEIGHT, 4);
  const moisture = smoothNoise(rng, MAP_WIDTH, MAP_HEIGHT, 3);

  // Create island shape: lower edges
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const dx = (x / MAP_WIDTH - 0.5) * 2;
      const dy = (y / MAP_HEIGHT - 0.5) * 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      elevation[y][x] = elevation[y][x] * (1 - dist * 0.7);
    }
  }

  // Re-normalize
  let min = Infinity, max = -Infinity;
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      min = Math.min(min, elevation[y][x]);
      max = Math.max(max, elevation[y][x]);
    }
  }
  const range = max - min || 1;
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      elevation[y][x] = (elevation[y][x] - min) / range;
    }
  }

  const tiles: Tile[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      tiles[y][x] = {
        terrain: elevationToTerrain(elevation[y][x], moisture[y][x]),
        x,
        y,
        visible: Array(NUM_PLAYERS).fill(false),
        explored: Array(NUM_PLAYERS).fill(false),
      };
    }
  }
  return tiles;
}

/** Find valid land positions spaced apart from each other */
export function findStartPositions(tiles: Tile[][], count: number): { x: number; y: number }[] {
  const landTiles: { x: number; y: number }[] = [];
  for (let y = 2; y < MAP_HEIGHT - 2; y++) {
    for (let x = 2; x < MAP_WIDTH - 2; x++) {
      const t = tiles[y][x].terrain;
      if (t !== Terrain.Ocean && t !== Terrain.Coast && t !== Terrain.Mountain) {
        landTiles.push({ x, y });
      }
    }
  }

  const positions: { x: number; y: number }[] = [];
  const minDist = Math.min(MAP_WIDTH, MAP_HEIGHT) / 3;

  // Shuffle land tiles
  for (let i = landTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [landTiles[i], landTiles[j]] = [landTiles[j], landTiles[i]];
  }

  for (const pos of landTiles) {
    if (positions.length >= count) break;
    const tooClose = positions.some(p => {
      const dx = p.x - pos.x;
      const dy = p.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < minDist;
    });
    if (!tooClose) {
      positions.push(pos);
    }
  }

  // Fallback: if not enough spaced positions, just pick random land tiles
  while (positions.length < count && landTiles.length > 0) {
    const pos = landTiles[positions.length % landTiles.length];
    positions.push(pos);
  }

  return positions;
}

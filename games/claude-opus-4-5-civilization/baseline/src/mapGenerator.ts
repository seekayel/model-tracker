import { Tile, TerrainType, ResourceType } from './types';

// Simple noise function for terrain generation
function noise2D(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise with interpolation
function smoothNoise(x: number, y: number, seed: number, scale: number): number {
  const sx = x / scale;
  const sy = y / scale;

  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const fx = sx - x0;
  const fy = sy - y0;

  // Smoothstep interpolation
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);

  const n00 = noise2D(x0, y0, seed);
  const n10 = noise2D(x1, y0, seed);
  const n01 = noise2D(x0, y1, seed);
  const n11 = noise2D(x1, y1, seed);

  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;

  return nx0 * (1 - v) + nx1 * v;
}

// Multi-octave noise
function fractalNoise(x: number, y: number, seed: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, seed + i * 1000, 8);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

export function generateMap(width: number, height: number): Tile[][] {
  const seed = Math.random() * 10000;
  const seed2 = Math.random() * 10000;
  const map: Tile[][] = [];

  // Generate height map and moisture map
  for (let y = 0; y < height; y++) {
    map[y] = [];
    for (let x = 0; x < width; x++) {
      // Height value (0-1)
      let heightValue = fractalNoise(x, y, seed, 4);

      // Make edges more likely to be water
      const edgeDistX = Math.min(x, width - 1 - x) / (width / 4);
      const edgeDistY = Math.min(y, height - 1 - y) / (height / 4);
      const edgeFactor = Math.min(1, Math.min(edgeDistX, edgeDistY));
      heightValue = heightValue * (0.3 + 0.7 * edgeFactor);

      // Moisture value for biome selection
      const moisture = fractalNoise(x, y, seed2, 3);

      // Determine terrain based on height and moisture
      let terrain: TerrainType;

      if (heightValue < 0.3) {
        terrain = TerrainType.Ocean;
      } else if (heightValue < 0.35) {
        terrain = TerrainType.Coast;
      } else if (heightValue > 0.85) {
        terrain = TerrainType.Mountain;
      } else if (heightValue > 0.7) {
        terrain = TerrainType.Hills;
      } else {
        // Use moisture to determine biome
        if (moisture < 0.25) {
          terrain = TerrainType.Desert;
        } else if (moisture < 0.4) {
          terrain = TerrainType.Plains;
        } else if (moisture < 0.65) {
          terrain = TerrainType.Grassland;
        } else if (moisture < 0.85) {
          terrain = TerrainType.Forest;
        } else {
          terrain = heightValue < 0.5 ? TerrainType.Tundra : TerrainType.Forest;
        }
      }

      // Add some randomness to break up uniform areas
      if (Math.random() < 0.1 && terrain !== TerrainType.Ocean && terrain !== TerrainType.Mountain) {
        const terrainOptions = [TerrainType.Plains, TerrainType.Grassland, TerrainType.Forest];
        terrain = terrainOptions[Math.floor(Math.random() * terrainOptions.length)];
      }

      // Generate resources
      let resource = ResourceType.None;
      if (Math.random() < 0.08) {
        if (terrain === TerrainType.Ocean || terrain === TerrainType.Coast) {
          resource = ResourceType.Fish;
        } else if (terrain === TerrainType.Hills || terrain === TerrainType.Mountain) {
          resource = Math.random() < 0.5 ? ResourceType.Iron : ResourceType.Gold;
        } else if (terrain === TerrainType.Grassland || terrain === TerrainType.Plains) {
          resource = Math.random() < 0.6 ? ResourceType.Wheat : ResourceType.Horses;
        } else if (terrain === TerrainType.Desert) {
          resource = ResourceType.Gems;
        }
      }

      map[y][x] = {
        x,
        y,
        terrain,
        resource,
        explored: false,
        visible: false,
        owner: null
      };
    }
  }

  return map;
}

// Find a valid starting position for a player
export function findStartPosition(
  map: Tile[][],
  existingPositions: { x: number; y: number }[],
  minDistance: number = 10
): { x: number; y: number } | null {
  const height = map.length;
  const width = map[0].length;

  // Try to find a good spot
  for (let attempts = 0; attempts < 1000; attempts++) {
    const x = Math.floor(Math.random() * (width - 10)) + 5;
    const y = Math.floor(Math.random() * (height - 10)) + 5;

    const tile = map[y][x];

    // Must be passable land
    if (tile.terrain === TerrainType.Ocean ||
        tile.terrain === TerrainType.Mountain ||
        tile.terrain === TerrainType.Coast) {
      continue;
    }

    // Check distance from existing positions
    let tooClose = false;
    for (const pos of existingPositions) {
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < minDistance) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      // Check that there's some good land nearby
      let goodTiles = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nearTile = map[ny][nx];
            if (nearTile.terrain === TerrainType.Grassland ||
                nearTile.terrain === TerrainType.Plains) {
              goodTiles++;
            }
          }
        }
      }

      if (goodTiles >= 5) {
        return { x, y };
      }
    }
  }

  // Fallback: just find any valid land tile
  for (let y = 5; y < height - 5; y++) {
    for (let x = 5; x < width - 5; x++) {
      const tile = map[y][x];
      if (tile.terrain !== TerrainType.Ocean &&
          tile.terrain !== TerrainType.Mountain &&
          tile.terrain !== TerrainType.Coast) {
        return { x, y };
      }
    }
  }

  return null;
}

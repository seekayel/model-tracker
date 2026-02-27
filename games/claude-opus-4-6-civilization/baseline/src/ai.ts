import {
  GameState, UnitType, Terrain, UNIT_DEFS, TERRAIN_MOVE_COST,
  MAP_WIDTH, MAP_HEIGHT,
} from './types';
import { moveUnit, foundCity, setProduction, endTurn, getUnitsAt, getCityAt } from './game';

export function runAI(state: GameState): void {
  const playerId = state.currentPlayer;
  const player = state.players[playerId];
  if (player.isHuman || !player.alive) {
    return;
  }

  const myUnits = state.units.filter(u => u.owner === playerId);
  const myCities = state.cities.filter(c => c.owner === playerId);
  const enemyCities = state.cities.filter(c => c.owner !== playerId);
  const enemyUnits = state.units.filter(u => u.owner !== playerId);

  // Process each unit
  for (const unit of myUnits) {
    if (unit.movesLeft <= 0) continue;

    const def = UNIT_DEFS[unit.type];

    if (unit.type === UnitType.Settler) {
      aiSettlerBehavior(state, unit, myCities);
    } else if (unit.type === UnitType.Scout) {
      aiScoutBehavior(state, unit);
    } else {
      aiMilitaryBehavior(state, unit, enemyUnits, enemyCities, myCities);
    }
  }

  // City production
  for (const city of myCities) {
    if (!city.producing) {
      aiSetCityProduction(state, city, myCities, myUnits);
    }
  }

  endTurn(state);
}

function aiSettlerBehavior(state: GameState, unit: any, myCities: any[]): void {
  // If no cities or far from existing cities, try to settle
  const nearbyCity = myCities.some(c => {
    const dist = Math.abs(c.x - unit.x) + Math.abs(c.y - unit.y);
    return dist < 5;
  });

  if (myCities.length === 0 || !nearbyCity) {
    // Check if current tile is good for settling
    const tile = state.tiles[unit.y][unit.x];
    if (tile.terrain !== Terrain.Ocean && tile.terrain !== Terrain.Coast &&
        tile.terrain !== Terrain.Mountain && tile.terrain !== Terrain.Desert) {
      const existingCity = getCityAt(state, unit.x, unit.y);
      if (!existingCity) {
        foundCity(state, unit);
        return;
      }
    }
  }

  // Move towards unexplored/good land
  aiMoveTowardGoodLand(state, unit, myCities);
}

function aiScoutBehavior(state: GameState, unit: any): void {
  // Move semi-randomly exploring
  const dirs = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
    { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
  ];

  // Prefer unexplored directions
  let best = dirs[0];
  let bestScore = -Infinity;
  const playerId = unit.owner;

  for (const dir of dirs) {
    const nx = unit.x + dir.dx;
    const ny = unit.y + dir.dy;
    if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;
    const tile = state.tiles[ny][nx];
    if (TERRAIN_MOVE_COST[tile.terrain] >= 99) continue;

    let score = 0;
    // Count unexplored tiles in that direction
    for (let r = 1; r <= 3; r++) {
      const rx = unit.x + dir.dx * r;
      const ry = unit.y + dir.dy * r;
      if (rx >= 0 && rx < MAP_WIDTH && ry >= 0 && ry < MAP_HEIGHT) {
        if (!state.tiles[ry][rx].explored[playerId]) score += 3;
      }
    }
    score += Math.random() * 2; // Some randomness
    if (score > bestScore) {
      bestScore = score;
      best = dir;
    }
  }

  while (unit.movesLeft > 0) {
    if (!moveUnit(state, unit, best.dx, best.dy)) break;
  }
}

function aiMilitaryBehavior(
  state: GameState, unit: any,
  enemyUnits: any[], enemyCities: any[], myCities: any[]
): void {
  // Find nearest enemy
  let nearestEnemy: { x: number; y: number; dist: number } | null = null;

  for (const e of enemyUnits) {
    if (!state.tiles[e.y][e.x].visible[unit.owner]) continue;
    const dist = Math.abs(e.x - unit.x) + Math.abs(e.y - unit.y);
    if (!nearestEnemy || dist < nearestEnemy.dist) {
      nearestEnemy = { x: e.x, y: e.y, dist };
    }
  }

  for (const c of enemyCities) {
    if (!state.tiles[c.y][c.x].visible[unit.owner]) continue;
    const dist = Math.abs(c.x - unit.x) + Math.abs(c.y - unit.y);
    if (!nearestEnemy || dist < nearestEnemy.dist) {
      nearestEnemy = { x: c.x, y: c.y, dist };
    }
  }

  if (nearestEnemy && nearestEnemy.dist <= 10) {
    // Move toward enemy
    while (unit.movesLeft > 0) {
      const dx = Math.sign(nearestEnemy.x - unit.x);
      const dy = Math.sign(nearestEnemy.y - unit.y);
      if (dx === 0 && dy === 0) break;
      // Try dx first, then dy, then both
      if (dx !== 0 && moveUnit(state, unit, dx, 0)) continue;
      if (dy !== 0 && moveUnit(state, unit, 0, dy)) continue;
      break;
    }
  } else if (myCities.length > 0) {
    // Patrol around own cities
    const city = myCities[Math.floor(Math.random() * myCities.length)];
    const dist = Math.abs(city.x - unit.x) + Math.abs(city.y - unit.y);
    if (dist > 5) {
      // Move toward city
      while (unit.movesLeft > 0) {
        const dx = Math.sign(city.x - unit.x);
        const dy = Math.sign(city.y - unit.y);
        if (dx === 0 && dy === 0) break;
        if (!moveUnit(state, unit, dx, 0) && !moveUnit(state, unit, 0, dy)) break;
      }
    } else {
      // Random patrol
      const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      moveUnit(state, unit, dir.dx, dir.dy);
    }
  }
}

function aiMoveTowardGoodLand(state: GameState, unit: any, myCities: any[]): void {
  // Move away from existing cities toward good land
  const dirs = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
  ];

  let best = dirs[Math.floor(Math.random() * dirs.length)];
  let bestScore = -Infinity;

  for (const dir of dirs) {
    const nx = unit.x + dir.dx;
    const ny = unit.y + dir.dy;
    if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;
    const tile = state.tiles[ny][nx];
    if (TERRAIN_MOVE_COST[tile.terrain] >= 99) continue;

    let score = 0;
    // Prefer tiles away from existing cities
    for (const city of myCities) {
      score += Math.abs(nx - city.x) + Math.abs(ny - city.y);
    }
    // Prefer good terrain
    if (tile.terrain === Terrain.Grassland) score += 5;
    if (tile.terrain === Terrain.Plains) score += 3;
    score += Math.random() * 3;

    if (score > bestScore) {
      bestScore = score;
      best = dir;
    }
  }

  while (unit.movesLeft > 0) {
    if (!moveUnit(state, unit, best.dx, best.dy)) break;
  }
}

function aiSetCityProduction(state: GameState, city: any, myCities: any[], myUnits: any[]): void {
  const militaryUnits = myUnits.filter(u =>
    u.type !== UnitType.Settler && u.type !== UnitType.Scout
  );
  const settlers = myUnits.filter(u => u.type === UnitType.Settler);

  // Need more military if few
  if (militaryUnits.length < myCities.length * 2) {
    // Build military
    const options = [UnitType.Warrior, UnitType.Archer, UnitType.Swordsman];
    const pick = options[Math.floor(Math.random() * options.length)];
    setProduction(city, pick);
  } else if (myCities.length < 4 && settlers.length === 0) {
    // Need more cities
    setProduction(city, UnitType.Settler);
  } else {
    // Build something random
    const options = [UnitType.Warrior, UnitType.Archer, UnitType.Horseman, UnitType.Swordsman];
    setProduction(city, options[Math.floor(Math.random() * options.length)]);
  }
}

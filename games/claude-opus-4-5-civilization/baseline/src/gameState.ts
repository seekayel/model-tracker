import {
  GameState,
  Player,
  Unit,
  City,
  Tile,
  UnitType,
  UNIT_STATS,
  TERRAIN_INFO,
  TECHNOLOGIES,
  BUILDINGS,
  TerrainType
} from './types';
import { generateMap, findStartPosition } from './mapGenerator';

const CITY_NAMES = [
  'Rome', 'Athens', 'Babylon', 'Cairo', 'Delhi', 'Beijing',
  'Tokyo', 'Paris', 'London', 'Moscow', 'Berlin', 'Madrid',
  'Vienna', 'Prague', 'Warsaw', 'Stockholm', 'Oslo', 'Helsinki',
  'Dublin', 'Lisbon', 'Amsterdam', 'Brussels', 'Zurich', 'Milan'
];

let nextUnitId = 1;
let nextCityId = 1;
let usedCityNames: Set<string> = new Set();

export function createInitialGameState(): GameState {
  const mapWidth = 60;
  const mapHeight = 40;
  const map = generateMap(mapWidth, mapHeight);

  // Reset IDs and names
  nextUnitId = 1;
  nextCityId = 1;
  usedCityNames = new Set();

  // Create players
  const players: Player[] = [
    {
      id: 0,
      name: 'Your Empire',
      color: '#e94560',
      isHuman: true,
      gold: 50,
      science: 0,
      researchedTechs: [],
      currentResearch: null,
      researchProgress: 0
    },
    {
      id: 1,
      name: 'AI Empire',
      color: '#3498db',
      isHuman: false,
      gold: 50,
      science: 0,
      researchedTechs: [],
      currentResearch: null,
      researchProgress: 0
    }
  ];

  // Find starting positions
  const startPositions: { x: number; y: number }[] = [];
  const units: Unit[] = [];

  for (const player of players) {
    const startPos = findStartPosition(map, startPositions, 15);
    if (startPos) {
      startPositions.push(startPos);

      // Create starting settler
      units.push(createUnit(UnitType.Settler, startPos.x, startPos.y, player.id));

      // Create starting warrior
      units.push(createUnit(UnitType.Warrior, startPos.x + 1, startPos.y, player.id));

      // Reveal area around starting position
      revealArea(map, startPos.x, startPos.y, 5, player.id === 0);
    }
  }

  return {
    turn: 1,
    currentPlayer: 0,
    players,
    map,
    units,
    cities: [],
    mapWidth,
    mapHeight,
    selectedUnit: null,
    selectedCity: null,
    moveMode: false,
    gameOver: false,
    winner: null
  };
}

export function createUnit(type: UnitType, x: number, y: number, owner: number): Unit {
  const stats = UNIT_STATS[type];
  return {
    id: nextUnitId++,
    type,
    x,
    y,
    owner,
    health: 100,
    maxHealth: 100,
    movementLeft: stats.movement,
    fortified: false
  };
}

export function createCity(name: string, x: number, y: number, owner: number): City {
  return {
    id: nextCityId++,
    name,
    x,
    y,
    owner,
    population: 1,
    food: 0,
    foodNeeded: 20,
    production: 0,
    buildings: [],
    currentProduction: null,
    productionProgress: 0
  };
}

export function getNextCityName(): string {
  for (const name of CITY_NAMES) {
    if (!usedCityNames.has(name)) {
      usedCityNames.add(name);
      return name;
    }
  }
  return `City ${nextCityId}`;
}

export function revealArea(map: Tile[][], centerX: number, centerY: number, radius: number, isHuman: boolean): void {
  const height = map.length;
  const width = map[0].length;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const y = centerY + dy;
        const x = centerX + dx;
        if (y >= 0 && y < height && x >= 0 && x < width) {
          if (isHuman) {
            map[y][x].explored = true;
            map[y][x].visible = true;
          }
        }
      }
    }
  }
}

export function updateVisibility(state: GameState): void {
  const humanPlayer = state.players.find(p => p.isHuman);
  if (!humanPlayer) return;

  // Reset visibility
  for (const row of state.map) {
    for (const tile of row) {
      tile.visible = false;
    }
  }

  // Reveal around units
  for (const unit of state.units) {
    if (unit.owner === humanPlayer.id) {
      revealArea(state.map, unit.x, unit.y, 3, true);
    }
  }

  // Reveal around cities
  for (const city of state.cities) {
    if (city.owner === humanPlayer.id) {
      revealArea(state.map, city.x, city.y, 4, true);
    }
  }
}

export function canMoveUnit(state: GameState, unit: Unit, targetX: number, targetY: number): boolean {
  if (unit.movementLeft <= 0) return false;

  const tile = state.map[targetY]?.[targetX];
  if (!tile) return false;

  const terrainInfo = TERRAIN_INFO[tile.terrain];
  if (!terrainInfo.passable) return false;

  // Check if occupied by enemy city
  const enemyCity = state.cities.find(c => c.x === targetX && c.y === targetY && c.owner !== unit.owner);
  if (enemyCity) return false; // Can't move directly into enemy city

  // Must be adjacent
  const dx = Math.abs(unit.x - targetX);
  const dy = Math.abs(unit.y - targetY);
  if (dx > 1 || dy > 1) return false;
  if (dx === 0 && dy === 0) return false;

  return true;
}

export function moveUnit(state: GameState, unit: Unit, targetX: number, targetY: number): void {
  const tile = state.map[targetY][targetX];
  const terrainInfo = TERRAIN_INFO[tile.terrain];

  // Check for enemy units at target
  const enemyUnit = state.units.find(
    u => u.x === targetX && u.y === targetY && u.owner !== unit.owner
  );

  if (enemyUnit) {
    // Combat!
    resolveCombat(state, unit, enemyUnit);
    unit.movementLeft = 0;
    return;
  }

  // Move the unit
  unit.x = targetX;
  unit.y = targetY;
  unit.movementLeft = Math.max(0, unit.movementLeft - terrainInfo.movementCost);
  unit.fortified = false;

  // Update visibility
  if (state.players[unit.owner].isHuman) {
    revealArea(state.map, targetX, targetY, 3, true);
  }
}

export function resolveCombat(state: GameState, attacker: Unit, defender: Unit): void {
  const attackerStats = UNIT_STATS[attacker.type];
  const defenderStats = UNIT_STATS[defender.type];

  // Get terrain defense bonus
  const defenderTile = state.map[defender.y][defender.x];
  let defenseBonus = 1;
  if (defenderTile.terrain === TerrainType.Hills || defenderTile.terrain === TerrainType.Forest) {
    defenseBonus = 1.5;
  }
  if (defender.fortified) {
    defenseBonus *= 1.25;
  }

  // City defense bonus
  const defenderCity = state.cities.find(c => c.x === defender.x && c.y === defender.y && c.owner === defender.owner);
  if (defenderCity) {
    defenseBonus *= 1.5;
    // Add building bonuses
    for (const buildingId of defenderCity.buildings) {
      const building = BUILDINGS[buildingId];
      if (building) {
        defenseBonus += building.defenseBonus * 0.1;
      }
    }
  }

  // Calculate damage
  const attackPower = attackerStats.attack * (attacker.health / 100);
  const defensePower = defenderStats.defense * defenseBonus * (defender.health / 100);

  const attackerDamage = Math.max(10, Math.floor(30 * (defensePower / (attackPower + 0.1)) * (0.8 + Math.random() * 0.4)));
  const defenderDamage = Math.max(10, Math.floor(30 * (attackPower / (defensePower + 0.1)) * (0.8 + Math.random() * 0.4)));

  attacker.health -= attackerDamage;
  defender.health -= defenderDamage;

  // Remove dead units
  if (attacker.health <= 0) {
    const idx = state.units.indexOf(attacker);
    if (idx >= 0) state.units.splice(idx, 1);
    if (state.selectedUnit === attacker) {
      state.selectedUnit = null;
    }
  }

  if (defender.health <= 0) {
    const idx = state.units.indexOf(defender);
    if (idx >= 0) state.units.splice(idx, 1);

    // If attacker survived and defender died, move to position
    if (attacker.health > 0) {
      attacker.x = defender.x;
      attacker.y = defender.y;

      // Capture city if present
      if (defenderCity) {
        defenderCity.owner = attacker.owner;
      }
    }
  }
}

export function foundCity(state: GameState, settler: Unit): City | null {
  // Check if valid location
  const tile = state.map[settler.y][settler.x];
  if (tile.terrain === TerrainType.Ocean ||
      tile.terrain === TerrainType.Mountain ||
      tile.terrain === TerrainType.Coast) {
    return null;
  }

  // Check if too close to another city
  for (const city of state.cities) {
    const dist = Math.sqrt((city.x - settler.x) ** 2 + (city.y - settler.y) ** 2);
    if (dist < 4) {
      return null;
    }
  }

  // Create city
  const name = getNextCityName();
  const city = createCity(name, settler.x, settler.y, settler.owner);
  state.cities.push(city);

  // Mark territory
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const ny = settler.y + dy;
      const nx = settler.x + dx;
      if (ny >= 0 && ny < state.mapHeight && nx >= 0 && nx < state.mapWidth) {
        if (Math.abs(dx) + Math.abs(dy) <= 3) {
          state.map[ny][nx].owner = settler.owner;
        }
      }
    }
  }

  // Remove settler
  const idx = state.units.indexOf(settler);
  if (idx >= 0) state.units.splice(idx, 1);
  if (state.selectedUnit === settler) {
    state.selectedUnit = null;
  }

  // Update visibility
  if (state.players[settler.owner].isHuman) {
    revealArea(state.map, city.x, city.y, 4, true);
  }

  return city;
}

export function getCityYields(state: GameState, city: City): { food: number; production: number; gold: number; science: number } {
  let food = 2; // Base
  let production = 1; // Base
  let gold = 0;
  let science = 1; // Base

  // Add from worked tiles (simplified: just count nearby tiles)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (Math.abs(dx) + Math.abs(dy) > 3) continue;

      const y = city.y + dy;
      const x = city.x + dx;
      if (y >= 0 && y < state.mapHeight && x >= 0 && x < state.mapWidth) {
        const tile = state.map[y][x];
        if (tile.owner === city.owner) {
          const terrainInfo = TERRAIN_INFO[tile.terrain];
          food += terrainInfo.food * 0.3;
          production += terrainInfo.production * 0.3;
          gold += terrainInfo.gold * 0.3;
        }
      }
    }
  }

  // Add from buildings
  for (const buildingId of city.buildings) {
    const building = BUILDINGS[buildingId];
    if (building) {
      food += building.foodBonus;
      production += building.productionBonus;
      gold += building.goldBonus;
      science += building.scienceBonus;
    }
  }

  // Population bonus
  food += city.population * 0.5;
  production += city.population * 0.3;
  science += city.population * 0.5;

  return {
    food: Math.floor(food),
    production: Math.floor(production),
    gold: Math.floor(gold),
    science: Math.floor(science)
  };
}

export function processPlayerTurn(state: GameState, playerId: number): void {
  const player = state.players[playerId];

  // Process cities
  for (const city of state.cities) {
    if (city.owner !== playerId) continue;

    const yields = getCityYields(state, city);

    // Add gold and science
    player.gold += yields.gold;
    player.science += yields.science;

    // Food and population growth
    city.food += yields.food - city.population * 2;
    if (city.food >= city.foodNeeded) {
      city.population++;
      city.food = 0;
      city.foodNeeded = Math.floor(city.foodNeeded * 1.5);
    }
    if (city.food < 0) {
      if (city.population > 1) {
        city.population--;
        city.food = 0;
      } else {
        city.food = 0;
      }
    }

    // Production
    if (city.currentProduction) {
      city.productionProgress += yields.production;

      let cost = 0;
      if (city.currentProduction.type === 'unit') {
        const unitType = city.currentProduction.id as UnitType;
        cost = UNIT_STATS[unitType].cost;
      } else {
        cost = BUILDINGS[city.currentProduction.id].cost;
      }

      if (city.productionProgress >= cost) {
        // Production complete
        if (city.currentProduction.type === 'unit') {
          const unitType = city.currentProduction.id as UnitType;
          // Find nearby empty tile
          let placed = false;
          for (let dy = -1; dy <= 1 && !placed; dy++) {
            for (let dx = -1; dx <= 1 && !placed; dx++) {
              const nx = city.x + dx;
              const ny = city.y + dy;
              if (ny >= 0 && ny < state.mapHeight && nx >= 0 && nx < state.mapWidth) {
                const tile = state.map[ny][nx];
                if (TERRAIN_INFO[tile.terrain].passable) {
                  const occupied = state.units.some(u => u.x === nx && u.y === ny);
                  if (!occupied) {
                    state.units.push(createUnit(unitType, nx, ny, playerId));
                    placed = true;
                  }
                }
              }
            }
          }
          if (!placed) {
            // Place on city
            state.units.push(createUnit(unitType, city.x, city.y, playerId));
          }
        } else {
          // Building
          city.buildings.push(city.currentProduction.id);
        }

        city.currentProduction = null;
        city.productionProgress = 0;
      }
    }
  }

  // Process research
  if (player.currentResearch) {
    player.researchProgress += player.science;
    const tech = TECHNOLOGIES[player.currentResearch];
    if (tech && player.researchProgress >= tech.cost) {
      player.researchedTechs.push(player.currentResearch);
      player.currentResearch = null;
      player.researchProgress = 0;
    }
  }

  // Reset unit movement
  for (const unit of state.units) {
    if (unit.owner === playerId) {
      const stats = UNIT_STATS[unit.type];
      unit.movementLeft = stats.movement;

      // Heal if fortified or in city
      if (unit.fortified || state.cities.some(c => c.x === unit.x && c.y === unit.y && c.owner === unit.owner)) {
        unit.health = Math.min(unit.maxHealth, unit.health + 10);
      }
    }
  }
}

export function checkVictory(state: GameState): number | null {
  // Count cities per player
  const cityCounts: Record<number, number> = {};
  for (const city of state.cities) {
    cityCounts[city.owner] = (cityCounts[city.owner] || 0) + 1;
  }

  // Check domination victory (control all cities or eliminate all enemies)
  for (const player of state.players) {
    // Check if this player has any presence
    const hasCities = cityCounts[player.id] > 0;
    const hasUnits = state.units.some(u => u.owner === player.id);

    if (!hasCities && !hasUnits && state.cities.length > 0) {
      // This player is eliminated - the other player wins
      const winner = state.players.find(p => p.id !== player.id);
      if (winner) return winner.id;
    }
  }

  // Check if one player controls all cities (and there are multiple cities)
  if (state.cities.length >= 3) {
    const owners = new Set(state.cities.map(c => c.owner));
    if (owners.size === 1) {
      return state.cities[0].owner;
    }
  }

  // Science victory - research all techs
  for (const player of state.players) {
    const totalTechs = Object.keys(TECHNOLOGIES).length;
    if (player.researchedTechs.length >= totalTechs) {
      return player.id;
    }
  }

  return null;
}

export function runAITurn(state: GameState, playerId: number): void {
  const player = state.players[playerId];
  if (player.isHuman) return;

  // Set research if needed
  if (!player.currentResearch) {
    const availableTechs = Object.values(TECHNOLOGIES).filter(tech => {
      if (player.researchedTechs.includes(tech.id)) return false;
      return tech.requires.every(req => player.researchedTechs.includes(req));
    });
    if (availableTechs.length > 0) {
      player.currentResearch = availableTechs[Math.floor(Math.random() * availableTechs.length)].id;
    }
  }

  // Process AI units
  for (const unit of state.units) {
    if (unit.owner !== playerId) continue;

    // Settler AI - find good spot and found city
    if (unit.type === UnitType.Settler && unit.movementLeft > 0) {
      // Check if can found city here
      const canFoundHere = !state.cities.some(c => {
        const dist = Math.sqrt((c.x - unit.x) ** 2 + (c.y - unit.y) ** 2);
        return dist < 4;
      });

      if (canFoundHere && state.map[unit.y][unit.x].terrain !== TerrainType.Ocean) {
        foundCity(state, unit);
        continue;
      }

      // Move randomly towards unexplored areas
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]];
      const validDirs = dirs.filter(([dx, dy]) => canMoveUnit(state, unit, unit.x + dx, unit.y + dy));
      if (validDirs.length > 0) {
        const [dx, dy] = validDirs[Math.floor(Math.random() * validDirs.length)];
        moveUnit(state, unit, unit.x + dx, unit.y + dy);
      }
    }

    // Military unit AI - explore or attack
    if (unit.type !== UnitType.Settler && unit.movementLeft > 0) {
      // Find nearby enemy
      let nearestEnemy: Unit | null = null;
      let nearestDist = Infinity;

      for (const enemy of state.units) {
        if (enemy.owner !== playerId) {
          const dist = Math.sqrt((enemy.x - unit.x) ** 2 + (enemy.y - unit.y) ** 2);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = enemy;
          }
        }
      }

      // If enemy nearby, move towards or attack
      if (nearestEnemy && nearestDist <= 10) {
        const dx = Math.sign(nearestEnemy.x - unit.x);
        const dy = Math.sign(nearestEnemy.y - unit.y);
        if (canMoveUnit(state, unit, unit.x + dx, unit.y + dy)) {
          moveUnit(state, unit, unit.x + dx, unit.y + dy);
        }
      } else {
        // Random movement
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const validDirs = dirs.filter(([dx, dy]) => canMoveUnit(state, unit, unit.x + dx, unit.y + dy));
        if (validDirs.length > 0) {
          const [dx, dy] = validDirs[Math.floor(Math.random() * validDirs.length)];
          moveUnit(state, unit, unit.x + dx, unit.y + dy);
        }
      }
    }
  }

  // AI city production
  for (const city of state.cities) {
    if (city.owner !== playerId) continue;
    if (city.currentProduction) continue;

    // Count units
    const militaryCount = state.units.filter(u => u.owner === playerId && u.type !== UnitType.Settler).length;
    const settlerCount = state.units.filter(u => u.owner === playerId && u.type === UnitType.Settler).length;
    const cityCount = state.cities.filter(c => c.owner === playerId).length;

    // Decide what to build
    if (settlerCount === 0 && cityCount < 5 && player.gold >= 30) {
      city.currentProduction = { type: 'unit', id: UnitType.Settler };
    } else if (militaryCount < cityCount * 2) {
      // Build military
      const availableUnits = Object.values(UNIT_STATS).filter(u => {
        if (u.type === UnitType.Settler) return false;
        if (!u.requiredTech) return true;
        return player.researchedTechs.includes(u.requiredTech);
      });
      if (availableUnits.length > 0) {
        const unitToBuild = availableUnits[Math.floor(Math.random() * availableUnits.length)];
        city.currentProduction = { type: 'unit', id: unitToBuild.type };
      }
    } else {
      // Build buildings
      const availableBuildings = Object.values(BUILDINGS).filter(b => !city.buildings.includes(b.id));
      if (availableBuildings.length > 0) {
        const buildingToBuild = availableBuildings[Math.floor(Math.random() * availableBuildings.length)];
        city.currentProduction = { type: 'building', id: buildingToBuild.id };
      }
    }
  }
}

import {
  GameState, Unit, City, Player, Tile, UnitType, Terrain,
  UNIT_DEFS, TERRAIN_YIELDS, TERRAIN_MOVE_COST,
  MAP_WIDTH, MAP_HEIGHT, NUM_PLAYERS, MAX_TURNS,
  PLAYER_COLORS, PLAYER_NAMES, CITY_NAMES,
  FOOD_PER_POP, SCORE_PER_CITY, SCORE_PER_POP, SCORE_PER_TECH, SCORE_PER_UNIT,
  DOMINATION_THRESHOLD, SCIENCE_PER_TURN_BASE,
} from './types';
import { generateMap, findStartPositions } from './mapgen';

let cityNameIndex = 0;

export function createGame(): GameState {
  cityNameIndex = 0;
  const tiles = generateMap();
  const players: Player[] = [];

  for (let i = 0; i < NUM_PLAYERS; i++) {
    players.push({
      id: i,
      name: PLAYER_NAMES[i] || `Player ${i + 1}`,
      color: PLAYER_COLORS[i],
      isHuman: i === 0,
      gold: 0,
      science: 0,
      score: 0,
      alive: true,
      techs: 0,
    });
  }

  const state: GameState = {
    turn: 1,
    currentPlayer: 0,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    tiles,
    players,
    units: [],
    cities: [],
    nextId: 1,
    selectedUnitId: null,
    selectedCityId: null,
    cameraX: 0,
    cameraY: 0,
    gameOver: false,
    winner: null,
  };

  // Place starting units
  const starts = findStartPositions(tiles, NUM_PLAYERS);
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const pos = starts[i];
    spawnUnit(state, UnitType.Settler, i, pos.x, pos.y);
    spawnUnit(state, UnitType.Warrior, i, pos.x, pos.y);
    spawnUnit(state, UnitType.Scout, i, pos.x, pos.y);
  }

  // Center camera on player's starting position
  state.cameraX = starts[0].x;
  state.cameraY = starts[0].y;

  updateVisibility(state);
  return state;
}

export function spawnUnit(state: GameState, type: UnitType, owner: number, x: number, y: number): Unit {
  const def = UNIT_DEFS[type];
  const unit: Unit = {
    id: state.nextId++,
    type,
    owner,
    x,
    y,
    hp: 100,
    maxHp: 100,
    movesLeft: def.moves,
    fortified: false,
    skipTurn: false,
  };
  state.units.push(unit);
  return unit;
}

export function foundCity(state: GameState, unit: Unit): City | null {
  if (unit.type !== UnitType.Settler) return null;
  const tile = state.tiles[unit.y][unit.x];
  if (tile.terrain === Terrain.Ocean || tile.terrain === Terrain.Coast || tile.terrain === Terrain.Mountain) {
    return null;
  }
  // Check no existing city here
  if (state.cities.some(c => c.x === unit.x && c.y === unit.y)) return null;

  const territory = getCityTerritory(unit.x, unit.y);
  const city: City = {
    id: state.nextId++,
    name: CITY_NAMES[cityNameIndex++ % CITY_NAMES.length],
    owner: unit.owner,
    x: unit.x,
    y: unit.y,
    population: 1,
    food: 0,
    foodNeeded: FOOD_PER_POP,
    production: 0,
    producing: null,
    producingProgress: 0,
    hp: 200,
    maxHp: 200,
    defense: 10,
    territory,
  };

  state.cities.push(city);

  // Remove the settler
  state.units = state.units.filter(u => u.id !== unit.id);
  if (state.selectedUnitId === unit.id) {
    state.selectedUnitId = null;
  }

  updateVisibility(state);
  return city;
}

function getCityTerritory(cx: number, cy: number): { x: number; y: number }[] {
  const territory: { x: number; y: number }[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > 3) continue;
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        territory.push({ x: nx, y: ny });
      }
    }
  }
  return territory;
}

export function moveUnit(state: GameState, unit: Unit, dx: number, dy: number): boolean {
  const nx = unit.x + dx;
  const ny = unit.y + dy;

  if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) return false;

  const tile = state.tiles[ny][nx];
  const moveCost = TERRAIN_MOVE_COST[tile.terrain];
  if (moveCost >= 99) return false;
  if (unit.movesLeft < 1) return false;

  // Check for enemy units
  const enemy = state.units.find(u => u.x === nx && u.y === ny && u.owner !== unit.owner);
  if (enemy) {
    combat(state, unit, enemy);
    unit.movesLeft = 0;
    return true;
  }

  // Check for enemy city
  const enemyCity = state.cities.find(c => c.x === nx && c.y === ny && c.owner !== unit.owner);
  if (enemyCity) {
    attackCity(state, unit, enemyCity);
    unit.movesLeft = 0;
    return true;
  }

  unit.x = nx;
  unit.y = ny;
  unit.movesLeft = Math.max(0, unit.movesLeft - moveCost);
  unit.fortified = false;

  updateVisibility(state);
  return true;
}

function combat(state: GameState, attacker: Unit, defender: Unit): void {
  const aDef = UNIT_DEFS[attacker.type];
  const dDef = UNIT_DEFS[defender.type];

  let aStr = aDef.ranged > 0 ? aDef.ranged : aDef.strength;
  let dStr = dDef.strength;

  // Fortification bonus
  if (defender.fortified) dStr = Math.floor(dStr * 1.5);

  // Terrain defense bonus
  const defTerrain = state.tiles[defender.y][defender.x].terrain;
  if (defTerrain === Terrain.Forest || defTerrain === Terrain.Hills) {
    dStr = Math.floor(dStr * 1.25);
  }

  // HP scaling
  aStr = Math.floor(aStr * (attacker.hp / attacker.maxHp));
  dStr = Math.floor(dStr * (defender.hp / defender.maxHp));

  const total = aStr + dStr;
  if (total === 0) return;

  const aRatio = aStr / total;
  const damageToDefender = Math.floor(30 + 50 * aRatio + Math.random() * 20);
  const damageToAttacker = Math.floor(30 + 50 * (1 - aRatio) + Math.random() * 20);

  defender.hp -= damageToDefender;
  // Ranged units don't take counter-damage
  if (aDef.ranged === 0) {
    attacker.hp -= damageToAttacker;
  }

  // Remove dead units
  if (defender.hp <= 0) {
    state.units = state.units.filter(u => u.id !== defender.id);
    if (state.selectedUnitId === defender.id) state.selectedUnitId = null;
    // Melee attacker moves into tile
    if (aDef.ranged === 0) {
      attacker.x = defender.x;
      attacker.y = defender.y;
    }
  }
  if (attacker.hp <= 0) {
    state.units = state.units.filter(u => u.id !== attacker.id);
    if (state.selectedUnitId === attacker.id) state.selectedUnitId = null;
  }
}

function attackCity(state: GameState, attacker: Unit, city: City): void {
  const aDef = UNIT_DEFS[attacker.type];
  let aStr = aDef.ranged > 0 ? aDef.ranged : aDef.strength;
  aStr = Math.floor(aStr * (attacker.hp / attacker.maxHp));

  city.hp -= Math.floor(aStr * 2 + Math.random() * 10);

  // City fights back
  if (aDef.ranged === 0) {
    attacker.hp -= Math.floor(city.defense + Math.random() * 5);
    if (attacker.hp <= 0) {
      state.units = state.units.filter(u => u.id !== attacker.id);
      if (state.selectedUnitId === attacker.id) state.selectedUnitId = null;
    }
  }

  // City captured
  if (city.hp <= 0) {
    city.owner = attacker.owner;
    city.hp = Math.floor(city.maxHp * 0.5);
    city.population = Math.max(1, city.population - 1);
    city.producing = null;
    city.producingProgress = 0;
    city.territory = getCityTerritory(city.x, city.y);
    // Move attacker into city
    if (aDef.ranged === 0 && attacker.hp > 0) {
      attacker.x = city.x;
      attacker.y = city.y;
    }
    updateVisibility(state);
  }
}

export function setProduction(city: City, unitType: UnitType): void {
  city.producing = unitType;
  city.producingProgress = 0;
}

export function endTurn(state: GameState): void {
  // Process current player's cities
  processCities(state, state.currentPlayer);

  // Process current player's units (heal, etc.)
  processUnits(state, state.currentPlayer);

  // Calculate score
  updateScore(state, state.currentPlayer);

  // Advance to next player
  state.currentPlayer = (state.currentPlayer + 1) % NUM_PLAYERS;

  // If we wrapped around to player 0, it's a new turn
  if (state.currentPlayer === 0) {
    state.turn++;
    // Check victory conditions
    checkVictory(state);
  }

  // Reset moves for current player's units
  for (const unit of state.units) {
    if (unit.owner === state.currentPlayer) {
      unit.movesLeft = UNIT_DEFS[unit.type].moves;
      unit.skipTurn = false;
    }
  }

  // Accumulate gold and science
  const player = state.players[state.currentPlayer];
  if (player.alive) {
    const playerCities = state.cities.filter(c => c.owner === state.currentPlayer);
    let goldIncome = 0;
    let scienceIncome = SCIENCE_PER_TURN_BASE;
    for (const city of playerCities) {
      for (const pos of city.territory) {
        const tile = state.tiles[pos.y][pos.x];
        goldIncome += TERRAIN_YIELDS[tile.terrain].gold;
      }
      scienceIncome += city.population;
    }
    player.gold += goldIncome;
    player.science += scienceIncome;

    // Simple tech progression: every 50 science = 1 tech
    while (player.science >= 50) {
      player.science -= 50;
      player.techs++;
    }
  }

  state.selectedUnitId = null;
  state.selectedCityId = null;

  updateVisibility(state);
}

function processCities(state: GameState, playerId: number): void {
  for (const city of state.cities) {
    if (city.owner !== playerId) continue;

    // Gather yields from territory
    let totalFood = 0;
    let totalProd = 0;
    for (const pos of city.territory) {
      const tile = state.tiles[pos.y][pos.x];
      totalFood += TERRAIN_YIELDS[tile.terrain].food;
      totalProd += TERRAIN_YIELDS[tile.terrain].production;
    }

    // Food consumed by population
    const consumed = city.population * 2;
    city.food += totalFood - consumed;

    // Population growth
    if (city.food >= city.foodNeeded) {
      city.food -= city.foodNeeded;
      city.population++;
      city.foodNeeded = Math.floor(FOOD_PER_POP * Math.pow(1.3, city.population - 1));
      city.territory = getCityTerritory(city.x, city.y);
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
    if (city.producing) {
      city.producingProgress += totalProd;
      const cost = UNIT_DEFS[city.producing].cost;
      if (city.producingProgress >= cost) {
        spawnUnit(state, city.producing, city.owner, city.x, city.y);
        city.producingProgress = 0;
        city.producing = null;
      }
    }

    // City heals
    if (city.hp < city.maxHp) {
      city.hp = Math.min(city.maxHp, city.hp + 10);
    }
  }
}

function processUnits(state: GameState, playerId: number): void {
  for (const unit of state.units) {
    if (unit.owner !== playerId) continue;
    // Heal units in friendly territory or fortified
    if (unit.hp < unit.maxHp) {
      const inCity = state.cities.some(c => c.x === unit.x && c.y === unit.y && c.owner === unit.owner);
      if (inCity) {
        unit.hp = Math.min(unit.maxHp, unit.hp + 20);
      } else if (unit.fortified) {
        unit.hp = Math.min(unit.maxHp, unit.hp + 10);
      } else {
        unit.hp = Math.min(unit.maxHp, unit.hp + 5);
      }
    }
  }
}

export function updateVisibility(state: GameState): void {
  // Reset visibility
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      for (let p = 0; p < NUM_PLAYERS; p++) {
        state.tiles[y][x].visible[p] = false;
      }
    }
  }

  // Units provide vision
  for (const unit of state.units) {
    const range = unit.type === UnitType.Scout ? 4 : 2;
    revealArea(state, unit.owner, unit.x, unit.y, range);
  }

  // Cities provide vision
  for (const city of state.cities) {
    revealArea(state, city.owner, city.x, city.y, 3);
  }
}

function revealArea(state: GameState, playerId: number, cx: number, cy: number, range: number): void {
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range + 1) continue;
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        state.tiles[ny][nx].visible[playerId] = true;
        state.tiles[ny][nx].explored[playerId] = true;
      }
    }
  }
}

function updateScore(state: GameState, playerId: number): void {
  const player = state.players[playerId];
  const playerCities = state.cities.filter(c => c.owner === playerId);
  const playerUnits = state.units.filter(u => u.owner === playerId);
  const totalPop = playerCities.reduce((s, c) => s + c.population, 0);

  player.score =
    playerCities.length * SCORE_PER_CITY +
    totalPop * SCORE_PER_POP +
    player.techs * SCORE_PER_TECH +
    playerUnits.length * SCORE_PER_UNIT;

  // Check if player is eliminated
  if (playerCities.length === 0 && !state.units.some(u => u.owner === playerId && u.type === UnitType.Settler)) {
    if (state.turn > 5) {
      player.alive = false;
    }
  }
}

function checkVictory(state: GameState): void {
  // Time victory: most score at max turns
  if (state.turn >= MAX_TURNS) {
    state.gameOver = true;
    let bestScore = -1;
    let bestPlayer = 0;
    for (const p of state.players) {
      if (p.score > bestScore) {
        bestScore = p.score;
        bestPlayer = p.id;
      }
    }
    state.winner = bestPlayer;
    return;
  }

  // Domination victory: control 60% of cities
  const totalCities = state.cities.length;
  if (totalCities >= 4) {
    for (const p of state.players) {
      const owned = state.cities.filter(c => c.owner === p.id).length;
      if (owned / totalCities >= DOMINATION_THRESHOLD) {
        state.gameOver = true;
        state.winner = p.id;
        return;
      }
    }
  }

  // Elimination: only one player alive
  const alive = state.players.filter(p => p.alive);
  if (alive.length === 1) {
    state.gameOver = true;
    state.winner = alive[0].id;
    return;
  }

  // Science victory: first to 20 techs
  for (const p of state.players) {
    if (p.techs >= 20) {
      state.gameOver = true;
      state.winner = p.id;
      return;
    }
  }
}

export function getUnitsAt(state: GameState, x: number, y: number, owner?: number): Unit[] {
  return state.units.filter(u => u.x === x && u.y === y && (owner === undefined || u.owner === owner));
}

export function getCityAt(state: GameState, x: number, y: number): City | undefined {
  return state.cities.find(c => c.x === x && c.y === y);
}

export function rangedAttack(state: GameState, attacker: Unit, tx: number, ty: number): boolean {
  const def = UNIT_DEFS[attacker.type];
  if (def.ranged === 0 || def.range === 0) return false;

  const dist = Math.abs(attacker.x - tx) + Math.abs(attacker.y - ty);
  if (dist > def.range || dist === 0) return false;
  if (attacker.movesLeft < 1) return false;

  const target = state.units.find(u => u.x === tx && u.y === ty && u.owner !== attacker.owner);
  if (target) {
    combat(state, attacker, target);
    attacker.movesLeft = 0;
    return true;
  }

  const targetCity = state.cities.find(c => c.x === tx && c.y === ty && c.owner !== attacker.owner);
  if (targetCity) {
    attackCity(state, attacker, targetCity);
    attacker.movesLeft = 0;
    return true;
  }

  return false;
}

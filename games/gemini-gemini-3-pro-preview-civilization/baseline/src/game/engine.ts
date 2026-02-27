import { GameState, Unit, City, Tile, Position, Player, UnitType } from './types';

export const createInitialState = (width = 15, height = 15): GameState => {
  const players: Player[] = [
    { id: 'p1', type: 'human', color: '#e74c3c' },
    { id: 'p2', type: 'ai', color: '#9b59b6' },
  ];

  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const rand = Math.random();
      let terrain: Tile['terrain'] = 'grass';
      if (rand < 0.15) terrain = 'water';
      else if (rand < 0.25) terrain = 'mountain';
      else if (rand < 0.4) terrain = 'forest';
      row.push({ x, y, terrain });
    }
    tiles.push(row);
  }

  // Ensure start pos is grass
  tiles[2][2].terrain = 'grass';
  tiles[height - 3][width - 3].terrain = 'grass';

  const units: Unit[] = [
    { id: 'u1', playerId: 'p1', type: 'settler', pos: { x: 2, y: 2 }, movement: 2, maxMovement: 2, hp: 10 },
    { id: 'u2', playerId: 'p2', type: 'settler', pos: { x: width - 3, y: height - 3 }, movement: 2, maxMovement: 2, hp: 10 },
  ];

  return {
    turn: 1,
    tiles,
    units,
    cities: [],
    players,
    currentPlayerIndex: 0,
    gameOver: false,
    winner: null,
    width,
    height,
  };
};

export const moveUnit = (state: GameState, unitId: string, targetPos: Position): GameState => {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit || unit.movement <= 0) return state;

  // Simple distance check (1 tile)
  const dist = Math.abs(unit.pos.x - targetPos.x) + Math.abs(unit.pos.y - targetPos.y);
  if (dist !== 1) return state;

  const targetTile = state.tiles[targetPos.y]?.[targetPos.x];
  if (!targetTile || targetTile.terrain === 'water' || targetTile.terrain === 'mountain') return state;

  // Check for enemy unit or city
  const enemyUnitIndex = state.units.findIndex(u => u.pos.x === targetPos.x && u.pos.y === targetPos.y && u.playerId !== unit.playerId);
  if (enemyUnitIndex !== -1) {
      // Attack!
      const newState = { ...state, units: [...state.units] };
      const enemy = { ...newState.units[enemyUnitIndex] };
      enemy.hp -= 5; // Fixed damage
      const attacker = { ...unit, movement: 0 };
      
      if (enemy.hp <= 0) {
          newState.units.splice(enemyUnitIndex, 1);
          attacker.pos = { ...targetPos };
      } else {
          newState.units[enemyUnitIndex] = enemy;
      }
      newState.units[newState.units.findIndex(u => u.id === attacker.id)] = attacker;
      return checkGameOver(newState);
  }

  // Check enemy city
  const enemyCityIndex = state.cities.findIndex(c => c.pos.x === targetPos.x && c.pos.y === targetPos.y && c.playerId !== unit.playerId);
  if (enemyCityIndex !== -1) {
     // Capture city
     const newState = { ...state, cities: [...state.cities] };
     const city = { ...newState.cities[enemyCityIndex], playerId: unit.playerId };
     newState.cities[enemyCityIndex] = city;
     
     const newUnits = [...state.units];
     const attacker = { ...unit, pos: { ...targetPos }, movement: 0 };
     newUnits[newUnits.findIndex(u=>u.id === unitId)] = attacker;
     newState.units = newUnits;
     return checkGameOver(newState);
  }

  // Check ally unit
  const allyUnitIndex = state.units.findIndex(u => u.pos.x === targetPos.x && u.pos.y === targetPos.y && u.playerId === unit.playerId);
  if (allyUnitIndex !== -1) return state;

  // Move
  const newUnits = state.units.map(u => u.id === unitId ? { ...u, pos: { ...targetPos }, movement: u.movement - 1 } : u);
  return { ...state, units: newUnits };
};

export const foundCity = (state: GameState, unitId: string): GameState => {
  const unitIndex = state.units.findIndex(u => u.id === unitId);
  const unit = state.units[unitIndex];
  if (!unit || unit.type !== 'settler') return state;

  const hasCityHere = state.cities.some(c => c.pos.x === unit.pos.x && c.pos.y === unit.pos.y);
  if (hasCityHere) return state;

  const newCity: City = {
    id: `c_${Date.now()}_${Math.random()}`,
    playerId: unit.playerId,
    pos: { ...unit.pos },
    name: `City ${state.cities.length + 1}`,
    population: 1,
    production: 0,
    currentBuild: 'warrior'
  };

  const newUnits = [...state.units];
  newUnits.splice(unitIndex, 1);

  return { ...state, units: newUnits, cities: [...state.cities, newCity] };
};

export const endTurn = (state: GameState): GameState => {
  let newState = { ...state };
  
  newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
  
  if (newState.currentPlayerIndex === 0) {
    // New full turn, handle production and unit movement reset
    newState.turn += 1;
    newState = handleTurnStart(newState);
  }

  if (newState.players[newState.currentPlayerIndex].type === 'ai') {
    newState = processAITurn(newState);
    // Recursively end turn for AI
    return endTurn(newState);
  }

  return newState;
};

const handleTurnStart = (state: GameState): GameState => {
  const newUnits = state.units.map(u => ({ ...u, movement: u.maxMovement }));
  let newCities = [...state.cities];
  const spawnedUnits: Unit[] = [];

  newCities = newCities.map(city => {
    let newProd = city.production + 10; // Base production
    let currentBuild = city.currentBuild;
    
    const cost = currentBuild === 'settler' ? 50 : 30;
    
    if (newProd >= cost && currentBuild) {
        // Try to spawn unit on empty tile
        const dirs = [{x:0, y:0}, {x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
        let spawnPos = null;
        for (const dir of dirs) {
            const p = {x: city.pos.x + dir.x, y: city.pos.y + dir.y};
            const tile = state.tiles[p.y]?.[p.x];
            if (tile && tile.terrain !== 'water' && tile.terrain !== 'mountain' && !state.units.some(u=>u.pos.x===p.x && u.pos.y===p.y)) {
                spawnPos = p;
                break;
            }
        }
        
        if (spawnPos) {
            newProd -= cost;
            spawnedUnits.push({
                id: `u_${Date.now()}_${Math.random()}`,
                playerId: city.playerId,
                type: currentBuild,
                pos: { ...spawnPos },
                movement: 2,
                maxMovement: 2,
                hp: 10
            });
            currentBuild = null; // Wait for instruction, or auto-build warrior
        }
    }
    // Auto-build warrior if nothing queued
    if (!currentBuild) currentBuild = 'warrior';

    return { ...city, production: newProd, currentBuild };
  });

  return { ...state, units: [...newUnits, ...spawnedUnits], cities: newCities };
};

const processAITurn = (state: GameState): GameState => {
  let currentState = { ...state };
  const aiPlayerId = currentState.players[currentState.currentPlayerIndex].id;
  
  const aiUnits = currentState.units.filter(u => u.playerId === aiPlayerId);
  
  for (const unit of aiUnits) {
     if (unit.type === 'settler') {
         currentState = foundCity(currentState, unit.id);
     } else if (unit.type === 'warrior' && unit.movement > 0) {
         // Move randomly or towards enemy
         const dirs = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
         const dir = dirs[Math.floor(Math.random() * dirs.length)];
         const targetPos = { x: unit.pos.x + dir.x, y: unit.pos.y + dir.y };
         currentState = moveUnit(currentState, unit.id, targetPos);
     }
  }
  
  return currentState;
}

const checkGameOver = (state: GameState): GameState => {
    const p1HasUnitsOrCities = state.units.some(u=>u.playerId === 'p1') || state.cities.some(c=>c.playerId==='p1');
    const p2HasUnitsOrCities = state.units.some(u=>u.playerId === 'p2') || state.cities.some(c=>c.playerId==='p2');

    if (!p1HasUnitsOrCities) return { ...state, gameOver: true, winner: 'p2' };
    if (!p2HasUnitsOrCities) return { ...state, gameOver: true, winner: 'p1' };
    return state;
}

export const changeCityBuild = (state: GameState, cityId: string, build: UnitType): GameState => {
    return {
        ...state,
        cities: state.cities.map(c => c.id === cityId ? { ...c, currentBuild: build } : c)
    };
}
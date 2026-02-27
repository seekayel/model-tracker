// ── Map dimensions ────────────────────────────────────────────────────────────
export const MAP_WIDTH  = 36;
export const MAP_HEIGHT = 22;
export const TILE_SIZE  = 56;   // pixels per tile

// ── Terrain ───────────────────────────────────────────────────────────────────
export const TerrainType = Object.freeze({
  OCEAN:     'OCEAN',
  GRASSLAND: 'GRASSLAND',
  PLAINS:    'PLAINS',
  HILLS:     'HILLS',
  MOUNTAINS: 'MOUNTAINS',
  FOREST:    'FOREST',
  DESERT:    'DESERT',
});

export const TERRAIN_DATA = {
  OCEAN:     { color: '#1a5276', border: '#154360', label: 'Ocean',     passable: false, yields: { food: 0, prod: 0, gold: 0 } },
  GRASSLAND: { color: '#27ae60', border: '#1e8449', label: 'Grassland', passable: true,  yields: { food: 2, prod: 0, gold: 0 } },
  PLAINS:    { color: '#d4ac0d', border: '#b7950b', label: 'Plains',    passable: true,  yields: { food: 1, prod: 1, gold: 0 } },
  HILLS:     { color: '#935116', border: '#784212', label: 'Hills',     passable: true,  yields: { food: 0, prod: 2, gold: 0 } },
  MOUNTAINS: { color: '#717d7e', border: '#5f6a6a', label: 'Mountains', passable: false, yields: { food: 0, prod: 0, gold: 0 } },
  FOREST:    { color: '#1a5e20', border: '#145a32', label: 'Forest',    passable: true,  yields: { food: 1, prod: 1, gold: 0 } },
  DESERT:    { color: '#e59866', border: '#ca6f1e', label: 'Desert',    passable: true,  yields: { food: 0, prod: 0, gold: 2 } },
};

// ── Units ─────────────────────────────────────────────────────────────────────
export const UnitType = Object.freeze({
  SETTLER:  'SETTLER',
  WARRIOR:  'WARRIOR',
  ARCHER:   'ARCHER',
  WORKER:   'WORKER',
});

export const UNIT_DATA = {
  SETTLER: {
    name: 'Settler', symbol: 'S',
    cost: 80, moves: 2, maxHp: 10, strength: 0,
    canFound: true, canBuild: false, ranged: false,
    color: '#fdfefe',
    description: 'Founds new cities (F)',
  },
  WARRIOR: {
    name: 'Warrior', symbol: 'W',
    cost: 40, moves: 2, maxHp: 20, strength: 12,
    canFound: false, canBuild: false, ranged: false,
    color: '#f1c40f',
    description: 'Basic melee combat unit',
  },
  ARCHER: {
    name: 'Archer', symbol: 'A',
    cost: 60, moves: 2, maxHp: 15, strength: 10,
    canFound: false, canBuild: false, ranged: true, range: 2,
    color: '#e67e22',
    description: 'Ranged attacker (range 2)',
  },
  WORKER: {
    name: 'Worker', symbol: 'K',
    cost: 30, moves: 2, maxHp: 10, strength: 0,
    canFound: false, canBuild: true, ranged: false,
    color: '#9b59b6',
    description: 'Builds tile improvements',
  },
};

// ── Buildings ─────────────────────────────────────────────────────────────────
export const BuildingType = Object.freeze({
  GRANARY:  'GRANARY',
  BARRACKS: 'BARRACKS',
  MARKET:   'MARKET',
  LIBRARY:  'LIBRARY',
  WALLS:    'WALLS',
});

export const BUILDING_DATA = {
  GRANARY:  { name: 'Granary',  cost: 60,  foodBonus: 2, goldBonus: 0, sciBonus: 0, prodBonus: 0, defBonus: 0, description: '+2 food/turn' },
  BARRACKS: { name: 'Barracks', cost: 80,  foodBonus: 0, goldBonus: 0, sciBonus: 0, prodBonus: 0, defBonus: 0, description: 'New units start with 20 XP' },
  MARKET:   { name: 'Market',   cost: 100, foodBonus: 0, goldBonus: 2, sciBonus: 0, prodBonus: 0, defBonus: 0, description: '+2 gold/turn' },
  LIBRARY:  { name: 'Library',  cost: 80,  foodBonus: 0, goldBonus: 0, sciBonus: 2, prodBonus: 0, defBonus: 0, description: '+2 science/turn' },
  WALLS:    { name: 'Walls',    cost: 60,  foodBonus: 0, goldBonus: 0, sciBonus: 0, prodBonus: 0, defBonus: 5, description: '+5 city defense' },
};

// ── Technologies ──────────────────────────────────────────────────────────────
export const TechType = Object.freeze({
  POTTERY:      'POTTERY',
  MINING:       'MINING',
  ARCHERY:      'ARCHERY',
  WRITING:      'WRITING',
  BRONZE:       'BRONZE',
  IRON:         'IRON',
  MASONRY:      'MASONRY',
  MATHEMATICS:  'MATHEMATICS',
});

export const TECH_DATA = {
  POTTERY:     { name: 'Pottery',         cost: 20,  prereqs: [],                    unlocks: ['GRANARY'],  description: 'Enables Granary building' },
  MINING:      { name: 'Mining',          cost: 25,  prereqs: [],                    unlocks: [],           description: '+1 prod from Hills tiles' },
  ARCHERY:     { name: 'Archery',         cost: 30,  prereqs: [],                    unlocks: ['ARCHER'],   description: 'Enables Archer unit' },
  WRITING:     { name: 'Writing',         cost: 40,  prereqs: ['POTTERY'],           unlocks: ['LIBRARY'],  description: 'Enables Library building' },
  BRONZE:      { name: 'Bronze Working',  cost: 50,  prereqs: ['MINING'],            unlocks: ['BARRACKS'], description: 'Enables Barracks building' },
  IRON:        { name: 'Iron Working',    cost: 65,  prereqs: ['BRONZE'],            unlocks: ['WARRIOR'],  description: 'Warrior strength +4' },
  MASONRY:     { name: 'Masonry',         cost: 60,  prereqs: ['MINING'],            unlocks: ['WALLS'],    description: 'Enables Walls building' },
  MATHEMATICS: { name: 'Mathematics',     cost: 75,  prereqs: ['WRITING'],           unlocks: ['MARKET'],   description: 'Enables Market building' },
};

// ── Civilization names ────────────────────────────────────────────────────────
export const PLAYER_CIV = {
  name: 'Rome',
  color: '#3498db',
  cityNames: ['Rome','Antium','Cumae','Neapolis','Ravenna','Capua','Pompeii','Brundisium'],
};

export const AI_CIV = {
  name: 'China',
  color: '#e74c3c',
  cityNames: ['Beijing','Xian','Chengdu','Nanjing','Shanghai','Guangzhou','Hangzhou','Suzhou'],
};

// ── City starting production ──────────────────────────────────────────────────
export const DEFAULT_CITY_PRODUCTION = 'WARRIOR';

// ── Combat ────────────────────────────────────────────────────────────────────
export const CITY_BASE_DEFENSE = 10;
export const CITY_BASE_HP      = 30;

// ── Turn limit ────────────────────────────────────────────────────────────────
export const MAX_TURNS = 100;

// ── Terrain ──
export enum Terrain {
  Ocean = 'ocean',
  Coast = 'coast',
  Plains = 'plains',
  Grassland = 'grassland',
  Forest = 'forest',
  Hills = 'hills',
  Mountain = 'mountain',
  Desert = 'desert',
}

export const TERRAIN_YIELDS: Record<Terrain, { food: number; production: number; gold: number }> = {
  [Terrain.Ocean]:     { food: 1, production: 0, gold: 1 },
  [Terrain.Coast]:     { food: 2, production: 0, gold: 1 },
  [Terrain.Plains]:    { food: 1, production: 1, gold: 1 },
  [Terrain.Grassland]: { food: 2, production: 1, gold: 0 },
  [Terrain.Forest]:    { food: 1, production: 2, gold: 0 },
  [Terrain.Hills]:     { food: 0, production: 2, gold: 1 },
  [Terrain.Mountain]:  { food: 0, production: 0, gold: 0 },
  [Terrain.Desert]:    { food: 0, production: 1, gold: 0 },
};

export const TERRAIN_MOVE_COST: Record<Terrain, number> = {
  [Terrain.Ocean]:     99,
  [Terrain.Coast]:     99,
  [Terrain.Plains]:    1,
  [Terrain.Grassland]: 1,
  [Terrain.Forest]:    2,
  [Terrain.Hills]:     2,
  [Terrain.Mountain]:  99,
  [Terrain.Desert]:    1,
};

export const TERRAIN_COLORS: Record<Terrain, string> = {
  [Terrain.Ocean]:     '#1a3a5c',
  [Terrain.Coast]:     '#2a6a9a',
  [Terrain.Plains]:    '#c8b44a',
  [Terrain.Grassland]: '#4a8c3f',
  [Terrain.Forest]:    '#2d6b2e',
  [Terrain.Hills]:     '#8b7355',
  [Terrain.Mountain]:  '#7a7a7a',
  [Terrain.Desert]:    '#d4b86a',
};

// ── Units ──
export enum UnitType {
  Settler = 'settler',
  Warrior = 'warrior',
  Archer = 'archer',
  Horseman = 'horseman',
  Swordsman = 'swordsman',
  Catapult = 'catapult',
  Scout = 'scout',
}

export interface UnitDef {
  type: UnitType;
  name: string;
  moves: number;
  strength: number;
  ranged: number;
  range: number;
  cost: number;
  symbol: string;
}

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  [UnitType.Settler]:   { type: UnitType.Settler,   name: 'Settler',   moves: 2, strength: 0,  ranged: 0,  range: 0, cost: 40, symbol: '⛺' },
  [UnitType.Scout]:     { type: UnitType.Scout,     name: 'Scout',     moves: 3, strength: 5,  ranged: 0,  range: 0, cost: 15, symbol: '👁' },
  [UnitType.Warrior]:   { type: UnitType.Warrior,   name: 'Warrior',   moves: 2, strength: 8,  ranged: 0,  range: 0, cost: 20, symbol: '⚔' },
  [UnitType.Archer]:    { type: UnitType.Archer,    name: 'Archer',    moves: 2, strength: 5,  ranged: 8,  range: 2, cost: 25, symbol: '🏹' },
  [UnitType.Horseman]:  { type: UnitType.Horseman,  name: 'Horseman',  moves: 4, strength: 12, ranged: 0,  range: 0, cost: 35, symbol: '🐴' },
  [UnitType.Swordsman]: { type: UnitType.Swordsman, name: 'Swordsman', moves: 2, strength: 14, ranged: 0,  range: 0, cost: 30, symbol: '🗡' },
  [UnitType.Catapult]:  { type: UnitType.Catapult,  name: 'Catapult',  moves: 2, strength: 4,  ranged: 14, range: 2, cost: 40, symbol: '💣' },
};

export interface Unit {
  id: number;
  type: UnitType;
  owner: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movesLeft: number;
  fortified: boolean;
  skipTurn: boolean;
}

// ── Cities ──
export interface City {
  id: number;
  name: string;
  owner: number;
  x: number;
  y: number;
  population: number;
  food: number;
  foodNeeded: number;
  production: number;
  producing: UnitType | null;
  producingProgress: number;
  hp: number;
  maxHp: number;
  defense: number;
  territory: { x: number; y: number }[];
}

// ── Tile ──
export interface Tile {
  terrain: Terrain;
  x: number;
  y: number;
  visible: boolean[];   // per-player
  explored: boolean[];  // per-player
}

// ── Player ──
export interface Player {
  id: number;
  name: string;
  color: string;
  isHuman: boolean;
  gold: number;
  science: number;
  score: number;
  alive: boolean;
  techs: number;
}

// ── Game State ──
export interface GameState {
  turn: number;
  currentPlayer: number;
  mapWidth: number;
  mapHeight: number;
  tiles: Tile[][];
  players: Player[];
  units: Unit[];
  cities: City[];
  nextId: number;
  selectedUnitId: number | null;
  selectedCityId: number | null;
  cameraX: number;
  cameraY: number;
  gameOver: boolean;
  winner: number | null;
}

// ── Constants ──
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;
export const TILE_SIZE = 48;
export const NUM_PLAYERS = 4;
export const MAX_TURNS = 200;
export const CITY_NAMES = [
  'Rome', 'Alexandria', 'Babylon', 'Athens', 'Thebes', 'Persepolis',
  'Memphis', 'Carthage', 'Sparta', 'Troy', 'Byzantium', 'Damascus',
  'Jerusalem', 'Nineveh', 'Tyre', 'Corinth', 'Antioch', 'Ephesus',
  'Pataliputra', 'Chang\'an', 'Luoyang', 'Kyoto', 'Delhi', 'Samarkand',
  'London', 'Paris', 'Madrid', 'Lisbon', 'Berlin', 'Vienna',
  'Moscow', 'Constantinople', 'Baghdad', 'Cairo', 'Mecca', 'Medina',
];

export const PLAYER_COLORS = ['#2196F3', '#f44336', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'];
export const PLAYER_NAMES = ['You', 'Rome', 'Egypt', 'China'];

export const FOOD_PER_POP = 10;
export const SCIENCE_PER_TURN_BASE = 1;
export const SCORE_PER_CITY = 50;
export const SCORE_PER_POP = 10;
export const SCORE_PER_TECH = 20;
export const SCORE_PER_UNIT = 5;
export const DOMINATION_THRESHOLD = 0.6; // control 60% of all cities to win

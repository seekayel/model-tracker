// Terrain types
export enum TerrainType {
  Ocean = 'ocean',
  Coast = 'coast',
  Plains = 'plains',
  Grassland = 'grassland',
  Desert = 'desert',
  Tundra = 'tundra',
  Mountain = 'mountain',
  Forest = 'forest',
  Hills = 'hills'
}

// Resource types
export enum ResourceType {
  None = 'none',
  Iron = 'iron',
  Horses = 'horses',
  Gold = 'gold',
  Gems = 'gems',
  Fish = 'fish',
  Wheat = 'wheat'
}

// Unit types
export enum UnitType {
  Settler = 'settler',
  Warrior = 'warrior',
  Archer = 'archer',
  Spearman = 'spearman',
  Horseman = 'horseman',
  Swordsman = 'swordsman',
  Catapult = 'catapult',
  Knight = 'knight'
}

// Unit stats
export interface UnitStats {
  type: UnitType;
  name: string;
  attack: number;
  defense: number;
  movement: number;
  cost: number;
  requiredTech: string | null;
}

// Unit definitions
export const UNIT_STATS: Record<UnitType, UnitStats> = {
  [UnitType.Settler]: {
    type: UnitType.Settler,
    name: 'Settler',
    attack: 0,
    defense: 0,
    movement: 2,
    cost: 50,
    requiredTech: null
  },
  [UnitType.Warrior]: {
    type: UnitType.Warrior,
    name: 'Warrior',
    attack: 2,
    defense: 1,
    movement: 2,
    cost: 20,
    requiredTech: null
  },
  [UnitType.Archer]: {
    type: UnitType.Archer,
    name: 'Archer',
    attack: 3,
    defense: 1,
    movement: 2,
    cost: 25,
    requiredTech: 'archery'
  },
  [UnitType.Spearman]: {
    type: UnitType.Spearman,
    name: 'Spearman',
    attack: 2,
    defense: 3,
    movement: 2,
    cost: 25,
    requiredTech: 'bronzeWorking'
  },
  [UnitType.Horseman]: {
    type: UnitType.Horseman,
    name: 'Horseman',
    attack: 4,
    defense: 2,
    movement: 4,
    cost: 40,
    requiredTech: 'horsebackRiding'
  },
  [UnitType.Swordsman]: {
    type: UnitType.Swordsman,
    name: 'Swordsman',
    attack: 4,
    defense: 3,
    movement: 2,
    cost: 35,
    requiredTech: 'ironWorking'
  },
  [UnitType.Catapult]: {
    type: UnitType.Catapult,
    name: 'Catapult',
    attack: 6,
    defense: 1,
    movement: 1,
    cost: 50,
    requiredTech: 'mathematics'
  },
  [UnitType.Knight]: {
    type: UnitType.Knight,
    name: 'Knight',
    attack: 6,
    defense: 4,
    movement: 3,
    cost: 60,
    requiredTech: 'chivalry'
  }
};

// Technology definition
export interface Technology {
  id: string;
  name: string;
  cost: number;
  requires: string[];
  unlocks: string[];
}

// Technology tree
export const TECHNOLOGIES: Record<string, Technology> = {
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    cost: 20,
    requires: [],
    unlocks: ['pottery', 'animalHusbandry']
  },
  pottery: {
    id: 'pottery',
    name: 'Pottery',
    cost: 30,
    requires: ['agriculture'],
    unlocks: ['writing']
  },
  animalHusbandry: {
    id: 'animalHusbandry',
    name: 'Animal Husbandry',
    cost: 30,
    requires: ['agriculture'],
    unlocks: ['horsebackRiding', 'archery']
  },
  mining: {
    id: 'mining',
    name: 'Mining',
    cost: 25,
    requires: [],
    unlocks: ['bronzeWorking', 'masonry']
  },
  bronzeWorking: {
    id: 'bronzeWorking',
    name: 'Bronze Working',
    cost: 40,
    requires: ['mining'],
    unlocks: ['ironWorking']
  },
  masonry: {
    id: 'masonry',
    name: 'Masonry',
    cost: 35,
    requires: ['mining'],
    unlocks: ['construction']
  },
  archery: {
    id: 'archery',
    name: 'Archery',
    cost: 35,
    requires: ['animalHusbandry'],
    unlocks: []
  },
  horsebackRiding: {
    id: 'horsebackRiding',
    name: 'Horseback Riding',
    cost: 45,
    requires: ['animalHusbandry'],
    unlocks: ['chivalry']
  },
  writing: {
    id: 'writing',
    name: 'Writing',
    cost: 40,
    requires: ['pottery'],
    unlocks: ['mathematics', 'philosophy']
  },
  ironWorking: {
    id: 'ironWorking',
    name: 'Iron Working',
    cost: 55,
    requires: ['bronzeWorking'],
    unlocks: []
  },
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    cost: 50,
    requires: ['writing'],
    unlocks: ['engineering']
  },
  construction: {
    id: 'construction',
    name: 'Construction',
    cost: 50,
    requires: ['masonry'],
    unlocks: ['engineering']
  },
  philosophy: {
    id: 'philosophy',
    name: 'Philosophy',
    cost: 60,
    requires: ['writing'],
    unlocks: []
  },
  engineering: {
    id: 'engineering',
    name: 'Engineering',
    cost: 70,
    requires: ['mathematics', 'construction'],
    unlocks: []
  },
  chivalry: {
    id: 'chivalry',
    name: 'Chivalry',
    cost: 80,
    requires: ['horsebackRiding'],
    unlocks: []
  }
};

// Terrain movement costs and yields
export interface TerrainInfo {
  movementCost: number;
  food: number;
  production: number;
  gold: number;
  passable: boolean;
  color: string;
}

export const TERRAIN_INFO: Record<TerrainType, TerrainInfo> = {
  [TerrainType.Ocean]: {
    movementCost: Infinity,
    food: 1,
    production: 0,
    gold: 0,
    passable: false,
    color: '#1a5276'
  },
  [TerrainType.Coast]: {
    movementCost: 1,
    food: 2,
    production: 0,
    gold: 1,
    passable: true,
    color: '#3498db'
  },
  [TerrainType.Plains]: {
    movementCost: 1,
    food: 1,
    production: 1,
    gold: 0,
    passable: true,
    color: '#d4ac6e'
  },
  [TerrainType.Grassland]: {
    movementCost: 1,
    food: 2,
    production: 0,
    gold: 0,
    passable: true,
    color: '#27ae60'
  },
  [TerrainType.Desert]: {
    movementCost: 1,
    food: 0,
    production: 0,
    gold: 0,
    passable: true,
    color: '#f4d03f'
  },
  [TerrainType.Tundra]: {
    movementCost: 1,
    food: 1,
    production: 0,
    gold: 0,
    passable: true,
    color: '#bdc3c7'
  },
  [TerrainType.Mountain]: {
    movementCost: Infinity,
    food: 0,
    production: 0,
    gold: 0,
    passable: false,
    color: '#7f8c8d'
  },
  [TerrainType.Forest]: {
    movementCost: 2,
    food: 1,
    production: 2,
    gold: 0,
    passable: true,
    color: '#196f3d'
  },
  [TerrainType.Hills]: {
    movementCost: 2,
    food: 0,
    production: 2,
    gold: 0,
    passable: true,
    color: '#8b7355'
  }
};

// Map tile
export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  resource: ResourceType;
  explored: boolean;
  visible: boolean;
  owner: number | null;
}

// Game unit
export interface Unit {
  id: number;
  type: UnitType;
  x: number;
  y: number;
  owner: number;
  health: number;
  maxHealth: number;
  movementLeft: number;
  fortified: boolean;
}

// City building
export interface Building {
  id: string;
  name: string;
  cost: number;
  goldBonus: number;
  productionBonus: number;
  foodBonus: number;
  scienceBonus: number;
  defenseBonus: number;
}

export const BUILDINGS: Record<string, Building> = {
  granary: {
    id: 'granary',
    name: 'Granary',
    cost: 60,
    goldBonus: 0,
    productionBonus: 0,
    foodBonus: 2,
    scienceBonus: 0,
    defenseBonus: 0
  },
  barracks: {
    id: 'barracks',
    name: 'Barracks',
    cost: 50,
    goldBonus: 0,
    productionBonus: 0,
    foodBonus: 0,
    scienceBonus: 0,
    defenseBonus: 1
  },
  library: {
    id: 'library',
    name: 'Library',
    cost: 75,
    goldBonus: 0,
    productionBonus: 0,
    foodBonus: 0,
    scienceBonus: 3,
    defenseBonus: 0
  },
  market: {
    id: 'market',
    name: 'Market',
    cost: 80,
    goldBonus: 3,
    productionBonus: 0,
    foodBonus: 0,
    scienceBonus: 0,
    defenseBonus: 0
  },
  walls: {
    id: 'walls',
    name: 'Walls',
    cost: 65,
    goldBonus: 0,
    productionBonus: 0,
    foodBonus: 0,
    scienceBonus: 0,
    defenseBonus: 3
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    cost: 90,
    goldBonus: 0,
    productionBonus: 2,
    foodBonus: 0,
    scienceBonus: 0,
    defenseBonus: 0
  }
};

// City
export interface City {
  id: number;
  name: string;
  x: number;
  y: number;
  owner: number;
  population: number;
  food: number;
  foodNeeded: number;
  production: number;
  buildings: string[];
  currentProduction: { type: 'unit' | 'building'; id: string } | null;
  productionProgress: number;
}

// Player
export interface Player {
  id: number;
  name: string;
  color: string;
  isHuman: boolean;
  gold: number;
  science: number;
  researchedTechs: string[];
  currentResearch: string | null;
  researchProgress: number;
}

// Game state
export interface GameState {
  turn: number;
  currentPlayer: number;
  players: Player[];
  map: Tile[][];
  units: Unit[];
  cities: City[];
  mapWidth: number;
  mapHeight: number;
  selectedUnit: Unit | null;
  selectedCity: City | null;
  moveMode: boolean;
  gameOver: boolean;
  winner: number | null;
}

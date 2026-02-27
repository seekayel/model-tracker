export type Position = { x: number; y: number };
export type TerrainType = 'grass' | 'water' | 'mountain' | 'forest';
export type UnitType = 'settler' | 'warrior';
export type PlayerType = 'human' | 'ai';

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
}

export interface Unit {
  id: string;
  playerId: string;
  type: UnitType;
  pos: Position;
  movement: number;
  maxMovement: number;
  hp: number;
}

export interface City {
  id: string;
  playerId: string;
  pos: Position;
  name: string;
  population: number;
  production: number;
  currentBuild: UnitType | null;
}

export interface Player {
  id: string;
  type: PlayerType;
  color: string;
}

export interface GameState {
  turn: number;
  tiles: Tile[][];
  units: Unit[];
  cities: City[];
  players: Player[];
  currentPlayerIndex: number;
  gameOver: boolean;
  winner: string | null;
  width: number;
  height: number;
}
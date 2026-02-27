// Canvas dimensions
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;

// Player constants
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 32;
export const PLAYER_SPEED = 4;
export const PLAYER_FIRE_COOLDOWN = 250; // ms between shots
export const PLAYER_START_LIVES = 3;

// Bullet constants
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 12;
export const PLAYER_BULLET_SPEED = 8;
export const ENEMY_BULLET_SPEED = 4;

// Enemy constants
export const ENEMY_WIDTH = 28;
export const ENEMY_HEIGHT = 28;
export const ENEMY_COLS = 8;
export const ENEMY_ROWS = 4;
export const ENEMY_SPACING_X = 44;
export const ENEMY_SPACING_Y = 40;
export const FORMATION_TOP = 60;
export const FORMATION_LEFT = 52;

// Dive attack
export const DIVE_SPEED = 3;
export const DIVE_CHANCE_PER_FRAME = 0.002;
export const DIVE_SHOOT_CHANCE = 0.015;

// Scoring
export const SCORE_BEE = 100;
export const SCORE_BUTTERFLY = 150;
export const SCORE_BOSS = 300;

// Star field
export const STAR_COUNT = 80;
export const STAR_SPEED_MIN = 0.5;
export const STAR_SPEED_MAX = 2.5;

// Colors
export const COLOR_PLAYER = '#00ccff';
export const COLOR_PLAYER_BULLET = '#ffff00';
export const COLOR_ENEMY_BULLET = '#ff4444';
export const COLOR_BEE = '#ffdd00';
export const COLOR_BUTTERFLY = '#ff44aa';
export const COLOR_BOSS = '#44ff44';
export const COLOR_HUD = '#ffffff';
export const COLOR_STAR = '#ffffff';

export enum EnemyType {
  Bee = 'bee',
  Butterfly = 'butterfly',
  Boss = 'boss',
}

export enum GameState {
  Title = 'title',
  Playing = 'playing',
  StageIntro = 'stage_intro',
  Dying = 'dying',
  GameOver = 'game_over',
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Bullet {
  x: number;
  y: number;
  dy: number;
  isPlayer: boolean;
  alive: boolean;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
}

export interface Enemy {
  type: EnemyType;
  // Position in formation grid
  gridCol: number;
  gridRow: number;
  // Current world position
  x: number;
  y: number;
  alive: boolean;
  // Dive attack state
  diving: boolean;
  divePath: Vec2[];
  diveIndex: number;
  diveT: number;
  // Formation home position
  homeX: number;
  homeY: number;
  // Animation
  animFrame: number;
  animTimer: number;
}

export interface Explosion {
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  particles: { dx: number; dy: number; color: string }[];
}

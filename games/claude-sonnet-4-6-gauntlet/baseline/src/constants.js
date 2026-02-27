// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  EXIT: 2,
  TREASURE: 3,
  FOOD: 4,
  KEY: 5,
  POTION: 6,
  SPAWNER: 7,
};

// Entity types
export const ENTITY_TYPE = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  PROJECTILE: 'projectile',
  SPAWNER: 'spawner',
  ITEM: 'item',
};

export const ENEMY_TYPE = {
  GRUNT: 'grunt',
  GHOST: 'ghost',
  DEMON: 'demon',
  SORCERER: 'sorcerer',
};

export const ITEM_TYPE = {
  FOOD: 'food',
  KEY: 'key',
  POTION: 'potion',
  TREASURE: 'treasure',
};

// Grid
export const TILE_SIZE = 40;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 20;

// Canvas
export const CANVAS_WIDTH = MAP_WIDTH * TILE_SIZE;
export const CANVAS_HEIGHT = MAP_HEIGHT * TILE_SIZE;

// Player
export const PLAYER_SPEED = 3.5;
export const PLAYER_SHOOT_COOLDOWN = 300; // ms
export const PLAYER_START_HEALTH = 2000;
export const HEALTH_DRAIN_RATE = 1; // per second
export const HEALTH_DRAIN_INTERVAL = 1000; // ms

// Enemies
export const ENEMY_CONFIG = {
  [ENEMY_TYPE.GRUNT]: {
    speed: 1.2,
    health: 60,
    damage: 60,
    color: '#cc4444',
    points: 10,
    size: 14,
    attackRange: 20,
    attackCooldown: 800,
  },
  [ENEMY_TYPE.GHOST]: {
    speed: 1.6,
    health: 40,
    damage: 40,
    color: '#8888cc',
    points: 15,
    size: 13,
    attackRange: 20,
    attackCooldown: 600,
    canPassWalls: true,
  },
  [ENEMY_TYPE.DEMON]: {
    speed: 0.9,
    health: 150,
    damage: 100,
    color: '#cc2222',
    points: 25,
    size: 18,
    attackRange: 22,
    attackCooldown: 1200,
  },
  [ENEMY_TYPE.SORCERER]: {
    speed: 1.0,
    health: 80,
    damage: 80,
    color: '#aa44aa',
    points: 20,
    size: 14,
    attackRange: 200,
    attackCooldown: 2000,
    canShoot: true,
  },
};

// Projectiles
export const PROJECTILE_SPEED = 6;
export const PROJECTILE_DAMAGE = 100;
export const PROJECTILE_LIFETIME = 2000; // ms

// Spawners
export const SPAWNER_HEALTH = 200;
export const SPAWNER_SPAWN_INTERVAL = 3000; // ms
export const SPAWNER_MAX_ENEMIES = 5;

// Items
export const ITEM_CONFIG = {
  [ITEM_TYPE.FOOD]: { health: 300, points: 50, color: '#44cc44' },
  [ITEM_TYPE.KEY]: { points: 100, color: '#ffcc00' },
  [ITEM_TYPE.POTION]: { points: 150, color: '#4444ff', effect: 'clear_screen' },
  [ITEM_TYPE.TREASURE]: { points: 500, color: '#ffaa00' },
};

// Game states
export const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over',
  WIN: 'win',
};

// Colors
export const COLORS = {
  FLOOR: '#2a2a2a',
  WALL: '#555555',
  WALL_HIGHLIGHT: '#777777',
  EXIT: '#00ffaa',
  EXIT_GLOW: '#004433',
  PLAYER: '#44aaff',
  PLAYER_OUTLINE: '#0066cc',
  HUD_BG: 'rgba(0,0,0,0.85)',
  HEALTH_BAR: '#44cc44',
  HEALTH_LOW: '#cc4444',
  HEALTH_MED: '#ccaa00',
};

// Game constants
export const TILE_SIZE = 32;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 19;

// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  DOOR: 2,
  EXIT: 3,
  FOOD: 4,
  KEY: 5,
  TREASURE: 6,
  SPAWNER: 7,
  POTION: 8
};

// Colors
export const COLORS = {
  FLOOR: '#2d2d44',
  WALL: '#555577',
  WALL_BORDER: '#333355',
  DOOR: '#8b4513',
  DOOR_LOCKED: '#654321',
  EXIT: '#ffd700',
  FOOD: '#ff6b6b',
  KEY: '#ffd700',
  TREASURE: '#ffd700',
  SPAWNER: '#4a0080',
  POTION: '#00ff88',

  // Player classes
  WARRIOR: '#e74c3c',
  VALKYRIE: '#3498db',
  WIZARD: '#9b59b6',
  ELF: '#2ecc71',

  // Enemies
  GHOST: '#aaddff',
  DEMON: '#ff4444',
  GRUNT: '#88aa44',
  SORCERER: '#ff88ff',

  // Projectiles
  PLAYER_PROJECTILE: '#ffff00',
  ENEMY_PROJECTILE: '#ff00ff'
};

// Character stats
export const CHARACTER_STATS = {
  warrior: {
    health: 150,
    speed: 2.5,
    attackPower: 15,
    attackSpeed: 400,
    armor: 3,
    projectileSpeed: 6
  },
  valkyrie: {
    health: 120,
    speed: 3,
    attackPower: 12,
    attackSpeed: 350,
    armor: 2,
    projectileSpeed: 7
  },
  wizard: {
    health: 80,
    speed: 2.5,
    attackPower: 20,
    attackSpeed: 300,
    armor: 1,
    projectileSpeed: 8
  },
  elf: {
    health: 100,
    speed: 4,
    attackPower: 10,
    attackSpeed: 250,
    armor: 1,
    projectileSpeed: 9
  }
};

// Enemy stats
export const ENEMY_STATS = {
  ghost: {
    health: 20,
    speed: 1.5,
    damage: 5,
    score: 100,
    canShoot: false
  },
  demon: {
    health: 40,
    speed: 2,
    damage: 10,
    score: 200,
    canShoot: true,
    shootInterval: 2000
  },
  grunt: {
    health: 30,
    speed: 1.8,
    damage: 8,
    score: 150,
    canShoot: false
  },
  sorcerer: {
    health: 25,
    speed: 1.2,
    damage: 12,
    score: 250,
    canShoot: true,
    shootInterval: 1500
  }
};

// Game balance
export const HEALTH_DRAIN_RATE = 0.5; // Health lost per second
export const FOOD_HEAL_AMOUNT = 30;
export const POTION_HEAL_AMOUNT = 50;
export const SPAWNER_HEALTH = 100;
export const SPAWNER_SPAWN_INTERVAL = 3000;
export const MAX_ENEMIES_PER_SPAWNER = 4;

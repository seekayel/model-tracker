// Canvas dimensions
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;

// Player settings
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 24;
export const PLAYER_SPEED = 5;
export const PLAYER_FIRE_RATE = 250; // ms between shots
export const PLAYER_MAX_BULLETS = 2;
export const PLAYER_START_LIVES = 3;

// Bullet settings
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 12;
export const PLAYER_BULLET_SPEED = 10;
export const ENEMY_BULLET_SPEED = 5;

// Enemy settings
export const ENEMY_WIDTH = 28;
export const ENEMY_HEIGHT = 24;
export const ENEMY_ROWS = 5;
export const ENEMY_COLS = 8;
export const ENEMY_H_SPACING = 48;
export const ENEMY_V_SPACING = 40;
export const ENEMY_START_Y = 60;
export const ENEMY_DIVE_SPEED = 4;
export const ENEMY_FORMATION_SPEED = 0.5;

// Scoring
export const SCORE_BEE = 50;
export const SCORE_BUTTERFLY = 80;
export const SCORE_BOSS = 150;
export const SCORE_DIVING_BONUS = 2; // Multiplier when enemy is diving

// Colors
export const COLORS = {
  player: '#00ff00',
  playerBullet: '#ffffff',
  enemyBullet: '#ff0000',
  bee: '#ffff00',
  butterfly: '#ff00ff',
  boss: '#00ffff',
  explosion: ['#ffffff', '#ffff00', '#ff8800', '#ff0000'],
  star: '#ffffff',
  hud: '#ffffff',
  hudScore: '#ffcc00'
};

// Game states
export const GAME_STATE = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  STAGE_CLEAR: 'stageClear',
  PLAYER_DEATH: 'playerDeath'
};

// Enemy types
export const ENEMY_TYPE = {
  BEE: 'bee',
  BUTTERFLY: 'butterfly',
  BOSS: 'boss'
};

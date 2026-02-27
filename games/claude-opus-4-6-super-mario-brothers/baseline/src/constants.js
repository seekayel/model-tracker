// Display
export const CANVAS_WIDTH = 768;
export const CANVAS_HEIGHT = 720;
export const TILE_SIZE = 48;
export const COLS = CANVAS_WIDTH / TILE_SIZE; // 16
export const ROWS = CANVAS_HEIGHT / TILE_SIZE; // 15

// Physics
export const GRAVITY = 0.65;
export const MAX_FALL_SPEED = 12;
export const FRICTION = 0.85;

// Player
export const PLAYER_ACCEL = 0.55;
export const PLAYER_MAX_SPEED = 5.5;
export const PLAYER_RUN_MAX_SPEED = 8;
export const PLAYER_JUMP_FORCE = -12;
export const PLAYER_BIG_JUMP_FORCE = -13.5;
export const PLAYER_WIDTH = 42;
export const PLAYER_HEIGHT = 42;
export const PLAYER_BIG_HEIGHT = 84;

// Enemies
export const GOOMBA_SPEED = 1.2;
export const KOOPA_SPEED = 1.0;
export const SHELL_SPEED = 8;

// Level
export const LEVEL_END_X = 210 * TILE_SIZE;

// Tile types
export const TILE = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION: 3,
  QUESTION_USED: 4,
  PIPE_TL: 5,
  PIPE_TR: 6,
  PIPE_BL: 7,
  PIPE_BR: 8,
  BLOCK: 9,
  FLAG_POLE: 10,
  FLAG_TOP: 11,
  CASTLE_BLOCK: 12,
  CASTLE_TOP: 13,
  CASTLE_DOOR: 14,
  CLOUD: 15,
  BUSH: 16,
  HILL: 17,
};

// Game states
export const STATE = {
  TITLE: 'title',
  PLAYING: 'playing',
  DYING: 'dying',
  GAME_OVER: 'game_over',
  WIN: 'win',
  LEVEL_COMPLETE: 'level_complete',
};

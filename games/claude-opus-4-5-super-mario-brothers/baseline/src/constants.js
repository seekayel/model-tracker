// Game dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const TILE_SIZE = 32;

// Physics
export const GRAVITY = 0.6;
export const MAX_FALL_SPEED = 12;
export const FRICTION = 0.85;

// Player constants
export const PLAYER_SPEED = 0.5;
export const PLAYER_MAX_SPEED = 5;
export const PLAYER_JUMP_FORCE = -12;
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 32;
export const PLAYER_BIG_HEIGHT = 64;

// Enemy constants
export const GOOMBA_SPEED = 1;
export const KOOPA_SPEED = 1.2;
export const SHELL_SPEED = 8;

// Item constants
export const COIN_VALUE = 100;
export const MUSHROOM_POINTS = 1000;

// Colors (for pixel art rendering)
export const COLORS = {
  SKY: '#5c94fc',
  GROUND: '#c84c0c',
  BRICK: '#d07030',
  QUESTION: '#fbd000',
  PIPE_GREEN: '#00a800',
  PIPE_DARK: '#006800',
  MARIO_RED: '#e52521',
  MARIO_SKIN: '#ffa044',
  MARIO_BROWN: '#6b4423',
  GOOMBA_BROWN: '#c84c0c',
  KOOPA_GREEN: '#00a800',
  COIN_GOLD: '#fbd000',
  MUSHROOM_RED: '#e52521',
  WHITE: '#ffffff',
  BLACK: '#000000',
  HUD_WHITE: '#ffffff'
};

// Game states
export const GAME_STATE = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  WIN: 'win'
};

// Entity types
export const ENTITY_TYPE = {
  PLAYER: 'player',
  GOOMBA: 'goomba',
  KOOPA: 'koopa',
  COIN: 'coin',
  MUSHROOM: 'mushroom',
  BRICK: 'brick',
  QUESTION: 'question',
  GROUND: 'ground',
  PIPE: 'pipe',
  FLAG: 'flag'
};

// Tile types for level building
export const TILE = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION_COIN: 3,
  QUESTION_MUSHROOM: 4,
  PIPE_TOP_LEFT: 5,
  PIPE_TOP_RIGHT: 6,
  PIPE_BODY_LEFT: 7,
  PIPE_BODY_RIGHT: 8,
  HARD_BLOCK: 9,
  USED_BLOCK: 10,
  FLAG_POLE: 11,
  FLAG_TOP: 12
};

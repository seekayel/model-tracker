export const TILE_SIZE = 32;
export const CANVAS_W = 800;
export const CANVAS_H = 480;
export const LEVEL_ROWS = 15;

export const GRAVITY = 0.5;
export const MAX_FALL = 16;
export const JUMP_VEL = -13;
export const JUMP_HOLD_FRAMES = 12;
export const WALK_SPEED = 2.8;
export const RUN_SPEED = 4.8;
export const COYOTE_FRAMES = 8;
export const JUMP_BUFFER_FRAMES = 8;
export const ENEMY_SPEED = 1.2;

export const TILE = {
  EMPTY:      0,
  GROUND:     1,
  BRICK:      2,
  QUESTION:   3,   // ? block with coin
  QUESTION_MU:4,   // ? block with mushroom
  USED:       5,   // used/empty block
  PIPE_TL:    6,
  PIPE_TR:    7,
  PIPE_BL:    8,
  PIPE_BR:    9,
  SOLID:      10,
  COIN:       11,  // collectible coin tile (not solid)
};

export const SOLID_TILES = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
]);

export const STATE = {
  TITLE:       'title',
  PLAYING:     'playing',
  DYING:       'dying',
  LEVEL_CLEAR: 'level_clear',
  GAME_OVER:   'game_over',
};

export const FLAGPOLE_X_TILE = 192; // flagpole at this column

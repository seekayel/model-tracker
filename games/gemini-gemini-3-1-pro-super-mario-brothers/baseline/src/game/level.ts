import {
  LEVEL_WIDTH_TILES,
  LEVEL_HEIGHT_TILES,
  TILE_EMPTY,
  TILE_GROUND,
  TILE_BRICK,
  TILE_QUESTION,
  TILE_SOLID,
  TILE_PIPE_TOP_LEFT,
  TILE_PIPE_TOP_RIGHT,
  TILE_PIPE_LEFT,
  TILE_PIPE_RIGHT,
} from '../constants';

export const generateLevel = (): number[][] => {
  const level: number[][] = Array(LEVEL_HEIGHT_TILES)
    .fill(0)
    .map(() => Array(LEVEL_WIDTH_TILES).fill(TILE_EMPTY));

  for (let x = 0; x < LEVEL_WIDTH_TILES; x++) {
    level[LEVEL_HEIGHT_TILES - 2][x] = TILE_GROUND;
    level[LEVEL_HEIGHT_TILES - 1][x] = TILE_GROUND;
  }

  // Some platforms
  for (let x = 15; x < 20; x++) {
    level[LEVEL_HEIGHT_TILES - 6][x] = TILE_BRICK;
  }

  // Question blocks
  level[LEVEL_HEIGHT_TILES - 6][20] = TILE_QUESTION;
  level[LEVEL_HEIGHT_TILES - 6][21] = TILE_BRICK;
  level[LEVEL_HEIGHT_TILES - 6][22] = TILE_QUESTION;
  level[LEVEL_HEIGHT_TILES - 6][23] = TILE_BRICK;
  level[LEVEL_HEIGHT_TILES - 6][24] = TILE_QUESTION;
  level[LEVEL_HEIGHT_TILES - 10][22] = TILE_BRICK;

  // A pipe
  const pipeX = 28;
  level[LEVEL_HEIGHT_TILES - 4][pipeX] = TILE_PIPE_TOP_LEFT;
  level[LEVEL_HEIGHT_TILES - 4][pipeX + 1] = TILE_PIPE_TOP_RIGHT;
  level[LEVEL_HEIGHT_TILES - 3][pipeX] = TILE_PIPE_LEFT;
  level[LEVEL_HEIGHT_TILES - 3][pipeX + 1] = TILE_PIPE_RIGHT;
  
  // Another pipe
  const pipe2X = 38;
  level[LEVEL_HEIGHT_TILES - 5][pipe2X] = TILE_PIPE_TOP_LEFT;
  level[LEVEL_HEIGHT_TILES - 5][pipe2X + 1] = TILE_PIPE_TOP_RIGHT;
  level[LEVEL_HEIGHT_TILES - 4][pipe2X] = TILE_PIPE_LEFT;
  level[LEVEL_HEIGHT_TILES - 4][pipe2X + 1] = TILE_PIPE_RIGHT;
  level[LEVEL_HEIGHT_TILES - 3][pipe2X] = TILE_PIPE_LEFT;
  level[LEVEL_HEIGHT_TILES - 3][pipe2X + 1] = TILE_PIPE_RIGHT;


  for (let x = 50; x < 55; x++) {
    level[LEVEL_HEIGHT_TILES - 6][x] = TILE_BRICK;
  }
  
  // A solid block pyramid
  level[LEVEL_HEIGHT_TILES - 3][58] = TILE_SOLID;
  level[LEVEL_HEIGHT_TILES - 3][59] = TILE_SOLID;
  level[LEVEL_HEIGHT_TILES - 3][60] = TILE_SOLID;
  level[LEVEL_HEIGHT_TILES - 3][61] = TILE_SOLID;
  level[LEVEL_HEIGHT_TILES - 4][59] = TILE_SOLID;
  level[LEVEL_HEIGHT_TILES - 4][60] = TILE_SOLID;
  level[LEVEL_HEIGHT_TILES - 5][60] = TILE_SOLID;


  return level;
};

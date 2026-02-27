import { TILE, TILE_SIZE, ROWS, COLS } from './constants.js';

// Level 1-1 inspired layout
// The level is stored as a 2D array of tile types
// Each column represents a vertical slice; the level scrolls horizontally

const GROUND_Y = 13; // Row index where ground starts (rows 13 and 14 are ground)
const LEVEL_WIDTH = 212; // Total columns in the level

export function createLevel() {
  const tiles = [];

  // Initialize all tiles to empty
  for (let col = 0; col < LEVEL_WIDTH; col++) {
    tiles[col] = [];
    for (let row = 0; row < ROWS; row++) {
      tiles[col][row] = TILE.EMPTY;
    }
  }

  // Fill ground
  for (let col = 0; col < LEVEL_WIDTH; col++) {
    // Gaps in ground (pits)
    if ((col >= 69 && col <= 70) ||
        (col >= 86 && col <= 88) ||
        (col >= 153 && col <= 154)) {
      continue;
    }
    tiles[col][GROUND_Y] = TILE.GROUND;
    tiles[col][GROUND_Y + 1] = TILE.GROUND;
  }

  // Question blocks with coins
  setTile(tiles, 16, 9, TILE.QUESTION);
  setTile(tiles, 21, 9, TILE.BRICK);
  setTile(tiles, 22, 9, TILE.QUESTION); // mushroom
  setTile(tiles, 23, 9, TILE.BRICK);
  setTile(tiles, 24, 9, TILE.QUESTION);
  setTile(tiles, 22, 5, TILE.QUESTION);

  // Pipe 1
  setPipe(tiles, 28, 11, 2);
  // Pipe 2
  setPipe(tiles, 38, 10, 3);
  // Pipe 3
  setPipe(tiles, 46, 9, 4);
  // Pipe 4
  setPipe(tiles, 57, 9, 4);

  // Brick and question block section
  setTile(tiles, 78, 9, TILE.BRICK);
  setTile(tiles, 79, 9, TILE.QUESTION);
  setTile(tiles, 80, 9, TILE.BRICK);

  // High brick row
  setTile(tiles, 80, 5, TILE.BRICK);
  setTile(tiles, 81, 5, TILE.BRICK);
  setTile(tiles, 82, 5, TILE.BRICK);
  setTile(tiles, 83, 5, TILE.BRICK);
  setTile(tiles, 84, 5, TILE.BRICK);
  setTile(tiles, 85, 5, TILE.BRICK);
  setTile(tiles, 86, 5, TILE.BRICK);
  setTile(tiles, 87, 5, TILE.BRICK);

  // More blocks after first pit
  setTile(tiles, 91, 9, TILE.BRICK);
  setTile(tiles, 92, 9, TILE.BRICK);
  setTile(tiles, 93, 9, TILE.QUESTION);
  setTile(tiles, 94, 9, TILE.BRICK);

  // Question blocks
  setTile(tiles, 94, 5, TILE.QUESTION);
  setTile(tiles, 106, 5, TILE.QUESTION);
  setTile(tiles, 109, 5, TILE.QUESTION);
  setTile(tiles, 109, 9, TILE.QUESTION);
  setTile(tiles, 112, 9, TILE.QUESTION);

  // Brick rows
  setTile(tiles, 119, 9, TILE.BRICK);
  setTile(tiles, 121, 5, TILE.BRICK);
  setTile(tiles, 122, 5, TILE.BRICK);
  setTile(tiles, 123, 5, TILE.BRICK);
  setTile(tiles, 128, 5, TILE.BRICK);
  setTile(tiles, 129, 5, TILE.QUESTION); // fire flower
  setTile(tiles, 130, 5, TILE.BRICK);
  setTile(tiles, 129, 9, TILE.BRICK);

  // Brick platform
  setTile(tiles, 134, 9, TILE.BRICK);
  setTile(tiles, 135, 9, TILE.BRICK);
  setTile(tiles, 136, 9, TILE.BRICK);
  setTile(tiles, 137, 9, TILE.QUESTION);

  // Pipe
  setPipe(tiles, 163, 11, 2);

  // Staircase before flag
  for (let i = 0; i < 4; i++) {
    for (let row = GROUND_Y - 1 - i; row < GROUND_Y; row++) {
      setTile(tiles, 134 + 50 + i, row, TILE.BLOCK);
    }
  }

  // Staircase down
  for (let i = 0; i < 4; i++) {
    for (let row = GROUND_Y - 1 - (3 - i); row < GROUND_Y; row++) {
      setTile(tiles, 134 + 54 + i, row, TILE.BLOCK);
    }
  }

  // Final staircase to flag
  for (let i = 0; i < 9; i++) {
    for (let row = GROUND_Y - 1 - i; row < GROUND_Y; row++) {
      setTile(tiles, 198 - 9 + i, row, TILE.BLOCK);
    }
  }

  // Flag pole
  for (let row = 3; row < GROUND_Y; row++) {
    setTile(tiles, 198, row, TILE.FLAG_POLE);
  }
  setTile(tiles, 198, 2, TILE.FLAG_TOP);

  // Castle
  for (let col = 203; col < 208; col++) {
    for (let row = 8; row < GROUND_Y; row++) {
      setTile(tiles, col, row, TILE.CASTLE_BLOCK);
    }
  }
  setTile(tiles, 203, 7, TILE.CASTLE_TOP);
  setTile(tiles, 204, 7, TILE.CASTLE_TOP);
  setTile(tiles, 205, 7, TILE.CASTLE_TOP);
  setTile(tiles, 206, 7, TILE.CASTLE_TOP);
  setTile(tiles, 207, 7, TILE.CASTLE_TOP);
  setTile(tiles, 205, 11, TILE.CASTLE_DOOR);
  setTile(tiles, 205, 12, TILE.CASTLE_DOOR);

  return { tiles, width: LEVEL_WIDTH };
}

function setTile(tiles, col, row, type) {
  if (col >= 0 && col < LEVEL_WIDTH && row >= 0 && row < ROWS) {
    tiles[col][row] = type;
  }
}

function setPipe(tiles, col, topRow, height) {
  setTile(tiles, col, topRow, TILE.PIPE_TL);
  setTile(tiles, col + 1, topRow, TILE.PIPE_TR);
  for (let i = 1; i < height; i++) {
    setTile(tiles, col, topRow + i, TILE.PIPE_BL);
    setTile(tiles, col + 1, topRow + i, TILE.PIPE_BR);
  }
}

export function isSolidTile(type) {
  return type === TILE.GROUND ||
         type === TILE.BRICK ||
         type === TILE.QUESTION ||
         type === TILE.QUESTION_USED ||
         type === TILE.PIPE_TL ||
         type === TILE.PIPE_TR ||
         type === TILE.PIPE_BL ||
         type === TILE.PIPE_BR ||
         type === TILE.BLOCK ||
         type === TILE.CASTLE_BLOCK;
}

export function isBreakable(type) {
  return type === TILE.BRICK;
}

export function isQuestion(type) {
  return type === TILE.QUESTION;
}

// Items stored in question blocks and select bricks
// Key: "col,row" => item type
export function getBlockContents() {
  return {
    '16,9': 'coin',
    '22,9': 'mushroom',
    '24,9': 'coin',
    '22,5': 'coin',
    '79,9': 'coin',
    '93,9': 'coin',
    '94,5': 'mushroom',
    '106,5': 'coin',
    '109,5': 'coin',
    '109,9': 'coin',
    '112,9': 'coin',
    '129,5': 'fireflower',
    '137,9': 'star',
  };
}

// Enemy spawn data: [col, row, type]
export function getEnemySpawns() {
  return [
    [22, 12, 'goomba'],
    [40, 12, 'goomba'],
    [51, 12, 'goomba'],
    [52, 12, 'goomba'],
    [80, 4, 'goomba'],
    [82, 4, 'goomba'],
    [97, 12, 'koopa'],
    [105, 12, 'goomba'],
    [106, 12, 'goomba'],
    [114, 12, 'goomba'],
    [115, 12, 'goomba'],
    [124, 12, 'goomba'],
    [125, 12, 'goomba'],
    [128, 12, 'goomba'],
    [129, 12, 'goomba'],
    [174, 12, 'goomba'],
    [175, 12, 'goomba'],
  ];
}

// Coin positions for static coins
export function getCoinPositions() {
  return [];
}

export function getTileNameForSprite(type) {
  switch (type) {
    case TILE.GROUND: return 'ground';
    case TILE.BRICK: return 'brick';
    case TILE.QUESTION: return 'question';
    case TILE.QUESTION_USED: return 'question_used';
    case TILE.PIPE_TL: return 'pipe_tl';
    case TILE.PIPE_TR: return 'pipe_tr';
    case TILE.PIPE_BL: return 'pipe_bl';
    case TILE.PIPE_BR: return 'pipe_br';
    case TILE.BLOCK: return 'block';
    case TILE.FLAG_POLE: return 'flag_pole';
    case TILE.FLAG_TOP: return 'flag_top';
    case TILE.CASTLE_BLOCK: return 'castle_block';
    case TILE.CASTLE_TOP: return 'castle_top';
    case TILE.CASTLE_DOOR: return 'castle_door';
    default: return null;
  }
}

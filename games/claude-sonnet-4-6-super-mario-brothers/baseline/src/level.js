import { TILE, TILE_SIZE, LEVEL_ROWS, SOLID_TILES, FLAGPOLE_X_TILE } from './constants.js';

export const LEVEL_COLS = 210;

// ─── Level builder ────────────────────────────────────────────────────────────

function buildLevelData() {
  const ROWS = LEVEL_ROWS; // 15
  const COLS = LEVEL_COLS; // 210
  const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(TILE.EMPTY));

  function fill(c1, r1, c2, r2, t) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = t;
  }
  function set(c, r, t) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = t;
  }
  function pipe(c, height) {
    // height = number of tiles tall; ground surface is row 11
    const topRow = 11 - height;
    set(c,     topRow, TILE.PIPE_TL);
    set(c + 1, topRow, TILE.PIPE_TR);
    for (let r = topRow + 1; r <= 10; r++) {
      set(c,     r, TILE.PIPE_BL);
      set(c + 1, r, TILE.PIPE_BR);
    }
  }

  // ── Ground ─────────────────────────────────────────────────────────────────
  fill(0, 11, COLS - 1, 14, TILE.GROUND);
  // Pit at cols 82-85 (4 tiles wide)
  fill(82, 11, 85, 14, TILE.EMPTY);

  // ── Floating blocks (row 7 = 4 tiles above ground top at row 11) ──────────
  // First group (near start)
  set(16, 7, TILE.QUESTION);      // coin
  set(20, 7, TILE.QUESTION_MU);   // mushroom (first power-up)
  set(21, 7, TILE.BRICK);
  set(22, 7, TILE.QUESTION);      // coin
  set(23, 7, TILE.BRICK);

  // High block group at row 4
  set(24, 4, TILE.BRICK);
  set(25, 4, TILE.BRICK);
  set(26, 4, TILE.QUESTION);      // coin
  set(27, 4, TILE.BRICK);

  set(26, 7, TILE.QUESTION);      // coin
  set(27, 7, TILE.BRICK);

  // Second block group
  set(35, 7, TILE.BRICK);
  set(36, 7, TILE.QUESTION);      // coin
  set(37, 7, TILE.QUESTION);      // coin
  set(38, 7, TILE.BRICK);

  // High platform row 4 near first gap area
  set(55, 4, TILE.QUESTION);      // coin
  set(56, 4, TILE.BRICK);
  set(57, 4, TILE.BRICK);
  set(58, 4, TILE.QUESTION);

  // Blocks before pit
  set(60, 7, TILE.BRICK);
  set(61, 7, TILE.QUESTION);      // coin
  set(62, 7, TILE.BRICK);
  set(63, 7, TILE.QUESTION);
  set(64, 7, TILE.BRICK);

  // Coin tiles floating in air after pit
  for (let c = 91; c <= 95; c++) set(c, 7, TILE.COIN);

  // Bricks and questions mid-level
  set(100, 7, TILE.BRICK);
  set(101, 7, TILE.QUESTION);
  set(102, 7, TILE.BRICK);

  // Wide platform row 6 (taller platform)
  fill(110, 6, 115, 6, TILE.BRICK);
  set(112, 6, TILE.QUESTION);

  // More blocks
  set(120, 7, TILE.BRICK);
  set(121, 7, TILE.QUESTION);
  set(122, 7, TILE.BRICK);
  set(123, 7, TILE.QUESTION);
  set(124, 7, TILE.BRICK);

  // High row blocks before staircase
  set(130, 4, TILE.QUESTION);
  set(131, 4, TILE.BRICK);
  set(132, 4, TILE.QUESTION);

  // ── Pipes ──────────────────────────────────────────────────────────────────
  pipe(28, 2);   // 2 tall
  pipe(38, 3);   // 3 tall
  pipe(46, 4);   // 4 tall
  pipe(57, 4);   // 4 tall (near gap)
  pipe(70, 2);   // 2 tall (just before pit)
  pipe(88, 3);   // 3 tall (just after pit)
  pipe(140, 2);
  pipe(155, 3);
  pipe(165, 2);

  // ── Staircase before flagpole ──────────────────────────────────────────────
  // Going up: cols 177-183
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j <= i; j++) {
      set(177 + i, 10 - j, TILE.GROUND);
    }
  }
  // Going down: cols 185-191
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j <= 7 - i; j++) {
      set(185 + i, 10 - j, TILE.GROUND);
    }
  }

  // ── Flagpole marker (solid block base) ─────────────────────────────────────
  // The visual flagpole is drawn by the renderer as a special landmark,
  // but we add a solid tile at the base to stop Mario.
  set(FLAGPOLE_X_TILE, 11, TILE.SOLID);

  // ── End castle wall ────────────────────────────────────────────────────────
  fill(200, 5, 209, 14, TILE.GROUND);

  return grid;
}

// ─── Enemy / item spawn descriptors ──────────────────────────────────────────

// type: 'goomba' | 'mushroom'
// col, row: tile column/row where entity spawns (above ground row)
export const ENEMY_SPAWNS = [
  { type: 'goomba', col: 22,  row: 11 },
  { type: 'goomba', col: 24,  row: 11 },
  { type: 'goomba', col: 40,  row: 11 },
  { type: 'goomba', col: 50,  row: 11 },
  { type: 'goomba', col: 51,  row: 11 },
  { type: 'goomba', col: 63,  row: 11 },
  { type: 'goomba', col: 75,  row: 11 },
  { type: 'goomba', col: 91,  row: 11 },
  { type: 'goomba', col: 93,  row: 11 },
  { type: 'goomba', col: 102, row: 11 },
  { type: 'goomba', col: 115, row: 11 },
  { type: 'goomba', col: 116, row: 11 },
  { type: 'goomba', col: 125, row: 11 },
  { type: 'goomba', col: 130, row: 11 },
  { type: 'goomba', col: 145, row: 11 },
  { type: 'goomba', col: 160, row: 11 },
  { type: 'goomba', col: 161, row: 11 },
  { type: 'goomba', col: 175, row: 11 },
  { type: 'goomba', col: 176, row: 11 },
];

// ─── TileMap class ─────────────────────────────────────────────────────────────

export class TileMap {
  constructor() {
    this.cols  = LEVEL_COLS;
    this.rows  = LEVEL_ROWS;
    this.grid  = buildLevelData();
    this.width  = LEVEL_COLS * TILE_SIZE;
    this.height = LEVEL_ROWS * TILE_SIZE;
  }

  get(col, row) {
    if (col < 0 || col >= this.cols) return TILE.EMPTY;
    if (row < 0) return TILE.EMPTY;
    if (row >= this.rows) return TILE.GROUND; // treat below map as solid
    return this.grid[row][col];
  }

  set(col, row, t) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.grid[row][col] = t;
    }
  }

  isSolid(col, row) {
    return SOLID_TILES.has(this.get(col, row));
  }

  /** Returns the tile type at world pixel coordinates (x,y) */
  getTileAt(wx, wy) {
    return this.get(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE));
  }

  isSolidAt(wx, wy) {
    return SOLID_TILES.has(this.getTileAt(wx, wy));
  }

  tileCol(wx) { return Math.floor(wx / TILE_SIZE); }
  tileRow(wy) { return Math.floor(wy / TILE_SIZE); }
}

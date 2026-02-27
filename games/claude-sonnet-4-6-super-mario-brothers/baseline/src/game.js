import { CANVAS_W, CANVAS_H, TILE_SIZE, TILE, STATE, FLAGPOLE_X_TILE } from './constants.js';
import { Input } from './input.js';
import { TileMap, ENEMY_SPAWNS, LEVEL_COLS } from './level.js';
import {
  Mario, Goomba, Mushroom, PopupCoin, BrickFragment, ScoreText,
} from './entities.js';
import {
  drawTile, drawMario, drawGoomba, drawMushroom, drawCoin,
  drawFlagpole, drawHUD,
  drawTitleScreen, drawGameOverScreen, drawLevelClearScreen,
} from './sprites.js';

const STARTING_LIVES = 3;
const LEVEL_TIME     = 400; // seconds
const MARIO_START_X  = 2 * TILE_SIZE;
const MARIO_START_Y  = 11 * TILE_SIZE - 28; // stands on ground row 11

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;

    this.input = new Input();
    this._reset();
  }

  // ─── Public ─────────────────────────────────────────────────────────────────

  start() {
    this.state = STATE.TITLE;
    requestAnimationFrame(this._loop.bind(this));
  }

  // ─── Internal loop ───────────────────────────────────────────────────────────

  _loop(timestamp) {
    this._update();
    this._render();
    this.input.endFrame();
    requestAnimationFrame(this._loop.bind(this));
  }

  // ─── Reset / init ────────────────────────────────────────────────────────────

  _reset() {
    this.state     = STATE.TITLE;
    this.score     = 0;
    this.coins     = 0;
    this.lives     = STARTING_LIVES;
    this.timeLeft  = LEVEL_TIME;
    this._timeTick = 0;
    this._animTick = 0;
    this._stateTimer = 0;
    this._bonusScore = 0;
    this._cameraX = 0;
    this._collectedCoins = new Set(); // tracks which coin-tiles were collected
    this._initLevel();
  }

  _initLevel() {
    this.tilemap  = new TileMap();
    this.mario    = new Mario(MARIO_START_X, MARIO_START_Y);
    this.goombas  = ENEMY_SPAWNS
      .filter(s => s.type === 'goomba')
      .map(s => new Goomba(
        s.col * TILE_SIZE,
        (s.row - 1) * TILE_SIZE - 28  // one tile above ground row = on ground surface
      ));
    this.mushrooms      = [];
    this.popupCoins     = [];
    this.brickFragments = [];
    this.scoreTexts     = [];
    this.timeLeft       = LEVEL_TIME;
    this._timeTick      = 0;
    this._animTick      = 0;
    this._stateTimer    = 0;
    this._cameraX       = 0;
    this._collectedCoins = new Set();
  }

  _respawn() {
    this.lives--;
    if (this.lives <= 0) {
      this.state = STATE.GAME_OVER;
    } else {
      this._initLevel();
      this.state = STATE.PLAYING;
    }
  }

  // ─── Update ──────────────────────────────────────────────────────────────────

  _update() {
    this._animTick++;

    switch (this.state) {
      case STATE.TITLE:       this._updateTitle();      break;
      case STATE.PLAYING:     this._updatePlaying();    break;
      case STATE.DYING:       this._updateDying();      break;
      case STATE.LEVEL_CLEAR: this._updateLevelClear(); break;
      case STATE.GAME_OVER:   this._updateGameOver();   break;
    }
  }

  _updateTitle() {
    if (this.input.start) {
      this._reset();
      this.state = STATE.PLAYING;
    }
  }

  _updatePlaying() {
    // Timer
    this._timeTick++;
    if (this._timeTick >= 60) {
      this._timeTick = 0;
      this.timeLeft = Math.max(0, this.timeLeft - 1);
      if (this.timeLeft === 0) this.marioDie(); // time up
    }

    const m = this.mario;

    // Mario update
    m.update(this.input, this.tilemap, this);

    // Camera: follow Mario, don't scroll back
    const targetCamX = m.x - CANVAS_W * 0.38;
    this._cameraX = Math.max(
      this._cameraX,            // never scroll left
      Math.min(targetCamX, this.tilemap.width - CANVAS_W)
    );
    this._cameraX = Math.max(0, this._cameraX);

    // Enemies
    for (const g of this.goombas) {
      g.update(this.tilemap);
      g.collideWithMario(m, this);
    }
    this.goombas = this.goombas.filter(g => g.alive);

    // Power-ups
    for (const mu of this.mushrooms) {
      mu.update(this.tilemap);
      mu.collideWithMario(m, this);
    }
    this.mushrooms = this.mushrooms.filter(mu => mu.alive);

    // Coin tiles (walk-over collection)
    this._checkCoinTiles();

    // Particles
    for (const p of this.popupCoins)     p.update();
    for (const b of this.brickFragments) b.update();
    for (const t of this.scoreTexts)     t.update();
    this.popupCoins     = this.popupCoins.filter(p => p.alive);
    this.brickFragments = this.brickFragments.filter(b => b.alive);
    this.scoreTexts     = this.scoreTexts.filter(t => t.alive);
  }

  _updateDying() {
    this._stateTimer++;
    this.mario._updateDying();
    if (this._stateTimer > 120) this._respawn();
  }

  _updateLevelClear() {
    this._stateTimer++;
    // Mario continues walking into the castle
    this.mario.update(this.input, this.tilemap, this);
    if (this._stateTimer > 300) {
      this._reset();
      this.state = STATE.PLAYING;
    }
  }

  _updateGameOver() {
    this._stateTimer++;
    if (this._stateTimer > 60 && this.input.start) {
      this._reset();
      this.state = STATE.PLAYING;
    }
  }

  // ─── Game events (called from entities) ──────────────────────────────────────

  marioDie() {
    if (this.state !== STATE.PLAYING) return;
    this.mario.dying = true;
    this.mario.vx = 0;
    this.mario.vy = 0;
    this.state = STATE.DYING;
    this._stateTimer = 0;
  }

  marioHit() {
    // Delegated to Mario.takeDamage (which calls marioDie if small)
  }

  onFlagpoleGrab() {
    // Nothing extra needed; Mario handles the slide
  }

  onFlagpoleBottom() {
    // Time bonus
    this._bonusScore = Math.ceil(this.timeLeft) * 50;
    this.score += this._bonusScore;
  }

  triggerLevelClear() {
    if (this.state === STATE.LEVEL_CLEAR) return;
    this.state = STATE.LEVEL_CLEAR;
    this._stateTimer = 0;
  }

  /** Called when Mario hits a tile from below */
  triggerBlockHit(col, row, mario) {
    const t = this.tilemap.get(col, row);
    switch (t) {
      case TILE.QUESTION:
        this.tilemap.set(col, row, TILE.USED);
        this._spawnPopupCoin(col, row);
        this.addScore(200, col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE);
        break;
      case TILE.QUESTION_MU:
        this.tilemap.set(col, row, TILE.USED);
        this._spawnMushroom(col, row, mario);
        break;
      case TILE.BRICK:
        if (mario.form === 'big') {
          this.tilemap.set(col, row, TILE.EMPTY);
          this._spawnBrickFragments(col, row);
          this.addScore(50, col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE);
        }
        // Small Mario: brick shakes but doesn't break (visual handled via animTick elsewhere)
        break;
    }
  }

  addScore(points, wx, wy) {
    this.score += points;
    if (wx !== undefined) {
      this.scoreTexts.push(new ScoreText(wx - this._cameraX - 16, wy - 10, '+' + points));
    }
  }

  collectCoin() {
    this.coins++;
    this.score += 200;
    if (this.coins >= 100) {
      this.coins -= 100;
      this.lives++;
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  _spawnPopupCoin(col, row) {
    this.popupCoins.push(new PopupCoin(
      col * TILE_SIZE + TILE_SIZE / 2 - 8,
      row * TILE_SIZE - TILE_SIZE
    ));
    this.collectCoin();
  }

  _spawnMushroom(col, row, mario) {
    const mu = new Mushroom(
      col * TILE_SIZE + (TILE_SIZE - 24) / 2,
      row * TILE_SIZE - 24
    );
    // Start mushroom moving away from Mario
    mu.vx = mario.facing >= 0 ? 2 : -2;
    this.mushrooms.push(mu);
  }

  _spawnBrickFragments(col, row) {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    const vecs = [[-3,-8],[-1,-10],[1,-10],[3,-8]];
    for (const [vx, vy] of vecs) {
      this.brickFragments.push(new BrickFragment(cx - 4, cy - 4, vx, vy));
    }
  }

  _checkCoinTiles() {
    const m = this.mario;
    // Check a small area around Mario for coin tiles
    const x1 = m.x + 4, x2 = m.x + m.width - 4;
    const y1 = m.y + 4, y2 = m.y + m.height - 4;
    const cols = [
      this.tilemap.tileCol(x1),
      this.tilemap.tileCol(x2),
    ];
    const rows = [
      this.tilemap.tileRow(y1),
      this.tilemap.tileRow(y2),
    ];
    for (const c of cols) {
      for (const r of rows) {
        const key = `${c},${r}`;
        if (!this._collectedCoins.has(key) && this.tilemap.get(c, r) === TILE.COIN) {
          this._collectedCoins.add(key);
          this.tilemap.set(c, r, TILE.EMPTY);
          this.collectCoin();
          this.scoreTexts.push(new ScoreText(
            c * TILE_SIZE - this._cameraX,
            r * TILE_SIZE - 12,
            '+200'
          ));
        }
      }
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  _render() {
    const ctx  = this.ctx;
    const camX = this._cameraX;

    switch (this.state) {
      case STATE.TITLE:
        drawTitleScreen(ctx, CANVAS_W, CANVAS_H);
        return;
      case STATE.GAME_OVER:
        this._renderGame(ctx, camX);
        drawGameOverScreen(ctx, CANVAS_W, CANVAS_H, this.score);
        return;
      case STATE.LEVEL_CLEAR:
        this._renderGame(ctx, camX);
        drawLevelClearScreen(ctx, CANVAS_W, CANVAS_H, this.score, this._bonusScore);
        return;
    }

    this._renderGame(ctx, camX);
  }

  _renderGame(ctx, camX) {
    // Sky
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Tiles
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol   = Math.ceil((camX + CANVAS_W) / TILE_SIZE) + 1;
    for (let row = 0; row < this.tilemap.rows; row++) {
      for (let col = startCol; col < endCol; col++) {
        const t = this.tilemap.get(col, row);
        if (t !== 0) {
          drawTile(ctx, t, col * TILE_SIZE - camX, row * TILE_SIZE, this._animTick);
        }
      }
    }

    // Flagpole
    const poleScreenX = FLAGPOLE_X_TILE * TILE_SIZE - camX;
    if (poleScreenX > -64 && poleScreenX < CANVAS_W + 64) {
      drawFlagpole(ctx, poleScreenX, 11 * TILE_SIZE);
    }

    // Brick fragments
    ctx.fillStyle = '#c84020';
    for (const b of this.brickFragments) {
      ctx.fillRect(b.x - camX, b.y, 8, 8);
    }

    // Popup coins
    for (const pc of this.popupCoins) {
      drawCoin(ctx, pc.x - camX + 8, pc.y + 8, 8);
    }

    // Mushrooms
    for (const mu of this.mushrooms) {
      drawMushroom(ctx, mu.x - camX, mu.y, mu.width, mu.height);
    }

    // Goombas
    for (const g of this.goombas) {
      const gsx = g.x - camX;
      if (gsx > -64 && gsx < CANVAS_W + 64) {
        drawGoomba(ctx, gsx, g.y, g.width, g.height, g.squished);
      }
    }

    // Mario
    const m = this.mario;
    if (!m.dying || Math.floor(this._animTick / 4) % 2 === 0) {
      drawMario(
        ctx,
        m.x - camX, m.y,
        m.width, m.height,
        m.facing, m.form,
        m.animFrame, m.invincible
      );
    }

    // Score texts
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (const t of this.scoreTexts) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText(t.text, t.x, t.y);
    }

    // HUD
    drawHUD(ctx, this.score, this.coins, this.lives, '1-1', this.timeLeft);
  }
}

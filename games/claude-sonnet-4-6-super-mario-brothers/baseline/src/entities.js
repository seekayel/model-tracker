import {
  TILE_SIZE, GRAVITY, MAX_FALL, JUMP_VEL, JUMP_HOLD_FRAMES,
  WALK_SPEED, RUN_SPEED, COYOTE_FRAMES, JUMP_BUFFER_FRAMES,
  ENEMY_SPEED, CANVAS_H, TILE, SOLID_TILES, FLAGPOLE_X_TILE,
} from './constants.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function overlapsAABB(a, b) {
  return a.x < b.x + b.width  &&
         a.x + a.width  > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// ─── Mario ────────────────────────────────────────────────────────────────────

export class Mario {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.form = 'small';   // 'small' | 'big'
    this.facing = 1;       // 1 = right, -1 = left
    this.grounded = false;

    this._jumpHold    = 0; // remaining extra-height frames
    this._coyote      = 0; // coyote-time frames
    this._jumpBuf     = 0; // jump-press buffer frames
    this.invincible   = 0; // invincibility frames after hit

    this.alive        = true;
    this.dying        = false;
    this._dyingTimer  = 0;
    this.onFlagpole   = false;
    this._flagDone    = false;

    this.animFrame = 0;
    this._animTimer = 0;
  }

  get width()  { return 24; }
  get height() { return this.form === 'big' ? 44 : 28; }

  // Entry point each frame
  update(input, tilemap, game) {
    if (this.dying) {
      this._updateDying();
      return;
    }
    if (this.onFlagpole) {
      this._updateFlagpole(game);
      return;
    }

    this._handleInput(input);
    this._applyGravity();
    this._resolveCollisions(tilemap, game);
    this._checkFallDeath(game);
    this._checkFlagpole(game);
    this._tickAnimation();
    if (this.invincible > 0) this.invincible--;
  }

  _handleInput(input) {
    const targetSpeed = input.run ? RUN_SPEED : WALK_SPEED;

    if (input.left) {
      this.vx = Math.max(this.vx - 0.6, -targetSpeed);
      this.facing = -1;
    } else if (input.right) {
      this.vx = Math.min(this.vx + 0.6, targetSpeed);
      this.facing = 1;
    } else {
      this.vx *= this.grounded ? 0.76 : 0.92;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // Jump buffer (remember jump press for a few frames)
    if (input.jumpPressed) this._jumpBuf = JUMP_BUFFER_FRAMES;
    if (this._jumpBuf > 0) this._jumpBuf--;

    // Coyote time
    if (this.grounded) {
      this._coyote = COYOTE_FRAMES;
    } else if (this._coyote > 0) {
      this._coyote--;
    }

    // Execute jump
    if (this._jumpBuf > 0 && this._coyote > 0) {
      this.vy = JUMP_VEL;
      this._jumpHold = JUMP_HOLD_FRAMES;
      this.grounded = false;
      this._coyote  = 0;
      this._jumpBuf = 0;
    }

    // Variable jump height: extra upward force while holding jump
    if (this._jumpHold > 0) {
      if (input.jump && this.vy < 0) {
        this.vy -= 0.45;
        this._jumpHold--;
      } else {
        this._jumpHold = 0;
      }
    }
  }

  _applyGravity() {
    if (!this.grounded) {
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);
    }
  }

  _resolveCollisions(tilemap, game) {
    this.grounded = false;

    // ── Horizontal ──────────────────────────────────────────────────────────
    this.x += this.vx;
    if (this.x < 0) { this.x = 0; this.vx = 0; }

    const iY1 = this.y + 3;
    const iY2 = this.y + this.height - 3;

    if (this.vx > 0) {
      const col = tilemap.tileCol(this.x + this.width - 1);
      if (tilemap.isSolid(col, tilemap.tileRow(iY1)) ||
          tilemap.isSolid(col, tilemap.tileRow(iY2))) {
        this.x = col * TILE_SIZE - this.width;
        this.vx = 0;
      }
    } else if (this.vx < 0) {
      const col = tilemap.tileCol(this.x);
      if (tilemap.isSolid(col, tilemap.tileRow(iY1)) ||
          tilemap.isSolid(col, tilemap.tileRow(iY2))) {
        this.x = (col + 1) * TILE_SIZE;
        this.vx = 0;
      }
    }

    // ── Vertical ────────────────────────────────────────────────────────────
    this.y += this.vy;

    const iX1 = this.x + 3;
    const iX2 = this.x + this.width - 3;

    if (this.vy >= 0) {
      // Moving down or still
      const row = tilemap.tileRow(this.y + this.height - 1);
      if (tilemap.isSolid(tilemap.tileCol(iX1), row) ||
          tilemap.isSolid(tilemap.tileCol(iX2), row)) {
        this.y = row * TILE_SIZE - this.height;
        this.vy = 0;
        this.grounded = true;
      }
    } else {
      // Moving up
      const row = tilemap.tileRow(this.y);
      const colL = tilemap.tileCol(iX1);
      const colR = tilemap.tileCol(iX2);
      const hitL = tilemap.isSolid(colL, row);
      const hitR = tilemap.isSolid(colR, row);
      if (hitL || hitR) {
        this.y = (row + 1) * TILE_SIZE;
        this.vy = 0;
        if (hitL) game.triggerBlockHit(colL, row, this);
        if (hitR && colR !== colL) game.triggerBlockHit(colR, row, this);
      }
    }
  }

  _checkFallDeath(game) {
    if (this.y > CANVAS_H + 80) game.marioDie();
  }

  _checkFlagpole(game) {
    const poleWorldX = FLAGPOLE_X_TILE * TILE_SIZE;
    if (!this.onFlagpole && this.x + this.width > poleWorldX && this.x < poleWorldX + 8) {
      this.onFlagpole = true;
      this.vx = 0;
      this.vy = 0;
      this.x  = poleWorldX - this.width + 2;
      game.onFlagpoleGrab();
    }
  }

  _updateFlagpole(game) {
    const groundY = 11 * TILE_SIZE - this.height;
    if (this.y < groundY) {
      this.y = Math.min(this.y + 3, groundY);
    } else {
      if (!this._flagDone) {
        this._flagDone = true;
        game.onFlagpoleBottom();
      }
      // Walk right into castle
      this.x += 2;
      if (this.x > (FLAGPOLE_X_TILE + 4) * TILE_SIZE) {
        game.triggerLevelClear();
      }
    }
  }

  _updateDying() {
    this._dyingTimer++;
    if (this._dyingTimer === 10) this.vy = -13; // pop up
    if (this._dyingTimer > 10)  this.vy += 0.6; // fall down
    if (this._dyingTimer > 10)  this.y  += this.vy;
  }

  _tickAnimation() {
    if (Math.abs(this.vx) > 0.2 && this.grounded) {
      this._animTimer++;
      if (this._animTimer >= 5) {
        this._animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
    }
  }

  /** Called when Mario touches an enemy or hazard */
  takeDamage(game) {
    if (this.invincible > 0) return;
    if (this.form === 'big') {
      this.form = 'small';
      // Shift y so feet stay on ground
      this.y += 16;
      this.invincible = 120;
    } else {
      game.marioDie();
    }
  }
}

// ─── Goomba ───────────────────────────────────────────────────────────────────

export class Goomba {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = -ENEMY_SPEED;
    this.vy = 0;
    this.width  = 28;
    this.height = 28;
    this.alive    = true;
    this.squished = false;
    this._squishTimer = 0;
    this.grounded = false;
  }

  update(tilemap) {
    if (!this.alive) return;
    if (this.squished) {
      this._squishTimer++;
      if (this._squishTimer > 30) this.alive = false;
      return;
    }

    // Gravity
    this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);

    // Horizontal
    this.x += this.vx;
    // Wall collision
    const midY = this.y + this.height / 2;
    if (this.vx > 0) {
      const col = tilemap.tileCol(this.x + this.width - 1);
      if (tilemap.isSolid(col, tilemap.tileRow(midY))) {
        this.x = col * TILE_SIZE - this.width;
        this.vx = -ENEMY_SPEED;
      }
    } else if (this.vx < 0) {
      const col = tilemap.tileCol(this.x);
      if (tilemap.isSolid(col, tilemap.tileRow(midY))) {
        this.x = (col + 1) * TILE_SIZE;
        this.vx = ENEMY_SPEED;
      }
    }

    // Check edge (no ground ahead → turn around)
    if (this.grounded) {
      const edgeX = this.vx > 0 ? this.x + this.width + 1 : this.x - 1;
      const groundRow = tilemap.tileRow(this.y + this.height + 4);
      if (!tilemap.isSolid(tilemap.tileCol(edgeX), groundRow)) {
        this.vx = -this.vx;
      }
    }

    // Vertical
    this.y += this.vy;
    this.grounded = false;
    if (this.vy >= 0) {
      const row = tilemap.tileRow(this.y + this.height - 1);
      const colL = tilemap.tileCol(this.x + 3);
      const colR = tilemap.tileCol(this.x + this.width - 3);
      if (tilemap.isSolid(colL, row) || tilemap.isSolid(colR, row)) {
        this.y = row * TILE_SIZE - this.height;
        this.vy = 0;
        this.grounded = true;
      }
    }
  }

  stomp() {
    this.squished = true;
    this.vy = 0;
    this.vx = 0;
  }

  /** Check collision with Mario and handle it */
  collideWithMario(mario, game) {
    if (!this.alive || this.squished) return;
    if (!overlapsAABB(mario, this)) return;

    // Stomp: Mario's feet are above the goomba's midpoint and moving down
    if (mario.vy > 0 && mario.y + mario.height - 6 < this.y + this.height / 2) {
      this.stomp();
      mario.vy = -7; // bounce
      game.addScore(100, this.x + this.width / 2, this.y);
    } else {
      mario.takeDamage(game);
    }
  }
}

// ─── Mushroom (power-up) ──────────────────────────────────────────────────────

export class Mushroom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 2;
    this.vy = 0;
    this.width  = 24;
    this.height = 24;
    this.alive  = true;
    this.grounded = false;
    // Spawn animation: pop up from block
    this._emerging = 8; // frames of emerging (moving up out of block)
  }

  update(tilemap) {
    if (!this.alive) return;
    if (this._emerging > 0) {
      this.y -= 2;
      this._emerging--;
      return;
    }

    this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);

    // Horizontal
    this.x += this.vx;
    if (this.vx > 0) {
      const col = tilemap.tileCol(this.x + this.width - 1);
      if (tilemap.isSolid(col, tilemap.tileRow(this.y + this.height / 2))) {
        this.x = col * TILE_SIZE - this.width;
        this.vx = -this.vx;
      }
    } else if (this.vx < 0) {
      const col = tilemap.tileCol(this.x);
      if (tilemap.isSolid(col, tilemap.tileRow(this.y + this.height / 2))) {
        this.x = (col + 1) * TILE_SIZE;
        this.vx = -this.vx;
      }
    }

    // Vertical
    this.y += this.vy;
    this.grounded = false;
    if (this.vy >= 0) {
      const row = tilemap.tileRow(this.y + this.height - 1);
      const colL = tilemap.tileCol(this.x + 2);
      const colR = tilemap.tileCol(this.x + this.width - 2);
      if (tilemap.isSolid(colL, row) || tilemap.isSolid(colR, row)) {
        this.y = row * TILE_SIZE - this.height;
        this.vy = 0;
        this.grounded = true;
      }
    }

    // Fall off map
    if (this.y > CANVAS_H + 100) this.alive = false;
  }

  collideWithMario(mario, game) {
    if (!this.alive) return;
    if (!overlapsAABB(mario, this)) return;
    this.alive = false;
    if (mario.form === 'small') {
      const oldHeight = mario.height;
      mario.form = 'big';
      mario.y -= (mario.height - oldHeight); // shift up so feet stay
    }
    game.addScore(1000, this.x + this.width / 2, this.y);
  }
}

// ─── PopupCoin (block-hit coin animation) ─────────────────────────────────────

export class PopupCoin {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    this.vy = -8;
    this.alive = true;
    this._timer = 0;
  }

  update() {
    this.vy += 0.5;
    this.y  += this.vy;
    this._timer++;
    if (this._timer > 40) this.alive = false;
  }
}

// ─── BrickFragment (brick break particle) ─────────────────────────────────────

export class BrickFragment {
  constructor(x, y, vx, vy) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.alive = true;
    this._timer = 0;
  }

  update() {
    this.vy += 0.5;
    this.x += this.vx;
    this.y += this.vy;
    this._timer++;
    if (this._timer > 50) this.alive = false;
  }
}

// ─── ScoreText (floating score popup) ─────────────────────────────────────────

export class ScoreText {
  constructor(x, y, text) {
    this.x = x; this.y = y;
    this.text = text;
    this.alive = true;
    this._timer = 0;
  }

  update() {
    this.y -= 1;
    this._timer++;
    if (this._timer > 50) this.alive = false;
  }
}

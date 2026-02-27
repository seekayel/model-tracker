import { TILE_SIZE, TERRAIN_DATA, UNIT_DATA, BUILDING_DATA, MAP_WIDTH, MAP_HEIGHT } from './constants.js';

const PAD = 6; // padding inside tile

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.cam    = { x: 0, y: 0 };   // camera offset in pixels
  }

  resize() {
    this.canvas.width  = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  // ── Coordinate transforms ──────────────────────────────────────────────────
  worldToScreen(wx, wy) {
    return {
      sx: wx * TILE_SIZE - this.cam.x,
      sy: wy * TILE_SIZE - this.cam.y,
    };
  }

  screenToWorld(sx, sy) {
    return {
      wx: Math.floor((sx + this.cam.x) / TILE_SIZE),
      wy: Math.floor((sy + this.cam.y) / TILE_SIZE),
    };
  }

  clampCamera() {
    const maxX = MAP_WIDTH  * TILE_SIZE - this.canvas.width;
    const maxY = MAP_HEIGHT * TILE_SIZE - this.canvas.height;
    this.cam.x = Math.max(0, Math.min(maxX, this.cam.x));
    this.cam.y = Math.max(0, Math.min(maxY, this.cam.y));
  }

  // ── Main render ───────────────────────────────────────────────────────────
  render(game) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this._renderTerrain(game);
    this._renderImprovements(game);
    this._renderHighlights(game);
    this._renderCities(game);
    this._renderUnits(game);
    this._renderGrid(game);
    this._renderMiniMap(game);
  }

  // ── Terrain ───────────────────────────────────────────────────────────────
  _renderTerrain(game) {
    const { ctx, cam } = this;
    const map = game.gameMap;
    const startX = Math.max(0, Math.floor(cam.x / TILE_SIZE));
    const startY = Math.max(0, Math.floor(cam.y / TILE_SIZE));
    const endX   = Math.min(map.width,  startX + Math.ceil(this.canvas.width  / TILE_SIZE) + 2);
    const endY   = Math.min(map.height, startY + Math.ceil(this.canvas.height / TILE_SIZE) + 2);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map.getTile(x, y);
        if (!tile) continue;
        const cfg = TERRAIN_DATA[tile.type];
        const { sx, sy } = this.worldToScreen(x, y);

        // Tile background
        ctx.fillStyle = cfg.color;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        // Subtle inner border
        ctx.strokeStyle = cfg.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

        // Terrain texture hints
        this._drawTerrainDetail(ctx, tile, sx, sy, cfg);
      }
    }
  }

  _drawTerrainDetail(ctx, tile, sx, sy, cfg) {
    const cx = sx + TILE_SIZE / 2;
    const cy = sy + TILE_SIZE / 2;

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.floor(TILE_SIZE * 0.38)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (tile.type) {
      case 'MOUNTAINS':
        ctx.fillText('▲', cx, cy);
        break;
      case 'FOREST':
        ctx.fillText('♠', cx, cy);
        break;
      case 'HILLS':
        ctx.fillText('∧', cx, cy + 4);
        break;
      case 'OCEAN':
        ctx.globalAlpha = 0.25;
        ctx.fillText('≈', cx, cy);
        break;
      case 'DESERT':
        ctx.globalAlpha = 0.2;
        ctx.fillText('∽', cx, cy);
        break;
      default:
        break;
    }
    ctx.restore();
  }

  // ── Tile improvements ─────────────────────────────────────────────────────
  _renderImprovements(game) {
    const { ctx, cam } = this;
    const map = game.gameMap;
    const startX = Math.max(0, Math.floor(cam.x / TILE_SIZE));
    const startY = Math.max(0, Math.floor(cam.y / TILE_SIZE));
    const endX   = Math.min(map.width,  startX + Math.ceil(this.canvas.width  / TILE_SIZE) + 2);
    const endY   = Math.min(map.height, startY + Math.ceil(this.canvas.height / TILE_SIZE) + 2);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map.getTile(x, y);
        if (!tile || !tile.improvement) continue;
        const { sx, sy } = this.worldToScreen(x, y);
        const cx = sx + TILE_SIZE - PAD - 6;
        const cy = sy + PAD + 6;

        ctx.save();
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tile.improvement === 'farm' ? '🌾' : '⛏', cx, cy);
        ctx.restore();
      }
    }
  }

  // ── Move/attack highlights ────────────────────────────────────────────────
  _renderHighlights(game) {
    const { ctx } = this;
    const { moveRange, attackRange } = game;

    for (const { x, y } of moveRange) {
      const { sx, sy } = this.worldToScreen(x, y);
      ctx.fillStyle = 'rgba(100, 220, 100, 0.30)';
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(100, 220, 100, 0.70)';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    for (const { x, y } of attackRange) {
      const { sx, sy } = this.worldToScreen(x, y);
      ctx.fillStyle = 'rgba(220, 60, 60, 0.30)';
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(220, 60, 60, 0.70)';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    // Selected tile outline
    if (game.selectedTile) {
      const { x, y } = game.selectedTile;
      const { sx, sy } = this.worldToScreen(x, y);
      ctx.strokeStyle = '#f0c040';
      ctx.lineWidth = 3;
      ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }
  }

  // ── Cities ────────────────────────────────────────────────────────────────
  _renderCities(game) {
    for (const player of [game.human, game.enemy]) {
      for (const city of player.cities) {
        this._drawCity(city, player.color, game);
      }
    }
  }

  _drawCity(city, color, game) {
    const { ctx } = this;
    const { sx, sy } = this.worldToScreen(city.x, city.y);
    const cx = sx + TILE_SIZE / 2;
    const cy = sy + TILE_SIZE / 2;
    const r  = TILE_SIZE * 0.34;

    // City base: filled circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // HP bar
    if (city.hp < city.maxHp) {
      const barW = TILE_SIZE - PAD * 2;
      const barH = 4;
      const bx   = sx + PAD;
      const by   = sy + PAD;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(bx, by, barW * (city.hp / city.maxHp), barH);
    }

    // Population badge
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(TILE_SIZE * 0.28)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(city.population, cx, cy);

    // City name below
    ctx.font = `bold ${Math.floor(TILE_SIZE * 0.22)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur  = 3;
    ctx.fillText(city.name, cx, sy + TILE_SIZE - PAD);
    ctx.restore();

    // Capital star
    if (city.isCapital) {
      ctx.save();
      ctx.font = `${Math.floor(TILE_SIZE * 0.22)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', cx, sy + PAD + 6);
      ctx.restore();
    }

    // Walls indicator
    if (city.buildings.includes('WALLS')) {
      ctx.save();
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Units ─────────────────────────────────────────────────────────────────
  _renderUnits(game) {
    const allUnits = [...game.human.units, ...game.enemy.units].filter(u => !u.isDead);
    for (const unit of allUnits) {
      this._drawUnit(unit, game);
    }
  }

  _drawUnit(unit, game) {
    const { ctx } = this;
    const { sx, sy } = this.worldToScreen(unit.x, unit.y);
    const cx = sx + TILE_SIZE / 2;
    const cy = sy + TILE_SIZE / 2;
    const r  = TILE_SIZE * 0.28;

    const color  = unit.owner.color;
    const isSelected = game.selectedUnit === unit;
    const noMoves    = unit.movesLeft === 0 || unit.sleeping || unit.fortified;

    // Selection ring
    if (isSelected) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#f0c040';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Body circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = noMoves ? this._darken(color) : color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Symbol
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(TILE_SIZE * 0.26)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(UNIT_DATA[unit.type].symbol, cx, cy);
    ctx.restore();

    // HP bar
    const barW = TILE_SIZE - PAD * 2 - 8;
    const barH = 3;
    const bx   = sx + PAD + 4;
    const by   = sy + TILE_SIZE - PAD - 4;
    ctx.fillStyle = '#222';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = unit.hp / unit.maxHp > 0.5 ? '#3fb950' : '#f85149';
    ctx.fillRect(bx, by, barW * (unit.hp / unit.maxHp), barH);

    // Sleeping/fortify indicator
    if (unit.sleeping) {
      ctx.save();
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ZZZ', cx, sy + PAD + 6);
      ctx.restore();
    } else if (unit.fortified) {
      ctx.save();
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[F]', cx, sy + PAD + 6);
      ctx.restore();
    }
  }

  _darken(hex) {
    // Darken a hex color by ~40%
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgb(${Math.floor(r*0.5)},${Math.floor(g*0.5)},${Math.floor(b*0.5)})`;
  }

  // ── Grid overlay ──────────────────────────────────────────────────────────
  _renderGrid(game) {
    const { ctx, cam } = this;
    const map = game.gameMap;
    const startX = Math.max(0, Math.floor(cam.x / TILE_SIZE));
    const startY = Math.max(0, Math.floor(cam.y / TILE_SIZE));
    const endX   = Math.min(map.width,  startX + Math.ceil(this.canvas.width  / TILE_SIZE) + 2);
    const endY   = Math.min(map.height, startY + Math.ceil(this.canvas.height / TILE_SIZE) + 2);

    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.5;

    for (let x = startX; x <= endX; x++) {
      const sx = x * TILE_SIZE - cam.x;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, this.canvas.height);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y++) {
      const sy = y * TILE_SIZE - cam.y;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(this.canvas.width, sy);
      ctx.stroke();
    }
  }

  // ── Mini-map ──────────────────────────────────────────────────────────────
  _renderMiniMap(game) {
    const { ctx, canvas } = this;
    const map = game.gameMap;
    const mw  = 160, mh = Math.floor(160 * map.height / map.width);
    const mx  = canvas.width - mw - 8;
    const my  = canvas.height - mh - 8;
    const tw  = mw / map.width;
    const th  = mh / map.height;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);

    // Terrain
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.getTile(x, y);
        ctx.fillStyle = TERRAIN_DATA[tile.type].color;
        ctx.fillRect(mx + x * tw, my + y * th, Math.ceil(tw), Math.ceil(th));
      }
    }

    // Cities
    for (const player of [game.human, game.enemy]) {
      for (const city of player.cities) {
        ctx.fillStyle = player.color;
        ctx.fillRect(mx + city.x * tw - 2, my + city.y * th - 2, 5, 5);
      }
    }

    // Units
    for (const player of [game.human, game.enemy]) {
      for (const unit of player.units) {
        if (unit.isDead) continue;
        ctx.fillStyle = player.color;
        ctx.fillRect(mx + unit.x * tw - 1, my + unit.y * th - 1, 3, 3);
      }
    }

    // Viewport rect
    const vpX = mx + (this.cam.x / TILE_SIZE) * tw;
    const vpY = my + (this.cam.y / TILE_SIZE) * th;
    const vpW = (canvas.width  / TILE_SIZE) * tw;
    const vpH = (canvas.height / TILE_SIZE) * th;
    ctx.strokeStyle = '#f0c040';
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
  }

  // ── Combat flash ─────────────────────────────────────────────────────────
  flashTile(x, y, color = 'rgba(255,255,0,0.6)', duration = 300) {
    const { ctx } = this;
    const { sx, sy } = this.worldToScreen(x, y);
    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    // Caller handles repaint after timeout
  }

  // Center camera on tile
  centerOn(tx, ty) {
    this.cam.x = tx * TILE_SIZE - this.canvas.width  / 2 + TILE_SIZE / 2;
    this.cam.y = ty * TILE_SIZE - this.canvas.height / 2 + TILE_SIZE / 2;
    this.clampCamera();
  }
}

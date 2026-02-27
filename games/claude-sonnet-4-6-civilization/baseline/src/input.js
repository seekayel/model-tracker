import { TILE_SIZE } from './constants.js';
import { Phase } from './game.js';

const CAM_SPEED = 8;  // pixels per keydown tick

export class InputHandler {
  constructor(canvas, game, renderer) {
    this.canvas   = canvas;
    this.game     = game;
    this.renderer = renderer;
    this._keys    = {};
    this._bound   = false;
    this._rafId   = null;
  }

  bind() {
    if (this._bound) return;
    this._bound = true;

    window.addEventListener('keydown', this._onKeyDown.bind(this));
    window.addEventListener('keyup',   this._onKeyUp.bind(this));
    this.canvas.addEventListener('click',   this._onClick.bind(this));
    this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));

    // Camera scroll loop
    this._scrollLoop();
  }

  _scrollLoop() {
    const step = () => {
      let moved = false;
      if (this._keys['ArrowLeft']  || this._keys['a'] || this._keys['A']) { this.renderer.cam.x -= CAM_SPEED; moved = true; }
      if (this._keys['ArrowRight'] || this._keys['d'] || this._keys['D']) { this.renderer.cam.x += CAM_SPEED; moved = true; }
      if (this._keys['ArrowUp']    || this._keys['w'] || this._keys['W']) { this.renderer.cam.y -= CAM_SPEED; moved = true; }
      if (this._keys['ArrowDown']  || this._keys['s'] || this._keys['S']) { this.renderer.cam.y += CAM_SPEED; moved = true; }
      if (moved) {
        this.renderer.clampCamera();
        this.game.onRender();
      }
      this._rafId = requestAnimationFrame(step);
    };
    this._rafId = requestAnimationFrame(step);
  }

  _onKeyDown(e) {
    this._keys[e.key] = true;

    if (this.game.phase !== Phase.PLAYER_TURN) return;

    switch (e.key) {
      case 'Escape':
        this.game.deselect();
        break;

      case 'f':
      case 'F':
        // Found city with selected settler
        this.game.foundCityPlayer();
        break;

      case ' ':
        e.preventDefault();
        this.game.endTurn();
        break;

      case 'Enter':
        this.game.endTurn();
        break;

      case 'Delete':
      case 'Backspace':
        // Delete (dismiss) selected unit
        if (this.game.selectedUnit) {
          this.game.human.removeUnit(this.game.selectedUnit);
          this.game.deselect();
          this.game.onRender();
        }
        break;

      case 'z':
      case 'Z':
        // Sleep unit
        if (this.game.selectedUnit) {
          this.game.selectedUnit.sleep();
          this.game.deselect();
          this.game.onRender();
        }
        break;

      case 'g':
      case 'G':
        // Fortify unit
        if (this.game.selectedUnit) {
          this.game.selectedUnit.fortify();
          this.game.deselect();
          this.game.onRender();
        }
        break;

      case 'Tab':
        // Cycle to next unit with moves
        e.preventDefault();
        this._cycleUnit();
        break;
    }
  }

  _onKeyUp(e) {
    this._keys[e.key] = false;
  }

  _onClick(e) {
    if (this.game.phase !== Phase.PLAYER_TURN) return;

    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { wx, wy } = this.renderer.screenToWorld(sx, sy);
    this.game.selectTile(wx, wy);
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { wx, wy } = this.renderer.screenToWorld(sx, sy);

    const tile = this.game.gameMap.getTile(wx, wy);
    if (tile) {
      const yields = this.game.gameMap.getYields(wx, wy);
      const unit   = this.game.unitAt(wx, wy);
      const city   = this.game.cityAt(wx, wy);

      let info = `[${wx},${wy}] ${tile.type}  🌾${yields.food} ⚙${yields.prod} 💰${yields.gold}`;
      if (unit)  info += `  | ${unit.owner.name}: ${unit.type} (${unit.hp}/${unit.maxHp} HP)`;
      if (city)  info += `  | ${city.name} pop:${city.population}`;

      document.getElementById('statusbar').textContent = info;
    }
  }

  _cycleUnit() {
    const units = this.game.human.units.filter(u => !u.isDead && u.movesLeft > 0 && !u.sleeping);
    if (!units.length) return;

    let idx = 0;
    if (this.game.selectedUnit) {
      const cur = units.indexOf(this.game.selectedUnit);
      idx = (cur + 1) % units.length;
    }
    const next = units[idx];
    this.game.deselect();
    this.game['_selectUnit'](next);
    this.renderer.centerOn(next.x, next.y);
  }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._bound = false;
  }
}

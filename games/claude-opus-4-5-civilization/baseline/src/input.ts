import { GameState, Unit, City, UnitType } from './types';
import { Renderer } from './renderer';
import { canMoveUnit, moveUnit, foundCity, updateVisibility } from './gameState';

export type InputCallback = {
  onEndTurn: () => void;
  onShowTechPanel: () => void;
  onUnitSelected: (unit: Unit | null) => void;
  onCitySelected: (city: City | null) => void;
  onNotification: (message: string) => void;
};

export class InputHandler {
  private keysDown: Set<string> = new Set();
  private renderer: Renderer;
  private state: GameState | null = null;
  private callbacks: InputCallback;

  // Camera movement speed
  private readonly CAMERA_SPEED = 15;

  constructor(renderer: Renderer, callbacks: InputCallback) {
    this.renderer = renderer;
    this.callbacks = callbacks;

    // Keyboard events
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Mouse events
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    canvas.addEventListener('click', (e) => this.handleClick(e));
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick(e);
    });

    // Minimap click
    const minimap = document.getElementById('minimap') as HTMLCanvasElement;
    minimap.addEventListener('click', (e) => this.handleMinimapClick(e));
  }

  public setGameState(state: GameState): void {
    this.state = state;
  }

  public update(): void {
    // Camera movement
    if (this.keysDown.has('ArrowLeft') || this.keysDown.has('KeyA')) {
      this.renderer.cameraX -= this.CAMERA_SPEED;
    }
    if (this.keysDown.has('ArrowRight') || this.keysDown.has('KeyD')) {
      this.renderer.cameraX += this.CAMERA_SPEED;
    }
    if (this.keysDown.has('ArrowUp') || this.keysDown.has('KeyW')) {
      this.renderer.cameraY -= this.CAMERA_SPEED;
    }
    if (this.keysDown.has('ArrowDown') || this.keysDown.has('KeyS')) {
      this.renderer.cameraY += this.CAMERA_SPEED;
    }

    // Clamp camera
    if (this.state) {
      const maxX = this.state.mapWidth * 40 - window.innerWidth;
      const maxY = this.state.mapHeight * 40 - window.innerHeight;
      this.renderer.cameraX = Math.max(0, Math.min(maxX, this.renderer.cameraX));
      this.renderer.cameraY = Math.max(0, Math.min(maxY, this.renderer.cameraY));
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    this.keysDown.add(e.code);

    if (!this.state || this.state.gameOver) return;

    switch (e.code) {
      case 'Space':
      case 'Enter':
        this.callbacks.onEndTurn();
        break;

      case 'Escape':
        this.state.selectedUnit = null;
        this.state.selectedCity = null;
        this.state.moveMode = false;
        this.callbacks.onUnitSelected(null);
        this.callbacks.onCitySelected(null);
        break;

      case 'KeyM':
        if (this.state.selectedUnit && this.state.selectedUnit.owner === this.state.currentPlayer) {
          this.state.moveMode = true;
          this.callbacks.onNotification('Click a tile to move');
        }
        break;

      case 'KeyB':
        // Build city (settler only)
        if (this.state.selectedUnit &&
            this.state.selectedUnit.type === UnitType.Settler &&
            this.state.selectedUnit.owner === this.state.currentPlayer) {
          const city = foundCity(this.state, this.state.selectedUnit);
          if (city) {
            this.callbacks.onNotification(`Founded ${city.name}!`);
            updateVisibility(this.state);
          } else {
            this.callbacks.onNotification('Cannot found city here');
          }
        }
        break;

      case 'KeyF':
        // Fortify unit
        if (this.state.selectedUnit && this.state.selectedUnit.owner === this.state.currentPlayer) {
          this.state.selectedUnit.fortified = true;
          this.state.selectedUnit.movementLeft = 0;
          this.callbacks.onNotification('Unit fortified');
        }
        break;

      case 'KeyT':
        this.callbacks.onShowTechPanel();
        break;

      // Number keys for city production
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
        this.handleProductionHotkey(parseInt(e.code.slice(-1)));
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.code);
  }

  private handleClick(e: MouseEvent): void {
    if (!this.state || this.state.gameOver) return;

    const worldPos = this.renderer.screenToWorld(e.clientX, e.clientY);
    const { x, y } = worldPos;

    // Check bounds
    if (x < 0 || x >= this.state.mapWidth || y < 0 || y >= this.state.mapHeight) return;

    const tile = this.state.map[y][x];

    // Movement mode
    if (this.state.moveMode && this.state.selectedUnit) {
      this.state.moveMode = false;

      if (canMoveUnit(this.state, this.state.selectedUnit, x, y)) {
        moveUnit(this.state, this.state.selectedUnit, x, y);
        updateVisibility(this.state);

        // Update selection if unit still exists
        if (this.state.units.includes(this.state.selectedUnit)) {
          this.callbacks.onUnitSelected(this.state.selectedUnit);
        } else {
          this.callbacks.onUnitSelected(null);
        }
      } else {
        this.callbacks.onNotification('Cannot move there');
      }
      return;
    }

    // Check for unit at clicked position
    const unit = this.state.units.find(u => u.x === x && u.y === y && tile.visible);
    if (unit) {
      this.state.selectedUnit = unit;
      this.state.selectedCity = null;
      this.callbacks.onUnitSelected(unit);
      this.callbacks.onCitySelected(null);
      return;
    }

    // Check for city at clicked position
    const city = this.state.cities.find(c => c.x === x && c.y === y && tile.visible);
    if (city) {
      this.state.selectedCity = city;
      this.state.selectedUnit = null;
      this.callbacks.onCitySelected(city);
      this.callbacks.onUnitSelected(null);
      return;
    }

    // Clicked empty tile - deselect
    this.state.selectedUnit = null;
    this.state.selectedCity = null;
    this.callbacks.onUnitSelected(null);
    this.callbacks.onCitySelected(null);
  }

  private handleRightClick(e: MouseEvent): void {
    if (!this.state || this.state.gameOver) return;

    const worldPos = this.renderer.screenToWorld(e.clientX, e.clientY);
    const { x, y } = worldPos;

    // Quick move with right click
    if (this.state.selectedUnit && this.state.selectedUnit.owner === this.state.currentPlayer) {
      if (canMoveUnit(this.state, this.state.selectedUnit, x, y)) {
        moveUnit(this.state, this.state.selectedUnit, x, y);
        updateVisibility(this.state);

        if (this.state.units.includes(this.state.selectedUnit)) {
          this.callbacks.onUnitSelected(this.state.selectedUnit);
        } else {
          this.callbacks.onUnitSelected(null);
        }
      }
    }
  }

  private handleMinimapClick(e: MouseEvent): void {
    if (!this.state) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const minimapX = e.clientX - rect.left;
    const minimapY = e.clientY - rect.top;

    // Convert to world coordinates
    const worldX = (minimapX / 200) * this.state.mapWidth;
    const worldY = (minimapY / 150) * this.state.mapHeight;

    this.renderer.centerOn(worldX, worldY);
  }

  private handleProductionHotkey(_num: number): void {
    if (!this.state?.selectedCity || this.state.selectedCity.owner !== this.state.currentPlayer) return;

    // Trigger production selection through the UI
    // This will be handled by the UI component
  }
}

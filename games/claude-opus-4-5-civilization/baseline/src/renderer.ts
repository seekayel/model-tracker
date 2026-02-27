import {
  GameState,
  Tile,
  Unit,
  City,
  TERRAIN_INFO,
  UnitType,
  ResourceType
} from './types';

const TILE_SIZE = 40;

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private minimapCanvas: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;

  // Camera position (top-left corner in world coordinates)
  public cameraX = 0;
  public cameraY = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.minimapCanvas = document.getElementById('minimap') as HTMLCanvasElement;
    this.minimapCtx = this.minimapCanvas.getContext('2d')!;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public centerOn(x: number, y: number): void {
    this.cameraX = x * TILE_SIZE - this.canvas.width / 2;
    this.cameraY = y * TILE_SIZE - this.canvas.height / 2;
  }

  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: Math.floor((screenX + this.cameraX) / TILE_SIZE),
      y: Math.floor((screenY + this.cameraY) / TILE_SIZE)
    };
  }

  public render(state: GameState): void {
    const { ctx, canvas } = this;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate visible tile range
    const startTileX = Math.max(0, Math.floor(this.cameraX / TILE_SIZE) - 1);
    const startTileY = Math.max(0, Math.floor(this.cameraY / TILE_SIZE) - 1);
    const endTileX = Math.min(state.mapWidth, Math.ceil((this.cameraX + canvas.width) / TILE_SIZE) + 1);
    const endTileY = Math.min(state.mapHeight, Math.ceil((this.cameraY + canvas.height) / TILE_SIZE) + 1);

    // Draw tiles
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = state.map[y][x];
        this.drawTile(tile, state);
      }
    }

    // Draw cities
    for (const city of state.cities) {
      if (city.x >= startTileX && city.x < endTileX &&
          city.y >= startTileY && city.y < endTileY) {
        this.drawCity(city, state);
      }
    }

    // Draw units
    for (const unit of state.units) {
      if (unit.x >= startTileX && unit.x < endTileX &&
          unit.y >= startTileY && unit.y < endTileY) {
        const tile = state.map[unit.y][unit.x];
        if (tile.visible || tile.explored) {
          this.drawUnit(unit, state);
        }
      }
    }

    // Draw selection highlight
    if (state.selectedUnit) {
      this.drawSelection(state.selectedUnit.x, state.selectedUnit.y, '#ffff00');

      // Draw movement range if in move mode
      if (state.moveMode && state.selectedUnit.movementLeft > 0) {
        this.drawMovementRange(state, state.selectedUnit);
      }
    }

    if (state.selectedCity) {
      this.drawSelection(state.selectedCity.x, state.selectedCity.y, '#00ffff');
    }

    // Draw minimap
    this.drawMinimap(state);
  }

  private drawTile(tile: Tile, state: GameState): void {
    const { ctx } = this;
    const screenX = tile.x * TILE_SIZE - this.cameraX;
    const screenY = tile.y * TILE_SIZE - this.cameraY;

    if (!tile.explored) {
      // Unexplored - black
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      return;
    }

    // Get terrain color
    const terrainInfo = TERRAIN_INFO[tile.terrain];
    let color = terrainInfo.color;

    // Dim if not visible (fog of war)
    if (!tile.visible) {
      ctx.fillStyle = this.dimColor(color, 0.5);
    } else {
      ctx.fillStyle = color;
    }

    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

    // Draw territory border
    if (tile.owner !== null && tile.visible) {
      const ownerColor = state.players[tile.owner]?.color || '#fff';
      ctx.strokeStyle = ownerColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(screenX + 1, screenY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      ctx.globalAlpha = 1;
    }

    // Draw resources
    if (tile.resource !== ResourceType.None && tile.visible) {
      this.drawResource(screenX, screenY, tile.resource);
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
  }

  private drawResource(screenX: number, screenY: number, resource: ResourceType): void {
    const { ctx } = this;
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const iconMap: Record<ResourceType, string> = {
      [ResourceType.None]: '',
      [ResourceType.Iron]: '\u2692', // Hammer and pick
      [ResourceType.Horses]: '\u265E', // Chess knight
      [ResourceType.Gold]: '\u2605', // Star
      [ResourceType.Gems]: '\u2666', // Diamond
      [ResourceType.Fish]: '\u2248', // Waves
      [ResourceType.Wheat]: '\u2740'  // Flower/plant
    };

    ctx.fillStyle = '#fff';
    ctx.fillText(iconMap[resource], screenX + TILE_SIZE / 2, screenY + TILE_SIZE - 8);
  }

  private drawCity(city: City, state: GameState): void {
    const { ctx } = this;
    const screenX = city.x * TILE_SIZE - this.cameraX;
    const screenY = city.y * TILE_SIZE - this.cameraY;

    const tile = state.map[city.y][city.x];
    if (!tile.visible && !tile.explored) return;

    const owner = state.players[city.owner];
    const color = tile.visible ? owner.color : this.dimColor(owner.color, 0.5);

    // City base
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2, TILE_SIZE / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // City border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Population number
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(city.population.toString(), screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);

    // City name
    if (tile.visible) {
      ctx.font = '11px Arial';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(city.name, screenX + TILE_SIZE / 2, screenY - 5);
      ctx.fillText(city.name, screenX + TILE_SIZE / 2, screenY - 5);
    }
  }

  private drawUnit(unit: Unit, state: GameState): void {
    const { ctx } = this;
    const screenX = unit.x * TILE_SIZE - this.cameraX;
    const screenY = unit.y * TILE_SIZE - this.cameraY;

    const tile = state.map[unit.y][unit.x];
    if (!tile.visible && !tile.explored) return;

    const owner = state.players[unit.owner];
    const color = tile.visible ? owner.color : this.dimColor(owner.color, 0.5);

    // Unit icons
    const iconMap: Record<UnitType, string> = {
      [UnitType.Settler]: '\u2302', // House
      [UnitType.Warrior]: '\u2694', // Crossed swords
      [UnitType.Archer]: '\u2191', // Arrow up
      [UnitType.Spearman]: '\u2193', // Arrow down (spear)
      [UnitType.Horseman]: '\u265E', // Chess knight
      [UnitType.Swordsman]: '\u2020', // Dagger
      [UnitType.Catapult]: '\u25A0', // Square (siege)
      [UnitType.Knight]: '\u2658' // Chess knight
    };

    // Unit background
    ctx.fillStyle = color;
    const unitSize = TILE_SIZE * 0.7;
    const offsetX = (TILE_SIZE - unitSize) / 2;
    const offsetY = (TILE_SIZE - unitSize) / 2;
    ctx.fillRect(screenX + offsetX, screenY + offsetY, unitSize, unitSize);

    // Unit border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX + offsetX, screenY + offsetY, unitSize, unitSize);

    // Unit icon
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconMap[unit.type], screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);

    // Health bar
    if (unit.health < unit.maxHealth) {
      const barWidth = unitSize;
      const barHeight = 4;
      const healthPercent = unit.health / unit.maxHealth;

      ctx.fillStyle = '#300';
      ctx.fillRect(screenX + offsetX, screenY + offsetY + unitSize + 2, barWidth, barHeight);

      ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
      ctx.fillRect(screenX + offsetX, screenY + offsetY + unitSize + 2, barWidth * healthPercent, barHeight);
    }

    // Fortified indicator
    if (unit.fortified) {
      ctx.fillStyle = '#00f';
      ctx.beginPath();
      ctx.arc(screenX + TILE_SIZE - 8, screenY + 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Movement indicator
    if (unit.owner === state.currentPlayer && unit.movementLeft > 0 && tile.visible) {
      ctx.fillStyle = '#0f0';
      ctx.beginPath();
      ctx.arc(screenX + 8, screenY + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawSelection(x: number, y: number, color: string): void {
    const { ctx } = this;
    const screenX = x * TILE_SIZE - this.cameraX;
    const screenY = y * TILE_SIZE - this.cameraY;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(screenX - 2, screenY - 2, TILE_SIZE + 4, TILE_SIZE + 4);
    ctx.setLineDash([]);
  }

  private drawMovementRange(state: GameState, unit: Unit): void {
    const { ctx } = this;

    // Highlight tiles the unit can move to
    for (let dy = -unit.movementLeft; dy <= unit.movementLeft; dy++) {
      for (let dx = -unit.movementLeft; dx <= unit.movementLeft; dx++) {
        const nx = unit.x + dx;
        const ny = unit.y + dy;

        if (nx < 0 || nx >= state.mapWidth || ny < 0 || ny >= state.mapHeight) continue;

        const tile = state.map[ny][nx];
        if (!tile.visible) continue;

        const terrainInfo = TERRAIN_INFO[tile.terrain];
        if (!terrainInfo.passable) continue;

        // Simple distance check for movement
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist > 0 && dist <= unit.movementLeft) {
          const screenX = nx * TILE_SIZE - this.cameraX;
          const screenY = ny * TILE_SIZE - this.cameraY;

          // Check for enemies
          const hasEnemy = state.units.some(u => u.x === nx && u.y === ny && u.owner !== unit.owner);

          ctx.fillStyle = hasEnemy ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.2)';
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  private drawMinimap(state: GameState): void {
    const { minimapCtx, minimapCanvas } = this;
    const scaleX = minimapCanvas.width / state.mapWidth;
    const scaleY = minimapCanvas.height / state.mapHeight;

    // Clear
    minimapCtx.fillStyle = '#1a1a2e';
    minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    // Draw tiles
    for (let y = 0; y < state.mapHeight; y++) {
      for (let x = 0; x < state.mapWidth; x++) {
        const tile = state.map[y][x];

        if (!tile.explored) {
          minimapCtx.fillStyle = '#0a0a0a';
        } else {
          const terrainInfo = TERRAIN_INFO[tile.terrain];
          minimapCtx.fillStyle = tile.visible ? terrainInfo.color : this.dimColor(terrainInfo.color, 0.5);
        }

        minimapCtx.fillRect(x * scaleX, y * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
      }
    }

    // Draw cities
    for (const city of state.cities) {
      const tile = state.map[city.y][city.x];
      if (tile.explored) {
        minimapCtx.fillStyle = state.players[city.owner].color;
        minimapCtx.fillRect(city.x * scaleX - 2, city.y * scaleY - 2, 5, 5);
      }
    }

    // Draw units
    for (const unit of state.units) {
      const tile = state.map[unit.y][unit.x];
      if (tile.visible) {
        minimapCtx.fillStyle = state.players[unit.owner].color;
        minimapCtx.fillRect(unit.x * scaleX - 1, unit.y * scaleY - 1, 3, 3);
      }
    }

    // Draw camera viewport
    const viewX = this.cameraX / TILE_SIZE * scaleX;
    const viewY = this.cameraY / TILE_SIZE * scaleY;
    const viewW = this.canvas.width / TILE_SIZE * scaleX;
    const viewH = this.canvas.height / TILE_SIZE * scaleY;

    minimapCtx.strokeStyle = '#fff';
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(viewX, viewY, viewW, viewH);
  }

  private dimColor(color: string, factor: number): string {
    // Parse hex color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Dim and return
    const dr = Math.floor(r * factor);
    const dg = Math.floor(g * factor);
    const db = Math.floor(b * factor);

    return `rgb(${dr},${dg},${db})`;
  }
}

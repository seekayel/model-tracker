import {
  GameState, TILE_SIZE, TERRAIN_COLORS, UNIT_DEFS, Terrain,
  MAP_WIDTH, MAP_HEIGHT,
} from './types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private miniCanvas: HTMLCanvasElement;
  private miniCtx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.miniCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    this.miniCtx = this.miniCanvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.miniCanvas.width = 180;
    this.miniCanvas.height = Math.floor(180 * MAP_HEIGHT / MAP_WIDTH);
  }

  render(state: GameState): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Calculate camera offset (center camera on cameraX, cameraY)
    const offsetX = Math.floor(w / 2 - state.cameraX * TILE_SIZE);
    const offsetY = Math.floor(h / 2 - state.cameraY * TILE_SIZE);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    const humanId = 0;

    // Calculate visible tile range
    const startTX = Math.max(0, Math.floor(-offsetX / TILE_SIZE) - 1);
    const startTY = Math.max(0, Math.floor(-offsetY / TILE_SIZE) - 1);
    const endTX = Math.min(MAP_WIDTH, Math.ceil((w - offsetX) / TILE_SIZE) + 1);
    const endTY = Math.min(MAP_HEIGHT, Math.ceil((h - offsetY) / TILE_SIZE) + 1);

    // Draw tiles
    for (let y = startTY; y < endTY; y++) {
      for (let x = startTX; x < endTX; x++) {
        const tile = state.tiles[y][x];
        const px = x * TILE_SIZE + offsetX;
        const py = y * TILE_SIZE + offsetY;

        if (!tile.explored[humanId]) {
          continue; // Unexplored: don't draw
        }

        ctx.fillStyle = TERRAIN_COLORS[tile.terrain];
        if (!tile.visible[humanId]) {
          // Fog of war: darken explored but not visible
          ctx.globalAlpha = 0.4;
        }
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.globalAlpha = 1.0;

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw territory borders
    for (const city of state.cities) {
      if (!state.tiles[city.y][city.x].explored[humanId]) continue;
      const player = state.players[city.owner];
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = state.tiles[city.y][city.x].visible[humanId] ? 0.6 : 0.25;

      for (const pos of city.territory) {
        const px = pos.x * TILE_SIZE + offsetX;
        const py = pos.y * TILE_SIZE + offsetY;
        // Draw border only on edges of territory
        const isEdge = !city.territory.some(p => p.x === pos.x - 1 && p.y === pos.y) ||
                       !city.territory.some(p => p.x === pos.x + 1 && p.y === pos.y) ||
                       !city.territory.some(p => p.x === pos.x && p.y === pos.y - 1) ||
                       !city.territory.some(p => p.x === pos.x && p.y === pos.y + 1);
        if (isEdge) {
          // Left
          if (!city.territory.some(p => p.x === pos.x - 1 && p.y === pos.y)) {
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + TILE_SIZE); ctx.stroke();
          }
          // Right
          if (!city.territory.some(p => p.x === pos.x + 1 && p.y === pos.y)) {
            ctx.beginPath(); ctx.moveTo(px + TILE_SIZE, py); ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE); ctx.stroke();
          }
          // Top
          if (!city.territory.some(p => p.x === pos.x && p.y === pos.y - 1)) {
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + TILE_SIZE, py); ctx.stroke();
          }
          // Bottom
          if (!city.territory.some(p => p.x === pos.x && p.y === pos.y + 1)) {
            ctx.beginPath(); ctx.moveTo(px, py + TILE_SIZE); ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Draw cities
    for (const city of state.cities) {
      if (!state.tiles[city.y][city.x].visible[humanId] && !state.tiles[city.y][city.x].explored[humanId]) continue;
      const px = city.x * TILE_SIZE + offsetX;
      const py = city.y * TILE_SIZE + offsetY;
      const player = state.players[city.owner];

      ctx.globalAlpha = state.tiles[city.y][city.x].visible[humanId] ? 1.0 : 0.5;

      // City icon background
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // City name and pop
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(city.name, px + TILE_SIZE / 2, py - 4);

      // Population number
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(String(city.population), px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 5);

      // HP bar
      if (city.hp < city.maxHp) {
        const barW = TILE_SIZE - 8;
        const barH = 3;
        const barX = px + 4;
        const barY = py + TILE_SIZE - 6;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = city.hp > city.maxHp * 0.3 ? '#4CAF50' : '#f44336';
        ctx.fillRect(barX, barY, barW * (city.hp / city.maxHp), barH);
      }

      // Selected city highlight
      if (state.selectedCityId === city.id) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
    }

    // Draw units
    for (const unit of state.units) {
      if (!state.tiles[unit.y][unit.x].visible[humanId]) continue;
      const px = unit.x * TILE_SIZE + offsetX;
      const py = unit.y * TILE_SIZE + offsetY;
      const player = state.players[unit.owner];
      const def = UNIT_DEFS[unit.type];

      // Unit background
      ctx.fillStyle = player.color;
      ctx.globalAlpha = 0.85;
      const s = TILE_SIZE * 0.7;
      const ux = px + (TILE_SIZE - s) / 2;
      const uy = py + (TILE_SIZE - s) / 2;
      ctx.fillRect(ux, uy, s, s);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(ux, uy, s, s);
      ctx.globalAlpha = 1.0;

      // Unit symbol
      ctx.font = `${TILE_SIZE * 0.45}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(def.symbol, px + TILE_SIZE / 2, py + TILE_SIZE / 2);

      // HP bar
      if (unit.hp < unit.maxHp) {
        const barW = s - 4;
        const barH = 3;
        const barX = ux + 2;
        const barY = uy + s - 5;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = unit.hp > unit.maxHp * 0.3 ? '#4CAF50' : '#f44336';
        ctx.fillRect(barX, barY, barW * (unit.hp / unit.maxHp), barH);
      }

      // Fortified indicator
      if (unit.fortified) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('F', ux + 1, uy + 10);
      }

      // Moves indicator
      if (unit.owner === 0) {
        ctx.fillStyle = unit.movesLeft > 0 ? '#8f8' : '#888';
        ctx.beginPath();
        ctx.arc(ux + s - 3, uy + 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Selected unit highlight
      if (state.selectedUnitId === unit.id) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(ux - 2, uy - 2, s + 4, s + 4);
      }
    }

    this.renderMinimap(state, humanId);
  }

  private renderMinimap(state: GameState, humanId: number): void {
    const { miniCtx: ctx, miniCanvas: canvas } = this;
    const tw = canvas.width / MAP_WIDTH;
    const th = canvas.height / MAP_HEIGHT;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = state.tiles[y][x];
        if (!tile.explored[humanId]) continue;
        ctx.fillStyle = TERRAIN_COLORS[tile.terrain];
        if (!tile.visible[humanId]) ctx.globalAlpha = 0.4;
        ctx.fillRect(x * tw, y * th, tw + 0.5, th + 0.5);
        ctx.globalAlpha = 1.0;
      }
    }

    // Draw cities on minimap
    for (const city of state.cities) {
      if (!state.tiles[city.y][city.x].explored[humanId]) continue;
      ctx.fillStyle = state.players[city.owner].color;
      ctx.fillRect(city.x * tw - 1, city.y * th - 1, tw + 2, th + 2);
    }

    // Draw units on minimap
    for (const unit of state.units) {
      if (!state.tiles[unit.y][unit.x].visible[humanId]) continue;
      ctx.fillStyle = state.players[unit.owner].color;
      ctx.fillRect(unit.x * tw, unit.y * th, tw, th);
    }

    // Draw camera viewport
    const vpW = this.canvas.width / TILE_SIZE;
    const vpH = this.canvas.height / TILE_SIZE;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      (state.cameraX - vpW / 2) * tw,
      (state.cameraY - vpH / 2) * th,
      vpW * tw,
      vpH * th
    );
  }

  screenToTile(state: GameState, sx: number, sy: number): { x: number; y: number } | null {
    const offsetX = Math.floor(this.canvas.width / 2 - state.cameraX * TILE_SIZE);
    const offsetY = Math.floor(this.canvas.height / 2 - state.cameraY * TILE_SIZE);
    const tx = Math.floor((sx - offsetX) / TILE_SIZE);
    const ty = Math.floor((sy - offsetY) / TILE_SIZE);
    if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) return null;
    return { x: tx, y: ty };
  }

  minimapToTile(sx: number, sy: number): { x: number; y: number } | null {
    const tw = this.miniCanvas.width / MAP_WIDTH;
    const th = this.miniCanvas.height / MAP_HEIGHT;
    const tx = Math.floor(sx / tw);
    const ty = Math.floor(sy / th);
    if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) return null;
    return { x: tx, y: ty };
  }
}

import {
  TILE, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, COLORS,
  ENEMY_TYPE, ITEM_TYPE, ITEM_CONFIG,
} from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0 };
  }

  updateCamera(playerX, playerY) {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    this.camera.x = Math.round(playerX - cw / 2);
    this.camera.y = Math.round(playerY - ch / 2);

    // Clamp camera to world bounds
    const worldW = MAP_WIDTH * TILE_SIZE;
    const worldH = MAP_HEIGHT * TILE_SIZE;
    this.camera.x = Math.max(0, Math.min(this.camera.x, worldW - cw));
    this.camera.y = Math.max(0, Math.min(this.camera.y, worldH - ch));
  }

  clear() {
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderMap(map) {
    const ctx = this.ctx;
    const { x: camX, y: camY } = this.camera;

    const startTX = Math.floor(camX / TILE_SIZE);
    const startTY = Math.floor(camY / TILE_SIZE);
    const endTX = Math.min(MAP_WIDTH - 1, startTX + Math.ceil(this.canvas.width / TILE_SIZE) + 1);
    const endTY = Math.min(MAP_HEIGHT - 1, startTY + Math.ceil(this.canvas.height / TILE_SIZE) + 1);

    for (let ty = Math.max(0, startTY); ty <= endTY; ty++) {
      for (let tx = Math.max(0, startTX); tx <= endTX; tx++) {
        const tile = map[ty][tx];
        const sx = tx * TILE_SIZE - camX;
        const sy = ty * TILE_SIZE - camY;

        this.renderTile(ctx, tile, sx, sy);
      }
    }
  }

  renderTile(ctx, tile, sx, sy) {
    const s = TILE_SIZE;
    switch (tile) {
      case TILE.FLOOR:
        ctx.fillStyle = COLORS.FLOOR;
        ctx.fillRect(sx, sy, s, s);
        // Subtle grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, sy, s, s);
        break;

      case TILE.WALL:
        ctx.fillStyle = COLORS.WALL;
        ctx.fillRect(sx, sy, s, s);
        // 3D bevel effect
        ctx.fillStyle = COLORS.WALL_HIGHLIGHT;
        ctx.fillRect(sx, sy, s, 3);
        ctx.fillRect(sx, sy, 3, s);
        ctx.fillStyle = '#333';
        ctx.fillRect(sx, sy + s - 3, s, 3);
        ctx.fillRect(sx + s - 3, sy, 3, s);
        break;

      case TILE.EXIT:
        ctx.fillStyle = COLORS.EXIT_GLOW;
        ctx.fillRect(sx, sy, s, s);
        ctx.fillStyle = COLORS.EXIT;
        ctx.fillRect(sx + 4, sy + 4, s - 8, s - 8);
        // Animated arrows (static for now)
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('▶', sx + s / 2, sy + s / 2);
        break;

      case TILE.FOOD:
        ctx.fillStyle = COLORS.FLOOR;
        ctx.fillRect(sx, sy, s, s);
        ctx.fillStyle = ITEM_CONFIG[ITEM_TYPE.FOOD].color;
        ctx.beginPath();
        ctx.arc(sx + s / 2, sy + s / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case TILE.KEY:
        ctx.fillStyle = COLORS.FLOOR;
        ctx.fillRect(sx, sy, s, s);
        ctx.fillStyle = ITEM_CONFIG[ITEM_TYPE.KEY].color;
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🗝', sx + s / 2, sy + s / 2);
        break;

      case TILE.POTION:
        ctx.fillStyle = COLORS.FLOOR;
        ctx.fillRect(sx, sy, s, s);
        ctx.fillStyle = ITEM_CONFIG[ITEM_TYPE.POTION].color;
        ctx.beginPath();
        ctx.arc(sx + s / 2, sy + s / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#aaaaff';
        ctx.beginPath();
        ctx.arc(sx + s / 2 - 2, sy + s / 2 - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case TILE.SPAWNER:
        ctx.fillStyle = '#1a0000';
        ctx.fillRect(sx, sy, s, s);
        ctx.strokeStyle = '#aa2222';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 4, sy + 4, s - 8, s - 8);
        ctx.fillStyle = '#cc2222';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠', sx + s / 2, sy + s / 2);
        break;
    }
  }

  renderItems(items) {
    const ctx = this.ctx;
    items.forEach(item => {
      if (!item.alive) return;
      const sx = item.x - this.camera.x;
      const sy = item.y - this.camera.y;
      const pulse = Math.sin(item.pulse) * 2;
      const r = item.size + pulse;

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.strokeStyle = '#ffffff55';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  renderSpawners(spawners) {
    const ctx = this.ctx;
    spawners.forEach(spawner => {
      if (!spawner.alive) return;
      const sx = spawner.x - this.camera.x;
      const sy = spawner.y - this.camera.y;

      // Health bar
      const barW = 30;
      const barH = 4;
      const hpRatio = spawner.health / spawner.maxHealth;
      ctx.fillStyle = '#000';
      ctx.fillRect(sx - barW / 2, sy - 22, barW, barH);
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(sx - barW / 2, sy - 22, barW * hpRatio, barH);
    });
  }

  renderEnemies(enemies) {
    const ctx = this.ctx;
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      const sx = enemy.x - this.camera.x;
      const sy = enemy.y - this.camera.y;
      const s = enemy.size;

      // Body
      ctx.fillStyle = enemy.color;

      if (enemy.type === ENEMY_TYPE.GHOST) {
        // Ghost: semi-transparent
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(sx, sy, s, 0, Math.PI * 2);
        ctx.fill();
        // Wavy bottom
        ctx.beginPath();
        ctx.moveTo(sx - s, sy);
        ctx.quadraticCurveTo(sx - s / 2, sy + s + 3, sx, sy + s);
        ctx.quadraticCurveTo(sx + s / 2, sy + s - 3, sx + s, sy + s);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx - 4, sy - 2, 3, 0, Math.PI * 2);
        ctx.arc(sx + 4, sy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(sx - 4, sy - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(sx + 4, sy - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === ENEMY_TYPE.DEMON) {
        // Demon: larger, menacing
        ctx.beginPath();
        ctx.arc(sx, sy, s, 0, Math.PI * 2);
        ctx.fill();
        // Horns
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - s + 2);
        ctx.lineTo(sx - 12, sy - s - 8);
        ctx.lineTo(sx - 4, sy - s + 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + 8, sy - s + 2);
        ctx.lineTo(sx + 12, sy - s - 8);
        ctx.lineTo(sx + 4, sy - s + 2);
        ctx.fill();
      } else if (enemy.type === ENEMY_TYPE.SORCERER) {
        // Sorcerer: diamond shape with robe
        ctx.beginPath();
        ctx.moveTo(sx, sy - s - 2);
        ctx.lineTo(sx + s + 2, sy);
        ctx.lineTo(sx, sy + s + 2);
        ctx.lineTo(sx - s - 2, sy);
        ctx.closePath();
        ctx.fill();
        // Inner glow
        ctx.fillStyle = '#ff88ff';
        ctx.beginPath();
        ctx.arc(sx, sy, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Grunt: square-ish blob
        ctx.beginPath();
        ctx.roundRect(sx - s, sy - s, s * 2, s * 2, 4);
        ctx.fill();
        // Face
        ctx.fillStyle = '#ff8888';
        ctx.beginPath();
        ctx.arc(sx - 4, sy - 2, 3, 0, Math.PI * 2);
        ctx.arc(sx + 4, sy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(sx - 4, sy - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(sx + 4, sy - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Angry mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy + 3, 4, 0, Math.PI);
        ctx.stroke();
      }

      // Health bar
      if (enemy.health < enemy.maxHealth) {
        const barW = s * 2 + 4;
        const hpRatio = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#000';
        ctx.fillRect(sx - barW / 2, sy - s - 6, barW, 3);
        ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.25 ? '#ccaa00' : '#cc2222';
        ctx.fillRect(sx - barW / 2, sy - s - 6, barW * hpRatio, 3);
      }
    });
  }

  renderProjectiles(projectiles) {
    const ctx = this.ctx;
    projectiles.forEach(p => {
      if (!p.alive) return;

      if (p.isMagic) {
        ctx.strokeStyle = '#ff88ff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(p.x - this.camera.x, p.y - this.camera.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        return;
      }

      const sx = p.x - this.camera.x;
      const sy = p.y - this.camera.y;

      ctx.fillStyle = p.isEnemy ? '#ff6622' : '#ffee44';
      ctx.beginPath();
      ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.fillStyle = p.isEnemy ? '#ff220033' : '#ffee4433';
      ctx.beginPath();
      ctx.arc(sx, sy, p.radius + 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderPlayer(player) {
    if (!player.alive) return;
    const ctx = this.ctx;
    const sx = player.x - this.camera.x;
    const sy = player.y - this.camera.y;

    // Invincibility flash
    if (player.invincible > 0 && Math.floor(player.invincible / 80) % 2 === 0) return;

    const s = player.width / 2;

    // Body
    ctx.fillStyle = COLORS.PLAYER;
    ctx.strokeStyle = COLORS.PLAYER_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, s + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Armor detail
    ctx.fillStyle = '#2266aa';
    ctx.beginPath();
    ctx.arc(sx, sy, s, 0, Math.PI * 2);
    ctx.fill();

    // Facing indicator (visor/arrow)
    const fx = player.facingX;
    const fy = player.facingY;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(sx + fx * 6 - fy * 3, sy + fy * 6 + fx * 3);
    ctx.lineTo(sx + fx * 6 + fy * 3, sy + fy * 6 - fx * 3);
    ctx.lineTo(sx + fx * (s + 5), sy + fy * (s + 5));
    ctx.closePath();
    ctx.fill();
  }

  renderFloatingText(texts) {
    const ctx = this.ctx;
    texts.forEach(t => {
      const sx = t.x - this.camera.x;
      const sy = t.y - this.camera.y;
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color || '#ffffff';
      ctx.font = `bold ${t.size || 14}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.text, sx, sy);
      ctx.globalAlpha = 1;
    });
  }
}

export class FloatingText {
  constructor(x, y, text, color = '#ffffff') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.alpha = 1;
    this.vy = -0.8;
    this.lifetime = 1200;
    this.alive = true;
    this.size = 14;
  }

  update(dt) {
    this.lifetime -= dt;
    this.y += this.vy;
    this.alpha = Math.max(0, this.lifetime / 1200);
    if (this.lifetime <= 0) this.alive = false;
  }
}

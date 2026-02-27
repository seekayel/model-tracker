import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  TILE,
  COLORS
} from './constants.js';
import { SpriteRenderer } from './sprites.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.sprites = new SpriteRenderer(this.ctx);
    this.cameraX = 0;
  }

  clear() {
    this.ctx.fillStyle = COLORS.SKY;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  updateCamera(playerX) {
    // Camera follows player but stops at level bounds
    const targetX = playerX - CANVAS_WIDTH / 3;
    this.cameraX = Math.max(0, targetX);
  }

  update(deltaTime) {
    this.sprites.update(deltaTime);
  }

  drawBackground(level) {
    const ctx = this.ctx;

    // Draw hills (behind everything)
    for (const hill of level.decorations.hills) {
      const screenX = hill.x - this.cameraX * 0.3; // Parallax
      if (screenX > -hill.width && screenX < CANVAS_WIDTH + hill.width) {
        this.sprites.drawHill(screenX, hill.y, hill.width, hill.height);
      }
    }

    // Draw clouds
    for (const cloud of level.decorations.clouds) {
      const screenX = cloud.x - this.cameraX * 0.2; // Slower parallax
      if (screenX > -100 && screenX < CANVAS_WIDTH + 100) {
        this.sprites.drawCloud(screenX, cloud.y, cloud.size);
      }
    }

    // Draw bushes
    for (const bush of level.decorations.bushes) {
      const screenX = bush.x - this.cameraX * 0.5;
      if (screenX > -100 && screenX < CANVAS_WIDTH + 100) {
        this.sprites.drawBush(screenX, bush.y, bush.size);
      }
    }
  }

  drawTiles(level) {
    const ctx = this.ctx;
    const startTile = Math.floor(this.cameraX / TILE_SIZE);
    const endTile = Math.ceil((this.cameraX + CANVAS_WIDTH) / TILE_SIZE);

    for (let x = startTile; x <= endTile; x++) {
      for (let y = 0; y < level.height; y++) {
        const tile = level.getTile(x, y);
        if (tile === 0) continue;

        const screenX = x * TILE_SIZE - this.cameraX;
        const screenY = y * TILE_SIZE;

        switch (tile) {
          case TILE.GROUND:
            this.sprites.drawGroundTile(screenX, screenY);
            break;
          case TILE.BRICK:
            this.sprites.drawBrickTile(screenX, screenY);
            break;
          case TILE.QUESTION_COIN:
          case TILE.QUESTION_MUSHROOM:
            this.sprites.drawQuestionTile(screenX, screenY, false);
            break;
          case TILE.USED_BLOCK:
            this.sprites.drawQuestionTile(screenX, screenY, true);
            break;
          case TILE.PIPE_TOP_LEFT:
          case TILE.PIPE_TOP_RIGHT:
          case TILE.PIPE_BODY_LEFT:
          case TILE.PIPE_BODY_RIGHT:
            this.drawPipeTile(screenX, screenY, tile, level, x, y);
            break;
          case TILE.HARD_BLOCK:
            this.sprites.drawHardBlock(screenX, screenY);
            break;
          case TILE.FLAG_POLE:
            ctx.fillStyle = '#2e8b57';
            ctx.fillRect(screenX + TILE_SIZE / 2 - 3, screenY, 6, TILE_SIZE);
            break;
          case TILE.FLAG_TOP:
            this.sprites.drawFlagPole(screenX, screenY, TILE_SIZE * 10);
            break;
        }
      }
    }
  }

  drawPipeTile(screenX, screenY, tile, level, tileX, tileY) {
    const ctx = this.ctx;

    // Only draw pipe from the top-left corner to avoid double-drawing
    if (tile === TILE.PIPE_TOP_LEFT) {
      // Find pipe height
      let height = 1;
      while (level.getTile(tileX, tileY + height) === TILE.PIPE_BODY_LEFT) {
        height++;
      }
      this.sprites.drawPipe(screenX, screenY, (height + 1) * TILE_SIZE);
    }
  }

  drawPlayer(player) {
    if (!player.active || (player.isInvincible && Math.floor(Date.now() / 100) % 2 === 0)) {
      // Flashing when invincible
      return;
    }

    const screenX = player.x - this.cameraX;
    this.sprites.drawMario(
      screenX,
      player.y,
      player.width,
      player.height,
      player.facingRight,
      player.isBig,
      player.isMoving,
      player.isJumping
    );
  }

  drawEnemies(enemies) {
    for (const enemy of enemies) {
      if (!enemy.active) continue;

      const screenX = enemy.x - this.cameraX;
      if (screenX < -TILE_SIZE || screenX > CANVAS_WIDTH + TILE_SIZE) continue;

      if (enemy.constructor.name === 'Goomba') {
        this.sprites.drawGoomba(screenX, enemy.y, enemy.width, enemy.height, enemy.isSquished);
      } else if (enemy.constructor.name === 'Koopa') {
        this.sprites.drawKoopa(screenX, enemy.y, enemy.width, enemy.height, enemy.facingRight, enemy.isShell);
      }
    }
  }

  drawCoins(coins) {
    for (const coin of coins) {
      if (!coin.active) continue;

      const screenX = coin.x - this.cameraX;
      if (screenX < -TILE_SIZE || screenX > CANVAS_WIDTH + TILE_SIZE) continue;

      this.sprites.drawCoin(screenX, coin.y + coin.floatOffset, TILE_SIZE);
    }
  }

  drawMushrooms(mushrooms) {
    for (const mushroom of mushrooms) {
      if (!mushroom.active) continue;

      const screenX = mushroom.x - this.cameraX;
      this.sprites.drawMushroom(screenX, mushroom.y, TILE_SIZE);
    }
  }

  drawParticles(particles) {
    const ctx = this.ctx;

    for (const particle of particles) {
      if (!particle.active) continue;

      const screenX = particle.x - this.cameraX;

      switch (particle.type) {
        case 'coin':
          this.sprites.drawCoin(screenX, particle.y, 24);
          break;
        case 'brick':
          ctx.fillStyle = COLORS.BRICK;
          ctx.fillRect(screenX, particle.y, 8, 8);
          break;
        case 'score':
          ctx.fillStyle = COLORS.WHITE;
          ctx.font = '12px Arial';
          ctx.fillText(particle.value.toString(), screenX, particle.y);
          break;
      }
    }
  }

  drawHUD(player, time) {
    const ctx = this.ctx;

    ctx.fillStyle = COLORS.HUD_WHITE;
    ctx.font = 'bold 16px "Courier New", monospace';

    // Score
    ctx.fillText('SCORE', 20, 25);
    ctx.fillText(player.score.toString().padStart(6, '0'), 20, 45);

    // Coins
    ctx.fillText('COINS', 160, 25);
    ctx.fillText('x' + player.coins.toString().padStart(2, '0'), 160, 45);

    // World
    ctx.fillText('WORLD', 300, 25);
    ctx.fillText('1-1', 300, 45);

    // Time
    ctx.fillText('TIME', 440, 25);
    ctx.fillText(Math.max(0, Math.floor(time)).toString().padStart(3, '0'), 440, 45);

    // Lives
    ctx.fillText('LIVES', 580, 25);
    ctx.fillText('x' + player.lives.toString(), 580, 45);
  }

  render(game) {
    this.clear();
    this.updateCamera(game.player.x);

    this.drawBackground(game.level);
    this.drawTiles(game.level);
    this.drawCoins(game.level.coins);
    this.drawMushrooms(game.mushrooms);
    this.drawEnemies(game.level.enemies);
    this.drawParticles(game.particles);
    this.drawPlayer(game.player);
    this.drawHUD(game.player, game.timeRemaining);
  }
}

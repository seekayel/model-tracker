import { COLORS, TILE_SIZE } from './constants.js';

// Sprite rendering using canvas drawing (no external assets needed)
export class SpriteRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.animationFrame = 0;
    this.animationTimer = 0;
  }

  update(deltaTime) {
    this.animationTimer += deltaTime;
    if (this.animationTimer >= 100) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }
  }

  // Draw Mario
  drawMario(x, y, width, height, facingRight, isBig, isMoving, isJumping) {
    const ctx = this.ctx;

    ctx.save();

    if (!facingRight) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      x = 0;
      y = 0;
    }

    // Body (red overalls)
    ctx.fillStyle = COLORS.MARIO_RED;
    if (isBig) {
      ctx.fillRect(x + 4, y + 16, 20, 24);
      ctx.fillRect(x + 2, y + 40, 24, 20);
    } else {
      ctx.fillRect(x + 4, y + 8, 20, 12);
      ctx.fillRect(x + 2, y + 20, 24, 8);
    }

    // Skin (face and hands)
    ctx.fillStyle = COLORS.MARIO_SKIN;
    if (isBig) {
      ctx.fillRect(x + 6, y + 4, 16, 12);
      ctx.fillRect(x + 2, y + 36, 6, 8);
      ctx.fillRect(x + 20, y + 36, 6, 8);
    } else {
      ctx.fillRect(x + 6, y + 2, 16, 8);
      ctx.fillRect(x + 2, y + 16, 4, 6);
      ctx.fillRect(x + 22, y + 16, 4, 6);
    }

    // Hat (red cap)
    ctx.fillStyle = COLORS.MARIO_RED;
    if (isBig) {
      ctx.fillRect(x + 4, y, 20, 6);
      ctx.fillRect(x + 2, y + 4, 8, 4);
    } else {
      ctx.fillRect(x + 4, y, 18, 4);
      ctx.fillRect(x + 2, y + 2, 6, 3);
    }

    // Mustache
    ctx.fillStyle = COLORS.MARIO_BROWN;
    if (isBig) {
      ctx.fillRect(x + 8, y + 12, 12, 4);
    } else {
      ctx.fillRect(x + 8, y + 6, 10, 3);
    }

    // Eyes
    ctx.fillStyle = COLORS.BLACK;
    if (isBig) {
      ctx.fillRect(x + 10, y + 6, 3, 4);
      ctx.fillRect(x + 16, y + 6, 3, 4);
    } else {
      ctx.fillRect(x + 10, y + 3, 2, 3);
      ctx.fillRect(x + 16, y + 3, 2, 3);
    }

    // Shoes (brown)
    ctx.fillStyle = COLORS.MARIO_BROWN;
    if (isBig) {
      // Animate legs when moving
      if (isMoving && !isJumping) {
        const legOffset = this.animationFrame % 2 === 0 ? 0 : 4;
        ctx.fillRect(x + 2 - legOffset, y + 56, 10, 8);
        ctx.fillRect(x + 16 + legOffset, y + 56, 10, 8);
      } else {
        ctx.fillRect(x + 2, y + 56, 10, 8);
        ctx.fillRect(x + 16, y + 56, 10, 8);
      }
    } else {
      if (isMoving && !isJumping) {
        const legOffset = this.animationFrame % 2 === 0 ? 0 : 3;
        ctx.fillRect(x + 2 - legOffset, y + 26, 8, 6);
        ctx.fillRect(x + 18 + legOffset, y + 26, 8, 6);
      } else {
        ctx.fillRect(x + 2, y + 26, 8, 6);
        ctx.fillRect(x + 18, y + 26, 8, 6);
      }
    }

    ctx.restore();
  }

  // Draw Goomba enemy
  drawGoomba(x, y, width, height, isSquished = false) {
    const ctx = this.ctx;

    if (isSquished) {
      ctx.fillStyle = COLORS.GOOMBA_BROWN;
      ctx.fillRect(x + 2, y + height - 8, width - 4, 8);
      return;
    }

    // Body
    ctx.fillStyle = COLORS.GOOMBA_BROWN;
    ctx.fillRect(x + 4, y + 4, width - 8, height - 12);
    ctx.fillRect(x + 2, y + 8, width - 4, height - 16);

    // Feet
    const footOffset = this.animationFrame % 2 === 0 ? 0 : 2;
    ctx.fillRect(x + 2 - footOffset, y + height - 8, 10, 8);
    ctx.fillRect(x + width - 12 + footOffset, y + height - 8, 10, 8);

    // Eyes (white part)
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillRect(x + 6, y + 8, 8, 8);
    ctx.fillRect(x + width - 14, y + 8, 8, 8);

    // Pupils
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x + 10, y + 10, 4, 6);
    ctx.fillRect(x + width - 14, y + 10, 4, 6);

    // Angry eyebrows
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x + 6, y + 6, 6, 2);
    ctx.fillRect(x + width - 12, y + 6, 6, 2);
  }

  // Draw Koopa Troopa
  drawKoopa(x, y, width, height, facingRight, isShell = false) {
    const ctx = this.ctx;

    if (isShell) {
      // Shell
      ctx.fillStyle = COLORS.KOOPA_GREEN;
      ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
      ctx.fillRect(x + 2, y + 8, width - 4, height - 16);

      // Shell pattern
      ctx.fillStyle = COLORS.PIPE_DARK;
      ctx.fillRect(x + 8, y + 8, 4, height - 16);
      ctx.fillRect(x + width - 12, y + 8, 4, height - 16);
      return;
    }

    ctx.save();

    if (!facingRight) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      x = 0;
      y = 0;
    }

    // Shell (back)
    ctx.fillStyle = COLORS.KOOPA_GREEN;
    ctx.fillRect(x + 4, y + 12, width - 8, height - 20);

    // Head
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(x + width - 12, y + 4, 10, 12);

    // Eye
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillRect(x + width - 8, y + 6, 4, 4);
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x + width - 6, y + 7, 2, 2);

    // Feet
    ctx.fillStyle = '#ffcc00';
    const footOffset = this.animationFrame % 2 === 0 ? 0 : 2;
    ctx.fillRect(x + 4 - footOffset, y + height - 8, 8, 8);
    ctx.fillRect(x + width - 12 + footOffset, y + height - 8, 8, 8);

    ctx.restore();
  }

  // Draw coin
  drawCoin(x, y, size) {
    const ctx = this.ctx;
    const frame = this.animationFrame;

    // Animate coin spinning
    const widthMultiplier = [1, 0.7, 0.3, 0.7][frame];
    const coinWidth = size * 0.6 * widthMultiplier;
    const coinX = x + (size - coinWidth) / 2;

    ctx.fillStyle = COLORS.COIN_GOLD;
    ctx.fillRect(coinX, y + 4, coinWidth, size - 8);

    // Coin shine
    if (frame === 0) {
      ctx.fillStyle = '#fff8dc';
      ctx.fillRect(coinX + 2, y + 6, 2, size - 12);
    }
  }

  // Draw mushroom power-up
  drawMushroom(x, y, size) {
    const ctx = this.ctx;

    // Stem
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillRect(x + 8, y + size/2, size - 16, size/2);

    // Cap
    ctx.fillStyle = COLORS.MUSHROOM_RED;
    ctx.fillRect(x + 2, y + 4, size - 4, size/2);
    ctx.fillRect(x + 4, y + 2, size - 8, 4);

    // White spots
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillRect(x + 6, y + 8, 6, 6);
    ctx.fillRect(x + size - 12, y + 8, 6, 6);
    ctx.fillRect(x + size/2 - 3, y + 4, 6, 4);

    // Eyes
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x + 10, y + size/2 + 4, 3, 4);
    ctx.fillRect(x + size - 13, y + size/2 + 4, 3, 4);
  }

  // Draw ground/brick tile
  drawGroundTile(x, y) {
    const ctx = this.ctx;

    ctx.fillStyle = COLORS.GROUND;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Brick pattern
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x, y, TILE_SIZE, 2);
    ctx.fillRect(x, y + TILE_SIZE/2, TILE_SIZE, 2);
    ctx.fillRect(x + TILE_SIZE/2, y, 2, TILE_SIZE/2);
    ctx.fillRect(x, y + TILE_SIZE/2, 2, TILE_SIZE/2);
    ctx.fillRect(x + TILE_SIZE - 2, y + TILE_SIZE/2, 2, TILE_SIZE/2);
  }

  // Draw brick block
  drawBrickTile(x, y) {
    const ctx = this.ctx;

    ctx.fillStyle = COLORS.BRICK;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Brick pattern
    ctx.fillStyle = '#8b4513';
    ctx.strokeStyle = '#4a2810';
    ctx.lineWidth = 1;

    // Horizontal lines
    ctx.fillRect(x, y + TILE_SIZE/4 - 1, TILE_SIZE, 2);
    ctx.fillRect(x, y + TILE_SIZE/2 - 1, TILE_SIZE, 2);
    ctx.fillRect(x, y + 3*TILE_SIZE/4 - 1, TILE_SIZE, 2);

    // Vertical lines (offset)
    ctx.fillRect(x + TILE_SIZE/2, y, 2, TILE_SIZE/4);
    ctx.fillRect(x + TILE_SIZE/4, y + TILE_SIZE/4, 2, TILE_SIZE/4);
    ctx.fillRect(x + 3*TILE_SIZE/4, y + TILE_SIZE/4, 2, TILE_SIZE/4);
    ctx.fillRect(x + TILE_SIZE/2, y + TILE_SIZE/2, 2, TILE_SIZE/4);
    ctx.fillRect(x + TILE_SIZE/4, y + 3*TILE_SIZE/4, 2, TILE_SIZE/4);
    ctx.fillRect(x + 3*TILE_SIZE/4, y + 3*TILE_SIZE/4, 2, TILE_SIZE/4);
  }

  // Draw question block
  drawQuestionTile(x, y, used = false) {
    const ctx = this.ctx;

    if (used) {
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#5a4510';
      ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      return;
    }

    // Background
    const brightness = this.animationFrame % 2 === 0 ? COLORS.QUESTION : '#e5b800';
    ctx.fillStyle = brightness;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Border
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(x, y, TILE_SIZE, 2);
    ctx.fillRect(x, y, 2, TILE_SIZE);
    ctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE);
    ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);

    // Question mark
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 10, y + 6, 12, 4);
    ctx.fillRect(x + 18, y + 6, 4, 10);
    ctx.fillRect(x + 12, y + 12, 10, 4);
    ctx.fillRect(x + 12, y + 12, 4, 8);
    ctx.fillRect(x + 12, y + 22, 4, 4);
  }

  // Draw pipe
  drawPipe(x, y, height) {
    const ctx = this.ctx;

    // Pipe top (wider)
    ctx.fillStyle = COLORS.PIPE_GREEN;
    ctx.fillRect(x - 4, y, TILE_SIZE * 2 + 8, TILE_SIZE);

    // Pipe top highlight
    ctx.fillStyle = '#00d800';
    ctx.fillRect(x - 2, y + 4, 8, TILE_SIZE - 8);

    // Pipe top shadow
    ctx.fillStyle = COLORS.PIPE_DARK;
    ctx.fillRect(x + TILE_SIZE * 2 - 4, y + 4, 6, TILE_SIZE - 8);

    // Pipe body
    ctx.fillStyle = COLORS.PIPE_GREEN;
    ctx.fillRect(x, y + TILE_SIZE, TILE_SIZE * 2, height - TILE_SIZE);

    // Body highlight
    ctx.fillStyle = '#00d800';
    ctx.fillRect(x + 4, y + TILE_SIZE, 8, height - TILE_SIZE);

    // Body shadow
    ctx.fillStyle = COLORS.PIPE_DARK;
    ctx.fillRect(x + TILE_SIZE * 2 - 8, y + TILE_SIZE, 8, height - TILE_SIZE);
  }

  // Draw flag pole
  drawFlagPole(x, y, height) {
    const ctx = this.ctx;

    // Pole
    ctx.fillStyle = '#2e8b57';
    ctx.fillRect(x + TILE_SIZE/2 - 3, y, 6, height);

    // Ball on top
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE/2, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Flag
    ctx.fillStyle = '#00aa00';
    ctx.beginPath();
    ctx.moveTo(x + TILE_SIZE/2 + 3, y + 8);
    ctx.lineTo(x + TILE_SIZE/2 + 40, y + 24);
    ctx.lineTo(x + TILE_SIZE/2 + 3, y + 40);
    ctx.closePath();
    ctx.fill();
  }

  // Draw hard block (can't be broken)
  drawHardBlock(x, y) {
    const ctx = this.ctx;

    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // 3D effect
    ctx.fillStyle = '#a08060';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 2);
    ctx.fillRect(x + 2, y + 2, 2, TILE_SIZE - 4);

    ctx.fillStyle = '#5a4530';
    ctx.fillRect(x + 2, y + TILE_SIZE - 4, TILE_SIZE - 4, 2);
    ctx.fillRect(x + TILE_SIZE - 4, y + 2, 2, TILE_SIZE - 4);
  }

  // Draw cloud (background decoration)
  drawCloud(x, y, size) {
    const ctx = this.ctx;

    ctx.fillStyle = COLORS.WHITE;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size, y - size/2, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 2, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.5, y - size/2, size * 0.6, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y - size/3, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw bush (background decoration)
  drawBush(x, y, size) {
    const ctx = this.ctx;

    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.arc(x, y, size, Math.PI, 0);
    ctx.arc(x + size * 1.5, y, size * 1.2, Math.PI, 0);
    ctx.arc(x + size * 3, y, size, Math.PI, 0);
    ctx.fill();
  }

  // Draw hill (background decoration)
  drawHill(x, y, width, height) {
    const ctx = this.ctx;

    ctx.fillStyle = '#3cb371';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + width/2, y - height, x + width, y);
    ctx.closePath();
    ctx.fill();
  }
}

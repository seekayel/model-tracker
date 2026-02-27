import { GRAVITY, CANVAS_HEIGHT, TILE_SIZE, FRICTION } from './constants.js';

export class Entity {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.vx = 0;
    this.vy = 0;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx, cameraX) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
  }
}

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, TILE_SIZE * 0.8, TILE_SIZE * 0.8, 'red');
    this.speed = 5;
    this.jumpForce = -12;
    this.grounded = false;
    this.isDead = false;
  }

  update(input, deltaTime, blocks, enemies) {
    if (this.isDead) {
       this.vy += GRAVITY;
       this.y += this.vy;
       return;
    }

    // Horizontal movement
    if (input.isDown('ArrowLeft')) {
      this.vx -= 1;
    } else if (input.isDown('ArrowRight')) {
      this.vx += 1;
    }
    
    // Friction
    this.vx *= FRICTION;

    // Limit speed
    if (this.vx > this.speed) this.vx = this.speed;
    if (this.vx < -this.speed) this.vx = -this.speed;

    this.x += this.vx;
    this.handleCollisions(blocks, 'x');

    // Vertical movement
    this.vy += GRAVITY;
    this.y += this.vy;
    this.grounded = false;
    this.handleCollisions(blocks, 'y');

    // Jumping
    if ((input.isDown('ArrowUp') || input.isDown('Space')) && this.grounded) {
      this.vy = this.jumpForce;
      this.grounded = false;
    }

    // Bounds
    if (this.y > CANVAS_HEIGHT) {
      this.isDead = true;
    }
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }
  }

  handleCollisions(blocks, axis) {
    for (let block of blocks) {
      if (this.checkCollision(this, block)) {
        if (axis === 'x') {
          if (this.vx > 0) {
            this.x = block.x - this.width;
            this.vx = 0;
          } else if (this.vx < 0) {
            this.x = block.x + block.width;
            this.vx = 0;
          }
        } else if (axis === 'y') {
          if (this.vy > 0) {
            this.y = block.y - this.height;
            this.vy = 0;
            this.grounded = true;
          } else if (this.vy < 0) {
            this.y = block.y + block.height;
            this.vy = 0;
          }
        }
      }
    }
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}

export class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, TILE_SIZE * 0.8, TILE_SIZE * 0.8, 'brown');
    this.vx = -1.5; // Move left initially
  }

  update(deltaTime, blocks) {
    this.vy += GRAVITY;
    this.y += this.vy;
    this.handleCollisions(blocks, 'y');

    this.x += this.vx;
    this.handleCollisions(blocks, 'x');
    
    // Bounds check to avoid falling forever if off map
    if (this.y > CANVAS_HEIGHT + 100) {
        this.markedForDeletion = true;
    }
  }

  handleCollisions(blocks, axis) {
    for (let block of blocks) {
      if (this.checkCollision(this, block)) {
        if (axis === 'x') {
          this.vx *= -1; // Reverse direction on wall hit
          if (this.vx > 0) {
            this.x = block.x + block.width;
          } else {
            this.x = block.x - this.width;
          }
        } else if (axis === 'y') {
          if (this.vy > 0) {
            this.y = block.y - this.height;
            this.vy = 0;
          }
        }
      }
    }
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}

export class Block extends Entity {
  constructor(x, y, width = TILE_SIZE, height = TILE_SIZE) {
    super(x, y, width, height, '#D2691E'); // Chocolate color for bricks/ground
  }
}
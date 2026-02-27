import { TILE_SIZE, TILE, CANVAS_HEIGHT } from './constants.js';
import { Goomba, Koopa, Coin } from './entities.js';

// Level data
// 0 = empty, 1 = ground, 2 = brick, 3 = question(coin), 4 = question(mushroom)
// 5-8 = pipe parts, 9 = hard block, 10 = used block, 11 = flag pole, 12 = flag top

export class Level {
  constructor() {
    this.width = 100; // tiles wide
    this.height = 19; // tiles tall (600 / 32 ≈ 19)
    this.tiles = [];
    this.enemies = [];
    this.coins = [];
    this.questionBlocks = []; // Track question blocks with their contents
    this.spawnX = 64;
    this.spawnY = CANVAS_HEIGHT - TILE_SIZE * 3;
    this.flagX = 0;

    this.generate();
  }

  generate() {
    // Initialize with empty tiles
    this.tiles = new Array(this.width * this.height).fill(0);

    // Ground level is at row 17 and 18 (bottom two rows)
    const groundLevel = 17;

    // Create base ground
    for (let x = 0; x < this.width; x++) {
      // Create gaps in ground at certain positions
      const hasGap = (x >= 25 && x <= 27) || (x >= 55 && x <= 57);

      if (!hasGap) {
        this.setTile(x, groundLevel, TILE.GROUND);
        this.setTile(x, groundLevel + 1, TILE.GROUND);
      }
    }

    // Platform structures and obstacles
    this.addPlatformSection();
    this.addPipes();
    this.addQuestionBlocks();
    this.addBrickPlatforms();
    this.addStairs();
    this.addFlag();
    this.addEnemies();
    this.addCollectibleCoins();

    // Background decorations positions stored separately
    this.decorations = this.generateDecorations();
  }

  setTile(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y * this.width + x] = value;
    }
  }

  getTile(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y * this.width + x];
    }
    return 0;
  }

  addPlatformSection() {
    const groundLevel = 17;

    // Floating platform 1
    for (let x = 8; x <= 11; x++) {
      this.setTile(x, groundLevel - 4, TILE.BRICK);
    }

    // Floating platform 2
    for (let x = 35; x <= 39; x++) {
      this.setTile(x, groundLevel - 5, TILE.BRICK);
    }

    // High platform
    for (let x = 45; x <= 48; x++) {
      this.setTile(x, groundLevel - 8, TILE.BRICK);
    }

    // Platform over gap
    for (let x = 24; x <= 28; x++) {
      this.setTile(x, groundLevel - 4, TILE.BRICK);
    }

    // Second gap platform
    for (let x = 54; x <= 58; x++) {
      this.setTile(x, groundLevel - 3, TILE.BRICK);
    }
  }

  addPipes() {
    const groundLevel = 17;

    // Pipe 1 - small
    this.addPipe(15, groundLevel - 2, 2);

    // Pipe 2 - medium
    this.addPipe(30, groundLevel - 3, 3);

    // Pipe 3 - tall
    this.addPipe(50, groundLevel - 4, 4);

    // Pipe 4 - small
    this.addPipe(65, groundLevel - 2, 2);
  }

  addPipe(x, topY, height) {
    // Pipe top
    this.setTile(x, topY, TILE.PIPE_TOP_LEFT);
    this.setTile(x + 1, topY, TILE.PIPE_TOP_RIGHT);

    // Pipe body
    for (let y = topY + 1; y < topY + height; y++) {
      this.setTile(x, y, TILE.PIPE_BODY_LEFT);
      this.setTile(x + 1, y, TILE.PIPE_BODY_RIGHT);
    }
  }

  addQuestionBlocks() {
    const groundLevel = 17;

    // Question block cluster 1
    this.setTile(5, groundLevel - 4, TILE.QUESTION_COIN);
    this.questionBlocks.push({ x: 5, y: groundLevel - 4, content: 'coin', used: false });

    // Question blocks with brick
    this.setTile(18, groundLevel - 4, TILE.BRICK);
    this.setTile(19, groundLevel - 4, TILE.QUESTION_COIN);
    this.questionBlocks.push({ x: 19, y: groundLevel - 4, content: 'coin', used: false });
    this.setTile(20, groundLevel - 4, TILE.BRICK);
    this.setTile(21, groundLevel - 4, TILE.QUESTION_MUSHROOM);
    this.questionBlocks.push({ x: 21, y: groundLevel - 4, content: 'mushroom', used: false });
    this.setTile(22, groundLevel - 4, TILE.BRICK);

    // Hidden block area
    this.setTile(40, groundLevel - 4, TILE.QUESTION_COIN);
    this.questionBlocks.push({ x: 40, y: groundLevel - 4, content: 'coin', used: false });
    this.setTile(42, groundLevel - 4, TILE.QUESTION_COIN);
    this.questionBlocks.push({ x: 42, y: groundLevel - 4, content: 'coin', used: false });
    this.setTile(44, groundLevel - 4, TILE.QUESTION_MUSHROOM);
    this.questionBlocks.push({ x: 44, y: groundLevel - 4, content: 'mushroom', used: false });

    // High question blocks
    this.setTile(20, groundLevel - 8, TILE.QUESTION_COIN);
    this.questionBlocks.push({ x: 20, y: groundLevel - 8, content: 'coin', used: false });

    // Near end
    this.setTile(70, groundLevel - 4, TILE.QUESTION_COIN);
    this.questionBlocks.push({ x: 70, y: groundLevel - 4, content: 'coin', used: false });
    this.setTile(72, groundLevel - 4, TILE.QUESTION_MUSHROOM);
    this.questionBlocks.push({ x: 72, y: groundLevel - 4, content: 'mushroom', used: false });
  }

  addBrickPlatforms() {
    const groundLevel = 17;

    // Brick row 1
    for (let x = 60; x <= 64; x++) {
      this.setTile(x, groundLevel - 4, TILE.BRICK);
    }

    // Ascending bricks
    this.setTile(75, groundLevel - 3, TILE.BRICK);
    this.setTile(76, groundLevel - 3, TILE.BRICK);
    this.setTile(76, groundLevel - 4, TILE.BRICK);
    this.setTile(77, groundLevel - 3, TILE.BRICK);
    this.setTile(77, groundLevel - 4, TILE.BRICK);
    this.setTile(77, groundLevel - 5, TILE.BRICK);
  }

  addStairs() {
    const groundLevel = 17;

    // Stair structure near flag (like classic Mario)
    const stairStart = 85;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j <= i; j++) {
        this.setTile(stairStart + i, groundLevel - 1 - j, TILE.HARD_BLOCK);
      }
    }
  }

  addFlag() {
    const groundLevel = 17;
    const flagX = 95;
    this.flagX = flagX * TILE_SIZE;

    // Flag pole
    for (let y = groundLevel - 10; y < groundLevel; y++) {
      this.setTile(flagX, y, TILE.FLAG_POLE);
    }
    this.setTile(flagX, groundLevel - 10, TILE.FLAG_TOP);

    // Castle-like structure after flag
    for (let x = 97; x <= 99; x++) {
      for (let y = groundLevel - 4; y < groundLevel; y++) {
        this.setTile(x, y, TILE.HARD_BLOCK);
      }
    }
  }

  addEnemies() {
    const groundLevel = 17;
    const groundY = groundLevel * TILE_SIZE - 4;

    // Goombas
    this.enemies.push(new Goomba(12 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(23 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(24 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(35 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(52 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(53 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(62 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(75 * TILE_SIZE, groundY - TILE_SIZE));
    this.enemies.push(new Goomba(80 * TILE_SIZE, groundY - TILE_SIZE));

    // Koopas
    this.enemies.push(new Koopa(45 * TILE_SIZE, groundY - TILE_SIZE - 8));
    this.enemies.push(new Koopa(68 * TILE_SIZE, groundY - TILE_SIZE - 8));
  }

  addCollectibleCoins() {
    const groundLevel = 17;

    // Coin row above first platform
    for (let x = 9; x <= 10; x++) {
      const coin = new Coin(x * TILE_SIZE + 4, (groundLevel - 6) * TILE_SIZE + 4);
      this.coins.push(coin);
    }

    // Coins in mid-air
    for (let x = 36; x <= 38; x++) {
      const coin = new Coin(x * TILE_SIZE + 4, (groundLevel - 7) * TILE_SIZE + 4);
      this.coins.push(coin);
    }

    // Coins above gap platform
    for (let x = 55; x <= 57; x++) {
      const coin = new Coin(x * TILE_SIZE + 4, (groundLevel - 5) * TILE_SIZE + 4);
      this.coins.push(coin);
    }

    // Coins near stairs
    for (let x = 82; x <= 84; x++) {
      const coin = new Coin(x * TILE_SIZE + 4, (groundLevel - 3) * TILE_SIZE + 4);
      this.coins.push(coin);
    }
  }

  generateDecorations() {
    const decorations = {
      clouds: [],
      bushes: [],
      hills: []
    };

    // Generate clouds
    for (let i = 0; i < 15; i++) {
      decorations.clouds.push({
        x: i * 400 + Math.random() * 200,
        y: 40 + Math.random() * 80,
        size: 15 + Math.random() * 15
      });
    }

    // Generate bushes
    for (let i = 0; i < 12; i++) {
      decorations.bushes.push({
        x: i * 350 + Math.random() * 150,
        y: CANVAS_HEIGHT - TILE_SIZE * 2,
        size: 15 + Math.random() * 10
      });
    }

    // Generate hills
    for (let i = 0; i < 8; i++) {
      decorations.hills.push({
        x: i * 500 + Math.random() * 200,
        y: CANVAS_HEIGHT - TILE_SIZE * 2,
        width: 150 + Math.random() * 100,
        height: 60 + Math.random() * 40
      });
    }

    return decorations;
  }

  hitBlock(tileX, tileY) {
    const tile = this.getTile(tileX, tileY);

    if (tile === TILE.BRICK) {
      return { type: 'brick', break: true };
    }

    if (tile === TILE.QUESTION_COIN || tile === TILE.QUESTION_MUSHROOM) {
      // Find the question block data
      const block = this.questionBlocks.find(b => b.x === tileX && b.y === tileY);
      if (block && !block.used) {
        block.used = true;
        this.setTile(tileX, tileY, TILE.USED_BLOCK);
        return { type: 'question', content: block.content };
      }
    }

    return null;
  }

  reset() {
    this.enemies = [];
    this.coins = [];
    this.questionBlocks = [];
    this.generate();
  }
}

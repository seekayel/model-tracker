import {
  ENEMY_ROWS, ENEMY_COLS, ENEMY_H_SPACING, ENEMY_V_SPACING,
  ENEMY_START_Y, ENEMY_WIDTH, ENEMY_FORMATION_SPEED,
  CANVAS_WIDTH, ENEMY_TYPE
} from './constants.js';
import { Enemy } from './enemy.js';

export class Formation {
  constructor() {
    this.enemies = [];
    this.offsetX = 0;
    this.direction = 1;
    this.diveTimer = 0;
    this.diveInterval = 120; // frames between dive attacks
    this.waveNumber = 1;
  }

  reset() {
    this.enemies = [];
    this.offsetX = 0;
    this.direction = 1;
    this.diveTimer = 0;
  }

  createWave(waveNumber) {
    this.waveNumber = waveNumber;
    this.enemies = [];
    this.offsetX = 0;
    this.direction = 1;

    // Calculate starting X to center the formation
    const formationWidth = ENEMY_COLS * ENEMY_H_SPACING;
    const startX = (CANVAS_WIDTH - formationWidth) / 2 + ENEMY_H_SPACING / 2;

    // Adjust dive interval based on wave
    this.diveInterval = Math.max(60, 120 - waveNumber * 10);

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        const type = this.getEnemyType(row);
        const x = startX + col * ENEMY_H_SPACING;
        const y = ENEMY_START_Y + row * ENEMY_V_SPACING;

        const enemy = new Enemy(type, col, row, x, y);
        // Start enemies above the screen
        enemy.y = -100 - row * 30;
        this.enemies.push(enemy);
      }
    }
  }

  getEnemyType(row) {
    if (row === 0) return ENEMY_TYPE.BOSS;
    if (row <= 2) return ENEMY_TYPE.BUTTERFLY;
    return ENEMY_TYPE.BEE;
  }

  update(playerX, playerY) {
    // Update formation horizontal movement
    this.offsetX += ENEMY_FORMATION_SPEED * this.direction;

    // Reverse direction at edges
    const maxOffset = 30;
    if (Math.abs(this.offsetX) > maxOffset) {
      this.direction *= -1;
      this.offsetX = maxOffset * this.direction;
    }

    // Update each enemy
    this.enemies.forEach(enemy => {
      if (enemy.state === 'formation') {
        // Apply formation offset
        const baseX = this.getBaseX(enemy.gridX);
        enemy.updateFormationPosition(baseX + this.offsetX, this.getBaseY(enemy.gridY));
      }
      enemy.update(playerX, playerY);
    });

    // Remove inactive enemies
    this.enemies = this.enemies.filter(enemy => enemy.active);

    // Trigger dive attacks
    this.diveTimer++;
    if (this.diveTimer >= this.diveInterval) {
      this.diveTimer = 0;
      this.triggerDiveAttack(playerX);
    }
  }

  getBaseX(gridX) {
    const formationWidth = ENEMY_COLS * ENEMY_H_SPACING;
    const startX = (CANVAS_WIDTH - formationWidth) / 2 + ENEMY_H_SPACING / 2;
    return startX + gridX * ENEMY_H_SPACING;
  }

  getBaseY(gridY) {
    return ENEMY_START_Y + gridY * ENEMY_V_SPACING;
  }

  triggerDiveAttack(playerX) {
    // Find enemies in formation that can dive
    const inFormation = this.enemies.filter(e => e.state === 'formation');
    if (inFormation.length === 0) return;

    // Pick 1-3 random enemies based on wave number
    const numDivers = Math.min(inFormation.length, Math.min(3, 1 + Math.floor(this.waveNumber / 2)));

    for (let i = 0; i < numDivers; i++) {
      const randomIndex = Math.floor(Math.random() * inFormation.length);
      inFormation[randomIndex].startDive(playerX);
      inFormation.splice(randomIndex, 1);
    }
  }

  getEnemies() {
    return this.enemies;
  }

  getAllBullets() {
    let bullets = [];
    this.enemies.forEach(enemy => {
      bullets = bullets.concat(enemy.bullets);
    });
    return bullets;
  }

  isEmpty() {
    return this.enemies.length === 0;
  }

  draw(ctx) {
    this.enemies.forEach(enemy => enemy.draw(ctx));
  }
}

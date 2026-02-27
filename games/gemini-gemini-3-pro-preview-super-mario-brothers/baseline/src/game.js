import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { Player } from './entities.js';
import { InputHandler } from './input.js';
import { loadLevel } from './level.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    
    this.input = new InputHandler();
    this.state = 'START'; // START, PLAYING, GAMEOVER, WIN
    this.score = 0;
    this.cameraX = 0;
    
    this.uiOverlay = document.getElementById('message-overlay');
    this.uiTitle = document.getElementById('message-title');
    this.uiSubtitle = document.getElementById('message-subtitle');
    this.uiScore = document.getElementById('score');

    this.lastTime = 0;
    this.initLevel();
  }

  initLevel() {
    this.player = new Player(100, 100);
    const levelData = loadLevel();
    this.blocks = levelData.blocks;
    this.enemies = levelData.enemies;
    this.goalX = levelData.goalX;
    this.cameraX = 0;
    this.score = 0;
    this.updateScoreDisplay();
  }

  start() {
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame((time) => this.loop(time));
  }

  update(deltaTime) {
    if (this.state === 'START') {
      if (this.input.isDown('Enter')) {
        this.state = 'PLAYING';
        this.hideUI();
        this.initLevel();
      }
      return;
    }

    if (this.state === 'GAMEOVER' || this.state === 'WIN') {
      if (this.input.isDown('Enter')) {
        this.state = 'PLAYING';
        this.hideUI();
        this.initLevel();
      }
      return;
    }

    if (this.state === 'PLAYING') {
      this.player.update(this.input, deltaTime, this.blocks, this.enemies);

      // Camera follow player
      if (this.player.x > CANVAS_WIDTH / 2) {
         this.cameraX = this.player.x - CANVAS_WIDTH / 2;
      } else {
         this.cameraX = 0;
      }
      // Prevent camera from going backwards beyond start
      if (this.cameraX < 0) this.cameraX = 0;

      // Update enemies
      this.enemies.forEach(enemy => {
        // Only update enemies near camera
        if (enemy.x > this.cameraX - 100 && enemy.x < this.cameraX + CANVAS_WIDTH + 100) {
           enemy.update(deltaTime, this.blocks);
           
           // Check collision with player
           if (!this.player.isDead && this.player.checkCollision(this.player, enemy)) {
              // Player falling down on enemy?
              if (this.player.vy > 0 && (this.player.y + this.player.height - this.player.vy) <= enemy.y + 15) {
                  enemy.markedForDeletion = true;
                  this.player.vy = this.player.jumpForce * 0.8; // Bounce
                  this.score += 100;
                  this.updateScoreDisplay();
              } else {
                  this.player.isDead = true;
                  this.player.vy = -10; // Death hop
              }
           }
        }
      });

      this.enemies = this.enemies.filter(e => !e.markedForDeletion);

      if (this.player.isDead && this.player.y > CANVAS_HEIGHT + 200) {
         this.state = 'GAMEOVER';
         this.showUI('Game Over', 'Press Enter to Restart');
      }

      if (this.player.x >= this.goalX) {
         this.state = 'WIN';
         this.showUI('Level Cleared!', `Score: ${this.score}. Press Enter to Restart`);
      }
    }
  }

  draw() {
    // Clear screen
    this.ctx.fillStyle = '#5C94FC';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.state === 'PLAYING' || this.state === 'GAMEOVER' || this.state === 'WIN') {
        this.blocks.forEach(block => {
            // Only draw blocks in view
            if (block.x > this.cameraX - block.width && block.x < this.cameraX + CANVAS_WIDTH) {
                block.draw(this.ctx, this.cameraX);
            }
        });
        
        this.enemies.forEach(enemy => {
           if (enemy.x > this.cameraX - enemy.width && enemy.x < this.cameraX + CANVAS_WIDTH) {
                enemy.draw(this.ctx, this.cameraX);
           }
        });

        this.player.draw(this.ctx, this.cameraX);
        
        // Draw goal
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(this.goalX - this.cameraX, CANVAS_HEIGHT - 200, 10, 200);
        this.ctx.fillStyle = 'green';
        this.ctx.beginPath();
        this.ctx.moveTo(this.goalX - this.cameraX + 10, CANVAS_HEIGHT - 200);
        this.ctx.lineTo(this.goalX - this.cameraX + 40, CANVAS_HEIGHT - 180);
        this.ctx.lineTo(this.goalX - this.cameraX + 10, CANVAS_HEIGHT - 160);
        this.ctx.fill();
    }
  }

  showUI(title, subtitle) {
    this.uiTitle.innerText = title;
    this.uiSubtitle.innerText = subtitle;
    this.uiOverlay.classList.remove('hidden');
  }

  hideUI() {
    this.uiOverlay.classList.add('hidden');
  }

  updateScoreDisplay() {
    this.uiScore.innerText = this.score;
  }
}
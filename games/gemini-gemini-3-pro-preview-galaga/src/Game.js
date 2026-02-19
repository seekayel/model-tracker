import Player from './entities/Player.js';
import Input from './Input.js';
import Enemy from './entities/Enemy.js';
import Bullet from './entities/Bullet.js';

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width = 480;
    this.height = canvas.height = 640;
    this.ctx = canvas.getContext('2d');
    
    this.input = new Input();
    this.player = new Player(this);
    
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.particles = []; // For explosions
    
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.gameStarted = false;
    
    this.formationX = 0;
    this.formationY = 0;
    this.formationDirection = 1;
    this.formationSpeed = 2;
    
    // UI Elements
    this.scoreEl = document.getElementById('score');
    this.livesEl = document.getElementById('lives');
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.finalScoreEl = document.getElementById('final-score');
    
    this.lastTime = 0;
    
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
         if (!this.gameStarted) {
             this.restart();
         } else if (this.gameOver) {
             this.restart();
         }
      }
    });
  }

  start() {
    this.animate(0);
  }

  restart() {
    this.gameStarted = true;
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.player = new Player(this);
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.createFormation();
    this.updateUI();
    
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
  }

  createFormation() {
    this.enemies = [];
    const rows = 4;
    const cols = 8;
    const startX = 50;
    const startY = 50;
    const spacingX = 40;
    const spacingY = 40;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Types based on row
        let type = 0; // Bee
        if (r === 0) type = 2; // Boss
        else if (r === 1) type = 1; // Butterfly
        
        const x = startX + c * spacingX;
        const y = startY + r * spacingY;
        this.enemies.push(new Enemy(this, x, y, type));
      }
    }
  }

  update(deltaTime) {
    if (!this.gameStarted || this.gameOver) return;

    // Update Player
    this.player.update(this.input);

    // Update Bullets
    this.bullets.forEach(b => b.update());
    this.bullets = this.bullets.filter(b => !b.markedForDeletion);
    
    this.enemyBullets.forEach(b => b.update());
    this.enemyBullets = this.enemyBullets.filter(b => !b.markedForDeletion);

    // Update Formation Movement
    this.formationX += this.formationSpeed * this.formationDirection;
    // Bounce off walls (taking into account approximate width of formation)
    // 8 cols * 40 spacing = ~320 width. 
    // If formationX moves too far right/left
    // Simplified bounds checking:
    if (this.formationX > 100 || this.formationX < -20) {
        this.formationDirection *= -1;
        this.formationY += 10; // Drop down
    }

    // Update Enemies
    this.enemies.forEach(e => {
        e.update(this.formationX, this.formationY);
        // Random shooting logic is inside Enemy.update
    });
    
    // Check if wave cleared
    if (this.enemies.length === 0) {
        this.createFormation();
        this.formationY = 0;
        this.formationSpeed += 0.5; // Difficulty up
    }

    this.checkCollisions();
    
    if (this.lives <= 0) {
        this.endGame();
    }
  }
  
  checkCollisions() {
    // Player Bullets hitting Enemies
    this.bullets.forEach(bullet => {
        this.enemies.forEach(enemy => {
            if (!bullet.markedForDeletion && !enemy.markedForDeletion && 
                this.checkCollision(bullet, enemy)) {
                bullet.markedForDeletion = true;
                enemy.markedForDeletion = true;
                
                // Score
                if (enemy.type === 0) this.score += 50;
                else if (enemy.type === 1) this.score += 80;
                else this.score += 150;
                
                this.updateUI();
                this.createExplosion(enemy.x, enemy.y, '#ff0');
            }
        });
    });
    
    this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    
    // Enemy Bullets hitting Player
    this.enemyBullets.forEach(bullet => {
        if (!bullet.markedForDeletion && this.checkCollision(bullet, this.player)) {
            bullet.markedForDeletion = true;
            this.handlePlayerHit();
        }
    });
    
    // Enemies colliding with Player
    this.enemies.forEach(enemy => {
        if (!enemy.markedForDeletion && this.checkCollision(enemy, this.player)) {
            enemy.markedForDeletion = true;
            this.handlePlayerHit();
        }
    });
  }
  
  checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
  }
  
  handlePlayerHit() {
      this.lives--;
      this.updateUI();
      this.createExplosion(this.player.x, this.player.y, '#f00');
      // Respawn logic or just blink? For now simple reset position
      this.player.x = this.width / 2;
      this.player.y = this.height - 50;
      
      if (this.lives <= 0) {
          this.endGame();
      }
  }

  createExplosion(x, y, color) {
      for(let i=0; i<10; i++) {
          this.particles.push({
              x: x, 
              y: y, 
              vx: (Math.random() - 0.5) * 5, 
              vy: (Math.random() - 0.5) * 5, 
              life: 20, 
              color: color
          });
      }
  }
  
  updateParticles() {
      this.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
      });
      this.particles = this.particles.filter(p => p.life > 0);
  }
  
  drawParticles(ctx) {
      this.particles.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 2, 2);
      });
  }

  draw() {
    // Clear
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw Stars (simple background)
    this.drawStars();
    
    if (!this.gameStarted) return;
    
    this.player.draw(this.ctx);
    this.bullets.forEach(b => b.draw(this.ctx));
    this.enemyBullets.forEach(b => b.draw(this.ctx));
    this.enemies.forEach(e => e.draw(this.ctx));
    
    this.drawParticles(this.ctx);
  }
  
  drawStars() {
      // Just some static stars for now, or scrolling if easy
      // Let's do random stars that move down slightly
      if (!this.stars) {
          this.stars = [];
          for(let i=0; i<50; i++) {
              this.stars.push({
                  x: Math.random() * this.width,
                  y: Math.random() * this.height,
                  speed: Math.random() * 2 + 0.5
              });
          }
      }
      
      this.ctx.fillStyle = 'white';
      this.stars.forEach(star => {
          this.ctx.fillRect(star.x, star.y, 1, 1);
          star.y += star.speed;
          if (star.y > this.height) star.y = 0;
      });
  }

  updateUI() {
    this.scoreEl.innerText = this.score;
    this.livesEl.innerText = this.lives;
  }
  
  endGame() {
      this.gameOver = true;
      this.finalScoreEl.innerText = this.score;
      this.gameOverScreen.classList.remove('hidden');
  }

  animate(timeStamp) {
    const deltaTime = timeStamp - this.lastTime;
    this.lastTime = timeStamp;
    
    this.update(deltaTime);
    this.updateParticles();
    this.draw();
    
    requestAnimationFrame(this.animate.bind(this));
  }
}

class Paddle {
  constructor(x, y, width, height, isAi = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isAi = isAi;
    this.speed = 8; // Player speed
    this.aiSpeed = 5.5; // Slightly slower than player for balance
    this.dy = 0;
    this.score = 0;
  }

  update(input, ball, canvasHeight) {
    if (this.isAi) {
      // Simple AI
      const center = this.y + this.height / 2;
      if (center < ball.y - 10) {
        this.dy = this.aiSpeed;
      } else if (center > ball.y + 10) {
        this.dy = -this.aiSpeed;
      } else {
        this.dy = 0;
      }
    } else {
      // Player input
      if (input.up) {
        this.dy = -this.speed;
      } else if (input.down) {
        this.dy = this.speed;
      } else {
        this.dy = 0;
      }
    }

    this.y += this.dy;

    // Bounds checking
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > canvasHeight) this.y = canvasHeight - this.height;
  }

  draw(ctx) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Ball {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.baseSpeed = 7;
    this.speed = this.baseSpeed;
    this.dx = 0;
    this.dy = 0;
    this.reset();
  }

  reset() {
    this.x = 400; // Center (hardcoded for now, will receive from game)
    this.y = 300;
    this.speed = this.baseSpeed;
    
    // Randomize start direction
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = (Math.random() * 2 - 1); // Random between -1 and 1
    
    this.dx = dirX * this.speed;
    this.dy = dirY * this.speed;
  }

  update(paddles, canvasWidth, canvasHeight, onScore) {
    this.x += this.dx;
    this.y += this.dy;

    // Wall collisions (Top/Bottom)
    if (this.y < 0 || this.y + this.size > canvasHeight) {
      this.dy *= -1;
      // Prevent sticking
      if (this.y < 0) this.y = 0;
      if (this.y + this.size > canvasHeight) this.y = canvasHeight - this.size;
    }

    // Paddle collisions
    paddles.forEach(paddle => {
      if (
        this.x < paddle.x + paddle.width &&
        this.x + this.size > paddle.x &&
        this.y < paddle.y + paddle.height &&
        this.y + this.size > paddle.y
      ) {
        const isLeftPaddle = paddle.x < canvasWidth / 2;
        
        // Only bounce if moving towards the paddle
        if (isLeftPaddle && this.dx < 0) {
          this.speed = Math.min(this.speed * 1.05, 15);
          this.dx = this.speed; // Force positive (move right)
          
          const hitPoint = (this.y + this.size / 2) - (paddle.y + paddle.height / 2);
          this.dy = hitPoint * 0.3; 
        } else if (!isLeftPaddle && this.dx > 0) {
          this.speed = Math.min(this.speed * 1.05, 15);
          this.dx = -this.speed; // Force negative (move left)
          
          const hitPoint = (this.y + this.size / 2) - (paddle.y + paddle.height / 2);
          this.dy = hitPoint * 0.3; 
        }
      }
    });

    // Scoring (Left/Right walls)
    if (this.x < 0) {
      onScore('ai');
    } else if (this.x > canvasWidth) {
      onScore('player');
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    // Square ball fits Pong aesthetic well
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.fill();
  }
}

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.width = canvas.width;
    this.height = canvas.height;

    this.state = 'MENU'; // MENU, PLAYING, GAMEOVER
    this.input = { up: false, down: false };

    // Game Objects
    const paddleWidth = 15;
    const paddleHeight = 80;
    const padding = 20;

    this.player = new Paddle(padding, this.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, false);
    this.ai = new Paddle(this.width - padding - paddleWidth, this.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, true);
    this.ball = new Ball(this.width / 2, this.height / 2, 12);
    this.ball.x = this.width / 2; // Init center

    // UI Elements
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.scoreBoard = document.getElementById('score-board');
    this.playerScoreEl = document.getElementById('player-score');
    this.aiScoreEl = document.getElementById('ai-score');
    this.winnerTextEl = document.getElementById('winner-text');

    this.winningScore = 5;

    this.setupInput();
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.input.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.input.down = true;
      if (e.code === 'Space') this.handleAction();
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.input.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.input.down = false;
    });
  }

  handleAction() {
    if (this.state === 'MENU') {
      this.startGame();
    } else if (this.state === 'GAMEOVER') {
      this.resetGame();
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.startScreen.classList.add('hidden');
    this.scoreBoard.classList.remove('hidden');
    this.ball.reset();
  }

  resetGame() {
    this.player.score = 0;
    this.ai.score = 0;
    this.updateScoreUI();
    this.gameOverScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
    this.state = 'MENU';
    
    // Reset positions
    this.player.y = this.height / 2 - this.player.height / 2;
    this.ai.y = this.height / 2 - this.ai.height / 2;
  }

  handleScore(winner) {
    if (winner === 'player') {
      this.player.score++;
    } else {
      this.ai.score++;
    }
    this.updateScoreUI();
    this.ball.reset();

    if (this.player.score >= this.winningScore || this.ai.score >= this.winningScore) {
      this.endGame(winner);
    }
  }

  updateScoreUI() {
    this.playerScoreEl.innerText = this.player.score;
    this.aiScoreEl.innerText = this.ai.score;
  }

  endGame(winner) {
    this.state = 'GAMEOVER';
    this.winnerTextEl.innerText = winner === 'player' ? 'YOU WIN!' : 'GAME OVER';
    this.winnerTextEl.style.color = winner === 'player' ? '#4f4' : '#f44';
    this.gameOverScreen.classList.remove('hidden');
  }

  update() {
    if (this.state !== 'PLAYING') return;

    this.player.update(this.input, this.ball, this.height);
    this.ai.update(null, this.ball, this.height);
    this.ball.update([this.player, this.ai], this.width, this.height, (winner) => this.handleScore(winner));
  }

  draw() {
    // Clear background
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw Net
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.setLineDash([10, 15]);
    this.ctx.moveTo(this.width / 2, 0);
    this.ctx.lineTo(this.width / 2, this.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.player.draw(this.ctx);
    this.ai.draw(this.ctx);
    
    if (this.state === 'PLAYING') {
      this.ball.draw(this.ctx);
    }
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };
    loop();
  }
}

import { Ball } from './ball';
import { Paddle } from './paddle';
import { UI } from './ui';

enum GameState {
  Start,
  Playing,
  End,
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball: Ball;
  private player1: Paddle;
  private player2: Paddle;
  private ui: UI;
  private keys: { [key: string]: boolean } = {};

  private player1Score = 0;
  private player2Score = 0;
  private gameState = GameState.Start;
  private winningScore = 5;
  private winner: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = 800;
    this.canvas.height = 600;

    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10, 5, 5, this.canvas.width, this.canvas.height);
    this.player1 = new Paddle(20, this.canvas.height / 2 - 50, 15, 100, 10, this.canvas.height);
    this.player2 = new Paddle(this.canvas.width - 35, this.canvas.height / 2 - 50, 15, 100, 10, this.canvas.height);
    this.ui = new UI(this.canvas);

    window.addEventListener('keydown', (e) => (this.keys[e.key] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.key] = false));
  }

  private handleInput() {
    // Player 1 controls
    if (this.keys['w']) this.player1.moveUp();
    if (this.keys['s']) this.player1.moveDown();

    // Player 2 controls
    if (this.keys['ArrowUp']) this.player2.moveUp();
    if (this.keys['ArrowDown']) this.player2.moveDown();

    // Game state controls
    if (this.gameState === GameState.Start && this.keys['Enter']) {
      this.gameState = GameState.Playing;
    }
    if (this.gameState === GameState.End && this.keys['Enter']) {
      this.resetGame();
    }
  }

  private update() {
    if (this.gameState !== GameState.Playing) return;

    this.ball.move();
    this.checkCollisions();
  }

  private checkCollisions() {
    // Wall collisions (top/bottom)
    if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
      this.ball.speedY = -this.ball.speedY;
    }

    // Paddle collisions
    const collidesWithPlayer1 =
      this.ball.x - this.ball.radius < this.player1.x + this.player1.width &&
      this.ball.y > this.player1.y &&
      this.ball.y < this.player1.y + this.player1.height;

    const collidesWithPlayer2 =
      this.ball.x + this.ball.radius > this.player2.x &&
      this.ball.y > this.player2.y &&
      this.ball.y < this.player2.y + this.player2.height;

    if (collidesWithPlayer1 || collidesWithPlayer2) {
      this.ball.speedX = -this.ball.speedX;
      // Increase speed slightly on paddle hit
      this.ball.speedX *= 1.05;
      this.ball.speedY *= 1.05;
    }
    
    // Score collisions (left/right walls)
    if (this.ball.x - this.ball.radius < 0) {
      this.player2Score++;
      this.ball.reset(this.canvas.width / 2, this.canvas.height / 2);
    } else if (this.ball.x + this.ball.radius > this.canvas.width) {
      this.player1Score++;
      this.ball.reset(this.canvas.width / 2, this.canvas.height / 2);
    }

    // Check for winner
    if (this.player1Score >= this.winningScore) {
        this.winner = 'Player 1';
        this.gameState = GameState.End;
    } else if (this.player2Score >= this.winningScore) {
        this.winner = 'Player 2';
        this.gameState = GameState.End;
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ui.drawScore(this.player1Score, this.player2Score);

    if (this.gameState === GameState.Start) {
      this.ui.drawStartMessage();
    } else if (this.gameState === GameState.Playing) {
      this.ball.draw(this.ctx);
      this.player1.draw(this.ctx);
      this.player2.draw(this.ctx);
    } else if (this.gameState === GameState.End && this.winner) {
        this.ui.drawEndMessage(this.winner);
    }
  }

  private resetGame() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.winner = null;
    this.ball.reset(this.canvas.width / 2, this.canvas.height / 2);
    this.player1.y = this.canvas.height / 2 - 50;
    this.player2.y = this.canvas.height / 2 - 50;
    this.gameState = GameState.Start;
  }

  public gameLoop = () => {
    this.handleInput();
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  };
}

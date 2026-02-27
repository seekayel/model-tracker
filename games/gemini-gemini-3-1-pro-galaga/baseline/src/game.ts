import { Player } from './player';
import { EnemyFleet } from './enemy';
import { InputHandler } from './input';
import { Bullet } from './bullet';
import { UI } from './ui';

enum GameState {
    START_SCREEN,
    PLAYING,
    GAME_OVER
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private enemyFleet: EnemyFleet;
    private input: InputHandler;
    private bullets: Bullet[] = [];
    private ui: UI;
    
    private state: GameState = GameState.START_SCREEN;
    private score: number = 0;
    private lives: number = 3;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.input = new InputHandler();
        this.ui = new UI();
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.enemyFleet = new EnemyFleet(this.canvas.width);
        
        this.setupInputHandlers();
    }
    
    setupInputHandlers() {
         window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (this.state === GameState.START_SCREEN) {
                    this.startGame();
                } else if (this.state === GameState.GAME_OVER) {
                    this.restartGame();
                }
            }
             if (e.key === ' ' && this.state === GameState.PLAYING) {
                 const bullet = this.player.shoot();
                 if (bullet) {
                     this.bullets.push(bullet);
                 }
             }
        });
    }

    startGame() {
        this.state = GameState.PLAYING;
        this.ui.hideStartScreen();
    }

    restartGame() {
        this.state = GameState.PLAYING;
        this.ui.hideGameOverScreen();
        this.score = 0;
        this.lives = 3;
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.enemyFleet = new EnemyFleet(this.canvas.width);
        this.bullets = [];
        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
    }
    
    update() {
        if (this.state !== GameState.PLAYING) return;

        this.player.update(this.input);
        this.enemyFleet.update();

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            if (bullet.y < 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        this.checkCollisions();

        if (this.enemyFleet.enemies.every(e => !e.isAlive)) {
             this.enemyFleet = new EnemyFleet(this.canvas.width);
        }

        const bottomOfGame = this.enemyFleet.enemies.some(e => e.isAlive && (e.y + e.height) >= this.player.y);
        if (bottomOfGame) {
            this.lives--;
            this.ui.updateLives(this.lives);
            this.enemyFleet = new EnemyFleet(this.canvas.width);
        }

        if(this.lives <= 0) {
            this.state = GameState.GAME_OVER;
            this.ui.showGameOverScreen();
        }
    }

    checkCollisions() {
        // Bullets with enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemyFleet.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemyFleet.enemies[j];
                if (enemy.isAlive &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                        
                    enemy.isAlive = false;
                    this.bullets.splice(i, 1);
                    this.score += 100;
                    this.ui.updateScore(this.score);
                    break; 
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.state === GameState.PLAYING) {
            this.player.draw(this.ctx);
            this.enemyFleet.draw(this.ctx);
            for (const bullet of this.bullets) {
                bullet.draw(this.ctx);
            }
        }
    }

    getGameState() {
        return this.state;
    }
}

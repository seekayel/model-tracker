import Player from './Player.js';
import EnemyController from './EnemyController.js';

const GameState = {
    START: 0,
    PLAYING: 1,
    GAME_OVER: 2,
};

export default class Game {
    constructor(gameWidth, gameHeight, messageEl, scoreEl) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.messageEl = messageEl;
        this.scoreEl = scoreEl;

        this.gameState = GameState.START;
        this.player = new Player(this);
        this.enemyController = new EnemyController(this);
        this.gameObjects = [];
        this.score = 0;

        this.setupInput();
    }

    setupInput() {
        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Enter' && (this.gameState === GameState.START || this.gameState === GameState.GAME_OVER)) {
                this.start();
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    start() {
        this.score = 0;
        this.scoreEl.innerText = `Score: 0`;
        this.gameState = GameState.PLAYING;
        this.messageEl.innerText = '';
        this.player.reset();
        this.enemyController.reset();
        this.gameObjects = [this.player, this.enemyController];
    }

    update(deltaTime) {
        if (this.gameState === GameState.START) {
            this.messageEl.innerText = 'Press Enter to Start';
            return;
        }
        if (this.gameState === GameState.GAME_OVER) {
            this.messageEl.innerText = `Game Over!
Final Score: ${this.score}
Press Enter to Restart`;
            return;
        }
        if (!deltaTime) return;


        this.gameObjects.forEach(obj => obj.update(this.keys, deltaTime));
    }

    draw(ctx) {
        this.gameObjects.forEach(obj => obj.draw(ctx));
    }
    
    addScore(points) {
        this.score += points;
        this.scoreEl.innerText = `Score: ${this.score}`;
    }

    gameOver() {
        this.gameState = GameState.GAME_OVER;
    }
}

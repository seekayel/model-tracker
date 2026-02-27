export class UI {
    private scoreEl: HTMLElement;
    private livesEl: HTMLElement;
    private startScreen: HTMLElement;
    private gameOverScreen: HTMLElement;

    constructor() {
        this.scoreEl = document.getElementById('score')!;
        this.livesEl = document.getElementById('lives')!;
        this.startScreen = document.getElementById('startScreen')!;
        this.gameOverScreen = document.getElementById('gameOverScreen')!;
    }

    updateScore(score: number) {
        this.scoreEl.innerText = score.toString();
    }

    updateLives(lives: number) {
        this.livesEl.innerText = lives.toString();
    }

    showStartScreen() {
        this.startScreen.style.display = 'block';
    }

    hideStartScreen() {
        this.startScreen.style.display = 'none';
    }

    showGameOverScreen() {
        this.gameOverScreen.style.display = 'block';
    }

    hideGameOverScreen() {
        this.gameOverScreen.style.display = 'none';
    }
}

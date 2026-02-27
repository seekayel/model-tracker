import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    canvas.width = 800;
    canvas.height = 600;

    const game = new Game(canvas);

    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const hud = document.getElementById('hud');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    startBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        hud.classList.remove('hidden');
        game.start();
    });

    restartBtn.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        hud.classList.remove('hidden');
        game.start();
    });

    game.onGameOver = (score) => {
        hud.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
        document.getElementById('final-score').innerText = score;
    };
});

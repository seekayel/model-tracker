import './style.css'
import { Game } from './game';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const game = new Game(canvas);

    function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
    }

    if (game.getGameState() === 0) { // START_SCREEN
        const ui = {
            startScreen: document.getElementById('startScreen')!,
            hideStartScreen: function() { this.startScreen.style.display = 'none'; }
        };
        ui.startScreen.style.display = 'block';
    }

    gameLoop();
});

import { Game } from './game';
import './styles.css';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const game = new Game(canvas);

game.gameLoop();

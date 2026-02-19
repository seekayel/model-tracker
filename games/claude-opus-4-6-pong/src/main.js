import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { initInput } from './input.js';
import { createGame } from './game.js';

const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlay-message');

initInput();
createGame(ctx, overlay, overlayMessage);

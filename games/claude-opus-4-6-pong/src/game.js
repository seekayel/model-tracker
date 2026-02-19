import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  WIN_SCORE,
} from './constants.js';
import { createPaddle, movePaddle, updatePaddle } from './paddle.js';
import { createBall, resetBall, updateBall } from './ball.js';
import { updateAI } from './ai.js';
import { isKeyDown } from './input.js';
import { drawScene } from './renderer.js';

/**
 * Game phases:
 *  - 'idle'    : waiting to start
 *  - 'playing' : active gameplay
 *  - 'scored'  : brief pause after a point
 *  - 'won'     : someone reached WIN_SCORE
 */

export function createGame(ctx, overlay, overlayMessage) {
  const state = {
    phase: 'idle',
    scoreLeft: 0,
    scoreRight: 0,
    leftPaddle: createPaddle(PADDLE_MARGIN),
    rightPaddle: createPaddle(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH),
    ball: createBall(),
    scorePauseTimer: 0,
    overlay,
    overlayMessage,
  };

  function setPhase(phase) {
    state.phase = phase;

    if (phase === 'idle') {
      overlay.classList.remove('hidden');
      overlay.querySelector('h1').textContent = 'PONG';
      overlayMessage.textContent = 'Press SPACE to start';
    } else if (phase === 'won') {
      overlay.classList.remove('hidden');
      const winner = state.scoreLeft >= WIN_SCORE ? 'Player' : 'CPU';
      overlay.querySelector('h1').textContent = `${winner} wins!`;
      overlayMessage.textContent = `${state.scoreLeft} - ${state.scoreRight}  |  Press SPACE to restart`;
    } else {
      overlay.classList.add('hidden');
    }
  }

  function reset() {
    state.scoreLeft = 0;
    state.scoreRight = 0;
    state.leftPaddle = createPaddle(PADDLE_MARGIN);
    state.rightPaddle = createPaddle(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH);
    resetBall(state.ball);
  }

  function handleInput() {
    if (state.phase === 'idle' || state.phase === 'won') {
      if (isKeyDown('Space')) {
        reset();
        setPhase('playing');
      }
      return;
    }

    // Player (left paddle): W/S or ArrowUp/ArrowDown
    let dir = 0;
    if (isKeyDown('KeyW') || isKeyDown('ArrowUp')) dir = -1;
    if (isKeyDown('KeyS') || isKeyDown('ArrowDown')) dir = 1;
    movePaddle(state.leftPaddle, dir);
  }

  function update() {
    if (state.phase === 'scored') {
      state.scorePauseTimer--;
      if (state.scorePauseTimer <= 0) {
        setPhase('playing');
      }
      return;
    }

    if (state.phase !== 'playing') return;

    // Update paddles
    updatePaddle(state.leftPaddle);
    updateAI(state.rightPaddle, state.ball);

    // Update ball
    const scorer = updateBall(state.ball, state.leftPaddle, state.rightPaddle);

    if (scorer === 'left') {
      state.scoreLeft++;
      afterScore(-1);
    } else if (scorer === 'right') {
      state.scoreRight++;
      afterScore(1);
    }
  }

  function afterScore(serveTo) {
    if (state.scoreLeft >= WIN_SCORE || state.scoreRight >= WIN_SCORE) {
      setPhase('won');
    } else {
      resetBall(state.ball, serveTo);
      state.scorePauseTimer = 40; // ~0.67s at 60fps
      setPhase('scored');
    }
  }

  function render() {
    drawScene(ctx, state);
  }

  function tick() {
    handleInput();
    update();
    render();
    requestAnimationFrame(tick);
  }

  // Initialize
  setPhase('idle');
  tick();
}

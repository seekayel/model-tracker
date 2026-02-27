export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PADDLE_WIDTH = 14;
export const PADDLE_HEIGHT = 90;
export const PADDLE_SPEED = 5;
export const PADDLE_MARGIN = 20;

export const BALL_SIZE = 12;
export const BALL_INITIAL_SPEED = 5;
export const BALL_SPEED_INCREMENT = 0.3;
export const BALL_MAX_SPEED = 14;

export const WINNING_SCORE = 7;

export const AI_REACTION_DELAY = 0.08; // fraction of paddle height as error tolerance
export const AI_SPEED_FACTOR = 0.85;   // fraction of full paddle speed

export const COLORS = {
  background: '#0a0a0f',
  centerLine: '#1a1a2e',
  paddle: '#e0e0ff',
  ball: '#ffffff',
  score: '#e0e0ff',
  hud: '#8888cc',
  winText: '#ffdd55',
  dimText: '#555588',
};

export const GAME_STATE = {
  WAITING: 'WAITING',
  PLAYING: 'PLAYING',
  SCORED: 'SCORED',
  GAME_OVER: 'GAME_OVER',
};

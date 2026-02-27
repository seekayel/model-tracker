// Game dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Paddle configuration
export const PADDLE_WIDTH = 12;
export const PADDLE_HEIGHT = 100;
export const PADDLE_SPEED = 8;
export const PADDLE_MARGIN = 20;

// Ball configuration
export const BALL_SIZE = 12;
export const BALL_INITIAL_SPEED = 6;
export const BALL_MAX_SPEED = 12;
export const BALL_SPEED_INCREMENT = 0.5;

// Scoring
export const WINNING_SCORE = 11;

// Colors
export const COLORS = {
  background: '#1a1a2e',
  paddle: '#ffffff',
  ball: '#ffffff',
  centerLine: '#444466',
  text: '#ffffff',
  score: '#ffffff'
};

// Game states
export const GAME_STATE = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

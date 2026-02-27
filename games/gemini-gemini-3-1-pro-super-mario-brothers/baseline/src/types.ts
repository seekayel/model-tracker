export type Vector = {
  x: number;
  y: number;
};

export type PlayerState = {
  position: Vector;
  velocity: Vector;
  isJumping: boolean;
  isDead: boolean;
};

export type EnemyState = {
  id: number;
  position: Vector;
  velocity: Vector;
  isDead: boolean;
};

export type GameState = {
  player: PlayerState;
  enemies: EnemyState[];
  score: number;
  gameOver: boolean;
  level: number[][];
  cameraOffset: number;
  gameStarted: boolean;
};

export type KeyboardState = {
  [key: string]: boolean;
};

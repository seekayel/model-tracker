export interface Vec2 {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface Player extends Entity {
  speed: number;
  lives: number;
  invincible: boolean;
  invincibleTimer: number;
  shootCooldown: number;
}

export interface Bullet extends Entity {
  vx: number;
  vy: number;
  fromPlayer: boolean;
}

export type EnemyType = 'bee' | 'butterfly' | 'boss';

export interface Enemy extends Entity {
  type: EnemyType;
  row: number;
  col: number;
  formationX: number;
  formationY: number;
  state: 'entering' | 'formation' | 'diving' | 'dead';
  entryPath: Vec2[];
  entryProgress: number;
  entrySpeed: number;
  diveAngle: number;
  diveSpeed: number;
  diveTarget: Vec2;
  divePhase: 'swooping' | 'returning';
  divePathPoints: Vec2[];
  divePathProgress: number;
  shootTimer: number;
  health: number;
  captured?: boolean;
  captureBeamActive?: boolean;
  captureBeamTimer?: number;
}

export type GameState = 'title' | 'playing' | 'paused' | 'wave_clear' | 'game_over';

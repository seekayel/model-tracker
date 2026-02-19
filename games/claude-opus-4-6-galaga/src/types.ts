// ── Shared types ──

export const GAME_W = 480;
export const GAME_H = 640;

export const enum GameState {
  Title,
  Playing,
  StageIntro,
  GameOver,
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

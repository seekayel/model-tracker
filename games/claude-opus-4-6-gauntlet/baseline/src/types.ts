// ── Tile types ──────────────────────────────────────────────
export enum Tile {
  Floor,
  Wall,
  WallDestructible,
  Exit,
  Door,
}

// ── Entity types ────────────────────────────────────────────
export enum EntityKind {
  Player,
  Ghost,
  Demon,
  Sorcerer,
  Death,
  Spawner,
  Food,
  Treasure,
  Key,
  Potion,
  Projectile,
}

export enum HeroClass {
  Warrior = 'Warrior',
  Valkyrie = 'Valkyrie',
  Wizard = 'Wizard',
  Elf = 'Elf',
}

export interface HeroStats {
  maxHealth: number;
  speed: number;
  meleeDamage: number;
  projectileSpeed: number;
  projectileDamage: number;
  armor: number;
  magic: number;
  color: string;
  shotColor: string;
}

export const HERO_STATS: Record<HeroClass, HeroStats> = {
  [HeroClass.Warrior]: {
    maxHealth: 800,
    speed: 2.0,
    meleeDamage: 3,
    projectileSpeed: 0,
    projectileDamage: 0,
    armor: 4,
    magic: 1,
    color: '#e03030',
    shotColor: '#ff8888',
  },
  [HeroClass.Valkyrie]: {
    maxHealth: 700,
    speed: 2.2,
    meleeDamage: 2,
    projectileSpeed: 0,
    projectileDamage: 0,
    armor: 3,
    magic: 1,
    color: '#30a0e0',
    shotColor: '#88ccff',
  },
  [HeroClass.Wizard]: {
    maxHealth: 500,
    speed: 2.4,
    meleeDamage: 1,
    projectileSpeed: 5,
    projectileDamage: 3,
    armor: 1,
    magic: 4,
    color: '#b040e0',
    shotColor: '#dd88ff',
  },
  [HeroClass.Elf]: {
    maxHealth: 600,
    speed: 2.8,
    meleeDamage: 1,
    projectileSpeed: 6,
    projectileDamage: 2,
    armor: 2,
    magic: 2,
    color: '#40c040',
    shotColor: '#88ff88',
  },
};

// ── Direction helpers ───────────────────────────────────────
export type Dir = { dx: number; dy: number };

export const DIR_NONE: Dir = { dx: 0, dy: 0 };

export const DIRS = {
  up:    { dx: 0, dy: -1 },
  down:  { dx: 0, dy: 1 },
  left:  { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
} as const;

// ── Game state phases ───────────────────────────────────────
export enum Phase {
  Title,
  ClassSelect,
  Playing,
  GameOver,
  LevelComplete,
}

// ── Constants ───────────────────────────────────────────────
export const TILE_SIZE = 24;
export const VIEW_TILES_X = 25;
export const VIEW_TILES_Y = 21;
export const CANVAS_W = VIEW_TILES_X * TILE_SIZE;
export const CANVAS_H = VIEW_TILES_Y * TILE_SIZE + 48; // extra for HUD bar
export const HUD_HEIGHT = 48;

export const HEALTH_DRAIN_INTERVAL = 1000; // ms between 1-point health drain
export const SPAWN_INTERVAL = 4000; // ms between spawner emissions
export const ENEMY_MOVE_INTERVAL = 400; // ms between enemy steps

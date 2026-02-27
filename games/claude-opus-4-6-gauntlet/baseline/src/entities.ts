import { EntityKind, Dir, DIR_NONE } from './types';

export interface Entity {
  kind: EntityKind;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  dir: Dir;
  moveTimer: number;
  attackTimer: number;
  alive: boolean;
  // Spawner-specific
  spawnKind?: EntityKind;
  spawnTimer?: number;
  // Projectile-specific
  owner?: 'player' | 'enemy';
  vx?: number;
  vy?: number;
  damage?: number;
  lifetime?: number;
}

export function createEnemy(kind: EntityKind, x: number, y: number): Entity {
  const base: Entity = {
    kind,
    x,
    y,
    health: 3,
    maxHealth: 3,
    dir: DIR_NONE,
    moveTimer: 0,
    attackTimer: 0,
    alive: true,
  };

  switch (kind) {
    case EntityKind.Ghost:
      base.health = 3;
      base.maxHealth = 3;
      break;
    case EntityKind.Demon:
      base.health = 5;
      base.maxHealth = 5;
      break;
    case EntityKind.Sorcerer:
      base.health = 4;
      base.maxHealth = 4;
      break;
    case EntityKind.Death:
      base.health = 100;
      base.maxHealth = 100;
      break;
  }

  return base;
}

export function createSpawner(x: number, y: number, spawnKind?: EntityKind): Entity {
  const kinds = [EntityKind.Ghost, EntityKind.Demon, EntityKind.Sorcerer];
  return {
    kind: EntityKind.Spawner,
    x,
    y,
    health: 10,
    maxHealth: 10,
    dir: DIR_NONE,
    moveTimer: 0,
    attackTimer: 0,
    alive: true,
    spawnKind: spawnKind ?? kinds[Math.floor(Math.random() * kinds.length)],
    spawnTimer: 0,
  };
}

export function createItem(kind: EntityKind, x: number, y: number): Entity {
  return {
    kind,
    x,
    y,
    health: 1,
    maxHealth: 1,
    dir: DIR_NONE,
    moveTimer: 0,
    attackTimer: 0,
    alive: true,
  };
}

export function createProjectile(
  x: number,
  y: number,
  vx: number,
  vy: number,
  damage: number,
  owner: 'player' | 'enemy',
  color?: string,
): Entity {
  void color; // color handled by renderer based on owner
  return {
    kind: EntityKind.Projectile,
    x,
    y,
    health: 1,
    maxHealth: 1,
    dir: DIR_NONE,
    moveTimer: 0,
    attackTimer: 0,
    alive: true,
    owner,
    vx,
    vy,
    damage,
    lifetime: 2000,
  };
}

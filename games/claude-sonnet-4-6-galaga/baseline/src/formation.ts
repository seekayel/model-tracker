import type { Enemy, EnemyType, Vec2 } from './types';

const ENEMY_W = 28;
const ENEMY_H = 24;

// Formation layout: rows from top
// Row 0: 2 bosses
// Row 1-2: 4 butterflies each
// Row 3-4: 8 bees each
const FORMATION_COLS = [2, 4, 4, 8, 8];
const FORMATION_TYPES: EnemyType[] = ['boss', 'butterfly', 'butterfly', 'bee', 'bee'];

export function buildFormation(canvasW: number): Enemy[] {
  const enemies: Enemy[] = [];
  const startY = 60;
  const rowSpacing = 36;

  for (let row = 0; row < FORMATION_COLS.length; row++) {
    const cols = FORMATION_COLS[row];
    const type = FORMATION_TYPES[row];
    const totalWidth = cols * 40;
    const startX = (canvasW - totalWidth) / 2 + 20;

    for (let col = 0; col < cols; col++) {
      const fx = startX + col * 40;
      const fy = startY + row * rowSpacing;

      // Generate swooping entry path
      const entryPath = generateEntryPath(fx, fy, canvasW, row, col, cols);

      const enemy: Enemy = {
        x: entryPath[0].x,
        y: entryPath[0].y,
        width: ENEMY_W,
        height: ENEMY_H,
        active: true,
        type,
        row,
        col,
        formationX: fx,
        formationY: fy,
        state: 'entering',
        entryPath,
        entryProgress: 0,
        entrySpeed: 1.5 + Math.random() * 0.5,
        diveAngle: 0,
        diveSpeed: 3,
        diveTarget: { x: 0, y: 0 },
        divePhase: 'swooping',
        divePathPoints: [],
        divePathProgress: 0,
        shootTimer: Math.random() * 120 + 60,
        health: type === 'boss' ? 2 : 1,
      };

      enemies.push(enemy);
    }
  }

  return enemies;
}

function generateEntryPath(fx: number, fy: number, canvasW: number, row: number, col: number, cols: number): Vec2[] {
  const path: Vec2[] = [];
  const fromLeft = col < cols / 2;
  const delay = (row * cols + col) * 8;

  // Start off-screen
  const startX = fromLeft ? -40 : canvasW + 40;
  const startY = -40 - delay * 2;

  path.push({ x: startX, y: startY });

  // Curve through the top and loop into formation position
  if (fromLeft) {
    path.push({ x: canvasW * 0.3, y: 40 });
    path.push({ x: canvasW * 0.6, y: 80 });
    path.push({ x: canvasW * 0.5, y: 120 });
    path.push({ x: canvasW * 0.3, y: 100 });
    path.push({ x: fx, y: fy });
  } else {
    path.push({ x: canvasW * 0.7, y: 40 });
    path.push({ x: canvasW * 0.4, y: 80 });
    path.push({ x: canvasW * 0.5, y: 120 });
    path.push({ x: canvasW * 0.7, y: 100 });
    path.push({ x: fx, y: fy });
  }

  return path;
}

export function generateDivePath(enemy: Enemy, playerX: number, canvasW: number, canvasH: number): Vec2[] {
  const path: Vec2[] = [];
  const ex = enemy.x + enemy.width / 2;
  const ey = enemy.y + enemy.height / 2;

  path.push({ x: ex, y: ey });

  // Curve down toward player then swoop back up
  path.push({ x: ex + (Math.random() - 0.5) * 100, y: ey + 80 });
  path.push({ x: playerX + (Math.random() - 0.5) * 60, y: canvasH * 0.6 });
  path.push({ x: playerX + (Math.random() - 0.5) * 80, y: canvasH * 0.8 });

  // Return up off screen
  const returnSide = Math.random() > 0.5;
  path.push({ x: returnSide ? -50 : canvasW + 50, y: canvasH + 60 });

  return path;
}

export function catmullRomPoint(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    ),
    y: 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    ),
  };
}

export function getPathPoint(path: Vec2[], progress: number): Vec2 {
  if (path.length === 0) return { x: 0, y: 0 };
  if (path.length === 1) return { ...path[0] };
  if (progress >= 1) return { ...path[path.length - 1] };
  if (progress <= 0) return { ...path[0] };

  const totalSegments = path.length - 1;
  const scaledT = progress * totalSegments;
  const segment = Math.floor(scaledT);
  const t = scaledT - segment;

  const i0 = Math.max(0, segment - 1);
  const i1 = segment;
  const i2 = Math.min(path.length - 1, segment + 1);
  const i3 = Math.min(path.length - 1, segment + 2);

  return catmullRomPoint(path[i0], path[i1], path[i2], path[i3], t);
}

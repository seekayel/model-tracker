// ── Enemy formation & stage management ──

import { GAME_W } from "./types";
import { Enemy, EnemyType, createEnemy, generateEntryPath } from "./entities";

// Formation grid layout (Galaga style):
//  Row 0: 4 bosses
//  Row 1: 8 butterflies
//  Row 2: 8 butterflies
//  Row 3: 10 bees
//  Row 4: 10 bees

interface FormationSlot {
  type: EnemyType;
  col: number;
  row: number;
}

function getFormationSlots(): FormationSlot[] {
  const slots: FormationSlot[] = [];

  // Row 0: 4 bosses (centered)
  for (let c = 0; c < 4; c++) {
    slots.push({ type: EnemyType.Boss, col: c + 3, row: 0 });
  }
  // Row 1-2: 8 butterflies each
  for (let r = 1; r <= 2; r++) {
    for (let c = 0; c < 8; c++) {
      slots.push({ type: EnemyType.Butterfly, col: c + 1, row: r });
    }
  }
  // Row 3-4: 10 bees each
  for (let r = 3; r <= 4; r++) {
    for (let c = 0; c < 10; c++) {
      slots.push({ type: EnemyType.Bee, col: c, row: r });
    }
  }

  return slots;
}

const COL_SPACING = 42;
const ROW_SPACING = 40;
const GRID_OFFSET_X = (GAME_W - 9 * COL_SPACING) / 2;
const GRID_OFFSET_Y = 60;

function formationPos(col: number, row: number): { x: number; y: number } {
  return {
    x: GRID_OFFSET_X + col * COL_SPACING,
    y: GRID_OFFSET_Y + row * ROW_SPACING,
  };
}

export interface StageData {
  enemies: Enemy[];
  entryWaves: EntryWave[];
}

interface EntryWave {
  enemies: Enemy[];
  delay: number; // seconds before this wave starts entering
}

export function buildStage(stageNum: number): StageData {
  const slots = getFormationSlots();
  const enemies: Enemy[] = [];
  const entryWaves: EntryWave[] = [];

  // Group enemies into waves for staggered entry
  const waveSize = 4 + Math.min(stageNum, 4);
  let waveIndex = 0;
  let waveEnemies: Enemy[] = [];

  // Shuffle to vary entry order
  const shuffled = [...slots];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (const slot of shuffled) {
    const pos = formationPos(slot.col, slot.row);
    const sides: Array<"left" | "right" | "top"> = ["left", "right", "top"];
    const side = sides[waveIndex % 3];
    const path = generateEntryPath(pos.x, pos.y, side);
    const enemy = createEnemy(slot.type, pos.x, pos.y, path);

    // Scale difficulty with stage
    enemy.diveSpeed = 0.8 + stageNum * 0.1;
    enemy.shootTimer = Math.max(1, 4 - stageNum * 0.3) + Math.random() * 3;

    enemies.push(enemy);
    waveEnemies.push(enemy);

    if (waveEnemies.length >= waveSize) {
      entryWaves.push({ enemies: [...waveEnemies], delay: waveIndex * 1.2 });
      waveEnemies = [];
      waveIndex++;
    }
  }

  if (waveEnemies.length > 0) {
    entryWaves.push({ enemies: waveEnemies, delay: waveIndex * 1.2 });
  }

  return { enemies, entryWaves };
}

// Formation sway
export function getFormationOffsetX(time: number): number {
  return Math.sin(time * 0.8) * 30;
}

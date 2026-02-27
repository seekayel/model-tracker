import {
  Tile, EntityKind, HeroClass, TILE_SIZE, CANVAS_W, CANVAS_H,
  HUD_HEIGHT, VIEW_TILES_X, VIEW_TILES_Y, HERO_STATS, Phase,
} from './types';
import { Entity } from './entities';

let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;

export function initRenderer(c: HTMLCanvasElement) {
  canvas = c;
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  ctx = canvas.getContext('2d')!;
}

// ── Camera ──────────────────────────────────────────────────
let camX = 0;
let camY = 0;

export function updateCamera(px: number, py: number, mapW: number, mapH: number) {
  const halfW = Math.floor(VIEW_TILES_X / 2);
  const halfH = Math.floor(VIEW_TILES_Y / 2);
  camX = Math.max(0, Math.min(px - halfW, mapW - VIEW_TILES_X));
  camY = Math.max(0, Math.min(py - halfH, mapH - VIEW_TILES_Y));
}

function toScreen(tx: number, ty: number): [number, number] {
  return [(tx - camX) * TILE_SIZE, (ty - camY) * TILE_SIZE + HUD_HEIGHT];
}

// ── Tile colors ─────────────────────────────────────────────
const WALL_COLOR = '#555566';
const WALL_DESTR_COLOR = '#887755';
const FLOOR_COLOR = '#1a1a2e';
const FLOOR_ALT = '#1c1c32';
const EXIT_COLOR = '#ffdd44';
const DOOR_COLOR = '#aa7733';

function drawTile(tile: Tile, sx: number, sy: number) {
  switch (tile) {
    case Tile.Wall:
      ctx.fillStyle = WALL_COLOR;
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      // brick lines
      ctx.strokeStyle = '#444455';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE / 2 - 1);
      ctx.strokeRect(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2, TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1);
      ctx.strokeRect(sx + 1, sy + TILE_SIZE / 2, TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1);
      break;
    case Tile.WallDestructible:
      ctx.fillStyle = WALL_DESTR_COLOR;
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#776644';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      break;
    case Tile.Floor:
      ctx.fillStyle = ((Math.floor(sx / TILE_SIZE) + Math.floor(sy / TILE_SIZE)) % 2 === 0)
        ? FLOOR_COLOR : FLOOR_ALT;
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      break;
    case Tile.Exit:
      ctx.fillStyle = FLOOR_COLOR;
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      // pulsing exit marker
      const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = EXIT_COLOR;
      ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('E', sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 4);
      ctx.globalAlpha = 1;
      break;
    case Tile.Door:
      ctx.fillStyle = DOOR_COLOR;
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#664422';
      ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      ctx.fillStyle = '#ffcc44';
      ctx.beginPath();
      ctx.arc(sx + TILE_SIZE / 2 + 3, sy + TILE_SIZE / 2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

// ── Entity rendering ────────────────────────────────────────
function drawEntity(e: Entity, heroClass?: HeroClass) {
  const [sx, sy] = toScreen(e.x, e.y);
  // Skip if off screen
  if (sx < -TILE_SIZE || sx > CANVAS_W || sy < HUD_HEIGHT - TILE_SIZE || sy > CANVAS_H) return;

  const cx = sx + TILE_SIZE / 2;
  const cy = sy + TILE_SIZE / 2;
  const r = TILE_SIZE / 2 - 2;

  switch (e.kind) {
    case EntityKind.Player: {
      const stats = HERO_STATS[heroClass ?? HeroClass.Warrior];
      // Body
      ctx.fillStyle = stats.color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Outline
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Class initial
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((heroClass ?? 'W')[0], cx, cy + 1);
      break;
    }
    case EntityKind.Ghost:
      ctx.fillStyle = '#aaccff';
      // Ghost body with wavy bottom
      ctx.beginPath();
      ctx.arc(cx, cy - 2, r, Math.PI, 0);
      ctx.lineTo(sx + TILE_SIZE - 2, sy + TILE_SIZE - 3);
      for (let i = 3; i >= 0; i--) {
        const wx = sx + 2 + i * (TILE_SIZE - 4) / 3;
        const wy = sy + TILE_SIZE - 3 + (i % 2 === 0 ? -3 : 0);
        ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#223';
      ctx.fillRect(cx - 4, cy - 3, 3, 3);
      ctx.fillRect(cx + 2, cy - 3, 3, 3);
      break;

    case EntityKind.Demon:
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Horns
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 6);
      ctx.lineTo(cx - 7, cy - 12);
      ctx.moveTo(cx + 5, cy - 6);
      ctx.lineTo(cx + 7, cy - 12);
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(cx - 4, cy - 2, 3, 3);
      ctx.fillRect(cx + 2, cy - 2, 3, 3);
      break;

    case EntityKind.Sorcerer:
      ctx.fillStyle = '#8844cc';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Hat
      ctx.fillStyle = '#6622aa';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r - 6);
      ctx.lineTo(cx - 6, cy - 3);
      ctx.lineTo(cx + 6, cy - 3);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = '#ff88ff';
      ctx.beginPath();
      ctx.arc(cx, cy + 1, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case EntityKind.Death:
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Skull face
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy - 1, r - 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillRect(cx - 4, cy - 3, 3, 4);
      ctx.fillRect(cx + 1, cy - 3, 3, 4);
      ctx.fillRect(cx - 2, cy + 2, 4, 2);
      break;

    case EntityKind.Spawner: {
      // Pulsing spawner
      const sp = Math.sin(Date.now() / 300) * 0.2 + 0.8;
      ctx.fillStyle = '#44aa44';
      ctx.globalAlpha = sp;
      ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      ctx.strokeStyle = '#66ff66';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      // Inner pattern
      ctx.fillStyle = '#226622';
      ctx.fillRect(sx + 6, sy + 6, TILE_SIZE - 12, TILE_SIZE - 12);
      ctx.globalAlpha = 1;
      break;
    }
    case EntityKind.Food:
      ctx.fillStyle = '#44cc44';
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 5, 0, Math.PI * 2);
      ctx.fill();
      // Leaf
      ctx.fillStyle = '#22aa22';
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy - 3, 3, 2, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case EntityKind.Treasure:
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(sx + 5, sy + 8, TILE_SIZE - 10, TILE_SIZE - 13);
      ctx.fillStyle = '#ddaa00';
      ctx.fillRect(sx + 5, sy + 8, TILE_SIZE - 10, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, sy + 9, 3, 6);
      break;

    case EntityKind.Key:
      ctx.fillStyle = '#ffdd66';
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 1, cy + 2, 3, 7);
      ctx.fillRect(cx, cy + 6, 4, 2);
      ctx.fillRect(cx, cy + 3, 4, 2);
      break;

    case EntityKind.Potion:
      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.arc(cx, cy + 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6699ff';
      ctx.fillRect(cx - 2, cy - 5, 5, 6);
      ctx.fillStyle = '#aaccff';
      ctx.fillRect(cx - 3, cy - 6, 7, 2);
      break;

    case EntityKind.Projectile:
      ctx.fillStyle = e.owner === 'player' ? '#ffff88' : '#ff4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.owner === 'player' ? '#ffffff' : '#ff8888';
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

// ── HUD ─────────────────────────────────────────────────────
function drawHUD(
  health: number,
  maxHealth: number,
  score: number,
  keys: number,
  level: number,
  heroClass: HeroClass,
  potions: number,
) {
  // Background
  ctx.fillStyle = '#111122';
  ctx.fillRect(0, 0, CANVAS_W, HUD_HEIGHT);
  ctx.strokeStyle = '#333355';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_HEIGHT);
  ctx.lineTo(CANVAS_W, HUD_HEIGHT);
  ctx.stroke();

  const stats = HERO_STATS[heroClass];

  // Health bar
  ctx.fillStyle = '#333';
  ctx.fillRect(8, 8, 150, 14);
  const hpRatio = Math.max(0, health / maxHealth);
  const hpColor = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.25 ? '#cccc44' : '#cc4444';
  ctx.fillStyle = hpColor;
  ctx.fillRect(8, 8, 150 * hpRatio, 14);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, 150, 14);

  ctx.fillStyle = '#fff';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`HP: ${health}/${maxHealth}`, 12, 10);

  // Class name
  ctx.fillStyle = stats.color;
  ctx.font = 'bold 12px monospace';
  ctx.fillText(heroClass, 8, 28);

  // Score
  ctx.fillStyle = '#ffcc00';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, 8);

  // Level
  ctx.fillStyle = '#aaaacc';
  ctx.fillText(`LEVEL ${level}`, CANVAS_W / 2, 24);

  // Keys
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffdd66';
  ctx.fillText(`KEYS: ${keys}`, CANVAS_W - 10, 8);

  // Potions
  ctx.fillStyle = '#4488ff';
  ctx.fillText(`POTIONS: ${potions}`, CANVAS_W - 10, 24);
}

// ── Main render ─────────────────────────────────────────────
export function render(
  tiles: Tile[][],
  entities: Entity[],
  player: Entity,
  heroClass: HeroClass,
  health: number,
  maxHealth: number,
  score: number,
  keys: number,
  level: number,
  phase: Phase,
  potions: number,
) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (phase === Phase.Title) {
    drawTitle();
    return;
  }
  if (phase === Phase.ClassSelect) {
    drawClassSelect();
    return;
  }

  // Draw tiles
  const startX = Math.max(0, Math.floor(camX));
  const startY = Math.max(0, Math.floor(camY));
  const endX = Math.min(tiles[0].length, startX + VIEW_TILES_X + 1);
  const endY = Math.min(tiles.length, startY + VIEW_TILES_Y + 1);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const [sx, sy] = toScreen(x, y);
      drawTile(tiles[y][x], sx, sy);
    }
  }

  // Draw entities (items first, then enemies, then player on top)
  const items = entities.filter(e => e.alive && [EntityKind.Food, EntityKind.Treasure, EntityKind.Key, EntityKind.Potion].includes(e.kind));
  const others = entities.filter(e => e.alive && ![EntityKind.Food, EntityKind.Treasure, EntityKind.Key, EntityKind.Potion, EntityKind.Player].includes(e.kind));

  for (const e of items) drawEntity(e);
  for (const e of others) drawEntity(e);
  if (player.alive) drawEntity(player, heroClass);

  // HUD
  drawHUD(health, maxHealth, score, keys, level, heroClass, potions);

  // Overlays
  if (phase === Phase.GameOver) drawGameOver(score, level);
  if (phase === Phase.LevelComplete) drawLevelComplete(level);
}

// ── Overlay screens ─────────────────────────────────────────
function drawTitle() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Title
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAUNTLET', CANVAS_W / 2, 100);

  // Subtitle
  ctx.fillStyle = '#aaaacc';
  ctx.font = '14px monospace';
  ctx.fillText('Dungeon of Doom', CANVAS_W / 2, 140);

  // Instructions
  ctx.fillStyle = '#888899';
  ctx.font = '12px monospace';
  const lines = [
    'Navigate deadly dungeons',
    'Defeat monsters and find the exit',
    'Collect food to restore health',
    'Find keys to open doors',
    'Destroy spawners to stop enemies',
    '',
    'WASD / Arrow Keys - Move',
    'Space / Z - Attack',
    'X - Use Potion',
    '',
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_W / 2, 200 + i * 20);
  });

  // Prompt
  const blink = Math.sin(Date.now() / 400) > 0;
  if (blink) {
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('Press ENTER to start', CANVAS_W / 2, CANVAS_H - 60);
  }
}

let classSelectIndex = 0;
export function getClassSelectIndex() { return classSelectIndex; }
export function setClassSelectIndex(i: number) { classSelectIndex = i; }

function drawClassSelect() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Choose Your Hero', CANVAS_W / 2, 60);

  const classes = Object.values(HeroClass);
  const descriptions: Record<HeroClass, string[]> = {
    [HeroClass.Warrior]: ['High armor & melee damage', 'No ranged attack', 'HP: 800'],
    [HeroClass.Valkyrie]: ['Balanced fighter', 'No ranged attack', 'HP: 700'],
    [HeroClass.Wizard]: ['Powerful magic shots', 'Low armor', 'HP: 500'],
    [HeroClass.Elf]: ['Fast & agile', 'Good ranged attack', 'HP: 600'],
  };

  classes.forEach((cls, i) => {
    const y = 120 + i * 85;
    const selected = i === classSelectIndex;
    const stats = HERO_STATS[cls];

    // Selection box
    if (selected) {
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.strokeRect(CANVAS_W / 2 - 130, y - 10, 260, 75);
    }

    // Class name
    ctx.fillStyle = selected ? stats.color : '#666';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(cls, CANVAS_W / 2, y + 10);

    // Description
    ctx.fillStyle = selected ? '#aaa' : '#555';
    ctx.font = '11px monospace';
    descriptions[cls].forEach((line, j) => {
      ctx.fillText(line, CANVAS_W / 2, y + 28 + j * 14);
    });
  });

  const blink = Math.sin(Date.now() / 400) > 0;
  if (blink) {
    ctx.fillStyle = '#ffcc00';
    ctx.font = '12px monospace';
    ctx.fillText('UP/DOWN to select, ENTER to confirm', CANVAS_W / 2, CANVAS_H - 40);
  }
}

function drawGameOver(score: number, level: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 40);

  ctx.fillStyle = '#ffcc00';
  ctx.font = '16px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);
  ctx.fillText(`Reached Level: ${level}`, CANVAS_W / 2, CANVAS_H / 2 + 35);

  const blink = Math.sin(Date.now() / 400) > 0;
  if (blink) {
    ctx.fillStyle = '#aaaacc';
    ctx.font = '14px monospace';
    ctx.fillText('Press ENTER to restart', CANVAS_W / 2, CANVAS_H / 2 + 80);
  }
}

function drawLevelComplete(level: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Level ${level} Complete!`, CANVAS_W / 2, CANVAS_H / 2 - 20);

  const blink = Math.sin(Date.now() / 400) > 0;
  if (blink) {
    ctx.fillStyle = '#aaaacc';
    ctx.font = '14px monospace';
    ctx.fillText('Press ENTER for next level', CANVAS_W / 2, CANVAS_H / 2 + 30);
  }
}

import {
  GameState, UnitType, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, UNIT_DEFS,
} from './types';
import { createGame, moveUnit, foundCity, endTurn, getUnitsAt, getCityAt, setProduction } from './game';
import { Renderer } from './renderer';
import { updateHUD } from './hud';
import { runAI } from './ai';

let state: GameState;
let renderer: Renderer;
let animFrameId: number;

const CAMERA_SPEED = 0.3;
const CAMERA_EDGE_MARGIN = 60;

// ── Screen management ──
function showScreen(id: string): void {
  document.getElementById('start-screen')!.style.display = 'none';
  document.getElementById('game-screen')!.style.display = 'none';
  document.getElementById('victory-screen')!.style.display = 'none';
  document.getElementById(id)!.style.display = id === 'game-screen' ? 'flex' : 'flex';
}

function startGame(): void {
  state = createGame();
  renderer = new Renderer();
  showScreen('game-screen');

  // Auto-select first unit with moves
  selectNextUnit();

  gameLoop();
}

function gameLoop(): void {
  if (state.gameOver) {
    showVictory();
    return;
  }

  // Process AI turns
  while (state.currentPlayer !== 0 && !state.gameOver) {
    runAI(state);
  }

  if (state.gameOver) {
    showVictory();
    return;
  }

  renderer.render(state);
  updateHUD(state);
  animFrameId = requestAnimationFrame(gameLoop);
}

function showVictory(): void {
  cancelAnimationFrame(animFrameId);
  const winner = state.players[state.winner!];
  const title = document.getElementById('victory-title')!;
  const message = document.getElementById('victory-message')!;
  const score = document.getElementById('victory-score')!;

  if (state.winner === 0) {
    title.textContent = 'Victory!';
    title.style.color = '#4CAF50';
    message.textContent = 'You have built a civilization that will stand the test of time!';
  } else {
    title.textContent = 'Defeat';
    title.style.color = '#f44336';
    message.textContent = `${winner.name} has won the game.`;
  }

  // Show all scores
  const scores = state.players
    .filter(p => p.alive || p.id === state.winner)
    .sort((a, b) => b.score - a.score)
    .map(p => `${p.name}: ${p.score}`)
    .join(' | ');
  score.textContent = `Final Scores — ${scores} | Turn: ${state.turn}`;

  showScreen('victory-screen');
}

function selectNextUnit(): void {
  const units = state.units.filter(u =>
    u.owner === 0 && u.movesLeft > 0 && !u.skipTurn && !u.fortified
  );
  if (units.length > 0) {
    state.selectedUnitId = units[0].id;
    state.selectedCityId = null;
    state.cameraX = units[0].x;
    state.cameraY = units[0].y;
  }
}

function handleEndTurn(): void {
  if (state.currentPlayer !== 0) return;
  endTurn(state);
}

// ── Input handling ──
const keysDown = new Set<string>();

function handleKeyDown(e: KeyboardEvent): void {
  keysDown.add(e.key.toLowerCase());

  if (state.currentPlayer !== 0) return;

  const key = e.key.toLowerCase();

  // Movement
  if (['w', 'arrowup', 'a', 'arrowleft', 's', 'arrowdown', 'd', 'arrowright'].includes(key)) {
    e.preventDefault();
    if (state.selectedUnitId !== null) {
      const unit = state.units.find(u => u.id === state.selectedUnitId);
      if (unit && unit.owner === 0 && unit.movesLeft > 0) {
        let dx = 0, dy = 0;
        if (key === 'a' || key === 'arrowleft') dx = -1;
        if (key === 'd' || key === 'arrowright') dx = 1;
        if (key === 'w' || key === 'arrowup') dy = -1;
        if (key === 's' || key === 'arrowdown') dy = 1;
        moveUnit(state, unit, dx, dy);
        state.cameraX = unit.x;
        state.cameraY = unit.y;
      }
    } else {
      // Scroll camera
      let dx = 0, dy = 0;
      if (key === 'a' || key === 'arrowleft') dx = -2;
      if (key === 'd' || key === 'arrowright') dx = 2;
      if (key === 'w' || key === 'arrowup') dy = -2;
      if (key === 's' || key === 'arrowdown') dy = 2;
      state.cameraX = Math.max(0, Math.min(MAP_WIDTH, state.cameraX + dx));
      state.cameraY = Math.max(0, Math.min(MAP_HEIGHT, state.cameraY + dy));
    }
  }

  // Build city
  if (key === 'b') {
    if (state.selectedUnitId !== null) {
      const unit = state.units.find(u => u.id === state.selectedUnitId);
      if (unit && unit.type === UnitType.Settler && unit.owner === 0) {
        const city = foundCity(state, unit);
        if (city) {
          state.selectedCityId = city.id;
          state.selectedUnitId = null;
        }
      }
    }
  }

  // Fortify
  if (key === 'f') {
    if (state.selectedUnitId !== null) {
      const unit = state.units.find(u => u.id === state.selectedUnitId);
      if (unit && unit.owner === 0) {
        unit.fortified = true;
        unit.movesLeft = 0;
        selectNextUnit();
      }
    }
  }

  // Skip unit turn
  if (key === ' ') {
    e.preventDefault();
    if (state.selectedUnitId !== null) {
      const unit = state.units.find(u => u.id === state.selectedUnitId);
      if (unit && unit.owner === 0) {
        unit.skipTurn = true;
        unit.movesLeft = 0;
        selectNextUnit();
      }
    }
  }

  // End turn
  if (key === 'enter') {
    e.preventDefault();
    handleEndTurn();
  }

  // Escape - deselect
  if (key === 'escape') {
    state.selectedUnitId = null;
    state.selectedCityId = null;
  }

  // Tab - cycle to next unit
  if (key === 'tab') {
    e.preventDefault();
    selectNextUnit();
  }

  // Production hotkeys (when city selected)
  if (state.selectedCityId !== null) {
    const city = state.cities.find(c => c.id === state.selectedCityId);
    if (city && city.owner === 0) {
      const prodMap: Record<string, UnitType> = {
        '1': UnitType.Warrior,
        '2': UnitType.Archer,
        '3': UnitType.Settler,
        '4': UnitType.Scout,
        '5': UnitType.Horseman,
        '6': UnitType.Swordsman,
        '7': UnitType.Catapult,
      };
      if (prodMap[key]) {
        setProduction(city, prodMap[key]);
      }
    }
  }
}

function handleKeyUp(e: KeyboardEvent): void {
  keysDown.delete(e.key.toLowerCase());
}

function handleCanvasClick(e: MouseEvent): void {
  if (state.currentPlayer !== 0) return;

  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  const tilePos = renderer.screenToTile(state, sx, sy);
  if (!tilePos) return;

  const { x, y } = tilePos;

  // Check if clicking on own unit
  const myUnits = getUnitsAt(state, x, y, 0);
  if (myUnits.length > 0) {
    // If already selected this unit, cycle to next
    const currentIdx = myUnits.findIndex(u => u.id === state.selectedUnitId);
    const nextIdx = (currentIdx + 1) % myUnits.length;
    state.selectedUnitId = myUnits[nextIdx].id;
    state.selectedCityId = null;
    return;
  }

  // Check if clicking on own city
  const city = getCityAt(state, x, y);
  if (city && city.owner === 0) {
    state.selectedCityId = city.id;
    state.selectedUnitId = null;
    return;
  }

  // If unit selected and click elsewhere - try to move there
  if (state.selectedUnitId !== null) {
    const unit = state.units.find(u => u.id === state.selectedUnitId);
    if (unit && unit.owner === 0 && unit.movesLeft > 0) {
      const dx = Math.sign(x - unit.x);
      const dy = Math.sign(y - unit.y);
      if (dx !== 0 || dy !== 0) {
        moveUnit(state, unit, dx, dy);
        state.cameraX = unit.x;
        state.cameraY = unit.y;
      }
    }
  }

  // Clicking empty tile deselects
  if (myUnits.length === 0 && (!city || city.owner !== 0)) {
    state.selectedUnitId = null;
    state.selectedCityId = null;
  }
}

function handleMinimapClick(e: MouseEvent): void {
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const pos = renderer.minimapToTile(sx, sy);
  if (pos) {
    state.cameraX = pos.x;
    state.cameraY = pos.y;
  }
}

// ── HUD action button handler ──
function handleHUDClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (!target.matches('.action-btn')) return;

  const action = target.dataset.action;
  const produce = target.dataset.produce;

  if (action === 'build') {
    const unit = state.units.find(u => u.id === state.selectedUnitId);
    if (unit && unit.type === UnitType.Settler && unit.owner === 0) {
      const city = foundCity(state, unit);
      if (city) {
        state.selectedCityId = city.id;
        state.selectedUnitId = null;
      }
    }
  }

  if (action === 'fortify') {
    const unit = state.units.find(u => u.id === state.selectedUnitId);
    if (unit && unit.owner === 0) {
      unit.fortified = true;
      unit.movesLeft = 0;
      selectNextUnit();
    }
  }

  if (action === 'skip') {
    const unit = state.units.find(u => u.id === state.selectedUnitId);
    if (unit && unit.owner === 0) {
      unit.skipTurn = true;
      unit.movesLeft = 0;
      selectNextUnit();
    }
  }

  if (produce) {
    const city = state.cities.find(c => c.id === state.selectedCityId);
    if (city && city.owner === 0) {
      setProduction(city, produce as UnitType);
    }
  }
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start')!.addEventListener('click', startGame);
  document.getElementById('btn-restart')!.addEventListener('click', startGame);
  document.getElementById('btn-end-turn')!.addEventListener('click', handleEndTurn);

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  document.getElementById('game-canvas')!.addEventListener('click', handleCanvasClick);
  document.getElementById('minimap-canvas')!.addEventListener('click', handleMinimapClick);

  document.getElementById('hud-bottom')!.addEventListener('click', handleHUDClick);

  showScreen('start-screen');
});

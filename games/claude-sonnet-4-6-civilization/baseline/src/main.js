import { Game, Phase } from './game.js';
import { Renderer }    from './renderer.js';
import { InputHandler } from './input.js';
import { UNIT_DATA, BUILDING_DATA, TECH_DATA } from './constants.js';

// ── DOM refs ────────────────────────────────────────────────────────────────
const canvas         = document.getElementById('game-canvas');
const overlayStart   = document.getElementById('overlay-start');
const overlayGameover= document.getElementById('overlay-gameover');
const btnStart       = document.getElementById('btn-start');
const btnRestart     = document.getElementById('btn-restart');
const btnEndTurn     = document.getElementById('btn-end-turn');
const notifEl        = document.getElementById('notification');

// HUD
const hudFood    = document.getElementById('hud-food');
const hudProd    = document.getElementById('hud-prod');
const hudGold    = document.getElementById('hud-gold');
const hudSci     = document.getElementById('hud-science');
const hudTurn    = document.getElementById('hud-turn');

// Sidebar
const selName    = document.getElementById('sel-name');
const selStats   = document.getElementById('sel-stats');
const selActions = document.getElementById('sel-actions');
const sideCityProd = document.getElementById('sidebar-city-prod');
const cityProdInfo = document.getElementById('city-prod-info');
const cityProdBtns = document.getElementById('city-prod-btns');
const sideTech   = document.getElementById('sidebar-tech');
const techInfo   = document.getElementById('tech-info');
const techBtns   = document.getElementById('tech-btns');

// ── Core objects ─────────────────────────────────────────────────────────────
let game     = null;
let renderer = null;
let input    = null;
let notifTimer = null;

// ── Notification ──────────────────────────────────────────────────────────────
function notify(msg) {
  notifEl.textContent = msg;
  notifEl.classList.add('show');
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(() => notifEl.classList.remove('show'), 2500);
}

// ── Start / restart ────────────────────────────────────────────────────────────
function startGame() {
  overlayStart.classList.add('hidden');
  overlayGameover.classList.add('hidden');

  if (!game) {
    game     = new Game();
    renderer = new Renderer(canvas);
    input    = new InputHandler(canvas, game, renderer);
    input.bind();
  }

  game.onNotify      = notify;
  game.onPhaseChange = onPhaseChange;
  game.onGameOver    = onGameOver;
  game.onRender      = renderFrame;

  game.init();
  renderer.resize();
  // Center camera on human start
  const firstUnit = game.human.units[0];
  if (firstUnit) renderer.centerOn(firstUnit.x, firstUnit.y);

  renderFrame();
  updateUI();
}

// ── Render frame ──────────────────────────────────────────────────────────────
function renderFrame() {
  if (!game || !renderer) return;
  renderer.render(game);
  updateHUD();
  updateSidebar();
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function updateHUD() {
  if (!game) return;
  const y = game.allPlayersYields();
  hudFood.textContent = `+${y.food}`;
  hudProd.textContent = `+${y.prod}`;
  hudGold.textContent = `${game.human.gold} (+${y.gold})`;
  hudSci.textContent  = `${game.human.science} (+${y.sci})`;
  hudTurn.textContent = game.turn;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function updateSidebar() {
  if (!game) return;
  const unit = game.selectedUnit;
  const city = game.selectedCity;
  const tile = game.selectedTile;

  // Selection info
  if (unit) {
    const cfg = UNIT_DATA[unit.type];
    selName.textContent = cfg.name;
    selStats.innerHTML = `
      <div class="stat-row"><span class="stat-key">HP</span><span class="stat-val">${unit.hp}/${unit.maxHp}</span></div>
      <div class="stat-row"><span class="stat-key">Strength</span><span class="stat-val">${unit.strength}</span></div>
      <div class="stat-row"><span class="stat-key">Moves</span><span class="stat-val">${unit.movesLeft}/${unit.maxMoves}</span></div>
      <div class="stat-row"><span class="stat-key">XP</span><span class="stat-val">${unit.xp}</span></div>
      <div class="stat-row"><span class="stat-key">Type</span><span class="stat-val">${cfg.ranged ? 'Ranged' : 'Melee'}</span></div>
    `;
    selActions.innerHTML = '';
    if (unit.canFound && unit.movesLeft > 0) {
      addBtn(selActions, '🏙 Found City [F]', 'success', () => game.foundCityPlayer());
    }
    if (unit.movesLeft > 0) {
      addBtn(selActions, '💤 Sleep [Z]', '', () => { unit.sleep(); game.deselect(); renderFrame(); });
      addBtn(selActions, '🛡 Fortify [G]', '', () => { unit.fortify(); game.deselect(); renderFrame(); });
    }
    addBtn(selActions, '🗑 Disband', 'danger', () => {
      game.human.removeUnit(unit); game.deselect(); renderFrame();
    });
  } else if (city && city.owner === game.human) {
    selName.textContent = city.name;
    const yields = city.computeYields(game.gameMap);
    selStats.innerHTML = `
      <div class="stat-row"><span class="stat-key">Population</span><span class="stat-val">${city.population}</span></div>
      <div class="stat-row"><span class="stat-key">HP</span><span class="stat-val">${city.hp}/${city.maxHp}</span></div>
      <div class="stat-row"><span class="stat-key">Food/turn</span><span class="stat-val">+${yields.food}</span></div>
      <div class="stat-row"><span class="stat-key">Prod/turn</span><span class="stat-val">+${yields.prod}</span></div>
      <div class="stat-row"><span class="stat-key">Gold/turn</span><span class="stat-val">+${yields.gold}</span></div>
      <div class="stat-row"><span class="stat-key">Defense</span><span class="stat-val">${city.defense}</span></div>
      ${city.isCapital ? '<div class="stat-row"><span class="stat-key" style="color:#f0c040">★ Capital</span></div>' : ''}
      <div class="stat-row"><span class="stat-key">Buildings</span><span class="stat-val">${city.buildings.length ? city.buildings.map(b => BUILDING_DATA[b].name).join(', ') : 'None'}</span></div>
    `;
    selActions.innerHTML = '';
  } else if (tile) {
    const t = game.gameMap.getTile(tile.x, tile.y);
    if (t) {
      const y = game.gameMap.getYields(tile.x, tile.y);
      selName.textContent = t.type.charAt(0) + t.type.slice(1).toLowerCase();
      selStats.innerHTML = `
        <div class="stat-row"><span class="stat-key">Position</span><span class="stat-val">[${tile.x},${tile.y}]</span></div>
        <div class="stat-row"><span class="stat-key">Food</span><span class="stat-val">${y.food}</span></div>
        <div class="stat-row"><span class="stat-key">Production</span><span class="stat-val">${y.prod}</span></div>
        <div class="stat-row"><span class="stat-key">Gold</span><span class="stat-val">${y.gold}</span></div>
        ${t.improvement ? `<div class="stat-row"><span class="stat-key">Improvement</span><span class="stat-val">${t.improvement}</span></div>` : ''}
      `;
      selActions.innerHTML = '';
    }
  } else {
    selName.textContent = '—';
    selStats.innerHTML  = '<p style="color:#8b949e;font-size:12px;">Click a unit or tile to select.</p>';
    selActions.innerHTML = '';
  }

  // City production panel
  const selectedCity = game.selectedCity;
  if (selectedCity && selectedCity.owner === game.human) {
    sideCityProd.style.display = '';
    const cost = selectedCity.productionCost();
    const pct  = Math.floor(selectedCity.productionProgress() * 100);
    cityProdInfo.innerHTML = `
      <div class="stat-row">
        <span class="stat-key">Building</span>
        <span class="stat-val">${selectedCity.productionQueue
          ? (UNIT_DATA[selectedCity.productionQueue] || BUILDING_DATA[selectedCity.productionQueue])?.name ?? selectedCity.productionQueue
          : '—'
        }</span>
      </div>
      <div class="stat-row">
        <span class="stat-key">Progress</span>
        <span class="stat-val">${selectedCity.production}/${cost}</span>
      </div>
      <div class="prod-bar-wrap"><div class="prod-bar" style="width:${pct}%"></div></div>
    `;

    cityProdBtns.innerHTML = '<p style="color:#8b949e;font-size:11px;margin-bottom:4px;">Switch production:</p>';
    const items = ['WARRIOR', 'SETTLER', 'WORKER'];
    if (game.human.hasUnlocked('ARCHER')) items.push('ARCHER');
    for (const u of items) {
      const cfg = UNIT_DATA[u];
      const btn = document.createElement('button');
      btn.className = 'action-btn' + (selectedCity.productionQueue === u ? ' primary' : '');
      btn.textContent = `${cfg.name} (${cfg.cost}⚙)`;
      btn.onclick = () => { game.setCityProduction(selectedCity, u); renderFrame(); };
      cityProdBtns.appendChild(btn);
    }
    // Buildings
    const buildings = ['GRANARY', 'BARRACKS', 'MARKET', 'LIBRARY', 'WALLS'];
    for (const b of buildings) {
      if (selectedCity.buildings.includes(b)) continue;
      if (!game.human.hasUnlocked(b)) continue;
      const cfg = BUILDING_DATA[b];
      const btn = document.createElement('button');
      btn.className = 'action-btn' + (selectedCity.productionQueue === b ? ' success' : '');
      btn.textContent = `${cfg.name} (${cfg.cost}⚙)`;
      btn.title = cfg.description;
      btn.onclick = () => { game.setCityProduction(selectedCity, b); renderFrame(); };
      cityProdBtns.appendChild(btn);
    }
  } else {
    sideCityProd.style.display = 'none';
  }

  // Tech panel
  updateTechPanel();
}

function updateTechPanel() {
  const human = game.human;
  if (human.currentTech) {
    const cfg  = TECH_DATA[human.currentTech];
    const pct  = Math.floor((human.techProgress / cfg.cost) * 100);
    techInfo.innerHTML = `
      <div class="stat-row"><span class="stat-key">Researching</span><span class="stat-val">${cfg.name}</span></div>
      <div class="stat-row"><span class="stat-key">Progress</span><span class="stat-val">${human.techProgress}/${cfg.cost}</span></div>
      <div class="prod-bar-wrap"><div class="prod-bar" style="width:${pct}%;background:#3fb950"></div></div>
    `;
  } else {
    techInfo.innerHTML = '<p style="color:#8b949e;font-size:12px;">No research active.</p>';
  }

  techBtns.innerHTML = '';
  const available = human.availableTechs();
  if (available.length === 0 && human.currentTech == null) {
    techBtns.innerHTML = '<p style="color:#8b949e;font-size:11px;">All techs researched!</p>';
    return;
  }
  for (const t of available) {
    const cfg = TECH_DATA[t];
    const btn = document.createElement('button');
    btn.className = 'action-btn' + (human.currentTech === t ? ' primary' : '');
    btn.textContent = `${cfg.name} (${cfg.cost}🔬)`;
    btn.title = cfg.description;
    btn.disabled = human.currentTech === t;
    btn.onclick = () => { game.setResearch(t); renderFrame(); };
    techBtns.appendChild(btn);
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function addBtn(container, label, cls, onClick) {
  const btn = document.createElement('button');
  btn.className = 'action-btn ' + (cls || '');
  btn.textContent = label;
  btn.onclick = onClick;
  container.appendChild(btn);
}

// ── Phase changes ──────────────────────────────────────────────────────────────
function onPhaseChange(phase) {
  if (phase === Phase.AI_TURN) {
    btnEndTurn.disabled = true;
    btnEndTurn.textContent = 'AI Turn…';
    notify('AI is thinking…');
  } else if (phase === Phase.PLAYER_TURN) {
    btnEndTurn.disabled = false;
    btnEndTurn.textContent = 'End Turn ➤';
    // Auto-select first unit with moves
    const firstUnit = game.human.units.find(u => !u.isDead && u.movesLeft > 0 && !u.sleeping);
    if (firstUnit) {
      game['_selectUnit'](firstUnit);
      renderer.centerOn(firstUnit.x, firstUnit.y);
    }
    renderFrame();
  }
}

// ── Game over ──────────────────────────────────────────────────────────────────
function onGameOver(win, reason, score) {
  overlayGameover.classList.remove('hidden');
  const title    = document.getElementById('go-title');
  const reasonEl = document.getElementById('go-reason');
  const scoreEl  = document.getElementById('go-score');

  title.textContent = win ? '🏆 Victory!' : '💀 Defeat!';
  title.className   = win ? 'win-text' : 'lose-text';
  reasonEl.textContent = reason;
  scoreEl.textContent  = `Final Score: ${score}`;
}

// ── Window resize ─────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (renderer) {
    renderer.resize();
    renderer.clampCamera();
    renderFrame();
  }
});

// ── Button wiring ──────────────────────────────────────────────────────────────
btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', startGame);
btnEndTurn.addEventListener('click', () => {
  if (game && game.phase === Phase.PLAYER_TURN) game.endTurn();
});

// ── Legend ────────────────────────────────────────────────────────────────────
const legendEl = document.getElementById('legend');
legendEl.innerHTML = `
  🌾 Grassland (+2 food)<br>
  🟡 Plains (+1f +1p)<br>
  🟤 Hills (+2 prod)<br>
  🌲 Forest (+1f +1p)<br>
  🟠 Desert (+2 gold)<br>
  ⛰ Mountains (impassable)<br>
  🔵 Ocean (impassable)<br>
  <br>
  <b>W</b> = Warrior  <b>S</b> = Settler<br>
  <b>A</b> = Archer   <b>K</b> = Worker<br>
  ★ = Capital city<br>
  Green tiles = move range<br>
  Red tiles = attack range
`;

// ── Update UI (called outside render loop too) ────────────────────────────────
function updateUI() {
  updateHUD();
  updateSidebar();
}

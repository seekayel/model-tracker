import { GameMap }   from './map.js';
import { Player }    from './player.js';
import { AI }        from './ai.js';
import { Unit, resetUnitIds }      from './unit.js';
import { City, resetCityIds }      from './city.js';
import {
  PLAYER_CIV, AI_CIV, UnitType, UNIT_DATA, TECH_DATA,
  BUILDING_DATA, MAX_TURNS, TILE_SIZE,
} from './constants.js';

export const Phase = Object.freeze({
  MENU:        'MENU',
  PLAYER_TURN: 'PLAYER_TURN',
  AI_TURN:     'AI_TURN',
  GAME_OVER:   'GAME_OVER',
});

export class Game {
  constructor() {
    this.gameMap      = null;
    this.human        = null;
    this.enemy        = null;
    this.ai           = null;
    this.phase        = Phase.MENU;
    this.turn         = 1;

    // Selection state
    this.selectedUnit = null;
    this.selectedCity = null;
    this.selectedTile = null;
    this.moveRange    = [];
    this.attackRange  = [];

    // Event callbacks (set by main.js)
    this.onNotify     = (_msg) => {};
    this.onPhaseChange = (_phase) => {};
    this.onGameOver   = (_win, _reason) => {};
    this.onRender     = () => {};
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  init() {
    resetUnitIds();
    resetCityIds();

    this.gameMap = new GameMap();
    this.human   = new Player(PLAYER_CIV, true);
    this.enemy   = new Player(AI_CIV, false);
    this.ai      = new AI(this.enemy, this.gameMap);
    this.turn    = 1;
    this.phase   = Phase.PLAYER_TURN;
    this.selectedUnit = null;
    this.selectedCity = null;
    this.selectedTile = null;
    this.moveRange    = [];
    this.attackRange  = [];

    // Place starting units
    const humanStart = this.gameMap.findStartPos('left');
    const aiStart    = this.gameMap.findStartPos('right', [[humanStart.x, humanStart.y]]);

    this.human.spawnUnit(UnitType.SETTLER,  humanStart.x, humanStart.y);
    this.human.spawnUnit(UnitType.WARRIOR,  humanStart.x + 1, humanStart.y);

    this.enemy.spawnUnit(UnitType.SETTLER,  aiStart.x, aiStart.y);
    this.enemy.spawnUnit(UnitType.WARRIOR,  aiStart.x - 1, aiStart.y);

    // AI starts with a tech
    this.enemy.setResearch('ARCHERY');

    // Auto-research something for human too
    this.human.setResearch('POTTERY');
  }

  // ── Player actions ────────────────────────────────────────────────────────

  selectTile(tx, ty) {
    const tile = this.gameMap.getTile(tx, ty);
    if (!tile) return;

    // Check if clicking on a friendly unit
    const friendlyUnit = this.human.unitAt(tx, ty);
    // Check if clicking on friendly city
    const friendlyCity = this.human.cityAt(tx, ty);
    // Check enemy unit/city
    const enemyUnit = this.enemy.unitAt(tx, ty);
    const enemyCity = this.enemy.cityAt(tx, ty);

    if (this.selectedUnit) {
      // Try to move or attack
      const inMove   = this.moveRange.some(p => p.x === tx && p.y === ty);
      const inAttack = this.attackRange.some(p => p.x === tx && p.y === ty);

      if (inMove && !enemyUnit && !enemyCity) {
        this._moveUnit(this.selectedUnit, tx, ty);
        return;
      }
      if (inAttack && (enemyUnit || enemyCity)) {
        this.performCombat(this.selectedUnit, enemyUnit || enemyCity, false);
        this._updateHighlights();
        return;
      }
      // If clicking own city, open city screen
      if (friendlyCity) {
        this.deselect();
        this.selectedCity = friendlyCity;
        this.selectedTile = { x: tx, y: ty };
        this.onRender();
        return;
      }
      // Clicking different friendly unit — switch selection
      if (friendlyUnit && friendlyUnit !== this.selectedUnit) {
        this.deselect();
        this._selectUnit(friendlyUnit);
        return;
      }
      // Clicking same unit — deselect
      if (friendlyUnit === this.selectedUnit) {
        this.deselect();
        return;
      }
      this.deselect();
    } else {
      // Nothing selected yet
      if (friendlyUnit) {
        this._selectUnit(friendlyUnit);
      } else if (friendlyCity) {
        this.selectedCity = friendlyCity;
        this.selectedTile = { x: tx, y: ty };
        this.onRender();
      } else {
        this.selectedTile = { x: tx, y: ty };
        this.onRender();
      }
    }
  }

  _selectUnit(unit) {
    if (this.phase !== Phase.PLAYER_TURN) return;
    this.selectedUnit = unit;
    this.selectedCity = null;
    this.selectedTile = { x: unit.x, y: unit.y };
    this._updateHighlights();
    this.onRender();
  }

  deselect() {
    this.selectedUnit = null;
    this.selectedCity = null;
    this.selectedTile = null;
    this.moveRange    = [];
    this.attackRange  = [];
    this.onRender();
  }

  _updateHighlights() {
    const unit = this.selectedUnit;
    if (!unit || unit.movesLeft === 0) {
      this.moveRange   = [];
      this.attackRange = [];
      return;
    }

    // Move range (BFS)
    const enemyOccupied = (x, y) =>
      this.enemy.units.some(u => u.x === x && u.y === y && !u.isDead) ||
      this.enemy.cities.some(c => c.x === x && c.y === y);

    this.moveRange = this.gameMap.reachable(unit.x, unit.y, unit.movesLeft, enemyOccupied)
      .filter(({ x, y }) => {
        // Can't move onto friendly units
        return !this.human.units.some(u => u !== unit && u.x === x && u.y === y && !u.isDead);
      });

    // Attack range
    const attackR = unit.isRanged ? unit.range : 1;
    this.attackRange = [];
    for (let dy = -attackR; dy <= attackR; dy++) {
      for (let dx = -attackR; dx <= attackR; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (Math.abs(dx) + Math.abs(dy) > attackR) continue;
        const nx = unit.x + dx, ny = unit.y + dy;
        const eu = this.enemy.unitAt(nx, ny);
        const ec = this.enemy.cityAt(nx, ny);
        if (eu || ec) this.attackRange.push({ x: nx, y: ny });
      }
    }
  }

  _moveUnit(unit, tx, ty) {
    const friendlyCity = this.human.cityAt(tx, ty);

    unit.move(tx, ty);

    // Auto-found city on settler if moved onto good spot?
    // (No, require explicit action)

    this._updateHighlights();
    this.onRender();

    // Notify if no moves left
    if (unit.movesLeft === 0) {
      this.onNotify(`${UNIT_DATA[unit.type].name} has no more moves.`);
    }
  }

  // ── Found city ────────────────────────────────────────────────────────────
  foundCity(unit, owner) {
    if (!unit.canFound) {
      this.onNotify('Only Settlers can found cities.');
      return false;
    }
    const tile = this.gameMap.getTile(unit.x, unit.y);
    if (!tile || !this.gameMap.isPassable(unit.x, unit.y)) {
      this.onNotify('Cannot found a city here.');
      return false;
    }
    // Check no city too close
    const allCities = [...this.human.cities, ...this.enemy.cities];
    for (const c of allCities) {
      if (Math.abs(c.x - unit.x) < 3 && Math.abs(c.y - unit.y) < 3) {
        this.onNotify('Too close to another city.');
        return false;
      }
    }

    const city = owner.foundCity(unit.x, unit.y);
    this.onNotify(`Founded ${city.name}!`);

    // Remove the settler
    owner.removeUnit(unit);
    if (unit === this.selectedUnit) {
      this.deselect();
    }

    this.onRender();
    return true;
  }

  foundCityPlayer() {
    if (!this.selectedUnit) {
      this.onNotify('Select a Settler first.');
      return;
    }
    if (this.selectedUnit.type !== UnitType.SETTLER) {
      this.onNotify('Only Settlers can found cities.');
      return;
    }
    this.foundCity(this.selectedUnit, this.human);
  }

  // ── Combat ────────────────────────────────────────────────────────────────
  performCombat(attacker, target, isAI = false) {
    const isCity   = target instanceof City;
    const atkStr   = attacker.strength;
    const defStr   = isCity ? target.defense : target.strength;

    if (atkStr === 0) {
      this.onNotify(`${UNIT_DATA[attacker.type].name} cannot attack!`);
      return;
    }

    // Damage formula with randomness
    const atkRoll = 0.7 + Math.random() * 0.6;
    const defRoll = 0.7 + Math.random() * 0.6;

    const atkDmg = Math.ceil(atkStr * atkRoll);
    const defDmg = Math.ceil((defStr * 0.5) * defRoll);

    const attackerOwner = attacker.owner;
    const defenderOwner = isCity ? target.owner : target.owner;

    // Apply damage
    target.takeDamage(atkDmg);
    if (!isCity && defStr > 0) {
      attacker.takeDamage(defDmg);
    }
    attacker.exhaust();

    // XP gain
    attacker.gainXP(10);
    if (!isCity) target.gainXP(5);

    const msg = isCity
      ? `Attacked ${target.name}: dealt ${atkDmg} dmg (${target.hp}/${target.maxHp} HP left)`
      : `Combat: dealt ${atkDmg}, received ${defDmg} dmg`;
    this.onNotify(msg);

    // Check destruction
    if (target.isDead || (isCity && target.isDestroyed)) {
      if (isCity) {
        // Capture city
        target.capture(attackerOwner);
        this.onNotify(`${target.name} captured by ${attackerOwner.name}!`);
      } else {
        defenderOwner.removeUnit(target);
        this.onNotify(`${UNIT_DATA[target.type].name} destroyed!`);
      }
    }
    if (attacker.isDead) {
      attackerOwner.removeUnit(attacker);
      if (attacker === this.selectedUnit) this.deselect();
      this.onNotify(`${UNIT_DATA[attacker.type].name} was lost in battle!`);
    }

    this.checkVictory();
    this.onRender();
  }

  // ── City production ───────────────────────────────────────────────────────
  setCityProduction(city, item) {
    if (city.owner !== this.human) return;
    city.productionQueue = item;
    this.onRender();
  }

  // ── Research ──────────────────────────────────────────────────────────────
  setResearch(techType) {
    if (!this.human.canResearch(techType)) {
      this.onNotify('Cannot research that tech yet.');
      return;
    }
    this.human.setResearch(techType);
    this.onNotify(`Researching ${TECH_DATA[techType].name}…`);
    this.onRender();
  }

  // ── End of turn ───────────────────────────────────────────────────────────
  endTurn() {
    if (this.phase !== Phase.PLAYER_TURN) return;
    this.deselect();
    this.phase = Phase.AI_TURN;
    this.onPhaseChange(Phase.AI_TURN);

    // Process human end-of-turn
    const humanResult = this.human.processEndOfTurn(this.gameMap);
    this._handleProduction(humanResult, this.human);
    if (humanResult.completedTech) {
      this.onNotify(`Research complete: ${TECH_DATA[humanResult.completedTech].name}!`);
    }

    // Brief delay then process AI turn
    setTimeout(() => this._doAITurn(), 400);
  }

  _doAITurn() {
    // AI takes its turn
    const aiLogs = this.ai.takeTurn(this);

    // Process AI end-of-turn
    const aiResult = this.enemy.processEndOfTurn(this.gameMap);
    this._handleProduction(aiResult, this.enemy);

    // Start new player turn
    this.turn += 1;
    this.human.resetUnitMoves();
    this.enemy.resetUnitMoves();

    this.phase = Phase.PLAYER_TURN;
    this.onPhaseChange(Phase.PLAYER_TURN);

    this.checkVictory();

    if (this.turn > MAX_TURNS && this.phase !== Phase.GAME_OVER) {
      this._scoreVictory();
    }

    this.onRender();
  }

  _handleProduction(result, player) {
    for (const { city, item } of result.produced) {
      // Spawn unit if it's a unit type
      if (UNIT_DATA[item]) {
        // Find adjacent passable tile for unit spawn
        const pos = this._findSpawnPos(city.x, city.y, player);
        if (pos) {
          player.spawnUnit(item, pos.x, pos.y);
          if (player.isHuman) {
            this.onNotify(`${UNIT_DATA[item].name} built in ${city.name}!`);
          }
        }
      } else if (BUILDING_DATA[item]) {
        if (player.isHuman) {
          this.onNotify(`${BUILDING_DATA[item].name} built in ${city.name}!`);
        }
      }
    }
  }

  _findSpawnPos(cx, cy, player) {
    const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx, ny = cy + dy;
      if (!this.gameMap.isPassable(nx, ny)) continue;
      const occupied = [...this.human.units, ...this.enemy.units].some(u => u.x === nx && u.y === ny && !u.isDead);
      if (!occupied) return { x: nx, y: ny };
    }
    return null;
  }

  // ── Victory check ─────────────────────────────────────────────────────────
  checkVictory() {
    if (this.enemy.isEliminated && this.enemy.cities.length === 0) {
      this._endGame(true, 'You conquered all enemy cities! Victory!');
      return;
    }
    if (this.human.isEliminated && this.human.cities.length === 0) {
      this._endGame(false, 'All your cities have fallen. Defeat!');
      return;
    }
    // Check if human has no units and no cities
    if (this.human.units.length === 0 && this.human.cities.length === 0) {
      this._endGame(false, 'Your civilization has been destroyed.');
    }
  }

  _scoreVictory() {
    const humanScore = this._calcScore(this.human);
    const aiScore    = this._calcScore(this.enemy);
    if (humanScore >= aiScore) {
      this._endGame(true, `Time limit reached! Score: ${humanScore} vs ${aiScore}. You win by score!`);
    } else {
      this._endGame(false, `Time limit reached! Score: ${humanScore} vs ${aiScore}. Enemy wins by score.`);
    }
  }

  _calcScore(player) {
    return player.cities.length * 100 +
           player.cities.reduce((sum, c) => sum + c.population * 10, 0) +
           player.techs.size * 20 +
           player.units.length * 5;
  }

  _endGame(win, reason) {
    if (this.phase === Phase.GAME_OVER) return;
    this.phase = Phase.GAME_OVER;
    const score = this._calcScore(this.human);
    this.onGameOver(win, reason, score);
  }

  // ── Utility ────────────────────────────────────────────────────────────────
  unitAt(x, y) {
    return this.human.unitAt(x, y) || this.enemy.unitAt(x, y);
  }

  cityAt(x, y) {
    return this.human.cityAt(x, y) || this.enemy.cityAt(x, y);
  }

  allPlayersYields() {
    const h = this.human.cities.reduce((acc, city) => {
      const y = city.computeYields(this.gameMap);
      acc.food += y.food; acc.prod += y.prod; acc.gold += y.gold; acc.sci += y.sci;
      return acc;
    }, { food: 0, prod: 0, gold: 0, sci: 0 });
    return h;
  }
}

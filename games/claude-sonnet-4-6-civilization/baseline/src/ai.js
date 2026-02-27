import { UnitType, TECH_DATA, TERRAIN_DATA } from './constants.js';

// Simple AI that controls the enemy civilization
export class AI {
  constructor(player, gameMap) {
    this.player  = player;
    this.gameMap = gameMap;
    this._log    = [];
  }

  // Main AI turn — returns list of actions taken (strings for log)
  takeTurn(game) {
    this._log = [];
    const human = game.human;

    // 1. Set research if none
    this._manageResearch();

    // 2. Process each unit
    for (const unit of [...this.player.units]) {
      if (unit.isDead || unit.movesLeft === 0) continue;
      this._handleUnit(unit, human, game);
    }

    // 3. Set city productions
    for (const city of this.player.cities) {
      this._manageCityProduction(city);
    }

    return this._log;
  }

  _manageResearch() {
    if (this.player.currentTech) return;
    const available = this.player.availableTechs();
    if (available.length === 0) return;
    // Prioritize: Archery > Bronze > Pottery > others
    const priority = ['ARCHERY', 'BRONZE', 'POTTERY', 'MINING', 'MASONRY', 'WRITING', 'MATHEMATICS', 'IRON'];
    const pick = priority.find(t => available.includes(t)) ?? available[0];
    this.player.setResearch(pick);
  }

  _manageCityProduction(city) {
    const q = city.productionQueue;
    // If already producing something, keep going
    if (q) return;

    const { units, cities } = this.player;
    const ratio = units.length / Math.max(1, cities.length);

    if (ratio < 2) {
      city.productionQueue = 'WARRIOR';
    } else if (!city.buildings.includes('GRANARY') && this.player.hasUnlocked('GRANARY')) {
      city.productionQueue = 'GRANARY';
    } else if (!city.buildings.includes('BARRACKS') && this.player.hasUnlocked('BARRACKS')) {
      city.productionQueue = 'BARRACKS';
    } else if (cities.length < 3 && units.filter(u => u.type === 'SETTLER').length === 0) {
      city.productionQueue = 'SETTLER';
    } else {
      city.productionQueue = this.player.hasUnlocked('ARCHER') ? 'ARCHER' : 'WARRIOR';
    }
  }

  _handleUnit(unit, human, game) {
    switch (unit.type) {
      case UnitType.SETTLER:
        this._settlerLogic(unit, game);
        break;
      case UnitType.WARRIOR:
      case UnitType.ARCHER:
        this._combatUnitLogic(unit, human, game);
        break;
      case UnitType.WORKER:
        this._workerLogic(unit, game);
        break;
    }
  }

  _settlerLogic(unit, game) {
    const map = this.gameMap;
    // Find the best city location not too close to existing cities
    const existingCities = [...this.player.cities, ...game.human.cities];
    const excl = existingCities.map(c => [c.x, c.y]);

    // Score tiles nearby
    let bestScore = -Infinity, bestX = unit.x, bestY = unit.y;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const nx = unit.x + dx, ny = unit.y + dy;
        if (!map.isPassable(nx, ny)) continue;
        // Too close to existing cities?
        let tooClose = false;
        for (const [cx, cy] of excl) {
          if (Math.abs(nx - cx) < 4 && Math.abs(ny - cy) < 4) { tooClose = true; break; }
        }
        if (tooClose) continue;

        let score = 0;
        for (let sy = -2; sy <= 2; sy++) {
          for (let sx = -2; sx <= 2; sx++) {
            const t = map.getTile(nx + sx, ny + sy);
            if (!t) continue;
            const y = map.getYields(nx + sx, ny + sy);
            score += y.food * 2 + y.prod + y.gold;
          }
        }
        if (score > bestScore) { bestScore = score; bestX = nx; bestY = ny; }
      }
    }

    if (bestX === unit.x && bestY === unit.y) {
      // Found city here if land
      if (map.isPassable(unit.x, unit.y) && this.player.cities.length < 5) {
        game.foundCity(unit, this.player);
        this._log.push(`${this.player.name} founded a city`);
      }
      return;
    }

    // Move towards best spot
    const path = map.findPath(unit.x, unit.y, bestX, bestY);
    if (path && path.length > 0) {
      const step = path[0];
      // Check no friendly unit blocks
      if (!this._friendlyAt(step.x, step.y)) {
        unit.move(step.x, step.y);
      }
    }

    // If now at best position and have moves, found city
    if (unit.x === bestX && unit.y === bestY && unit.movesLeft > 0) {
      game.foundCity(unit, this.player);
      this._log.push(`${this.player.name} founded a city`);
    }
  }

  _combatUnitLogic(unit, human, game) {
    // Find nearest enemy target (unit or city)
    const map = this.gameMap;

    const targets = [
      ...human.units.filter(u => !u.isDead),
      ...human.cities,
    ];

    if (targets.length === 0) return;

    // Find closest
    let closest = null, closestDist = Infinity;
    for (const t of targets) {
      const d = Math.abs(t.x - unit.x) + Math.abs(t.y - unit.y);
      if (d < closestDist) { closestDist = d; closest = t; }
    }
    if (!closest) return;

    const attackRange = unit.isRanged ? unit.range : 1;

    if (closestDist <= attackRange) {
      // Attack!
      game.performCombat(unit, closest, true);
      this._log.push(`${this.player.name} attacks!`);
    } else {
      // Move closer
      const path = map.findPath(unit.x, unit.y, closest.x, closest.y);
      if (path && path.length > 0) {
        const step = path[0];
        // Don't step on ally
        if (!this._friendlyAt(step.x, step.y)) {
          unit.move(step.x, step.y);
          // Try to attack after moving
          const newDist = Math.abs(closest.x - unit.x) + Math.abs(closest.y - unit.y);
          if (newDist <= attackRange && unit.movesLeft > 0) {
            game.performCombat(unit, closest, true);
          }
        } else {
          // Find alternate step
          for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nx = unit.x + dx, ny = unit.y + dy;
            if (map.isPassable(nx, ny) && !this._friendlyAt(nx, ny) && !this._enemyAt(nx, ny, human)) {
              unit.move(nx, ny);
              break;
            }
          }
        }
      } else {
        // No path; try random adjacent passable tile
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]].sort(() => Math.random() - 0.5);
        for (const [dx, dy] of dirs) {
          const nx = unit.x + dx, ny = unit.y + dy;
          if (map.isPassable(nx, ny) && !this._friendlyAt(nx, ny) && !this._enemyAt(nx, ny, human)) {
            unit.move(nx, ny);
            break;
          }
        }
      }
    }
  }

  _workerLogic(unit, game) {
    // Build a farm/mine on current tile if no improvement
    const tile = this.gameMap.getTile(unit.x, unit.y);
    if (tile && !tile.improvement && TERRAIN_DATA[tile.type].passable) {
      const yields = this.gameMap.getYields(unit.x, unit.y);
      if (yields.prod > 0) {
        tile.improvement = 'mine';
      } else {
        tile.improvement = 'farm';
      }
      unit.exhaust();
    }
  }

  _friendlyAt(x, y) {
    return this.player.units.some(u => u.x === x && u.y === y && !u.isDead);
  }

  _enemyAt(x, y, human) {
    return human.units.some(u => u.x === x && u.y === y && !u.isDead);
  }
}

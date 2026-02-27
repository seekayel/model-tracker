import {
  BUILDING_DATA, UNIT_DATA, CITY_BASE_DEFENSE, CITY_BASE_HP,
  DEFAULT_CITY_PRODUCTION,
} from './constants.js';

let nextCityId = 1;

export class City {
  constructor(name, x, y, owner) {
    this.id         = nextCityId++;
    this.name       = name;
    this.x          = x;
    this.y          = y;
    this.owner      = owner;

    this.population  = 1;
    this.food        = 0;
    this.foodNeeded  = 10;   // food to grow

    this.production  = 0;
    this.productionQueue = DEFAULT_CITY_PRODUCTION;  // unit type or building type
    this.buildings   = [];

    this.hp          = CITY_BASE_HP;
    this.maxHp       = CITY_BASE_HP;

    this.isCapital   = false;
  }

  // ── Resource yields ─────────────────────────────────────────────────────────
  computeYields(gameMap) {
    let food = 0, prod = 0, gold = 0, sci = 0;

    // Gather from city tile + adjacent tiles (up to population)
    const tiles = this._getWorkedTiles(gameMap);
    for (const { x, y } of tiles) {
      const y_ = gameMap.getYields(x, y);
      food += y_.food;
      prod += y_.prod;
      gold += y_.gold;
    }

    // City center always provides at least 1 food + 1 prod
    food = Math.max(food, 1);
    prod = Math.max(prod, 1);

    // Building bonuses
    for (const b of this.buildings) {
      const cfg = BUILDING_DATA[b];
      if (cfg) {
        food += cfg.foodBonus  || 0;
        gold += cfg.goldBonus  || 0;
        sci  += cfg.sciBonus   || 0;
        prod += cfg.prodBonus  || 0;
      }
    }

    return { food, prod, gold, sci };
  }

  _getWorkedTiles(gameMap) {
    // City center + nearest land tiles (BFS order), up to population count
    const center = { x: this.x, y: this.y };
    const order = [center];

    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]) {
      const nx = this.x + dx, ny = this.y + dy;
      if (gameMap.isPassable(nx, ny)) order.push({ x: nx, y: ny });
    }
    // Population + 1 tiles worked (capital city always works center)
    return order.slice(0, Math.min(order.length, this.population + 1));
  }

  // ── Production ───────────────────────────────────────────────────────────────
  productionCost() {
    if (!this.productionQueue) return Infinity;
    const unitCfg = UNIT_DATA[this.productionQueue];
    if (unitCfg) return unitCfg.cost;
    const bldCfg = BUILDING_DATA[this.productionQueue];
    if (bldCfg) return bldCfg.cost;
    return Infinity;
  }

  productionProgress() {
    const cost = this.productionCost();
    return cost === Infinity ? 0 : Math.min(1, this.production / cost);
  }

  // Called at end of turn; returns produced unit type or building type (or null)
  processProduction(prodYield) {
    if (!this.productionQueue) return null;
    this.production += prodYield;
    const cost = this.productionCost();
    if (this.production >= cost) {
      this.production -= cost;
      const item = this.productionQueue;
      // If building, add it; if unit, caller handles spawning
      if (BUILDING_DATA[item] && !this.buildings.includes(item)) {
        this.buildings.push(item);
        this._onBuildingAdded(item);
        // Keep queuing same building? No — switch to default unit
        this.productionQueue = DEFAULT_CITY_PRODUCTION;
      }
      return item;
    }
    return null;
  }

  _onBuildingAdded(building) {
    if (building === 'WALLS') {
      this.maxHp += BUILDING_DATA.WALLS.defBonus * 2;
      this.hp    += BUILDING_DATA.WALLS.defBonus * 2;
    }
  }

  // ── Food / growth ────────────────────────────────────────────────────────────
  processGrowth(foodYield) {
    this.food += foodYield;
    if (this.food >= this.foodNeeded) {
      this.food -= this.foodNeeded;
      this.population += 1;
      this.foodNeeded  = 10 + this.population * 5;
      return true; // grew
    }
    return false;
  }

  // ── Combat ───────────────────────────────────────────────────────────────────
  get defense() {
    return CITY_BASE_DEFENSE + (this.buildings.includes('WALLS') ? BUILDING_DATA.WALLS.defBonus : 0)
           + Math.floor(this.population * 1.5);
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  repairHp(amount = 3) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  get isDestroyed() { return this.hp <= 0; }

  // ── Capture ──────────────────────────────────────────────────────────────────
  capture(newOwner) {
    this.owner      = newOwner;
    this.hp         = Math.floor(this.maxHp * 0.5);
    this.production = 0;
    this.food       = 0;
    this.population = Math.max(1, this.population - 1);
    // Lose buildings on capture (plundered)
    this.buildings  = [];
  }

  // ── Utility ──────────────────────────────────────────────────────────────────
  hasBarracks() { return this.buildings.includes('BARRACKS'); }

  toJSON() {
    return {
      id: this.id, name: this.name, x: this.x, y: this.y,
      population: this.population, food: this.food, production: this.production,
      buildings: this.buildings, hp: this.hp,
    };
  }
}

export function resetCityIds() { nextCityId = 1; }

import { TECH_DATA, TechType } from './constants.js';
import { Unit } from './unit.js';
import { City, resetCityIds } from './city.js';

export class Player {
  constructor(civConfig, isHuman = true) {
    this.name       = civConfig.name;
    this.color      = civConfig.color;
    this.cityNames  = [...civConfig.cityNames];
    this.isHuman    = isHuman;

    this.units      = [];
    this.cities     = [];

    this.gold       = 20;
    this.science    = 0;
    this.sciPerTurn = 0;

    this.techs         = new Set();
    this.currentTech   = null;
    this.techProgress  = 0;

    this._cityNameIdx  = 0;
  }

  // ── City management ──────────────────────────────────────────────────────────
  nextCityName() {
    const name = this.cityNames[this._cityNameIdx % this.cityNames.length];
    this._cityNameIdx++;
    return name;
  }

  foundCity(x, y) {
    const city = new City(this.nextCityName(), x, y, this);
    if (this.cities.length === 0) city.isCapital = true;
    this.cities.push(city);
    return city;
  }

  removeCity(city) {
    this.cities = this.cities.filter(c => c !== city);
  }

  get capital() {
    return this.cities.find(c => c.isCapital) ?? this.cities[0] ?? null;
  }

  // ── Unit management ──────────────────────────────────────────────────────────
  spawnUnit(type, x, y) {
    const unit = new Unit(type, x, y, this);
    this.units.push(unit);
    return unit;
  }

  removeUnit(unit) {
    this.units = this.units.filter(u => u !== unit);
  }

  // ── Tech research ────────────────────────────────────────────────────────────
  canResearch(techType) {
    if (this.techs.has(techType)) return false;
    const cfg = TECH_DATA[techType];
    return cfg.prereqs.every(p => this.techs.has(p));
  }

  availableTechs() {
    return Object.keys(TECH_DATA).filter(t => this.canResearch(t));
  }

  setResearch(techType) {
    if (!this.canResearch(techType)) return false;
    this.currentTech  = techType;
    this.techProgress = 0;
    return true;
  }

  hasUnlocked(item) {
    // Check if any tech unlocks this item
    for (const [tech, cfg] of Object.entries(TECH_DATA)) {
      if (cfg.unlocks.includes(item) && this.techs.has(tech)) return true;
    }
    // Some items are always available (base units)
    if (item === 'WARRIOR' || item === 'SETTLER' || item === 'WORKER') return true;
    return false;
  }

  // ── End-of-turn processing ───────────────────────────────────────────────────
  processEndOfTurn(gameMap) {
    let totalFood = 0, totalProd = 0, totalGold = 0, totalSci = 0;
    const produced = [];

    for (const city of this.cities) {
      const yields = city.computeYields(gameMap);
      totalFood += yields.food;
      totalProd += yields.prod;
      totalGold += yields.gold;
      totalSci  += yields.sci;

      const item = city.processProduction(yields.prod);
      if (item) produced.push({ city, item });

      city.processGrowth(yields.food);
      city.repairHp(3);
    }

    this.gold    += totalGold;
    this.science += totalSci;
    this.sciPerTurn = totalSci;

    // Research
    if (this.currentTech && TECH_DATA[this.currentTech]) {
      this.techProgress += totalSci;
      const cost = TECH_DATA[this.currentTech].cost;
      if (this.techProgress >= cost) {
        this.techs.add(this.currentTech);
        const completed = this.currentTech;
        this.currentTech  = null;
        this.techProgress = 0;
        return { produced, completedTech: completed, totalFood, totalGold, totalSci };
      }
    }

    // Heal fortified units
    for (const unit of this.units) {
      if (unit.fortified || unit.sleeping) {
        unit.heal(5);
      }
    }

    return { produced, completedTech: null, totalFood, totalGold, totalSci };
  }

  resetUnitMoves() {
    for (const unit of this.units) {
      unit.resetMoves();
    }
  }

  // ── Queries ──────────────────────────────────────────────────────────────────
  get isEliminated() {
    return this.cities.length === 0;
  }

  unitAt(x, y) {
    return this.units.find(u => u.x === x && u.y === y && !u.isDead) ?? null;
  }

  cityAt(x, y) {
    return this.cities.find(c => c.x === x && c.y === y) ?? null;
  }

  toJSON() {
    return {
      name: this.name, gold: this.gold, science: this.science,
      techs: [...this.techs], currentTech: this.currentTech,
    };
  }
}

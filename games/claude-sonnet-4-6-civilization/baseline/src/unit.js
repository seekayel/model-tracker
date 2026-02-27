import { UNIT_DATA } from './constants.js';

let nextId = 1;

export class Unit {
  constructor(type, x, y, owner) {
    this.id       = nextId++;
    this.type     = type;
    this.x        = x;
    this.y        = y;
    this.owner    = owner;  // Player reference

    const cfg    = UNIT_DATA[type];
    this.maxHp   = cfg.maxHp;
    this.hp      = cfg.maxHp;
    this.maxMoves = cfg.moves;
    this.movesLeft = cfg.moves;

    this.xp      = 0;
    this.sleeping = false;
    this.fortified = false;
    this.buildProgress = 0;  // for Worker
    this.buildTarget = null; // improvement being built
  }

  get config() { return UNIT_DATA[this.type]; }
  get strength() {
    const base = this.config.strength;
    // XP bonus: +1 str per 20 XP, max +5
    const xpBonus = Math.min(5, Math.floor(this.xp / 20));
    return base + xpBonus;
  }
  get isDead()      { return this.hp <= 0; }
  get canAct()      { return !this.isDead && this.movesLeft > 0 && !this.sleeping; }
  get canFound()    { return this.config.canFound; }
  get canBuild()    { return this.config.canBuild; }
  get isRanged()    { return this.config.ranged; }
  get range()       { return this.config.range ?? 1; }

  resetMoves() {
    this.movesLeft = this.maxMoves;
    if (this.fortified) this.movesLeft = 0; // fortified units skip their turn
  }

  move(newX, newY) {
    this.x = newX;
    this.y = newY;
    this.movesLeft = Math.max(0, this.movesLeft - 1);
    this.fortified = false;
  }

  exhaust() {
    this.movesLeft = 0;
  }

  fortify() {
    this.fortified = true;
    this.movesLeft = 0;
  }

  sleep() {
    this.sleeping = true;
    this.movesLeft = 0;
  }

  wake() {
    this.sleeping = false;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  heal(amount = 5) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  gainXP(amount) {
    this.xp += amount;
  }

  // Serialize for save (not used but nice to have)
  toJSON() {
    return {
      id: this.id, type: this.type, x: this.x, y: this.y,
      hp: this.hp, movesLeft: this.movesLeft, xp: this.xp,
      sleeping: this.sleeping, fortified: this.fortified,
    };
  }
}

export function resetUnitIds() { nextId = 1; }

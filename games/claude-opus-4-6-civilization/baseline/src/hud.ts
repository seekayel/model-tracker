import {
  GameState, UnitType, UNIT_DEFS, TERRAIN_YIELDS, Terrain,
} from './types';
import { getCityAt, getUnitsAt } from './game';

export function updateHUD(state: GameState): void {
  const player = state.players[0];

  const hudTurn = document.getElementById('hud-turn')!;
  const hudGold = document.getElementById('hud-gold')!;
  const hudScience = document.getElementById('hud-science')!;
  const hudScore = document.getElementById('hud-score')!;
  const hudInfo = document.getElementById('hud-info')!;
  const hudActions = document.getElementById('hud-actions')!;

  hudTurn.textContent = `Turn: ${state.turn}/200`;
  hudGold.textContent = `Gold: ${player.gold}`;
  hudScience.textContent = `Science: ${player.science}/50 (Techs: ${player.techs})`;
  hudScore.textContent = `Score: ${player.score}`;

  // Info panel
  let info = '';
  let actions = '';

  // Selected unit info
  if (state.selectedUnitId !== null) {
    const unit = state.units.find(u => u.id === state.selectedUnitId);
    if (unit) {
      const def = UNIT_DEFS[unit.type];
      const tile = state.tiles[unit.y][unit.x];
      info = `<div class="info-panel">
        <strong>${def.symbol} ${def.name}</strong>
        <span>HP: ${unit.hp}/${unit.maxHp}</span>
        <span>Moves: ${unit.movesLeft}/${def.moves}</span>
        <span>Strength: ${def.strength}${def.ranged ? ` / Ranged: ${def.ranged}` : ''}</span>
        <span>Terrain: ${tile.terrain}</span>
        ${unit.fortified ? '<span class="fortified">FORTIFIED</span>' : ''}
      </div>`;

      actions = '<div class="action-buttons">';
      if (unit.type === UnitType.Settler) {
        actions += '<button class="action-btn" data-action="build">Build City (B)</button>';
      }
      actions += '<button class="action-btn" data-action="fortify">Fortify (F)</button>';
      actions += '<button class="action-btn" data-action="skip">Skip (Space)</button>';
      actions += '</div>';
    }
  }

  // Selected city info
  if (state.selectedCityId !== null) {
    const city = state.cities.find(c => c.id === state.selectedCityId);
    if (city && city.owner === 0) {
      // Calculate yields
      let totalFood = 0, totalProd = 0, totalGold = 0;
      for (const pos of city.territory) {
        const t = state.tiles[pos.y][pos.x];
        totalFood += TERRAIN_YIELDS[t.terrain].food;
        totalProd += TERRAIN_YIELDS[t.terrain].production;
        totalGold += TERRAIN_YIELDS[t.terrain].gold;
      }
      const consumed = city.population * 2;

      info = `<div class="info-panel">
        <strong>🏰 ${city.name}</strong>
        <span>Population: ${city.population}</span>
        <span>HP: ${city.hp}/${city.maxHp}</span>
        <span>Food: ${city.food}/${city.foodNeeded} (+${totalFood - consumed}/turn)</span>
        <span>Production: +${totalProd}/turn</span>
        <span>Gold: +${totalGold}/turn</span>
        ${city.producing ?
          `<span>Building: ${UNIT_DEFS[city.producing].name} (${city.producingProgress}/${UNIT_DEFS[city.producing].cost})</span>` :
          '<span class="warning">No production set!</span>'}
      </div>`;

      actions = `<div class="action-buttons">
        <span class="action-label">Produce:</span>
        <button class="action-btn" data-produce="${UnitType.Warrior}">1: Warrior (${UNIT_DEFS[UnitType.Warrior].cost}⚙)</button>
        <button class="action-btn" data-produce="${UnitType.Archer}">2: Archer (${UNIT_DEFS[UnitType.Archer].cost}⚙)</button>
        <button class="action-btn" data-produce="${UnitType.Settler}">3: Settler (${UNIT_DEFS[UnitType.Settler].cost}⚙)</button>
        <button class="action-btn" data-produce="${UnitType.Scout}">4: Scout (${UNIT_DEFS[UnitType.Scout].cost}⚙)</button>
        <button class="action-btn" data-produce="${UnitType.Horseman}">5: Horseman (${UNIT_DEFS[UnitType.Horseman].cost}⚙)</button>
        <button class="action-btn" data-produce="${UnitType.Swordsman}">6: Swordsman (${UNIT_DEFS[UnitType.Swordsman].cost}⚙)</button>
        <button class="action-btn" data-produce="${UnitType.Catapult}">7: Catapult (${UNIT_DEFS[UnitType.Catapult].cost}⚙)</button>
      </div>`;
    }
  }

  // If nothing selected, show general info
  if (!info) {
    const cities = state.cities.filter(c => c.owner === 0);
    const units = state.units.filter(u => u.owner === 0);
    info = `<div class="info-panel">
      <span>Cities: ${cities.length} | Units: ${units.length}</span>
      <span>Click a unit or city to select</span>
    </div>`;
  }

  hudInfo.innerHTML = info;
  hudActions.innerHTML = actions;
}

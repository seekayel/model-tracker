import {
  GameState,
  Unit,
  City,
  Player,
  UnitType,
  UNIT_STATS,
  TECHNOLOGIES,
  BUILDINGS
} from './types';
import { getCityYields } from './gameState';

export class UIManager {
  private goldDisplay: HTMLElement;
  private scienceDisplay: HTMLElement;
  private turnDisplay: HTMLElement;
  private playerName: HTMLElement;
  private infoPanel: HTMLElement;
  private infoTitle: HTMLElement;
  private infoContent: HTMLElement;
  private infoActions: HTMLElement;
  private techPanel: HTMLElement;
  private techList: HTMLElement;
  private notification: HTMLElement;
  private endTurnBtn: HTMLElement;

  private notificationTimeout: number | null = null;

  public onSetProduction: ((city: City, type: 'unit' | 'building', id: string) => void) | null = null;
  public onSetResearch: ((techId: string) => void) | null = null;

  constructor() {
    this.goldDisplay = document.getElementById('gold-display')!;
    this.scienceDisplay = document.getElementById('science-display')!;
    this.turnDisplay = document.getElementById('turn-display')!;
    this.playerName = document.getElementById('player-name')!;
    this.infoPanel = document.getElementById('info-panel')!;
    this.infoTitle = document.getElementById('info-title')!;
    this.infoContent = document.getElementById('info-content')!;
    this.infoActions = document.getElementById('info-actions')!;
    this.techPanel = document.getElementById('tech-panel')!;
    this.techList = document.getElementById('tech-list')!;
    this.notification = document.getElementById('notification')!;
    this.endTurnBtn = document.getElementById('end-turn-btn')!;
  }

  public updateHUD(state: GameState): void {
    const player = state.players[state.currentPlayer];

    this.goldDisplay.textContent = `Gold: ${player.gold}`;
    this.scienceDisplay.textContent = `Science: ${player.science}`;
    this.turnDisplay.textContent = `Turn: ${state.turn}`;
    this.playerName.textContent = player.name;

    // Update end turn button
    const hasMovableUnits = state.units.some(
      u => u.owner === state.currentPlayer && u.movementLeft > 0
    );
    this.endTurnBtn.style.background = hasMovableUnits ? '#ff9800' : '#4caf50';
  }

  public showUnitInfo(unit: Unit | null, state: GameState): void {
    if (!unit) {
      this.infoPanel.classList.add('hidden');
      return;
    }

    const stats = UNIT_STATS[unit.type];
    const owner = state.players[unit.owner];
    const isOwnUnit = unit.owner === state.currentPlayer;

    this.infoPanel.classList.remove('hidden');
    this.infoTitle.textContent = stats.name;
    this.infoTitle.style.color = owner.color;

    this.infoContent.innerHTML = `
      <div class="stat"><span>Owner:</span><span>${owner.name}</span></div>
      <div class="stat"><span>Health:</span><span>${unit.health}/${unit.maxHealth}</span></div>
      <div class="stat"><span>Attack:</span><span>${stats.attack}</span></div>
      <div class="stat"><span>Defense:</span><span>${stats.defense}</span></div>
      <div class="stat"><span>Movement:</span><span>${unit.movementLeft}/${stats.movement}</span></div>
      ${unit.fortified ? '<div class="stat"><span>Status:</span><span>Fortified</span></div>' : ''}
    `;

    this.infoActions.innerHTML = '';
    if (isOwnUnit) {
      if (unit.movementLeft > 0) {
        const moveBtn = document.createElement('button');
        moveBtn.textContent = 'Move (M)';
        moveBtn.onclick = () => {
          state.moveMode = true;
          this.showNotification('Click a tile to move');
        };
        this.infoActions.appendChild(moveBtn);
      }

      if (unit.type === UnitType.Settler) {
        const buildBtn = document.createElement('button');
        buildBtn.textContent = 'Found City (B)';
        buildBtn.onclick = () => {
          const event = new KeyboardEvent('keydown', { code: 'KeyB' });
          window.dispatchEvent(event);
        };
        this.infoActions.appendChild(buildBtn);
      }

      if (!unit.fortified) {
        const fortifyBtn = document.createElement('button');
        fortifyBtn.textContent = 'Fortify (F)';
        fortifyBtn.onclick = () => {
          unit.fortified = true;
          unit.movementLeft = 0;
          this.showUnitInfo(unit, state);
        };
        this.infoActions.appendChild(fortifyBtn);
      }
    }
  }

  public showCityInfo(city: City | null, state: GameState): void {
    if (!city) {
      this.infoPanel.classList.add('hidden');
      return;
    }

    const owner = state.players[city.owner];
    const isOwnCity = city.owner === state.currentPlayer;
    const yields = getCityYields(state, city);
    const player = state.players[city.owner];

    this.infoPanel.classList.remove('hidden');
    this.infoTitle.textContent = city.name;
    this.infoTitle.style.color = owner.color;

    let productionText = 'None';
    let productionProgress = '';
    if (city.currentProduction) {
      if (city.currentProduction.type === 'unit') {
        const unitStats = UNIT_STATS[city.currentProduction.id as UnitType];
        productionText = unitStats.name;
        productionProgress = ` (${city.productionProgress}/${unitStats.cost})`;
      } else {
        const building = BUILDINGS[city.currentProduction.id];
        productionText = building.name;
        productionProgress = ` (${city.productionProgress}/${building.cost})`;
      }
    }

    this.infoContent.innerHTML = `
      <div class="stat"><span>Population:</span><span>${city.population}</span></div>
      <div class="stat"><span>Food:</span><span>${city.food}/${city.foodNeeded} (+${yields.food - city.population * 2})</span></div>
      <div class="stat"><span>Production:</span><span>+${yields.production}/turn</span></div>
      <div class="stat"><span>Gold:</span><span>+${yields.gold}/turn</span></div>
      <div class="stat"><span>Science:</span><span>+${yields.science}/turn</span></div>
      <div class="stat"><span>Buildings:</span><span>${city.buildings.length > 0 ? city.buildings.map(b => BUILDINGS[b].name).join(', ') : 'None'}</span></div>
      <hr style="border-color: #444; margin: 8px 0;">
      <div class="stat"><span>Building:</span><span>${productionText}${productionProgress}</span></div>
    `;

    this.infoActions.innerHTML = '';
    if (isOwnCity) {
      // Production options
      const prodLabel = document.createElement('div');
      prodLabel.style.width = '100%';
      prodLabel.style.marginBottom = '5px';
      prodLabel.textContent = 'Build:';
      this.infoActions.appendChild(prodLabel);

      // Available units
      Object.values(UNIT_STATS).forEach((unitStats) => {
        // Check tech requirement
        if (unitStats.requiredTech && !player.researchedTechs.includes(unitStats.requiredTech)) {
          return;
        }

        const btn = document.createElement('button');
        btn.textContent = `${unitStats.name} (${unitStats.cost})`;
        btn.style.fontSize = '0.75rem';
        btn.style.padding = '4px 8px';
        btn.onclick = () => {
          if (this.onSetProduction) {
            this.onSetProduction(city, 'unit', unitStats.type);
            this.showCityInfo(city, state);
          }
        };
        this.infoActions.appendChild(btn);
      });

      // Available buildings
      Object.values(BUILDINGS).forEach(building => {
        if (city.buildings.includes(building.id)) return;

        const btn = document.createElement('button');
        btn.textContent = `${building.name} (${building.cost})`;
        btn.style.fontSize = '0.75rem';
        btn.style.padding = '4px 8px';
        btn.onclick = () => {
          if (this.onSetProduction) {
            this.onSetProduction(city, 'building', building.id);
            this.showCityInfo(city, state);
          }
        };
        this.infoActions.appendChild(btn);
      });
    }
  }

  public showTechPanel(player: Player): void {
    this.techPanel.classList.toggle('hidden');
    if (this.techPanel.classList.contains('hidden')) return;

    this.techList.innerHTML = '';

    // Group techs
    const allTechs = Object.values(TECHNOLOGIES);

    allTechs.forEach(tech => {
      const div = document.createElement('div');
      div.className = 'tech-item';

      const isResearched = player.researchedTechs.includes(tech.id);
      const isCurrent = player.currentResearch === tech.id;
      const canResearch = !isResearched && tech.requires.every(req => player.researchedTechs.includes(req));

      if (isResearched) {
        div.classList.add('researched');
      } else if (isCurrent) {
        div.classList.add('current');
      } else if (!canResearch) {
        div.classList.add('locked');
      }

      div.innerHTML = `
        <div class="tech-name">${tech.name}</div>
        <div class="tech-cost">${isResearched ? 'Researched' : isCurrent ? `${player.researchProgress}/${tech.cost}` : `Cost: ${tech.cost}`}</div>
        ${tech.requires.length > 0 ? `<div class="tech-cost">Requires: ${tech.requires.map(r => TECHNOLOGIES[r].name).join(', ')}</div>` : ''}
      `;

      if (canResearch && !isResearched) {
        div.onclick = () => {
          if (this.onSetResearch) {
            this.onSetResearch(tech.id);
            this.showTechPanel(player);
          }
        };
      }

      this.techList.appendChild(div);
    });
  }

  public hideTechPanel(): void {
    this.techPanel.classList.add('hidden');
  }

  public showNotification(message: string): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notification.textContent = message;
    this.notification.classList.remove('hidden');

    this.notificationTimeout = window.setTimeout(() => {
      this.notification.classList.add('hidden');
    }, 3000);
  }
}

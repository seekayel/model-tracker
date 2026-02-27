import './style.css';
import { GameState, City } from './types';
import {
  createInitialGameState,
  processPlayerTurn,
  runAITurn,
  checkVictory,
  updateVisibility
} from './gameState';
import { Renderer } from './renderer';
import { InputHandler } from './input';
import { UIManager } from './ui';

class Game {
  private state: GameState | null = null;
  private renderer: Renderer | null = null;
  private input: InputHandler | null = null;
  private ui: UIManager | null = null;
  private animationId: number = 0;

  // Screen elements
  private startScreen: HTMLElement;
  private gameScreen: HTMLElement;
  private victoryScreen: HTMLElement;

  constructor() {
    this.startScreen = document.getElementById('start-screen')!;
    this.gameScreen = document.getElementById('game-screen')!;
    this.victoryScreen = document.getElementById('victory-screen')!;

    // Setup start button
    document.getElementById('start-btn')!.onclick = () => this.startGame();
    document.getElementById('restart-btn')!.onclick = () => this.startGame();
    document.getElementById('end-turn-btn')!.onclick = () => this.endTurn();
  }

  private startGame(): void {
    // Hide other screens
    this.startScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.gameScreen.classList.remove('hidden');

    // Create game state
    this.state = createInitialGameState();

    // Initialize renderer
    this.renderer = new Renderer();

    // Initialize UI
    this.ui = new UIManager();
    this.ui.onSetProduction = (city: City, type: 'unit' | 'building', id: string) => {
      if (!this.state) return;
      city.currentProduction = { type, id };
      city.productionProgress = 0;
    };
    this.ui.onSetResearch = (techId: string) => {
      if (!this.state) return;
      const player = this.state.players[this.state.currentPlayer];
      player.currentResearch = techId;
      player.researchProgress = 0;
      this.ui?.hideTechPanel();
      this.ui?.showNotification(`Researching ${techId}`);
    };

    // Initialize input handler
    this.input = new InputHandler(this.renderer, {
      onEndTurn: () => this.endTurn(),
      onShowTechPanel: () => this.toggleTechPanel(),
      onUnitSelected: (unit) => this.ui?.showUnitInfo(unit, this.state!),
      onCitySelected: (city) => this.ui?.showCityInfo(city, this.state!),
      onNotification: (msg) => this.ui?.showNotification(msg)
    });
    this.input.setGameState(this.state);

    // Center camera on first unit
    if (this.state.units.length > 0) {
      const firstUnit = this.state.units.find(u => u.owner === 0);
      if (firstUnit) {
        this.renderer.centerOn(firstUnit.x, firstUnit.y);
      }
    }

    // Initial visibility update
    updateVisibility(this.state);

    // Start game loop
    this.gameLoop();

    // Show initial notification
    this.ui.showNotification('Found a city with your Settler (B key)!');
  }

  private gameLoop(): void {
    if (!this.state || !this.renderer || !this.input || !this.ui) return;

    // Update input
    this.input.update();

    // Update UI
    this.ui.updateHUD(this.state);

    // Render
    this.renderer.render(this.state);

    // Check victory
    const winner = checkVictory(this.state);
    if (winner !== null && !this.state.gameOver) {
      this.state.gameOver = true;
      this.state.winner = winner;
      this.showVictoryScreen(winner);
      return;
    }

    // Continue loop
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private endTurn(): void {
    if (!this.state || this.state.gameOver) return;

    // Process human player's turn end
    processPlayerTurn(this.state, this.state.currentPlayer);

    // Process AI turns
    for (let i = 1; i < this.state.players.length; i++) {
      runAITurn(this.state, i);
      processPlayerTurn(this.state, i);
    }

    // Update visibility after all moves
    updateVisibility(this.state);

    // Next turn
    this.state.turn++;

    // Check for units that need orders
    const unitsNeedingOrders = this.state.units.filter(
      u => u.owner === 0 && u.movementLeft > 0
    );

    if (unitsNeedingOrders.length > 0 && !this.state.selectedUnit) {
      // Select first unit needing orders
      this.state.selectedUnit = unitsNeedingOrders[0];
      this.renderer?.centerOn(unitsNeedingOrders[0].x, unitsNeedingOrders[0].y);
      this.ui?.showUnitInfo(unitsNeedingOrders[0], this.state);
    }

    this.ui?.showNotification(`Turn ${this.state.turn}`);
  }

  private toggleTechPanel(): void {
    if (!this.state || !this.ui) return;
    const player = this.state.players[this.state.currentPlayer];
    this.ui.showTechPanel(player);
  }

  private showVictoryScreen(winnerId: number): void {
    cancelAnimationFrame(this.animationId);

    const winner = this.state?.players[winnerId];
    if (!winner) return;

    const title = document.getElementById('victory-title')!;
    const message = document.getElementById('victory-message')!;

    if (winner.isHuman) {
      title.textContent = 'Victory!';
      title.style.color = '#ffd700';
      message.textContent = `Congratulations! Your empire has achieved dominance after ${this.state?.turn} turns. You have proven yourself a worthy leader!`;
    } else {
      title.textContent = 'Defeat';
      title.style.color = '#e94560';
      message.textContent = `The ${winner.name} has conquered the world. Your civilization has fallen after ${this.state?.turn} turns.`;
    }

    this.gameScreen.classList.add('hidden');
    this.victoryScreen.classList.remove('hidden');
  }
}

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});

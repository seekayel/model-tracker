import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private turnText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private selectedUnitText!: Phaser.GameObjects.Text;
  private turn = 1;
  private score = 0;

  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    this.turnText = this.add.text(10, 10, `Turn: ${this.turn}`, {
      font: '24px monospace',
      color: '#ffffff',
      backgroundColor: '#000000'
    });
    this.scoreText = this.add.text(10, 40, `Score: ${this.score}`, {
      font: '24px monospace',
      color: '#ffffff',
      backgroundColor: '#000000'
    });
    this.selectedUnitText = this.add.text(10, 70, 'Selected: None', {
      font: '18px monospace',
      color: '#ffffff',
      backgroundColor: '#000000'
    });

    const endTurnButton = this.add.text(this.cameras.main.width - 150, 10, 'End Turn (Space)', {
      font: '20px monospace',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    const gameScene = this.scene.get('GameScene');

    endTurnButton.on('pointerdown', () => {
      gameScene.input.keyboard!.emit('keydown-SPACE');
    });

    gameScene.events.on('nextTurn', () => {
      this.turn++;
      this.updateTurnText();
    }, this);
    
    gameScene.events.on('updateUI', this.updateUI, this);
  }

  private updateTurnText() {
    this.turnText.setText(`Turn: ${this.turn}`);
  }

  private updateScoreText() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  private updateSelectedUnitText() {
    const gameScene = this.scene.get('GameScene') as any;
    const selectedUnit = gameScene.selectedUnit;
    if (selectedUnit) {
      this.selectedUnitText.setText(`Selected: ${selectedUnit.unitType} (${selectedUnit.movementPoints}/${selectedUnit.maxMovementPoints} MP)`);
    } else {
      this.selectedUnitText.setText('Selected: None');
    }
  }

  private updateUI() {
    const gameScene = this.scene.get('GameScene') as any;
    this.score = gameScene.worldMap.getCityCount() * 100;
    this.updateTurnText();
    this.updateScoreText();
    this.updateSelectedUnitText();
  }
}

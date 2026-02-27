import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'CivClone', {
      font: '64px monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'Click to Start', {
      font: '32px monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }
}

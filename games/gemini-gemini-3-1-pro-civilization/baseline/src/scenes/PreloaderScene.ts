import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  preload() {
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Loading...', {
      font: '32px monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    // In a real game, you would load assets here
    // this.load.image('player', 'assets/player.png');
  }

  create() {
    this.scene.start('StartScene');
  }
}

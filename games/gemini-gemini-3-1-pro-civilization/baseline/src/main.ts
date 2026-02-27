import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import PreloaderScene from './scenes/PreloaderScene';
import StartScene from './scenes/StartScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: [PreloaderScene, StartScene, GameScene, UIScene],
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

new Phaser.Game(config);

import Phaser from 'phaser';

export type TerrainType = 'grass' | 'water' | 'mountain';

export default class Tile {
  public x: number;
  public y: number;
  public terrain: TerrainType;
  public gameObject: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, size: number, terrain: TerrainType) {
    this.x = x;
    this.y = y;
    this.terrain = terrain;

    const colors: Record<TerrainType, number> = {
      grass: 0x228B22,
      water: 0x1E90FF,
      mountain: 0x8B4513,
    };

    this.gameObject = scene.add.rectangle(x * size + size / 2, y * size + size / 2, size, size, colors[terrain]);
    this.gameObject.setStrokeStyle(1, 0xcccccc, 0.5);
  }
}

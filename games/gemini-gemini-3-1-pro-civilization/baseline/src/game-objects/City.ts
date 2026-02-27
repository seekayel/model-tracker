import Phaser from 'phaser';

export default class City extends Phaser.GameObjects.Rectangle {
    public tileX: number;
    public tileY: number;

    constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
        const tileSize = 32;
        super(scene, tileX * tileSize + tileSize / 2, tileY * tileSize + tileSize / 2, tileSize, tileSize, 0xffffff);

        this.tileX = tileX;
        this.tileY = tileY;
        scene.add.existing(this);
    }
}

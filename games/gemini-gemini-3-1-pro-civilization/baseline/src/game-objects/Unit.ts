import Phaser from 'phaser';

export type UnitType = 'settler' | 'warrior';

export default class Unit extends Phaser.GameObjects.Triangle {
  public tileX: number;
  public tileY: number;
  public unitType: UnitType;
  public movementPoints: number;
  public maxMovementPoints: number;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number, unitType: UnitType) {
    super(scene, 0, 0, 0, 32, 16, 0, 32, 32, 0x00ff00);
    this.unitType = unitType;
    this.tileX = tileX;
    this.tileY = tileY;
    
    if(unitType === 'settler') {
        this.maxMovementPoints = 2;
    } else {
        this.maxMovementPoints = 3;
    }
    this.movementPoints = this.maxMovementPoints;

    this.setTilePosition(tileX, tileY);
    scene.add.existing(this);
  }

  setTilePosition(tileX: number, tileY: number) {
    this.tileX = tileX;
    this.tileY = tileY;
    const tileSize = 32;
    this.setPosition(tileX * tileSize + tileSize / 2, tileY * tileSize + tileSize / 2);
  }

  canMove(): boolean {
    return this.movementPoints > 0;
  }
  
  resetMovement() {
      this.movementPoints = this.maxMovementPoints;
  }
}

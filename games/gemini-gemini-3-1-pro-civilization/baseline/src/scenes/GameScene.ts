import Phaser from 'phaser';
import WorldMap from '../world/WorldMap';
import Unit from '../game-objects/Unit';

export default class GameScene extends Phaser.Scene {
  private worldMap!: WorldMap;
  private selectedUnit: Unit | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('GameScene');
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.worldMap = new WorldMap(this, 50, 50, 32);

    const initialPlayerUnit = new Unit(this, 10, 10, 'settler');
    this.worldMap.addUnit(initialPlayerUnit);
    this.selectUnit(initialPlayerUnit);

    this.cameras.main.setBounds(0, 0, this.worldMap.widthInPixels, this.worldMap.heightInPixels);
    this.cameras.main.centerOn(initialPlayerUnit.x, initialPlayerUnit.y);

    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.keyboard!.on('keydown-SPACE', this.endTurn, this);
    this.input.keyboard!.on('keydown-B', this.foundCity, this);
  }

  update(_time: number, delta: number) {
    this.handleCameraPan(delta);
    if (this.selectedUnit) {
      // Unit selection marker
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / this.worldMap.tileWidth);
    const tileY = Math.floor(worldPoint.y / this.worldMap.tileHeight);

    const unit = this.worldMap.getUnitAt(tileX, tileY);
    if (unit) {
      this.selectUnit(unit);
    } else {
      if (this.selectedUnit) {
        this.moveSelectedUnit(tileX, tileY);
      }
    }
  }

  private moveSelectedUnit(tileX: number, tileY: number) {
    if (!this.selectedUnit || !this.selectedUnit.canMove()) return;

    this.worldMap.moveUnit(this.selectedUnit, tileX, tileY);
    this.events.emit('updateUI');
  }
  
  private selectUnit(unit: Unit) {
    this.selectedUnit = unit;
    this.events.emit('updateUI');
  }

  private endTurn() {
    this.worldMap.getAllUnits().forEach(unit => unit.resetMovement());
    this.events.emit('nextTurn');
    this.events.emit('updateUI');
  }

  private foundCity() {
      if(this.selectedUnit && this.selectedUnit.unitType === 'settler') {
          this.worldMap.addCity(this.selectedUnit.tileX, this.selectedUnit.tileY);
          this.selectedUnit.destroy();
          this.selectedUnit = null;
          this.events.emit('updateUI');
      }
  }

  private handleCameraPan(delta: number) {
    const speed = 400;
    if (this.cursors.left.isDown) {
      this.cameras.main.scrollX -= speed * (delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.cameras.main.scrollX += speed * (delta / 1000);
    }

    if (this.cursors.up.isDown) {
      this.cameras.main.scrollY -= speed * (delta / 1000);
    } else if (this.cursors.down.isDown) {
      this.cameras.main.scrollY += speed * (delta / 1000);
    }
  }
}

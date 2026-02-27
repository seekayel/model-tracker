import Phaser from 'phaser';
import Tile, { TerrainType } from './Tile';
import Unit from '../game-objects/Unit';
import City from '../game-objects/City';

export default class WorldMap {
  private scene: Phaser.Scene;
  private tiles: Tile[][] = [];
  private units: Unit[] = [];
  private cities: City[] = [];
  public mapWidth: number;
  public mapHeight: number;
  public tileWidth: number;
  public tileHeight: number;

  constructor(scene: Phaser.Scene, width: number, height: number, tileSize: number) {
    this.scene = scene;
    this.mapWidth = width;
    this.mapHeight = height;
    this.tileWidth = tileSize;
    this.tileHeight = tileSize;

    for (let y = 0; y < height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < width; x++) {
        this.tiles[y][x] = new Tile(scene, x, y, tileSize, this.getRandomTerrain());
      }
    }
  }

  private getRandomTerrain(): TerrainType {
    const rand = Math.random();
    if (rand < 0.7) return 'grass';
    if (rand < 0.9) return 'water';
    return 'mountain';
  }

  public addUnit(unit: Unit) {
    this.units.push(unit);
    unit.setTilePosition(unit.tileX, unit.tileY);
  }

  public getUnitAt(tileX: number, tileY: number): Unit | null {
    return this.units.find(unit => unit.tileX === tileX && unit.tileY === tileY) || null;
  }
  
  public moveUnit(unit: Unit, tileX: number, tileY: number) {
    const targetTile = this.tiles[tileY][tileX];
    if (targetTile.terrain === 'water' || targetTile.terrain === 'mountain') return;
    
    const distance = Math.abs(tileX - unit.tileX) + Math.abs(tileY - unit.tileY);
    if(distance > unit.movementPoints) return;

    unit.movementPoints -= distance;
    unit.setTilePosition(tileX, tileY);
  }

  public addCity(tileX: number, tileY: number) {
    const city = new City(this.scene, tileX, tileY);
    this.cities.push(city);
  }

  public getCityCount(): number {
    return this.cities.length;
  }

  public getAllUnits(): Unit[] {
    return this.units;
  }

  get widthInPixels(): number {
    return this.mapWidth * this.tileWidth;
  }

  get heightInPixels(): number {
    return this.mapHeight * this.tileHeight;
  }
}

export class Input {
  constructor() {
    this._keys = {};
    this._justPressed = {};

    window.addEventListener('keydown', (e) => {
      if (!this._keys[e.code]) this._justPressed[e.code] = true;
      this._keys[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this._keys[e.code] = false;
    });
  }

  /** Call once per frame after processing input */
  endFrame() {
    this._justPressed = {};
  }

  isDown(code) { return !!this._keys[code]; }
  wasPressed(code) { return !!this._justPressed[code]; }

  get left()        { return this.isDown('ArrowLeft')  || this.isDown('KeyA'); }
  get right()       { return this.isDown('ArrowRight') || this.isDown('KeyD'); }
  get jump()        { return this.isDown('ArrowUp') || this.isDown('Space') || this.isDown('KeyW'); }
  get run()         { return this.isDown('ShiftLeft') || this.isDown('ShiftRight') || this.isDown('KeyX') || this.isDown('KeyZ'); }
  get jumpPressed() { return this.wasPressed('ArrowUp') || this.wasPressed('Space') || this.wasPressed('KeyW'); }
  get start()       { return this.wasPressed('Enter') || this.wasPressed('Space'); }
}

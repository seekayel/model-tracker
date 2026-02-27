export class Input {
  constructor() {
    this.keys = {};
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(e) {
    this.keys[e.code] = true;
    // Prevent arrow keys from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
  }

  isDown(code) {
    return !!this.keys[code];
  }

  isAnyDown(...codes) {
    return codes.some(c => this.isDown(c));
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}

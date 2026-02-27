export class InputHandler {
  constructor() {
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      Space: false,
      Enter: false
    };

    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
      } else if (e.key === ' ') {
         this.keys.Space = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = false;
      } else if (e.key === ' ') {
         this.keys.Space = false;
      }
    });
  }

  isDown(key) {
    return this.keys[key];
  }
}
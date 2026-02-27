export class InputManager {
  private keys: Set<string> = new Set();
  private justPressed: Set<string> = new Set();
  private justReleased: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
      // Prevent scrolling with arrow/space keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.justReleased.add(e.code);
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  wasPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  clearFrame(): void {
    this.justPressed.clear();
    this.justReleased.clear();
  }
}

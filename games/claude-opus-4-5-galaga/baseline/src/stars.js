import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants.js';

export class Stars {
  constructor() {
    this.stars = [];
    this.numStars = 100;
    this.init();
  }

  init() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.createStar());
    }
  }

  createStar(startAtTop = false) {
    return {
      x: Math.random() * CANVAS_WIDTH,
      y: startAtTop ? 0 : Math.random() * CANVAS_HEIGHT,
      speed: 0.5 + Math.random() * 2,
      size: Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7
    };
  }

  update() {
    this.stars.forEach(star => {
      star.y += star.speed;

      // Wrap around
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }

      // Twinkle effect
      star.brightness += (Math.random() - 0.5) * 0.1;
      star.brightness = Math.max(0.2, Math.min(1, star.brightness));
    });
  }

  draw(ctx) {
    this.stars.forEach(star => {
      ctx.globalAlpha = star.brightness;
      ctx.fillStyle = COLORS.star;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
  }
}

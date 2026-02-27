import { COLORS } from './constants.js';

export class Explosion {
  constructor(x, y, size = 'normal') {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.active = true;
    this.lifetime = 0;
    this.maxLifetime = size === 'large' ? 45 : 30;

    const numParticles = size === 'large' ? 20 : 12;
    const speed = size === 'large' ? 4 : 3;

    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles + Math.random() * 0.5;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius: 2 + Math.random() * 3,
        colorIndex: Math.floor(Math.random() * COLORS.explosion.length)
      });
    }
  }

  update() {
    this.lifetime++;

    if (this.lifetime >= this.maxLifetime) {
      this.active = false;
      return;
    }

    const progress = this.lifetime / this.maxLifetime;

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.radius *= 0.96;
    });
  }

  draw(ctx) {
    const progress = this.lifetime / this.maxLifetime;
    const alpha = 1 - progress;

    this.particles.forEach(p => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = COLORS.explosion[p.colorIndex];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }
}

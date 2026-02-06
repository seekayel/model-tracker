const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const particles = [];

const colors = ['#6366f1', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981'];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = 4 + Math.random() * 8;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.life = 1;
    this.decay = 0.003 + Math.random() * 0.005;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // gravity
    this.life -= this.decay;

    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.vx *= -0.8;
      this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    }
    if (this.y + this.radius > canvas.height) {
      this.vy *= -0.7;
      this.y = canvas.height - this.radius;
    }
  }

  draw() {
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y));
  }
});

function animate() {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();

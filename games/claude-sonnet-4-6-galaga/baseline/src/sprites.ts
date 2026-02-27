// Draw pixel-art sprites using canvas primitives

export function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);

  // Ship body
  ctx.fillStyle = '#00FFFF';
  // Main fuselage
  ctx.fillRect(w / 2 - 3, 2, 6, h - 6);
  // Cockpit
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(w / 2 - 2, 4, 4, 4);
  // Wings
  ctx.fillStyle = '#0088FF';
  ctx.fillRect(0, h - 8, w / 2 - 2, 6);
  ctx.fillRect(w / 2 + 2, h - 8, w / 2 - 2, 6);
  // Wing tips
  ctx.fillStyle = '#FF4400';
  ctx.fillRect(0, h - 4, 4, 4);
  ctx.fillRect(w - 4, h - 4, 4, 4);
  // Engine glow
  ctx.fillStyle = '#FFAA00';
  ctx.fillRect(w / 2 - 3, h - 4, 6, 4);

  ctx.restore();
}

export function drawBee(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  ctx.translate(x, y);

  // Body
  ctx.fillStyle = '#FFFF00';
  ctx.fillRect(w / 2 - 4, 2, 8, h - 4);
  // Head
  ctx.fillStyle = '#FF8800';
  ctx.fillRect(w / 2 - 3, 0, 6, 5);
  // Eyes
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(w / 2 - 3, 1, 2, 2);
  ctx.fillRect(w / 2 + 1, 1, 2, 2);
  // Wings
  ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
  ctx.fillRect(1, 4, w / 2 - 5, 6);
  ctx.fillRect(w / 2 + 4, 4, w / 2 - 5, 6);
  // Stripes
  ctx.fillStyle = '#222200';
  ctx.fillRect(w / 2 - 4, 8, 8, 2);
  ctx.fillRect(w / 2 - 4, 12, 8, 2);

  ctx.restore();
}

export function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  ctx.translate(x, y);

  // Body
  ctx.fillStyle = '#FF00FF';
  ctx.fillRect(w / 2 - 3, 2, 6, h - 4);
  // Upper wings
  ctx.fillStyle = '#8800FF';
  ctx.fillRect(1, 2, w / 2 - 4, 7);
  ctx.fillRect(w / 2 + 3, 2, w / 2 - 4, 7);
  // Lower wings
  ctx.fillStyle = '#FF44FF';
  ctx.fillRect(3, 10, w / 2 - 6, 5);
  ctx.fillRect(w / 2 + 3, 10, w / 2 - 6, 5);
  // Wing details
  ctx.fillStyle = '#FFAAFF';
  ctx.fillRect(3, 3, 3, 3);
  ctx.fillRect(w - 6, 3, 3, 3);
  // Antennae
  ctx.fillStyle = '#FF88FF';
  ctx.fillRect(w / 2 - 3, 0, 1, 3);
  ctx.fillRect(w / 2 + 2, 0, 1, 3);

  ctx.restore();
}

export function drawBoss(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  ctx.translate(x, y);

  // Large body
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(w / 2 - 6, 2, 12, h - 4);
  // Core
  ctx.fillStyle = '#FF8800';
  ctx.fillRect(w / 2 - 4, 5, 8, 8);
  // Eyes (dual)
  ctx.fillStyle = '#FFFF00';
  ctx.fillRect(w / 2 - 5, 6, 3, 3);
  ctx.fillRect(w / 2 + 2, 6, 3, 3);
  // Wings
  ctx.fillStyle = '#880000';
  ctx.fillRect(1, 3, w / 2 - 7, 10);
  ctx.fillRect(w / 2 + 6, 3, w / 2 - 7, 10);
  // Wing dots
  ctx.fillStyle = '#FF4400';
  ctx.fillRect(3, 5, 3, 3);
  ctx.fillRect(w - 6, 5, 3, 3);
  // Crown
  ctx.fillStyle = '#FFFF00';
  ctx.fillRect(w / 2 - 6, 0, 3, 3);
  ctx.fillRect(w / 2 - 1, 0, 3, 3);
  ctx.fillRect(w / 2 + 4, 0, 3, 3);

  ctx.restore();
}

export function drawBullet(ctx: CanvasRenderingContext2D, x: number, y: number, fromPlayer: boolean): void {
  ctx.save();
  if (fromPlayer) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 1.5, y - 4, 3, 8);
    ctx.fillStyle = '#AAFFAA';
    ctx.fillRect(x - 0.5, y - 5, 1, 2);
  } else {
    // Enemy bullet - red elongated
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(x - 2, y - 3, 4, 6);
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(x - 1, y - 4, 2, 2);
  }
  ctx.restore();
}

export function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, brightness: number): void {
  const alpha = brightness * 0.8 + 0.2;
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  const size = brightness > 0.7 ? 2 : 1;
  ctx.fillRect(x, y, size, size);
}

export function drawExplosion(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, maxFrames: number): void {
  const progress = frame / maxFrames;
  const radius = progress * 20;
  const alpha = 1 - progress;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Outer ring
  ctx.strokeStyle = '#FF8800';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner sparks
  const numSparks = 8;
  for (let i = 0; i < numSparks; i++) {
    const angle = (i / numSparks) * Math.PI * 2;
    const sparkLen = radius * 0.6;
    const sx = x + Math.cos(angle) * sparkLen;
    const sy = y + Math.sin(angle) * sparkLen;
    ctx.fillStyle = progress < 0.3 ? '#FFFFFF' : progress < 0.6 ? '#FFFF00' : '#FF4400';
    ctx.fillRect(sx - 1, sy - 1, 3, 3);
  }

  // Center flash
  if (progress < 0.3) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 4, y - 4, 8, 8);
  }

  ctx.restore();
}

export function drawCaptureBeam(ctx: CanvasRenderingContext2D, bx: number, by: number, bh: number, timer: number): void {
  const alpha = 0.4 + Math.sin(timer * 0.3) * 0.3;
  ctx.save();
  ctx.globalAlpha = alpha;

  const gradient = ctx.createLinearGradient(bx, by + bh, bx, by + bh + 80);
  gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(bx - 12, by + bh);
  ctx.lineTo(bx + 12, by + bh);
  ctx.lineTo(bx + 30, by + bh + 80);
  ctx.lineTo(bx - 30, by + bh + 80);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

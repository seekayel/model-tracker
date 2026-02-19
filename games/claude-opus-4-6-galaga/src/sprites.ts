// ── Pixel-art sprite definitions drawn procedurally ──
// Each sprite is rendered once to an offscreen canvas, then blitted during gameplay.

const cache = new Map<string, HTMLCanvasElement>();

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return [c, ctx];
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, s = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x * s, y * s, s, s);
}

// Mirror an array of pixel rows (each row is [x, y, color])
function mirrorX(pixels: [number, number, string][], w: number): [number, number, string][] {
  const out = [...pixels];
  for (const [x, y, c] of pixels) {
    const mx = w - 1 - x;
    if (mx !== x) out.push([mx, y, c]);
  }
  return out;
}

export function getPlayerSprite(): HTMLCanvasElement {
  if (cache.has("player")) return cache.get("player")!;
  const S = 3; // scale
  const W = 15, H = 15;
  const [c, ctx] = createCanvas(W * S, H * S);

  // Galaga-style fighter: white/blue/red ship
  const half: [number, number, string][] = [
    // Nose
    [7, 0, "#fff"], [7, 1, "#fff"], [7, 2, "#5cf"],
    // Upper body
    [6, 3, "#5cf"], [7, 3, "#5cf"],
    [5, 4, "#5cf"], [6, 4, "#09f"], [7, 4, "#09f"],
    [5, 5, "#09f"], [6, 5, "#09f"], [7, 5, "#09f"],
    // Mid body
    [4, 6, "#09f"], [5, 6, "#09f"], [6, 6, "#09f"], [7, 6, "#09f"],
    [3, 7, "#09f"], [4, 7, "#07c"], [5, 7, "#07c"], [6, 7, "#07c"], [7, 7, "#07c"],
    // Wings spreading
    [2, 8, "#07c"], [3, 8, "#07c"], [4, 8, "#07c"], [5, 8, "#07c"], [6, 8, "#07c"], [7, 8, "#07c"],
    [1, 9, "#f55"], [2, 9, "#07c"], [3, 9, "#07c"], [4, 9, "#07c"], [5, 9, "#07c"], [6, 9, "#07c"], [7, 9, "#07c"],
    [0, 10, "#f55"], [1, 10, "#f55"], [2, 10, "#07c"], [3, 10, "#07c"], [4, 10, "#07c"], [5, 10, "#07c"], [6, 10, "#07c"], [7, 10, "#07c"],
    // Engine
    [1, 11, "#f55"], [2, 11, "#07c"], [3, 11, "#07c"], [4, 11, "#ff0"], [5, 11, "#ff0"], [6, 11, "#07c"], [7, 11, "#07c"],
    [2, 12, "#07c"], [3, 12, "#ff0"], [4, 12, "#f80"], [5, 12, "#f80"], [6, 12, "#ff0"], [7, 12, "#07c"],
    [5, 13, "#f80"], [6, 13, "#f55"], [7, 13, "#f55"],
    [6, 14, "#f33"], [7, 14, "#f33"],
  ];

  const pixels = mirrorX(half, W);
  for (const [x, y, color] of pixels) {
    px(ctx, x, y, color, S);
  }
  cache.set("player", c);
  return c;
}

export function getBeeSprite(): HTMLCanvasElement {
  if (cache.has("bee")) return cache.get("bee")!;
  const S = 3;
  const W = 13, H = 11;
  const [c, ctx] = createCanvas(W * S, H * S);

  const half: [number, number, string][] = [
    // Antennae
    [4, 0, "#ff0"], [5, 1, "#ff0"],
    // Head
    [5, 2, "#ff0"], [6, 2, "#ff0"],
    [4, 3, "#ff0"], [5, 3, "#fa0"], [6, 3, "#fa0"],
    // Body
    [3, 4, "#ff0"], [4, 4, "#fa0"], [5, 4, "#fa0"], [6, 4, "#fa0"],
    [3, 5, "#ff0"], [4, 5, "#fa0"], [5, 5, "#ff0"], [6, 5, "#fa0"],
    [3, 6, "#ff0"], [4, 6, "#fa0"], [5, 6, "#fa0"], [6, 6, "#fa0"],
    // Wings
    [0, 4, "#8cf"], [1, 4, "#8cf"], [2, 5, "#8cf"],
    [0, 5, "#8cf"], [1, 5, "#8cf"],
    [0, 6, "#8cf"], [1, 6, "#8cf"], [2, 6, "#8cf"],
    // Lower body
    [4, 7, "#ff0"], [5, 7, "#ff0"], [6, 7, "#ff0"],
    [4, 8, "#ff0"], [5, 8, "#fa0"], [6, 8, "#ff0"],
    // Legs
    [3, 9, "#ff0"], [5, 9, "#ff0"],
    [2, 10, "#ff0"], [6, 10, "#ff0"],
  ];

  const pixels = mirrorX(half, W);
  for (const [x, y, color] of pixels) px(ctx, x, y, color, S);
  cache.set("bee", c);
  return c;
}

export function getButterflySprite(): HTMLCanvasElement {
  if (cache.has("butterfly")) return cache.get("butterfly")!;
  const S = 3;
  const W = 13, H = 11;
  const [c, ctx] = createCanvas(W * S, H * S);

  const half: [number, number, string][] = [
    // Antennae
    [4, 0, "#f55"], [5, 1, "#f55"],
    // Head
    [5, 2, "#f55"], [6, 2, "#f55"],
    [4, 3, "#f55"], [5, 3, "#f88"], [6, 3, "#f88"],
    // Body
    [4, 4, "#f55"], [5, 4, "#f88"], [6, 4, "#f88"],
    [4, 5, "#f55"], [5, 5, "#f55"], [6, 5, "#f88"],
    [4, 6, "#f55"], [5, 6, "#f88"], [6, 6, "#f88"],
    // Wings
    [0, 3, "#f5f"], [1, 3, "#f5f"], [2, 4, "#f5f"], [3, 4, "#f5f"],
    [0, 4, "#f5f"], [1, 4, "#f5f"],
    [0, 5, "#f5f"], [1, 5, "#c3c"], [2, 5, "#c3c"], [3, 5, "#f5f"],
    [0, 6, "#f5f"], [1, 6, "#f5f"], [2, 6, "#f5f"], [3, 6, "#f5f"],
    [1, 7, "#c3c"], [2, 7, "#c3c"], [3, 7, "#f5f"],
    // Lower body
    [5, 7, "#f55"], [6, 7, "#f55"],
    [5, 8, "#f55"], [6, 8, "#f88"],
    // Legs
    [4, 9, "#f55"], [6, 9, "#f55"],
    [3, 10, "#f55"],
  ];

  const pixels = mirrorX(half, W);
  for (const [x, y, color] of pixels) px(ctx, x, y, color, S);
  cache.set("butterfly", c);
  return c;
}

export function getBossSprite(): HTMLCanvasElement {
  if (cache.has("boss")) return cache.get("boss")!;
  const S = 3;
  const W = 15, H = 13;
  const [c, ctx] = createCanvas(W * S, H * S);

  const half: [number, number, string][] = [
    // Horns
    [3, 0, "#0f0"], [4, 1, "#0f0"], [5, 2, "#0f0"],
    // Head top
    [5, 3, "#0f0"], [6, 3, "#0f0"], [7, 3, "#0f0"],
    [4, 4, "#0f0"], [5, 4, "#0a0"], [6, 4, "#0a0"], [7, 4, "#0a0"],
    // Eyes row
    [3, 5, "#0f0"], [4, 5, "#0a0"], [5, 5, "#fff"], [6, 5, "#0a0"], [7, 5, "#0a0"],
    [3, 6, "#0f0"], [4, 6, "#0a0"], [5, 6, "#0a0"], [6, 6, "#0a0"], [7, 6, "#0a0"],
    // Body
    [2, 7, "#0f0"], [3, 7, "#0a0"], [4, 7, "#0a0"], [5, 7, "#0a0"], [6, 7, "#0a0"], [7, 7, "#0a0"],
    [1, 8, "#0f0"], [2, 8, "#0f0"], [3, 8, "#0a0"], [4, 8, "#0a0"], [5, 8, "#0a0"], [6, 8, "#0a0"], [7, 8, "#0a0"],
    // Lower
    [1, 9, "#0f0"], [2, 9, "#0f0"], [3, 9, "#0a0"], [4, 9, "#ff0"], [5, 9, "#0a0"], [6, 9, "#ff0"], [7, 9, "#0a0"],
    [2, 10, "#0f0"], [3, 10, "#0a0"], [4, 10, "#0a0"], [5, 10, "#0a0"], [6, 10, "#0a0"], [7, 10, "#0a0"],
    [3, 11, "#0a0"], [4, 11, "#0a0"], [5, 11, "#0a0"], [6, 11, "#0a0"], [7, 11, "#0a0"],
    // Feet
    [3, 12, "#0f0"], [5, 12, "#0f0"], [7, 12, "#0f0"],
  ];

  const pixels = mirrorX(half, W);
  for (const [x, y, color] of pixels) px(ctx, x, y, color, S);
  cache.set("boss", c);
  return c;
}

// Simple star field
export interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
}

export function createStarfield(count: number, w: number, h: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 0.2 + Math.random() * 0.8,
      brightness: 0.3 + Math.random() * 0.7,
    });
  }
  return stars;
}

export function updateAndDrawStars(ctx: CanvasRenderingContext2D, stars: Star[], dt: number, h: number) {
  for (const s of stars) {
    s.y += s.speed * 60 * dt;
    if (s.y > h) {
      s.y -= h;
      s.x = Math.random() * ctx.canvas.width;
    }
    const a = s.brightness;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
  }
}

// Procedurally generated sprites using canvas
// All sprites are drawn as pixel art at a base resolution then scaled

const spriteCache = {};

function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function drawPixelArt(ctx, data, scale, offsetX = 0, offsetY = 0) {
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      const color = data[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
      }
    }
  }
}

// Color palette
const C = {
  RED: '#e52521',
  DARK_RED: '#ad1510',
  BROWN: '#6b4400',
  SKIN: '#ffa44f',
  DARK_SKIN: '#d07020',
  WHITE: '#ffffff',
  BLACK: '#000000',
  YELLOW: '#ffd700',
  ORANGE: '#ff8c00',
  GREEN: '#00a800',
  DARK_GREEN: '#005800',
  BLUE: '#0058f8',
  LIGHT_BLUE: '#6888ff',
  SKY: '#6888ff',
  BRICK: '#c84c0c',
  BRICK_DARK: '#a03000',
  BRICK_LIGHT: '#e09050',
  GROUND_TOP: '#c84c0c',
  GROUND: '#e09050',
  QUESTION_YELLOW: '#ffa000',
  QUESTION_DARK: '#c87000',
  TAN: '#fcb860',
  PIPE_GREEN: '#00a800',
  PIPE_DARK: '#005800',
  PIPE_LIGHT: '#80d010',
  GOOMBA_BROWN: '#a04000',
  GOOMBA_TAN: '#e09060',
  KOOPA_GREEN: '#00a800',
  KOOPA_DARK: '#005800',
  KOOPA_SHELL: '#40c040',
  FLAG_GREEN: '#00a800',
  CASTLE_GRAY: '#b0b0b0',
  CASTLE_DARK: '#808080',
};

export function getMarioSprite(frame, big, direction, ducking, hasFireFlower) {
  const key = `mario_${frame}_${big}_${direction}_${ducking}_${hasFireFlower}`;
  if (spriteCache[key]) return spriteCache[key];

  const baseColor = hasFireFlower ? '#ffffff' : C.RED;
  const overallColor = hasFireFlower ? C.RED : C.RED;

  if (!big) {
    // Small Mario - 16x16 pixel art scaled to 42x42
    const s = 3;
    const canvas = createCanvas(48, 48);
    const ctx = canvas.getContext('2d');

    // Small Mario pixel data (16x16)
    let data;
    if (frame === 0) {
      // Standing
      data = [
        [0,0,0,0,0, baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0,0,0,0],
        [0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0],
        [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,0,0,0,0,0],
        [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0,0],
        [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0],
        [0,0,0,0,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0,0,0],
        [0,0,0,0,0,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,0,0,0,0],
        [0,0,0,0,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,0,0,0,0,0,0],
        [0,0,0,baseColor,baseColor,baseColor,C.BLUE,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,0,0,0],
        [0,0,baseColor,baseColor,baseColor,baseColor,C.BLUE,C.BLUE,C.BLUE,C.BLUE,baseColor,baseColor,baseColor,baseColor,0,0],
        [0,0,C.SKIN,C.SKIN,baseColor,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,baseColor,C.SKIN,C.SKIN,0,0],
        [0,0,C.SKIN,C.SKIN,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.SKIN,C.SKIN,C.SKIN,0,0],
        [0,0,C.SKIN,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.SKIN,C.SKIN,0,0],
        [0,0,0,0,C.BLUE,C.BLUE,C.BLUE,0,0,C.BLUE,C.BLUE,C.BLUE,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0],
        [0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0],
      ];
    } else if (frame === 1) {
      // Walking frame 1
      data = [
        [0,0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0,0,0,0],
        [0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0],
        [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,0,0,0,0,0],
        [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0,0],
        [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0],
        [0,0,0,0,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0,0,0],
        [0,0,0,0,0,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,0,0,0,0],
        [0,0,0,0,0,baseColor,baseColor,baseColor,C.BLUE,baseColor,0,0,0,0,0,0],
        [0,0,0,0,baseColor,baseColor,baseColor,baseColor,C.BLUE,baseColor,baseColor,0,0,0,0,0],
        [0,0,0,0,baseColor,baseColor,baseColor,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0],
        [0,0,0,0,0,0,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,0,0,0,0,0],
        [0,0,0,0,0,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0],
        [0,0,0,0,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BLUE,C.BLUE,0,0,0,0,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0],
        [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0],
      ];
    } else if (frame === 2) {
      // Walking frame 2
      data = [
        [0,0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0,0,0,0],
        [0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0],
        [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,0,0,0,0,0],
        [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0,0],
        [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0],
        [0,0,0,0,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0,0,0],
        [0,0,0,0,0,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,0,0,0,0],
        [0,0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0,0,0,0],
        [0,0,0,0,C.BLUE,baseColor,baseColor,baseColor,baseColor,baseColor,C.BLUE,0,0,0,0,0],
        [0,0,0,C.BLUE,C.BLUE,C.BLUE,baseColor,baseColor,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0],
        [0,0,0,C.SKIN,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,C.SKIN,0,0,0,0,0],
        [0,0,0,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.SKIN,0,0,0,0,0],
        [0,0,0,0,C.BLUE,C.BLUE,0,0,0,C.BLUE,C.BLUE,0,0,0,0,0],
        [0,0,0,0,C.BROWN,C.BROWN,0,0,0,C.BROWN,C.BROWN,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ];
    } else {
      // Jumping
      data = [
        [0,0,0,0,0,0,C.SKIN,C.SKIN,0,0,0,baseColor,baseColor,baseColor,baseColor,0],
        [0,0,0,0,0,C.SKIN,C.SKIN,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor],
        [0,0,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BLACK,C.SKIN],
        [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN],
        [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK],
        [0,0,0,0,0,0,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.BLACK,C.BLACK,0,0],
        [0,0,baseColor,baseColor,baseColor,baseColor,baseColor,C.BLUE,baseColor,baseColor,0,0,0,0,0,0],
        [baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,C.BLUE,C.BLUE,baseColor,baseColor,baseColor,0,0,0,0,0],
        [C.SKIN,C.SKIN,baseColor,baseColor,baseColor,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,0,0,0,0,0],
        [C.SKIN,C.SKIN,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0],
        [0,0,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0,0],
        [0,0,C.BLUE,C.BLUE,C.BLUE,0,0,C.BLUE,C.BLUE,0,0,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ];
    }

    drawPixelArt(ctx, data, s);

    if (direction === -1) {
      const flipped = createCanvas(48, 48);
      const fctx = flipped.getContext('2d');
      fctx.translate(48, 0);
      fctx.scale(-1, 1);
      fctx.drawImage(canvas, 0, 0);
      spriteCache[key] = flipped;
      return flipped;
    }

    spriteCache[key] = canvas;
    return canvas;
  }

  // Big Mario
  const s = 3;
  const canvas = createCanvas(48, 96);
  const ctx = canvas.getContext('2d');

  if (ducking) {
    // Ducking big Mario - compact version
    const data = [
      [0,0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0,0,0,0],
      [0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0],
      [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,0,0,0,0,0],
      [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0,0],
      [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0],
      [0,0,0,0,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0,0,0],
      [0,0,0,0,0,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,0,0,0,0],
      [0,0,0,baseColor,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,0,0,0,0,0,0],
      [0,0,baseColor,baseColor,baseColor,baseColor,C.BLUE,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,0,0,0],
      [0,baseColor,baseColor,baseColor,baseColor,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,baseColor,baseColor,baseColor,baseColor,0,0],
      [0,C.SKIN,C.SKIN,baseColor,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,baseColor,C.SKIN,C.SKIN,0,0,0],
      [0,C.SKIN,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.SKIN,C.SKIN,0,0,0],
      [0,0,C.BROWN,C.BROWN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BROWN,C.BROWN,0,0,0,0],
      [0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
    drawPixelArt(ctx, data, s, 0, 48);
  } else {
    // Big Mario standing/walking/jumping
    const head = [
      [0,0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0,0,0,0],
      [0,0,0,0,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,baseColor,0,0,0],
      [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,0,0,0,0,0],
      [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0,0],
      [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0],
      [0,0,0,0,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0,0,0],
      [0,0,0,0,0,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,0,0,0,0],
      [0,0,0,0,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,0,0,0,0,0,0],
    ];

    let body;
    if (frame === 0) {
      body = [
        [0,0,0,baseColor,baseColor,baseColor,C.BLUE,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,0,0,0],
        [0,0,baseColor,baseColor,baseColor,baseColor,C.BLUE,C.BLUE,C.BLUE,C.BLUE,baseColor,baseColor,baseColor,baseColor,0,0],
        [0,0,C.SKIN,C.SKIN,baseColor,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,baseColor,C.SKIN,C.SKIN,0,0],
        [0,0,C.SKIN,C.SKIN,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.SKIN,C.SKIN,C.SKIN,0,0],
        [0,0,C.SKIN,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.SKIN,C.SKIN,0,0],
        [0,0,0,0,C.BLUE,C.BLUE,C.BLUE,0,0,C.BLUE,C.BLUE,C.BLUE,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0],
        [0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0],
      ];
    } else if (frame === 1) {
      body = [
        [0,0,0,0,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,C.BLUE,0,0,0,0,0],
        [0,0,0,baseColor,baseColor,baseColor,C.BLUE,C.BLUE,C.BLUE,C.BLUE,baseColor,0,0,0,0,0],
        [0,0,0,0,0,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,0,0,0,0,0],
        [0,0,0,0,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0],
        [0,0,0,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BLUE,C.BLUE,0,0,0,0,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0],
        [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0],
      ];
    } else if (frame === 2) {
      body = [
        [0,0,0,C.BLUE,baseColor,baseColor,baseColor,baseColor,baseColor,C.BLUE,0,0,0,0,0,0],
        [0,0,C.BLUE,C.BLUE,C.BLUE,baseColor,baseColor,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0,0],
        [0,0,C.SKIN,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,C.SKIN,0,0,0,0,0,0],
        [0,0,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.SKIN,0,0,0,0,0,0],
        [0,0,0,C.BLUE,C.BLUE,0,0,0,C.BLUE,C.BLUE,0,0,0,0,0,0],
        [0,0,0,C.BROWN,C.BROWN,0,0,0,C.BROWN,C.BROWN,0,0,0,0,0,0],
        [0,0,C.BROWN,C.BROWN,C.BROWN,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ];
    } else {
      // Jump frame
      body = [
        [0,baseColor,baseColor,baseColor,C.BLUE,baseColor,baseColor,baseColor,baseColor,0,0,0,0,0,0,0],
        [baseColor,baseColor,baseColor,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,0,0,0,0,0,0,0],
        [C.SKIN,C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0,0,0],
        [C.SKIN,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0,0,0,0],
        [0,C.BLUE,C.BLUE,C.BLUE,0,0,C.BLUE,C.BLUE,0,0,0,0,0,0,0,0],
        [0,0,C.BROWN,C.BROWN,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0,0],
        [0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ];
    }

    drawPixelArt(ctx, head, s, 0, 0);
    drawPixelArt(ctx, body, s, 0, 8 * s);
  }

  if (direction === -1) {
    const flipped = createCanvas(48, 96);
    const fctx = flipped.getContext('2d');
    fctx.translate(48, 0);
    fctx.scale(-1, 1);
    fctx.drawImage(canvas, 0, 0);
    spriteCache[key] = flipped;
    return flipped;
  }

  spriteCache[key] = canvas;
  return canvas;
}

export function getDeadMarioSprite() {
  const key = 'mario_dead';
  if (spriteCache[key]) return spriteCache[key];

  const s = 3;
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Dead Mario - upside down essentially, arms up
  const data = [
    [0,0,0,0,0,C.RED,C.RED,C.RED,C.RED,C.RED,0,0,0,0,0,0],
    [0,0,0,0,C.RED,C.RED,C.RED,C.RED,C.RED,C.RED,C.RED,C.RED,C.RED,0,0,0],
    [0,0,0,0,C.BROWN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,0,0,0,0,0],
    [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0,0],
    [0,0,0,C.BROWN,C.SKIN,C.BROWN,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.SKIN,C.SKIN,C.SKIN,0,0],
    [0,0,0,0,C.BROWN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0,0,0],
    [0,0,0,0,0,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,C.SKIN,0,0,0,0],
    [0,0,C.SKIN,0,C.RED,C.RED,C.BLUE,C.RED,C.RED,C.RED,0,C.SKIN,0,0,0,0],
    [C.SKIN,C.SKIN,0,C.RED,C.RED,C.RED,C.BLUE,C.RED,C.RED,C.BLUE,C.RED,0,C.SKIN,C.SKIN,0,0],
    [C.SKIN,C.SKIN,C.RED,C.RED,C.RED,C.RED,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.RED,C.RED,C.SKIN,C.SKIN,0,0],
    [0,0,0,C.RED,C.BLUE,C.YELLOW,C.BLUE,C.BLUE,C.YELLOW,C.BLUE,C.RED,0,0,0,0,0],
    [0,0,0,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0],
    [0,0,0,0,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,C.BLUE,0,0,0,0,0],
    [0,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,C.BROWN,C.BROWN,C.BROWN,0,0,0,0,0],
    [0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0,C.BROWN,C.BROWN,C.BROWN,C.BROWN,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  drawPixelArt(ctx, data, s);
  spriteCache[key] = canvas;
  return canvas;
}

export function getTileSprite(type) {
  const key = `tile_${type}`;
  if (spriteCache[key]) return spriteCache[key];

  const size = 48;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  switch (type) {
    case 'ground':
      ctx.fillStyle = C.BRICK;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = C.BRICK_DARK;
      ctx.fillRect(0, 0, size, 3);
      ctx.fillRect(0, 0, 3, size);
      ctx.fillStyle = C.BRICK_LIGHT;
      ctx.fillRect(3, 3, size - 6, size - 6);
      ctx.fillStyle = C.BRICK;
      ctx.fillRect(6, 6, size - 12, size - 12);
      // Brick pattern
      ctx.fillStyle = C.BRICK_DARK;
      ctx.fillRect(22, 0, 4, size);
      ctx.fillRect(0, 22, size, 4);
      break;

    case 'brick':
      ctx.fillStyle = C.BRICK;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = C.BRICK_DARK;
      ctx.lineWidth = 2;
      // Brick lines
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size / 2);
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.moveTo(size / 4, size / 2);
      ctx.lineTo(size / 4, size);
      ctx.moveTo(size * 3 / 4, size / 2);
      ctx.lineTo(size * 3 / 4, size);
      ctx.stroke();
      ctx.fillStyle = C.BRICK_LIGHT;
      ctx.fillRect(2, 2, size / 2 - 4, size / 2 - 4);
      ctx.fillRect(size / 2 + 2, 2, size / 2 - 4, size / 2 - 4);
      ctx.fillRect(2, size / 2 + 2, size / 4 - 3, size / 2 - 4);
      ctx.fillRect(size / 4 + 2, size / 2 + 2, size / 2 - 4, size / 2 - 4);
      ctx.fillRect(size * 3 / 4 + 2, size / 2 + 2, size / 4 - 3, size / 2 - 4);
      break;

    case 'question': {
      ctx.fillStyle = C.QUESTION_YELLOW;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = C.QUESTION_DARK;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, size - 4, size - 4);
      // Question mark
      ctx.fillStyle = C.WHITE;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', size / 2, size / 2);
      // Shine dots
      ctx.fillStyle = C.YELLOW;
      ctx.fillRect(4, 4, 6, 6);
      ctx.fillRect(size - 10, 4, 6, 6);
      ctx.fillRect(4, size - 10, 6, 6);
      ctx.fillRect(size - 10, size - 10, 6, 6);
      break;
    }

    case 'question_used':
      ctx.fillStyle = '#886644';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = '#664422';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, size - 4, size - 4);
      ctx.fillStyle = '#664422';
      ctx.fillRect(4, 4, 6, 6);
      ctx.fillRect(size - 10, 4, 6, 6);
      ctx.fillRect(4, size - 10, 6, 6);
      ctx.fillRect(size - 10, size - 10, 6, 6);
      break;

    case 'block':
      ctx.fillStyle = '#886644';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = '#664422';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, size - 4, size - 4);
      ctx.fillStyle = '#664422';
      ctx.fillRect(4, 4, 6, 6);
      ctx.fillRect(size - 10, 4, 6, 6);
      ctx.fillRect(4, size - 10, 6, 6);
      ctx.fillRect(size - 10, size - 10, 6, 6);
      break;

    case 'pipe_tl':
      ctx.fillStyle = C.PIPE_GREEN;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = C.PIPE_LIGHT;
      ctx.fillRect(0, 0, size, 8);
      ctx.fillRect(0, 0, 10, size);
      ctx.fillStyle = C.PIPE_DARK;
      ctx.fillRect(size - 6, 0, 6, size);
      ctx.fillRect(0, size - 4, size, 4);
      break;

    case 'pipe_tr':
      ctx.fillStyle = C.PIPE_GREEN;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = C.PIPE_LIGHT;
      ctx.fillRect(0, 0, size, 8);
      ctx.fillStyle = C.PIPE_DARK;
      ctx.fillRect(size - 10, 0, 10, size);
      ctx.fillRect(0, size - 4, size, 4);
      break;

    case 'pipe_bl':
      ctx.fillStyle = C.PIPE_GREEN;
      ctx.fillRect(4, 0, size - 4, size);
      ctx.fillStyle = C.PIPE_LIGHT;
      ctx.fillRect(4, 0, 10, size);
      ctx.fillStyle = C.PIPE_DARK;
      ctx.fillRect(size - 6, 0, 6, size);
      break;

    case 'pipe_br':
      ctx.fillStyle = C.PIPE_GREEN;
      ctx.fillRect(0, 0, size - 4, size);
      ctx.fillStyle = C.PIPE_LIGHT;
      ctx.fillRect(2, 0, 8, size);
      ctx.fillStyle = C.PIPE_DARK;
      ctx.fillRect(size - 10, 0, 6, size);
      break;

    case 'flag_pole':
      ctx.fillStyle = '#888888';
      ctx.fillRect(20, 0, 8, size);
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(22, 0, 4, size);
      break;

    case 'flag_top':
      ctx.fillStyle = '#888888';
      ctx.fillRect(20, 8, 8, size - 8);
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(22, 8, 4, size - 8);
      // Ball on top
      ctx.fillStyle = '#00aa00';
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'castle_block':
      ctx.fillStyle = C.CASTLE_GRAY;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = C.CASTLE_DARK;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();
      break;

    case 'castle_top':
      ctx.fillStyle = C.CASTLE_GRAY;
      // Battlement shape
      ctx.fillRect(0, size / 2, size, size / 2);
      ctx.fillRect(0, 0, size / 4, size);
      ctx.fillRect(size * 3 / 8, 0, size / 4, size);
      ctx.fillRect(size * 3 / 4, 0, size / 4, size);
      ctx.strokeStyle = C.CASTLE_DARK;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, size / 2, size, size / 2);
      break;

    case 'castle_door':
      ctx.fillStyle = C.CASTLE_GRAY;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = C.BLACK;
      ctx.fillRect(8, 8, size - 16, size - 8);
      ctx.beginPath();
      ctx.arc(size / 2, 8, (size - 16) / 2, Math.PI, 0);
      ctx.fill();
      break;
  }

  spriteCache[key] = canvas;
  return canvas;
}

export function getGoombaSprite(frame) {
  const key = `goomba_${frame}`;
  if (spriteCache[key]) return spriteCache[key];

  const s = 3;
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  if (frame === 'flat') {
    // Squished goomba
    ctx.fillStyle = C.GOOMBA_BROWN;
    ctx.fillRect(3, 36, 42, 12);
    ctx.fillStyle = C.GOOMBA_TAN;
    ctx.fillRect(6, 36, 36, 6);
    ctx.fillStyle = C.WHITE;
    ctx.fillRect(12, 36, 6, 6);
    ctx.fillRect(30, 36, 6, 6);
    spriteCache[key] = canvas;
    return canvas;
  }

  const data = [
    [0,0,0,0,0,0,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,0,0,0,0,0,0],
    [0,0,0,0,0,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,0,0,0,0,0],
    [0,0,0,0,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,0,0,0,0],
    [0,0,0,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,0,0,0],
    [0,0,C.GOOMBA_BROWN,C.BLACK,C.BLACK,C.WHITE,C.WHITE,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.WHITE,C.WHITE,C.BLACK,C.BLACK,C.GOOMBA_BROWN,0,0],
    [0,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.BLACK,C.WHITE,C.WHITE,C.BLACK,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.BLACK,C.WHITE,C.WHITE,C.BLACK,C.GOOMBA_BROWN,C.GOOMBA_BROWN,0],
    [0,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,0],
    [0,0,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,C.GOOMBA_BROWN,0,0],
    [0,0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,0,0,0],
    [0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,0,0],
    [0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,0,0],
    [0,0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,0,0,0],
    [0,0,0,0,0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,C.GOOMBA_TAN,0,0,0,0,0,0],
    [0,0,C.BLACK,C.BLACK,C.GOOMBA_TAN,C.GOOMBA_TAN,0,0,0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,C.BLACK,C.BLACK,0,0],
    [0,C.BLACK,C.BLACK,C.BLACK,C.BLACK,C.GOOMBA_TAN,0,0,0,0,C.GOOMBA_TAN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  // Second walk frame shifts feet
  if (frame === 1) {
    data[13] = [0,0,0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,C.BLACK,C.BLACK,0,0,0,0,C.GOOMBA_TAN,C.GOOMBA_TAN,0,0];
    data[14] = [0,0,0,C.GOOMBA_TAN,C.BLACK,C.BLACK,C.BLACK,C.BLACK,0,0,0,C.GOOMBA_TAN,C.BLACK,C.BLACK,0,0];
  }

  drawPixelArt(ctx, data, s);
  spriteCache[key] = canvas;
  return canvas;
}

export function getKoopaSprite(frame, direction) {
  const key = `koopa_${frame}_${direction}`;
  if (spriteCache[key]) return spriteCache[key];

  const s = 3;
  const canvas = createCanvas(48, 72);
  const ctx = canvas.getContext('2d');

  // Simplified Koopa
  // Head
  ctx.fillStyle = C.KOOPA_GREEN;
  ctx.fillRect(12, 0, 24, 24);
  ctx.fillStyle = C.WHITE;
  ctx.fillRect(18, 6, 9, 9);
  ctx.fillStyle = C.BLACK;
  ctx.fillRect(21, 9, 4, 4);

  // Shell
  ctx.fillStyle = C.KOOPA_SHELL;
  ctx.fillRect(6, 18, 36, 36);
  ctx.fillStyle = C.KOOPA_DARK;
  ctx.fillRect(6, 18, 36, 4);
  ctx.fillRect(6, 18, 4, 36);
  ctx.fillRect(38, 18, 4, 36);
  ctx.fillRect(6, 50, 36, 4);
  // Shell pattern
  ctx.fillStyle = C.YELLOW;
  ctx.fillRect(18, 24, 12, 24);

  // Feet
  if (frame === 0) {
    ctx.fillStyle = C.KOOPA_GREEN;
    ctx.fillRect(6, 54, 12, 12);
    ctx.fillRect(30, 54, 12, 12);
  } else {
    ctx.fillStyle = C.KOOPA_GREEN;
    ctx.fillRect(12, 54, 12, 12);
    ctx.fillRect(24, 54, 12, 12);
  }

  if (direction === -1) {
    const flipped = createCanvas(48, 72);
    const fctx = flipped.getContext('2d');
    fctx.translate(48, 0);
    fctx.scale(-1, 1);
    fctx.drawImage(canvas, 0, 0);
    spriteCache[key] = flipped;
    return flipped;
  }

  spriteCache[key] = canvas;
  return canvas;
}

export function getShellSprite() {
  const key = 'shell';
  if (spriteCache[key]) return spriteCache[key];

  const canvas = createCanvas(48, 42);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = C.KOOPA_SHELL;
  ctx.fillRect(3, 3, 42, 36);
  ctx.fillStyle = C.KOOPA_DARK;
  ctx.fillRect(3, 3, 42, 4);
  ctx.fillRect(3, 3, 4, 36);
  ctx.fillRect(41, 3, 4, 36);
  ctx.fillRect(3, 35, 42, 4);
  ctx.fillStyle = C.YELLOW;
  ctx.fillRect(18, 9, 12, 24);

  spriteCache[key] = canvas;
  return canvas;
}

export function getCoinSprite(frame) {
  const key = `coin_${frame}`;
  if (spriteCache[key]) return spriteCache[key];

  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  const widths = [16, 12, 8, 12];
  const w = widths[frame % 4];
  const x = (48 - w) / 2;

  ctx.fillStyle = C.YELLOW;
  ctx.fillRect(x, 6, w, 36);
  ctx.fillStyle = C.ORANGE;
  ctx.fillRect(x + 2, 8, w - 4, 32);
  ctx.fillStyle = C.YELLOW;
  ctx.fillRect(x + 4, 10, w - 8, 28);

  spriteCache[key] = canvas;
  return canvas;
}

export function getMushroomSprite() {
  const key = 'mushroom';
  if (spriteCache[key]) return spriteCache[key];

  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Mushroom cap
  ctx.fillStyle = C.RED;
  ctx.beginPath();
  ctx.arc(24, 18, 20, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(4, 18, 40, 6);

  // White spots
  ctx.fillStyle = C.WHITE;
  ctx.beginPath();
  ctx.arc(14, 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(34, 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(24, 6, 5, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.fillStyle = C.TAN;
  ctx.fillRect(14, 24, 20, 20);
  ctx.fillStyle = C.WHITE;
  ctx.fillRect(16, 24, 16, 18);

  // Eyes
  ctx.fillStyle = C.BLACK;
  ctx.fillRect(16, 28, 5, 5);
  ctx.fillRect(27, 28, 5, 5);

  spriteCache[key] = canvas;
  return canvas;
}

export function getFireFlowerSprite(frame) {
  const key = `fireflower_${frame}`;
  if (spriteCache[key]) return spriteCache[key];

  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  const colors = [
    [C.RED, C.ORANGE],
    [C.ORANGE, C.YELLOW],
    [C.YELLOW, C.WHITE],
    [C.ORANGE, C.RED],
  ];
  const [c1, c2] = colors[frame % 4];

  // Stem
  ctx.fillStyle = C.GREEN;
  ctx.fillRect(20, 28, 8, 16);
  ctx.fillStyle = C.DARK_GREEN;
  ctx.fillRect(12, 32, 8, 6);
  ctx.fillRect(28, 36, 8, 6);

  // Petals
  ctx.fillStyle = c1;
  ctx.beginPath();
  ctx.arc(24, 14, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, 20, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(34, 20, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, 28, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, 28, 6, 0, Math.PI * 2);
  ctx.fill();

  // Center
  ctx.fillStyle = c2;
  ctx.beginPath();
  ctx.arc(24, 22, 6, 0, Math.PI * 2);
  ctx.fill();

  spriteCache[key] = canvas;
  return canvas;
}

export function getStarSprite(frame) {
  const key = `star_${frame}`;
  if (spriteCache[key]) return spriteCache[key];

  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  const colors = [C.YELLOW, C.ORANGE, '#ffff88', C.YELLOW];
  ctx.fillStyle = colors[frame % 4];

  // Star shape
  ctx.beginPath();
  const cx = 24, cy = 24, outerR = 20, innerR = 9, spikes = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = C.BLACK;
  ctx.fillRect(18, 22, 4, 4);
  ctx.fillRect(28, 22, 4, 4);

  spriteCache[key] = canvas;
  return canvas;
}

export function getFlagSprite() {
  const key = 'flag';
  if (spriteCache[key]) return spriteCache[key];

  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = C.FLAG_GREEN;
  // Triangle flag
  ctx.beginPath();
  ctx.moveTo(24, 4);
  ctx.lineTo(48, 18);
  ctx.lineTo(24, 32);
  ctx.closePath();
  ctx.fill();

  spriteCache[key] = canvas;
  return canvas;
}

export function getFireballSprite(frame) {
  const key = `fireball_${frame}`;
  if (spriteCache[key]) return spriteCache[key];

  const canvas = createCanvas(24, 24);
  const ctx = canvas.getContext('2d');

  const colors = [C.ORANGE, C.RED, C.YELLOW, C.ORANGE];
  ctx.fillStyle = colors[frame % 4];
  ctx.beginPath();
  ctx.arc(12, 12, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.YELLOW;
  ctx.beginPath();
  ctx.arc(12, 12, 5, 0, Math.PI * 2);
  ctx.fill();

  spriteCache[key] = canvas;
  return canvas;
}

export function clearSpriteCache() {
  for (const key in spriteCache) {
    delete spriteCache[key];
  }
}

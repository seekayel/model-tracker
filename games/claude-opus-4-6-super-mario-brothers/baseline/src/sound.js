// Simple sound effects using Web Audio API
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'square', volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio not available
  }
}

export function playJumpSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
  gain.gain.value = 0.12;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

export function playCoinSound() {
  playTone(988, 0.05, 'square', 0.1);
  setTimeout(() => playTone(1319, 0.15, 'square', 0.1), 50);
}

export function playStompSound() {
  playTone(400, 0.05, 'square', 0.1);
  setTimeout(() => playTone(600, 0.1, 'square', 0.1), 30);
}

export function playBumpSound() {
  playTone(200, 0.1, 'triangle', 0.15);
}

export function playBreakSound() {
  playTone(300, 0.05, 'square', 0.1);
  setTimeout(() => playTone(200, 0.05, 'square', 0.1), 30);
  setTimeout(() => playTone(100, 0.1, 'square', 0.1), 60);
}

export function playPowerUpSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.12, 'square', 0.1), i * 80);
  });
}

export function playOneUpSound() {
  const notes = [330, 392, 523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.08, 'square', 0.1), i * 60);
  });
}

export function playDeathSound() {
  const notes = [494, 466, 440, 392, 349, 330, 262, 247];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'square', 0.12), i * 120);
  });
}

export function playFireballSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.12);
  gain.gain.value = 0.08;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

export function playFlagpoleSound() {
  const notes = [262, 330, 392, 523, 659, 784];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'square', 0.1), i * 100);
  });
}

export function playGameOverSound() {
  const notes = [262, 247, 220, 196, 175, 165];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'triangle', 0.15), i * 200);
  });
}

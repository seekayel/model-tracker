let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.1): void {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playShoot(): void {
  playTone(880, 0.08, 'square', 0.08);
  playTone(1200, 0.05, 'square', 0.05);
}

export function playEnemyHit(): void {
  playTone(200, 0.15, 'sawtooth', 0.1);
  playTone(100, 0.2, 'square', 0.08);
}

export function playPlayerHit(): void {
  playTone(150, 0.3, 'sawtooth', 0.15);
  playTone(80, 0.5, 'square', 0.12);
}

export function playDive(): void {
  playTone(600, 0.1, 'triangle', 0.04);
}

export function playStageStart(): void {
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.2);
  });
}

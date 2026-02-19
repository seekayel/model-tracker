// ── Minimal sound effects using Web Audio API ──

let audioCtx: AudioContext | null = null;

function ensure(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", vol = 0.1) {
  const ctx = ensure();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function shootSound() {
  playTone(880, 0.08, "square", 0.07);
}

export function enemyShootSound() {
  playTone(220, 0.12, "sawtooth", 0.04);
}

export function explosionSound() {
  const ctx = ensure();
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export function playerDeathSound() {
  playTone(300, 0.1, "sawtooth", 0.1);
  setTimeout(() => playTone(200, 0.15, "sawtooth", 0.1), 100);
  setTimeout(() => playTone(120, 0.25, "sawtooth", 0.08), 200);
}

export function stageStartSound() {
  playTone(523, 0.1, "square", 0.06);
  setTimeout(() => playTone(659, 0.1, "square", 0.06), 120);
  setTimeout(() => playTone(784, 0.15, "square", 0.06), 240);
}

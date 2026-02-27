let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.08) {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export function sfxShoot() {
  playTone(800, 0.08, 'square', 0.06);
}

export function sfxHit() {
  playTone(200, 0.12, 'sawtooth', 0.07);
}

export function sfxPickup() {
  playTone(600, 0.06, 'sine', 0.08);
  setTimeout(() => playTone(900, 0.08, 'sine', 0.08), 60);
}

export function sfxDeath() {
  playTone(150, 0.3, 'sawtooth', 0.1);
}

export function sfxExit() {
  playTone(440, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.08), 100);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.08), 200);
}

export function sfxDoor() {
  playTone(300, 0.15, 'triangle', 0.06);
}

export function sfxMelee() {
  playTone(150, 0.06, 'square', 0.05);
  playTone(250, 0.06, 'square', 0.05);
}

# Galaga Clone

A browser-based Galaga-inspired space shooter built with TypeScript and Vite.

## Controls

| Key | Action |
|---|---|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Space / Z | Fire |
| P | Pause / Resume |
| Enter | Start game / Restart after game over |

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Build output goes to `dist/`.

## Gameplay

- Destroy all enemies to advance to the next stage.
- Enemies periodically dive toward you — dodge or shoot them down.
- Diving enemies score double points.
- Three enemy types: Bees (100pts), Butterflies (150pts), Bosses (300pts).
- You start with 3 lives. Game ends when all lives are lost.

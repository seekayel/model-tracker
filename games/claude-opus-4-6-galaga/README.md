# Galaga Clone

A browser-based clone inspired by the classic arcade game Galaga, built with TypeScript and HTML5 Canvas.

## Controls

| Key | Action |
|---|---|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Space / Arrow Up | Fire |
| Enter / Space | Start / Restart |

## Running

```bash
npm install
npm run dev      # Start dev server with hot reload
npm run build    # Build to dist/
npm run preview  # Preview production build
```

## Gameplay

- Destroy waves of alien enemies that fly into formation and dive-bomb your ship.
- **Bees** (yellow) are worth 50 pts in formation, 100 pts while diving.
- **Butterflies** (red/pink) are worth 80 pts in formation, 160 pts while diving.
- **Boss Galaga** (green) take 2 hits and are worth 150 pts in formation, 400 pts while diving.
- Enemies get faster and more aggressive each stage.
- You have 3 lives. High score is saved locally.

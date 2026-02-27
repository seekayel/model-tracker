# Galaga Clone

A browser-based Galaga-inspired arcade shooter built with TypeScript and Vite.

## Controls

| Key | Action |
|-----|--------|
| `←` / `→` or `A` / `D` | Move left / right |
| `Space` or `Z` | Shoot |
| `Space` / `Enter` | Start / Restart game |

## Gameplay

- Destroy all enemies in the wave to advance
- Enemies swoop down in formation patterns and dive at the player
- Boss Galagas (red) require 2 hits and may deploy a capture beam
- Enemies get faster and more aggressive as waves progress
- Score: Bee = 50pts, Butterfly = 80pts, Boss = 150pts

## Run & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The production build outputs to the `dist/` directory as static files.

## Tech Stack

- TypeScript
- Vite (bundler)
- HTML5 Canvas (rendering)

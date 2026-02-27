# Pong

A browser-based Pong clone — Player vs AI. First to 7 points wins.

## Controls

| Key | Action |
|-----|--------|
| `W` / `Arrow Up` | Move paddle up |
| `S` / `Arrow Down` | Move paddle down |
| `Space` | Start / Continue / Restart |

## Run & Build

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The production build outputs to `dist/`.

## Gameplay

- You control the **left paddle**.
- The **right paddle** is controlled by a CPU opponent.
- The ball speeds up slightly with each paddle hit.
- First player to reach **7 points** wins.

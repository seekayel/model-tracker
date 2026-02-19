# Pong

A browser-based Pong clone built with vanilla JavaScript and HTML Canvas.

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move paddle up |
| S / Arrow Down | Move paddle down |
| Space | Start / Restart game |

You control the **left paddle** (blue). The right paddle (red) is CPU-controlled.
First to **7 points** wins.

## Development

```bash
npm install
npm run dev      # Start dev server with hot reload
```

## Build

```bash
npm run build    # Output static files to dist/
npm run preview  # Preview the production build locally
```

## Tech

- Vanilla JS + HTML Canvas (no frameworks)
- Vite for bundling
- Fully client-side, no backend required

# Super Mario Brothers

A browser-based Super Mario Brothers clone built with vanilla JS + Vite.

## Controls

| Key | Action |
|-----|--------|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Arrow Up / Space / W | Jump (hold for higher jump) |
| Z / X / Shift | Run (hold while moving) |
| Enter / Space | Start / Restart |

## Gameplay

- Collect coins from question blocks and coin tiles for points
- Stomp Goombas from above to defeat them (bouncing off earns 100 points)
- Hit question blocks from below to reveal coins or a mushroom
- Collect the mushroom to become Big Mario (can break brick blocks!)
- Reach the flagpole at the end of the level to clear it
- You have 3 lives — fall into pits or get hit as Small Mario to lose one
- Clearing the level earns a time bonus (50 pts per second remaining)
- Getting 100 coins earns an extra life

## Run / Build

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build
npm run preview
```

## Tech

- Pure HTML5 Canvas rendering (no external assets)
- ES Modules, Vite build tool
- Static output — no server required

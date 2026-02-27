# Super Mario Brothers Clone

A browser-based platformer game inspired by Super Mario Brothers, built with vanilla JavaScript and HTML5 Canvas.

## Features

- Classic Mario-style platforming gameplay
- Multiple enemy types (Goombas and Koopa Troopas)
- Power-ups (Mushrooms to grow big)
- Collectible coins and question blocks
- Pipes, bricks, and varied level design
- Score tracking, lives system, and time limit
- Parallax scrolling background
- Pixel-art style graphics

## Controls

| Key | Action |
|-----|--------|
| Arrow Left / A | Move Left |
| Arrow Right / D | Move Right |
| Space / Arrow Up / W | Jump |
| Enter | Start / Restart Game |

## Gameplay

- Collect coins to increase your score (100 coins = extra life)
- Hit question blocks from below to get coins or mushrooms
- Stomp on enemies to defeat them
- Avoid touching enemies from the side
- Reach the flag at the end to win
- Don't fall into pits!
- Complete the level before time runs out

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Running in Development Mode

```bash
npm run dev
```

This starts a development server with hot module reloading. Open your browser to the URL shown in the terminal.

### Building for Production

```bash
npm run build
```

This creates a `dist/` directory with optimized static files ready for deployment.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Project Structure

```
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite build configuration
├── src/
│   ├── main.js         # Entry point, game loop
│   ├── game.js         # Main game logic and state
│   ├── constants.js    # Game constants and configuration
│   ├── input.js        # Keyboard input handling
│   ├── physics.js      # Physics and collision detection
│   ├── entities.js     # Player, enemies, items classes
│   ├── level.js        # Level generation and tile data
│   ├── renderer.js     # Canvas rendering
│   ├── sprites.js      # Sprite drawing functions
│   └── style.css       # Styling for UI overlays
└── dist/               # Built output (after npm run build)
```

## Technical Details

- Built with Vite for fast development and optimized builds
- Pure JavaScript (ES6 modules) - no game framework dependencies
- HTML5 Canvas for rendering
- Procedurally drawn sprites (no external image assets required)
- Tile-based level design with collision detection
- Frame-rate independent game loop

## License

This is an educational project inspired by Nintendo's Super Mario Bros. All rights to the original game belong to Nintendo.

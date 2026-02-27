# Galaga Clone

A browser-based arcade shooter inspired by the classic Galaga game. Built with vanilla JavaScript and Vite.

## Features

- Classic Galaga-style gameplay with waves of enemies
- Three enemy types: Bees, Butterflies, and Boss enemies
- Enemy dive attack patterns with curved paths
- Score system with high score persistence
- Multiple waves with increasing difficulty
- Particle explosion effects
- Scrolling star background

## Controls

| Key | Action |
|-----|--------|
| ← / A | Move left |
| → / D | Move right |
| Space | Fire / Start game |
| Enter | Start game |
| P / Esc | Pause game |

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Development

Run the development server with hot reloading:

```bash
npm run dev
```

The game will open automatically in your default browser.

### Build

Create a production build:

```bash
npm run build
```

This outputs static files to the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── src/
│   ├── main.js         # Entry point
│   ├── game.js         # Main game loop and state
│   ├── player.js       # Player ship
│   ├── enemy.js        # Enemy ships
│   ├── formation.js    # Enemy formation management
│   ├── bullet.js       # Projectiles
│   ├── explosion.js    # Explosion effects
│   ├── stars.js        # Background stars
│   ├── renderer.js     # Canvas rendering
│   ├── input.js        # Keyboard input
│   ├── constants.js    # Game constants
│   └── style.css       # Styles
└── dist/               # Production build output
```

## Gameplay

- Destroy all enemies in each wave to advance
- Enemies in formation are worth base points
- Enemies that are diving are worth double points
- Boss enemies (top row) require 2 hits to destroy
- You have 3 lives - avoid enemy bullets and collisions
- High score is saved locally in your browser

## Scoring

| Enemy | Formation Points | Diving Points |
|-------|-----------------|---------------|
| Bee | 50 | 100 |
| Butterfly | 80 | 160 |
| Boss | 150 | 300 |

## License

MIT

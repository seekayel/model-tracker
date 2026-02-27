# Gauntlet Clone

A browser-based dungeon crawler inspired by the classic arcade game Gauntlet.

## Features

- Four playable character classes (Warrior, Valkyrie, Wizard, Elf)
- Procedurally generated dungeon levels
- Enemy spawners with multiple enemy types
- Keys, doors, food, potions, and treasure pickups
- Health drain mechanic (classic Gauntlet style)
- Progressive difficulty across levels

## Controls

- **WASD** or **Arrow Keys**: Move character
- **Spacebar**: Attack (shoot projectile in current direction)

## Character Classes

| Class    | Strength                 |
|----------|--------------------------|
| Warrior  | High armor, strong melee |
| Valkyrie | Balanced stats           |
| Wizard   | High magic damage        |
| Elf      | Fast movement and attack |

## Gameplay Tips

- Your health constantly drains - collect food and potions to survive
- Destroy enemy spawners to stop enemies from appearing
- Collect keys to open doors
- Find the exit (glowing gold square) to proceed to the next level
- Treasure increases your score but doesn't heal you

## Development

### Prerequisites

- Node.js (v16 or higher recommended)
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:5173` (or similar port).

### Build for Production

```bash
npm run build
```

This creates a `dist/` directory with static files ready for deployment.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── index.html          # Entry HTML file
├── src/
│   ├── main.js         # Application entry point
│   ├── game.js         # Main game loop and state
│   ├── player.js       # Player class and logic
│   ├── enemies.js      # Enemy and spawner classes
│   ├── level.js        # Level generation
│   ├── projectiles.js  # Projectile system
│   ├── input.js        # Input handling
│   ├── constants.js    # Game constants and configuration
│   └── style.css       # Styles
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## License

MIT

# Civilization Clone

A browser-based turn-based strategy game inspired by Sid Meier's Civilization, built with TypeScript and Vite.

## Features

- Procedurally generated maps with varied terrain (ocean, coast, plains, grassland, forest, hills, mountains, desert)
- Found cities and manage production
- Train military units (Warriors, Archers, Horsemen, Swordsmen, Catapults, Scouts)
- Turn-based combat with terrain bonuses
- Fog of war and exploration
- 3 AI opponents with city building and military AI
- Multiple victory conditions: Domination, Science, Elimination, and Score
- Minimap navigation

## Controls

| Key | Action |
|-----|--------|
| **Click** | Select unit / city / move |
| **WASD** / **Arrow Keys** | Move selected unit (or scroll camera) |
| **B** | Build city (with Settler selected) |
| **F** | Fortify unit |
| **Space** | Skip unit's turn |
| **Enter** | End turn |
| **Tab** | Cycle to next unit |
| **1-7** | Set city production (when city selected) |
| **Esc** | Deselect |

## City Production Keys

| Key | Unit |
|-----|------|
| 1 | Warrior |
| 2 | Archer |
| 3 | Settler |
| 4 | Scout |
| 5 | Horseman |
| 6 | Swordsman |
| 7 | Catapult |

## Victory Conditions

- **Domination**: Control 60% of all cities
- **Science**: Research 20 technologies
- **Elimination**: Be the last civilization standing
- **Score**: Highest score after 200 turns

## Run / Build

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Build output goes to `dist/`.

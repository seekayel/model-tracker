# Civilization Clone

A browser-based turn-based strategy game inspired by Sid Meier's Civilization series.

## Features

- **Procedurally generated maps** with various terrain types (grassland, plains, desert, forest, hills, mountains, ocean)
- **Multiple unit types**: Settlers, Warriors, Archers, Spearmen, Horsemen, Swordsmen, Catapults, Knights
- **City building**: Found cities, manage population growth, construct buildings
- **Technology tree**: Research technologies to unlock new units and capabilities
- **AI opponent**: Compete against a computer-controlled civilization
- **Turn-based combat**: Strategic battles with terrain and fortification bonuses
- **Victory conditions**: Domination (conquer all cities) or Science (research all technologies)

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move camera |
| Left Click | Select unit or city |
| Right Click | Quick move selected unit |
| M | Enter move mode for selected unit |
| B | Build city (Settler only) |
| F | Fortify selected unit |
| T | Open technology panel |
| Space / Enter | End turn |
| Escape | Deselect / Cancel |
| 1-5 | Quick production (when city selected) |

## Gameplay Tips

1. **Start by founding a city** - Use your Settler to found your first city on good terrain
2. **Build military units** - Protect your cities and explore the map
3. **Research technologies** - Unlock powerful units and buildings
4. **Expand carefully** - Found new cities but maintain enough military to defend them
5. **Use terrain** - Hills and forests provide defensive bonuses

## Run/Build

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

The build output will be in the `dist/` directory.

## Tech Stack

- TypeScript
- Vite (build tool)
- HTML5 Canvas (rendering)
- No external game libraries - pure JavaScript

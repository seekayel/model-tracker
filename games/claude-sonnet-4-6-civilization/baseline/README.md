# Civilization — Browser Strategy Game

A turn-based strategy game inspired by Civilization, running fully in the browser as static assets.

## Quick Start

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm run build    # build to dist/
npm run preview  # preview the production build
```

## Controls

| Key / Action | Effect |
|---|---|
| **Click** a unit | Select it (shows move range in green, attack range in red) |
| **Click** a green tile | Move selected unit there |
| **Click** a red tile | Attack enemy unit or city there |
| **Click** a city | Open city production panel (right sidebar) |
| **F** | Found city (when Settler is selected) |
| **Space** or **Enter** | End your turn |
| **Tab** | Cycle to next unit with remaining moves |
| **Z** | Put selected unit to sleep (skips future turns until threatened) |
| **G** | Fortify selected unit (heals each turn, stays put) |
| **Delete** / **Backspace** | Disband selected unit |
| **Escape** | Deselect |
| **WASD** / **Arrow keys** | Scroll the map |

## Gameplay

### Objective
- **Domination Victory**: Capture all enemy cities.
- **Score Victory**: If 100 turns pass without a domination win, the civilization with the highest score wins.

### Starting Units
You begin with:
- **Settler** — use it to found your first city (press F or click "Found City" in the sidebar)
- **Warrior** — basic combat unit to defend and explore

### Units
| Unit | Cost | Strength | Moves | Special |
|---|---|---|---|---|
| Settler | 80⚙ | — | 2 | Founds cities |
| Warrior | 40⚙ | 12 | 2 | Basic melee |
| Archer | 60⚙ | 10 | 2 | Ranged (needs Archery tech) |
| Worker | 30⚙ | — | 2 | Builds improvements |

### Cities
- Cities collect **food**, **production**, and **gold** from surrounding tiles each turn.
- **Food** fills a growth meter — when full, population increases (unlocking more worked tiles).
- **Production** goes toward the current production queue (units or buildings).
- Cities automatically repair HP each turn.

### Buildings
| Building | Cost | Effect | Prerequisite Tech |
|---|---|---|---|
| Granary | 60⚙ | +2 food/turn | Pottery |
| Barracks | 80⚙ | Units start with 20 XP | Bronze Working |
| Market | 100⚙ | +2 gold/turn | Mathematics |
| Library | 80⚙ | +2 science/turn | Writing |
| Walls | 60⚙ | +5 city defense & HP | Masonry |

### Technology
Research techs to unlock buildings and units. Science accumulates each turn from your cities (boosted by Libraries). Click techs in the Research panel (right sidebar) to queue them.

**Tech Tree:**
```
Pottery → Writing → Mathematics
Mining  → Bronze Working → Iron Working
         → Masonry
Archery
```

### Terrain Yields
| Terrain | Food | Prod | Gold |
|---|---|---|---|
| Grassland | 2 | 0 | 0 |
| Plains | 1 | 1 | 0 |
| Forest | 1 | 1 | 0 |
| Hills | 0 | 2 | 0 |
| Desert | 0 | 0 | 2 |
| Mountains | — | — | — (impassable) |
| Ocean | — | — | — (impassable) |

### Combat
- Click an enemy unit (red highlight) to attack with your selected unit.
- Damage is determined by unit strength + randomness.
- Melee defenders deal counter-damage.
- Units gain XP from combat, improving their strength.
- When a city's HP reaches 0, it is **captured** (not destroyed) — it switches ownership.

## Build Output

`npm run build` produces a `dist/` folder with fully self-contained static files. All asset paths use relative URLs for compatibility with nested hosting paths.

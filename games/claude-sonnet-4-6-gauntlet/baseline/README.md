# Gauntlet Clone

A browser-based dungeon crawler inspired by the classic Gauntlet arcade game. Fight through 5 procedurally generated dungeon levels, destroy monster spawners, collect treasure, and survive the relentless health drain!

## Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move Up |
| `S` / `↓` | Move Down |
| `A` / `←` | Move Left |
| `D` / `→` | Move Right |
| `Space` / `Enter` | Shoot in facing direction |
| `Shift + Direction` | Shoot in held direction (continuous) |
| `E` / `Q` | Cast Magic Burst (area damage) |

## Gameplay

- Your **health drains constantly** — find food to replenish it
- **Destroy Spawners** (skull icons) to stop enemy reinforcements (+200 points each)
- Reach the **exit** (green arrow) to advance to the next level
- Collect **items** for bonuses:
  - 🟢 **Food** — restores 300 HP
  - 🟡 **Key** — collectible for score
  - 🔵 **Potion** — grants a magic charge
  - 🟠 **Treasure** — 500 bonus points
- **Magic Bursts** expand in a circle, damaging all enemies in range
- Enemies: Grunts, Ghosts (pass through walls), Sorcerers (ranged), Demons (tough)

## HUD

- **♥ Health** — drops over time and from enemy hits; red = danger
- **Score** — cumulative across all levels
- **Level** — current / total (5 levels)
- **Magic** — ★ = available charges

## Run & Build

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

The game runs fully client-side as static files — no server required.

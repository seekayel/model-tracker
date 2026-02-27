# Gauntlet Clone

A browser-based dungeon crawler inspired by the classic arcade game Gauntlet. Navigate procedurally generated dungeons, fight monsters, collect treasure, and find the exit.

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| Space / Z | Attack (melee or ranged depending on class) |
| X | Use Potion (restores 200 HP) |
| Enter | Confirm / Advance |

## Hero Classes

- **Warrior** — High armor and melee damage, no ranged attack (HP: 800)
- **Valkyrie** — Balanced melee fighter (HP: 700)
- **Wizard** — Powerful magic projectiles, low armor (HP: 500)
- **Elf** — Fast movement, good ranged attack (HP: 600)

## Gameplay

- Health drains slowly over time (classic Gauntlet mechanic)
- Destroy **spawners** (green boxes) to stop enemies from appearing
- Collect **food** (green) to restore health
- Collect **keys** (gold) to open doors
- Collect **potions** (blue) to save for later use
- Collect **treasure** (gold chests) for score
- Find the **exit** (pulsing yellow tile) to advance to the next level
- Levels get progressively harder with more enemies and tougher spawns

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Build to dist/
npm run preview   # Preview production build
```

# Civilization Clone

A simple client-side only browser-based clone inspired by Civilization.

## Controls
- Click on a tile to select it (or a unit/city on it).
- Click on an adjacent tile to move a selected unit.
- Use `WASD` or `Arrow Keys` to move selected units.
- Press `F` while a Settler is selected to found a city.
- Press `Space` to end your turn.
- Cities automatically build units when their production reaches the required cost. You can change what a city is building from the sidebar when the city is selected.

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build:
   ```bash
   npm run preview
   ```
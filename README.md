# Model Tracker

Model Tracker is a React + Vite gallery for showcasing games and which model was used to build them.

This repo includes:
- A main gallery site (full-screen scrolling experience)
- A `games/` workspace for standalone game builds

## Quick Start (Human Usage)

### 1) Prerequisite

Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2) Install and run locally

```bash
bun install
bun run dev
```

The app runs on port `2345` by default.

Open:
- `http://localhost:2345/model-tracker/` (expected path)
- `http://localhost:2345/` (fallback in some local setups)

## How To Use The App

1. Scroll down to move between full-screen game sections.
2. Use the top-right dot navigation to jump to a specific section.
3. Read model attribution, rating, and tags on each section.

Current behavior note:
- The `Play Now` button is visual in the current UI and is not wired to `playUrl` yet.

## Commands

```bash
bun run dev         # start local dev server
bun run build:games # build each game in games/ and copy to public/games/
bun run build       # build games, then build gallery site into dist/
bun run preview     # preview the production build
```

## Add Or Update Gallery Entries

Edit `src/data.ts` and add/update objects in `PLACEHOLDER_GAMES`.

Each entry uses this shape:

```ts
{
  id: string,
  title: string,
  description: string,
  model: string,
  thumbnail: string,
  tags: string[],
  rating: number,
  playUrl: string
}
```

## Add A New Game (Standalone Build)

1. Create a folder under `games/`, for example `games/my-game/`.
2. Add a `package.json` with `dev`, `build`, and `preview` scripts.
3. Ensure `build` outputs static files to `games/my-game/dist/`.
4. Run:

```bash
bun run build:games
```

Built output is copied to:
- `public/games/<game-name>/` during build prep
- `dist/games/<game-name>/` after `bun run build`

Full standard: `games/GAME_STANDARD.md`  
Reference example: `games/hello-world/`

## Deployment

GitHub Actions deploys to GitHub Pages on pushes to `main`:
- Workflow file: `.github/workflows/deploy.yml`

The main site base path is configured as:
- `/model-tracker/` in `vite.config.ts`

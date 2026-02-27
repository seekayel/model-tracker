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
3. Click a model chip on a game section to open its variant timeline page.
4. Use the Grid route to compare all models across baseline and each variant complexity level.

## Commands

```bash
bun run dev         # start local dev server
bun run build:games # build each game in games/ and copy to public/games/
bun run build       # build games, then build gallery site into dist/
bun run preview     # preview the production build
bun run agent:harness      # run one-shot agent matrix using config/prompt files
bun run agent:harness:dry  # validate matrix/commands without executing agents
```

## Run The Generation Harness (Human)

1. Install and authenticate the required CLIs:
   - `claude` (Anthropic)
   - `codex` (OpenAI)
   - `gemini` (Google)
2. If you use a local `.envrc` for Claude auth tokens, load it in your shell before running the harness:

```bash
set -a
source .envrc
set +a
```

3. Validate matrix/config/prompt wiring without spending model calls:

```bash
bun run agent:harness:dry
```

4. Run the full configured matrix:

```bash
bun run agent:harness
```

Default behavior notes:
- Baseline is generated if missing.
- When `--variants-file` is provided, the harness resumes from the last contiguous generated variant (`v1`, `v2`, ...).
- Use `--overwrite-variants` (or `--force`) to restart from baseline and regenerate all variants.
- Games are executed in release-year order (oldest to newest).

5. Run a filtered smoke test (example: Pong with Claude + Gemini 3.1 Pro + variants):

```bash
bun run agent:harness -- --games pong --models claude:opus-4.6,gemini:gemini-3.1-pro --variants-file prompts/game-variants.example.md --timeout-min 20
```

6. Restart baseline + all variants for selected combos:

```bash
bun run agent:harness -- --games pong --variants-file prompts/game-variants.example.md --overwrite-variants
```

Harness inputs:
- Models/games/provider matrix: `config/agent-harness.config.json`
- Prompt template: `prompts/game-clone.template.md`
- Variant requirements file (optional): `prompts/game-variants.example.md`

Harness outputs:
- Generated combo folder: `games/<provider>-<model-key>-<game-key>/`
- Baseline build: `games/<combo>/baseline/`
- Variant builds: `games/<combo>/vN-<title-slug>/`
- Variant metadata: `games/<combo>/variants.json`
- Per-run artifacts and summary: `runs/<batch-id>/`
- Run summary JSON: `runs/<batch-id>/summary.json`
- Backups of overwritten combo folders when regenerating (`--overwrite-variants`): `games/.backups/`

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

1. Create a folder under `games/`, for example `games/my-game/` or `games/my-combo/baseline/`.
2. Add a `package.json` with `dev`, `build`, and `preview` scripts.
3. Ensure `build` outputs static files to `dist/` inside that project folder.
4. Run:

```bash
bun run build:games
```

Built output is copied to:
- `public/games/<relative-game-project-path>/` during build prep
- `dist/games/<relative-game-project-path>/` after `bun run build`

Full standard: `docs/GAME_STANDARD.md`  
Reference example: `games/hello-world/`

## Deployment

GitHub Actions deploys to GitHub Pages on pushes to `main`:
- Workflow file: `.github/workflows/deploy.yml`

The main site base path is configured as:
- `/model-tracker/` in `vite.config.ts`

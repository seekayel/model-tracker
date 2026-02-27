# Game Standard

Every playable project under the `games/` directory must follow this standard to be automatically discovered, built, and deployed with the gallery site.

## Directory Structure

```text
games/
  your-game-name/
    package.json       # Required — must implement standard scripts
    src/
    public/
    dist/

# or nested (used by harness variants)
games/
  provider-model-game/
    baseline/
      package.json
      src/
      dist/
    v1-some-variant/
      package.json
      src/
      dist/
```

## Required `package.json` Scripts

Every game must define these scripts in its `package.json`:

| Script      | Purpose                                    | Example                     |
|-------------|--------------------------------------------|-----------------------------|
| `build`     | Produce static files in `./dist/`          | `vite build`                |
| `dev`       | Start a local dev server with hot-reload   | `vite`                      |
| `preview`   | Preview the production build locally       | `vite preview`              |

### Build Output

The `build` script **must** output static files to a `dist/` directory at the game's root. This directory will be copied to the deployed site at `/games/<game-name>/`.

The output must be fully static (HTML, CSS, JS, assets). No server-side code.

## Required `package.json` Fields

```json
{
  "name": "your-game-name",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "...",
    "build": "...",
    "preview": "..."
  }
}
```

The `name` field should match the playable project directory name.

## How Games Are Integrated

1. The root build script (`scripts/build-games.js`) recursively scans all subdirectories of `games/` (excluding hidden paths and `.backups`)
2. For each game that has a `package.json`, it runs:
   - `bun install` (install dependencies)
   - `bun run build` (produce dist output)
3. The `dist/` output is copied to the main site's `public/games/<relative-project-path>/`
4. Games are accessible at `https://<site-url>/games/<relative-project-path>/`

## Adding a New Game

1. Create a new playable project directory under `games/`:
   ```bash
   mkdir games/my-awesome-game
   cd games/my-awesome-game
   ```

2. Initialize with your preferred framework (Vite recommended):
   ```bash
   bun create vite . --template vanilla
   ```

3. Ensure your `package.json` has the required scripts and that `build` outputs to `./dist/`

4. Test locally:
   ```bash
   bun install
   bun run dev      # develop
   bun run build    # verify build
   bun run preview  # verify production output
   ```

5. That's it. The CI/CD pipeline will pick it up automatically.

## Example

See `games/hello-world/` for a minimal working example.

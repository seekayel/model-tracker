You are a coding agent operating in a local project directory.

Goal:
- Create a playable browser-based clone inspired by {{GAME_NAME}}.
- The game must run fully client-side as static web assets only.

Hard constraints:
- No backend server, no storage API, no database, no authentication.
- Build output must be static files only (HTML/CSS/JS and assets).
- All runtime and asset URLs must work from a nested path using relative URLs only.
  - Do not use root-absolute paths like `/assets/...` or `/src/...`.
  - Configure the build tool for relative hosting (for Vite, set `base: './'`).
- Use `npm` for dependency management and scripts.
- Must include scripts in `package.json`:
  - `dev`
  - `build`
  - `preview`
- `npm run build` must produce a `dist/` directory at the project root.
- Keep all generated files inside the current working directory only.
- Do not ask follow-up questions. Make reasonable assumptions and complete the task in one pass.

Quality requirements:
- Implement a clear gameplay loop matching the spirit of {{GAME_NAME}}.
- Include keyboard controls and basic HUD (score/state).
- Include a simple start/restart flow.
- Keep code readable and modular.

Run context:
- Game key: {{GAME_KEY}}
- Provider: {{MODEL_PROVIDER}}
- Model key: {{MODEL_KEY}}
- Model id: {{MODEL_ID}}
- Output directory: {{OUTPUT_DIR}}
- Variant id: {{VARIANT_ID}}
- Variant title: {{VARIANT_TITLE}}
- Variant folder: {{VARIANT_FOLDER}}

Variant requirements:
{{VARIANT_PROMPT_BLOCK}}

Deliverables:
1. Complete game source code.
2. `package.json` configured for static build.
3. Any required config files for the build tool.
4. Brief README with controls and run/build steps.

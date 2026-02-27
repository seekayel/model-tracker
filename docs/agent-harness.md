# Agent Harness

This harness runs a one-shot matrix of game-generation tasks across multiple coding-agent CLIs and model IDs.

It supports baseline generation and ordered requirement variants per model/game combo.

## Commands

```bash
bun run agent:harness
bun run agent:harness:dry
```

## Filters and Controls

- `--games <csv>`: game keys from `config/agent-harness.config.json`
- `--agents <csv>`: provider ids (`claude,codex,gemini`)
- `--models <csv>`: model key filters (`codex:codex-5.3,claude:opus-4.6` or bare keys)
- `--timeout-min <n>`: per-agent timeout in minutes
- `--config <path>`: alternate config file
- `--prompt <path>`: alternate prompt template
- `--variants-file <path>`: markdown file with ordered variant sections (H2 headings)
- `--overwrite-variants`: regenerate baseline and all variants for selected combos
- `--force`: alias for `--overwrite-variants`
- `--dry-run`: writes prompts and command metadata, skips agent execution

Examples:

```bash
bun run agent:harness -- --games pong,galaga
bun run agent:harness -- --agents codex,gemini --games pong
bun run agent:harness -- --models codex:codex-5.3,gemini:gemini-3.1-pro
bun run agent:harness -- --games pong --variants-file prompts/game-variants.example.md
bun run agent:harness -- --games pong --variants-file prompts/game-variants.example.md --overwrite-variants
```

## Variant Markdown Format

Use ordered H2 sections:

```md
## v1: Add Enemy Scaling
Variant requirement text...

## v2: Add Power-Ups
Variant requirement text...
```

Rules:
- headings must start at `v1` and increase contiguously (`v2`, `v3`, ...)
- each section body is injected as the variant addendum prompt
- folder names are generated as `vN-<title-slug>`

## Output Layout

- Generated game combos: `games/<provider>-<model-key>-<game-key>/`
- Baseline game folder: `games/<combo>/baseline/`
- Variant folders: `games/<combo>/vN-<title-slug>/`
- Variant metadata: `games/<combo>/variants.json`
- Backups of overwritten combos (`--overwrite-variants`): `games/.backups/`
- Run artifacts: `runs/<batch-id>/` (timestamp + pid + random suffix)

Per run artifact directory contains:

- `prompt.txt`
- `command.json`
- `agent.stdout.log`
- `agent.stderr.log`
- `validation.stdout.log`
- `validation.stderr.log`
- `validation.json`
- `result.json`

Batch summary:

- `runs/<batch-id>/summary.json`

## Default Execution Semantics

Without `--overwrite-variants`:
1. If baseline is missing, generate it.
2. Detect the last contiguous existing variant (`v1`, `v2`, ...).
3. Generate only variants after that point.

With `--overwrite-variants`:
1. Move the existing combo into `games/.backups/`.
2. Regenerate baseline.
3. Regenerate all variants in order.

Each new variant folder is seeded by copying the previous folder in the chain
(`baseline -> v1 -> v2 -> ...`) before the agent modifies it.

## Validation

Each generated step attempts:

1. `npm install`
2. `npm run build`
3. Smoke checks:
   - `dist/` exists
   - `dist/index.html` exists
   - JS asset exists or script tag present
   - HTML has basic game surface markers (canvas/root/main/body)

## Notes

- Model IDs are config-managed and intentionally explicit.
- Gemini models in config currently include `gemini-3.1-pro` and `gemini-3-pro-preview`.
- Gemini runs with `--extensions ""` and `GEMINI_CLI_SYSTEM_SETTINGS_PATH=config/gemini-system-settings.json`
  so tool access is deterministic regardless of user-global Gemini settings.
- Update model IDs in config when provider naming changes.

# Agent Harness

This harness runs a one-shot matrix of game-generation tasks across multiple coding-agent CLIs and model IDs.

## Commands

```bash
bun run agent:harness
bun run agent:harness:dry
```

## Filters

- `--games <csv>`: game keys from `config/agent-harness.config.json`
- `--agents <csv>`: provider ids (`claude,codex,gemini`)
- `--models <csv>`: model key filters (`codex:codex-5.3,claude:opus-4.6` or bare keys)
- `--timeout-min <n>`: per-agent timeout in minutes
- `--config <path>`: alternate config file
- `--prompt <path>`: alternate prompt template
- `--force`: regenerate outputs even if `games/<provider>-<model-key>-<game-key>/` already exists
- `--dry-run`: writes prompts and command metadata, skips agent execution

Examples:

```bash
bun run agent:harness -- --games pong,galaga
bun run agent:harness -- --agents codex,gemini --games pong
bun run agent:harness -- --models codex:codex-5.3,gemini:gemini-3.1-pro
bun run agent:harness -- --games pong --force
```

## Output layout

- Generated games: `games/<provider>-<model-key>-<game-key>/`
- Backups of overwritten outputs when regenerating (`--force`): `games/.backups/`
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

## Validation

Each run attempts:

1. `npm install`
2. `npm run build`
3. Smoke checks:
   - `dist/` exists
   - `dist/index.html` exists
   - JS asset exists or script tag present
   - HTML has basic game surface markers (canvas/root/main/body)

## Notes

- Model IDs are config-managed and intentionally explicit.
- Default runs skip matrix entries whose output folder already exists; use `--force` to regenerate.
- Matrix execution order is by game release year (ascending), with config order used for year ties.
- Gemini models in config currently include `gemini-3.1-pro` and `gemini-3-pro-preview`.
- Gemini runs with `--extensions ""` and `GEMINI_CLI_SYSTEM_SETTINGS_PATH=config/gemini-system-settings.json`
  so tool access is deterministic regardless of user-global Gemini settings.
- Update model IDs in config when provider naming changes.

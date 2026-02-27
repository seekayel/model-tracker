#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { cwd, env, exit } from 'node:process';

type ProviderId = 'claude' | 'codex' | 'gemini';

type HarnessConfig = {
  defaults: {
    promptPath: string;
    outputBaseDir: string;
    runsBaseDir: string;
    backupBaseDir: string;
    timeoutMinutes: number;
  };
  games: GameSpec[];
  providers: ProviderSpec[];
};

type GameSpec = {
  key: string;
  name: string;
  releaseYear: number;
};

type ModelSpec = {
  key: string;
  id: string;
  label?: string;
};

type ProviderSpec = {
  id: ProviderId | string;
  binary: string;
  models: ModelSpec[];
};

type Args = {
  configPath: string;
  promptPath?: string;
  games?: string[];
  agents?: string[];
  models?: ModelFilter[];
  timeoutMinutes?: number;
  dryRun: boolean;
  force: boolean;
  variantsFilePath?: string;
  overwriteVariants: boolean;
};

type ModelFilter = {
  providerId?: string;
  modelKey: string;
};

type MatrixItem = {
  game: GameSpec;
  provider: ProviderSpec;
  model: ModelSpec;
};

type CommandSpec = {
  command: string;
  args: string[];
  env?: NodeJS.ProcessEnv;
};

type CommandRunResult = {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
  durationMs: number;
};

type ValidationSummary = {
  packageJsonExists: boolean;
  install: CommandRunResult | null;
  build: CommandRunResult | null;
  smoke: {
    distExists: boolean;
    indexHtmlExists: boolean;
    jsAssetFound: boolean;
    htmlHasGameSurface: boolean;
    pass: boolean;
  };
  pass: boolean;
};

type VariantDefinition = {
  index: number;
  id: string;
  title: string;
  slug: string;
  folderName: string;
  promptText: string;
};

type VariantManifest = {
  schemaVersion: number;
  generatedAt: string;
  sourcePath: string | null;
  variants: VariantDefinition[];
};

type PlanStep = {
  variantId: string;
  variantTitle: string;
  variantFolder: string;
  variantPromptText: string;
  targetDir: string;
  seedDir: string | null;
};

type ComboExecutionPlan = {
  comboDirName: string;
  comboDir: string;
  comboDirExists: boolean;
  baselineExists: boolean;
  lastContiguousVariant: number;
  steps: PlanStep[];
};

type RunResult = {
  runId: string;
  game: string;
  provider: string;
  modelKey: string;
  modelId: string;
  comboDir: string;
  outputDir: string;
  variantId: string | null;
  variantTitle: string | null;
  variantFolder: string | null;
  durationMs: number;
  agent: CommandRunResult | null;
  validation: ValidationSummary | null;
  skipped: boolean;
  skipReason: 'existing_output' | 'up_to_date' | null;
  failureCategory: 'none' | 'agent_error' | 'build_error' | 'smoke_error' | 'timeout';
};

const ROOT = cwd();
const DEFAULT_CONFIG_PATH = 'config/agent-harness.config.json';
const BASELINE_VARIANT_ID = 'baseline';
const LEGACY_MODEL_KEY_ALIASES = new Map<string, string[]>([
  ['gemini:gemini-3.1-pro-preview', ['gemini-3-pro-preview']],
]);

function usage(): string {
  return [
    'Usage: bun scripts/agent-harness.ts [options]',
    '',
    'Options:',
    '  --config <path>            Path to harness config JSON (default: config/agent-harness.config.json)',
    '  --prompt <path>            Override prompt template path',
    '  --games <csv>              Comma-separated game keys',
    '  --agents <csv>             Comma-separated provider ids (claude,codex,gemini)',
    '  --models <csv>             Comma-separated model filters; supports key or provider:key',
    '  --variants-file <path>     Markdown file with ordered H2 variant requirements (## v1: ...)',
    '  --overwrite-variants       Regenerate baseline and overwrite variant folders for each selected combo',
    '  --force                    Alias for --overwrite-variants',
    '  --timeout-min <n>          Timeout in minutes per agent run',
    '  --dry-run                  Resolve matrix and write commands without executing CLIs',
    '  -h, --help                 Show help',
    '',
    'Examples:',
    '  bun run agent:harness',
    '  bun run agent:harness -- --games pong,galaga --agents codex',
    '  bun run agent:harness -- --models claude:opus-4.6,codex:codex-5.3',
    '  bun run agent:harness -- --games pong --variants-file prompts/game-variants.example.md',
    '  bun run agent:harness -- --games pong --variants-file prompts/game-variants.example.md --overwrite-variants',
  ].join('\n');
}

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function parseModelFilters(value: string): ModelFilter[] {
  return parseCsv(value).map((entry) => {
    const parts = entry.split(':').map((part) => part.trim());
    if (parts.length === 1) {
      return { modelKey: parts[0] };
    }
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { providerId: parts[0], modelKey: parts[1] };
    }
    throw new Error(`Invalid model filter: ${entry}`);
  });
}

function parseArgs(argv: string[]): Args {
  const parsed: Args = {
    configPath: DEFAULT_CONFIG_PATH,
    dryRun: false,
    force: false,
    overwriteVariants: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      console.log(usage());
      exit(0);
    }

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--force') {
      parsed.force = true;
      parsed.overwriteVariants = true;
      continue;
    }

    if (arg === '--overwrite-variants') {
      parsed.overwriteVariants = true;
      continue;
    }

    if (arg === '--config') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --config');
      }
      parsed.configPath = next;
      continue;
    }

    if (arg.startsWith('--config=')) {
      parsed.configPath = arg.slice('--config='.length);
      continue;
    }

    if (arg === '--prompt') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --prompt');
      }
      parsed.promptPath = next;
      continue;
    }

    if (arg.startsWith('--prompt=')) {
      parsed.promptPath = arg.slice('--prompt='.length);
      continue;
    }

    if (arg === '--variants-file') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --variants-file');
      }
      parsed.variantsFilePath = next;
      continue;
    }

    if (arg.startsWith('--variants-file=')) {
      parsed.variantsFilePath = arg.slice('--variants-file='.length);
      continue;
    }

    if (arg === '--games') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --games');
      }
      parsed.games = parseCsv(next);
      continue;
    }

    if (arg.startsWith('--games=')) {
      parsed.games = parseCsv(arg.slice('--games='.length));
      continue;
    }

    if (arg === '--agents') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --agents');
      }
      parsed.agents = parseCsv(next);
      continue;
    }

    if (arg.startsWith('--agents=')) {
      parsed.agents = parseCsv(arg.slice('--agents='.length));
      continue;
    }

    if (arg === '--models') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --models');
      }
      parsed.models = parseModelFilters(next);
      continue;
    }

    if (arg.startsWith('--models=')) {
      parsed.models = parseModelFilters(arg.slice('--models='.length));
      continue;
    }

    if (arg === '--timeout-min') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --timeout-min');
      }
      const parsedValue = Number.parseInt(next, 10);
      if (Number.isNaN(parsedValue) || parsedValue <= 0) {
        throw new Error('--timeout-min must be a positive integer');
      }
      parsed.timeoutMinutes = parsedValue;
      continue;
    }

    if (arg.startsWith('--timeout-min=')) {
      const value = arg.slice('--timeout-min='.length);
      const parsedValue = Number.parseInt(value, 10);
      if (Number.isNaN(parsedValue) || parsedValue <= 0) {
        throw new Error('--timeout-min must be a positive integer');
      }
      parsed.timeoutMinutes = parsedValue;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function slug(value: string): string {
  return normalizeKey(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function comboDirName(providerId: string, modelKey: string, gameKey: string): string {
  return `${slug(providerId)}-${slug(modelKey)}-${slug(gameKey)}`;
}

function resolveComboDirName(item: MatrixItem, outputBaseDir: string): string {
  const canonicalName = comboDirName(item.provider.id, item.model.key, item.game.key);
  const canonicalPath = join(outputBaseDir, canonicalName);
  if (existsSync(canonicalPath)) {
    return canonicalName;
  }

  const aliasKey = `${normalizeKey(item.provider.id)}:${normalizeKey(item.model.key)}`;
  const aliases = LEGACY_MODEL_KEY_ALIASES.get(aliasKey) ?? [];

  for (const alias of aliases) {
    const legacyName = comboDirName(item.provider.id, alias, item.game.key);
    const legacyPath = join(outputBaseDir, legacyName);
    if (existsSync(legacyPath)) {
      return legacyName;
    }
  }

  return canonicalName;
}

function fileTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-');
}

function renderPrompt(template: string, replacements: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(replacements)) {
    const token = `{{${key}}}`;
    rendered = rendered.split(token).join(value);
  }
  return rendered;
}

function parseVariantHeading(heading: string): { index: number; title: string } {
  const trimmed = heading.trim();
  const match = trimmed.match(/^v(\d+)(?:\s*[:\-]\s*(.+)|\s+(.+))?$/i);
  if (!match) {
    throw new Error(
      `Invalid variant heading "${heading}". Expected format: "## v1: Title" in increasing order.`,
    );
  }

  const index = Number.parseInt(match[1], 10);
  if (!Number.isInteger(index) || index <= 0) {
    throw new Error(`Invalid variant index in heading "${heading}".`);
  }

  const providedTitle = (match[2] ?? match[3] ?? '').trim();
  return {
    index,
    title: providedTitle.length > 0 ? providedTitle : `Variant ${index}`,
  };
}

function parseVariantsMarkdown(markdown: string): VariantDefinition[] {
  const headingRegex = /^##\s+(.+)$/gm;
  const headings: Array<{ heading: string; start: number; end: number }> = [];
  let match: RegExpExecArray | null = null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      heading: match[1].trim(),
      start: match.index,
      end: headingRegex.lastIndex,
    });
  }

  if (headings.length === 0) {
    throw new Error('Variants markdown must include at least one H2 section, e.g. "## v1: Harder Enemies".');
  }

  const variants: VariantDefinition[] = [];

  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    const next = headings[i + 1];

    const parsedHeading = parseVariantHeading(current.heading);
    const expectedIndex = i + 1;
    if (parsedHeading.index !== expectedIndex) {
      throw new Error(
        `Variant headings must be contiguous and ordered (expected v${expectedIndex}, found v${parsedHeading.index}).`,
      );
    }

    const bodyStart = current.end;
    const bodyEnd = next ? next.start : markdown.length;
    const promptText = markdown.slice(bodyStart, bodyEnd).trim();

    const variantSlug = slug(parsedHeading.title) || `variant-${parsedHeading.index}`;
    const id = `v${parsedHeading.index}`;

    variants.push({
      index: parsedHeading.index,
      id,
      title: parsedHeading.title,
      slug: variantSlug,
      folderName: `${id}-${variantSlug}`,
      promptText,
    });
  }

  return variants;
}

function parseVariantFolderName(folderName: string): number | null {
  const match = normalizeKey(folderName).match(/^v(\d+)(?:-[a-z0-9-]+)?$/);
  if (!match) {
    return null;
  }

  const index = Number.parseInt(match[1], 10);
  return Number.isInteger(index) && index > 0 ? index : null;
}

async function listSubdirectories(directory: string): Promise<string[]> {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function isGeneratedProjectDir(directory: string): Promise<boolean> {
  if (!existsSync(directory)) {
    return false;
  }

  try {
    const directoryStat = await stat(directory);
    if (!directoryStat.isDirectory()) {
      return false;
    }

    const packageJsonPath = join(directory, 'package.json');
    if (!existsSync(packageJsonPath)) {
      return false;
    }

    const packageJsonStat = await stat(packageJsonPath);
    return packageJsonStat.isFile();
  } catch {
    return false;
  }
}

function findLastContiguousVariant(existingIndices: Set<number>): number {
  let current = 0;
  while (existingIndices.has(current + 1)) {
    current += 1;
  }
  return current;
}

async function buildExecutionPlan(
  item: MatrixItem,
  outputBaseDir: string,
  variants: VariantDefinition[],
  overwriteVariants: boolean,
): Promise<ComboExecutionPlan> {
  const comboDirName = resolveComboDirName(item, outputBaseDir);
  const comboDir = join(outputBaseDir, comboDirName);
  const comboDirExists = existsSync(comboDir);
  const baselineDir = join(comboDir, BASELINE_VARIANT_ID);
  const baselineExists = await isGeneratedProjectDir(baselineDir);

  const subdirectories = await listSubdirectories(comboDir);
  const existingIndices = new Set<number>();
  const existingFolderByIndex = new Map<number, string>();

  for (const subdirectory of subdirectories) {
    const variantIndex = parseVariantFolderName(subdirectory);
    if (variantIndex === null) {
      continue;
    }

    const variantDir = join(comboDir, subdirectory);
    if (!(await isGeneratedProjectDir(variantDir))) {
      continue;
    }

    existingIndices.add(variantIndex);
    if (!existingFolderByIndex.has(variantIndex)) {
      existingFolderByIndex.set(variantIndex, subdirectory);
    }
  }

  const lastContiguousVariant = findLastContiguousVariant(existingIndices);

  const steps: PlanStep[] = [];

  if (overwriteVariants || !baselineExists) {
    steps.push({
      variantId: BASELINE_VARIANT_ID,
      variantTitle: 'Baseline',
      variantFolder: BASELINE_VARIANT_ID,
      variantPromptText: '',
      targetDir: baselineDir,
      seedDir: null,
    });
  }

  const firstVariantToGenerate = overwriteVariants ? 1 : lastContiguousVariant + 1;

  for (const variant of variants) {
    if (variant.index < firstVariantToGenerate) {
      continue;
    }

    const previousVariantIndex = variant.index - 1;
    const previousVariantFolder = previousVariantIndex <= 0
      ? BASELINE_VARIANT_ID
      : overwriteVariants
      ? variants[previousVariantIndex - 1].folderName
      : (existingFolderByIndex.get(previousVariantIndex) ?? variants[previousVariantIndex - 1].folderName);

    const seedDir = variant.index === 1
      ? baselineDir
      : join(comboDir, previousVariantFolder);

    steps.push({
      variantId: variant.id,
      variantTitle: variant.title,
      variantFolder: variant.folderName,
      variantPromptText: variant.promptText,
      targetDir: join(comboDir, variant.folderName),
      seedDir,
    });
  }

  return {
    comboDirName,
    comboDir,
    comboDirExists,
    baselineExists,
    lastContiguousVariant,
    steps,
  };
}

async function copyVariantSeed(sourceDir: string, destinationDir: string): Promise<void> {
  if (!existsSync(sourceDir)) {
    throw new Error(`Cannot seed variant; source directory does not exist: ${sourceDir}`);
  }

  if (existsSync(destinationDir)) {
    await rm(destinationDir, { recursive: true, force: true });
  }

  await cp(sourceDir, destinationDir, {
    recursive: true,
    force: true,
    filter: (sourcePath) => {
      const normalized = sourcePath.replace(/\\/g, '/');
      const name = normalized.split('/').pop() ?? '';

      if (name === 'node_modules' || name === 'dist' || name === '.git' || name === '.DS_Store') {
        return false;
      }

      return true;
    },
  });
}

function buildAgentCommand(
  item: MatrixItem,
  prompt: string,
  options?: { geminiSystemSettingsPath?: string },
): CommandSpec {
  const providerId = normalizeKey(item.provider.id);

  if (providerId === 'claude') {
    return {
      command: item.provider.binary,
      args: ['-p', '--model', item.model.id, '--permission-mode', 'bypassPermissions', prompt],
    };
  }

  if (providerId === 'codex') {
    return {
      command: item.provider.binary,
      args: ['exec', '--model', item.model.id, '--dangerously-bypass-approvals-and-sandbox', prompt],
    };
  }

  if (providerId === 'gemini') {
    const geminiEnv: NodeJS.ProcessEnv = { ...env };
    if (options?.geminiSystemSettingsPath) {
      geminiEnv.GEMINI_CLI_SYSTEM_SETTINGS_PATH = options.geminiSystemSettingsPath;
    }

    return {
      command: item.provider.binary,
      args: ['-p', prompt, '--model', item.model.id, '--approval-mode', 'yolo', '--extensions', ''],
      env: geminiEnv,
    };
  }

  throw new Error(`Unsupported provider id: ${item.provider.id}`);
}

async function commandExists(command: string): Promise<boolean> {
  const result = await runProcess(
    {
      command: 'bash',
      args: ['-lc', `command -v ${JSON.stringify(command)} >/dev/null 2>&1`],
      runCwd: ROOT,
      timeoutMs: 5_000,
      stdoutPath: '/dev/null',
      stderrPath: '/dev/null',
    },
    false,
  );

  return result.exitCode === 0;
}

async function runProcess(
  options: {
    command: string;
    args: string[];
    env?: NodeJS.ProcessEnv;
    runCwd: string;
    timeoutMs: number;
    stdoutPath: string;
    stderrPath: string;
  },
  append = false,
): Promise<CommandRunResult> {
  const start = Date.now();
  let timedOut = false;

  await mkdir(join(options.stdoutPath, '..'), { recursive: true }).catch(() => undefined);
  await mkdir(join(options.stderrPath, '..'), { recursive: true }).catch(() => undefined);

  const stdoutStream = createWriteStream(options.stdoutPath, { flags: append ? 'a' : 'w' });
  const stderrStream = createWriteStream(options.stderrPath, { flags: append ? 'a' : 'w' });

  return await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(options.command, options.args, {
      cwd: options.runCwd,
      env: options.env ?? env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout?.pipe(stdoutStream);
    child.stderr?.pipe(stderrStream);

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
        }
      }, 3_000);
    }, options.timeoutMs);

    child.on('error', (error) => {
      clearTimeout(timeoutHandle);
      stdoutStream.end();
      stderrStream.end();
      rejectPromise(error);
    });

    child.on('close', (exitCode, signal) => {
      clearTimeout(timeoutHandle);
      stdoutStream.end();
      stderrStream.end();

      resolvePromise({
        exitCode,
        signal,
        timedOut,
        durationMs: Date.now() - start,
      });
    });
  });
}

async function listFilesRecursive(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(fullPath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function runValidation(
  outputDir: string,
  artifactDir: string,
  timeoutMs: number,
): Promise<ValidationSummary> {
  const packageJsonPath = join(outputDir, 'package.json');
  const packageJsonExists = existsSync(packageJsonPath);

  const validationStdoutPath = join(artifactDir, 'validation.stdout.log');
  const validationStderrPath = join(artifactDir, 'validation.stderr.log');

  if (!packageJsonExists) {
    return {
      packageJsonExists,
      install: null,
      build: null,
      smoke: {
        distExists: false,
        indexHtmlExists: false,
        jsAssetFound: false,
        htmlHasGameSurface: false,
        pass: false,
      },
      pass: false,
    };
  }

  await writeFile(validationStdoutPath, '== npm install ==\n', 'utf8');
  await writeFile(validationStderrPath, '== npm install ==\n', 'utf8');

  const installResult = await runProcess(
    {
      command: 'npm',
      args: ['install'],
      runCwd: outputDir,
      timeoutMs,
      stdoutPath: validationStdoutPath,
      stderrPath: validationStderrPath,
    },
    true,
  );

  await writeFile(validationStdoutPath, '\n== npm run build ==\n', { encoding: 'utf8', flag: 'a' });
  await writeFile(validationStderrPath, '\n== npm run build ==\n', { encoding: 'utf8', flag: 'a' });

  let buildResult: CommandRunResult | null = null;
  if (installResult.exitCode === 0 && !installResult.timedOut) {
    buildResult = await runProcess(
      {
        command: 'npm',
        args: ['run', 'build'],
        runCwd: outputDir,
        timeoutMs,
        stdoutPath: validationStdoutPath,
        stderrPath: validationStderrPath,
      },
      true,
    );
  }

  const distDir = join(outputDir, 'dist');
  const distExists = existsSync(distDir) && (await stat(distDir)).isDirectory();

  const indexHtmlPath = join(distDir, 'index.html');
  const indexHtmlExists = existsSync(indexHtmlPath);

  let jsAssetFound = false;
  let htmlHasGameSurface = false;

  if (distExists) {
    const files = await listFilesRecursive(distDir);
    jsAssetFound = files.some((file) => file.endsWith('.js'));
  }

  if (indexHtmlExists) {
    const html = await readFile(indexHtmlPath, 'utf8');
    jsAssetFound = jsAssetFound || /<script\b/i.test(html);
    htmlHasGameSurface = /<canvas\b|id=["'](?:app|root|game)["']|<main\b|<body\b/i.test(html);
  }

  const smokePass = distExists && indexHtmlExists && jsAssetFound && htmlHasGameSurface;

  const pass = installResult.exitCode === 0 && !installResult.timedOut &&
    buildResult !== null && buildResult.exitCode === 0 && !buildResult.timedOut && smokePass;

  return {
    packageJsonExists,
    install: installResult,
    build: buildResult,
    smoke: {
      distExists,
      indexHtmlExists,
      jsAssetFound,
      htmlHasGameSurface,
      pass: smokePass,
    },
    pass,
  };
}

function determineFailureCategory(
  agentResult: CommandRunResult | null,
  validation: ValidationSummary | null,
): RunResult['failureCategory'] {
  if (agentResult?.timedOut) {
    return 'timeout';
  }

  if (!agentResult || agentResult.exitCode !== 0) {
    return 'agent_error';
  }

  if (!validation) {
    return 'build_error';
  }

  const installFailed = !validation.install || validation.install.exitCode !== 0 || validation.install.timedOut;
  const buildFailed = !validation.build || validation.build.exitCode !== 0 || validation.build.timedOut;

  if (installFailed || buildFailed) {
    return 'build_error';
  }

  if (!validation.smoke.pass) {
    return 'smoke_error';
  }

  return 'none';
}

function resolveMatrix(config: HarnessConfig, args: Args): MatrixItem[] {
  const requestedGames = args.games?.map(normalizeKey) ?? null;
  const selectedGames = config.games.filter((game) => {
    if (!requestedGames || requestedGames.length === 0) {
      return true;
    }
    return requestedGames.includes(normalizeKey(game.key));
  });

  if (selectedGames.length === 0) {
    throw new Error('No games matched the requested filters.');
  }

  const gamesInRunOrder = selectedGames
    .map((game, index) => ({ game, index }))
    .sort((a, b) => {
      if (a.game.releaseYear !== b.game.releaseYear) {
        return a.game.releaseYear - b.game.releaseYear;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.game);

  const requestedAgents = args.agents?.map(normalizeKey) ?? null;
  const selectedProviders = config.providers.filter((provider) => {
    if (!requestedAgents || requestedAgents.length === 0) {
      return true;
    }
    return requestedAgents.includes(normalizeKey(provider.id));
  });

  if (selectedProviders.length === 0) {
    throw new Error('No providers matched the requested filters.');
  }

  const matrix: MatrixItem[] = [];

  for (const game of gamesInRunOrder) {
    for (const provider of selectedProviders) {
      const selectedModels = provider.models.filter((model) => {
        if (!args.models || args.models.length === 0) {
          return true;
        }

        return args.models.some((filter) => {
          if (filter.providerId && normalizeKey(filter.providerId) !== normalizeKey(provider.id)) {
            return false;
          }
          return normalizeKey(filter.modelKey) === normalizeKey(model.key);
        });
      });

      for (const model of selectedModels) {
        matrix.push({ game, provider, model });
      }
    }
  }

  if (matrix.length === 0) {
    throw new Error('No matrix entries matched the provided filters.');
  }

  return matrix;
}

async function ensureTooling(binaries: string[]): Promise<void> {
  const missing: string[] = [];

  for (const binary of binaries) {
    const found = await commandExists(binary);
    if (!found) {
      missing.push(binary);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required binaries: ${missing.join(', ')}`);
  }
}

function buildVariantManifest(
  variants: VariantDefinition[],
  variantsSourcePath: string | null,
): VariantManifest {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourcePath: variantsSourcePath,
    variants,
  };
}

function buildVariantPrompt(basePrompt: string, step: PlanStep): string {
  if (step.variantId === BASELINE_VARIANT_ID) {
    return `${basePrompt}\n\nGeneration scope constraints:\n- Operate only on files inside the current working directory.\n- Do not read or write parent/sibling directories.`;
  }

  return [
    basePrompt,
    '',
    'Variant addendum:',
    `- Variant id: ${step.variantId}`,
    `- Variant title: ${step.variantTitle}`,
    step.variantPromptText.length > 0 ? step.variantPromptText : '- No additional requirement text provided.',
    '',
    'Generation scope constraints:',
    '- Operate only on files inside the current working directory.',
    '- Do not read or write parent/sibling directories.',
    '',
    'The current working directory was pre-seeded from the previous variant. Modify this version to satisfy the addendum.',
  ].join('\n');
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2));

    const configPath = resolve(ROOT, args.configPath);
    const configRaw = await readFile(configPath, 'utf8');
    const config = JSON.parse(configRaw) as HarnessConfig;

    const promptPath = resolve(ROOT, args.promptPath ?? config.defaults.promptPath);
    const promptTemplate = await readFile(promptPath, 'utf8');

    const variantsSourcePath = args.variantsFilePath ? resolve(ROOT, args.variantsFilePath) : null;
    const variantDefinitions = variantsSourcePath
      ? parseVariantsMarkdown(await readFile(variantsSourcePath, 'utf8'))
      : [];

    const outputBaseDir = resolve(ROOT, config.defaults.outputBaseDir);
    const backupBaseDir = resolve(ROOT, config.defaults.backupBaseDir);
    const runsBaseDir = resolve(ROOT, config.defaults.runsBaseDir);
    const geminiSystemSettingsPath = resolve(ROOT, 'config/gemini-system-settings.json');

    const matrix = resolveMatrix(config, args);

    const plansByCombo = new Map<string, ComboExecutionPlan>();
    for (const item of matrix) {
      const plan = await buildExecutionPlan(item, outputBaseDir, variantDefinitions, args.overwriteVariants);
      plansByCombo.set(plan.comboDirName, plan);
    }

    const executableStepCount = [...plansByCombo.values()].reduce((total, plan) => total + plan.steps.length, 0);

    if (!args.dryRun && executableStepCount > 0) {
      const selectedBinaries = [...new Set(matrix.map((item) => item.provider.binary))];
      selectedBinaries.push('npm');
      await ensureTooling(selectedBinaries);
    }

    const runBatchTimestamp = fileTimestamp(new Date());
    const runBatchId = `${runBatchTimestamp}_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
    const runBatchDir = join(runsBaseDir, runBatchId);

    if (!args.dryRun) {
      await mkdir(outputBaseDir, { recursive: true });
      await mkdir(backupBaseDir, { recursive: true });
    }
    await mkdir(runBatchDir, { recursive: true });

    const timeoutMinutes = args.timeoutMinutes ?? config.defaults.timeoutMinutes;
    const timeoutMs = timeoutMinutes * 60_000;

    console.log(`Harness batch: ${runBatchId}`);
    console.log(`Matrix items: ${matrix.length}`);
    console.log(`Planned variant definitions: ${variantDefinitions.length}`);
    console.log(`Dry run: ${args.dryRun ? 'yes' : 'no'}`);
    console.log(`Overwrite variants: ${args.overwriteVariants ? 'yes' : 'no'}`);
    console.log(`Planned executable steps: ${executableStepCount}`);

    const summary: RunResult[] = [];

    for (let i = 0; i < matrix.length; i++) {
      const item = matrix[i];
      const comboDirName = resolveComboDirName(item, outputBaseDir);
      const plan = plansByCombo.get(comboDirName);

      if (!plan) {
        throw new Error(`Missing execution plan for combo ${comboDirName}`);
      }

      const matrixPrefix = String(i + 1).padStart(3, '0');
      const matrixLabel = `${item.provider.id}:${item.model.key} -> ${item.game.key}`;
      const comboStart = Date.now();

      console.log(`\n[${i + 1}/${matrix.length}] ${matrixLabel}`);
      console.log(`  existing baseline: ${plan.baselineExists ? 'yes' : 'no'}`);
      console.log(`  last contiguous variant: v${plan.lastContiguousVariant}`);
      console.log(`  planned steps: ${plan.steps.length}`);

      if (!args.dryRun) {
        if (plan.comboDirExists && args.overwriteVariants) {
          const backupName = `${plan.comboDirName}.${runBatchId}`;
          const backupPath = join(backupBaseDir, backupName);
          await rename(plan.comboDir, backupPath);
          await mkdir(plan.comboDir, { recursive: true });
        } else {
          await mkdir(plan.comboDir, { recursive: true });
        }

        const manifest = buildVariantManifest(variantDefinitions, variantsSourcePath);
        await writeFile(join(plan.comboDir, 'variants.json'), JSON.stringify(manifest, null, 2), 'utf8');
      }

      if (plan.steps.length === 0) {
        const runId = `${matrixPrefix}_${slug(item.provider.id)}_${slug(item.model.key)}_${slug(item.game.key)}_up_to_date`;
        const artifactDir = join(runBatchDir, runId);
        await mkdir(artifactDir, { recursive: true });

        const runResult: RunResult = {
          runId,
          game: item.game.key,
          provider: item.provider.id,
          modelKey: item.model.key,
          modelId: item.model.id,
          comboDir: plan.comboDir,
          outputDir: plan.comboDir,
          variantId: null,
          variantTitle: null,
          variantFolder: null,
          durationMs: Date.now() - comboStart,
          agent: null,
          validation: null,
          skipped: true,
          skipReason: 'up_to_date',
          failureCategory: 'none',
        };

        summary.push(runResult);
        await writeFile(join(artifactDir, 'result.json'), JSON.stringify(runResult, null, 2), 'utf8');

        console.log('  skipped: combo is already up to date');
        continue;
      }

      for (let stepIndex = 0; stepIndex < plan.steps.length; stepIndex++) {
        const step = plan.steps[stepIndex];
        const stepStart = Date.now();
        const runId = `${matrixPrefix}_${slug(item.provider.id)}_${slug(item.model.key)}_${slug(item.game.key)}_${slug(step.variantId)}`;
        const artifactDir = join(runBatchDir, runId);

        await mkdir(artifactDir, { recursive: true });

        if (!args.dryRun) {
          if (step.seedDir) {
            await copyVariantSeed(step.seedDir, step.targetDir);
          } else {
            await mkdir(step.targetDir, { recursive: true });
          }
        }

        const baseRenderedPrompt = renderPrompt(promptTemplate, {
          GAME_KEY: item.game.key,
          GAME_NAME: item.game.name,
          MODEL_PROVIDER: item.provider.id,
          MODEL_KEY: item.model.key,
          MODEL_ID: item.model.id,
          OUTPUT_DIR: step.targetDir,
          VARIANT_ID: step.variantId,
          VARIANT_TITLE: step.variantTitle,
          VARIANT_REQUIREMENTS: step.variantPromptText,
          VARIANT_FOLDER: step.variantFolder,
          VARIANT_PROMPT_BLOCK: step.variantPromptText,
        });

        const renderedPrompt = buildVariantPrompt(baseRenderedPrompt, step);

        const commandSpec = buildAgentCommand(item, renderedPrompt, {
          geminiSystemSettingsPath,
        });

        await writeFile(join(artifactDir, 'prompt.txt'), renderedPrompt, 'utf8');
        await writeFile(
          join(artifactDir, 'command.json'),
          JSON.stringify(
            {
              command: commandSpec.command,
              args: commandSpec.args,
              env: commandSpec.env,
              cwd: step.targetDir,
              timeoutMinutes,
              variantId: step.variantId,
              variantTitle: step.variantTitle,
              variantFolder: step.variantFolder,
            },
            null,
            2,
          ),
          'utf8',
        );

        console.log(`  step ${stepIndex + 1}/${plan.steps.length}: ${step.variantId} (${step.variantFolder})`);

        let agentResult: CommandRunResult | null = null;
        let validation: ValidationSummary | null = null;

        if (!args.dryRun) {
          agentResult = await runProcess(
            {
              command: commandSpec.command,
              args: commandSpec.args,
              env: commandSpec.env,
              runCwd: step.targetDir,
              timeoutMs,
              stdoutPath: join(artifactDir, 'agent.stdout.log'),
              stderrPath: join(artifactDir, 'agent.stderr.log'),
            },
            false,
          );

          validation = await runValidation(step.targetDir, artifactDir, timeoutMs);
        }

        const failureCategory = args.dryRun
          ? 'none'
          : determineFailureCategory(agentResult, validation);

        const runResult: RunResult = {
          runId,
          game: item.game.key,
          provider: item.provider.id,
          modelKey: item.model.key,
          modelId: item.model.id,
          comboDir: plan.comboDir,
          outputDir: step.targetDir,
          variantId: step.variantId,
          variantTitle: step.variantTitle,
          variantFolder: step.variantFolder,
          durationMs: Date.now() - stepStart,
          agent: agentResult,
          validation,
          skipped: false,
          skipReason: null,
          failureCategory,
        };

        summary.push(runResult);
        await writeFile(join(artifactDir, 'result.json'), JSON.stringify(runResult, null, 2), 'utf8');
        await writeFile(join(artifactDir, 'validation.json'), JSON.stringify(validation, null, 2), 'utf8');

        if (args.dryRun) {
          console.log('    dry-run complete');
        } else {
          console.log(`    category: ${failureCategory}`);
        }
      }
    }

    const summaryPath = join(runBatchDir, 'summary.json');
    await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

    const successCount = summary.filter((entry) => entry.failureCategory === 'none').length;
    const skippedCount = summary.filter((entry) => entry.skipped).length;
    console.log(
      `\nCompleted ${summary.length} run steps; success=${successCount}, failed=${summary.length - successCount}, skipped=${skippedCount}`,
    );
    console.log(`Summary: ${summaryPath}`);

    if (!args.dryRun && successCount !== summary.length) {
      exit(1);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    exit(1);
  }
}

await main();

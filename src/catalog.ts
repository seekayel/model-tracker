const GAME_RELEASE_YEARS: Record<string, number> = {
  pong: 1972,
  'space-invaders': 1978,
  asteroids: 1979,
  'pac-man': 1980,
  'donkey-kong': 1981,
  galaga: 1981,
  'mario-bros': 1983,
  tetris: 1984,
  gauntlet: 1985,
  'super-mario-brothers': 1985,
  civilization: 1991,
};

const GAME_DISPLAY_NAMES: Record<string, string> = {
  pong: 'Pong',
  'space-invaders': 'Space Invaders',
  asteroids: 'Asteroids',
  'pac-man': 'Pac-Man',
  'donkey-kong': 'Donkey Kong',
  galaga: 'Galaga',
  'mario-bros': 'Mario Bros.',
  tetris: 'Tetris',
  gauntlet: 'Gauntlet',
  'super-mario-brothers': 'Super Mario Bros.',
  civilization: 'Civilization',
};

type ParsedCombo = {
  providerId: string;
  modelKey: string;
  gameKey: string;
};

type VariantManifestItem = {
  index: number;
  id: string;
  title: string;
  slug: string;
  folderName: string;
  promptText: string;
};

type VariantManifest = {
  variants?: VariantManifestItem[];
};

type RepoEntry = ParsedCombo & {
  comboFolder: string;
  relativeProjectPath: string;
  variantId: string;
  variantOrder: number;
  variantTitle: string;
  variantPromptText: string;
  folderName: string;
  isNestedVariant: boolean;
};

export type CatalogGame = {
  key: string;
  name: string;
  releaseYear: number | null;
};

export type CatalogModel = {
  id: string;
  providerId: string;
  modelKey: string;
  modelId: string;
  label: string;
};

export type CatalogVariant = {
  id: string;
  order: number;
  title: string;
  label: string;
};

export type CatalogCell = {
  game: CatalogGame;
  model: CatalogModel;
  variant: CatalogVariant;
  folderName: string;
  isAvailable: boolean;
  playUrl?: string;
};

export type CatalogRow = {
  game: CatalogGame;
  cells: CatalogCell[];
};

export type CatalogVariantSection = {
  variant: CatalogVariant;
  rows: CatalogRow[];
};

export type CatalogComboVariant = {
  variant: CatalogVariant;
  folderName: string;
  requirementText: string;
  isAvailable: boolean;
  playUrl?: string;
};

export type CatalogComboDetail = {
  game: CatalogGame;
  model: CatalogModel;
  comboFolder: string;
  variants: CatalogComboVariant[];
};

export type CatalogData = {
  games: CatalogGame[];
  models: CatalogModel[];
  variants: CatalogVariant[];
  sections: CatalogVariantSection[];
  baselineRows: CatalogRow[];
  comboDetails: CatalogComboDetail[];
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function toTitleCaseFromSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseVariantIdFromFolder(folderName: string): { id: string; order: number } | null {
  const normalized = normalizeKey(folderName);
  if (normalized === 'baseline') {
    return { id: 'baseline', order: 0 };
  }

  const match = normalized.match(/^v(\d+)(?:-[a-z0-9-]+)?$/);
  if (!match) {
    return null;
  }

  const order = Number.parseInt(match[1], 10);
  if (!Number.isInteger(order) || order <= 0) {
    return null;
  }

  return {
    id: `v${order}`,
    order,
  };
}

function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
}

function buildGameUrl(relativeProjectPath: string): string {
  return `${getBaseUrl()}games/${relativeProjectPath}/`;
}

function buildVariantDetailUrl(gameKey: string, providerId: string, modelKey: string): string {
  const params = new URLSearchParams({ game: gameKey, provider: providerId, model: modelKey });
  return `#/variant?${params.toString()}`;
}

function extractRelativeProjectPath(modulePath: string): string | null {
  const match = modulePath.match(/^\.\.\/games\/(.+)\/package\.json$/);
  return match?.[1] ?? null;
}

function extractComboFromManifestPath(modulePath: string): string | null {
  const match = modulePath.match(/^\.\.\/games\/([^/]+)\/variants\.json$/);
  return match?.[1] ?? null;
}

function inferCommonGameKeys(remainders: string[]): string[] {
  const suffixToPrefixes = new Map<string, Set<string>>();

  for (const remainder of remainders) {
    const parts = remainder.split('-').filter(Boolean);
    for (let splitIndex = 1; splitIndex < parts.length; splitIndex++) {
      const modelPrefix = parts.slice(0, splitIndex).join('-');
      const gameSuffix = parts.slice(splitIndex).join('-');

      if (!modelPrefix || !gameSuffix) {
        continue;
      }

      const prefixes = suffixToPrefixes.get(gameSuffix) ?? new Set<string>();
      prefixes.add(modelPrefix);
      suffixToPrefixes.set(gameSuffix, prefixes);
    }
  }

  return [...suffixToPrefixes.entries()]
    .filter(([, prefixes]) => prefixes.size >= 2)
    .map(([gameKey]) => gameKey)
    .sort((a, b) => b.length - a.length);
}

function splitModelAndGameKey(remainder: string, knownGameKeys: string[]): { modelKey: string; gameKey: string } | null {
  const uniqueCandidates = [...new Set(knownGameKeys.map(normalizeKey).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );

  for (const candidate of uniqueCandidates) {
    const suffix = `-${candidate}`;
    if (!remainder.endsWith(suffix)) {
      continue;
    }

    const modelKey = remainder.slice(0, -suffix.length);
    if (modelKey.length > 0) {
      return {
        modelKey,
        gameKey: candidate,
      };
    }
  }

  const parts = remainder.split('-').filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  return {
    modelKey: parts.slice(0, -1).join('-'),
    gameKey: parts[parts.length - 1],
  };
}

function parseComboFolder(folderName: string, knownGameKeys: string[]): ParsedCombo | null {
  const normalized = normalizeKey(folderName);
  const segments = normalized.split('-').filter(Boolean);
  if (segments.length < 3) {
    return null;
  }

  const providerId = segments[0];
  const remainder = segments.slice(1).join('-');
  const split = splitModelAndGameKey(remainder, knownGameKeys);
  if (!split) {
    return null;
  }

  return {
    providerId,
    modelKey: split.modelKey,
    gameKey: split.gameKey,
  };
}

function compareModels(a: CatalogModel, b: CatalogModel): number {
  if (a.providerId !== b.providerId) {
    return a.providerId.localeCompare(b.providerId, 'en', { numeric: true });
  }

  return a.modelKey.localeCompare(b.modelKey, 'en', { numeric: true });
}

function compareGames(a: CatalogGame, b: CatalogGame): number {
  if (a.releaseYear !== null && b.releaseYear !== null && a.releaseYear !== b.releaseYear) {
    return a.releaseYear - b.releaseYear;
  }

  if (a.releaseYear !== null && b.releaseYear === null) {
    return -1;
  }

  if (a.releaseYear === null && b.releaseYear !== null) {
    return 1;
  }

  return a.name.localeCompare(b.name, 'en', { numeric: true });
}

function compareVariants(a: CatalogVariant, b: CatalogVariant): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.id.localeCompare(b.id, 'en', { numeric: true });
}

function normalizeVariantManifest(value: unknown): VariantManifest {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const obj = value as Record<string, unknown>;
  const rawVariants = Array.isArray(obj.variants) ? obj.variants : [];

  const variants = rawVariants
    .map((raw) => {
      if (!raw || typeof raw !== 'object') {
        return null;
      }

      const source = raw as Record<string, unknown>;
      const index = typeof source.index === 'number' ? source.index : Number.NaN;
      const id = typeof source.id === 'string' ? source.id : '';
      const title = typeof source.title === 'string' ? source.title : '';
      const slug = typeof source.slug === 'string' ? source.slug : '';
      const folderName = typeof source.folderName === 'string' ? source.folderName : '';
      const promptText = typeof source.promptText === 'string' ? source.promptText : '';

      if (!Number.isInteger(index) || index <= 0 || id.length === 0 || title.length === 0 || folderName.length === 0) {
        return null;
      }

      return {
        index,
        id,
        title,
        slug,
        folderName,
        promptText,
      } satisfies VariantManifestItem;
    })
    .filter((item): item is VariantManifestItem => item !== null)
    .sort((a, b) => a.index - b.index);

  return { variants };
}

function buildCatalog(): CatalogData {
  const packageModules = import.meta.glob('../games/**/package.json');
  const packagePaths = Object.keys(packageModules)
    .map(extractRelativeProjectPath)
    .filter((path): path is string => Boolean(path))
    .filter((path) => !path.startsWith('.backups/'))
    .filter((path) => !path.includes('/.backups/'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  const comboFolders = [...new Set(
    packagePaths
      .map((projectPath) => projectPath.split('/')[0])
      .filter((folder) => Boolean(folder) && !folder.startsWith('.')),
  )];

  const remainders = comboFolders
    .map((folderName) => normalizeKey(folderName).split('-').slice(1).join('-'))
    .filter((remainder) => remainder.length > 0);

  const knownGameKeys = [...Object.keys(GAME_RELEASE_YEARS), ...inferCommonGameKeys(remainders)];

  const manifestModules = import.meta.glob('../games/*/variants.json', { eager: true }) as Record<string, unknown>;
  const manifestByCombo = new Map<string, VariantManifest>();

  for (const [modulePath, moduleValue] of Object.entries(manifestModules)) {
    const comboFolder = extractComboFromManifestPath(modulePath);
    if (!comboFolder) {
      continue;
    }

    const normalizedModule = moduleValue as { default?: unknown };
    manifestByCombo.set(comboFolder, normalizeVariantManifest(normalizedModule.default));
  }

  const entries: RepoEntry[] = packagePaths
    .map((projectPath) => {
      const segments = projectPath.split('/').filter(Boolean);
      if (segments.length === 0) {
        return null;
      }

      const comboFolder = segments[0];
      const parsedCombo = parseComboFolder(comboFolder, knownGameKeys);
      if (!parsedCombo) {
        return null;
      }

      if (segments.length > 2) {
        return null;
      }

      const manifest = manifestByCombo.get(comboFolder);
      const variantManifestMap = new Map((manifest?.variants ?? []).map((variant) => [variant.id, variant]));

      if (segments.length === 1) {
        return {
          ...parsedCombo,
          comboFolder,
          relativeProjectPath: projectPath,
          variantId: 'baseline',
          variantOrder: 0,
          variantTitle: 'Baseline',
          variantPromptText: '',
          folderName: comboFolder,
          isNestedVariant: false,
        } satisfies RepoEntry;
      }

      const variantFolder = segments[1];
      const parsedVariant = parseVariantIdFromFolder(variantFolder);
      if (!parsedVariant) {
        return null;
      }

      const manifestVariant = variantManifestMap.get(parsedVariant.id);

      return {
        ...parsedCombo,
        comboFolder,
        relativeProjectPath: projectPath,
        variantId: parsedVariant.id,
        variantOrder: parsedVariant.order,
        variantTitle: manifestVariant?.title ?? (parsedVariant.id === 'baseline' ? 'Baseline' : toTitleCaseFromSlug(variantFolder)),
        variantPromptText: manifestVariant?.promptText ?? '',
        folderName: projectPath,
        isNestedVariant: true,
      } satisfies RepoEntry;
    })
    .filter((entry): entry is RepoEntry => entry !== null);

  const models: CatalogModel[] = [...new Map(
    entries.map((entry) => {
      const modelId = `${entry.providerId}:${entry.modelKey}`;
      return [
        modelId,
        {
          id: modelId,
          providerId: entry.providerId,
          modelKey: entry.modelKey,
          modelId: entry.modelKey,
          label: modelId,
        } satisfies CatalogModel,
      ];
    }),
  ).values()].sort(compareModels);

  const games: CatalogGame[] = [...new Map(
    entries.map((entry) => {
      const releaseYear = GAME_RELEASE_YEARS[entry.gameKey] ?? null;
      return [
        entry.gameKey,
        {
          key: entry.gameKey,
          name: GAME_DISPLAY_NAMES[entry.gameKey] ?? toTitleCaseFromSlug(entry.gameKey),
          releaseYear,
        } satisfies CatalogGame,
      ];
    }),
  ).values()].sort(compareGames);

  const variantTitleById = new Map<string, string>();
  variantTitleById.set('baseline', 'Baseline');
  for (const entry of entries) {
    if (!variantTitleById.has(entry.variantId)) {
      variantTitleById.set(entry.variantId, entry.variantTitle);
    }
  }

  const variants: CatalogVariant[] = [...new Map(
    entries.map((entry) => {
      const title = variantTitleById.get(entry.variantId) ?? entry.variantTitle;
      return [
        entry.variantId,
        {
          id: entry.variantId,
          order: entry.variantOrder,
          title,
          label: entry.variantId === 'baseline' ? 'baseline' : `${entry.variantId} - ${title}`,
        } satisfies CatalogVariant,
      ];
    }),
  ).values()].sort(compareVariants);

  const entryByVariantCell = new Map<string, RepoEntry>();
  for (const entry of entries) {
    const key = `${entry.variantId}|${entry.gameKey}|${entry.providerId}:${entry.modelKey}`;
    const existing = entryByVariantCell.get(key);

    if (!existing) {
      entryByVariantCell.set(key, entry);
      continue;
    }

    // Prefer nested variant folders over legacy root folders when both exist.
    if (!existing.isNestedVariant && entry.isNestedVariant) {
      entryByVariantCell.set(key, entry);
    }
  }

  const sections: CatalogVariantSection[] = variants.map((variant) => ({
    variant,
    rows: games.map((game) => ({
      game,
      cells: models.map((model) => {
        const cellKey = `${variant.id}|${game.key}|${model.id}`;
        const entry = entryByVariantCell.get(cellKey);

        if (!entry) {
          return {
            game,
            model,
            variant,
            folderName: '',
            isAvailable: false,
            playUrl: undefined,
          } satisfies CatalogCell;
        }

        return {
          game,
          model,
          variant,
          folderName: entry.folderName,
          isAvailable: true,
          playUrl: buildGameUrl(entry.relativeProjectPath),
        } satisfies CatalogCell;
      }),
    })),
  }));

  const baselineRows = sections.find((section) => section.variant.id === 'baseline')?.rows ?? [];

  const modelById = new Map(models.map((model) => [model.id, model]));
  const gameByKey = new Map(games.map((game) => [game.key, game]));

  const comboGroups = new Map<string, RepoEntry[]>();
  for (const entry of entries) {
    const comboKey = `${entry.gameKey}|${entry.providerId}:${entry.modelKey}`;
    const group = comboGroups.get(comboKey) ?? [];
    group.push(entry);
    comboGroups.set(comboKey, group);
  }

  const comboDetails: CatalogComboDetail[] = [];
  for (const [comboKey, comboEntries] of comboGroups.entries()) {
    const [gameKey, modelId] = comboKey.split('|');
    const model = modelById.get(modelId);
    const game = gameByKey.get(gameKey);
    if (!model || !game) {
      continue;
    }

    const representative = comboEntries[0];
    const manifest = manifestByCombo.get(representative.comboFolder);
    const entryByVariant = new Map(comboEntries.map((entry) => [entry.variantId, entry]));

    const comboVariants: CatalogVariant[] = [
      {
        id: 'baseline',
        order: 0,
        title: 'Baseline',
        label: 'baseline',
      },
    ];

    if (manifest?.variants && manifest.variants.length > 0) {
      for (const manifestVariant of manifest.variants) {
        comboVariants.push({
          id: manifestVariant.id,
          order: manifestVariant.index,
          title: manifestVariant.title,
          label: `${manifestVariant.id} - ${manifestVariant.title}`,
        });
      }
    } else {
      const discoveredVariants = comboEntries
        .filter((entry) => entry.variantId !== 'baseline')
        .map((entry) => ({
          id: entry.variantId,
          order: entry.variantOrder,
          title: entry.variantTitle,
          label: `${entry.variantId} - ${entry.variantTitle}`,
        }))
        .sort(compareVariants);

      comboVariants.push(...discoveredVariants);
    }

    const uniqueComboVariants = [...new Map(
      comboVariants.map((variant) => [variant.id, variant]),
    ).values()].sort(compareVariants);

    const variantItems = uniqueComboVariants.map((variant) => {
      const matchedEntry = entryByVariant.get(variant.id);

      let requirementText = '';
      if (variant.id !== 'baseline' && manifest?.variants) {
        const manifestVariant = manifest.variants.find((item) => item.id === variant.id);
        requirementText = manifestVariant?.promptText ?? '';
      }

      return {
        variant,
        folderName: matchedEntry?.folderName ?? `${representative.comboFolder}/${variant.id}`,
        requirementText,
        isAvailable: Boolean(matchedEntry),
        playUrl: matchedEntry ? buildGameUrl(matchedEntry.relativeProjectPath) : undefined,
      } satisfies CatalogComboVariant;
    });

    comboDetails.push({
      game,
      model,
      comboFolder: representative.comboFolder,
      variants: variantItems,
    });
  }

  comboDetails.sort((a, b) => {
    if (a.game.releaseYear !== b.game.releaseYear) {
      if (a.game.releaseYear === null) {
        return 1;
      }
      if (b.game.releaseYear === null) {
        return -1;
      }
      return a.game.releaseYear - b.game.releaseYear;
    }

    if (a.game.key !== b.game.key) {
      return a.game.key.localeCompare(b.game.key, 'en', { numeric: true });
    }

    return a.model.id.localeCompare(b.model.id, 'en', { numeric: true });
  });

  return {
    games,
    models,
    variants,
    sections,
    baselineRows,
    comboDetails,
  };
}

export function findComboDetail(gameKey: string, providerId: string, modelKey: string): CatalogComboDetail | null {
  const normalizedGameKey = normalizeKey(gameKey);
  const normalizedProviderId = normalizeKey(providerId);
  const normalizedModelKey = normalizeKey(modelKey);

  return catalogData.comboDetails.find(
    (detail) =>
      normalizeKey(detail.game.key) === normalizedGameKey &&
      normalizeKey(detail.model.providerId) === normalizedProviderId &&
      normalizeKey(detail.model.modelKey) === normalizedModelKey,
  ) ?? null;
}

export { buildVariantDetailUrl };

export const catalogData = buildCatalog();

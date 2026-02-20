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

type ParsedFolder = {
  providerId: string;
  modelKey: string;
  gameKey: string;
};

type RepoMatrixEntry = ParsedFolder & {
  folderName: string;
  isPlayable: boolean;
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

export type CatalogCell = {
  game: CatalogGame;
  model: CatalogModel;
  folderName: string;
  isAvailable: boolean;
  playUrl?: string;
};

export type CatalogRow = {
  game: CatalogGame;
  cells: CatalogCell[];
};

export type CatalogData = {
  games: CatalogGame[];
  models: CatalogModel[];
  rows: CatalogRow[];
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

function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
}

function buildGameUrl(folderName: string): string {
  return `${getBaseUrl()}games/${folderName}/`;
}

function extractFolderName(path: string): string | null {
  const match = path.match(/^\.\.\/games\/([^/]+)\//);
  return match?.[1] ?? null;
}

function getMatrixCandidateFolders(): Set<string> {
  const packages = import.meta.glob('../games/*/package.json');
  const folders = Object.keys(packages)
    .map(extractFolderName)
    .filter((folder): folder is string => Boolean(folder))
    .filter((folder) => !folder.startsWith('.'));

  return new Set(folders);
}

function getPlayableFolders(): Set<string> {
  const packages = import.meta.glob('../games/*/package.json');
  const folders = Object.keys(packages)
    .map(extractFolderName)
    .filter((folder): folder is string => Boolean(folder))
    .filter((folder) => !folder.startsWith('.'));

  return new Set(folders);
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

function parseMatrixFolder(folderName: string, knownGameKeys: string[]): ParsedFolder | null {
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

function buildCatalog(): CatalogData {
  const playableFolders = getPlayableFolders();
  const candidateFolders = [...getMatrixCandidateFolders()].sort((a, b) =>
    a.localeCompare(b, 'en', { numeric: true }),
  );

  const remainders = candidateFolders
    .map((folderName) => normalizeKey(folderName).split('-').slice(1).join('-'))
    .filter((remainder) => remainder.length > 0);

  const knownGameKeys = [...Object.keys(GAME_RELEASE_YEARS), ...inferCommonGameKeys(remainders)];

  const entries: RepoMatrixEntry[] = candidateFolders
    .map((folderName) => {
      const parsed = parseMatrixFolder(folderName, knownGameKeys);
      if (!parsed) {
        return null;
      }

      return {
        ...parsed,
        folderName,
        isPlayable: playableFolders.has(folderName),
      };
    })
    .filter((entry): entry is RepoMatrixEntry => entry !== null);

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

  const entriesByCell = new Map(
    entries.map((entry) => [`${entry.gameKey}|${entry.providerId}:${entry.modelKey}`, entry]),
  );

  const rows: CatalogRow[] = games.map((game) => ({
    game,
    cells: models.map((model) => {
      const cellId = `${game.key}|${model.id}`;
      const entry = entriesByCell.get(cellId);

      if (!entry) {
        return {
          game,
          model,
          folderName: '',
          isAvailable: false,
          playUrl: undefined,
        };
      }

      return {
        game,
        model,
        folderName: entry.folderName,
        isAvailable: entry.isPlayable,
        playUrl: entry.isPlayable ? buildGameUrl(entry.folderName) : undefined,
      };
    }),
  }));

  return {
    games,
    models,
    rows,
  };
}

export const catalogData = buildCatalog();

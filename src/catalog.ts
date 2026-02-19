import harnessConfigRaw from '../config/agent-harness.config.json?raw';

type HarnessConfig = {
  games: HarnessGame[];
  providers: HarnessProvider[];
};

type HarnessGame = {
  key: string;
  name: string;
};

type HarnessModel = {
  key: string;
  id: string;
  label?: string;
};

type HarnessProvider = {
  id: string;
  models: HarnessModel[];
};

export type CatalogGame = {
  key: string;
  name: string;
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

function slug(value: string): string {
  return normalizeKey(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
}

function buildGameUrl(folderName: string): string {
  return `${getBaseUrl()}games/${folderName}/`;
}

function getDiscoveredGameFolders(): Set<string> {
  const packages = import.meta.glob('../games/*/package.json', { eager: true });
  const folders = Object.keys(packages)
    .map((path) => path.match(/^\.\.\/games\/([^/]+)\/package\.json$/)?.[1])
    .filter((folder): folder is string => Boolean(folder));

  return new Set(folders);
}

function buildCatalog(): CatalogData {
  const config = JSON.parse(harnessConfigRaw) as HarnessConfig;
  const discoveredFolders = getDiscoveredGameFolders();

  const games: CatalogGame[] = config.games.map((game) => ({
    key: game.key,
    name: game.name,
  }));

  const models: CatalogModel[] = config.providers.flatMap((provider) =>
    provider.models.map((model) => ({
      id: `${provider.id}:${model.key}`,
      providerId: provider.id,
      modelKey: model.key,
      modelId: model.id,
      label: model.label ?? `${provider.id}:${model.key}`,
    })),
  );

  const rows: CatalogRow[] = games.map((game) => {
    const cells = models.map((model) => {
      const folderName = `${slug(model.providerId)}-${slug(model.modelKey)}-${slug(game.key)}`;
      const isAvailable = discoveredFolders.has(folderName);

      return {
        game,
        model,
        folderName,
        isAvailable,
        playUrl: isAvailable ? buildGameUrl(folderName) : undefined,
      };
    });

    return {
      game,
      cells,
    };
  });

  return {
    games,
    models,
    rows,
  };
}

export const catalogData = buildCatalog();

import type { CatalogModel, CatalogRow } from '../catalog';

type GridPageProps = {
  models: CatalogModel[];
  rows: CatalogRow[];
};

export default function GridPage({ models, rows }: GridPageProps) {
  return (
    <main className="route-page grid-page">
      <div className="route-header">
        <h2 className="route-title">Games x Models</h2>
        <p className="route-subtitle">Rows are games and columns are models. Select any active cell to play.</p>
      </div>

      <div className="matrix-shell">
        <div className="matrix-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th scope="col">Game</th>
                {models.map((model) => (
                  <th key={model.id} scope="col">
                    <span className="matrix-provider">{model.providerId}</span>
                    <span className="matrix-model">{model.modelKey}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.game.key}>
                  <th scope="row">
                    <span className="matrix-game-name">{row.game.name}</span>
                    <span className="matrix-game-key">
                      {row.game.key}
                      {row.game.releaseYear !== null ? ` • ${row.game.releaseYear}` : ''}
                    </span>
                  </th>
                  {row.cells.map((cell) => (
                    <td key={`${row.game.key}:${cell.model.id}`}>
                      {cell.isAvailable ? (
                        <a href={cell.playUrl} className="matrix-play-link">
                          Play
                        </a>
                      ) : (
                        <span className="matrix-missing" aria-label="Not available">
                          -
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

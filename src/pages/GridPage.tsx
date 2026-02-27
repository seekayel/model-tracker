import type { CatalogModel, CatalogVariantSection } from '../catalog';

type GridPageProps = {
  models: CatalogModel[];
  sections: CatalogVariantSection[];
};

export default function GridPage({ models, sections }: GridPageProps) {
  return (
    <main className="route-page grid-page">
      <div className="route-header">
        <h2 className="route-title">Games x Models</h2>
        <p className="route-subtitle">
          One matrix per variant in increasing complexity. Rows are games and columns are models.
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.variant.id} className="variant-section">
          <div className="variant-header">
            <h3 className="variant-title">
              {section.variant.id === 'baseline' ? 'baseline - Baseline' : `${section.variant.id} - ${section.variant.title}`}
            </h3>
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
                  {section.rows.map((row) => (
                    <tr key={`${section.variant.id}:${row.game.key}`}>
                      <th scope="row">
                        <span className="matrix-game-name">{row.game.name}</span>
                        <span className="matrix-game-key">
                          {row.game.key}
                          {row.game.releaseYear !== null ? ` • ${row.game.releaseYear}` : ''}
                        </span>
                      </th>
                      {row.cells.map((cell) => (
                        <td key={`${section.variant.id}:${row.game.key}:${cell.model.id}`}>
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
        </div>
      ))}
    </main>
  );
}

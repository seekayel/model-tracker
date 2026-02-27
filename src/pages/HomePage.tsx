import { useMemo, useState } from 'react';
import { buildVariantDetailUrl, type CatalogRow } from '../catalog';
import PlaceholderImage from '../components/PlaceholderImage';

type HomePageProps = {
  rows: CatalogRow[];
};

export default function HomePage({ rows }: HomePageProps) {
  const [current, setCurrent] = useState(0);
  const playableRows = useMemo(
    () =>
      rows
        .map((row) => ({
          ...row,
          cells: row.cells.filter((cell) => cell.isAvailable),
        }))
        .filter((row) => row.cells.length > 0),
    [rows],
  );

  if (playableRows.length === 0) {
    return (
      <main className="route-page home-empty">
        <div className="route-header">
          <h2 className="route-title">Included Games</h2>
          <p className="route-subtitle">No included game builds were found.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="home-page">
      <div className="home-progress" aria-label="Game section navigation">
        {playableRows.map((row, index) => (
          <button
            key={row.game.key}
            type="button"
            className={`home-progress-dot${current === index ? ' active' : ''}`}
            aria-label={`Jump to ${row.game.name}`}
            onClick={() => {
              setCurrent(index);
              document.getElementById(`game-section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        ))}
      </div>

      {playableRows.map((row, index) => {
        const isEven = index % 2 === 0;

        return (
          <section
            key={row.game.key}
            id={`game-section-${index}`}
            className="home-section"
            onMouseEnter={() => setCurrent(index)}
            onFocusCapture={() => setCurrent(index)}
          >
            <div className="home-background">
              <PlaceholderImage seed={row.game.key} cover className="home-bg-image" />
              <div className={`home-bg-overlay ${isEven ? 'even' : 'odd'}`} />
              <div className={`home-side-overlay ${isEven ? 'even' : 'odd'}`} />
            </div>

            <div className={`home-watermark ${isEven ? 'left' : 'right'}`}>{row.game.name}</div>

            <div className={`home-content ${isEven ? 'left' : 'right'}`}>
              <p className="home-counter">
                {String(index + 1).padStart(2, '0')} / {String(playableRows.length).padStart(2, '0')}
              </p>

              <span className="home-chip">
                {row.game.key}
                {row.game.releaseYear !== null ? ` • ${row.game.releaseYear}` : ''}
              </span>

              <h2>{row.game.name}</h2>

              <p>
                {row.cells.length} included build{row.cells.length === 1 ? '' : 's'} currently available for this game.
              </p>

              <div className={`home-model-list ${isEven ? 'left' : 'right'}`}>
                {row.cells.map((cell) => (
                  <a
                    key={cell.model.id}
                    href={buildVariantDetailUrl(row.game.key, cell.model.providerId, cell.model.modelKey)}
                    className={`home-play-link ${isEven ? 'even' : 'odd'}`}
                  >
                    {cell.model.providerId}:{cell.model.modelKey}
                  </a>
                ))}
              </div>
            </div>

            {index < playableRows.length - 1 && <div className="home-divider" />}
          </section>
        );
      })}
    </div>
  );
}

import type { CatalogComboDetail } from '../catalog';

type VariantPageProps = {
  combo: CatalogComboDetail | null;
  gameKey: string;
  providerId: string;
  modelKey: string;
};

export default function VariantPage({ combo, gameKey, providerId, modelKey }: VariantPageProps) {
  if (!combo) {
    return (
      <main className="route-page variant-page">
        <div className="route-header">
          <h2 className="route-title">Variant Timeline</h2>
          <p className="route-subtitle">No model/game combination matched this route.</p>
        </div>

        <div className="variant-card variant-empty-card">
          <p className="variant-meta">Requested combo</p>
          <p className="variant-empty-text">
            game={gameKey || '(missing)'} provider={providerId || '(missing)'} model={modelKey || '(missing)'}
          </p>
          <a href="#/grid" className="variant-back-link">
            Back to Grid
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="route-page variant-page">
      <div className="route-header">
        <h2 className="route-title">Variant Timeline</h2>
        <p className="route-subtitle">
          {combo.game.name} ({combo.game.key}) by {combo.model.providerId}:{combo.model.modelKey}
        </p>
      </div>

      <div className="variant-list">
        {combo.variants.map((item) => (
          <article key={item.variant.id} className="variant-card">
            <div className="variant-card-top">
              <span className="variant-chip">
                {item.variant.id === 'baseline' ? 'baseline - Baseline' : `${item.variant.id} - ${item.variant.title}`}
              </span>
              <span className={`variant-status ${item.isAvailable ? 'available' : 'missing'}`}>
                {item.isAvailable ? 'Available' : 'Missing'}
              </span>
            </div>

            <p className="variant-meta">Folder: {item.folderName}</p>
            <p className="variant-requirement">
              {item.variant.id === 'baseline'
                ? 'Base gameplay implementation with no add-on variant requirements.'
                : item.requirementText || 'No saved requirement text for this variant.'}
            </p>

            {item.isAvailable ? (
              <a href={item.playUrl} className="variant-play-link">
                Play {item.variant.id}
              </a>
            ) : (
              <span className="variant-missing-hint">Build not generated for this variant.</span>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

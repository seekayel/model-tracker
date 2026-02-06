import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V3 — EDITORIAL MAGAZINE
 * Asymmetric magazine layouts with serif typography, generous whitespace,
 * warm tones, and an editorial photography feel.
 */
export default function V3Gallery() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* Header */}
      <header className="max-w-6xl mx-auto px-8 pt-16 pb-8">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors">
          &larr; All Galleries
        </Link>
        <div className="mt-12 mb-8 border-b-2 border-stone-900 pb-6">
          <p className="text-xs uppercase tracking-[0.5em] text-stone-400 mb-4">Volume III &mdash; Gallery</p>
          <h1 className="text-6xl md:text-8xl font-normal italic leading-[0.9] tracking-tight">
            The Games<br />
            <span className="not-italic font-bold">Issue</span>
          </h1>
        </div>
        <p className="text-lg text-stone-500 max-w-xl leading-relaxed italic">
          A curated exhibition of interactive experiences, each conjured by a different artificial mind.
          Browse. Play. Compare.
        </p>
      </header>

      {/* Featured (first game large) */}
      <main className="max-w-6xl mx-auto px-8 pb-24">
        {/* Hero Feature */}
        <article className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="overflow-hidden">
            <PlaceholderImage
              seed={PLACEHOLDER_GAMES[0].id}
              className="w-full h-auto rounded-sm sepia-[0.2] hover:sepia-0 transition-all duration-700"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400 mb-3">
              Featured &mdash; {PLACEHOLDER_GAMES[0].model}
            </p>
            <h2 className="text-5xl font-normal italic mb-4 leading-tight">
              {PLACEHOLDER_GAMES[0].title}
            </h2>
            <p className="text-stone-500 leading-relaxed mb-6 text-lg">
              {PLACEHOLDER_GAMES[0].description}
            </p>
            <div className="flex gap-3 mb-6">
              {PLACEHOLDER_GAMES[0].tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-[0.3em] text-stone-400 border-b border-stone-300 pb-0.5">
                  {tag}
                </span>
              ))}
            </div>
            <button className="text-sm uppercase tracking-[0.3em] border-b-2 border-stone-900 pb-1 hover:border-amber-600 hover:text-amber-700 transition-colors">
              Read More &rarr;
            </button>
          </div>
        </article>

        {/* Divider */}
        <div className="flex items-center gap-6 mb-16">
          <div className="flex-1 h-px bg-stone-300" />
          <span className="text-xs uppercase tracking-[0.5em] text-stone-400">More Games</span>
          <div className="flex-1 h-px bg-stone-300" />
        </div>

        {/* Two-column editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
          {PLACEHOLDER_GAMES.slice(1).map((game, i) => (
            <article
              key={game.id}
              className={i === 0 || i === 3 ? 'md:col-span-2' : 'md:col-span-1'}
            >
              <div className={`overflow-hidden mb-4 ${(i === 0 || i === 3) ? '' : ''}`}>
                <PlaceholderImage
                  seed={game.id}
                  className="w-full h-auto rounded-sm sepia-[0.15] hover:sepia-0 transition-all duration-500"
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-2">
                {game.model} &mdash; &#9733; {game.rating}
              </p>
              <h3 className={`font-normal italic mb-2 leading-tight ${
                i === 0 || i === 3 ? 'text-3xl' : 'text-xl'
              }`}>
                {game.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-3">
                {game.description}
              </p>
              <div className="flex gap-2 flex-wrap">
                {game.tags.map(tag => (
                  <span key={tag} className="text-[9px] uppercase tracking-[0.2em] text-stone-400">
                    {tag}{game.tags.indexOf(tag) < game.tags.length - 1 ? ' /' : ''}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-300 px-8 py-8 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
          Model Tracker &mdash; The Editorial Edition
        </p>
      </footer>
    </div>
  );
}

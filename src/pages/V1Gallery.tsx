import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V1 — BRUTALIST GRID
 * Raw high-contrast brutalist aesthetic. Heavy borders, monospace type,
 * stark black-and-white with single accent hits. No rounded corners.
 */
export default function V1Gallery() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      {/* Header */}
      <header className="border-b-8 border-black px-6 py-6 flex items-center justify-between">
        <Link to="/" className="text-sm uppercase tracking-widest hover:line-through">
          &larr; Back
        </Link>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
          BRUTALIST<br className="md:hidden" /> GRID
        </h1>
        <span className="text-sm uppercase tracking-widest">V1</span>
      </header>

      {/* Intro */}
      <div className="border-b-4 border-black px-6 py-8">
        <p className="text-lg max-w-3xl uppercase leading-relaxed">
          Raw output. No polish. Every game stripped to its essence.
          Produced by machines, judged by humans.
        </p>
      </div>

      {/* Grid */}
      <main className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {PLACEHOLDER_GAMES.map((game, i) => (
            <article
              key={game.id}
              className={`border-b-4 border-r-4 border-black p-0 group ${
                i % 3 === 0 ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {/* Thumbnail */}
              <div className={`w-full overflow-hidden ${i % 3 === 0 ? 'grayscale invert' : 'grayscale'}`}>
                <PlaceholderImage
                  seed={game.id}
                  className="w-full h-auto group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] opacity-60">
                    {game.model}
                  </span>
                  <span className="text-[10px] font-bold border px-2 py-0.5 border-current">
                    {game.rating}
                  </span>
                </div>
                <h2 className="text-2xl font-black uppercase leading-none mb-2">
                  {game.title}
                </h2>
                <p className="text-xs leading-relaxed opacity-70 mb-4">
                  {game.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {game.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] uppercase tracking-widest border border-current px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className={`mt-4 w-full py-3 text-xs uppercase tracking-[0.3em] font-bold border-2 border-current transition-colors ${
                  i % 3 === 0
                    ? 'hover:bg-white hover:text-black'
                    : 'hover:bg-black hover:text-white'
                }`}>
                  Launch Game &rarr;
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-8 border-black px-6 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em]">
          Model Tracker &mdash; AI Game Benchmark Gallery
        </p>
      </footer>
    </div>
  );
}

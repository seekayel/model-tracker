import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V5 — VAPOR DASHBOARD: Bento Grid
 * Vaporwave aesthetic with a bento-box masonry layout. Varied card sizes
 * create visual hierarchy. Frosted glass, bold gradients, dreamy blurs.
 */

const BENTO_SPANS = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
];

export default function V5Gallery() {
  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 40%, #24243e 100%)',
      }}
    >
      {/* Mesh overlay shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[10%] w-96 h-96 rounded-full bg-fuchsia-500/20 blur-[150px]" />
        <div className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute top-[60%] right-[30%] w-64 h-64 rounded-full bg-sky-400/15 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 pt-10 pb-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="backdrop-blur-md bg-white/10 rounded-full px-4 py-2 text-sm hover:bg-white/20 transition-colors"
          >
            &larr; Home
          </Link>
          <p className="text-[10px] uppercase tracking-[0.6em] text-fuchsia-300/50">V5 &mdash; Bento Grid</p>
        </div>
        <h1
          className="text-5xl md:text-8xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #f0abfc, #818cf8, #67e8f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          VAPOR DASH
        </h1>
        <p className="text-violet-300/40 mt-3 text-sm max-w-lg">
          A curated mosaic of AI-crafted interactive experiences. Each tile hides a world.
        </p>
      </header>

      {/* Bento Grid */}
      <main className="relative z-10 px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[200px] gap-4">
          {PLACEHOLDER_GAMES.map((game, i) => {
            const span = BENTO_SPANS[i % BENTO_SPANS.length];
            const isLarge = span.includes('col-span-2') || span.includes('row-span-2');

            return (
              <article
                key={game.id}
                className={`group relative rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md bg-white/[0.06] hover:bg-white/[0.12] transition-all duration-500 hover:shadow-2xl hover:shadow-fuchsia-500/10 cursor-pointer ${span}`}
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <PlaceholderImage
                    seed={game.id}
                    className="w-full h-full object-cover brightness-75 saturate-[1.4] group-hover:scale-110 group-hover:brightness-90 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Content overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end p-5">
                  {/* Model badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-[9px] backdrop-blur-sm bg-black/30 rounded-full px-2.5 py-1 text-white/60">
                      {game.model}
                    </span>
                  </div>

                  <h2 className={`font-bold mb-1 group-hover:text-fuchsia-200 transition-colors ${
                    isLarge ? 'text-2xl md:text-3xl' : 'text-base'
                  }`}>
                    {game.title}
                  </h2>

                  {isLarge && (
                    <p className="text-xs text-white/40 leading-relaxed mb-3 max-w-sm">
                      {game.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {game.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[8px] uppercase tracking-wider text-white/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-yellow-300/60 ml-auto">
                      &#9733; {game.rating}
                    </span>
                  </div>
                </div>

                {/* Hover play overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="backdrop-blur-sm bg-white/10 rounded-2xl px-6 py-3 border border-white/20">
                    <span className="text-sm font-bold tracking-widest uppercase">Play</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 text-center border-t border-white/5">
        <p className="text-[10px] tracking-[0.5em] text-violet-400/20 uppercase">
          Model Tracker &mdash; Vapor Dashboard Bento
        </p>
      </footer>
    </div>
  );
}

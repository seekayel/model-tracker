import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V4 — VAPOR DASHBOARD
 * Vaporwave-inspired data dashboard with gradient meshes, frosted glass
 * cards, pastel synthetics, and playful geometric accents.
 */
export default function V4Gallery() {
  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {/* Mesh overlay shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-yellow-300/20 blur-[100px]" />
        <div className="absolute top-[50%] right-[10%] w-96 h-96 rounded-full bg-pink-400/25 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[30%] w-80 h-80 rounded-full bg-cyan-300/20 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 pt-10 pb-4 flex items-center justify-between">
        <Link
          to="/"
          className="backdrop-blur-md bg-white/10 rounded-full px-4 py-2 text-sm hover:bg-white/20 transition-colors"
        >
          &larr; Home
        </Link>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.6em] text-white/50">Gallery V4</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-lg">
            VAPOR DASH
          </h1>
        </div>
        <div className="w-20" />
      </header>

      {/* Stats bar */}
      <div className="relative z-10 px-8 py-4 flex gap-4 justify-center flex-wrap">
        {[
          { label: 'Games', value: PLACEHOLDER_GAMES.length },
          { label: 'Models', value: new Set(PLACEHOLDER_GAMES.map(g => g.model)).size },
          { label: 'Avg Rating', value: (PLACEHOLDER_GAMES.reduce((a, g) => a + g.rating, 0) / PLACEHOLDER_GAMES.length).toFixed(1) },
        ].map(stat => (
          <div
            key={stat.label}
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-center"
          >
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <main className="relative z-10 px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {PLACEHOLDER_GAMES.map((game) => (
            <article
              key={game.id}
              className="group backdrop-blur-xl bg-white/[0.12] border border-white/20 rounded-3xl overflow-hidden hover:bg-white/[0.2] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-t-3xl">
                <PlaceholderImage
                  seed={game.id}
                  className="w-full h-auto brightness-110 saturate-[1.3] group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Model badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                    {game.model}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-300 text-xs">&#9733;</span>
                    <span className="text-xs font-bold">{game.rating}</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                  {game.title}
                </h2>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  {game.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {game.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] uppercase tracking-wider bg-white/10 rounded-full px-2.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold bg-white/20 border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all">
                  Play Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 text-center">
        <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase">
          Model Tracker &mdash; Vapor Dashboard
        </p>
      </footer>
    </div>
  );
}

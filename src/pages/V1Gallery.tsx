import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V1 — NEON ARCADE: Card Grid
 * Dark-mode neon-soaked arcade aesthetic. Glowing borders, CRT scan lines,
 * and electric color pops. Classic card grid layout.
 */
export default function V1Gallery() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white relative overflow-hidden">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Glow blobs */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-8 pt-10 pb-6 flex items-end justify-between border-b border-purple-500/30">
        <Link
          to="/"
          className="text-purple-400 text-sm tracking-widest uppercase hover:text-white transition-colors"
        >
          &larr; Home
        </Link>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.5em] text-purple-500 uppercase mb-1">V1 &mdash; Card Grid</p>
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #06b6d4, #f43f5e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NEON ARCADE
          </h1>
        </div>
      </header>

      {/* Subtitle bar */}
      <div className="relative z-10 px-8 py-4 border-b border-purple-500/20">
        <p className="text-purple-300/60 text-sm max-w-2xl">
          Step into the arcade. Every cabinet is an AI-forged game.
          Insert coin. Press start.
        </p>
      </div>

      {/* Grid */}
      <main className="relative z-10 px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PLACEHOLDER_GAMES.map((game) => {
            const glowColor = game.tags.includes('Arcade') || game.tags.includes('Racing')
              ? 'shadow-cyan-500/40 border-cyan-500/50 hover:shadow-cyan-400/60'
              : game.tags.includes('Puzzle') || game.tags.includes('Word')
              ? 'shadow-pink-500/40 border-pink-500/50 hover:shadow-pink-400/60'
              : 'shadow-purple-500/40 border-purple-500/50 hover:shadow-purple-400/60';

            return (
              <article
                key={game.id}
                className={`group rounded-xl border bg-[#12121f]/80 backdrop-blur-sm overflow-hidden transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-[1.03] ${glowColor}`}
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <PlaceholderImage
                    seed={game.id}
                    className="w-full h-auto saturate-150 brightness-110 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12121f] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-black/60 px-2 py-1 rounded">
                      {game.model}
                    </span>
                    <span className="text-[10px] font-mono text-yellow-400 bg-black/60 px-2 py-1 rounded">
                      &#9733; {game.rating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 tracking-wide group-hover:text-cyan-300 transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-xs text-purple-200/50 leading-relaxed mb-4">
                    {game.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] uppercase tracking-wider border border-purple-500/40 text-purple-300/70 rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-lg text-xs uppercase tracking-[0.2em] font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition-all text-white shadow-lg shadow-purple-500/25">
                    Insert Coin &rarr;
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 px-8 py-6 text-center">
        <p className="text-[10px] tracking-[0.5em] text-purple-500/40 uppercase">
          Model Tracker &mdash; Neon Arcade Edition
        </p>
      </footer>
    </div>
  );
}

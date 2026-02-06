import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V2 — NEON ARCADE: Spotlight Carousel
 * A single-focus spotlight layout. One featured game large in the center
 * with a horizontal strip of thumbnails below. CRT + neon aesthetic.
 */
export default function V2Gallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const game = PLACEHOLDER_GAMES[activeIndex];

  return (
    <div className="min-h-screen bg-[#08080f] text-white relative overflow-hidden flex flex-col">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.08) 1px, rgba(255,255,255,0.08) 2px)',
        }}
      />

      {/* Animated glow behind featured game */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[200px] pointer-events-none transition-colors duration-1000"
        style={{
          background: activeIndex % 3 === 0
            ? 'radial-gradient(ellipse, rgba(168,85,247,0.25), transparent 70%)'
            : activeIndex % 3 === 1
            ? 'radial-gradient(ellipse, rgba(6,182,212,0.25), transparent 70%)'
            : 'radial-gradient(ellipse, rgba(244,63,94,0.25), transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-8 pt-8 pb-4 flex items-center justify-between border-b border-purple-500/20">
        <Link
          to="/"
          className="text-purple-400 text-sm tracking-widest uppercase hover:text-white transition-colors"
        >
          &larr; Home
        </Link>
        <h1
          className="text-3xl md:text-5xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NEON ARCADE
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-purple-500 uppercase">V2 &mdash; Spotlight</p>
      </header>

      {/* Featured game */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-4xl">
          {/* Main card */}
          <div className="relative rounded-2xl border border-purple-500/40 bg-[#0f0f1a]/90 backdrop-blur-sm overflow-hidden shadow-2xl shadow-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image side */}
              <div className="relative overflow-hidden">
                <PlaceholderImage
                  seed={game.id}
                  className="w-full h-full object-cover saturate-150 brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f0f1a]/80 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a]/80 to-transparent md:hidden" />
              </div>

              {/* Info side */}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded">
                    {game.model}
                  </span>
                  <span className="text-[10px] font-mono text-yellow-400">
                    &#9733; {game.rating}
                  </span>
                </div>
                <h2
                  className="text-4xl font-black mb-3 tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #e2e8f0, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {game.title}
                </h2>
                <p className="text-sm text-purple-200/50 leading-relaxed mb-6">
                  {game.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {game.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-wider border border-purple-500/30 text-purple-300/60 rounded-full px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl text-sm uppercase tracking-[0.2em] font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition-all text-white shadow-lg shadow-purple-500/30">
                  Insert Coin &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Game counter */}
          <div className="text-center mt-4 text-purple-500/40 text-xs tracking-widest">
            {activeIndex + 1} / {PLACEHOLDER_GAMES.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="w-full max-w-4xl mt-8 flex gap-3 overflow-x-auto pb-2 px-1">
          {PLACEHOLDER_GAMES.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-28 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                i === activeIndex
                  ? 'border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                  : 'border-purple-500/20 opacity-50 hover:opacity-80 hover:border-purple-500/40'
              }`}
            >
              <PlaceholderImage seed={g.id} className="w-full h-auto saturate-150" />
              <div className="bg-[#0f0f1a] px-2 py-1.5">
                <p className="text-[9px] font-bold truncate text-white/80">{g.title}</p>
                <p className="text-[8px] text-purple-400/50 truncate">{g.model}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 px-8 py-4 text-center">
        <p className="text-[10px] tracking-[0.5em] text-purple-500/30 uppercase">
          Model Tracker &mdash; Neon Arcade Spotlight
        </p>
      </footer>
    </div>
  );
}

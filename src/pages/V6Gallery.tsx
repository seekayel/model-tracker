import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V6 — VAPOR DASHBOARD: Horizontal Showcase
 * Full-width horizontal scrolling showcase. Each game gets a massive hero
 * section. Vaporwave palette with sunset gradients and chrome reflections.
 */
export default function V6Gallery() {
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const models = [...new Set(PLACEHOLDER_GAMES.map(g => g.model))];
  const filtered = activeModel
    ? PLACEHOLDER_GAMES.filter(g => g.model === activeModel)
    : PLACEHOLDER_GAMES;

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        background: 'linear-gradient(180deg, #1a1033 0%, #2d1b69 30%, #4a1942 60%, #b44593 85%, #ff6b6b 100%)',
      }}
    >
      {/* Decorative sun */}
      <div className="fixed bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-t-full pointer-events-none"
        style={{
          background: 'linear-gradient(0deg, #ff6b6b, #feca57, #ff9ff3)',
          opacity: 0.15,
          filter: 'blur(40px)',
        }}
      />
      {/* Horizontal grid lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.06]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-8 pt-10 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="backdrop-blur-md bg-white/10 rounded-full px-4 py-2 text-sm hover:bg-white/20 transition-colors"
          >
            &larr; Home
          </Link>
          <p className="text-[10px] uppercase tracking-[0.6em] text-pink-300/50">V6 &mdash; Showcase</p>
        </div>
        <h1
          className="text-5xl md:text-8xl font-black tracking-tight mb-4"
          style={{
            background: 'linear-gradient(135deg, #feca57, #ff6b6b, #ff9ff3, #c44dff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          VAPOR DASH
        </h1>

        {/* Model filter pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveModel(null)}
            className={`text-[10px] uppercase tracking-widest rounded-full px-4 py-1.5 border transition-all ${
              !activeModel
                ? 'bg-white/20 border-white/40 text-white'
                : 'bg-transparent border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            All
          </button>
          {models.map(model => (
            <button
              key={model}
              onClick={() => setActiveModel(activeModel === model ? null : model)}
              className={`text-[10px] uppercase tracking-widest rounded-full px-4 py-1.5 border transition-all ${
                activeModel === model
                  ? 'bg-white/20 border-white/40 text-white'
                  : 'bg-transparent border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {model}
            </button>
          ))}
        </div>
      </header>

      {/* Horizontal scroll showcase */}
      <main className="relative z-10 py-10">
        <div className="flex gap-6 overflow-x-auto px-8 pb-6 snap-x snap-mandatory">
          {filtered.map((game) => (
            <article
              key={game.id}
              className="group flex-shrink-0 w-[85vw] md:w-[600px] snap-center"
            >
              <div className="relative rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md bg-white/[0.06] hover:bg-white/[0.1] transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/20">
                {/* Hero image */}
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <PlaceholderImage
                    seed={game.id}
                    className="w-full h-full object-cover saturate-[1.5] brightness-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1033] via-transparent to-transparent" />

                  {/* Rating badge */}
                  <div className="absolute top-4 right-4 backdrop-blur-sm bg-black/40 rounded-xl px-3 py-2 text-center">
                    <p className="text-yellow-400 text-lg font-black">{game.rating}</p>
                    <p className="text-[7px] uppercase tracking-widest text-white/40">rating</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-[10px] uppercase tracking-widest rounded-full px-3 py-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(196,77,255,0.2))',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {game.model}
                    </span>
                  </div>

                  <h2
                    className="text-3xl md:text-4xl font-black mb-3 tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, #fff, #ff9ff3)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {game.title}
                  </h2>

                  <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-md">
                    {game.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {game.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[9px] uppercase tracking-wider text-pink-300/40 border border-pink-400/15 rounded-full px-2.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      className="px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #ff6b6b, #c44dff)',
                        boxShadow: '0 4px 20px rgba(196,77,255,0.3)',
                      }}
                    >
                      Play &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="text-center mt-4">
          <p className="text-[10px] tracking-[0.5em] text-pink-300/20 uppercase animate-pulse">
            Scroll to explore &rarr;
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 text-center border-t border-white/5">
        <p className="text-[10px] tracking-[0.5em] text-pink-400/20 uppercase">
          Model Tracker &mdash; Vapor Dashboard Showcase
        </p>
      </footer>
    </div>
  );
}

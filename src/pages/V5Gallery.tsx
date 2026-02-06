import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';
import type { Game } from '../types';

/**
 * V5 — VAPOR DASHBOARD: "Model Heatmap"
 *
 * DESIGN CONCEPT: A data-first dashboard. The hero element is a massive
 * heatmap/bar chart showing model performance at a glance. Below it,
 * games arranged by model in a compact, information-dense layout.
 * Everything is about the DATA — ratings, model counts, comparisons.
 *
 * TYPOGRAPHY: Outfit (geometric, data-friendly). DM Mono for numbers.
 *
 * BOLD CHOICE: The top half of the page is pure data visualization —
 * no game images at all. You see the numbers FIRST, scroll to the games.
 * The vapor aesthetic comes through in the gradient palette of the charts.
 */
export default function V5Gallery() {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const grouped: Record<string, Game[]> = {};
  PLACEHOLDER_GAMES.forEach(g => {
    if (!grouped[g.model]) grouped[g.model] = [];
    grouped[g.model].push(g);
  });

  const modelStats = Object.entries(grouped).map(([model, games]) => ({
    model,
    games,
    count: games.length,
    avg: games.reduce((a, g) => a + g.rating, 0) / games.length,
    best: Math.max(...games.map(g => g.rating)),
  })).sort((a, b) => b.avg - a.avg);

  const maxRating = 5;

  const BAR_GRADIENTS = [
    'linear-gradient(135deg, #c44dff, #a855f7)',
    'linear-gradient(135deg, #06b6d4, #22d3ee)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #ef4444, #f87171)',
  ];

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        fontFamily: '"Outfit", sans-serif',
        background: 'linear-gradient(180deg, #0f0a1a 0%, #1a1030 40%, #150d20 100%)',
      }}
    >
      {/* Grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-[10px] tracking-[0.4em] uppercase text-violet-400/40 hover:text-violet-300 transition-colors">
            &larr; Home
          </Link>
          <p className="text-[9px] tracking-[0.6em] uppercase text-white/15">V5 &mdash; Heatmap</p>
        </div>
        <div className="mt-8">
          <h1
            className="text-4xl md:text-7xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #f0abfc, #c084fc, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            VAPOR DASH
          </h1>
          <p className="text-white/20 text-sm mt-2">Model performance at a glance</p>
        </div>
      </header>

      {/* Data Visualization Section */}
      <section className="relative z-10 px-6 md:px-12 py-8">
        {/* Model Rating Bars */}
        <div className="space-y-4">
          <p className="text-[9px] tracking-[0.5em] uppercase text-white/20 mb-6">Average Rating by Model</p>
          {modelStats.map((stat, i) => (
            <div key={stat.model} className="group">
              <div className="flex items-center gap-4">
                {/* Model name */}
                <div className="w-36 md:w-48 flex-shrink-0 text-right">
                  <button
                    onClick={() => setExpandedModel(expandedModel === stat.model ? null : stat.model)}
                    className="text-xs md:text-sm font-semibold text-white/60 hover:text-white/90 transition-colors text-right"
                  >
                    {stat.model}
                  </button>
                  <p className="text-[9px] text-white/15 mt-0.5" style={{ fontFamily: '"DM Mono", monospace' }}>
                    {stat.count} game{stat.count !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Bar */}
                <div className="flex-1 relative h-10 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div
                    className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                    style={{
                      width: `${(stat.avg / maxRating) * 100}%`,
                      background: BAR_GRADIENTS[i % BAR_GRADIENTS.length],
                      boxShadow: '0 0 20px rgba(196,77,255,0.15)',
                    }}
                  >
                    <span className="text-sm font-bold text-white/90" style={{ fontFamily: '"DM Mono", monospace' }}>
                      {stat.avg.toFixed(2)}
                    </span>
                  </div>
                  {/* Best rating marker */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-white/20"
                    style={{ left: `${(stat.best / maxRating) * 100}%` }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-white/20"
                      style={{ fontFamily: '"DM Mono", monospace' }}
                    >
                      {stat.best}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded games list */}
              {expandedModel === stat.model && (
                <div className="ml-40 md:ml-52 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                  {stat.games.map(game => (
                    <div
                      key={game.id}
                      className="flex gap-3 items-center rounded-lg border border-white/5 p-2"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden">
                        <PlaceholderImage seed={game.id} className="w-full h-full object-cover saturate-125" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white/70 truncate">{game.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {game.tags.map(t => (
                            <span key={t} className="text-[7px] uppercase tracking-widest text-white/15">{t}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white/40 ml-auto flex-shrink-0" style={{ fontFamily: '"DM Mono", monospace' }}>
                        {game.rating}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary stats row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Games', value: PLACEHOLDER_GAMES.length, sub: 'in benchmark' },
            { label: 'Models Tested', value: modelStats.length, sub: 'unique models' },
            { label: 'Highest Rated', value: Math.max(...PLACEHOLDER_GAMES.map(g => g.rating)).toFixed(1), sub: PLACEHOLDER_GAMES.reduce((a, b) => a.rating > b.rating ? a : b).title },
            { label: 'Avg Score', value: (PLACEHOLDER_GAMES.reduce((a, g) => a + g.rating, 0) / PLACEHOLDER_GAMES.length).toFixed(2), sub: 'across all games' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/5 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2">{s.label}</p>
              <p className="text-3xl font-bold" style={{
                fontFamily: '"DM Mono", monospace',
                background: 'linear-gradient(135deg, #f0abfc, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {s.value}
              </p>
              <p className="text-[10px] text-white/15 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Games Grid */}
      <section className="relative z-10 px-6 md:px-12 py-12">
        <p className="text-[9px] tracking-[0.5em] uppercase text-white/20 mb-6">All Games</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLACEHOLDER_GAMES.map(game => (
            <div key={game.id} className="group rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <PlaceholderImage seed={game.id} className="w-full h-auto saturate-125 group-hover:brightness-110 transition-all" />
              <div className="p-3">
                <p className="text-xs font-medium text-white/60 truncate">{game.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-white/20">{game.model}</span>
                  <span className="text-[10px] font-bold text-white/30" style={{ fontFamily: '"DM Mono", monospace' }}>{game.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/5 text-center">
        <p className="text-[10px] tracking-[0.5em] text-white/10 uppercase">Model Tracker &mdash; Vapor Dashboard Heatmap</p>
      </footer>
    </div>
  );
}

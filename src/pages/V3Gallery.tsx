import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';
import type { Game } from '../types';

/**
 * V3 — NEON ARCADE: "Model Columns"
 *
 * DESIGN CONCEPT: Each AI model gets a full vertical column. The page is a
 * horizontal arrangement where you scroll sideways between models. Within
 * each column, games stack vertically. It's a code-editor / Kanban gone neon.
 * The model name runs vertically along the left edge of each column.
 *
 * TYPOGRAPHY: Anybody (variable width, ultra-condensed to ultra-wide).
 * DM Mono for meta.
 *
 * BOLD CHOICE: Horizontal scroll is the primary axis. Each model is a world
 * unto itself — a tall, glowing column with its own color identity.
 */

const MODEL_COLORS: Record<string, { bg: string; glow: string; text: string; accent: string }> = {
  'Claude Opus 4': { bg: '#0d0818', glow: 'rgba(168,85,247,0.15)', text: '#c084fc', accent: '#a855f7' },
  'GPT-4o': { bg: '#080d12', glow: 'rgba(34,211,238,0.12)', text: '#67e8f9', accent: '#06b6d4' },
  'Gemini 2.5 Pro': { bg: '#0d1008', glow: 'rgba(52,211,153,0.12)', text: '#6ee7b7', accent: '#10b981' },
  'Claude Sonnet 4': { bg: '#10080d', glow: 'rgba(244,114,182,0.12)', text: '#f9a8d4', accent: '#ec4899' },
  'DeepSeek R1': { bg: '#0c0808', glow: 'rgba(248,113,113,0.12)', text: '#fca5a5', accent: '#ef4444' },
  'Llama 4 Scout': { bg: '#0d0c06', glow: 'rgba(251,191,36,0.12)', text: '#fde68a', accent: '#f59e0b' },
};

const DEFAULT_COLOR = { bg: '#0a0a12', glow: 'rgba(255,255,255,0.05)', text: '#e2e8f0', accent: '#94a3b8' };

export default function V3Gallery() {
  const grouped: Record<string, Game[]> = {};
  PLACEHOLDER_GAMES.forEach(g => {
    if (!grouped[g.model]) grouped[g.model] = [];
    grouped[g.model].push(g);
  });
  const modelNames = Object.keys(grouped);

  return (
    <div
      className="h-screen text-white relative flex flex-col overflow-hidden"
      style={{ fontFamily: '"DM Mono", monospace', background: '#050507' }}
    >
      {/* Top bar */}
      <header className="flex-shrink-0 relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link to="/" className="text-[10px] tracking-[0.4em] uppercase text-white/30 hover:text-white/60 transition-colors">
          &larr; Home
        </Link>
        <h1 className="text-xl font-black tracking-tight" style={{ fontFamily: '"Anybody", sans-serif', fontWeight: 900 }}>
          <span className="text-white/40">NEON</span> <span className="text-white/80">ARCADE</span>
        </h1>
        <p className="text-[9px] tracking-[0.5em] uppercase text-white/15">V3 &mdash; Model Columns</p>
      </header>

      {/* Horizontal scroll container */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full">
          {modelNames.map((model) => {
            const colors = MODEL_COLORS[model] || DEFAULT_COLOR;
            const games = grouped[model];
            const avg = (games.reduce((a, g) => a + g.rating, 0) / games.length).toFixed(1);

            return (
              <div
                key={model}
                className="flex-shrink-0 w-[320px] md:w-[380px] h-full flex flex-col border-r border-white/[0.04] relative"
                style={{ background: colors.bg }}
              >
                {/* Column glow */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.glow}, transparent 60%)` }}
                />

                {/* Model name header */}
                <div className="relative z-10 px-5 pt-6 pb-4 border-b border-white/[0.04]">
                  <h2
                    className="text-2xl md:text-3xl font-black tracking-tight leading-none"
                    style={{ fontFamily: '"Anybody", sans-serif', fontWeight: 900, color: colors.text }}
                  >
                    {model}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] uppercase tracking-widest text-white/20">{games.length} games</span>
                    <span className="text-[9px] uppercase tracking-widest" style={{ color: colors.accent }}>
                      avg {avg}
                    </span>
                  </div>
                  {/* Color bar */}
                  <div className="mt-3 h-0.5 w-full rounded-full opacity-40"
                    style={{ background: `linear-gradient(90deg, ${colors.accent}, transparent)` }}
                  />
                </div>

                {/* Games stack */}
                <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {games.map(game => (
                    <article
                      key={game.id}
                      className="group rounded-xl overflow-hidden border border-white/[0.04] hover:border-white/10 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="relative">
                        <PlaceholderImage
                          seed={game.id}
                          className="w-full h-auto saturate-125 brightness-105 group-hover:brightness-125 transition-all duration-500"
                        />
                        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)' }} />
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5">
                          <span className="text-[10px] font-bold" style={{ color: colors.text }}>{game.rating}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-bold text-white/80 mb-1">{game.title}</h3>
                        <p className="text-[10px] text-white/20 leading-relaxed line-clamp-2">{game.description}</p>
                        <div className="flex gap-1.5 mt-2">
                          {game.tags.map(tag => (
                            <span key={tag} className="text-[7px] uppercase tracking-widest" style={{ color: `${colors.accent}60` }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

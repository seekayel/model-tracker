import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V2 — NEON ARCADE: "Model Deathmatch"
 *
 * DESIGN CONCEPT: Head-to-head comparison. The entire layout is split-screen,
 * letting you pit two models against each other. Games grouped by model with
 * a neon-lit "VS" divider. It's confrontational, competitive, electric.
 *
 * TYPOGRAPHY: Syne for headings (geometric, aggressive). DM Mono for data.
 *
 * BOLD CHOICE: Two-column model comparison is the ONLY interaction.
 * You pick a left model and a right model. Everything else is subordinate.
 */
export default function V2Gallery() {
  const models = [...new Set(PLACEHOLDER_GAMES.map(g => g.model))];
  const [leftModel, setLeftModel] = useState(models[0]);
  const [rightModel, setRightModel] = useState(models[1]);

  const leftGames = PLACEHOLDER_GAMES.filter(g => g.model === leftModel);
  const rightGames = PLACEHOLDER_GAMES.filter(g => g.model === rightModel);
  const leftAvg = leftGames.length ? (leftGames.reduce((a, g) => a + g.rating, 0) / leftGames.length) : 0;
  const rightAvg = rightGames.length ? (rightGames.reduce((a, g) => a + g.rating, 0) / rightGames.length) : 0;

  function GameCard({ game, align }: { game: typeof PLACEHOLDER_GAMES[0]; align: 'left' | 'right' }) {
    return (
      <div className={`group flex gap-4 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-24 rounded-lg overflow-hidden border border-white/10 relative">
          <PlaceholderImage seed={game.id} className="w-full h-full object-cover saturate-150 brightness-110 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)' }} />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-sm font-bold text-white/90 truncate" style={{ fontFamily: '"Syne", sans-serif' }}>
            {game.title}
          </h3>
          <p className="text-[10px] text-white/25 mt-1 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
          <div className="flex items-center gap-2 mt-2" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
            {game.tags.map(tag => (
              <span key={tag} className="text-[8px] uppercase tracking-widest text-cyan-400/30">{tag}</span>
            ))}
            <span className="text-[10px] text-yellow-400 font-bold ml-auto">{game.rating}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        fontFamily: '"DM Mono", monospace',
        background: '#050509',
      }}
    >
      {/* Vertical center divider glow */}
      <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-px z-20 pointer-events-none hidden md:block"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(255,0,100,0.4) 30%, rgba(255,0,100,0.4) 70%, transparent)' }}
      />
      <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-20 z-10 pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(ellipse, rgba(255,0,100,0.08), transparent 70%)' }}
      />

      {/* Header */}
      <header className="relative z-30 px-6 md:px-10 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-[10px] tracking-[0.4em] uppercase text-red-400/50 hover:text-red-300 transition-colors">
            &larr; Exit
          </Link>
          <div className="text-center">
            <p className="text-[9px] tracking-[0.6em] uppercase text-white/20 mb-1">Gallery V2</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
              <span className="text-cyan-400">MODEL</span>
              <span className="text-white/20 mx-2">/</span>
              <span className="text-red-400">DEATHMATCH</span>
            </h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Model selectors */}
      <div className="relative z-30 grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left selector */}
        <div className="px-6 md:px-10 py-4 flex flex-wrap gap-2 justify-start border-b border-cyan-500/10">
          {models.map(m => (
            <button
              key={m}
              onClick={() => setLeftModel(m)}
              className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded transition-all ${
                leftModel === m
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-white/20 border border-white/5 hover:text-white/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {/* Right selector */}
        <div className="px-6 md:px-10 py-4 flex flex-wrap gap-2 justify-end border-b border-red-500/10">
          {models.map(m => (
            <button
              key={m}
              onClick={() => setRightModel(m)}
              className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded transition-all ${
                rightModel === m
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'text-white/20 border border-white/5 hover:text-white/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* VS Header with model names */}
      <div className="relative z-30 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10 py-8">
        {/* Left model */}
        <div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{
            fontFamily: '"Syne", sans-serif',
            color: '#00e5ff',
            textShadow: '0 0 30px rgba(0,229,255,0.3)',
          }}>
            {leftModel}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] text-white/20">{leftGames.length} games</span>
            <span className="text-[10px] text-cyan-400/60">avg {leftAvg.toFixed(1)}</span>
          </div>
        </div>

        {/* VS */}
        <div className="hidden md:flex items-center justify-center px-8">
          <span
            className="text-4xl font-black"
            style={{
              fontFamily: '"Syne", sans-serif',
              color: '#ff0064',
              textShadow: '0 0 40px rgba(255,0,100,0.5), 0 0 80px rgba(255,0,100,0.2)',
            }}
          >
            VS
          </span>
        </div>

        {/* Right model */}
        <div className="text-right mt-6 md:mt-0">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{
            fontFamily: '"Syne", sans-serif',
            color: '#ff0064',
            textShadow: '0 0 30px rgba(255,0,100,0.3)',
          }}>
            {rightModel}
          </h2>
          <div className="flex items-center gap-4 mt-2 justify-end">
            <span className="text-[10px] text-red-400/60">avg {rightAvg.toFixed(1)}</span>
            <span className="text-[10px] text-white/20">{rightGames.length} games</span>
          </div>
        </div>
      </div>

      {/* Two-column game lists */}
      <main className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 px-6 md:px-10 pb-20">
        {/* Left column */}
        <div className="space-y-4 pr-0 md:pr-8 pb-8 md:pb-0">
          {leftGames.length === 0 && (
            <p className="text-[10px] text-white/15 uppercase tracking-widest">No games for this model</p>
          )}
          {leftGames.map(game => (
            <GameCard key={game.id} game={game} align="left" />
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-4 pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0">
          {rightGames.length === 0 && (
            <p className="text-[10px] text-white/15 uppercase tracking-widest text-right">No games for this model</p>
          )}
          {rightGames.map(game => (
            <GameCard key={game.id} game={game} align="right" />
          ))}
        </div>
      </main>
    </div>
  );
}

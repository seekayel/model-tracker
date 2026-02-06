import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V3 — NEON ARCADE: High Score Board
 * Arcade leaderboard / ranking aesthetic. Games presented as ranked entries
 * in a high-score table with neon accents and pixel-style vibes.
 */
export default function V3Gallery() {
  const sorted = [...PLACEHOLDER_GAMES].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-[#06060d] text-white relative overflow-hidden font-mono">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 4px)',
        }}
      />

      {/* Corner glow accents */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-pink-600/15 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/15 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-8 pt-10 pb-8 text-center border-b-2 border-pink-500/30">
        <Link
          to="/"
          className="absolute left-8 top-10 text-pink-400 text-sm tracking-widest uppercase hover:text-white transition-colors"
        >
          &larr; Home
        </Link>
        <p className="text-[10px] tracking-[0.8em] text-pink-500/60 uppercase mb-2">V3 &mdash; High Score Board</p>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400">
          HIGH SCORES
        </h1>
        <p className="text-pink-300/40 text-sm mt-3">
          Ranked by quality. The best AI-forged games rise to the top.
        </p>
      </header>

      {/* Leaderboard */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="space-y-3">
          {sorted.map((game, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            const medalColor = rank === 1
              ? 'text-yellow-400 border-yellow-400/50 bg-yellow-400/5'
              : rank === 2
              ? 'text-slate-300 border-slate-300/40 bg-slate-300/5'
              : rank === 3
              ? 'text-amber-600 border-amber-600/40 bg-amber-600/5'
              : 'text-purple-500/60 border-purple-500/20 bg-purple-500/5';

            return (
              <article
                key={game.id}
                className={`group flex items-center gap-4 md:gap-6 rounded-xl border p-3 md:p-4 transition-all duration-300 hover:scale-[1.01] ${medalColor} ${
                  isTop3 ? 'hover:shadow-lg' : ''
                }`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-black ${
                  rank === 1 ? 'text-3xl text-yellow-400' :
                  rank === 2 ? 'text-2xl text-slate-300' :
                  rank === 3 ? 'text-2xl text-amber-600' :
                  'text-xl text-purple-600/40'
                }`}>
                  {rank === 1 ? '01' : rank === 2 ? '02' : rank === 3 ? '03' : String(rank).padStart(2, '0')}
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-white/10">
                  <PlaceholderImage
                    seed={game.id}
                    className="w-full h-full object-cover saturate-150 brightness-110"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={`font-bold tracking-wide truncate ${isTop3 ? 'text-lg' : 'text-base text-white/70'}`}>
                      {game.title}
                    </h2>
                  </div>
                  <p className="text-xs text-white/30 truncate hidden md:block">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-cyan-400/70">
                      {game.model}
                    </span>
                    <div className="flex gap-1.5">
                      {game.tags.map(tag => (
                        <span key={tag} className="text-[8px] uppercase tracking-wider text-purple-400/40">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score / Rating */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-2xl font-black ${
                    rank === 1 ? 'text-yellow-400' :
                    rank === 2 ? 'text-slate-300' :
                    rank === 3 ? 'text-amber-600' :
                    'text-purple-400/50'
                  }`}>
                    {(game.rating * 1000).toFixed(0)}
                  </div>
                  <div className="text-[8px] uppercase tracking-widest text-white/20">pts</div>
                </div>

                {/* Play button */}
                <button className={`flex-shrink-0 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold border transition-all ${
                  isTop3
                    ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black'
                    : 'border-purple-500/30 text-purple-400/50 hover:bg-purple-500 hover:text-white'
                }`}>
                  Play
                </button>
              </article>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-pink-500/20 px-8 py-6 text-center">
        <p className="text-[10px] tracking-[0.5em] text-pink-500/30 uppercase">
          Model Tracker &mdash; Neon Arcade High Scores
        </p>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V1 — NEON ARCADE: "Arcade Cabinet Wall"
 *
 * DESIGN CONCEPT: Each game is a physical arcade cabinet viewed from the front.
 * The page IS the arcade — dark walls, neon trim, a gritty floor reflection.
 * Model names are the marquee text on each cabinet, massive and unapologetic.
 * The game image is the screen. You're choosing which cabinet to walk up to.
 *
 * TYPOGRAPHY: Dela Gothic One for cabinet marquees (chunky, imposing).
 * DM Mono for data overlays.
 *
 * BOLD CHOICE: The MODEL is the biggest text on each card — bigger than the
 * game title. This is a benchmark: you're comparing models, not games.
 */
export default function V1Gallery() {
  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        fontFamily: '"DM Mono", monospace',
        background: '#07060b',
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* CRT flicker scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,200,0.08) 2px, rgba(0,255,200,0.08) 4px)',
        }}
      />

      {/* Ambient neon glow from ceiling */}
      <div className="fixed top-0 left-0 right-0 h-2 z-30"
        style={{ background: 'linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff, #00ffff, #ff00ff)', opacity: 0.6 }}
      />
      <div className="fixed top-0 left-0 right-0 h-40 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,255,255,0.06) 0%, transparent 100%)' }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 pt-12 pb-10">
        <Link to="/" className="text-[10px] tracking-[0.4em] uppercase text-cyan-500/60 hover:text-cyan-300 transition-colors">
          &larr; Exit Arcade
        </Link>
        <div className="mt-6 flex items-end gap-6">
          <h1
            className="text-5xl md:text-8xl leading-[0.85] tracking-tight"
            style={{ fontFamily: '"Dela Gothic One", cursive' }}
          >
            <span style={{ color: '#ff00ff', textShadow: '0 0 40px rgba(255,0,255,0.5), 0 0 80px rgba(255,0,255,0.2)' }}>
              NEON
            </span>
            <br />
            <span style={{ color: '#00ffff', textShadow: '0 0 40px rgba(0,255,255,0.5), 0 0 80px rgba(0,255,255,0.2)' }}>
              ARCADE
            </span>
          </h1>
          <div className="hidden md:block pb-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 mb-1">Gallery V1</p>
            <p className="text-[10px] tracking-[0.2em] text-white/30">
              {PLACEHOLDER_GAMES.length} cabinets &middot; {new Set(PLACEHOLDER_GAMES.map(g => g.model)).size} models
            </p>
          </div>
        </div>
      </header>

      {/* Arcade floor — the cabinets */}
      <main className="relative z-10 px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLACEHOLDER_GAMES.map((game) => (
            <article
              key={game.id}
              className="group relative"
            >
              {/* Cabinet body */}
              <div
                className="relative rounded-t-2xl rounded-b-lg overflow-hidden transition-all duration-500"
                style={{
                  background: 'linear-gradient(180deg, #1a1726 0%, #0e0c14 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                {/* Marquee — MODEL NAME is the hero */}
                <div
                  className="px-4 py-3 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #1c1528 0%, #12101a 100%)',
                    borderBottom: '2px solid rgba(255,0,255,0.15)',
                  }}
                >
                  <p
                    className="text-lg md:text-xl font-bold tracking-tight truncate"
                    style={{
                      fontFamily: '"Dela Gothic One", cursive',
                      color: '#ff00ff',
                      textShadow: '0 0 20px rgba(255,0,255,0.6)',
                    }}
                  >
                    {game.model}
                  </p>
                  {/* Glow line under marquee */}
                  <div className="absolute bottom-0 left-[10%] right-[10%] h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.5), transparent)' }}
                  />
                </div>

                {/* Screen — the game image */}
                <div className="relative mx-3 mt-3 rounded-lg overflow-hidden border border-white/5">
                  <PlaceholderImage
                    seed={game.id}
                    className="w-full h-auto brightness-125 saturate-150 group-hover:brightness-150 transition-all duration-500"
                  />
                  {/* Screen glare */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-10 transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, transparent 100%)',
                    }}
                  />
                  {/* Screen CRT curve shadow */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)' }}
                  />
                </div>

                {/* Control panel area */}
                <div className="p-4 mt-1">
                  <h2 className="text-sm font-medium text-cyan-300 tracking-wide mb-1" style={{ fontFamily: '"DM Mono", monospace' }}>
                    {game.title}
                  </h2>
                  <p className="text-[10px] text-white/25 leading-relaxed mb-3 line-clamp-2">
                    {game.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {game.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[8px] uppercase tracking-widest text-white/15 border border-white/8 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" style={{ boxShadow: '0 0 6px rgba(250,204,21,0.6)' }} />
                      <span className="text-[10px] text-yellow-400/80 font-medium">{game.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Insert coin button */}
                <div className="px-4 pb-4">
                  <button
                    className="w-full py-2.5 rounded-lg text-[10px] uppercase tracking-[0.3em] font-medium transition-all duration-300 relative overflow-hidden"
                    style={{
                      border: '1px solid rgba(0,255,255,0.3)',
                      color: '#00ffff',
                      textShadow: '0 0 10px rgba(0,255,255,0.5)',
                      background: 'rgba(0,255,255,0.04)',
                    }}
                  >
                    <span className="relative z-10">Insert Coin</span>
                  </button>
                </div>
              </div>

              {/* Cabinet base / floor shadow */}
              <div
                className="h-3 mx-2 rounded-b-lg"
                style={{
                  background: 'linear-gradient(180deg, #0a0910 0%, transparent 100%)',
                }}
              />
            </article>
          ))}
        </div>
      </main>

      {/* Floor reflection line */}
      <div className="fixed bottom-0 left-0 right-0 h-px z-30"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.1), rgba(255,0,255,0.1), transparent)' }}
      />
    </div>
  );
}

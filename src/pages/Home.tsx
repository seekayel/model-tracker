import { Link } from 'react-router-dom';

const VARIANTS = [
  {
    id: 'v1',
    family: 'neon',
    name: 'Arcade Cabinets',
    description: 'Each game is an arcade cabinet. The model name blazes on the marquee — this is a benchmark, not a game store.',
    color: 'from-[#1a1726] to-[#07060b]',
    border: 'border-[#ff00ff]/40',
    accent: 'text-[#ff00ff]',
    accentSecondary: 'text-[#00ffff]',
  },
  {
    id: 'v2',
    family: 'neon',
    name: 'Model Deathmatch',
    description: 'Split-screen head-to-head. Pick two models, compare their games side by side. Confrontational and electric.',
    color: 'from-[#050509] to-[#0a0a14]',
    border: 'border-[#ff0064]/40',
    accent: 'text-[#ff0064]',
    accentSecondary: 'text-[#00e5ff]',
  },
  {
    id: 'v3',
    family: 'neon',
    name: 'Model Columns',
    description: 'Horizontal scroll through model columns. Each model gets its own world — a tall, glowing vertical lane.',
    color: 'from-[#0d0818] to-[#050507]',
    border: 'border-[#a855f7]/30',
    accent: 'text-[#c084fc]',
    accentSecondary: 'text-[#6ee7b7]',
  },
  {
    id: 'v4',
    family: 'vapor',
    name: 'Museum Gallery',
    description: 'White-cube gallery. Games are framed artworks, models are artist placards. Elegant, minimal, unexpected.',
    color: 'from-[#fafafa] to-[#f0ecf0]',
    border: 'border-[#c44dff]/20',
    accent: 'text-[#c44dff]',
    accentSecondary: 'text-[#1a1a2e]',
  },
  {
    id: 'v5',
    family: 'vapor',
    name: 'Model Heatmap',
    description: 'Data-first dashboard. Gradient bar charts rank models by rating. Click to expand into game details.',
    color: 'from-[#1a1030] to-[#0f0a1a]',
    border: 'border-[#c084fc]/30',
    accent: 'text-[#f0abfc]',
    accentSecondary: 'text-[#818cf8]',
  },
  {
    id: 'v6',
    family: 'vapor',
    name: 'Full Bleed Scroll',
    description: 'One game per screen. Full-viewport cinematic sections with giant model-name watermarks. Pure immersion.',
    color: 'from-[#2d1b69] via-[#4a1942] to-[#b44593]',
    border: 'border-[#ec4899]/30',
    accent: 'text-[#f472b6]',
    accentSecondary: 'text-[#c084fc]',
  },
];

export default function Home() {
  const neonVariants = VARIANTS.filter(v => v.family === 'neon');
  const vaporVariants = VARIANTS.filter(v => v.family === 'vapor');

  return (
    <div className="min-h-screen text-white" style={{ background: '#07060b', fontFamily: '"Outfit", system-ui, sans-serif' }}>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.3), transparent 70%)' }}
      />

      <header className="relative z-10 pt-20 pb-12 px-6 text-center">
        <p className="text-[9px] tracking-[0.8em] uppercase text-white/15 mb-6">AI Game Benchmark Gallery</p>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4" style={{ fontFamily: '"Syne", sans-serif' }}>
          <span className="text-white/90">MODEL</span>
          <span style={{ color: '#c084fc' }}>TRACKER</span>
        </h1>
        <p className="text-sm text-white/30 max-w-md mx-auto leading-relaxed">
          One prompt. One shot. How well can each AI model build a web game from scratch?
          Six ways to explore the results.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        {/* Neon Arcade section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(255,0,255,0.3), transparent)' }} />
            <h2 className="text-[10px] tracking-[0.6em] uppercase" style={{ color: '#ff00ff' }}>
              Neon Arcade
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(0,255,255,0.3), transparent)' }} />
          </div>

          <div className="grid gap-3">
            {neonVariants.map((v) => (
              <Link
                key={v.id}
                to={`/${v.id}`}
                className={`group relative block overflow-hidden rounded-xl border ${v.border} bg-gradient-to-r ${v.color} p-6 md:p-8 transition-all duration-500 hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-mono uppercase tracking-[0.4em] ${v.accentSecondary} opacity-50`}>
                        {v.id.toUpperCase()}
                      </span>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold ${v.accent}`} style={{ fontFamily: '"Syne", sans-serif' }}>
                      {v.name}
                    </h3>
                    <p className="mt-1.5 max-w-lg text-white/30 text-xs leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                  <div className={`text-2xl ${v.accent} opacity-30 group-hover:opacity-80 transition-opacity`}>
                    &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Vapor Dashboard section */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(196,77,255,0.3), transparent)' }} />
            <h2 className="text-[10px] tracking-[0.6em] uppercase" style={{ color: '#c44dff' }}>
              Vapor Dashboard
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(236,72,153,0.3), transparent)' }} />
          </div>

          <div className="grid gap-3">
            {vaporVariants.map((v) => (
              <Link
                key={v.id}
                to={`/${v.id}`}
                className={`group relative block overflow-hidden rounded-xl border ${v.border} bg-gradient-to-r ${v.color} p-6 md:p-8 transition-all duration-500 hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-mono uppercase tracking-[0.4em] ${v.accentSecondary} opacity-50`}>
                        {v.id.toUpperCase()}
                      </span>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold ${v.accent}`} style={{ fontFamily: '"Syne", sans-serif' }}>
                      {v.name}
                    </h3>
                    <p className="mt-1.5 max-w-lg text-white/30 text-xs leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                  <div className={`text-2xl ${v.accent} opacity-30 group-hover:opacity-80 transition-opacity`}>
                    &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

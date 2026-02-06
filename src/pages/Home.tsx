import { Link } from 'react-router-dom';

const VARIANTS = [
  {
    id: 'v1',
    name: 'Neon Arcade — Card Grid',
    description: 'Classic card grid with glowing neon borders, CRT scanlines, and electric color pops on a dark background.',
    color: 'from-purple-950 to-black',
    border: 'border-purple-500',
    accent: 'text-purple-400',
  },
  {
    id: 'v2',
    name: 'Neon Arcade — Spotlight',
    description: 'Single-focus spotlight carousel. One featured game takes center stage with a thumbnail filmstrip below.',
    color: 'from-indigo-950 to-black',
    border: 'border-cyan-500',
    accent: 'text-cyan-400',
  },
  {
    id: 'v3',
    name: 'Neon Arcade — High Scores',
    description: 'Arcade leaderboard ranking. Games sorted by score in a glowing table with medal tiers and point values.',
    color: 'from-pink-950 to-black',
    border: 'border-pink-500',
    accent: 'text-pink-400',
  },
  {
    id: 'v4',
    name: 'Vapor Dashboard — Frosted Grid',
    description: 'Frosted glass cards on a pastel gradient mesh. Stats bar, rounded corners, and dreamy blur effects.',
    color: 'from-violet-500 via-fuchsia-400 to-cyan-400',
    border: 'border-white/30',
    accent: 'text-white',
  },
  {
    id: 'v5',
    name: 'Vapor Dashboard — Bento Grid',
    description: 'Asymmetric bento-box masonry layout. Mixed card sizes create visual hierarchy over a deep purple gradient.',
    color: 'from-indigo-900 via-violet-800 to-purple-900',
    border: 'border-fuchsia-400/40',
    accent: 'text-fuchsia-200',
  },
  {
    id: 'v6',
    name: 'Vapor Dashboard — Showcase',
    description: 'Full-width horizontal scroll with hero-sized cards. Sunset gradients, model filters, and chrome reflections.',
    color: 'from-purple-900 via-pink-700 to-orange-500',
    border: 'border-pink-400/40',
    accent: 'text-pink-200',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="pt-20 pb-12 px-6 text-center">
        <h1 className="text-6xl font-black tracking-tight mb-4">
          MODEL<span className="text-indigo-400">TRACKER</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          A benchmark gallery showcasing web-based games produced by different AI coding models.
          Six gallery designs across two themes — choose your view.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {/* Neon Arcade section */}
        <h2 className="text-xs uppercase tracking-[0.5em] text-purple-500 mb-4 mt-4">Neon Arcade</h2>
        <div className="grid gap-4 mb-12">
          {VARIANTS.slice(0, 3).map((v) => (
            <Link
              key={v.id}
              to={`/${v.id}`}
              className={`group relative block overflow-hidden rounded-2xl border-2 ${v.border} bg-gradient-to-r ${v.color} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-mono uppercase tracking-widest ${v.accent} opacity-60`}>
                    {v.id.toUpperCase()}
                  </span>
                  <h3 className={`text-2xl font-bold mt-1 ${v.accent}`}>
                    {v.name}
                  </h3>
                  <p className={`mt-2 max-w-lg ${v.accent} opacity-70 text-sm`}>
                    {v.description}
                  </p>
                </div>
                <div className={`text-4xl ${v.accent} opacity-40 group-hover:opacity-100 transition-opacity`}>
                  &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Vapor Dashboard section */}
        <h2 className="text-xs uppercase tracking-[0.5em] text-fuchsia-400 mb-4">Vapor Dashboard</h2>
        <div className="grid gap-4">
          {VARIANTS.slice(3).map((v) => (
            <Link
              key={v.id}
              to={`/${v.id}`}
              className={`group relative block overflow-hidden rounded-2xl border-2 ${v.border} bg-gradient-to-r ${v.color} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-mono uppercase tracking-widest ${v.accent} opacity-60`}>
                    {v.id.toUpperCase()}
                  </span>
                  <h3 className={`text-2xl font-bold mt-1 ${v.accent}`}>
                    {v.name}
                  </h3>
                  <p className={`mt-2 max-w-lg ${v.accent} opacity-70 text-sm`}>
                    {v.description}
                  </p>
                </div>
                <div className={`text-4xl ${v.accent} opacity-40 group-hover:opacity-100 transition-opacity`}>
                  &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

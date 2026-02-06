import { Link } from 'react-router-dom';

const VARIANTS = [
  {
    id: 'v1',
    name: 'Brutalist Grid',
    description: 'Raw, high-contrast brutalist design with stark grid layouts and monospace typography.',
    color: 'from-zinc-900 to-zinc-700',
    border: 'border-white',
    accent: 'text-white',
  },
  {
    id: 'v2',
    name: 'Neon Arcade',
    description: 'Dark-mode neon-soaked arcade aesthetic. Glowing borders, CRT scan lines, and electric color pops.',
    color: 'from-purple-950 to-black',
    border: 'border-purple-500',
    accent: 'text-purple-400',
  },
  {
    id: 'v3',
    name: 'Editorial Magazine',
    description: 'Asymmetric magazine layouts with serif typography, generous whitespace, and editorial photography feel.',
    color: 'from-stone-100 to-amber-50',
    border: 'border-stone-800',
    accent: 'text-stone-900',
  },
  {
    id: 'v4',
    name: 'Vapor Dashboard',
    description: 'Vaporwave-inspired data dashboard with gradient meshes, frosted glass cards, and pastel synthetics.',
    color: 'from-pink-400 via-violet-400 to-cyan-400',
    border: 'border-white/30',
    accent: 'text-white',
  },
  {
    id: 'v5',
    name: 'Terminal / Hacker',
    description: 'Monochrome green-on-black terminal interface. ASCII art, blinking cursors, and command-line aesthetics.',
    color: 'from-black to-green-950',
    border: 'border-green-500',
    accent: 'text-green-400',
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
          Five distinct gallery designs — choose your view.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid gap-6">
          {VARIANTS.map((v, i) => (
            <Link
              key={v.id}
              to={`/${v.id}`}
              className={`group relative block overflow-hidden rounded-2xl border-2 ${v.border} bg-gradient-to-r ${v.color} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-mono uppercase tracking-widest ${v.accent} opacity-60`}>
                    V{i + 1}
                  </span>
                  <h2 className={`text-3xl font-bold mt-1 ${v.accent}`}>
                    {v.name}
                  </h2>
                  <p className={`mt-2 max-w-lg ${v.accent} opacity-70`}>
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

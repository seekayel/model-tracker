import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V4 — VAPOR DASHBOARD: "Museum Gallery"
 *
 * DESIGN CONCEPT: A pristine white-cube gallery with vaporwave-colored artwork.
 * Each game is a framed piece on a white wall. The model name is the artist
 * placard beside each work. Ultra-generous whitespace. The games ARE the art.
 * Hover to see the info card slide out like a museum audio guide.
 *
 * TYPOGRAPHY: Instrument Serif for titles (editorial elegance meets vapor).
 * Outfit for body (geometric, clean).
 *
 * BOLD CHOICE: White background — the ONLY white design. Games pop like
 * paintings against gallery walls. The contrast with other variants is jarring.
 */
export default function V4Gallery() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        fontFamily: '"Outfit", sans-serif',
        background: '#fafafa',
        color: '#1a1a2e',
      }}
    >
      {/* Subtle gradient wash at top */}
      <div className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none opacity-30"
        style={{ background: 'linear-gradient(180deg, rgba(196,77,255,0.08) 0%, rgba(255,107,107,0.04) 50%, transparent 100%)' }}
      />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-8 pt-16 pb-12">
        <Link to="/" className="text-[10px] tracking-[0.4em] uppercase text-[#1a1a2e]/30 hover:text-[#1a1a2e]/60 transition-colors">
          &larr; Return
        </Link>
        <div className="mt-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.6em] uppercase text-[#1a1a2e]/25 mb-3">Gallery V4</p>
            <h1
              className="text-5xl md:text-8xl leading-[0.9] tracking-tight"
              style={{ fontFamily: '"Instrument Serif", serif' }}
            >
              <span className="italic" style={{ color: '#c44dff' }}>Vapor</span>
              <br />
              <span style={{ color: '#1a1a2e' }}>Gallery</span>
            </h1>
          </div>
          <div className="hidden md:block text-right pb-2">
            <p className="text-xs text-[#1a1a2e]/30" style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic' }}>
              {PLACEHOLDER_GAMES.length} works exhibited
            </p>
            <p className="text-[10px] text-[#1a1a2e]/20 mt-1">
              {new Set(PLACEHOLDER_GAMES.map(g => g.model)).size} artists
            </p>
          </div>
        </div>
        {/* Thin gradient line */}
        <div className="mt-8 h-px"
          style={{ background: 'linear-gradient(90deg, #c44dff, #ff6b6b, #feca57, #4facfe, transparent)' }}
        />
      </header>

      {/* Gallery */}
      <main className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
          {PLACEHOLDER_GAMES.map((game, i) => (
            <article key={game.id} className="group">
              {/* Frame */}
              <div
                className="relative rounded-sm overflow-hidden transition-all duration-700 group-hover:shadow-2xl"
                style={{
                  boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
                  border: '8px solid white',
                  outline: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <PlaceholderImage
                  seed={game.id}
                  className="w-full h-auto group-hover:scale-[1.03] transition-transform duration-700"
                />

                {/* Hover overlay with play button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500">
                    <button
                      className="px-8 py-3 rounded-full text-xs uppercase tracking-[0.3em] font-medium text-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #c44dff, #ff6b6b)',
                        boxShadow: '0 4px 20px rgba(196,77,255,0.4)',
                      }}
                    >
                      Play
                    </button>
                  </div>
                </div>
              </div>

              {/* Placard — like a museum label */}
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h2
                    className="text-xl md:text-2xl tracking-tight"
                    style={{ fontFamily: '"Instrument Serif", serif' }}
                  >
                    {game.title}
                  </h2>
                  <p
                    className="text-sm mt-0.5 italic"
                    style={{ fontFamily: '"Instrument Serif", serif', color: '#c44dff' }}
                  >
                    {game.model}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-[10px] text-[#1a1a2e]/30">&#9733;</span>
                    <span className="text-sm font-semibold text-[#1a1a2e]/60">{game.rating}</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#1a1a2e]/35 leading-relaxed mt-2 max-w-md">
                {game.description}
              </p>
              <div className="flex gap-2 mt-3">
                {game.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/20"
                    style={{ borderBottom: `1px solid ${i % 2 === 0 ? 'rgba(196,77,255,0.2)' : 'rgba(255,107,107,0.2)'}` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-8 py-8 border-t border-[#1a1a2e]/5">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#1a1a2e]/15 text-center"
          style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', letterSpacing: '0.3em' }}
        >
          Model Tracker &mdash; Vapor Gallery
        </p>
      </footer>
    </div>
  );
}

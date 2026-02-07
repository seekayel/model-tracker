import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';
import PlaceholderImage from '../components/PlaceholderImage';

/**
 * V6 — VAPOR DASHBOARD: "Full Bleed Scroll"
 *
 * DESIGN CONCEPT: Each game is a full-viewport section. You scroll vertically
 * and each game consumes the entire screen — image bleeds edge to edge,
 * content overlaid. The model name is ENORMOUS, running across the bottom
 * of each section as a ghosted watermark. It's cinematic, overwhelming.
 *
 * TYPOGRAPHY: Syne for hero titles (geometric, impactful).
 * Outfit for body. DM Mono for data.
 *
 * BOLD CHOICE: ONE game per screen. No grid, no cards, no density.
 * Just pure full-bleed immersion. The model watermark is 20vw+ in size.
 * This is the most dramatic, least information-dense variant.
 */
export default function V6Gallery() {
  const [current, setCurrent] = useState(0);

  return (
    <div
      className="text-white relative"
      style={{ fontFamily: '"Outfit", sans-serif' }}
    >
      {/* Fixed navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="text-[10px] tracking-[0.4em] uppercase text-white/40 hover:text-white/80 transition-colors backdrop-blur-sm bg-black/20 rounded-full px-4 py-2"
        >
          &larr; Home
        </Link>
        <div className="backdrop-blur-sm bg-black/20 rounded-full px-4 py-2 flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
            VAPOR DASH
          </h1>
          <span className="text-[9px] text-white/30">V6</span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 backdrop-blur-sm bg-black/20 rounded-full px-3 py-2">
          {PLACEHOLDER_GAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                document.getElementById(`game-section-${i}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-white scale-125' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </nav>

      {/* Full-bleed sections */}
      {PLACEHOLDER_GAMES.map((game, i) => {
        const isEven = i % 2 === 0;

        return (
          <section
            key={game.id}
            id={`game-section-${i}`}
            className="relative min-h-screen flex items-end overflow-hidden"
            onMouseEnter={() => setCurrent(i)}
          >
            {/* Full background image */}
            <div className="absolute inset-0">
              <PlaceholderImage
                seed={game.id}
                cover
                className="absolute inset-0 w-full h-full saturate-[1.6] brightness-75"
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0" style={{
                background: isEven
                  ? 'linear-gradient(180deg, rgba(15,10,26,0.3) 0%, rgba(15,10,26,0.95) 80%)'
                  : 'linear-gradient(180deg, rgba(26,16,51,0.3) 0%, rgba(26,16,51,0.95) 80%)',
              }} />
              {/* Side gradient for readability */}
              <div className="absolute inset-0" style={{
                background: isEven
                  ? 'linear-gradient(90deg, rgba(15,10,26,0.8) 0%, transparent 60%)'
                  : 'linear-gradient(270deg, rgba(26,16,51,0.8) 0%, transparent 60%)',
              }} />
            </div>

            {/* Giant model watermark */}
            <div
              className="absolute bottom-[15%] pointer-events-none select-none whitespace-nowrap"
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(80px, 15vw, 250px)',
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.06)',
                left: isEven ? '-2%' : 'auto',
                right: isEven ? 'auto' : '-2%',
              }}
            >
              {game.model}
            </div>

            {/* Content */}
            <div className={`relative z-10 w-full px-8 md:px-16 pb-16 md:pb-24 pt-32 ${isEven ? '' : 'text-right'}`}>
              <div className={`max-w-xl ${isEven ? '' : 'ml-auto'}`}>
                {/* Number */}
                <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase mb-4"
                  style={{ fontFamily: '"DM Mono", monospace' }}
                >
                  {String(i + 1).padStart(2, '0')} / {String(PLACEHOLDER_GAMES.length).padStart(2, '0')}
                </p>

                {/* Model attribution */}
                <div className={`flex items-center gap-3 mb-4 ${isEven ? '' : 'justify-end'}`}>
                  <span
                    className="text-xs uppercase tracking-[0.3em] px-3 py-1.5 rounded-full backdrop-blur-sm"
                    style={{
                      background: 'rgba(196,77,255,0.15)',
                      border: '1px solid rgba(196,77,255,0.25)',
                      color: '#e9b0ff',
                    }}
                  >
                    {game.model}
                  </span>
                  <span className="text-sm font-bold text-yellow-400/60" style={{ fontFamily: '"DM Mono", monospace' }}>
                    {game.rating}
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-6"
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    background: isEven
                      ? 'linear-gradient(135deg, #fff 30%, #c084fc)'
                      : 'linear-gradient(135deg, #fff 30%, #f472b6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {game.title}
                </h2>

                {/* Description */}
                <p className="text-sm md:text-base text-white/35 leading-relaxed mb-6 max-w-md"
                  style={isEven ? {} : { marginLeft: 'auto' }}
                >
                  {game.description}
                </p>

                {/* Tags + CTA */}
                <div className={`flex items-center gap-4 ${isEven ? '' : 'justify-end'}`}>
                  <div className={`flex gap-2 ${isEven ? '' : 'order-2'}`}>
                    {game.tags.map(tag => (
                      <span key={tag} className="text-[9px] uppercase tracking-widest text-white/15">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    className={`px-8 py-3 rounded-full text-xs uppercase tracking-[0.3em] font-bold transition-all hover:scale-105 ${isEven ? '' : 'order-1'}`}
                    style={{
                      background: isEven
                        ? 'linear-gradient(135deg, #c44dff, #7c3aed)'
                        : 'linear-gradient(135deg, #ec4899, #db2777)',
                      boxShadow: isEven
                        ? '0 4px 30px rgba(196,77,255,0.3)'
                        : '0 4px 30px rgba(236,72,153,0.3)',
                    }}
                  >
                    Play Now
                  </button>
                </div>
              </div>
            </div>

            {/* Section divider */}
            {i < PLACEHOLDER_GAMES.length - 1 && (
              <div className="absolute bottom-0 left-[10%] right-[10%] h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
              />
            )}
          </section>
        );
      })}

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 text-center" style={{ background: '#0a0714' }}>
        <p className="text-[10px] tracking-[0.5em] text-white/10 uppercase">
          Model Tracker &mdash; Vapor Dashboard Full Bleed
        </p>
      </footer>
    </div>
  );
}

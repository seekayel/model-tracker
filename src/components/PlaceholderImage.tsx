interface PlaceholderImageProps {
  seed: string;
  className?: string;
}

const PALETTES = [
  ['#6366f1', '#8b5cf6', '#a78bfa'],
  ['#f43f5e', '#fb7185', '#fda4af'],
  ['#06b6d4', '#22d3ee', '#67e8f9'],
  ['#f59e0b', '#fbbf24', '#fcd34d'],
  ['#10b981', '#34d399', '#6ee7b7'],
  ['#ec4899', '#f472b6', '#f9a8d4'],
  ['#3b82f6', '#60a5fa', '#93c5fd'],
  ['#ef4444', '#f87171', '#fca5a5'],
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function PlaceholderImage({ seed, className = '' }: PlaceholderImageProps) {
  const h = hashCode(seed);
  const palette = PALETTES[h % PALETTES.length];
  const angle = (h % 360);
  const shapes = Array.from({ length: 5 }, (_, i) => {
    const cx = 20 + ((h * (i + 1) * 37) % 260);
    const cy = 20 + ((h * (i + 1) * 53) % 160);
    const r = 15 + ((h * (i + 1)) % 40);
    return { cx, cy, r, fill: palette[(i + 1) % palette.length] };
  });

  return (
    <svg
      viewBox="0 0 300 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="100%" stopColor={palette[2]} />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill={`url(#grad-${seed})`} />
      {shapes.map((s, i) => (
        <g key={i} opacity="0.3">
          {i % 2 === 0 ? (
            <circle cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />
          ) : (
            <rect
              x={s.cx - s.r / 2}
              y={s.cy - s.r / 2}
              width={s.r}
              height={s.r}
              fill={s.fill}
              transform={`rotate(${angle + i * 30} ${s.cx} ${s.cy})`}
            />
          )}
        </g>
      ))}
      <text
        x="150"
        y="108"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, sans-serif"
        fontSize="18"
        fontWeight="bold"
        opacity="0.7"
      >
        {seed.replace(/-/g, ' ').toUpperCase()}
      </text>
    </svg>
  );
}

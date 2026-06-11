const memData = [10, 12, 14, 16, 18, 22, 28, 40, 60, 82, 94, 98, 97, 95, 90, 82, 70, 55, 38, 25];
const xLabels = ['T-10m', 'T-5m', 'NOW'];

function buildMemPath(data: number[], W: number, H: number, P: number): string {
  const xs = data.map((_, i) => P + (i / (data.length - 1)) * (W - P * 2));
  const ys = data.map((v) => H - P - (v / 100) * (H - P * 2));
  return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i]}`).join(' ');
}

function buildMemArea(data: number[], W: number, H: number, P: number): string {
  const xs = data.map((_, i) => P + (i / (data.length - 1)) * (W - P * 2));
  const ys = data.map((v) => H - P - (v / 100) * (H - P * 2));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' L ');
  return `M ${xs[0]},${H - P} L ${pts} L ${xs[xs.length - 1]},${H - P} Z`;
}

export default function MemoryChart() {
  const W = 260;
  const H = 120;
  const P = 16;

  const path = buildMemPath(memData, W, H, P);
  const area = buildMemArea(memData, W, H, P);

  const xPositions = [0, 0.5, 1].map((t) => P + t * (W - P * 2));

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#memGrad)" />
        <path d={path} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {xPositions.map((x, i) => (
          <text
            key={i}
            x={x}
            y={H - 2}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
            fontFamily="Inter, sans-serif"
          >
            {xLabels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

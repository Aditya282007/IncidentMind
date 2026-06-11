import { useState } from 'react';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const incidentsData = [3, 2, 4, 8, 14, 12, 7];
const mttrData = [5, 3, 6, 10, 9, 11, 6];

function buildPath(data: number[], width: number, height: number, padding: number): string {
  const max = Math.max(...data) * 1.2;
  const xs = data.map((_, i) => padding + (i / (data.length - 1)) * (width - padding * 2));
  const ys = data.map((v) => height - padding - (v / max) * (height - padding * 2));
  return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i]}`).join(' ');
}

function buildArea(data: number[], width: number, height: number, padding: number): string {
  const max = Math.max(...data) * 1.2;
  const xs = data.map((_, i) => padding + (i / (data.length - 1)) * (width - padding * 2));
  const ys = data.map((v) => height - padding - (v / max) * (height - padding * 2));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' L ');
  return `M ${xs[0]},${height - padding} L ${pts} L ${xs[xs.length - 1]},${height - padding} Z`;
}

export default function AnalyticsChart() {
  const [view, setView] = useState<'W' | 'M'>('W');
  const W = 560;
  const H = 240;
  const P = 20;

  const incPath = buildPath(incidentsData, W, H, P);
  const incArea = buildArea(incidentsData, W, H, P);
  const mttrPath = buildPath(mttrData, W, H, P);
  const mttrArea = buildArea(mttrData, W, H, P);

  const xs = days.map((_, i) => P + (i / (days.length - 1)) * (W - P * 2));

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-base">System Analytics</h3>
          <p className="text-gray-500 text-xs mt-0.5">Performance performance trends</p>
        </div>
        <div className="flex items-center gap-1 bg-[#111] border border-[#2a2a2a] rounded-md p-0.5">
          {(['W', 'M'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`w-7 h-6 text-xs font-semibold rounded transition-colors ${
                view === v ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* MTTR area (green, behind) */}
          <path d={mttrArea} fill="url(#mttrGrad)" />
          <path d={mttrPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />

          {/* Incidents area (blue, on top) */}
          <path d={incArea} fill="url(#incGrad)" />
          <path d={incPath} fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeLinejoin="round" />

          {/* X axis labels */}
          {days.map((d, i) => (
            <text
              key={d}
              x={xs[i]}
              y={H - 2}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
              fontFamily="Inter, sans-serif"
            >
              {d}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex items-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7dd3fc]" />
          <span className="text-gray-400 text-xs">Incidents / Day</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          <span className="text-gray-400 text-xs">MTTR Average</span>
        </div>
      </div>
    </div>
  );
}

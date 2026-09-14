import React, { useState } from 'react';

export const GrowthChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Fallback points if none provided
  const points = data.length > 0 ? data : [
    { label: 'Jan', tracks: 120, streams: 1.2 },
    { label: 'Feb', tracks: 165, streams: 1.8 },
    { label: 'Mar', tracks: 210, streams: 2.4 },
    { label: 'Apr', tracks: 290, streams: 3.1 },
    { label: 'May', tracks: 340, streams: 3.9 },
    { label: 'Jun', tracks: 420, streams: 4.8 },
    { label: 'Jul', tracks: 510, streams: 5.6 },
    { label: 'Aug', tracks: 630, streams: 6.7 },
  ];

  const maxTracks = Math.max(...points.map((p) => p.tracks), 100);
  const chartHeight = 140;
  const chartWidth = 500;
  const padding = 20;

  // Build SVG path
  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (p.tracks / maxTracks) * (chartHeight - padding * 2);
    return { x, y, ...p };
  });

  const pathD = coords.reduce((acc, curr, i) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = coords[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${chartHeight - padding} L ${coords[0].x} ${chartHeight - padding} Z`;

  return (
    <div className="p-5 rounded-md border border-white/[0.07] bg-[#111319] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#f1eee6] tracking-tight">Catalogue Ingestion Velocity</h3>
          <p className="text-[11px] text-[#686e7d] mt-0.5">Cumulative songs & audio tracks catalogued over rolling quarters</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#e8a33d]">
            <span className="w-2 h-2 rounded-full bg-[#e8a33d]" />
            <span>Tracks Ingested</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8a33d" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e8a33d" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.08)" />

          {/* Area under curve */}
          <path d={areaD} fill="url(#amberGlow)" />

          {/* Spline stroke */}
          <path d={pathD} fill="none" stroke="#e8a33d" strokeWidth="2.2" strokeLinecap="round" />

          {/* Points */}
          {coords.map((c, i) => (
            <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} className="cursor-pointer">
              <circle
                cx={c.x}
                cy={c.y}
                r={hoverIndex === i ? 5 : 3}
                fill={hoverIndex === i ? '#f1eee6' : '#e8a33d'}
                stroke="#12141a"
                strokeWidth="2"
                className="transition-all"
              />
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute top-2 bg-[#07080a] border border-[#e8a33d]/40 px-2.5 py-1 rounded text-xs pointer-events-none shadow-xl transition-all"
            style={{
              left: `${(coords[hoverIndex].x / chartWidth) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="font-mono text-[#e8a33d] font-semibold">{coords[hoverIndex].tracks} tracks</span>
            <span className="text-[#9aa0ae] text-[10px] ml-1.5">({coords[hoverIndex].label})</span>
          </div>
        )}

        {/* X-axis labels */}
        <div className="flex justify-between px-3 pt-2 text-[10px] font-mono text-[#686e7d]">
          {points.map((p, i) => (
            <span key={i}>{p.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

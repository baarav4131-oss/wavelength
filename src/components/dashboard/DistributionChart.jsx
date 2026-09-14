import React from 'react';

export const DistributionChart = ({
  counts = {},
}) => {
  const items = [
    { label: 'Songs', count: counts.songs || 0, color: '#e8a33d' },
    { label: 'Albums', count: counts.albums || 0, color: '#3fc9b0' },
    { label: 'Artists', count: counts.artists || 0, color: '#5b9bd5' },
    { label: 'Podcasts', count: counts.podcasts || 0, color: '#a78bfa' },
    { label: 'Episodes', count: counts.episodes || 0, color: '#f472b6' },
  ];

  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className="p-5 rounded-md border border-white/[0.07] bg-[#111319] space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#f1eee6] tracking-tight">Catalogue Entity Distribution</h3>
        <p className="text-[11px] text-[#686e7d] mt-0.5">Relational proportion of media entities across tables</p>
      </div>

      {/* Segmented Stacked Progress Bar */}
      <div className="h-4 w-full bg-white/5 rounded overflow-hidden flex p-0.5 gap-0.5">
        {items.map((item) => {
          const pct = Math.max(3, (item.count / total) * 100);
          return (
            <div
              key={item.label}
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              className="h-full rounded-xs transition-all duration-300 hover:opacity-80 cursor-pointer"
              title={`${item.label}: ${item.count} (${((item.count / total) * 100).toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend list with counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#9aa0ae] text-[11px]">{item.label}</span>
            </div>
            <span className="font-mono text-[11px] text-[#f1eee6] font-semibold">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

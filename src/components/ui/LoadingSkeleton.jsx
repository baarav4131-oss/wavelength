import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full animate-pulse border border-white/10 rounded-md overflow-hidden bg-[#14171f]/60">
      <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-white/10 rounded w-24" />
        ))}
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-12 flex items-center px-4 gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-3.5 bg-white/5 rounded"
                style={{ width: `${Math.floor(40 + (c * 15) % 60)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="p-5 rounded-md border border-white/10 bg-[#14171f] animate-pulse">
    <div className="h-3.5 bg-white/10 rounded w-28 mb-3" />
    <div className="h-7 bg-white/15 rounded w-16 mb-2" />
    <div className="h-3 bg-white/5 rounded w-36" />
  </div>
);

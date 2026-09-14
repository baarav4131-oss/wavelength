import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  accent = 'amber',
  onClick,
}) => {
  const accentClasses = {
    amber: 'text-[#e8a33d] bg-[#e8a33d]/10 border-[#e8a33d]/20',
    teal: 'text-[#3fc9b0] bg-[#3fc9b0]/10 border-[#3fc9b0]/20',
    blue: 'text-[#5b9bd5] bg-[#5b9bd5]/10 border-[#5b9bd5]/20',
    violet: 'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/20',
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-md border border-white/[0.07] bg-[#111319] hover:border-white/15 transition-all duration-200 group relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:bg-[#141721]' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#8a90a0] tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded border ${accentClasses[accent] || accentClasses.amber}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5">
        <div className="text-2xl lg:text-3xl font-display font-bold text-[#f1eee6] tracking-tight">
          {value}
        </div>
        {trend && (
          <div
            className={`flex items-center text-[11px] font-medium ${
              trendPositive ? 'text-[#3fc9b0]' : 'text-[#e2665f]'
            }`}
          >
            {trendPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[#686e7d] mt-1.5 truncate">
          {subtitle}
        </p>
      )}

      {/* Subtle bottom edge accent glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e8a33d]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

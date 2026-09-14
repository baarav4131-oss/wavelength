import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  actions,
  badge,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.07]">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-semibold tracking-tight text-[#f1eee6]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-[#9aa0ae] mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

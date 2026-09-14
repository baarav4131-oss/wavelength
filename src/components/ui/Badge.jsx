import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    default: 'bg-white/5 text-[#9aa0ae] border border-white/10',
    pk: 'bg-[#e8a33d]/10 text-[#e8a33d] border border-[#e8a33d]/30 font-mono tracking-tight font-medium',
    fk: 'bg-[#5b9bd5]/10 text-[#7fb2e6] border border-[#5b9bd5]/30 font-mono tracking-tight',
    live: 'bg-[#3fc9b0]/15 text-[#3fc9b0] border border-[#3fc9b0]/30 font-medium',
    demo: 'bg-[#e8a33d]/15 text-[#e8a33d] border border-[#e8a33d]/30 font-medium',
    success: 'bg-[#3fc9b0]/10 text-[#3fc9b0] border border-[#3fc9b0]/20',
    warning: 'bg-[#e8a33d]/10 text-[#e8a33d] border border-[#e8a33d]/20',
    danger: 'bg-[#e2665f]/10 text-[#e2665f] border border-[#e2665f]/20',
    info: 'bg-[#5b9bd5]/10 text-[#5b9bd5] border border-[#5b9bd5]/20',
    muted: 'bg-black/30 text-[#686e7d] border border-white/5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium select-none ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
};

export const PkBadge = ({ id, showKeyIcon = true }) => (
  <Badge variant="pk" size="xs">
    {showKeyIcon && <span className="text-[9px]">🔑</span>}
    <span>{id}</span>
  </Badge>
);

export const FkBadge = ({ id, label, showLinkIcon = true }) => (
  <span className="inline-flex items-center gap-1.5 text-xs">
    <Badge variant="fk" size="xs">
      {showLinkIcon && <span className="text-[9px]">🔗</span>}
      <span>{id}</span>
    </Badge>
    {label && <span className="text-[#9aa0ae] truncate max-w-[140px] font-normal">{label}</span>}
  </span>
);

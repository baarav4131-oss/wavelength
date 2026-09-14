import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none gap-2 active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs tracking-wide',
    md: 'px-3.5 py-2 text-xs font-semibold tracking-wide',
    lg: 'px-5 py-2.5 text-sm font-semibold tracking-wide',
    icon: 'p-2 rounded',
  };

  const variantClasses = {
    primary: 'bg-[#e8a33d] hover:bg-[#f0ad4c] text-[#12141a] shadow-sm shadow-[#e8a33d]/20 hover:shadow-[#e8a33d]/30 font-semibold',
    ghost: 'bg-transparent text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/5 border border-white/10 hover:border-white/20',
    danger: 'bg-transparent text-[#e2665f] hover:bg-[#e2665f]/10 border border-[#e2665f]/30 hover:border-[#e2665f]/60',
    subtle: 'bg-white/5 text-[#f1eee6] hover:bg-white/10 border border-white/5',
    teal: 'bg-[#3fc9b0] hover:bg-[#4edfc4] text-[#0a1f1b] font-semibold shadow-sm shadow-[#3fc9b0]/20',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

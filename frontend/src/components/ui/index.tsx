import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'teal' | 'orange' | 'amber' | 'red' | 'green' | 'violet' | 'slate' | 'outline' | 'danger' | 'warning';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    neutral: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
    teal: 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold',
    orange: 'bg-amber-50 text-amber-800 border border-amber-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    red: 'bg-red-50 text-red-800 border border-red-200',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    green: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    violet: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    slate: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
    outline: 'border border-zinc-200 text-zinc-600 bg-transparent',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full tracking-normal transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 font-medium shadow-sm transition-all',
    secondary: 'bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 shadow-xs transition-all',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all',
    outline: 'bg-transparent border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-all',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-md gap-2',
    lg: 'text-base px-5 py-2.5 rounded-md gap-2.5',
    icon: 'p-2 rounded-md',
  };

  return (
    <button
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-white border border-zinc-200 rounded-lg shadow-xs p-5 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:bg-stone-800 disabled:text-stone-600',
  secondary: 'bg-stone-100 text-stone-900 hover:bg-red-500 hover:text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:opacity-40',
  ghost: 'bg-stone-900 border border-stone-800 text-stone-400 hover:bg-stone-800 font-mono-game text-xs uppercase tracking-wider',
};

export function Button({ variant = 'primary', className = '', children, ...props }: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`py-3 px-5 transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

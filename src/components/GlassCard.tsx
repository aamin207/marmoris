/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: 'light' | 'medium' | 'dark' | 'none';
  borderRadius?: '24' | '28' | '32';
  hoverEffect?: boolean;
  className?: string;
}

export default function GlassCard({
  children,
  intensity = 'medium',
  borderRadius = '28',
  hoverEffect = false,
  className = '',
  ...props
}: GlassCardProps) {
  const intensityClasses = {
    light: 'bg-white/80 backdrop-blur-md border border-brand-pink/25 shadow-[0_1px_1px_0_rgba(255,255,255,0.9)_inset,0_4px_16px_0_rgba(30,41,17,0.04)]',
    medium: 'bg-white/70 backdrop-blur-lg border border-brand-pink/30 shadow-[0_1.5px_1.5px_0_rgba(255,255,255,0.95)_inset,0_8px_24px_-2px_rgba(30,41,17,0.06)]',
    dark: 'bg-stone-900/80 backdrop-blur-xl border border-white/20 text-white shadow-[0_1px_1px_0_rgba(255,255,255,0.3)_inset,0_12px_32px_-4px_rgba(0,0,0,0.3)]',
    none: 'bg-transparent border-transparent'
  };

  const radiusClasses = {
    '24': 'rounded-[24px]',
    '28': 'rounded-[28px]',
    '32': 'rounded-[32px]'
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-[0_1.5px_2px_0_rgba(255,255,255,1)_inset,0_12px_28px_-4px_rgba(212,127,191,0.2)] hover:border-brand-pink/50'
    : '';

  return (
    <div
      className={`relative ${intensityClasses[intensity]} ${radiusClasses[borderRadius]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';

// Convert English numbers to Farsi numbers
export const toPersianNumbers = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
};

// Format price in Toman
export const formatPrice = (price: number): string => {
  const formatted = new Intl.NumberFormat('en-US').format(Math.round(price));
  return toPersianNumbers(formatted) + ' تومان';
};

interface PriceDisplayProps {
  price: number;
  discountPercentage?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  price, 
  discountPercentage = 0, 
  className = "",
  size = 'md' 
}) => {
  if (!price) return null;

  // Case 1: No discount
  if (!discountPercentage || discountPercentage === 0) {
    return (
      <span className={`font-bold text-brand-charcoal ${size === 'lg' ? 'text-lg md:text-xl' : 'text-sm'} ${className}`}>
        {formatPrice(price)}
      </span>
    );
  }

  // Case 2: Has discount -> Calculate final price
  const finalPrice = price - (price * discountPercentage / 100);

  return (
    <div className={`flex flex-col gap-1 text-right ${className}`} dir="rtl">
      {/* Original price + Discount badge */}
      <div className="flex items-center gap-2">
        <span className="line-through text-brand-stone/50 text-[10px] md:text-xs font-sans">
          {formatPrice(price)}
        </span>
        <span className="bg-rose-500 text-white text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
          {toPersianNumbers(discountPercentage)}٪ تخفیف
        </span>
      </div>
      {/* Final Price */}
      <span className={`font-black text-brand-charcoal font-sans ${size === 'lg' ? 'text-xl md:text-2xl' : 'text-sm md:text-base'}`}>
        {formatPrice(finalPrice)}
      </span>
    </div>
  );
};

export default PriceDisplay;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ArrowLeft } from 'lucide-react';
import { Product } from '@/types';
import { useState, MouseEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSlug } from '@/lib/apiClient';
import { PriceDisplay, toPersianNumbers, formatPrice } from './PriceDisplay';

interface ProductCardProps {
  product: Product;
  isSpecial?: boolean;
  key?: any;
}

// Product Details Skeleton or other components can go here if needed

export default function ProductCard({ product, isSpecial }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('marmoris_favorites');
      if (stored) {
        const favorites = JSON.parse(stored) as string[];
        if (favorites.includes(String(product.product_id))) {
          setIsLiked(true);
        }
      }
    } catch (e) {
      console.error('Error reading favorites:', e);
    }
  }, [product.product_id]);

  const handleLike = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVal = !isLiked;
    setIsLiked(nextVal);
    
    try {
      const stored = localStorage.getItem('marmoris_favorites');
      let favorites: string[] = stored ? JSON.parse(stored) : [];
      if (nextVal) {
        if (!favorites.includes(String(product.product_id))) {
          favorites.push(String(product.product_id));
        }
      } else {
        favorites = favorites.filter(id => id !== String(product.product_id));
      }
      localStorage.setItem('marmoris_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Error writing favorites:', err);
    }
  };

  const seoUrl = `/product/${product.product_id}/${getSlug(product.title)}`;
  const isOutOfStock = !product.inStock || (product.stock !== undefined && product.stock <= 0);

  return (
    <div className="relative group h-full">
      <Link href={seoUrl} className="block h-full">
        <div className="relative bg-white border border-brand-pink/15 rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-brand-pink/5 hover:border-brand-pink/40 p-4 h-full flex flex-col justify-between">
          
          {/* Image Canvas with Floating Badge & Heart Icon inside */}
          <div>
            <div className="w-full aspect-square rounded-[18px] overflow-hidden bg-brand-cream relative">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                referrerPolicy="no-referrer"
                className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                  isOutOfStock ? 'grayscale-[35%] opacity-80' : ''
                }`}
                priority={isSpecial ? true : false}
              />
              
              {/* Soft overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-pink/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Badges on Top-Right */}
              {isOutOfStock ? (
                <div className="absolute top-3 right-3 z-20 bg-stone-900/85 text-stone-100 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 font-sans shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>ناموجود</span>
                </div>
              ) : product.discount_percentage && product.discount_percentage > 0 ? (
                <div className="absolute top-3 right-3 z-20 bg-rose-500/90 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-300/40 font-sans shadow-sm flex items-center gap-1 backdrop-blur-md">
                  <span>{toPersianNumbers(product.discount_percentage)}٪ تخفیف</span>
                </div>
              ) : product.featured ? (
                <div className="absolute top-3 right-3 z-20 liquid-glass-pill text-brand-pink-dark text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border border-brand-pink/30 font-sans shadow-sm">
                  ویژه مرموریس
                </div>
              ) : null}

              {/* Wishlist Heart Button on Top-Left (Circular Liquid Glass Icon Button) */}
              <button
                type="button"
                onClick={handleLike}
                aria-label="افزودن به علاقه‌مندی‌ها"
                className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full liquid-glass-btn text-brand-stone flex items-center justify-center shadow-sm transition-all duration-200 active:scale-90 group/btn cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-brand-stone group-hover/btn:text-rose-500'
                  }`}
                />
              </button>
            </div>

            {/* Product Details */}
            <div className="mt-4 px-1 space-y-2 text-right" dir="rtl">
              <span className="text-[10px] text-brand-pink-dark font-semibold tracking-wider block font-sans">
                {product.category}
              </span>
              <h3 className="text-sm font-bold text-brand-charcoal group-hover:text-brand-pink-dark transition-colors line-clamp-1">
                {product.title}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1 text-amber-500 justify-start">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-semibold text-brand-charcoal">
                  {toPersianNumbers(product.rating?.rate ?? 0)}
                </span>
                <span className="text-[10px] text-brand-stone">
                  ({toPersianNumbers(product.rating?.count ?? 0)} نظر)
                </span>
              </div>
            </div>
          </div>

          {/* Pricing and Action Row */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-brand-cream">
            <PriceDisplay 
              price={product.price} 
              discountPercentage={product.discount_percentage} 
            />

            {isOutOfStock ? (
              <div className="bg-stone-100 border border-stone-200 text-stone-500 text-xs font-bold py-2 px-3 rounded-[12px] flex items-center gap-1 cursor-not-allowed">
                <span>ناموجود</span>
              </div>
            ) : (
              <div className="bg-brand-pink-light border border-brand-pink/15 text-brand-pink-dark text-xs font-bold py-2 px-3 rounded-[12px] transition-all duration-300 group-hover:bg-brand-pink-dark group-hover:text-white flex items-center gap-1 cursor-pointer">
                <span>مشاهده</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

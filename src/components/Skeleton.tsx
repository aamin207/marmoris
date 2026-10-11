/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-brand-cream/65 border border-brand-pink/5 ${className}`}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white border border-brand-pink/10 rounded-[24px] p-4 space-y-4 h-full flex flex-col justify-between shadow-sm animate-pulse">
      <div>
        <SkeletonPulse className="w-full aspect-square rounded-[20px]" />
        <div className="space-y-2 px-1 pt-3">
          <SkeletonPulse className="h-3 w-1/3 rounded-full" />
          <SkeletonPulse className="h-4.5 w-5/6 rounded-full" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <SkeletonPulse className="h-5 w-1/4 rounded-full" />
        <SkeletonPulse className="h-8 w-1/3 rounded-[16px]" />
      </div>
    </div>
  );
}

export function SliderSkeleton() {
  return (
    <div className="relative w-full aspect-[21/9] rounded-[32px] overflow-hidden bg-white border border-brand-pink/10 animate-pulse">
      <SkeletonPulse className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-y-0 right-12 flex flex-col justify-center space-y-4 max-w-lg z-10">
        <SkeletonPulse className="h-4 w-24 rounded-full" />
        <SkeletonPulse className="h-12 w-80 rounded-full" />
        <SkeletonPulse className="h-6 w-96 rounded-full" />
        <div className="flex gap-4 pt-2">
          <SkeletonPulse className="h-12 w-32 rounded-[24px]" />
          <SkeletonPulse className="h-12 w-32 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center space-y-3 animate-pulse">
      <SkeletonPulse className="w-24 h-24 rounded-[24px]" />
      <SkeletonPulse className="h-4 w-16 rounded-full" />
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 animate-pulse" dir="rtl">
      <div className="w-full lg:w-1/2 aspect-square max-w-xl mx-auto">
        <SkeletonPulse className="w-full h-full rounded-[32px]" />
      </div>
      <div className="w-full lg:w-1/2 space-y-6">
        <SkeletonPulse className="h-4 w-24 rounded-full" />
        <SkeletonPulse className="h-10 w-96 rounded-full" />
        <SkeletonPulse className="h-6 w-36 rounded-full" />
        <SkeletonPulse className="h-24 w-full rounded-[20px]" />
        <SkeletonPulse className="h-12 w-48 rounded-[16px]" />
      </div>
    </div>
  );
}

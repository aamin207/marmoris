/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home, LifeBuoy } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console or error tracker safely
    console.error('Captured App Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-12" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-brand-pink/15 rounded-[32px] p-8 md:p-10 shadow-sm shadow-brand-pink/5 space-y-8 relative overflow-hidden"
      >
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-brand-pink/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-brand-cream rounded-full blur-2xl pointer-events-none" />

        {/* Visual Icon */}
        <div className="w-20 h-20 bg-brand-cream border border-brand-pink/15 text-brand-pink-dark rounded-full flex items-center justify-center mx-auto shadow-inner relative z-10">
          <AlertCircle className="w-10 h-10 animate-pulse" />
        </div>

        {/* Text Details */}
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-extrabold text-brand-pink-dark">خطای سرور ۵۰۰</h1>
          <h2 className="text-lg font-bold text-brand-charcoal">بروز مشکل در پردازش درخواست</h2>
          <p className="text-xs text-brand-stone leading-relaxed max-w-sm mx-auto">
            متأسفانه هنگام پردازش درخواست شما خطایی در سیستم رخ داده است. این موضوع به تیم فنی مرموریس گزارش شد. لطفاً چند لحظه دیگر دوباره تلاش کنید.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center relative z-10 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-6 py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-pink/10"
          >
            <RotateCcw className="w-4 h-4" />
            تلاش مجدد
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto bg-brand-cream hover:bg-brand-pink-light/30 border border-brand-pink/20 text-brand-stone hover:text-brand-pink-dark text-xs font-bold px-6 py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            بازگشت به خانه
          </Link>
        </div>

        {/* Support helper */}
        <div className="pt-4 border-t border-brand-pink/10 text-[10px] text-brand-stone/60 flex items-center justify-center gap-1">
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>در صورت ادامه مشکل، پشتیبانی گالری پاسخگوی شماست.</span>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { getFaqs } from '@/lib/apiClient';
import { FAQ } from '@/types';
import { ChevronDown, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const data = await getFaqs();
        setFaqs(data || []);
      } catch (err) {
        console.error('Failed to fetch FAQs:', err);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-right relative animate-fade-in" dir="rtl">
      {/* Decorative Glows */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200/60 px-4 py-1.5 rounded-full text-xs font-bold text-slate-600">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          مرکز پشتیبانی و پاسخ‌دهی مرموریس
        </div>
        <h1 className="text-3xl font-black text-slate-800 md:text-4xl">سوالات متداول</h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          پاسخ پرتکرارترین پرسش‌های شما درباره محصولات، ارسال و سفارش‌های اختصاصی مرموریس.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400">در حال دریافت سوالات...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white/60 border border-brand-pink/15 rounded-[28px] p-8 text-center text-xs font-bold text-slate-600">
          در حال حاضر سوال متداولی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openIndex === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white/40 backdrop-blur-md border border-white/20 rounded-[24px] overflow-hidden transition-all duration-300 shadow-md shadow-slate-100/50"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-right focus:outline-none cursor-pointer group"
                >
                  <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-full bg-slate-100/80 border border-slate-200/50 text-slate-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-blue-600 border-blue-100' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 md:px-6 md:pb-6 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100/30 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Hint */}
      <div className="mt-12 text-center bg-white/30 backdrop-blur-sm border border-white/10 rounded-[20px] p-6 text-xs md:text-sm text-slate-500 leading-relaxed">
        پاسخ خود را پیدا نکردید؟ پشتیبانی همه‌روزه مرموریس از طریق تلگرام یا شماره‌های تماس آماده راهنمایی شماست.
      </div>
    </div>
  );
}

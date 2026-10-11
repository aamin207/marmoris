/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import { ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import MarmorisLogo from './MarmorisLogo';
import { siteConfig } from '@/config/site';

export default function Footer() {
  const [enamadError, setEnamadError] = useState(false);
  return (
    <footer className="mt-20 border-t border-brand-pink/25 bg-white/60 backdrop-blur-md pt-12 pb-8 px-4 md:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Value Propositions / Guarantees with Glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: ShieldCheck, title: 'ضمانت اصالت کالا', desc: 'تضمین ۱۰۰٪ کیفیت و دوخت اختصاصی' },
            { icon: Truck, title: 'ارسال مطمئن و سریع', desc: 'ارسال با روش‌های متنوع به سراسر کشور' },
            { icon: Headphones, title: 'پشتیبانی ۲۴ ساعته', desc: 'پاسخگویی سریع در تلگرام و تماس تلفنی' },
            { icon: RotateCcw, title: 'قابل بازگشت', desc: 'می‌توانید قوانین را از داخل سوالات متداول ببینید' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-brand-pink/15 rounded-[20px] p-4 flex items-center gap-3 text-right shadow-sm">
              <div className="bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark p-2.5 rounded-[16px]">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-charcoal">{item.title}</h4>
                <p className="text-[10px] text-brand-stone/60 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Main Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-6">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-[140px] flex items-center">
                <MarmorisLogo width={150} height={45} className="w-full h-full" />
              </div>
            </div>
            <p className="text-xs text-brand-stone/80 leading-relaxed">
              مرموریس، ارائه دهنده آنلاین انواع کیف، پوشاک مینی‌مال و زیورآلات با برترین کیفیت و طراحی منحصربه‌فرد روز. هدف ما ارائه تجربه‌ای آسان، سریع و باکیفیت است.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-charcoal tracking-wider border-r-2 border-brand-pink-dark pr-2">دسترسی سریع</h4>
            <div className="flex flex-col gap-2 text-xs text-brand-stone">
              <Link href="/" className="hover:text-brand-pink-dark transition-colors">خانه</Link>
              <Link href="/products" className="hover:text-brand-pink-dark transition-colors">لیست محصولات</Link>
              <Link href="/blog" className="hover:text-brand-pink-dark transition-colors">وبلاگ</Link>
              <Link href="/faq" className="hover:text-brand-pink-dark transition-colors">سوالات متداول (FAQ)</Link>
              <Link href="/about-us" className="hover:text-brand-pink-dark transition-colors">درباره ما</Link>
              <Link href="/contact-us" className="hover:text-brand-pink-dark transition-colors">تماس با ما</Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-charcoal tracking-wider border-r-2 border-brand-pink-dark pr-2">خدمات مشتریان</h4>
            <div className="flex flex-col gap-2 text-xs text-brand-stone">
              <Link href="/terms" className="hover:text-brand-pink-dark transition-colors">قوانین و مقررات</Link>
              <Link href="/contact-us" className="hover:text-brand-pink-dark transition-colors">پشتیبانی و ارتباط</Link>
              <span className="hover:text-brand-pink-dark transition-colors cursor-pointer">راهنمای سایزبندی</span>
              <span className="hover:text-brand-pink-dark transition-colors cursor-pointer">پیگیری سفارشات</span>
            </div>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-charcoal tracking-wider border-r-2 border-brand-pink-dark pr-2">ارتباط با ما</h4>
            <div className="flex flex-col gap-2 text-xs text-brand-stone">
              <p>تلفن پشتیبانی: <a href={`tel:${siteConfig.contact.rawPhone}`} className="font-sans hover:text-brand-pink-dark transition-colors">{siteConfig.contact.phone}</a></p>
              <p>ایمیل: {siteConfig.contact.email}</p>
              <p>ساعات کاری: {siteConfig.contact.workingHours}</p>
              <p className="text-[10px] text-brand-stone/60">فروشگاه فقط به صورت آنلاین فعالیت می‌کند.</p>
            </div>
          </div>

          {/* Certifications (e-Namad) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-charcoal tracking-wider border-r-2 border-brand-pink-dark pr-2">مجوزها و نمادها</h4>
            <div className="flex gap-3 pt-1">
              <a 
                referrerPolicy="origin" 
                target="_blank" 
                rel="noopener noreferrer"
                href={siteConfig.enamad.url}
                aria-label="Electronic Trust Emblem (Enamad)"
                className="bg-white border border-brand-pink/20 rounded-[20px] p-3 flex flex-col items-center justify-center text-center w-28 h-28 shadow-sm hover:border-brand-pink-dark hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group"
                title="مشاهده نماد اعتماد الکترونیکی (اینماد)"
              >
                <Image 
                  referrerPolicy="no-referrer"
                  src={`https://trustseal.enamad.ir/logo.aspx?id=${siteConfig.enamad.id}&Code=${siteConfig.enamad.code}`} 
                  alt="نماد اعتماد الکترونیکی مرموریس" 
                  width={64}
                  height={64}
                  unoptimized
                  className="w-16 h-16 object-contain cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Copy / Certs Footer Bar */}
        <div className="border-t border-brand-pink/20 pt-8 text-center flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-stone">
          <div className="text-right space-y-1">
            <p>© {new Date().getFullYear()} گالری آنلاین مرموریس. تمامی حقوق مادی و معنوی محفوظ است.</p>
            <p className="text-[10px] text-brand-stone/60">
              طراحی و توسعه توسط <span className="font-bold text-brand-charcoal">تیم برنامه‌نویسی وبنایت (Webnite)</span> | 
              تلفن تماس: <span className="font-sans">09026811545</span> | 
              ایمیل: <span className="font-sans">webnitee@gmail.com</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-brand-pink-light/60 hover:bg-brand-pink-dark border border-brand-pink/20 hover:border-brand-pink-dark text-brand-charcoal hover:text-white px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all duration-300 shadow-sm group"
              title="صفحه رسمی اینستاگرام مرموریس"
            >
              <svg className="w-4 h-4 text-brand-pink-dark group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>اینستاگرام</span>
            </a>
            
            <a
              href={siteConfig.socials.telegram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-brand-pink-light/60 hover:bg-brand-pink-dark border border-brand-pink/20 hover:border-brand-pink-dark text-brand-charcoal hover:text-white px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all duration-300 shadow-sm group"
              title="کانال تلگرام مرموریس"
            >
              <svg className="w-4 h-4 text-sky-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span>تلگرام</span>
            </a>

            <a
              href={siteConfig.socials.bale}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-brand-pink-light/60 hover:bg-brand-pink-dark border border-brand-pink/20 hover:border-brand-pink-dark text-brand-charcoal hover:text-white px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all duration-300 shadow-sm group"
              title="کانال بله مرموریس"
            >
              <svg className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.982-1.334A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 17.5a7.476 7.476 0 0 1-4.04-1.17l-.29-.172-3.008.805.816-2.915-.188-.302A7.479 7.479 0 0 1 4.5 12c0-4.136 3.364-7.5 7.5-7.5s7.5 3.364 7.5 7.5-3.364 7.5-7.5 7.5z"/>
              </svg>
              <span>بله</span>
            </a>

            <a
              href={siteConfig.socials.rubika}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-brand-pink-light/60 hover:bg-brand-pink-dark border border-brand-pink/20 hover:border-brand-pink-dark text-brand-charcoal hover:text-white px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all duration-300 shadow-sm group"
              title="صفحه روبیکا مرموریس"
            >
              <svg className="w-4 h-4 text-violet-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8l7.2 3.6-7.2 3.6-7.2-3.6L12 4.8zm-8 4.9l7 3.5v7.5l-7-3.5V9.7zm16 7.5l-7 3.5v-7.5l7-3.5v7.5z"/>
              </svg>
              <span>روبیکا</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, MessageSquare, Compass, Sparkles, SendToBack } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !mobile || !message) {
      setError('لطفاً فیلدهای ستاره‌دار الزامی را تکمیل کنید.');
      return;
    }

    setLoading(true);

    // Simulate sending inquiry to Marmoris backend support
    setTimeout(() => {
      setSuccess('پیام شما با موفقیت به پشتیبانی گالری مرموریس ارسال شد. همکاران ما بزودی با شما تماس خواهند گرفت.');
      setName('');
      setMobile('');
      setSubject('');
      setMessage('');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10 text-right animate-fade-in py-10" dir="rtl">
      
      {/* Header Banner */}
      <div className="space-y-3 text-center max-w-2xl mx-auto pt-6">
        <span className="inline-flex items-center gap-1 bg-brand-pink/15 border border-brand-pink/45 text-brand-pink-dark text-[10px] font-black px-3 py-1.5 rounded-full font-sans">
          <Sparkles className="w-3.5 h-3.5" />
          ارتباط با آتلیه و پشتیبانی مرموریس
        </span>
        <h1 className="text-3xl font-black text-brand-charcoal md:text-4xl">تماس با گالری</h1>
        <p className="text-xs text-brand-stone leading-relaxed">
          سوالی دارید یا نیاز به پیگیری سفارش دارید؟ همکاران ما در تمام روزهای هفته پذیرای صدای گرم شما هستند.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Main details */}
          <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 space-y-6 shadow-md shadow-brand-pink/5">
            <h2 className="text-sm font-black text-brand-charcoal flex items-center gap-2 border-b border-brand-pink/10 pb-3">
              <Compass className="w-5 h-5 text-brand-pink-dark" />
              ارتباط با پشتیبانی و گالری آنلاین
            </h2>

            <div className="space-y-5">
              {/* Phone support */}
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink-dark rounded-[12px] flex items-center justify-center flex-shrink-0 font-sans">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-brand-charcoal">تلفن پشتیبانی و مشاوره</p>
                  <a href={`tel:${siteConfig.contact.rawPhone}`} className="text-brand-stone font-sans tracking-wider hover:text-brand-pink-dark transition-colors inline-block" dir="ltr">{siteConfig.contact.phone}</a>
                  <p className="text-[10px] text-brand-stone/70">تماس تلفنی و پیام در پیام‌رسان‌ها</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink-dark rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-brand-charcoal">پست الکترونیکی</p>
                  <p className="text-brand-stone font-sans hover:text-brand-pink-dark transition-colors">
                    <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
                  </p>
                </div>
              </div>

              {/* Social Channels */}
              <div className="flex gap-3 items-start border-t border-brand-pink/10 pt-4">
                <div className="w-9 h-9 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink-dark rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="space-y-2.5 text-xs w-full">
                  <p className="font-bold text-brand-charcoal">شبکه‌های اجتماعی و ارتباطی</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <a 
                      href={siteConfig.socials.telegram} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-brand-stone hover:text-brand-pink-dark flex items-center gap-1 font-sans transition-colors"
                    >
                      <span>• Telegram</span>
                    </a>
                    
                    <a 
                      href={siteConfig.socials.instagram} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-brand-stone hover:text-brand-pink-dark flex items-center gap-1 font-sans transition-colors"
                    >
                      <span>• Instagram</span>
                    </a>

                    <a 
                      href={siteConfig.socials.bale} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-brand-stone hover:text-brand-pink-dark flex items-center gap-1 transition-colors"
                    >
                      <span>• پیام‌رسان بله</span>
                    </a>

                    <a 
                      href={siteConfig.socials.rubika} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-brand-stone hover:text-brand-pink-dark flex items-center gap-1 transition-colors"
                    >
                      <span>• پیام‌رسان روبیکا</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Frequently Asked Questions Link */}
          <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 flex items-center gap-4 justify-between shadow-md shadow-brand-pink/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink-dark rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-brand-charcoal">پاسخ‌های سریع را می‌خواهید؟</h3>
                <p className="text-[10px] text-brand-stone">بخش سوالات متداول کاربران را مرور کنید.</p>
              </div>
            </div>
            <span className="text-[10px] bg-brand-cream border border-brand-pink/10 px-3 py-1.5 rounded-full text-brand-stone">ساعت کار: {siteConfig.contact.workingHours}</span>
          </div>
        </div>

        {/* Inquiry Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-brand-pink/15 rounded-[32px] p-6 md:p-8 shadow-lg shadow-brand-pink/5 space-y-6">
          <h2 className="text-sm font-black text-brand-charcoal flex items-center gap-2 border-b border-brand-pink/10 pb-3">
            <SendToBack className="w-5 h-5 text-brand-pink-dark" />
            ارسال پیغام مستقیم به مدیریت گالری
          </h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-[14px] text-center font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-[16px] text-center font-bold leading-relaxed">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">نام و نام خانوادگی شما *</label>
                <input
                  type="text"
                  placeholder="مثال: مریم محمدی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark transition-all placeholder:text-brand-stone/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">شماره موبایل جهت تماس *</label>
                <input
                  type="text"
                  placeholder="09123456789"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark font-sans text-right transition-all placeholder:text-brand-stone/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">موضوع پیام</label>
              <input
                type="text"
                placeholder="مثال: پیگیری سفارش، ثبت انتقاد، همکاری فروش"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark transition-all placeholder:text-brand-stone/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">متن پیام ارسالی شما *</label>
              <textarea
                rows={4}
                placeholder="پیام یا درخواست خود را اینجا یادداشت فرمایید..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark transition-all placeholder:text-brand-stone/40"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-brand-pink-dark hover:bg-brand-charcoal disabled:bg-brand-pink-dark/50 text-white font-black px-8 py-3.5 rounded-[16px] transition-all border border-brand-pink/10 shadow-lg shadow-brand-pink-dark/10 cursor-pointer text-xs flex items-center justify-center gap-1.5 mr-auto"
            >
              <Send className="w-4 h-4" />
              {loading ? 'در حال ارسال پیام...' : 'ارسال نهایی فرم تماس'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

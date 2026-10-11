/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { Sparkles, ShieldCheck, Heart, AlertTriangle, CreditCard, Truck, Users } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 text-right relative animate-fade-in" dir="rtl">
      {/* Decorative Glow Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-[10px] font-black px-3 py-1.5 rounded-full font-sans">
          <Sparkles className="w-3.5 h-3.5" />
          تعهد متقابل و شفافیت خرید
        </span>
        <h1 className="text-3xl font-black text-slate-800 md:text-4xl">قوانین و مقررات مرموریس 💜</h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          لطفاً پیش از نهایی کردن سفارش، قوانین تعویض، مرجوعی و ارسال گالری مرموریس را مطالعه فرمایید.
        </p>
      </div>

      {/* Main Glassmorphism container */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-[32px] p-6 md:p-10 shadow-xl shadow-slate-100 space-y-8">
        
        {/* Intro Section */}
        <div className="flex gap-4 items-start bg-purple-50/40 border border-purple-100/60 rounded-[20px] p-5">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800">اول از همه ممنونیم که مرموریس رو برای خرید انتخاب کردین 🍓</p>
            <p>
              چون هر کدوم از کارهای ما با دقت و عشق دوخته میشن و موجودی محدود دارن، از شما میخوایم قبل از ثبت سفارش، کمی وقت بذارین و در انتخاب طرح، رنگ و ابعاد دقت کنین تا بهترین انتخاب رو داشته باشین.
            </p>
          </div>
        </div>

        {/* 1. Return Policy */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            مرجوعی و تعویض کالا
          </h2>
          <div className="text-xs text-slate-600 leading-relaxed space-y-3 pr-7">
            <p className="font-bold text-amber-600">
              به دلیل محدودیت دوخت و تولید، متاسفانه یه سری از کارها بعد از فروش امکان مرجوع و تعویض ندارن 🙏🏻 پس لطفاً قبل از خرید حتماً دقت کنین.
            </p>
            <div className="space-y-2 bg-slate-50 border border-slate-200/50 rounded-2xl p-4">
              <p className="font-bold text-slate-700">اگه به هر دلیلی بخواین سفارشتون رو کنسل یا مرجوع کنین:</p>
              <ul className="list-disc list-inside space-y-1 pr-2">
                <li>تا ۲۴ ساعت اول بعد از ثبت سفارش، کنسلی بدون هیچ کسری انجام میشه.</li>
                <li>بعد از ۲۴ ساعت، در صورت مرجوع یا کنسل کردن سفارش، ۲۵٪ از هزینه کل کسر میشه و باقی مبلغ بهتون برگردونده میشه.</li>
              </ul>
            </div>
            <p>
              برای مرجوع کردن یا هر سوالی، کافیه به پشتیبانی پیام بدین، همیشه در دسترسیم 💜
            </p>
          </div>
        </div>

        {/* 2. Payment Method */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            روش پرداخت
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed pr-7">
            پرداخت‌ها به صورت آنلاین و از طریق درگاه‌های معتبر بانکی (زرین‌پال و درگاه‌های مشابه) انجام میشه. خیالتون راحت باشه، همه تراکنش‌ها امن و رمزنگاری‌شده هستن.
          </p>
        </div>

        {/* 3. Shipping Info */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-500" />
            ارسال کالا
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed pr-7">
            سفارش‌ها از طریق پست کشوری یا تیپاکس براتون ارسال میشه. بعد از ثبت سفارش، کد رهگیری مرسوله رو دریافت میکنین تا بتونین مسیر بستهتون رو دنبال کنین.
          </p>
        </div>

        {/* 4. Privacy */}
        <div className="space-y-4 pb-4">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            حریم خصوصی
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed pr-7">
            اطلاعات شخصی شما مثل نام، شماره تماس و آدرس، فقط برای پردازش سفارش و در ارتباط بودن با شما استفاده میشه و در اختیار هیچ شخص یا سازمان دیگه‌ای قرار نمیگیره. اعتماد شما برای ما مهمه ✨
          </p>
        </div>

        {/* Outro */}
        <div className="border-t border-slate-100 pt-6 text-center">
          <p className="text-sm font-black text-purple-600 leading-relaxed">
            پیشاپیش ممنون از درک و همراهیتون 💜
          </p>
        </div>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/apiClient';
import { ShieldCheck, KeyRound, ArrowLeft, MessageSquareCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function EnterCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobileParam = searchParams.get('mobile') || '';

  const [mobile, setMobile] = useState(mobileParam);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (mobileParam) {
      setMobile(mobileParam);
    }
  }, [mobileParam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobile || !code || !password || !confirmPassword) {
      setError('لطفاً تمامی فیلدها را تکمیل فرمایید.');
      return;
    }

    if (password !== confirmPassword) {
      setError('گذرواژه‌های وارد شده مطابقت ندارند.');
      return;
    }

    if (password.length < 6) {
      setError('گذرواژه جدید باید حداقل شامل ۶ کاراکتر باشد.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(mobile, code, password);
      setSuccess('گذرواژه شما با موفقیت تغییر کرد! در حال انتقال به بخش ورود...');
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'خطایی در تغییر گذرواژه رخ داد. کد تایید را دوباره بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 text-right relative animate-fade-in" dir="rtl">
      {/* Decorative glass glow backings */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -z-10" />

      {/* Back to Forget Password */}
      <div className="flex justify-start px-1">
        <Link
          href="/forget-password"
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          تغییر شماره همراه
        </Link>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2.5 py-1.5 rounded-full font-sans">
          <ShieldCheck className="w-3.5 h-3.5" />
          تایید هویت دو مرحله‌ای
        </span>
        <h1 className="text-2xl font-black text-white">کد تایید پیامکی</h1>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          کد ۴ یا ۵ رقمی ارسال شده به شماره <span className="text-emerald-400 font-sans font-bold">{mobile}</span> را به همراه گذرواژه جدید وارد کنید.
        </p>
      </div>

      {/* Glass Container */}
      <div className="bg-slate-950/30 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl space-y-5">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] p-3 rounded-[14px] text-center font-bold flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] p-3 rounded-[14px] text-center font-bold flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile Field (hidden if exists, but editable if empty) */}
          {!mobileParam && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">شماره موبایل</label>
              <input
                type="text"
                placeholder="09123456789"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/10 text-white text-xs rounded-[16px] py-3.5 px-4 font-sans text-right focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          )}

          {/* Verification Code */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">کد تایید پیامک شده *</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="مثال: ۱۲۳۴"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/10 text-white placeholder-slate-500 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-emerald-500 font-sans text-center tracking-widest font-black"
                required
              />
              <MessageSquareCode className="w-4 h-4 text-slate-500 absolute right-3" />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">گذرواژه جدید *</label>
            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/10 text-white placeholder-slate-500 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-emerald-500 font-sans text-right"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">تکرار گذرواژه جدید *</label>
            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/10 text-white placeholder-slate-500 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-emerald-500 font-sans text-right"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-black py-3.5 rounded-[16px] transition-all border border-white/10 shadow-lg shadow-emerald-500/10 cursor-pointer text-xs mt-2"
          >
            {loading ? 'در حال ثبت اطلاعات...' : 'ذخیره گذرواژه جدید و ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EnterCode() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400">در حال بارگذاری فرم تایید...</div>}>
      <EnterCodeContent />
    </Suspense>
  );
}

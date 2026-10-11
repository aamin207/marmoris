/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPassword, resetPassword } from '@/lib/apiClient';
import { useAuth } from '@/context/AppContext';
import { KeyRound, Phone, ArrowLeft, ShieldAlert, Timer, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgetPassword() {
  const router = useRouter();
  const { showToast } = useAuth();
  const [step, setStep] = useState(1); // 1 = Enter mobile, 2 = Enter OTP and new password
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes countdown
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Clean error extractor based on user requirements (string or object nested message)
  const extractErrorMessage = (err: any): string => {
    console.error('Password reset flow error details:', err);
    
    // Check if error is from response
    if (err.response?.data) {
      const data = err.response.data;
      const msg = data.message || data.error?.message || data.error;
      if (msg) {
        if (typeof msg === 'object') {
          return msg.fa || msg.message || msg.en || JSON.stringify(msg);
        }
        return msg;
      }
    }

    // Standard client error parsing
    if (err.message) {
      try {
        // If message is a stringified object from request wrapper
        if (err.message.startsWith('{') || err.message.includes(': {')) {
          const rawJson = err.message.substring(err.message.indexOf('{'));
          const parsed = JSON.parse(rawJson);
          const msg = parsed.message || parsed.error?.message || parsed.error;
          if (msg) {
            if (typeof msg === 'object') {
              return msg.fa || msg.message || msg.en || JSON.stringify(msg);
            }
            return msg;
          }
        }
      } catch (e) {
        // Ignore JSON parse error and fallback
      }
      return err.message;
    }

    return 'خطایی رخ داد. لطفاً مجدداً تلاش کنید.';
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile || !mobile.startsWith('09') || mobile.length !== 11) {
      showToast('لطفاً یک شماره موبایل معتبر ۱۱ رقمی وارد نمایید.', 'error');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(mobile);
      setStep(2);
      setTimer(300);
      setIsTimerActive(true);
      showToast('کد تایید با موفقیت پیامک شد.', 'success');
    } catch (err: any) {
      const errMsg = extractErrorMessage(err);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length < 4) {
      showToast('لطفاً کد تایید دریافتی را به طور کامل وارد کنید.', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(mobile, code, newPassword);
      showToast('رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.', 'success');
      setTimeout(() => {
        router.push('/auth');
      }, 1500);
    } catch (err: any) {
      const errMsg = extractErrorMessage(err);
      showToast(errMsg, 'error');

      // Strict backend atomic logic: If attempts exhausted or code expired, return user to step 1
      if (
        errMsg.includes('تعداد تلاش') || 
        errMsg.includes('منقضی') || 
        errMsg.includes('تلاش‌های مجاز') ||
        errMsg.includes('منقضی شده')
      ) {
        setStep(1);
        setIsTimerActive(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 text-right relative animate-fade-in" dir="rtl">
      {/* Decorative ambient glowing backings */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand-pink/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl -z-10" />

      {/* Back to Login link */}
      <div className="flex justify-start px-1">
        <Link
          href="/auth"
          className="text-xs text-brand-stone hover:text-brand-pink-dark flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          بازگشت به صفحه ورود
        </Link>
      </div>

      {/* Title block */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 bg-brand-pink/30 border border-brand-pink-dark/20 text-brand-pink-dark text-[10px] font-black px-3 py-1.5 rounded-full font-sans">
          <KeyRound className="w-3.5 h-3.5" />
          فراموشی کلمه عبور
        </span>
        <h1 className="text-2xl font-black text-brand-charcoal">بازیابی حساب کاربری</h1>
        <p className="text-xs text-brand-stone/80 leading-relaxed">
          فرآیند دو مرحله‌ای بازنشانی کلمه عبور بر اساس ساختار امنیتی مرموریس
        </p>
      </div>

      {/* Two-step form container using Boho-chic pastel palette */}
      <div className="bg-white/70 backdrop-blur-xl border border-brand-pink/25 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="space-y-1">
              <h2 className="font-bold text-sm text-brand-charcoal">مرحله اول: شماره همراه خود را وارد کنید</h2>
              <p className="text-[11px] text-brand-stone/70">کد تایید ۶ رقمی به این شماره ارسال خواهد شد.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-charcoal">شماره موبایل *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="مثال: 09123456789"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-brand-pink-light/40 border border-brand-pink/20 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                  required
                />
                <Phone className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-pink border border-brand-pink-dark/10 hover:bg-brand-pink/80 disabled:opacity-50 text-brand-charcoal font-black py-3.5 rounded-[16px] transition-all shadow-md shadow-brand-pink/5 cursor-pointer text-xs"
            >
              {loading ? 'در حال ارسال کد تایید...' : 'ارسال کد تایید'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-1">
              <h2 className="font-bold text-sm text-brand-charcoal">مرحله دوم: تایید کد و ثبت رمز عبور جدید</h2>
              <p className="text-[11px] text-brand-stone/70">
                کد یکبار مصرف پیامک شده به شماره <span className="font-sans font-bold text-brand-pink-dark">{mobile}</span> را وارد کنید.
              </p>
            </div>

            {/* Verification code input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-charcoal">کد تایید ۶ رقمی *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-brand-pink-light/40 border border-brand-pink/20 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark font-sans text-right tracking-[0.25em]"
                  required
                />
                <CheckCircle className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-charcoal">رمز عبور جدید *</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-brand-pink-light/40 border border-brand-pink/20 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                  required
                />
                <Lock className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            {/* Countdown timer */}
            <div className="text-center py-1">
              {timer > 0 ? (
                <div className="inline-flex items-center gap-1 text-[11px] text-brand-stone">
                  <Timer className="w-3.5 h-3.5" />
                  <span>ارسال مجدد کد تا {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')} دیگر</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-brand-pink-dark font-black hover:underline cursor-pointer text-xs"
                >
                  درخواست مجدد کد تایید
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-pink border border-brand-pink-dark/10 hover:bg-brand-pink/80 disabled:opacity-50 text-brand-charcoal font-black py-3.5 rounded-[16px] transition-all shadow-md shadow-brand-pink/5 cursor-pointer text-xs"
            >
              {loading ? 'در حال ثبت رمز عبور جدید...' : 'ثبت رمز عبور جدید'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

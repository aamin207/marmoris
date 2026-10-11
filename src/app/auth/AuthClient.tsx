/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Sparkles, LogIn, UserPlus, Phone, User } from 'lucide-react';
import Link from 'next/link';
import MarmorisLogo from '@/components/MarmorisLogo';

function AuthContent() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { login, signup, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect target (e.g. back to checkout or cart)
  const redirectTarget = searchParams.get('redirect') || '';

  useEffect(() => {
    // If already logged in, redirect away
    if (token) {
      router.replace(redirectTarget ? `/${redirectTarget}` : '/profile');
    }
  }, [token, router, redirectTarget]);

  // Form inputs
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!mobile || !password) {
        setError('لطفاً شماره موبایل و رمز عبور را وارد کنید.');
        setLoading(false);
        return;
      }
      
      const ok = await login(mobile, password);
      if (ok) {
        setSuccess('ورود با موفقیت انجام شد. در حال هدایت...');
        setTimeout(() => {
          router.replace(redirectTarget ? `/${redirectTarget}` : '/profile');
        }, 1000);
      } else {
        setError('شماره همراه یا رمز عبور نادرست است.');
      }
    } catch (err: any) {
      setError(err.message || 'سیستم با خطا مواجه شد. مجدداً تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!fullName || !mobile || !password) {
        setError('لطفاً تمامی فیلدهای الزامی را تکمیل فرمایید.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('رمز عبور باید حداقل شامل ۶ کاراکتر باشد.');
        setLoading(false);
        return;
      }

      if (!mobile.startsWith('09') || mobile.length !== 11) {
        setError('لطفاً یک شماره موبایل معتبر ۱۱ رقمی وارد نمایید.');
        setLoading(false);
        return;
      }

      const ok = await signup(fullName, mobile, password);
      if (ok) {
        setSuccess('حساب کاربری مرموریس شما با موفقیت ساخته شد.');
        setTimeout(() => {
          router.replace(redirectTarget ? `/${redirectTarget}` : '/profile');
        }, 1000);
      } else {
        setError('ایجاد حساب کاربری با مشکل مواجه شد.');
      }
    } catch (err: any) {
      setError(err.message || 'خطایی در سیستم رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8 text-right relative animate-fade-in" dir="rtl">
      
      {/* Brand Greetings */}
      <div className="text-center space-y-3 flex flex-col items-center">
        <div className="h-10 w-[140px] flex items-center justify-center">
          <MarmorisLogo width={140} height={42} />
        </div>
        <span className="inline-flex items-center gap-1 bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark text-[10px] font-bold px-2.5 py-1.5 rounded-full font-sans">
          <Sparkles className="w-3 h-3" />
          کلوب اعضای گالری مرموریس
        </span>
        <h1 className="text-2xl font-black text-brand-charcoal">خوش آمدید</h1>
        <p className="text-[11px] text-brand-stone">ورود یا ایجاد حساب کاربری برای خریدی سریع و مطمئن</p>
      </div>

      {/* Elegant minimalist Box */}
      <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 md:p-8 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 bg-brand-cream border border-brand-pink/10 p-1 rounded-[18px] mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`py-2.5 text-center text-xs font-bold rounded-[14px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-brand-pink-dark text-white shadow-sm font-extrabold'
                : 'text-brand-stone hover:text-brand-pink-dark'
            }`}
          >
            <LogIn className="w-4 h-4" />
            ورود به حساب
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`py-2.5 text-center text-xs font-bold rounded-[14px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-brand-pink-dark text-white shadow-sm font-extrabold'
                : 'text-brand-stone hover:text-brand-pink-dark'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            عضویت جدید
          </button>
        </div>

        {/* FEEDBACK LABELS */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-3 rounded-[14px] mb-4 text-center font-bold">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-[14px] mb-4 text-center font-bold">
            {success}
          </div>
        )}

        {/* FORMS */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">شماره موبایل</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="09123456789"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                  required
                />
                <Phone className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">گذرواژه (رمز عبور)</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                  required
                />
                <KeyRound className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-pink-dark hover:bg-brand-pink disabled:bg-brand-pink-dark/50 text-white font-black py-3.5 rounded-[16px] transition-all border border-brand-pink/15 shadow-sm cursor-pointer text-xs mt-2"
            >
              {loading ? 'در حال تایید اعتبار...' : 'ورود امن به حساب کاربری'}
            </button>

            <div className="text-center pt-2">
              <Link 
                href="/forget-password" 
                className="text-[11px] text-brand-stone hover:text-brand-pink-dark hover:underline transition-all"
              >
                رمز عبور خود را فراموش کرده‌اید؟ بازیابی حساب کاربری
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">نام و نام خانوادگی *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="آرمین ابراهیمی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark"
                  required
                />
                <User className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">شماره موبایل *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="09123456789"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                  required
                />
                <Phone className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">رمز عبور دلخواه (حداقل ۶ نویسه) *</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-3.5 px-4 pr-10 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                  required
                />
                <KeyRound className="w-4 h-4 text-brand-stone/60 absolute right-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-pink-dark hover:bg-brand-pink disabled:bg-brand-pink-dark/50 text-white font-black py-3.5 rounded-[16px] transition-all border border-brand-pink/15 shadow-sm cursor-pointer text-xs mt-2"
            >
              {loading ? 'در حال ثبت اطلاعات...' : 'ثبت نام و ایجاد عضویت رایگان'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-brand-stone">در حال دریافت گالری...</div>}>
      <AuthContent />
    </Suspense>
  );
}

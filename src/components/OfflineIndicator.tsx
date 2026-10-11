/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { subscribeToOfflineStatus } from '@/lib/apiClient';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = subscribeToOfflineStatus((offline) => {
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  // Display only in development mode and when offline fallback is active
  if (!mounted || !isOffline || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div 
      className="fixed bottom-6 left-6 z-[9999] animate-fade-in"
      dir="rtl"
    >
      <div className="bg-amber-950/80 backdrop-blur-md border border-amber-500/30 text-amber-200 px-4 py-3 rounded-[16px] shadow-2xl flex items-center gap-3 text-xs max-w-sm">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </div>
        
        <div className="flex-1 space-y-0.5">
          <p className="font-bold flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            حالت آفلاین (Offline Fallback)
          </p>
          <p className="text-[10px] text-amber-300/80 leading-relaxed font-sans">
            اتصال به سرور اصلی با خطا مواجه شد؛ درگاه پرداخت و کوپن‌ها حذف شده و داده‌های تستی فعال هستند.
          </p>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          aria-label="Retry connection"
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="تلاش مجدد برای اتصال"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    </div>
  );
}

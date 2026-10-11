/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4" dir="rtl">
      <h1 className="text-6xl font-bold text-brand-pink-dark">۴۰۴</h1>
      <h2 className="text-xl font-bold text-brand-charcoal">صفحه مورد نظر یافت نشد</h2>
      <p className="text-xs text-brand-stone max-w-sm leading-relaxed">
        صفحه‌ای که به دنبال آن هستید در گالری مرموریس پیدا نشد. ممکن است آدرس صفحه تغییر کرده باشد.
      </p>
      <Link
        href="/"
        className="bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-6 py-3 rounded-[16px] transition-colors"
      >
        بازگشت به خانه
      </Link>
    </div>
  );
}

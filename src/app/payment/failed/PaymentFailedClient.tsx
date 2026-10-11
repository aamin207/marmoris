'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  let errorMessage = 'متاسفانه پرداخت شما با خطا مواجه شد یا توسط شما لغو گردید.';
  if (reason === 'cancelled') {
    errorMessage = 'پرداخت توسط شما لغو شد.';
  } else if (reason === 'failed') {
    errorMessage = 'تراکنش از سمت بانک تایید نشد. لطفا دوباره تلاش کنید.';
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-brand-charcoal mb-4">پرداخت ناموفق</h1>
      <p className="text-brand-stone mb-8 max-w-md mx-auto leading-relaxed">
        {errorMessage}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="/checkout" 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white font-bold py-3.5 px-8 rounded-xl transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          تلاش مجدد برای پرداخت
        </Link>
        <Link 
          href="/cart" 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-brand-pink/50 text-gray-700 font-medium py-3.5 px-8 rounded-xl transition-all"
        >
          بازگشت به سبد خرید
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">در حال بارگذاری...</div>}>
        <PaymentFailedContent />
      </Suspense>
    </div>
  );
}

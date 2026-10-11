'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MarmorisAPI } from '@/lib/api';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const ref = searchParams.get('ref');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      MarmorisAPI.getTrackingStatus(orderId)
        .then(res => {
          setOrderData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-brand-charcoal mb-4">پرداخت با موفقیت انجام شد</h1>
      <p className="text-brand-stone mb-6 max-w-md mx-auto leading-relaxed">
        سفارش شما با موفقیت ثبت شد و در حال پردازش می‌باشد. از خرید شما سپاسگزاریم.
      </p>
      
      {loading ? (
        <div className="animate-pulse flex flex-col gap-3 w-full max-w-sm mx-auto mb-8">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 w-full max-w-sm mx-auto shadow-sm mb-8 space-y-3">
          {orderId && (
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500">شماره سفارش:</span>
              <span className="font-mono font-medium">{orderId}</span>
            </div>
          )}
          {ref && (
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500">کد پیگیری تراکنش:</span>
              <span className="font-mono font-medium">{ref}</span>
            </div>
          )}
          {orderData?.trackingNumber && (
            <div className="flex justify-between items-center text-sm pb-1">
              <span className="text-gray-500">کد رهگیری:</span>
              <span className="font-mono font-medium text-brand-pink-dark">{orderData.trackingNumber}</span>
            </div>
          )}
        </div>
      )}

      <Link 
        href="/profile" 
        className="inline-flex items-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white font-bold py-3.5 px-8 rounded-xl transition-all"
      >
        مشاهده تاریخچه سفارشات
        <ChevronLeft className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">در حال بارگذاری...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}

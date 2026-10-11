'use client';
import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MarmorisAPI } from '@/lib/api';
import { Search, Package, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { toPersianNumbers } from '@/components/PriceDisplay';

function translateStatus(status: string): string {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'pending':
    case 'payment_pending':
    case 'awaiting_payment':
      return 'در انتظار پرداخت';
    case 'confirmed':
      return 'پرداخت موفق / تایید شده';
    case 'processing':
    case 'preparing':
    case 'prepared':
      return 'در حال آماده‌سازی';
    case 'shipped':
    case 'sent':
    case 'dispatched':
      return 'ارسال شده';
    case 'delivered':
    case 'completed':
      return 'تحویل داده شده';
    case 'cancelled':
    case 'canceled':
    case 'refunded':
      return 'لغو شده';
    default:
      return status || 'در حال پردازش';
  }
}

export default function OrderTrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await MarmorisAPI.checkOrderStatus(trackingCode.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'سفارشی با این کد پیگیری یافت نشد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream font-sans">
      <Navbar />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-4">پیگیری سفارش</h1>
          <p className="text-brand-stone max-w-lg mx-auto">
            برای مشاهده وضعیت سفارش خود، کد پیگیری عمومی (مثلاً MRS-...) را در کادر زیر وارد کنید. نیازی به ورود به حساب کاربری نیست.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="کد پیگیری سفارش را وارد کنید..."
              className="w-full bg-white border border-gray-200 text-brand-charcoal rounded-2xl py-4 pr-12 pl-32 focus:outline-none focus:border-brand-pink-dark shadow-sm"
              dir="ltr"
            />
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              disabled={loading || !trackingCode.trim()}
              className="absolute left-2 top-2 bottom-2 bg-brand-charcoal hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium px-6 rounded-xl transition-colors text-sm flex items-center justify-center"
            >
              {loading ? 'در حال جستجو...' : 'پیگیری'}
            </button>
          </div>
          {error && <p className="text-rose-500 text-sm mt-3 text-center font-medium">{error}</p>}
        </form>

        {result && (
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-brand-pink/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">کد پیگیری:</p>
                <p className="font-mono font-bold text-lg text-brand-charcoal">{toPersianNumbers(result.tracking_code || trackingCode)}</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                <span className="text-xl">{result.icon || '📦'}</span>
                <span className={`font-bold ${
                  result.status_color === 'blue' ? 'text-blue-600' : result.status_color === 'green' ? 'text-green-600' : result.status_color === 'yellow' ? 'text-yellow-600' : result.status_color === 'orange' ? 'text-orange-600' : result.status_color === 'red' ? 'text-rose-600' : 'text-brand-charcoal'}`}>
                  {result.display_status ? translateStatus(result.display_status) : translateStatus(result.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-brand-charcoal flex items-center gap-2 border-b border-gray-50 pb-2">
                  <Package className="w-4 h-4 text-brand-pink-dark" />
                  جزئیات مالی
                </h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">مبلغ کل سفارش:</span>
                  <span className="font-medium text-brand-charcoal">
                    {result.total_price ? toPersianNumbers(result.total_price.toLocaleString('fa-IR')) + ' تومان' : 'نامشخص'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">وضعیت پرداخت:</span>
                  <span className={`font-medium ${result.is_paid ? 'text-green-600' : 'text-amber-600'}`}>
                    {result.is_paid ? 'پرداخت شده' : 'در انتظار پرداخت'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-brand-charcoal flex items-center gap-2 border-b border-gray-50 pb-2">
                  <Truck className="w-4 h-4 text-brand-pink-dark" />
                  روند ارسال
                </h3>
                <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent hidden">
                   {/* Timeline can be added here if backend supports history */}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  سفارش شما در سیستم ثبت شده و بر اساس وضعیت فعلی در حال پردازش یا ارسال می‌باشد. در صورت نیاز به راهنمایی بیشتر با پشتیبانی تماس بگیرید.
                </p>
              </div>
            </div>

            {(result.items || result.order?.items) && Array.isArray(result.items || result.order?.items) && (result.items || result.order?.items).length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-6 space-y-3">
                <h3 className="font-bold text-sm text-brand-charcoal flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-pink-dark" />
                  اقلام سفارش:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(result.items || result.order?.items).map((item: any, idx: number) => {
                    const title = item.product?.title || item.title || 'محصول';
                    const img = item.product?.main_image || item.product?.image || item.image || '/logo.png';
                    const dec = item.decoration || item.accessory || item.tazyin;
                    return (
                      <div key={idx} className="flex gap-3 items-center bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                        {img && (
                          <Image 
                            src={img} 
                            alt={title} 
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded-xl bg-white border border-gray-200" 
                            referrerPolicy="no-referrer" 
                          />
                        )}
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-brand-charcoal line-clamp-1">{title}</p>
                          {dec && (
                            <div className="flex items-center gap-1 text-[10px] text-brand-pink-dark font-bold">
                              {(dec.image || dec.img) && (
                                <Image 
                                  src={dec.image || dec.img} 
                                  alt={dec.name || 'تزیین'} 
                                  width={12}
                                  height={12}
                                  referrerPolicy="no-referrer"
                                  className="w-3 h-3 object-cover rounded-full border border-brand-pink/10 bg-white" 
                                />
                              )}
                              <span>تزیین: {typeof dec.name === 'object' ? dec.name.fa || dec.name.name || 'تزیین' : String(dec.name || 'تزیین')}</span>
                            </div>
                          )}
                          <p className="text-gray-500 font-sans">تعداد: {toPersianNumbers(item.quantity || 1)} عدد</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

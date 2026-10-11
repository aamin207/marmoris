/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MarmorisAPI } from '@/lib/api';
import { User as UserIcon, Calendar, ClipboardList, MapPin, ShieldCheck, Mail, Phone, Settings, Save, LogOut, Upload, CreditCard, ExternalLink, FileText, Check, Copy, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toPersianNumbers, formatPrice } from '@/components/PriceDisplay';
import { useRouter } from 'next/navigation';

// Local safe name truncation
function truncateName(name: string, maxLen: number = 22): string {
  if (!name) return '';
  const trimmed = name.trim();
  return trimmed.length > maxLen ? trimmed.substring(0, maxLen) + '...' : trimmed;
}

export default function Profile() {
  const { user, token, orders, updateUserProfile, logout, requestPaymentRedirect, fetchUserOrders, showToast } = useAuth();
  const router = useRouter();
  
  // Local edit states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'settings'>('orders');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    MarmorisAPI.getPaymentMethods()
      .then((methods) => {
        if (Array.isArray(methods)) setPaymentMethods(methods);
      })
      .catch((err) => console.error('Failed to load payment methods in profile:', err));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true' || params.get('payment') === 'success') {
        setShowSuccessBanner(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Update states when user details load
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.firstName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.address) {
        setCity(user.address.city || '');
        setProvince(user.address.province || '');
        setStreet(user.address.street || '');
        setPostalCode(user.address.postalCode || '');
      }
    }
  }, [user]);

  if (!isMounted) {
    return <div className="text-center py-20 text-brand-stone font-sans">در حال دریافت اطلاعات...</div>;
  }

  if (!token || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6" dir="rtl">
        <div className="w-16 h-16 bg-white border border-brand-pink/20 text-brand-stone rounded-full flex items-center justify-center mx-auto shadow-sm">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-brand-charcoal font-sans">وارد حساب کاربری خود شوید</h2>
        <p className="text-xs text-brand-stone leading-relaxed">
          برای مشاهده تاریخچه سفارشات، پیگیری مرسوله‌ها و ویرایش اطلاعات آدرس خود ابتدا باید وارد حساب کاربری شوید.
        </p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-brand-pink-dark hover:bg-brand-pink text-white font-black px-6 py-3 rounded-xl text-xs cursor-pointer transition-all"
        >
          ورود یا ثبت‌نام
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(fullName, email);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Profile save error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handlePayPendingOrder = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const activeToken = token || localStorage.getItem('marmoris_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`https://api.marmoris.store/api/payment/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ order_id: orderId }),
      });

      const body = await res.json().catch(() => ({}));
      const redirectUrl = body?.data?.data?.url || body?.data?.url || body?.data?.payment_url || body?.payment_url || body?.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        const fallbackUrl = await requestPaymentRedirect(orderId);
        window.location.href = fallbackUrl;
      }
    } catch (err: any) {
      console.error('Retry payment error:', err);
      showToast('خطا در اتصال به درگاه پرداخت. لطفاً مجدداً تلاش کنید.', 'error');
      setPayingOrderId(null);
    }
  };

  const handleReceiptUploadForOrder = async (orderId: string, file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.', 'error');
      return;
    }

    try {
      setUploadingOrderId(orderId);
      // Upload file to PATCH /api/orders/<order_id>/receipt?folder=receipts
      await MarmorisAPI.uploadOrderReceipt(orderId, file);
      showToast('فیش واریزی با موفقیت آپلود شد و در انتظار تایید مدیریت است.', 'success');
      // Refresh user orders
      if (fetchUserOrders) fetchUserOrders();
      else window.location.reload();
    } catch (err: any) {
      console.error('Receipt upload error:', err);
      showToast(err.message || 'خطا در آپلود فیش واریزی.', 'error');
    } finally {
      setUploadingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending':
      case 'payment_pending':
      case 'awaiting_payment':
        return <span className="bg-orange-50 border border-orange-200 text-orange-800 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit"><span>⏳</span> در انتظار پرداخت</span>;
      case 'confirmed':
        return <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit"><span>✅</span> پرداخت موفق / تایید شده</span>;
      case 'processing':
      case 'preparing':
      case 'prepared':
        return <span className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit"><span>📦</span> در حال آماده‌سازی</span>;
      case 'shipped':
      case 'sent':
      case 'dispatched':
        return <span className="bg-purple-50 border border-purple-200 text-purple-800 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit"><span>🚚</span> ارسال شده</span>;
      case 'delivered':
      case 'completed':
        return <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit"><span>📬</span> تحویل داده شده</span>;
      case 'cancelled':
      case 'canceled':
      case 'refunded':
        return <span className="bg-rose-50 border border-rose-200 text-rose-800 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit"><span>❌</span> لغو شده</span>;
      default:
        return <span className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] px-3 py-1 rounded-full font-bold">{status || 'نامشخص'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-8 text-right animate-fade-in" dir="rtl">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-brand-pink/20 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 text-center md:text-right flex-col md:flex-row w-full md:w-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand-pink-light border border-brand-pink/25 flex items-center justify-center text-brand-pink-dark shadow-sm flex-shrink-0">
            <UserIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-brand-charcoal truncate">خوش آمدی، {truncateName(user.fullName || user.firstName || 'کاربر', 22)}!</h1>
            <p className="text-xs text-brand-stone flex items-center gap-1 justify-center md:justify-start break-all">
              <Mail className="w-3.5 h-3.5 text-brand-pink-dark flex-shrink-0" />
              <span>{user.email || 'بدون ایمیل'}</span>
            </p>
          </div>
        </div>

        {/* Member Status Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark text-[11px] sm:text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>عضو ویژه مرموریس</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] sm:text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>
      
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[32px] p-6 text-right space-y-3 shadow-sm relative overflow-hidden animate-fade-in flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm flex-shrink-0">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-emerald-800">سفارش شما با موفقیت در سیستم ثبت شد!</h3>
              <p className="text-[11px] text-emerald-600 font-sans leading-relaxed">
                تراکنش مالی تایید شد و همکاران ما در آتلیه مرموریس در حال آماده‌سازی و بسته‌بندی نفیس کالای شما هستند. جزئیات این فاکتور در بخش سفارشات زیر درج گردید.
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-800 font-bold">پرداخت موفق شتاب</span>
        </div>
      )}

      {/* Grid: Navigation list + main panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Menu selections */}
        <div className="bg-white border border-brand-pink/15 rounded-[28px] p-4 space-y-2 shadow-sm">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`w-full text-right text-xs py-3.5 px-4 rounded-[16px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-brand-pink-dark text-white shadow-sm font-bold'
                : 'text-brand-stone hover:text-brand-pink-dark hover:bg-brand-pink-light/30'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            تاریخچه سفارشات من ({toPersianNumbers(orders.length)})
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`w-full text-right text-xs py-3.5 px-4 rounded-[16px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-brand-pink-dark text-white shadow-sm font-bold'
                : 'text-brand-stone hover:text-brand-pink-dark hover:bg-brand-pink-light/30'
            }`}
          >
            <Settings className="w-4 h-4" />
            ویرایش اطلاعات حساب
          </button>
        </div>

        {/* Main Panel content */}
        <div className="lg:col-span-3">
          {activeSubTab === 'orders' ? (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-brand-charcoal flex items-center gap-2 px-1">
                <ClipboardList className="w-5 h-5 text-brand-pink-dark" />
                لیست سفارشات قبلی
              </h2>

              {orders.length === 0 ? (
                <div className="bg-white border border-brand-pink/15 rounded-[28px] p-12 text-center text-brand-stone shadow-sm">
                  <ClipboardList className="w-12 h-12 text-brand-pink-dark/40 mx-auto mb-3" />
                  <p className="text-sm font-bold text-brand-charcoal">سفارشی ثبت نشده است</p>
                  <p className="text-xs text-brand-stone mt-1 font-sans">شما هنوز هیچ خریدی در فروشگاه مرموریس نداشته‌اید.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-brand-pink/15 rounded-[24px] p-5 space-y-4 hover:border-brand-pink/30 transition-all shadow-sm"
                    >
                      {/* Order top info row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-brand-cream pb-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
                          <p className="text-brand-charcoal font-bold">
                            شماره سفارش: <span className="text-brand-pink-dark font-black">{toPersianNumbers(ord.orderNumber || ord.id)}</span>
                          </p>
                          <span className="text-brand-cream">|</span>
                          <p className="text-brand-stone flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-brand-pink-dark" />
                            {toPersianNumbers(ord.date)}
                          </p>
                          <span className="text-brand-cream">|</span>
                          <p className="text-brand-stone font-bold">
                            روش پرداخت: <span className="text-brand-charcoal">{ord.payment_info?.method_title || (ord.payment_info?.method === 'online' ? 'درگاه آنلاین' : (paymentMethods.find((m: any) => m.type === 'card_to_card')?.name || 'کارت به کارت'))}</span>
                          </p>
                          {(ord.postal_tracking_code || ord.trackingNumber) && (
                            <>
                              <span className="text-brand-cream">|</span>
                              <p className="text-brand-stone">کد رهگیری پستی: {toPersianNumbers(ord.postal_tracking_code || ord.trackingNumber)}</p>
                            </>
                          )}
                        </div>
                        {getStatusBadge(ord.status)}
                      </div>

                      {/* Shipped Postal Tracking Box */}
                      {ord.status === 'shipped' && (ord.postal_tracking_code || ord.trackingNumber) && (
                        <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-blue-900 font-bold">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span>کد رهگیری پستی مرسوله (پست پیشتاز):</span>
                            <span className="font-sans font-black text-brand-charcoal text-sm dir-ltr tracking-wider" dir="ltr">
                              {toPersianNumbers(ord.postal_tracking_code || ord.trackingNumber)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ord.postal_tracking_code || ord.trackingNumber || '');
                              showToast('کد رهگیری پستی کپی شد.', 'success');
                            }}
                            className="bg-white border border-blue-200 hover:bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            کپی کد رهگیری
                          </button>
                        </div>
                      )}

                      {/* Items loop */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ord.items.map((item, index) => (
                          <div key={index} className="flex gap-3 items-center bg-brand-cream/60 border border-brand-pink/5 p-2 rounded-[16px]">
                            <Image 
                              src={item.image} 
                              alt={item.title} 
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-[12px]" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="text-xs space-y-0.5">
                              <p className="font-bold text-brand-charcoal line-clamp-1">{item.title}</p>
                              {(item.decoration || item.accessory) && (
                                <div className="flex items-center gap-1 text-[10px] text-brand-pink-dark font-bold">
                                  {(item.decoration?.image || item.accessory?.image) && (
                                    <Image 
                                      src={item.decoration?.image || item.accessory?.image || ''} 
                                      alt={item.decoration?.name || item.accessory?.name || 'تزیین'} 
                                      width={12}
                                      height={12}
                                      referrerPolicy="no-referrer"
                                      className="w-3 h-3 object-cover rounded-full border border-brand-pink/10 bg-white" 
                                    />
                                  )}
                                  <span>
                                    تزیین: {item.decoration?.name || item.accessory?.name}
                                    {(item.decoration?.additional_price || item.accessory?.additional_price) ? ` (+${formatPrice(item.decoration?.additional_price || item.accessory?.additional_price || 0)})` : ''}
                                  </span>
                                </div>
                              )}
                              <p className="text-brand-stone font-sans">
                                {toPersianNumbers(item.quantity)} عدد × {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary cost & Action */}
                      <div className="flex flex-col space-y-3 border-t border-brand-cream pt-3 font-sans text-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <p className="text-brand-stone flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-brand-pink-dark" />
                            نشانی گیرنده: <span className="text-brand-charcoal truncate max-w-[280px] sm:max-w-md">{ord.shippingAddress}</span>
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="text-brand-charcoal font-bold">
                              کل پرداختی: <span className="text-brand-pink-dark font-black">{formatPrice(ord.total)}</span>
                            </p>
                            <Link 
                              href={`/orders/${ord.id}`} 
                              className="bg-brand-cream/80 hover:bg-brand-pink-light/50 text-brand-charcoal px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-brand-pink/20 shadow-2xs hover:shadow-xs"
                            >
                              <FileText className="w-4 h-4 text-brand-pink-dark" />
                              مشاهده فاکتور
                            </Link>
                          </div>
                        </div>

                        {/* Pending Order Actions: 3-State Receipt Handling */}
                        {(ord.status === 'pending' || ord.status === 'payment_pending' || ord.status === 'awaiting_payment') && (() => {
                          const rejectionReason = ord.payment_info?.rejection_reason;
                          const hasRejection = Boolean(rejectionReason);
                          const hasReceipt = Boolean(ord.payment_info?.receipt_image);
                          const isAwaitingApproval = hasReceipt && !hasRejection;
                          const isCardToCard = (ord.payment_info?.method || ord.payment_method) === 'card_to_card' || (ord.payment_info?.method || ord.payment_method) === 'card';
                          const isOnline = (ord.payment_info?.method || ord.payment_method || 'online') === 'online' || (ord.payment_info?.method || ord.payment_method) === 'zarinpal';

                          return (
                            <div className="mt-2 bg-brand-cream/30 border border-brand-pink/10 rounded-2xl p-4 space-y-3">
                              {/* State A: Rejection Reason Alert Box */}
                              {hasRejection && (
                                <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-xl p-3.5 text-xs font-bold space-y-1 shadow-2xs">
                                  <div className="flex items-center gap-2 text-rose-700 font-black">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                    <span>فیش قبلی تایید نشد. علت: {rejectionReason}</span>
                                  </div>
                                </div>
                              )}

                              {/* State B: Receipt Uploaded & Awaiting Approval Badge */}
                              {isAwaitingApproval && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3.5 text-xs font-bold flex items-center justify-between gap-3 shadow-2xs">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span>فیش ثبت شد (در انتظار بررسی مدیریت)</span>
                                  </div>
                                  {ord.payment_info?.receipt_image && (
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-blue-300 flex-shrink-0">
                                      <Image src={ord.payment_info.receipt_image} alt="فیش واریزی" fill referrerPolicy="no-referrer" className="object-cover" />
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <p className="text-xs font-bold text-brand-charcoal">
                                  این سفارش در انتظار تسویه حساب می‌باشد.
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                                  {/* Online Payment Button */}
                                  {isOnline && (
                                    <button
                                      onClick={() => handlePayPendingOrder(ord.id)}
                                      disabled={payingOrderId === ord.id}
                                      className="bg-brand-pink-dark hover:bg-opacity-90 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    >
                                      {payingOrderId === ord.id ? (
                                        <>
                                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          <span>در حال اتصال به زرین‌پال...</span>
                                        </>
                                      ) : (
                                        <>
                                          <CreditCard className="w-4 h-4" />
                                          <span>پرداخت آنلاین فاکتور</span>
                                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* Card to Card: Green Upload Receipt Button (Shown when NOT awaiting approval) */}
                                  {(isCardToCard || !isOnline) && !isAwaitingApproval && (
                                    <>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={(el) => { fileInputRefs.current[ord.id] = el; }}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleReceiptUploadForOrder(ord.id, file);
                                        }}
                                      />

                                      <button
                                        onClick={() => fileInputRefs.current[ord.id]?.click()}
                                        disabled={uploadingOrderId === ord.id}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                      >
                                        {uploadingOrderId === ord.id ? (
                                          <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>در حال ارسال فیش...</span>
                                          </>
                                        ) : hasRejection ? (
                                          <>
                                            <Upload className="w-4 h-4" />
                                            <span>آپلود فیش جدید</span>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="w-4 h-4" />
                                            <span>آپلود فیش واریزی</span>
                                          </>
                                        )}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Card Snapshot info if available for Card-to-Card */}
                              {isCardToCard && (() => {
                                const liveCard = paymentMethods.find((m: any) => m.type === 'card_to_card') || paymentMethods[0];
                                const bName = ord.payment_info?.details?.bank_name || liveCard?.bank_name || liveCard?.details?.bank_name;
                                const oName = ord.payment_info?.details?.owner_name || liveCard?.owner_name || liveCard?.details?.owner_name;
                                const cNumber = ord.payment_info?.details?.card_number || liveCard?.card_number || liveCard?.details?.card_number;
                                const sNumber = ord.payment_info?.details?.sheba || ord.payment_info?.details?.iban || liveCard?.sheba || liveCard?.details?.sheba;

                                return (
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200 font-bold mt-2 min-w-0 overflow-hidden">
                                    <div className="min-w-0 flex-1">
                                      <span>💳 شماره کارت {bName || oName ? `(${bName || ''}${bName && oName ? ' - ' : ''}${oName || ''})` : ''}: </span>
                                      {cNumber ? (
                                        <span className="font-sans text-xs dir-ltr font-black text-emerald-950 inline-block break-all" dir="ltr">{toPersianNumbers(cNumber)}</span>
                                      ) : null}
                                    </div>
                                    {sNumber ? (
                                      <div className="min-w-0 flex-1">
                                        <span>شماره شبا: </span>
                                        <span className="font-mono text-[11px] sm:text-xs dir-ltr font-black text-emerald-950 inline-block break-all select-all" dir="ltr">{sNumber}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-brand-charcoal flex items-center gap-2 px-1">
                  <Settings className="w-5 h-5 text-brand-pink-dark" />
                  ویرایش اطلاعات حساب کاربری
                </h2>
                {saveSuccess && (
                  <p className="text-xs text-brand-pink-dark font-bold animate-pulse font-sans">✓ اطلاعات کاربری با موفقیت بروزرسانی شد</p>
                )}
              </div>

              {/* Personal details fields */}
              <div className="bg-white border border-brand-pink/15 rounded-[28px] p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-brand-pink-dark border-b border-brand-cream pb-2">اطلاعات هویتی</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-brand-stone">نام و نام خانوادگی گیرنده</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark font-sans"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-brand-stone">آدرس ایمیل</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-brand-stone">شماره موبایل جهت هماهنگی</label>
                      <input
                        type="text"
                        placeholder="09123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled
                        className="w-full bg-brand-cream/50 border border-brand-pink/10 text-brand-stone/60 text-xs rounded-[16px] py-3 px-3.5 font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form submit */}
              <button
                type="submit"
                className="bg-brand-pink-dark hover:bg-brand-pink text-white font-bold px-6 py-3.5 rounded-[18px] transition-all border border-brand-pink/15 shadow-sm cursor-pointer text-xs flex items-center gap-1.5 mr-auto"
              >
                <Save className="w-4 h-4" />
                ذخیره نهایی اطلاعات کاربری
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MarmorisAPI } from '@/lib/api';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { toPersianNumbers, formatPrice } from '@/components/PriceDisplay';

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || '';
  const { showToast, token } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment & Receipt States
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    MarmorisAPI.getPaymentMethods()
      .then((methods) => {
        if (Array.isArray(methods)) setPaymentMethods(methods);
      })
      .catch((err) => console.error('Failed to load payment methods in order detail:', err));
  }, []);

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrder() {
      try {
        setLoading(true);
        const fetchedOrder = await MarmorisAPI.getOrderById(orderId);
        setOrder(fetchedOrder);
        if (fetchedOrder.payment_info?.receipt_image) {
          setReceiptPreview(fetchedOrder.payment_info.receipt_image);
        }
      } catch (err: any) {
        console.error('Error fetching order invoice:', err);
        setError('سفارش مورد نظر یافت نشد یا دسترسی به آن محدود است.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  // Online Payment Redirection Handler
  const handleOnlinePayment = async () => {
    if (!order) return;
    try {
      setPaymentLoading(true);
      const activeToken = token || localStorage.getItem('marmoris_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`https://api.marmoris.store/api/payment/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ order_id: order.id }),
      });

      const body = await res.json().catch(() => ({}));
      
      // Extract Zarinpal redirect URL from API response
      const redirectUrl = body?.data?.data?.url || body?.data?.url || body?.data?.payment_url || body?.payment_url || body?.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        // Fallback simulation in test mode
        showToast('در حال انتقال به درگاه پرداخت زرین‌پال...', 'info');
        setTimeout(() => {
          window.location.href = `/payment/success?order_id=${order.id}`;
        }, 1200);
      }
    } catch (err: any) {
      console.error('Failed to initiate online payment:', err);
      showToast('خطا در اتصال به درگاه پرداخت. لطفاً مجدداً تلاش کنید.', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Card-to-Card Receipt Upload Handler
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;

    // Validate file size & type
    if (file.size > 10 * 1024 * 1024) {
      showToast('حجم فایل انتخابی نباید بیشتر از ۱۰ مگابایت باشد.', 'error');
      return;
    }

    try {
      setUploadingReceipt(true);
      
      // Request sent to PATCH /api/orders/<order_id>/receipt?folder=receipts with FormData key "file"
      const result = await MarmorisAPI.uploadOrderReceipt(order.id, file);

      showToast('فیش واریزی با موفقیت آپلود شد و در انتظار تایید مدیریت است.', 'success');

      // Update local order preview
      const uploadedUrl = result?.receipt_image || result?.data?.receipt_image || result?.url;
      if (uploadedUrl) {
        setReceiptPreview(uploadedUrl);
      } else {
        // Fallback local preview
        const reader = new FileReader();
        reader.onload = (ev) => {
          setReceiptPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Refresh order state
      setOrder(prev => prev ? {
        ...prev,
        status: 'pending',
        payment_info: {
          ...(prev.payment_info || { method: 'card_to_card' }),
          status: 'receipt_uploaded',
          receipt_image: uploadedUrl || receiptPreview || ''
        }
      } : prev);

    } catch (err: any) {
      console.error('Receipt upload error:', err);
      showToast(err.message || 'خطا در آپلود فیش واریزی. لطفاً مجدداً تلاش کنید.', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const copyToClipboard = (text: string, type: 'card' | 'iban') => {
    navigator.clipboard.writeText(text);
    if (type === 'card') {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    } else {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
    showToast('در حافظه کپی شد.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center animate-fade-in" dir="rtl">
        <div className="w-14 h-14 bg-brand-pink-light/60 border-2 border-brand-pink/30 rounded-2xl flex items-center justify-center shadow-xs">
          <div className="w-7 h-7 border-3 border-brand-pink-dark border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-brand-charcoal">در حال دریافت فاکتور سفارش...</h3>
          <p className="text-xs text-brand-stone">در حال استعلام اطلاعات سفارش و روش پرداخت از بک‌اند</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-brand-pink/15 rounded-[32px] text-center space-y-6 shadow-sm" dir="rtl">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-black text-brand-charcoal">فاکتور سفارش یافت نشد</h2>
          <p className="text-xs text-brand-stone">{error || 'متأسفانه مشکلی در نمایش فاکتور پیش آمده است.'}</p>
        </div>
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-pink-dark text-white rounded-2xl text-xs font-bold hover:bg-opacity-90 transition-all shadow-sm"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به تاریخچه سفارشات
        </Link>
      </div>
    );
  }

  const isPending = order.status === 'pending' || order.status === 'payment_pending' || order.status === 'awaiting_payment';
  const paymentMethod = order.payment_info?.method || order.payment_method || 'online';
  const isOnlinePayment = paymentMethod === 'online' || paymentMethod === 'zarinpal';
  const isCardToCard = paymentMethod === 'card_to_card' || paymentMethod === 'card';

  // Read card snapshot details from order.payment_info.details or live payment methods
  const cardMethodFromApi = paymentMethods.find((m: any) => m.type === 'card_to_card') || paymentMethods[0];
  const cardDetails = (order as any)?.payment_info?.details || (order as any)?.payment_details || cardMethodFromApi?.details || {};
  const cardNumber = cardDetails.card_number || cardMethodFromApi?.card_number || '';
  const ownerName = cardDetails.owner_name || cardDetails.card_holder || cardMethodFromApi?.owner_name || '';
  const bankName = cardDetails.bank_name || cardMethodFromApi?.bank_name || '';
  const shebaNumber = cardDetails.sheba || cardDetails.iban || cardMethodFromApi?.sheba || '';
  const postalTrackingCode = (order as any)?.postal_tracking_code || order.trackingNumber || '';

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8" dir="rtl">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-brand-stone">
            <Link href="/profile" className="hover:text-brand-pink-dark transition-colors">تاریخچه سفارشات</Link>
            <span>/</span>
            <span className="font-bold text-brand-charcoal">فاکتور سفارش</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-charcoal flex items-center gap-2.5 sm:gap-3">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-brand-pink-dark flex-shrink-0" />
            <span>فاکتور رسمی سفارش <span className="text-brand-pink-dark font-sans break-all">{toPersianNumbers(order.orderNumber || order.id)}</span></span>
          </h1>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-stone hover:text-brand-pink-dark transition-colors bg-white border border-brand-pink/15 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-sm"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به حساب کاربری</span>
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white border border-brand-pink/15 rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 shadow-sm">
        
        {/* Order Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-brand-cream/40 border border-brand-pink/10 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px]">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-brand-stone">تاریخ ثبت سفارش</p>
            <p className="text-xs sm:text-sm font-black text-brand-charcoal font-sans">{toPersianNumbers(order.date)}</p>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-brand-stone">مبلغ کل فاکتور</p>
            <p className="text-base sm:text-lg font-black text-brand-pink-dark font-sans">{formatPrice(order.total)}</p>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-brand-stone">وضعیت سفارش</p>
            <div>
              {order.status === 'delivered' && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> تحویل داده شد
                </span>
              )}
              {order.status === 'shipped' && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> ارسال شده
                </span>
              )}
              {order.status === 'processing' && (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> در حال پردازش
                </span>
              )}
              {isPending && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> در انتظار پرداخت
                </span>
              )}
              {order.status === 'cancelled' && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                  لغو شده
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Postal Tracking Code Panel for Shipped Orders */}
        {order.status === 'shipped' && (postalTrackingCode || order.trackingNumber) && (
          <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border-2 border-blue-200/80 rounded-[28px] p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-blue-950">
                <div className="w-11 h-11 bg-blue-100/90 rounded-2xl flex items-center justify-center text-blue-700 shadow-xs">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black">کد رهگیری پستی مرسوله</h3>
                  <p className="text-[11px] text-blue-700">سفارش شما تحویل پست گردیده است. می‌توانید آن را پیگیری فرمایید.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white border border-blue-200 p-2.5 rounded-2xl shadow-xs w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs font-black text-brand-charcoal font-sans tracking-widest dir-ltr" dir="ltr">
                  {toPersianNumbers(postalTrackingCode || order.trackingNumber)}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(postalTrackingCode || order.trackingNumber || '');
                    showToast('کد رهگیری پستی کپی شد.', 'success');
                  }}
                  className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {isPending && (
          <div className="space-y-6">
            
            {/* 1. ONLINE PAYMENT SECTION */}
            {isOnlinePayment && (
              <div className="bg-gradient-to-br from-brand-pink-light/30 via-white to-brand-cream/50 border-2 border-brand-pink/30 rounded-[28px] p-6 sm:p-8 space-y-6 text-center shadow-sm">
                <div className="w-14 h-14 bg-brand-pink-dark/10 rounded-2xl flex items-center justify-center mx-auto text-brand-pink-dark">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-black text-brand-charcoal">پرداخت آنلاین سفارش</h3>
                  <p className="text-xs text-brand-stone leading-relaxed">
                    جهت تکمیل فرآیند خرید، لطفاً روی دکمه زیر کلیک کنید تا به درگاه امن پرداختی زرین‌پال متصل شوید.
                  </p>
                </div>

                {/* Big Prominent Marmoris Pink Button */}
                <button
                  onClick={handleOnlinePayment}
                  disabled={paymentLoading}
                  className="w-full sm:w-auto min-w-[280px] bg-brand-pink-dark hover:bg-opacity-95 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-brand-pink/30 hover:shadow-brand-pink/50 transition-all duration-300 flex items-center justify-center gap-3 mx-auto disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>در حال اتصال به درگاه زرین‌پال...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>پرداخت آنلاین فاکتور</span>
                      <ExternalLink className="w-4 h-4 opacity-80" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 2. CARD TO CARD SECTION */}
            {isCardToCard && (
              <div className="bg-gradient-to-br from-emerald-50/50 via-white to-brand-cream/30 border-2 border-emerald-200/80 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 text-emerald-800">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">اطلاعات حساب واریز کارت به کارت</h3>
                    <p className="text-[11px] text-emerald-600">لطفاً مبلغ فاکتور را واریز کرده و تصویر فیش را آپلود فرمایید.</p>
                  </div>
                </div>

                {/* Bank Card Info Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Card Number Box */}
                  <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 shadow-xs min-w-0 overflow-hidden">
                    <div className="space-y-1 min-w-0 flex-1 overflow-hidden">
                      <p className="text-[10px] font-bold text-brand-stone truncate">شماره کارت ({bankName} - {ownerName})</p>
                      <p className="text-xs sm:text-sm font-black text-brand-charcoal font-sans tracking-wide sm:tracking-wider break-all dir-ltr" dir="ltr">
                        {toPersianNumbers(cardNumber)}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cardNumber.replace(/\s+/g, ''), 'card')}
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold flex-shrink-0 cursor-pointer"
                    >
                      {copiedCard ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span className="text-[10px]">{copiedCard ? 'کپی شد' : 'کپی'}</span>
                    </button>
                  </div>

                  {/* IBAN Box */}
                  <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 shadow-xs min-w-0 overflow-hidden">
                    <div className="space-y-1 min-w-0 flex-1 overflow-hidden">
                      <p className="text-[10px] font-bold text-brand-stone truncate">شماره شبا ({ownerName})</p>
                      <p className="text-[11px] sm:text-xs font-black text-brand-charcoal font-mono tracking-normal sm:tracking-wide break-all dir-ltr" dir="ltr">
                        {shebaNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(shebaNumber, 'iban')}
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold flex-shrink-0 cursor-pointer"
                    >
                      {copiedIban ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span className="text-[10px]">{copiedIban ? 'کپی شد' : 'کپی'}</span>
                    </button>
                  </div>
                </div>

                {/* Upload Section with 3 States */}
                {(() => {
                  const rejectionReason = (order as any)?.payment_info?.rejection_reason;
                  const hasRejection = Boolean(rejectionReason);
                  const hasReceipt = Boolean(receiptPreview || (order as any)?.payment_info?.receipt_image);
                  const isAwaitingApproval = hasReceipt && !hasRejection;

                  return (
                    <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 text-center space-y-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />

                      {/* Uploading Progress state */}
                      {uploadingReceipt && (
                        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-2 animate-pulse">
                          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-xs font-black text-emerald-900">در حال آپلود و ارسال تصویر فیش واریزی به سرور...</p>
                          <p className="text-[10px] text-emerald-700">لطفاً چند لحظه شکیبا باشید و صفحه را نبندید.</p>
                        </div>
                      )}

                      {!uploadingReceipt && (
                        <>
                          {/* State 1: Rejection Reason Alert */}
                          {hasRejection && (
                            <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl p-4 text-center space-y-2">
                              <div className="flex items-center justify-center gap-2 text-rose-700 font-black text-xs">
                                <AlertTriangle className="w-5 h-5 text-rose-600" />
                                <span>فیش قبلی تایید نشد.</span>
                              </div>
                              <p className="text-xs text-rose-800 font-sans leading-relaxed">
                                علت: {rejectionReason}
                              </p>
                            </div>
                          )}

                          {/* State 2: Receipt Uploaded & Awaiting Approval */}
                          {isAwaitingApproval && (
                            <div className="space-y-4">
                              <div className="relative w-44 h-44 mx-auto border-2 border-blue-300 rounded-2xl overflow-hidden shadow-sm">
                                <Image
                                  src={receiptPreview || (order as any)?.payment_info?.receipt_image}
                                  alt="فیش پرداخت واریزی"
                                  fill
                                  referrerPolicy="no-referrer"
                                  className="object-cover"
                                />
                              </div>
                              <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                <span>فیش ثبت شد - در انتظار بررسی مدیریت</span>
                              </div>
                            </div>
                          )}

                          {/* State 3: Before Uploading Receipt */}
                          {!hasReceipt && !hasRejection && (
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-brand-charcoal">هنوز تصویر فیشی ثبت نشده است</p>
                              <p className="text-[11px] text-brand-stone">تصویر فیش واریزی خود را با فرمت JPG یا PNG آپلود فرمایید.</p>
                            </div>
                          )}

                          {/* Green Upload Receipt Button */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingReceipt || isAwaitingApproval}
                            className={`font-bold text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all inline-flex items-center gap-2 ${
                              isAwaitingApproval
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300 shadow-none'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                            }`}
                          >
                            {isAwaitingApproval ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                                <span>فیش در انتظار بررسی</span>
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
                  );
                })()}
              </div>
            )}

          </div>
        )}

        {/* Shipping Address */}
        <div className="border-t border-brand-cream pt-6 space-y-2">
          <h3 className="text-xs font-black text-brand-charcoal flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-pink-dark" />
            نشانی تحویل گیرنده:
          </h3>
          <p className="text-xs text-brand-stone leading-relaxed bg-brand-cream/30 p-4 rounded-2xl border border-brand-pink/10">
            {typeof order.shippingAddress === 'string' && order.shippingAddress ? order.shippingAddress : (
              typeof (order as any).shipping_address === 'string' ? (order as any).shipping_address : (
                (order as any).shipping_address ? `${(order as any).shipping_address.state || ''} ${(order as any).shipping_address.city || ''} ${(order as any).shipping_address.street || ''} (کدپستی: ${(order as any).shipping_address.postal_code || ''} - همراه: ${(order as any).shipping_address.phone || ''})` : 'ثبت نشده'
              )
            )}
          </p>
        </div>

        {/* Order Items Table */}
        <div className="border-t border-brand-cream pt-6 space-y-4">
          <h3 className="text-xs font-black text-brand-charcoal">اقلام سفارش:</h3>
          <div className="space-y-3">
            {(order?.items ?? (order as any)?.items ?? []).map((item: any, idx: number) => {
              const itemTitle = item.title || item.product?.title || 'محصول بدون عنوان';
              const itemImage = item.image || item.product?.main_image || (item.product?.images && item.product?.images[0]) || '/placeholder.png';
              const itemPrice = Number(item.price ?? item.product?.base_price ?? 0);
              const itemQty = Number(item.quantity ?? 1);

              return (
                <div 
                  key={idx} 
                  className="flex items-center justify-between gap-4 p-4 bg-white border border-brand-pink/10 rounded-2xl hover:bg-brand-cream/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-cream border border-brand-pink/10 flex-shrink-0">
                      <Image
                        src={itemImage}
                        alt={itemTitle}
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-brand-charcoal">{itemTitle}</p>
                      
                      {(item.decoration || item.accessory) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-brand-pink-dark font-bold bg-brand-pink-light/50 px-2 py-0.5 rounded-lg border border-brand-pink/10 w-fit">
                          {(item.decoration?.image || item.accessory?.image) && (
                            <Image 
                              src={item.decoration?.image || item.accessory?.image || ''} 
                              alt={item.decoration?.name || item.accessory?.name || 'تزیین'} 
                              width={14}
                              height={14}
                              referrerPolicy="no-referrer"
                              className="w-3.5 h-3.5 object-cover rounded-full border border-brand-pink/10 bg-white" 
                            />
                          )}
                          <span>تزیین: {item.decoration?.name || item.accessory?.name}</span>
                          {(item.decoration?.additional_price || item.accessory?.additional_price) ? (
                            <span>(+{formatPrice(item.decoration?.additional_price || item.accessory?.additional_price || 0)})</span>
                          ) : null}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-brand-stone font-sans">
                        <span>تعداد: {toPersianNumbers(itemQty)} عدد</span>
                        {item.color && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              رنگ: {typeof item.color === 'object' ? item.color.name : String(item.color)}
                              {typeof item.color === 'object' && item.color.hex && (
                                <span className="inline-block w-2.5 h-2.5 rounded-full border border-brand-pink/20" style={{ backgroundColor: item.color.hex }} />
                              )}
                            </span>
                          </>
                        )}
                        {item.size && (
                          <>
                            <span>•</span>
                            <span>سایز: {item.size}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left font-sans">
                    <p className="text-xs font-black text-brand-pink-dark">{formatPrice(itemPrice * itemQty)}</p>
                    <p className="text-[10px] text-brand-stone">{formatPrice(itemPrice)} برای هر عدد</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice Summary Box */}
        {(() => {
          const totalPrice = Number((order as any).total_price ?? order.total ?? 0);
          const shippingCost = Number((order as any).shipping_cost ?? 0);
          const itemsTotal = Math.max(0, totalPrice - shippingCost);

          return (
            <div className="border-t border-brand-cream pt-6 space-y-2 max-w-sm mr-auto bg-brand-cream/30 p-5 rounded-2xl border border-brand-pink/10 text-xs font-sans">
              <div className="flex justify-between text-brand-stone">
                <span>جمع قیمت کالاها:</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-brand-stone">
                <span>هزینه ارسال:</span>
                <span className={shippingCost === 0 ? 'text-emerald-600 font-bold' : 'text-brand-charcoal font-bold'}>
                  {shippingCost === 0 ? 'رایگان' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="border-t border-brand-cream pt-2 flex justify-between font-black text-brand-charcoal text-sm">
                <span>مبلغ کل نهایی:</span>
                <span className="text-brand-pink-dark">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

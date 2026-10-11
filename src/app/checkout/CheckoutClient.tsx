/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, ShieldCheck, MapPin, ClipboardCheck, ArrowLeft, LogIn, AlertTriangle, CreditCard, Building2, Upload } from 'lucide-react';
import { toPersianNumbers, formatPrice, PriceDisplay } from '@/components/PriceDisplay';
import Link from 'next/link';
import { MarmorisAPI } from '@/lib/api';
import { ShippingMethod } from '@/types';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token, placeBackendOrder, requestPaymentRedirect } = useAuth();
  const router = useRouter();

  // Recipient info states
  const [fullName, setFullName] = useState((user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`).trim());
  const [phone, setPhone] = useState(user?.phone || '');
  const [province, setProvince] = useState(user?.address?.province || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');

  // Shipping & Payment Configuration
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [shippingConfig, setShippingConfig] = useState<{ default_method_id: string } | null>(null);
  
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('online');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('online');

  // Operation states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [paymentErrorModal, setPaymentErrorModal] = useState<{
    isOpen: boolean;
    orderId: string;
    message: string;
  }>({
    isOpen: false,
    orderId: '',
    message: '',
  });

  useEffect(() => {
    setIsMounted(true);
    // Load shipping methods
    MarmorisAPI.getShippingMethods()
      .then((methods) => {
        setShippingMethods(methods);
      })
      .catch((err) => console.error('Failed to load shipping methods', err));

    // Load payment methods from GET /api/payment/methods
    MarmorisAPI.getPaymentMethods()
      .then((methods) => {
        if (Array.isArray(methods) && methods.length > 0) {
          setPaymentMethods(methods);
          setSelectedPaymentMethodId(methods[0].id);
          const firstType = methods[0].type || (methods[0].id.includes('card') ? 'card_to_card' : 'online');
          setSelectedPaymentMethod(firstType);
        }
      })
      .catch((err) => console.error('Failed to load payment methods', err));

    // Load shipping configuration
    MarmorisAPI.getShippingConfig()
      .then((config: any) => {
        setShippingConfig(config);
      })
      .catch((err) => console.error('Failed to load shipping config', err));
  }, []);

  // Set default shipping method intelligently
  useEffect(() => {
    if (shippingMethods.length > 0) {
      if (shippingConfig) {
        // خواندن آیدی پیشفرض ست شده توسط ادمین در پنل مدیریت
        const defaultId = shippingConfig.default_method_id;
        
        // بررسی اینکه آیا این روش در حال حاضر فعال و موجود هست یا خیر
        const isDefaultActive = shippingMethods.some(method => method.id === defaultId);

        if (defaultId && isDefaultActive) {
          setSelectedShippingMethodId(defaultId); // فعال کردن تیک روش پیشفرض ادمین
        } else {
          setSelectedShippingMethodId(shippingMethods[0].id); // سوپاپ اطمینان: انتخاب اولین روش
        }
      } else {
        setSelectedShippingMethodId(shippingMethods[0].id);
      }
    }
  }, [shippingMethods, shippingConfig]);

  // Update states when user details load
  useEffect(() => {
    if (user) {
      setFullName((user.fullName || `${user.firstName || ''} ${user.lastName || ''}`).trim());
      setPhone(user.phone || '');
      if (user.address) {
        setProvince(user.address.province || '');
        setCity(user.address.city || '');
        setStreet(user.address.street || '');
        setPostalCode(user.address.postalCode || '');
      }
    }
  }, [user]);

  if (!isMounted) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 text-brand-stone font-sans space-y-3" dir="rtl">
        <div className="w-8 h-8 border-3 border-brand-pink border-t-brand-pink-dark rounded-full animate-spin" />
        <p className="text-xs font-bold text-brand-charcoal">در حال بررسی فاکتور خرید...</p>
      </div>
    );
  }

  // REDIRECT TO LOGIN IF NOT AUTHENTICATED
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6" dir="rtl">
        <div className="w-16 h-16 bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark rounded-full flex items-center justify-center mx-auto shadow-sm">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-brand-charcoal font-sans">نیاز به ورود به حساب کاربری</h2>
        <p className="text-xs text-brand-stone leading-relaxed">
          برای ثبت سفارش در گالری مرموریس و اتصال به درگاه پرداخت شتاب، ابتدا باید وارد حساب کاربری خود شوید یا حساب جدید بسازید.
        </p>
        <Link
          href="/auth?redirect=checkout"
          className="inline-block bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-6 py-3.5 rounded-[16px] transition-all cursor-pointer shadow-md shadow-brand-pink/10"
        >
          ورود یا ثبت‌نام در گالری
        </Link>
      </div>
    );
  }

  // SHOW DEDICATED LOADING VIEW WHEN SUBMITTING / REDIRECTING ORDER
  if (submitting) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6 animate-fade-in" dir="rtl">
        <div className="w-16 h-16 bg-brand-pink-light/60 border-2 border-brand-pink/30 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <div className="w-8 h-8 border-3 border-brand-pink-dark border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-black text-brand-charcoal">در حال ثبت سفارش و صدور فاکتور...</h2>
          <p className="text-xs text-brand-stone leading-relaxed">
            اطلاعات آدرس و اقلام سبد خرید شما در حال پردازش و ثبت در سرور است. لطفاً چند لحظه شکیبا باشید...
          </p>
        </div>
        <div className="bg-white border border-brand-pink/20 rounded-2xl p-4 text-xs font-bold text-brand-pink-dark flex items-center justify-center gap-2 shadow-xs">
          <div className="w-2.5 h-2.5 bg-brand-pink-dark rounded-full animate-ping" />
          <span>
            {selectedPaymentMethod === 'online' 
              ? 'در حال انتقال امن به درگاه پرداخت زرین‌پال...' 
              : 'در حال انتقال به فاکتور سفارش جهت دریافت شماره کارت و آپلود فیش...'}
          </span>
        </div>
      </div>
    );
  }

  // FALLBACK IF CART IS EMPTY (Only if not currently submitting)
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4" dir="rtl">
        <h2 className="text-lg font-bold text-brand-charcoal">سبد خرید شما فاقد کالاست</h2>
        <p className="text-xs text-brand-stone">ابتدا محصولاتی به سبد خرید اضافه کنید.</p>
        <Link href="/products" className="bg-brand-pink-dark hover:bg-brand-pink text-white px-5 py-2.5 rounded-xl text-xs inline-block">
          مشاهده محصولات گالری
        </Link>
      </div>
    );
  }

  const handleRetryPayment = async () => {
    setSubmitting(true);
    setFormError('');
    try {
      const paymentUrl = await requestPaymentRedirect(paymentErrorModal.orderId);
      if (paymentUrl && paymentUrl !== 'undefined') {
        window.location.href = paymentUrl;
      } else {
        router.push(`/orders/${paymentErrorModal.orderId}`);
      }
    } catch (err: any) {
      console.error('Retry payment error:', err);
      setPaymentErrorModal(prev => ({
        ...prev,
        message: err.message || 'تلاش مجدد برای اتصال به درگاه پرداخت با خطا مواجه شد. لطفاً دوباره امتحان کنید یا از پنل کاربری اقدام نمایید.'
      }));
      setSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !phone || !province || !city || !street || !postalCode || !selectedShippingMethodId) {
      setFormError('لطفاً استان، شهر، آدرس دقیق ارسال و مشخصات گیرنده را به صورت کامل تکمیل کنید.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Build shipping address payload
      const addressPayload = {
        street,
        city,
        state: province,
        postal_code: postalCode,
        phone
      };

      // 2. Create actual order on the backend
      const note = `سفارش ثبت شده توسط ${fullName}`;
      
      // Get or create real backend cart and ensure items are synced
      let realCartId = '';
      try {
        realCartId = await MarmorisAPI.ensureBackendCart(cart);
      } catch (e: any) {
        console.error('Failed to ensure backend cart:', e);
        throw new Error(e.message || 'خطا در هماهنگ‌سازی سبد خرید با سرور. لطفاً مجدداً تلاش کنید.');
      }
      
      const order = await placeBackendOrder(realCartId, addressPayload, selectedShippingMethodId, note, selectedPaymentMethod, selectedPaymentMethodId);

      if (!order || (!order.id && !order._id && !order.order_id && !order.orderId)) {
        throw new Error('دریافت شناسه سفارش از سرور با خطا مواجه شد.');
      }

      const orderId = order.id || order._id || order.order_id || order.orderId;

      if (selectedPaymentMethod === 'online') {
        // 3. Request genuine payment URL and redirect to bank gateway
        try {
          const paymentUrl = await requestPaymentRedirect(orderId);
          clearCart();
          if (paymentUrl && paymentUrl !== 'undefined') {
            window.location.href = paymentUrl;
          } else {
            router.push(`/orders/${orderId}`);
          }
        } catch (paymentError: any) {
          console.error('Payment gateway request failed:', paymentError);
          clearCart();
          setPaymentErrorModal({
            isOpen: true,
            orderId: orderId,
            message: "سفارش شما با موفقیت ثبت شد، اما به دلیل قطعی موقت درگاه، موفق به اتصال به بانک نشدیم. لطفاً یکی از گزینه‌های زیر را انتخاب کنید:"
          });
          setSubmitting(false);
        }
      } else {
        // Card to card flow: redirect directly to order page where bank card details and green receipt upload button are rendered
        clearCart();
        router.push(`/orders/${orderId}`);
      }

    } catch (err: any) {
      console.error('Checkout error:', err);
      setFormError(err.message || 'ثبت سفارش با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-8 text-right animate-fade-in" dir="rtl">
      
      {/* Back button */}
      <div className="flex justify-between items-center px-1">
        <button
          onClick={() => router.back()}
          className="text-xs text-brand-stone hover:text-brand-pink-dark flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>بازگشت به سبد خرید</span>
        </button>
        <span className="text-[10px] text-brand-stone/60 font-sans">مرحله نهایی خرید</span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-charcoal">نهایی‌سازی سفارش و ثبت آدرس</h1>
        <p className="text-xs text-brand-stone">مشخصات گیرنده مرسوله و آدرس ارسال خود را تایید کنید</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* RECIPIENT DATA ENTRY (8 cols) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 sm:p-4 rounded-[18px] text-center font-bold">
              {formError}
            </div>
          )}

          {/* Form Recipient details */}
          <div className="bg-white border border-brand-pink/15 rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 space-y-4 shadow-sm shadow-brand-pink/5">
            <h2 className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5 border-b border-brand-pink/10 pb-3">
              <MapPin className="w-4 h-4 text-brand-pink-dark flex-shrink-0" />
              اطلاعات گیرنده و آدرس ارسال مرسوله پستی
            </h2>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">نام و نام خانوادگی گیرنده *</label>
              <input
                type="text"
                placeholder="مثال: مریم کریمی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-brand-cream border border-brand-pink/20 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">استان *</label>
                <input
                  type="text"
                  placeholder="مثال: تهران، اصفهان..."
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/20 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">شهر *</label>
                <input
                  type="text"
                  placeholder="مثال: تهران، شیراز..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/20 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">کد پستی ده رقمی *</label>
                <input
                  type="text"
                  placeholder="1939612345"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-pink/20 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-stone">نشانی دقیق پستی (خیابان اصلی، کوچه، پلاک، واحد) *</label>
              <textarea
                rows={2}
                placeholder="مثال: خیابان سلیمی شمالی، کوچه فرعی دوم، پلاک ۱۲، واحد ۳"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-brand-cream border border-brand-pink/20 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark"
                required
              />
            </div>

            <div className="space-y-1.5 max-w-sm">
              <label className="text-[11px] font-bold text-brand-stone">شماره موبایل جهت هماهنگی پست اکسپرس *</label>
              <input
                type="text"
                placeholder="09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-brand-cream border border-brand-pink/20 text-brand-charcoal text-xs rounded-[16px] py-3 px-3.5 focus:outline-none focus:border-brand-pink-dark font-sans"
                required
              />
            </div>
          </div>

          {/* Secure Assurances Frame */}
          <div className="bg-white border border-brand-pink/15 rounded-[28px] p-6 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-0.5 text-right">
                <h3 className="text-xs font-bold text-brand-charcoal">پرداخت کاملاً امن و رمزنگاری شده</h3>
                <p className="text-[10px] text-brand-stone">تراکنش شما مستقیماً تحت شبکه شتاب روی درگاه بانکی شاپرک انجام می‌شود.</p>
              </div>
            </div>
            <span className="text-[10px] bg-brand-pink-light border border-brand-pink/20 px-3 py-1.5 rounded-full text-brand-pink-dark font-mono">SSL Secure 256-bit</span>
          </div>
        </div>

        {/* FACTOR SUMMARY (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-brand-pink/15 rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-brand-charcoal border-b border-brand-pink/10 pb-3">فاکتور صورتحساب نهایی</h2>

          {/* Shipping Methods Section */}
          <div className="space-y-3 pb-3 border-b border-brand-pink/10">
            <h3 className="text-xs font-bold text-brand-charcoal">روش ارسال</h3>
            <div className="space-y-2">
              {shippingMethods.map((method) => (
                <label key={method.id} className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedShippingMethodId === method.id ? 'border-brand-pink-dark bg-brand-pink-light/30' : 'border-brand-pink/10 bg-brand-cream/50'}`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={selectedShippingMethodId === method.id}
                        onChange={() => setSelectedShippingMethodId(method.id)}
                        className="w-3.5 h-3.5 text-brand-pink-dark focus:ring-brand-pink-dark border-brand-pink/30 cursor-pointer"
                      />
                      <span className="text-xs font-black text-brand-charcoal">
                        {method.name} - {method.price === 0 ? 'رایگان' : formatPrice(method.price)}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-brand-stone/70 flex items-center gap-1 mt-0.5 mr-5">
                    <span className="text-xs">⏳</span>
                    <span>تحویل حدودی: {method.estimated_days || method.duration}</span>
                  </div>
                </label>
              ))}
              {shippingMethods.length === 0 && (
                <div className="text-xs text-brand-stone text-center py-2">در حال بارگذاری روش‌های ارسال...</div>
              )}
            </div>
          </div>

          {/* Payment Methods Selection */}
          <div className="space-y-3 pb-3 border-b border-brand-pink/10">
            <h3 className="text-xs font-bold text-brand-charcoal">روش پرداخت</h3>
            <div className="space-y-2">
              {paymentMethods.map((item) => {
                const isSelected = selectedPaymentMethodId === item.id;
                const isOnline = item.type === 'online' || item.id === 'online' || (typeof item.id === 'string' && item.id.includes('zarinpal')) || item.type === 'gateway';
                const methodTitle = item.title || item.name || item.label || item.method_name || (isOnline ? 'درگاه پرداخت آنلاین شتابی' : 'کارت به کارت / واریز به حساب');
                
                return (
                  <label 
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? (isOnline ? 'border-brand-pink-dark bg-brand-pink-light/30 shadow-xs' : 'border-emerald-600 bg-emerald-50/60 shadow-xs') 
                        : 'border-brand-pink/10 bg-brand-cream/50 hover:bg-brand-cream'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethodId"
                      value={item.id}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedPaymentMethodId(item.id);
                        setSelectedPaymentMethod(isOnline ? 'online' : 'card_to_card');
                      }}
                      className={`w-3.5 h-3.5 mt-0.5 cursor-pointer ${
                        isOnline ? 'text-brand-pink-dark focus:ring-brand-pink-dark border-brand-pink/30' : 'text-emerald-600 focus:ring-emerald-600 border-emerald-300'
                      }`}
                    />
                    <div className="space-y-0.5 w-full">
                      <div className={`flex items-center justify-between text-xs font-black ${isOnline ? 'text-brand-charcoal' : 'text-emerald-900'}`}>
                        <div className="flex items-center gap-1.5">
                          {isOnline ? <CreditCard className="w-3.5 h-3.5 text-brand-pink-dark" /> : <Building2 className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>{methodTitle}</span>
                        </div>
                        {isSelected && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isOnline ? 'bg-brand-pink-dark text-white' : 'bg-emerald-600 text-white'}`}>
                            انتخاب شده
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-[10px] ${isOnline ? 'text-brand-stone' : 'text-emerald-700'} leading-relaxed`}>
                          {item.description}
                        </p>
                      )}
                      {!isOnline && item.card_number && (
                        <p className="text-[10px] font-sans font-bold text-emerald-800 dir-ltr text-right mt-1" dir="ltr">
                          {item.card_number} {item.bank_name ? `(${item.bank_name})` : ''}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}

              {paymentMethods.length === 0 && (
                <div className="text-xs text-brand-stone text-center py-2">در حال بارگذاری روش‌های پرداخت...</div>
              )}
            </div>
          </div>

          {/* Miniature List items loop */}
          <div className="space-y-3 pb-3 border-b border-brand-pink/10">
            {cart.map((item, index) => {
              const rowBasePrice = item.selectedColor?.price || item.product.price;
              const rowDiscount = item.product.discount_percentage || 0;
              const rowSinglePrice = rowDiscount > 0 ? (rowBasePrice - (rowBasePrice * rowDiscount / 100)) : rowBasePrice;
              const rowTotalPrice = (rowSinglePrice + (item.decoration?.additional_price || 0)) * item.quantity;

              return (
                <div key={index} className="flex gap-3 items-center justify-between text-xs">
                  <div className="flex gap-2.5 items-center">
                    <Image 
                      src={item.product.image} 
                      alt={item.product.title} 
                      width={36}
                      height={36}
                      className="w-9 h-9 object-cover rounded-[10px] border border-brand-pink/10 bg-brand-cream" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="text-right">
                      <p className="font-bold text-brand-charcoal line-clamp-1 max-w-[120px]">{item.product.title}</p>
                      <p className="text-[10px] text-brand-stone font-sans">{toPersianNumbers(item.quantity)} عدد</p>
                      {item.decoration && (
                        <div className="flex items-center gap-1 text-[9px] text-brand-pink-dark font-bold leading-tight mt-0.5">
                          {item.decoration.image && (
                            <Image 
                              src={item.decoration.image} 
                              alt={typeof item.decoration.name === 'object' && item.decoration.name !== null ? (item.decoration.name as any).name || 'تزیین' : String(item.decoration.name)} 
                              width={12}
                              height={12}
                              referrerPolicy="no-referrer"
                              className="w-3 h-3 object-cover rounded-full border border-brand-pink/10 bg-white" 
                            />
                          )}
                          <span>
                            تزیین: {typeof item.decoration.name === 'object' && item.decoration.name !== null
                              ? (item.decoration.name as any).name || 'تزیین'
                              : String(item.decoration.name)}
                            {item.decoration.additional_price > 0 ? ` (+${formatPrice(item.decoration.additional_price)})` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-brand-charcoal font-sans text-xs">
                    {formatPrice(rowTotalPrice)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 text-xs text-brand-stone font-sans">
            <div className="flex justify-between">
              <span className="text-brand-stone/80">جمع کل کالاها:</span>
              <span className="text-brand-charcoal font-bold">{formatPrice(cartTotal - cart.reduce((tot, itm) => tot + ((itm.decoration?.additional_price || 0) * itm.quantity), 0))}</span>
            </div>

            {cart.some(itm => itm.decoration && itm.decoration.additional_price > 0) && (
              <div className="flex justify-between text-brand-pink-dark">
                <span className="font-medium">جمع قیمت تزیینات انتخابی:</span>
                <span className="font-bold">
                  +{formatPrice(cart.reduce((tot, itm) => tot + ((itm.decoration?.additional_price || 0) * itm.quantity), 0))}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-brand-stone/80">هزینه تحویل و بیمه‌نامه:</span>
              <span className="text-brand-pink-dark font-bold">
                {(() => {
                  const method = shippingMethods.find(m => m.id === selectedShippingMethodId);
                  if (!method) return 'محاسبه نشده';
                  return method.price === 0 ? 'رایگان' : formatPrice(method.price);
                })()}
              </span>
            </div>

            <hr className="border-brand-pink/10" />

            <div className="flex justify-between text-sm font-bold text-brand-charcoal pt-1">
              <span>کل مبلغ پرداختی:</span>
              <span className="text-brand-pink-dark font-bold">
                {(() => {
                  const method = shippingMethods.find(m => m.id === selectedShippingMethodId);
                  const shippingCost = method ? method.price : 0;
                  return formatPrice(cartTotal + shippingCost);
                })()}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full liquid-glass-btn-accent font-bold py-4 rounded-full transition-all shadow-md shadow-brand-pink/5 cursor-pointer text-xs mt-4 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <span>در حال اتصال به درگاه بانکی...</span>
            ) : (
              <>
                <ClipboardCheck className="w-4.5 h-4.5" />
                انتقال به درگاه و ثبت نهایی سفارش
              </>
            )}
          </button>
        </div>
      </form>

      {/* ZarinPal Payment Failure Warning Modal */}
      {paymentErrorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in" dir="rtl">
          <div className="liquid-glass-modal rounded-[28px] max-w-md w-full p-6 space-y-6 shadow-2xl relative text-right">
            <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800 font-sans">بروز اختلال در درگاه بانکی</h3>
                <p className="text-[10px] text-amber-600 font-sans">سفارش شما با موفقیت ثبت شده است</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-brand-charcoal leading-relaxed font-sans font-medium">
                {paymentErrorModal.message}
              </p>
              <div className="bg-amber-50/50 rounded-xl p-3.5 text-[11px] text-amber-800 leading-relaxed border border-amber-100/50 font-sans">
                سفارش شما در وضعیت <span className="font-bold">«در انتظار پرداخت»</span> ذخیره شده است و سبد خرید شما خالی شده است تا نیازی به ورود مجدد کالاها نباشد.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-sans shadow-md shadow-amber-600/10"
              >
                {submitting ? 'در حال اتصال...' : 'تلاش مجدد برای پرداخت'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentErrorModal(prev => ({ ...prev, isOpen: false }));
                  router.push('/profile');
                }}
                className="w-full liquid-glass-btn text-brand-charcoal font-bold py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center font-sans"
              >
                مشاهده سفارش در پنل کاربری
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

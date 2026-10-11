/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toPersianNumbers, formatPrice, PriceDisplay } from '@/components/PriceDisplay';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6" dir="rtl">
        <div className="w-16 h-16 bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-brand-charcoal font-sans">سبد خرید شما خالی است</h2>
        <p className="text-xs text-brand-stone leading-relaxed">
          شما هنوز هیچ محصولی از کلکسیون کیف، پوشاک یا زیورآلات مرموریس به سبد خریدتان اضافه نکرده‌اید.
        </p>
        <Link
          href="/products"
          className="inline-block bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-6 py-3.5 rounded-[16px] transition-all cursor-pointer shadow-md shadow-brand-pink/10"
        >
          شروع گشت و گذار در گالری
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-8 text-right animate-fade-in" dir="rtl">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-charcoal">سبد خرید مرموریس</h1>
        <p className="text-xs text-brand-stone">کالاهای انتخابی خود را مدیریت و نهایی کنید</p>
      </div>

      {/* Grid: Items on Right, Summary on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ITEMS LIST (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {cart.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-brand-pink/15 rounded-[24px] p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-brand-pink/30 shadow-sm shadow-brand-pink/5 transition-all duration-300"
            >
              {/* Product Image */}
              <div className="w-20 h-20 bg-brand-cream border border-brand-pink/15 rounded-[16px] overflow-hidden flex-shrink-0 relative">
                <Image
                  src={item.product.image}
                  alt={item.product.title}
                  fill
                  sizes="80px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>

              {/* Title & Specifications */}
              <div className="flex-1 space-y-1 text-center sm:text-right">
                <h2 className="text-sm font-bold text-brand-charcoal line-clamp-1">{item.product.title}</h2>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-[10px] text-brand-stone pt-0.5 font-sans">
                  <span>دسته: {typeof item.product.category === 'object' && item.product.category !== null ? (item.product.category as any).name || 'متفرقه' : item.product.category}</span>
                  {item.selectedSize && (
                    <>
                      <span>•</span>
                      <span>سایز: {item.selectedSize}</span>
                    </>
                  )}
                  {item.selectedColor && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        رنگ:{' '}
                        {typeof item.selectedColor === 'object' && item.selectedColor !== null ? (
                          typeof item.selectedColor.name === 'object' && item.selectedColor.name !== null ? (
                            (item.selectedColor.name as any).name || 'نامشخص'
                          ) : (
                            item.selectedColor.name || 'نامشخص'
                          )
                        ) : (
                          String(item.selectedColor)
                        )}
                        <span 
                          className="inline-block w-2.5 h-2.5 rounded-full border border-brand-pink/20" 
                          style={{ 
                            backgroundColor: typeof item.selectedColor === 'object' && item.selectedColor !== null
                              ? (item.selectedColor.hex || (item.selectedColor as any).code || '#111111')
                              : '#111111'
                          }} 
                        />
                      </span>
                    </>
                  )}
                  {item.decoration && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-brand-pink-dark font-bold bg-brand-pink-light/50 px-1.5 py-0.5 rounded-lg border border-brand-pink/10">
                        {item.decoration.image && (
                          <Image 
                            src={item.decoration.image} 
                            alt={typeof item.decoration.name === 'object' && item.decoration.name !== null ? (item.decoration.name as any).name || 'تزیین' : String(item.decoration.name)} 
                            width={14}
                            height={14}
                            referrerPolicy="no-referrer"
                            className="w-3.5 h-3.5 object-cover rounded-full border border-brand-pink/10 bg-white" 
                          />
                        )}
                        تزیین: {typeof item.decoration.name === 'object' && item.decoration.name !== null ? (item.decoration.name as any).name || 'تزیین' : String(item.decoration.name)} (+{formatPrice(item.decoration.additional_price)})
                      </span>
                    </>
                  )}
                </div>
                <div className="pt-1">
                  {item.product.discount_percentage && item.product.discount_percentage > 0 ? (
                    <div className="flex flex-col gap-0.5 text-center sm:text-right" dir="rtl">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <span className="line-through text-brand-stone/50 text-[10px] font-sans">
                          {formatPrice((item.selectedColor?.price || item.product.price) + (item.decoration?.additional_price || 0))}
                        </span>
                        <span className="bg-rose-500 text-white text-[8px] px-1.5 py-0.2 rounded-full font-bold">
                          {toPersianNumbers(item.product.discount_percentage)}٪ تخفیف
                        </span>
                      </div>
                      <span className="font-bold text-brand-charcoal text-sm font-sans block">
                        {formatPrice(((item.selectedColor?.price || item.product.price) - ((item.selectedColor?.price || item.product.price) * item.product.discount_percentage / 100)) + (item.decoration?.additional_price || 0))}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-brand-charcoal text-sm font-sans block">
                      {formatPrice((item.selectedColor?.price || item.product.price) + (item.decoration?.additional_price || 0))}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center bg-brand-cream border border-brand-pink/15 rounded-[14px] p-0.5">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor?.hex, item.decoration?.id)}
                  aria-label="کاهش تعداد محصول"
                  className="w-8 h-8 flex items-center justify-center text-brand-stone hover:text-brand-charcoal rounded-[10px] hover:bg-brand-pink/10 cursor-pointer font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-brand-charcoal font-sans">
                  {toPersianNumbers(item.quantity)}
                </span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor?.hex, item.decoration?.id)}
                  aria-label="افزایش تعداد محصول"
                  className="w-8 h-8 flex items-center justify-center text-brand-stone hover:text-brand-charcoal rounded-[10px] hover:bg-brand-pink/10 cursor-pointer font-bold"
                >
                  +
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor?.hex, item.decoration?.id)}
                aria-label="حذف محصول از سبد خرید"
                className="p-2.5 text-brand-stone hover:text-rose-500 bg-brand-cream hover:bg-rose-50 border border-brand-pink/15 hover:border-rose-200 rounded-[14px] transition-all cursor-pointer"
                title="حذف از سبد"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Quick Buttons below list */}
          <div className="flex justify-between items-center px-1">
            <Link
              href="/products"
              className="text-xs text-brand-stone hover:text-brand-pink-dark flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ادامه خرید و گشت و گذار
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              خالی کردن کل سبد خرید
            </button>
          </div>
        </div>

        {/* SUMMARY CARD (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Final Receipt Breakdown */}
          <div className="liquid-glass-card rounded-[28px] p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-brand-charcoal border-b border-brand-pink/10 pb-3">خلاصه فاکتور خرید</h2>

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
                <span className="text-brand-stone/80">هزینه ارسال:</span>
                <span className="text-brand-stone font-bold text-[10px]">در مرحله بعد محاسبه می‌شود</span>
              </div>

              <hr className="border-brand-pink/10" />

              <div className="flex justify-between text-sm font-bold text-brand-charcoal pt-1">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-brand-pink-dark font-bold">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => router.push('/checkout')}
              className="w-full liquid-glass-btn-accent font-bold py-3.5 rounded-full transition-all shadow-md shadow-brand-pink/5 flex items-center justify-center gap-2 cursor-pointer text-xs mt-4"
            >
              تکمیل مشخصات و ثبت نهایی سفارش
            </button>

            <div className="flex items-center gap-1.5 justify-center text-[9px] text-brand-stone/60 pt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-pink-dark" />
              <span>پرداخت آنلاین امن با کلیه کارت‌های شتاب</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

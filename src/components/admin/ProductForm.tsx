/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';
import { Save, X, Image as ImageIcon, Plus, Trash2, Info } from 'lucide-react';
import { toPersianNumbers, formatPrice, PriceDisplay } from '@/components/PriceDisplay';

interface ProductFormProps {
  initialData?: Partial<Product>;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ initialData, categories, onSubmit, onCancel, isLoading }: ProductFormProps) {
  // Logic: Extract category ID from initialData.category if it's an object
  const getInitialCategoryId = () => {
    if (!initialData?.category) return '';
    if (typeof initialData.category === 'object') {
      return (initialData.category as any).id || (initialData.category as any)._id || '';
    }
    return initialData.categoryId || '';
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    price: initialData?.price || 0,
    discount_percentage: initialData?.discount_percentage || 0,
    description: initialData?.description || '',
    categoryId: getInitialCategoryId(),
    inStock: initialData?.inStock !== undefined ? initialData?.inStock : true,
    image: initialData?.image || '',
    images: initialData?.images || [],
    sizes: initialData?.sizes || ['استاندارد'],
    colors: initialData?.colors || [{ name: 'استاندارد', hex: '#111111' }],
    specifications: initialData?.specifications || []
  });

  // Calculate final price for UI helper
  const finalPrice = formData.price * (1 - formData.discount_percentage / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-right" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-black text-brand-charcoal border-b border-brand-cream pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-pink-dark" />
              اطلاعات اصلی محصول
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">عنوان محصول *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-xs rounded-[16px] py-3.5 px-4 focus:outline-none focus:border-brand-pink-dark"
                  placeholder="مثال: کیف دوشی مدل پروانه"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-brand-stone">دسته‌بندی محصول *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-brand-cream border border-brand-pink/15 text-xs rounded-[16px] py-3.5 px-4 focus:outline-none focus:border-brand-pink-dark appearance-none"
                    required
                  >
                    <option value="">انتخاب کنید...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-brand-stone">وضعیت موجودی</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, inStock: true })}
                      className={`flex-1 py-3 rounded-[16px] text-[11px] font-bold border transition-all ${
                        formData.inStock 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-inner' 
                          : 'bg-white border-brand-pink/10 text-brand-stone'
                      }`}
                    >
                      موجود در انبار
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, inStock: false })}
                      className={`flex-1 py-3 rounded-[16px] text-[11px] font-bold border transition-all ${
                        !formData.inStock 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-inner' 
                          : 'bg-white border-brand-pink/10 text-brand-stone'
                      }`}
                    >
                      ناموجود
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">توضیحات محصول</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-xs rounded-[16px] py-3.5 px-4 focus:outline-none focus:border-brand-pink-dark min-h-[150px]"
                  placeholder="جزئیات، متریال و داستان پشت این اثر..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Discount logic */}
          <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-black text-brand-charcoal border-b border-brand-cream pb-3">قیمت و تخفیف</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">قیمت پایه (تومان) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-xs rounded-[16px] py-3.5 px-4 focus:outline-none focus:border-brand-pink-dark font-sans"
                  required
                />
                <p className="text-[10px] text-brand-stone/60 font-sans">
                  قیمت نهایی با {toPersianNumbers(formData.discount_percentage)}٪ تخفیف: {formatPrice(finalPrice)}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-stone">درصد تخفیف (۰ تا ۱۰۰)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                  className="w-full bg-brand-cream border border-brand-pink/15 text-xs rounded-[16px] py-3.5 px-4 focus:outline-none focus:border-brand-pink-dark font-sans"
                />
              </div>
            </div>

            {/* Price Helper UI */}
            <div className="bg-brand-cream/60 border border-brand-pink/10 rounded-[20px] p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-brand-stone">خلاصه قیمت (با احتساب تخفیف):</p>
                <PriceDisplay 
                  price={formData.price} 
                  discountPercentage={formData.discount_percentage} 
                />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-brand-stone">مبلغ کسر شده:</p>
                <p className="text-xs font-bold text-rose-500 font-sans">
                  -{formatPrice(formData.price - finalPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Color Management */}
          <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-cream pb-3">
              <h3 className="text-sm font-black text-brand-charcoal">مدیریت رنگ‌ها و قیمت هر رنگ</h3>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  colors: [...formData.colors, { name: '', hex: '#000000', price: formData.price }]
                })}
                className="flex items-center gap-1.5 text-[10px] font-bold text-brand-pink-dark hover:text-brand-pink transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن رنگ جدید
              </button>
            </div>

            <div className="space-y-4">
              {formData.colors.map((color, index) => {
                const colorFinalPrice = (color.price || formData.price) * (1 - formData.discount_percentage / 100);
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-brand-cream/40 border border-brand-pink/10 rounded-[20px] items-end">
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-stone">نام رنگ</label>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => {
                          const newColors = [...formData.colors];
                          newColors[index].name = e.target.value;
                          setFormData({ ...formData, colors: newColors });
                        }}
                        placeholder="مثال: عسلی"
                        className="w-full bg-white border border-brand-pink/10 text-xs rounded-xl py-2.5 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-stone">کد رنگ</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index].hex = e.target.value;
                            setFormData({ ...formData, colors: newColors });
                          }}
                          className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color.hex}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index].hex = e.target.value;
                            setFormData({ ...formData, colors: newColors });
                          }}
                          className="flex-1 bg-white border border-brand-pink/10 text-[10px] rounded-xl px-2 font-mono uppercase"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-stone">قیمت اختصاصی (تومان)</label>
                      <input
                        type="number"
                        value={color.price || formData.price}
                        onChange={(e) => {
                          const newColors = [...formData.colors];
                          newColors[index].price = Number(e.target.value);
                          setFormData({ ...formData, colors: newColors });
                        }}
                        className="w-full bg-white border border-brand-pink/10 text-xs rounded-xl py-2.5 px-3 focus:outline-none font-sans"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1 flex flex-col justify-center">
                      <p className="text-[9px] text-brand-stone">قیمت نهایی با تخفیف:</p>
                      <PriceDisplay 
                        price={color.price || formData.price} 
                        discountPercentage={formData.discount_percentage} 
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const newColors = formData.colors.filter((_, i) => i !== index);
                          setFormData({ ...formData, colors: newColors });
                        }}
                        className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                        disabled={formData.colors.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assets & Meta Column */}
        <div className="space-y-6">
          {/* Image Upload Placeholder */}
          <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-brand-charcoal">تصویر اصلی محصول</h3>
            <div className="aspect-square bg-brand-cream border-2 border-dashed border-brand-pink/20 rounded-[24px] flex flex-col items-center justify-center p-4 relative group cursor-pointer overflow-hidden">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  referrerPolicy="no-referrer"
                  className="object-cover rounded-[18px]"
                />
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-brand-pink-dark/30 mb-2" />
                  <p className="text-[10px] text-brand-stone font-bold">آدرس تصویر را وارد کنید</p>
                </>
              )}
            </div>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-brand-cream border border-brand-pink/15 text-[10px] rounded-[12px] py-2.5 px-3 focus:outline-none font-sans"
              placeholder="https://..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-pink-dark hover:bg-brand-pink disabled:bg-brand-pink-dark/50 text-white font-black py-4 rounded-[20px] shadow-lg shadow-brand-pink/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'در حال ثبت...' : (initialData?.id ? 'بروزرسانی محصول' : 'انتشار محصول جدید')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-white hover:bg-brand-cream border border-brand-pink/15 text-brand-stone font-bold py-3 rounded-[20px] transition-all cursor-pointer text-xs"
            >
              انصراف و بازگشت
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

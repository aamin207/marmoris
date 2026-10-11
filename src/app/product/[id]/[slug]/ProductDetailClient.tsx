/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProductBySlugOrId, getProducts, getSlug } from '@/lib/apiClient';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, ArrowLeft, Shield, Heart, Truck, Check, RefreshCw, AlertCircle, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { PriceDisplay, toPersianNumbers, formatPrice } from '@/components/PriceDisplay';
import { ProductDetailsSkeleton } from '@/components/Skeleton';
import ProductReviews from '@/components/ProductReviews';
import { motion, AnimatePresence } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import DOMPurify from 'isomorphic-dompurify';

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

// Helper for Star Rating Render

const renderRatingStars = (ratingValue: number) => {
  const fullStars = Math.floor(ratingValue);
  const hasHalf = ratingValue % 1 >= 0.3 && ratingValue % 1 <= 0.7;
  const starsArray: React.ReactNode[] = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsArray.push(
        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
      );
    } else if (i === fullStars + 1 && hasHalf) {
      starsArray.push(
        <div key={i} className="relative w-4 h-4 text-amber-500">
          <Star className="absolute inset-0 w-4 h-4 text-brand-pink/15" />
          <div className="absolute inset-0 overflow-hidden w-1/2" dir="ltr">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
        </div>
      );
    } else {
      starsArray.push(
        <Star key={i} className="w-4 h-4 text-brand-pink/15" />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{starsArray}</div>;
};

export default function ProductDetails({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { addToCart, showToast } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Selection states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; price?: number; inStock?: boolean; stock?: number } | null>(null);
  const [selectedDec, setSelectedDec] = useState<{ id: string; name: string; image: string; additional_price: number; status: string } | null>(null);
  const [quantity, setQuantity] = useState(1);

  const publishedDecorations = useMemo(() => {
    return (product?.available_decorations || []).filter(
      (dec) => !dec.status || dec.status === 'published'
    );
  }, [product]);

  const isColorOutOfStock = (col: any) => {
    if (!col) return false;
    if (col.inStock === false || String(col.inStock) === 'false' || String(col.inStock) === '0') return true;
    if (col.stock !== undefined && col.stock !== null && Number(col.stock) <= 0) return true;
    if (col.status === 'out_of_stock' || col.status === 'unavailable') return true;
    return false;
  };

  const isCurrentVariantInStock = useMemo(() => {
    if (!product) return false;

    // Overall product level check
    if (product.inStock === false || String(product.inStock) === 'false' || String(product.inStock) === '0') {
      return false;
    }
    if (product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0) {
      return false;
    }

    // Selected color level check
    if (selectedColor && isColorOutOfStock(selectedColor)) {
      return false;
    }

    // Selected decoration level check
    if (selectedDec) {
      if (
        selectedDec.status === 'out_of_stock' ||
        (selectedDec as any).inStock === false ||
        String((selectedDec as any).inStock) === 'false' ||
        String((selectedDec as any).inStock) === '0' ||
        ((selectedDec as any).stock !== undefined && Number((selectedDec as any).stock) <= 0)
      ) {
        return false;
      }
    }

    return true;
  }, [product, selectedColor, selectedDec]);
  
  // Feedback states
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('specs');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Lightbox / Image Zoom states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imagesList = useMemo(() => {
    return product?.images && product.images.length > 0 ? product.images : (product ? [product.image] : []);
  }, [product]);

  const openLightbox = () => {
    if (!product) return;
    const idx = imagesList.indexOf(activeImage);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setIsLightboxOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imagesList.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imagesList.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (imagesList.length > 0 ? (prev - 1 + imagesList.length) % imagesList.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (imagesList.length > 0 ? (prev + 1) % imagesList.length : 0));
      }
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, imagesList]);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const prod = await getProductBySlugOrId(id);
        if (prod) {
          setProduct(prod);
          setActiveImage(prod.image);
          
          // Pre-select first size and available color (or first color)
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length > 0) {
            const firstAvailable = prod.colors.find(c => !(c.inStock === false || (c.stock !== undefined && c.stock <= 0)));
            setSelectedColor(firstAvailable || prod.colors[0]);
          }

          // Get related products
          const allProds = await getProducts(prod.categorySlug);
          setRelatedProducts(allProds.filter(p => p.id !== prod.id).slice(0, 3));
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error loading product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem('marmoris_favorites');
      if (stored) {
        const favorites = JSON.parse(stored) as string[];
        if (favorites.includes(String(product.product_id))) {
          setIsLiked(true);
        }
      }
    } catch (e) {
      console.error('Error reading favorites:', e);
    }
  }, [product]);

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4" dir="rtl">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-brand-charcoal">کالای مورد نظر یافت نشد</h2>
        <p className="text-sm text-brand-stone">ممکن است کالا حذف شده باشد یا آدرس اشتباه وارد شده باشد.</p>
        <Link
          href="/products"
          className="inline-block bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-6 py-3 rounded-[18px] transition-colors"
        >
          بازگشت به گالری محصولات
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isCurrentVariantInStock) {
      showToast('متأسفانه این محصول در حال حاضر ناموجود است.', 'error');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor || undefined, selectedDec);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-16">
      
      {/* Dynamic Navigation Path */}
      <div className="flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-2 text-xs font-medium text-brand-stone">
          <Link href="/" className="hover:text-brand-pink-dark transition-colors">خانه</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-pink-dark transition-colors">لیست محصولات</Link>
          <span>/</span>
          <span className="text-brand-pink-dark font-bold line-clamp-1 max-w-[200px]">{product.title}</span>
        </div>
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs text-brand-stone hover:text-brand-pink-dark transition-colors liquid-glass-btn px-3.5 py-2 rounded-[16px] cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>بازگشت</span>
        </button>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-start">
        
        {/* IMAGE GALLERY COLUMN (Right on RTL) */}
        <div className="lg:col-span-6 space-y-4 order-first lg:order-last">
          <div 
            onClick={openLightbox}
            className="w-full aspect-square rounded-[32px] overflow-hidden bg-brand-cream border border-brand-pink/15 relative p-4 flex items-center justify-center cursor-zoom-in group/main-img shadow-sm"
          >
            <Image
              src={activeImage}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              priority
              referrerPolicy="no-referrer"
              className="object-cover rounded-[24px] transition-transform duration-500 group-hover/main-img:scale-102 p-4"
            />
            
            {/* Zoom Button Overlay */}
            <div className="absolute inset-0 bg-brand-charcoal/5 group-hover/main-img:bg-brand-charcoal/10 transition-colors flex items-center justify-center opacity-0 group-hover/main-img:opacity-100 duration-300">
              <div className="liquid-glass text-brand-charcoal px-4 py-2.5 rounded-full shadow-lg border border-brand-pink/25 scale-90 group-hover/main-img:scale-100 transition-all duration-300 flex items-center gap-2 text-xs font-bold">
                <ZoomIn className="w-4 h-4 text-brand-pink-dark" />
                <span>بزرگنمایی تصویر</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!product) return;
                const nextVal = !isLiked;
                setIsLiked(nextVal);
                try {
                  const stored = localStorage.getItem('marmoris_favorites');
                  let favorites: string[] = stored ? JSON.parse(stored) : [];
                  if (nextVal) {
                    if (!favorites.includes(String(product.product_id))) {
                      favorites.push(String(product.product_id));
                    }
                  } else {
                    favorites = favorites.filter(id => id !== String(product.product_id));
                  }
                  localStorage.setItem('marmoris_favorites', JSON.stringify(favorites));
                } catch (err) {
                  console.error('Error writing favorites:', err);
                }
              }}
              className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full liquid-glass-btn text-brand-stone flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-brand-stone/40'}`} />
            </button>
          </div>

          {/* Thumbnail Gallery Row with Swiper */}
          {product.images && product.images.length > 1 && (
            <div className="w-full">
              <Swiper
                dir="rtl"
                slidesPerView="auto"
                spaceBetween={10}
                className="w-full"
              >
                {product.images.map((img, idx) => (
                  <SwiperSlide key={idx} className="!w-20">
                    <button
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 bg-brand-cream border rounded-[18px] overflow-hidden p-1 transition-all cursor-pointer flex-shrink-0 relative ${
                        activeImage === img 
                          ? 'border-brand-pink-dark scale-105 shadow-md shadow-brand-pink/20 ring-1 ring-brand-pink-dark' 
                          : 'border-brand-pink/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.title} - تصویر بندانگشتی ${idx + 1}`} fill sizes="80px" referrerPolicy="no-referrer" className="object-cover rounded-[14px] p-1" />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* CONFIGURATION COLUMN (Left on RTL) */}
        <div className="lg:col-span-6 space-y-6 text-right" dir="rtl">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-block bg-brand-pink-light border border-brand-pink/25 text-brand-pink-dark text-xs font-bold px-3 py-1.5 rounded-full font-sans">
                {product.category}
              </span>
              
              {!isCurrentVariantInStock ? (
                <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-bold px-3 py-1 rounded-full font-sans shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>ناموجود در انبار</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold px-3 py-1 rounded-full font-sans shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>موجود در انبار مرموریس</span>
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-3xl font-bold text-brand-charcoal leading-snug">{product.title}</h1>
            
            {/* Stars Row */}
            <div className="flex items-center gap-1.5 text-amber-500 justify-start pt-1">
              {renderRatingStars(product.rating?.rate ?? 0)}
              <span className="text-xs font-bold text-brand-charcoal font-sans mr-1">
                {toPersianNumbers(product.rating?.rate ?? 0)}
              </span>
              <span className="text-xs text-brand-stone/60 font-sans">
                ({toPersianNumbers(product.rating?.count ?? 0)} نظر خریداران)
              </span>
            </div>
          </div>

          <hr className="border-brand-pink/10" />

          {/* Price Tag */}
          <div className="space-y-2">
            <p className="text-[11px] text-brand-stone/60">قیمت نهایی کالا با احتساب تزیینات و مالیات</p>
            {product.discount_percentage && product.discount_percentage > 0 ? (
              <div className="flex flex-col gap-1 text-right" dir="rtl">
                <div className="flex items-center gap-2">
                  <span className="line-through text-brand-stone/50 text-[10px] md:text-xs font-sans">
                    {formatPrice((selectedColor?.price || product.price) + (selectedDec?.additional_price || 0))}
                  </span>
                  <span className="bg-rose-500 text-white text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm font-sans">
                    {toPersianNumbers(product.discount_percentage)}٪ تخفیف
                  </span>
                </div>
                <span className="font-black text-brand-charcoal font-sans text-xl md:text-2xl">
                  {formatPrice(((selectedColor?.price || product.price) - ((selectedColor?.price || product.price) * product.discount_percentage / 100)) + (selectedDec?.additional_price || 0))}
                </span>
              </div>
            ) : (
              <span className="font-bold text-brand-charcoal text-lg md:text-xl font-sans block">
                {formatPrice((selectedColor?.price || product.price) + (selectedDec?.additional_price || 0))}
              </span>
            )}
          </div>

          <hr className="border-brand-pink/10" />

          {/* Small description snippet */}
          <div 
            className="text-xs md:text-sm text-brand-stone leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || '') }}
          />

          <hr className="border-brand-pink/10" />

          {/* Custom Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
            
            {/* Color Swatch Picker (Flex Wrap multi-row) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5 w-full">
                <span className="text-xs font-bold text-brand-charcoal block">انتخاب رنگ / مدل:</span>
                <div className="flex flex-wrap gap-2.5 items-center py-1">
                  {product.colors.map((col, idx) => {
                    const isSelected = selectedColor?.name === col.name;
                    const outOfStock = isColorOutOfStock(col);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(col)}
                        style={{ backgroundColor: col.hex }}
                        aria-label={`رنگ ${col.name}`}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 relative cursor-pointer flex items-center justify-center transition-all shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.25)] focus-visible:ring-2 focus-visible:ring-brand-pink-dark focus-visible:outline-none ${
                          isSelected
                            ? 'ring-2 ring-brand-pink-dark scale-110 border-white'
                            : 'border-brand-pink/30 hover:scale-105'
                        } ${outOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title={`${col.name}${outOfStock ? ' (ناموجود)' : ''}`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white drop-shadow-lg stroke-[3px]" />
                        )}
                        {outOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-full h-0.5 bg-rose-500 rotate-45 transform origin-center rounded-full"></span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-brand-stone/60">
                    رنگ انتخابی: <span className="text-brand-charcoal font-bold">{selectedColor?.name || 'انتخاب نشده'}</span>
                  </p>
                  {selectedColor && isColorOutOfStock(selectedColor) && (
                    <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-xl shadow-2xs">
                      متاسفانه رنگ {selectedColor.name} در حال حاضر موجود نیست.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Size Selector Box */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={`space-y-2 ${selectedColor && isColorOutOfStock(selectedColor) ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className="text-xs font-bold text-brand-charcoal">انتخاب سایز کالا:</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz, idx) => (
                    <button
                      key={idx}
                      disabled={selectedColor ? isColorOutOfStock(selectedColor) : false}
                      onClick={() => setSelectedSize(sz)}
                      aria-label={`سایز ${sz}`}
                      className={`min-w-[44px] min-h-[44px] text-xs font-bold px-4 py-2 rounded-[14px] border transition-all cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-pink-dark focus-visible:outline-none ${
                        selectedSize === sz
                          ? 'bg-brand-pink-light border-brand-pink text-brand-pink-dark'
                          : 'bg-white border-brand-pink/15 text-brand-stone hover:text-brand-pink-dark hover:bg-brand-cream'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* تزیینات جانبی و شخصی‌سازی کیف */}
          {publishedDecorations.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-brand-charcoal block">تزیینات جانبی و شخصی‌سازی کیف (اختیاری):</span>
              <div className="flex flex-wrap gap-3">
                {/* گزینه پیش‌فرض: بدون تزیین */}
                <button
                  onClick={() => setSelectedDec(null)}
                  className={`flex flex-col items-center justify-center p-3 border rounded-2xl cursor-pointer transition-all min-w-[100px] text-center ${
                    !selectedDec 
                      ? 'border-brand-pink bg-brand-pink-light text-brand-pink-dark font-bold shadow-sm' 
                      : 'border-brand-pink/15 bg-white text-brand-stone hover:border-brand-pink/40 hover:bg-brand-cream'
                  }`}
                >
                  <span className="text-xs font-bold block">بدون تزیین</span>
                  <span className="text-[10px] text-brand-stone/60 block mt-1">(ساده)</span>
                </button>

                {/* لیست تزیینات فعال محصول */}
                {publishedDecorations.map((dec) => {
                  const isSelected = selectedDec?.id === dec.id;
                  const isDecOutOfStock = dec.status === 'out_of_stock' || (dec as any).inStock === false || ((dec as any).stock !== undefined && (dec as any).stock <= 0);
                  return (
                    <button
                      key={dec.id}
                      onClick={() => setSelectedDec(dec)}
                      className={`flex items-center gap-3 p-2.5 border rounded-2xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-brand-pink bg-brand-pink-light text-brand-pink-dark font-bold shadow-sm' 
                          : 'border-brand-pink/15 bg-white text-brand-stone hover:border-brand-pink/40 hover:bg-brand-cream'
                      } ${isDecOutOfStock ? 'opacity-65' : ''}`}
                    >
                      {dec.image && (
                        <Image 
                          src={dec.image} 
                          alt={dec.name} 
                          width={40}
                          height={40}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-xl border border-brand-pink/10 bg-white" 
                        />
                      )}
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs">{dec.name}</p>
                          {isDecOutOfStock && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-md">ناموجود</span>
                          )}
                        </div>
                        <p className="text-[10px] text-brand-stone/60 mt-0.5">
                          +{formatPrice(dec.additional_price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart & Quantity Selector Row */}
          <div className="flex items-center gap-4 pt-4">
            
            {/* Quantity +/- Box */}
            <div className={`flex items-center bg-brand-cream border border-brand-pink/20 rounded-[18px] p-1 h-12 ${
              !isCurrentVariantInStock ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <button
                onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                disabled={!isCurrentVariantInStock}
                className="w-10 h-10 flex items-center justify-center text-brand-stone hover:text-brand-pink-dark transition-all rounded-[14px] hover:bg-brand-pink/10 cursor-pointer font-bold disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-bold text-brand-charcoal font-sans">
                {toPersianNumbers(quantity)}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                disabled={!isCurrentVariantInStock}
                className="w-10 h-10 flex items-center justify-center text-brand-stone hover:text-brand-pink-dark transition-all rounded-[14px] hover:bg-brand-pink/10 cursor-pointer font-bold disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            {/* Main ADD to CART button */}
            <button
              onClick={handleAddToCart}
              disabled={!isCurrentVariantInStock}
              className={`flex-1 font-bold h-12 rounded-full transition-all flex items-center justify-center gap-2 text-xs md:text-sm ${
                !isCurrentVariantInStock
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed shadow-none'
                  : 'liquid-glass-btn-accent cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {!isCurrentVariantInStock 
                ? (selectedColor && (selectedColor.inStock === false || (selectedColor.stock !== undefined && selectedColor.stock <= 0)) ? `رنگ ${selectedColor.name} ناموجود است` : 'این رنگ ناموجود است') 
                : 'افزودن به سبد خرید مرموریس'}
            </button>
          </div>

          {/* Trust assurances block */}
          <div className="grid grid-cols-3 gap-3 pt-6 text-center text-[10px] text-brand-stone">
            <div className="space-y-1.5 p-3.5 liquid-glass rounded-[20px]">
              <Shield className="w-4 h-4 mx-auto text-brand-pink-dark" />
              <p className="font-bold text-brand-charcoal">تضمین اصالت کالا</p>
            </div>
            <div className="space-y-1.5 p-3.5 liquid-glass rounded-[20px]">
              <Truck className="w-4 h-4 mx-auto text-brand-pink-dark" />
              <p className="font-bold text-brand-charcoal">ارسال اکسپرس بیمه‌دار</p>
            </div>
            <div className="space-y-1.5 p-3.5 liquid-glass rounded-[20px]">
              <RefreshCw className="w-4 h-4 mx-auto text-brand-pink-dark" />
              <p className="font-bold text-brand-charcoal">امکان تعویض بی دردسر</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Specifications vs Description */}
      <section className="bg-white border border-brand-pink/15 rounded-[32px] p-6 md:p-8 space-y-6 text-right">
        
        {/* Tab Selection Row */}
        <div className="flex border-b border-brand-pink/10 pb-2 gap-4">
          {/* 
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-xs md:text-sm font-bold pb-2.5 px-2 cursor-pointer transition-all border-b-2 ${
              activeTab === 'desc' ? 'border-brand-pink-dark text-brand-pink-dark' : 'border-transparent text-brand-stone hover:text-brand-pink-dark'
            }`}
          >
            نقد و بررسی تخصصی کالا
          </button>
          */}
          <button
            onClick={() => setActiveTab('specs')}
            className={`text-xs md:text-sm font-bold pb-2.5 px-2 cursor-pointer transition-all border-b-2 ${
              activeTab === 'specs' ? 'border-brand-pink-dark text-brand-pink-dark' : 'border-transparent text-brand-stone hover:text-brand-pink-dark'
            }`}
          >
            مشخصات فنی و جزئیات دوخت
          </button>
        </div>

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Using the specifications field now */}
            {product.specifications && product.specifications.length > 0 ? (
              product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between p-3.5 bg-brand-cream rounded-[16px] border border-brand-pink/10">
                  <span className="text-brand-stone font-bold">{spec.key}</span>
                  <span className="text-brand-charcoal font-sans">{spec.value}</span>
                </div>
              ))
            ) : (
              <p className="text-brand-stone">مشخصات فنی برای این محصول تعریف نشده است.</p>
            )}
          </div>
        )}
      </section>

      {/* Product Reviews Section */}
      <ProductReviews productId={product.id} />

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8" dir="rtl">
          <h2 className="text-xl font-bold text-brand-charcoal tracking-wide border-r-4 border-brand-pink-dark pr-2 font-sans">کالاهای هم‌خانواده پیشنهادی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Floating alert toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed bottom-10 left-10 bg-brand-pink-dark text-white px-6 py-4 rounded-[20px] text-xs font-bold border border-brand-pink/25 z-50 shadow-2xl flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4.5 h-4.5 bg-white text-brand-pink-dark rounded-full p-0.5" />
              <span>محصول با موفقیت به سبد خرید مرموریس اضافه شد.</span>
            </div>
            <Link
              href="/cart"
              className="bg-white/15 hover:bg-white text-white hover:text-brand-pink-dark px-3 py-1.5 rounded-xl border border-white/20 hover:border-white text-[11px] font-black transition-all"
            >
              برو به سبد خرید
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox / Zoom Gallery Overlay Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-charcoal/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between w-full max-w-6xl mx-auto" dir="rtl">
              <div className="text-white text-right">
                <h4 className="text-sm md:text-base font-bold line-clamp-1">{product.title}</h4>
                <p className="text-[10px] md:text-xs text-brand-beige/60 font-sans" dir="ltr">
                  {toPersianNumbers(lightboxIndex + 1)} / {toPersianNumbers(imagesList.length)}
                </p>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl cursor-pointer transition-colors border border-white/10 shadow-lg"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Stage with Navigation */}
            <div className="relative flex-1 flex items-center justify-center my-4 max-w-6xl mx-auto w-full">
              {/* Prev Button */}
              {imagesList.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute right-0 md:-right-6 z-10 bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-2xl cursor-pointer transition-colors shadow-lg"
                  title="قبلی"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Central Image with scale/zoom transition */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-h-[60vh] md:max-h-[70vh] aspect-square rounded-[24px] overflow-hidden bg-brand-cream p-2 flex items-center justify-center shadow-2xl relative w-full h-full min-w-[280px] min-h-[280px]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={imagesList[lightboxIndex]}
                  alt={`${product.title} - تصویر گالری بزرگ`}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  referrerPolicy="no-referrer"
                  className="object-contain rounded-[18px] p-2"
                />
              </motion.div>

              {/* Next Button */}
              {imagesList.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute left-0 md:-left-6 z-10 bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-2xl cursor-pointer transition-colors shadow-lg"
                  title="بعدی"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {imagesList.length > 1 && (
              <div className="w-full max-w-xl mx-auto pb-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 overflow-x-auto justify-center py-2 px-1 scrollbar-none">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`w-14 h-14 bg-brand-cream border rounded-[12px] overflow-hidden p-0.5 transition-all cursor-pointer flex-shrink-0 relative ${
                        lightboxIndex === idx
                          ? 'border-brand-pink ring-2 ring-brand-pink scale-105'
                          : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.title} - تصویر گالری ${idx + 1}`} fill sizes="56px" referrerPolicy="no-referrer" className="object-cover rounded-[8px] p-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

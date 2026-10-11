/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { getCategories, getFeaturedProducts, getProducts, getSliders, getBlogPosts, getFaqs, getSlug, getBanners } from '@/lib/apiClient';
import { Category, Product, Slider, BlogPost, FAQ, Banner } from '@/types';
import { SliderSkeleton, CategorySkeleton, ProductSkeleton } from '@/components/Skeleton';
import ProductCard from '@/components/ProductCard';
import { toPersianNumbers } from '@/components/PriceDisplay';
import { motion, AnimatePresence } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';

const getStepMarginClass = (index: number) => {
  const classes = [
    'mr-0',
    'mr-0 md:mr-[24px]',
    'mr-0 md:mr-[48px]',
    'mr-0 md:mr-[72px]',
    'mr-0 md:mr-[96px]',
  ];
  return classes[index] || 'mr-0';
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSliders, setLoadingSliders] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const [productSwiper, setProductSwiper] = useState<any>(null);
  const [specialSwiper, setSpecialSwiper] = useState<any>(null);
  const [blogSwiper, setBlogSwiper] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories();
        // Only show parent categories (those without parent)
        const parents = cats.filter(cat => !cat.parent);
        setCategories(parents);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCats(false);
      }

      try {
        // Use real products list first few instead of featured mock data
        const prods = await getProducts();
        if (prods && prods.length > 0) {
          setFeaturedProducts(prods.slice(0, 8));
          
          // Find products that are EITHER featured OR have active discounts (originalPrice > price or discount_percentage > 0)
          const discountedAndFeatured = prods.filter(p => 
            p.featured || 
            ((p.originalPrice && p.originalPrice > p.price) || (p.discount_percentage && p.discount_percentage > 0))
          );
          setDiscountedProducts(discountedAndFeatured);
        } else {
          const featured = await getFeaturedProducts();
          setFeaturedProducts(featured);
          
          const discountedAndFeatured = featured.filter(p => 
            p.featured || 
            ((p.originalPrice && p.originalPrice > p.price) || (p.discount_percentage && p.discount_percentage > 0))
          );
          setDiscountedProducts(discountedAndFeatured);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }

      try {
        const slides = await getSliders();
        if (slides && Array.isArray(slides) && slides.length > 0) {
          setSliders(slides);
        } else {
          setSliders([]);
        }
      } catch (err) {
        console.error('Error fetching sliders:', err);
        setSliders([]);
      } finally {
        setLoadingSliders(false);
      }

      try {
        const b = await getBanners();
        if (b && Array.isArray(b)) {
          setBanners(b);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setBanners([]);
      } finally {
        setLoadingBanners(false);
      }


      try {
        const blogs = await getBlogPosts();
        setBlogPosts(blogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoadingBlogs(false);
      }

      try {
        const faqList = await getFaqs();
        setFaqs(faqList);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      } finally {
        setLoadingFaqs(false);
      }
    }
    loadData();
  }, []);

  // Slider Autoplay
  useEffect(() => {
    if (sliders.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliders.length);
    }, 6000);
  
    return () => clearInterval(timer);
  }, [sliders.length]);

  const nextSlide = () => {
    if (sliders.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    if (sliders.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 340; // Card width + gaps approx
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const currentSlide = sliders[activeSlide] || null;
  const slideBadge = currentSlide?.title?.includes('کیف') ? 'کالکشن کیف' : currentSlide?.title?.includes('زیورآلات') ? 'زیورآلات و اکسسوری' : 'کالکشن جدید';
  const slideDesc = currentSlide?.subtitle || 'مجموعه‌ای متمایز از محصولات مرموریس با تمرکز بر کیفیت، سادگی و کاربرد روزمره.';

  const bagBanner = useMemo(() => banners.find(b => b.key === 'bag_banner') || banners[0] || null, [banners]);
  const jewelryBanner = useMemo(() => banners.find(b => b.key === 'jewelry_banner') || banners[1] || null, [banners]);


  return (
    <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* 1. Hero Luxury Slider */}
      <section className="relative">
        <div className="relative w-full aspect-[16/11] sm:aspect-[16/8] md:aspect-[21/9] min-h-[290px] sm:min-h-[380px] md:min-h-[420px] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-brand-pink/15 shadow-md bg-white flex items-center">
          {loadingSliders && sliders.length === 0 ? (
            <SliderSkeleton />
          ) : currentSlide ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Full-bleed hero banner image */}
                <Image
                  src={currentSlide.image || currentSlide.featured_image || currentSlide.url || ''}
                  alt={currentSlide.title || "اسلاید شو مرموریس"}
                  fill
                  sizes="100vw"
                  priority
                  referrerPolicy="no-referrer"
                  className="object-cover object-center sm:object-[center_35%]"
                />

                {/* Glassmorphic Text Overlay - Tight Inline Wrappers Following Text Length */}
                <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 md:right-10 flex flex-col items-start justify-center text-right space-y-2 sm:space-y-3 max-w-[85%] sm:max-w-md md:max-w-xl z-10" dir="rtl">
                  
                  <span className="inline-flex items-center gap-1.5 bg-white/85 sm:bg-white/70 border border-brand-pink/25 text-brand-pink-dark text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full font-sans shadow-sm backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-brand-pink-dark" />
                    {slideBadge}
                  </span>

                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight">
                    <span className="inline-block bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-md px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-2xl sm:rounded-3xl">
                      {currentSlide.title || 'کالکشن جدید گالری مرموریس'}
                    </span>
                  </h1>

                  {currentSlide.subtitle && (
                    <h2 className="text-xs sm:text-base md:text-lg font-bold text-brand-pink-dark">
                      <span className="inline-block bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl">
                        {currentSlide.subtitle}
                      </span>
                    </h2>
                  )}

                  {slideDesc && (
                    <p className="text-[11px] sm:text-xs md:text-sm text-brand-stone font-medium leading-relaxed max-w-lg">
                      <span className="inline-block bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl line-clamp-2 sm:line-clamp-none">
                        {slideDesc}
                      </span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                    <Link
                      href={currentSlide.link || '/products'}
                      className="bg-brand-pink-dark hover:bg-brand-pink text-white text-xs md:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-[18px] sm:rounded-[20px] transition-all shadow-lg shadow-brand-pink/20 flex items-center gap-2 cursor-pointer"
                    >
                      شروع خرید کـالکشن
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/products"
                      className="bg-white/85 hover:bg-white backdrop-blur-md text-brand-charcoal text-xs md:text-sm font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-[18px] sm:rounded-[20px] border border-white/60 transition-all cursor-pointer shadow-sm"
                    >
                      همه محصولات
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-cream/30">
              <span className="text-xs text-brand-stone">در حال بارگذاری اسلایدرها...</span>
            </div>
          )}

          {/* Slider Controllers */}
          {sliders.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/80 hover:bg-white border border-brand-pink/15 shadow-sm rounded-full text-brand-stone hover:text-brand-pink-dark transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/80 hover:bg-white border border-brand-pink/15 shadow-sm rounded-full text-brand-stone hover:text-brand-pink-dark transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {sliders.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeSlide === index ? 'w-6 bg-brand-pink-dark' : 'w-2 bg-brand-stone/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* New full-width Banner 1 (under main hero slider) */}
      {bagBanner && bagBanner.image && bagBanner.is_active !== false && (
      <section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 aspect-[16/10] sm:aspect-[16/7] md:aspect-[21/9] min-h-[220px] sm:min-h-[260px] md:min-h-[300px] group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src={bagBanner.image}
          alt={bagBanner.title || "بنر گالری مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover object-center sm:object-[center_35%] transition-transform duration-[1200ms] group-hover:scale-105"
        />
        {(bagBanner.title || bagBanner.subtitle || bagBanner.description || bagBanner.button_text) && (
          <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 md:right-10 flex flex-col items-start justify-center space-y-2 sm:space-y-2.5 max-w-[85%] sm:max-w-md md:max-w-lg text-right z-10">
            {bagBanner.subtitle && (
              <span className="inline-flex items-center gap-1.5 bg-white/85 sm:bg-white/70 backdrop-blur-md text-brand-pink-dark border border-brand-pink/20 text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full font-sans shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-pink-dark" />
                {bagBanner.subtitle}
              </span>
            )}
            {bagBanner.title && (
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-brand-charcoal leading-tight">
                <span className="inline-block bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-md px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl">
                  {bagBanner.title}
                </span>
              </h3>
            )}
            {(bagBanner.description || (bagBanner.subtitle && !bagBanner.title)) && (
              <p className="text-[11px] sm:text-xs md:text-sm text-brand-stone font-medium leading-relaxed max-w-lg">
                <span className="inline-block bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-md px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl">
                  {bagBanner.description || bagBanner.subtitle}
                </span>
              </p>
            )}
            {bagBanner.button_text && (
              <div className="pt-1">
                <Link href={bagBanner.link || '/products'} className="inline-flex items-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-5 py-2.5 rounded-[16px] transition-all shadow-md">
                  {bagBanner.button_text}
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
      )}

      {/* 2. Categories Circular Navigation (Minimalist Dense Row) */}
      <section className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center border-b border-brand-pink/10 pb-3">
          <h2 className="text-lg md:text-xl font-bold text-brand-charcoal">
            دسته‌بندی‌های گالری مرموریس
          </h2>
          <span className="text-xs text-brand-stone font-sans">
            کشف جزئیات استایل اصیل
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-12 py-2">
          {loadingCats ? (
            Array(3)
              .fill(0)
              .map((_, i) => <CategorySkeleton key={i} />)
          ) : categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group flex flex-col items-center space-y-2 cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-brand-pink/15 bg-white p-0.5 group-hover:border-brand-pink shadow-sm transition-all duration-300 relative">
                  <Image
                    src={cat.image}
                    alt={cat.name || "دسته‌بندی مرموریس"}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    referrerPolicy="no-referrer"
                    className="object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                </div>
                <h3 className="text-[11px] sm:text-xs font-bold text-brand-stone group-hover:text-brand-pink-dark transition-colors text-center whitespace-nowrap">
                  {cat.name}
                </h3>
              </Link>
            ))
          ) : (
            <div className="text-xs text-brand-stone py-4 text-center font-bold">
              دسته‌بندی ثبت نشده است.
            </div>
          )}
        </div>
      </section>

      {/* New Bold and Distinct "Specials" (ویژه‌ها) Section */}
      <section className="bg-gradient-to-br from-[#FEDFDF]/40 via-white to-rose-50/60 border border-brand-pink/25 rounded-[36px] p-6 md:p-10 space-y-8 relative overflow-hidden animate-fade-in" dir="rtl">
        {/* Decorative ambient glowing sphere */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-rose-500/10">
          <div className="space-y-1.5 text-right">
            <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 text-[11px] font-bold px-3 py-1.5 rounded-full font-sans">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              پیشنهادهای شگفت‌انگیز مرموریس
            </span>
            <h2 className="text-xl md:text-3xl font-black text-brand-charcoal flex items-center gap-2">
              ویژه‌ها و آفرهای شگفت‌انگیز مرموریس
            </h2>
            <p className="text-xs text-brand-stone font-medium">
              مجموعه‌ای متمایز از برترین محصولات با تخفیف‌های ویژه و محدود
            </p>
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => specialSwiper?.slidePrev()}
                className="p-2 rounded-full border border-rose-500/15 hover:border-rose-500/45 hover:text-rose-600 text-brand-stone bg-white shadow-sm transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => specialSwiper?.slideNext()}
                className="p-2 rounded-full border border-rose-500/15 hover:border-rose-500/45 hover:text-rose-600 text-brand-stone bg-white shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/products"
              className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-500/10"
            >
              کالکشن تخفیف‌دار
            </Link>
          </div>
        </div>

        <div className="w-full relative">
          <Swiper
            onSwiper={setSpecialSwiper}
            dir="rtl"
            slidesPerView="auto"
            spaceBetween={24}
            className="w-full"
          >
            {loadingProducts ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <SwiperSlide key={i} className="!w-[245px] sm:!w-[320px]">
                    <ProductSkeleton />
                  </SwiperSlide>
                ))
            ) : discountedProducts.length > 0 ? (
              discountedProducts.map((prod) => (
                <SwiperSlide key={`special-${prod.id}`} className="!w-[245px] sm:!w-[320px] pb-2">
                  <ProductCard product={prod} isSpecial={true} />
                </SwiperSlide>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-brand-stone font-bold w-full">
                در حال حاضر محصول ویژه‌ای ثبت نشده است.
              </div>
            )}
          </Swiper>
        </div>
      </section>

      {/* New full-width Banner 2 (under products carousel) */}
      {jewelryBanner && jewelryBanner.image && jewelryBanner.is_active !== false && (
      <section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 aspect-[16/10] sm:aspect-[16/7] md:aspect-[21/9] min-h-[220px] sm:min-h-[260px] md:min-h-[300px] group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src={jewelryBanner.image}
          alt={jewelryBanner.title || "بنر گالری مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover object-center sm:object-[center_35%] transition-transform duration-[1200ms] group-hover:scale-105"
        />
        {(jewelryBanner.title || jewelryBanner.subtitle || jewelryBanner.description || jewelryBanner.button_text) && (
          <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 md:right-10 flex flex-col items-start justify-center space-y-2 sm:space-y-2.5 max-w-[85%] sm:max-w-md md:max-w-lg text-right z-10">
            {jewelryBanner.subtitle && (
              <span className="inline-flex items-center gap-1.5 bg-white/85 sm:bg-white/70 backdrop-blur-md text-brand-pink-dark border border-brand-pink/20 text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full font-sans shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-pink-dark" />
                {jewelryBanner.subtitle}
              </span>
            )}
            {jewelryBanner.title && (
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-brand-charcoal leading-tight">
                <span className="inline-block bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-md px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl">
                  {jewelryBanner.title}
                </span>
              </h3>
            )}
            {(jewelryBanner.description || (jewelryBanner.subtitle && !jewelryBanner.title)) && (
              <p className="text-[11px] sm:text-xs md:text-sm text-brand-stone font-medium leading-relaxed max-w-lg">
                <span className="inline-block bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-md px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl">
                  {jewelryBanner.description || jewelryBanner.subtitle}
                </span>
              </p>
            )}
            {jewelryBanner.button_text && (
              <div className="pt-1">
                <Link href={jewelryBanner.link || '/products'} className="inline-flex items-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-5 py-2.5 rounded-[16px] transition-all shadow-md">
                  {jewelryBanner.button_text}
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
      )}

      {/* 3. Featured Showcase Carousel */}
      <section className="space-y-6" dir="rtl">
        <div className="flex justify-between items-end gap-3 pb-2 border-b border-brand-pink/10">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold text-brand-charcoal">
              پرطرفدارترین‌های مرموریس
            </h2>
            <p className="text-xs text-brand-stone">
              کالکشن مینی‌مال مرموریس با کیفیت ساخت و طراحی متناسب
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => productSwiper?.slidePrev()}
                className="p-1.5 rounded-full border border-brand-pink/15 hover:border-brand-pink/40 hover:text-brand-pink-dark text-brand-stone bg-white shadow-sm transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => productSwiper?.slideNext()}
                className="p-1.5 rounded-full border border-brand-pink/15 hover:border-brand-pink/40 hover:text-brand-pink-dark text-brand-stone bg-white shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/products"
              className="text-xs text-brand-pink-dark hover:text-brand-pink font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              مشاهده همه محصولات
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="w-full relative">
          <Swiper
            onSwiper={setProductSwiper}
            dir="rtl"
            slidesPerView="auto"
            spaceBetween={24}
            className="w-full"
          >
            {loadingProducts ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <SwiperSlide key={i} className="!w-[245px] sm:!w-[320px]">
                    <ProductSkeleton />
                  </SwiperSlide>
                ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((prod) => (
                <SwiperSlide key={prod.id} className="!w-[245px] sm:!w-[320px] pb-2">
                  <ProductCard product={prod} />
                </SwiperSlide>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-brand-stone font-bold w-full">
                در حال حاضر محصول پرطرفداری ثبت نشده است.
              </div>
            )}
          </Swiper>
        </div>
      </section>

      {/* 4. Luxury Blog Carousel (Directly Under Products) */}
      <section className="space-t-6" dir="rtl">
        <div className="flex justify-between items-end gap-3 pb-2 border-b border-brand-pink/10">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold text-brand-charcoal">
              آخرین مطالب وبلاگ و دانستنی‌ها
            </h2>
            <p className="text-xs text-brand-stone">
              اصول ست کردن اکسسوری‌ها، راهنمای نگهداری محصولات و دنیای مد مینی‌مال
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => blogSwiper?.slidePrev()}
                className="p-1.5 rounded-full border border-brand-pink/15 hover:border-brand-pink/40 hover:text-brand-pink-dark text-brand-stone bg-white shadow-sm transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => blogSwiper?.slideNext()}
                className="p-1.5 rounded-full border border-brand-pink/15 hover:border-brand-pink/40 hover:text-brand-pink-dark text-brand-stone bg-white shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/blog"
              className="text-xs text-brand-pink-dark hover:text-brand-pink font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              مشاهده همه مقالات
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="w-full relative">
          <Swiper
            onSwiper={setBlogSwiper}
            dir="rtl"
            slidesPerView="auto"
            spaceBetween={24}
            className="w-full"
          >
            {loadingBlogs ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <SwiperSlide key={i} className="!w-[245px] sm:!w-[320px]">
                    <div className="bg-white border border-brand-pink/10 rounded-[24px] overflow-hidden flex flex-col h-[380px] shadow-sm animate-pulse">
                      <div className="aspect-[16/10] bg-brand-cream/60 w-full" />
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="h-3 w-1/3 bg-brand-cream rounded-full" />
                          <div className="h-4 w-5/6 bg-brand-cream rounded-full" />
                          <div className="h-3.5 w-2/3 bg-brand-cream rounded-full" />
                        </div>
                        <div className="h-3 w-1/4 bg-brand-cream rounded-full pt-2" />
                      </div>
                    </div>
                  </SwiperSlide>
                ))
            ) : blogPosts.length > 0 ? (
              blogPosts.map((post) => {
                const blogUrl = `/blog/${post.id}/${getSlug(post.title)}`;
                return (
                  <SwiperSlide key={post.id} className="!w-[245px] sm:!w-[320px] pb-2">
                    <article className="group bg-white border border-brand-pink/15 rounded-[24px] overflow-hidden flex flex-col h-[380px] shadow-md shadow-brand-pink/5 hover:shadow-lg hover:border-brand-pink/35 transition-all duration-300">
                      {/* Post Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream">
                        <Image
                          src={post.featured_image || post.image || '/logo.png'}
                          alt={post.title || "نوشته وبلاگ مرموریس"}
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          referrerPolicy="no-referrer"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {/* Post Body */}
                      <div className="p-5 flex flex-col flex-1 space-y-3 justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-[10px] text-brand-stone/60">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>
                              {typeof post.author === 'object' && post.author !== null 
                                ? (post.author.full_name || post.author.name || 'مدیریت مرموریس') 
                                : (post.author || 'مدیریت مرموریس')}
                            </span>
                          </div>
                          <h3 className="font-bold text-brand-charcoal text-sm leading-snug line-clamp-2 group-hover:text-brand-pink-dark transition-colors duration-200">
                            {post.title}
                          </h3>
                          <p className="text-[11px] text-brand-stone leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-brand-cream">
                          <Link
                            href={blogUrl}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-pink-dark hover:text-brand-pink transition-colors cursor-pointer"
                          >
                            مطالعه کامل مطلب
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </SwiperSlide>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-brand-stone font-bold w-full">
                مطلبی در وبلاگ موجود نیست.
              </div>
            )}
          </Swiper>
        </div>
      </section>

      {/* 6. FAQ Accordion Stepped Section */}
      <section className="space-y-8" dir="rtl">
        <div className="text-center space-y-2 border-b border-brand-pink/10 pb-4">
          <h2 className="text-lg md:text-xl font-bold text-brand-charcoal">
            پاسخ به سوالات متداول شما
          </h2>
          <p className="text-xs text-brand-stone">
            پاسخ به پرتکرارترین پرسش‌های شما درباره محصولات، نحوه ارسال و اصالت برند مرموریس
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {loadingFaqs ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-16 rounded-[24px] bg-brand-cream/40 animate-pulse" />
              ))
          ) : faqs.length > 0 ? (
            faqs.slice(0, 5).map((faq, index) => {
              const isOpen = openFaq === faq.id;
              const stepMargin = getStepMarginClass(index);
              return (
                <div
                  key={faq.id}
                  className={`border border-brand-pink/15 bg-white rounded-[24px] overflow-hidden shadow-sm transition-all duration-300 ${stepMargin}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full text-right p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-brand-cream/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Numeric Badge (Stepped) */}
                      <span className="w-7 h-7 rounded-full bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark flex items-center justify-center font-bold text-xs font-sans">
                        {toPersianNumbers(index + 1)}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-brand-charcoal">
                        {faq.question}
                      </span>
                    </div>
                    <span className="text-brand-pink-dark font-sans font-bold text-base md:text-lg">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 md:px-6 md:pb-6 pr-16 text-xs sm:text-sm text-brand-stone leading-relaxed border-t border-brand-cream pt-4 bg-brand-cream/10">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-brand-stone font-bold">
              سوال متداولی ثبت نشده است.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

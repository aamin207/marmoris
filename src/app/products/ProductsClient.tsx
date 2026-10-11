/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect, ChangeEvent, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCategories } from '@/lib/apiClient';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import { toPersianNumbers, formatPrice } from '@/components/PriceDisplay';
import { ProductSkeleton } from '@/components/Skeleton';
import { SlidersHorizontal, Search, ArrowUpDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // States for filters (robust fallback parsing for hydration safety)
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const cat = searchParams.get('category');
    return (cat && cat !== 'undefined' && cat !== 'null') ? cat : 'all';
  });
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const s = searchParams.get('search');
    return (s && s !== 'undefined' && s !== 'null') ? s : '';
  });

  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState<number>(50000000);

  // Update states if query params change
  useEffect(() => {
    let cat = searchParams.get('category') || 'all';
    if (cat === 'undefined' || cat === 'null') cat = 'all';
    
    let s = searchParams.get('search') || '';
    if (s === 'undefined' || s === 'null') s = '';

    setCategoryFilter(cat);
    setSearchQuery(s);
  }, [searchParams]);

  // Use Infinite Scroll Hook for products fetching
  const {
    products,
    loadingInitial,
    loadingMore,
    error,
    hasMore,
    totalProducts,
    retry,
    targetRef,
  } = useInfiniteProducts({
    categoryFilter,
    searchQuery,
    sortBy,
    priceRange,
    limit: 12,
  });

  // Derive dynamic max price based on actual products
  const maxProductPrice = useMemo(() => {
    if (!products || products.length === 0) return 50000000;
    const maxInList = Math.max(...products.map((p) => p.price || 0));
    return maxInList > 0 ? Math.max(50000000, Math.ceil(maxInList / 1000000) * 1000000) : 50000000;
  }, [products]);

  const [categories, setCategories] = useState<{ label: string; value: string; slug?: string; level: number }[]>([
    { label: 'همه دسته‌ها', value: 'all', slug: 'all', level: 0 },
  ]);

  useEffect(() => {
    async function loadDynamicCats() {
      try {
        const list = await getCategories();
        if (list && list.length > 0) {
          const result: { label: string; value: string; slug?: string; level: number }[] = [
            { label: 'همه دسته‌ها', value: 'all', slug: 'all', level: 0 }
          ];

          // Set to keep track of added category IDs to prevent duplicates
          const addedIds = new Set<string>();

          // Recursive helper to traverse any depth of nested category tree
          const traverse = (cats: Category[], currentLevel: number) => {
            cats.forEach(c => {
              if (!addedIds.has(c.id)) {
                result.push({
                  label: c.name,
                  value: c.id,
                  slug: c.slug,
                  level: currentLevel
                });
                addedIds.add(c.id);
              }
              if (c.children && c.children.length > 0) {
                traverse(c.children, currentLevel + 1);
              }
            });
          };

          // Separate roots and children recursively
          const roots = list.filter(c => !c.parent);
          traverse(roots, 0);

          // Fallback to include any remaining categories that might have been returned flat or missed
          const orphans = list.filter(c => !addedIds.has(c.id));
          if (orphans.length > 0) {
            traverse(orphans, 1);
          }

          setCategories(result);
        }
      } catch (err) {
        console.error('Error fetching categories dynamically:', err);
      }
    }
    loadDynamicCats();
  }, []);

  const updateUrlParams = (cat: string, search: string) => {
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    if (search) params.set('search', search);
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    updateUrlParams(val, searchQuery);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateUrlParams(categoryFilter, val);
  };

  const clearFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setSortBy('default');
    setPriceRange(50000000);
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 text-right animate-fade-in" dir="rtl">
      
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-black text-brand-charcoal">کتابخانه محصولات مرموریس</h1>
        <p className="text-xs text-brand-stone">طراحی لوکس، متریال طبیعی، کیفیت جاودانه</p>
      </div>

      {/* Main Grid: Filters on Right, Products on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* DESKTOP FILTER BAR */}
        <aside className="hidden lg:block space-y-6 sticky top-28 bg-white border border-brand-pink/15 p-6 rounded-[28px] shadow-sm">
          
          <div className="flex items-center justify-between border-b border-brand-cream pb-4">
            <h3 className="text-sm font-bold text-brand-charcoal flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-pink-dark" />
              فیلترهای پیشرفته
            </h3>
            <button onClick={clearFilters} className="text-[10px] text-brand-stone hover:text-rose-600 transition-colors cursor-pointer font-bold">
              پاک کردن همه
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-brand-stone">جستجوی کلمه کلیدی</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="نام کالا یا جنس..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="جستجوی کلمه کلیدی در محصولات"
                className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal placeholder-brand-stone/50 text-xs rounded-[16px] py-2.5 px-3 pr-9 focus:outline-none focus:ring-2 focus:ring-brand-pink-dark font-sans text-right"
              />
              <Search className="w-3.5 h-3.5 text-brand-stone/70 absolute right-3" />
            </div>
          </div>

          {/* Categories Radio Box */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-brand-stone">دسته‌بندی‌ها</label>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => {
                const isSelected = categoryFilter === cat.value || (cat.slug && cat.slug !== 'all' && categoryFilter === cat.slug);
                const paddingClass = cat.level === 1 ? 'pr-7' : cat.level >= 2 ? 'pr-11' : 'pr-3';
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    aria-label={`دسته‌بندی ${cat.label}`}
                    className={`w-full text-right text-xs py-2 rounded-[12px] transition-all cursor-pointer flex items-center justify-between focus-visible:ring-2 focus-visible:ring-brand-pink-dark focus-visible:outline-none ${paddingClass} ${
                      isSelected
                        ? 'bg-brand-pink-light border border-brand-pink/25 text-brand-pink-dark font-bold'
                        : 'text-brand-stone hover:text-brand-pink-dark hover:bg-brand-pink-light/30 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {cat.level > 0 && (
                        <span className="text-brand-pink-dark/80 text-[10px] select-none ml-1 font-mono">
                          {Array(cat.level).fill('↳').join(' ')}
                        </span>
                      )}
                      {cat.label}
                    </span>
                    {isSelected && (
                      <div className="w-1 h-1 rounded-full bg-brand-pink-dark ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-bold text-brand-stone">
              <span>حداکثر بودجه</span>
              <span className="font-sans text-brand-pink-dark font-bold">{formatPrice(priceRange)}</span>
            </div>
            <input
              type="range"
              min={1000000}
              max={maxProductPrice}
              step={500000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              aria-label="حداکثر قیمت فیلتر"
              className="w-full h-1 bg-brand-cream rounded-lg appearance-none cursor-pointer accent-brand-pink-dark focus-visible:ring-2 focus-visible:ring-brand-pink-dark focus-visible:outline-none"
            />
            <div className="flex justify-between text-[10px] text-brand-stone/80 font-sans">
              <span>۱ میلیون</span>
              <span>{toPersianNumbers(Math.round(maxProductPrice / 1000000))} میلیون</span>
            </div>
          </div>

          {/* Sorting Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-brand-stone">ترتیب چیدمان</label>
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="ترتیب چیدمان محصولات"
                className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-pink-dark font-sans text-right appearance-none cursor-pointer"
              >
                <option value="default" className="bg-white">پیش‌فرض مرموریس</option>
                <option value="price-asc" className="bg-white">ارزان‌ترین ابتدا</option>
                <option value="price-desc" className="bg-white">گران‌ترین ابتدا</option>
                <option value="rating" className="bg-white">بیشترین امتیاز</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-stone/70 absolute left-3 pointer-events-none" />
            </div>
          </div>
        </aside>

        {/* PRODUCTS AREA */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Mobile Filter Controller Button */}
          <div className="flex flex-col lg:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full bg-white border border-brand-pink/15 text-brand-charcoal text-xs py-3 px-4 rounded-[18px] flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm hover:bg-brand-cream transition-colors font-bold"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-pink-dark animate-pulse" />
              {showMobileFilters ? 'بستن فیلترهای پیشرفته' : 'فیلترهای پیشرفته و ترتیب'}
            </button>

            <AnimatePresence>
              {showMobileFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden bg-white border border-brand-pink/20 rounded-[24px] p-5 space-y-4 shadow-sm text-right"
                  dir="rtl"
                >
                  {/* Mobile Search */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-[11px] font-bold text-brand-stone">جستجوی کلمه کلیدی</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="نام کالا یا جنس..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal placeholder-brand-stone/40 text-xs rounded-[16px] py-2.5 px-3 pr-9 focus:outline-none focus:border-brand-pink-dark font-sans text-right"
                      />
                      <Search className="w-3.5 h-3.5 text-brand-stone/60 absolute right-3" />
                    </div>
                  </div>

                  {/* Mobile Categories - beautiful vertical scrollable list with hierarchy */}
                  <div className="space-y-1.5 text-right w-full">
                    <label className="text-[11px] font-bold text-brand-stone">دسته‌بندی‌ها</label>
                    <div className="border border-brand-pink/15 rounded-[18px] p-2 bg-brand-cream/40 max-h-44 overflow-y-auto space-y-1 scrollbar-none" dir="rtl">
                      {categories.map((cat) => {
                        const isSelected = categoryFilter === cat.value || (cat.slug && cat.slug !== 'all' && categoryFilter === cat.slug);
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleCategoryChange(cat.value)}
                            aria-label={`دسته‌بندی ${cat.label}`}
                            className={`w-full text-right text-xs py-2 px-3 rounded-[12px] border transition-all flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-pink-dark focus-visible:outline-none ${
                              isSelected
                                ? 'bg-brand-pink-dark border-brand-pink/20 text-white font-bold shadow-sm'
                                : 'bg-transparent border-transparent text-brand-stone hover:bg-brand-cream/70'
                            }`}
                            style={{ paddingRight: cat.level > 0 ? `${Math.min(cat.level, 2) * 12 + 12}px` : '12px' }}
                          >
                            <span className="flex items-center gap-1">
                              {cat.level > 0 && (
                                <span className={`${isSelected ? 'text-white/80' : 'text-brand-pink-dark/80'} text-[10px] select-none ml-1 font-mono`}>
                                  {Array(Math.min(cat.level, 2)).fill('↳').join(' ')}
                                </span>
                              )}
                              {cat.label}
                            </span>
                            {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-pink-dark'}`} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Price slider */}
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between items-center text-[11px] font-bold text-brand-stone">
                      <span>حداکثر بودجه</span>
                      <span className="font-sans text-brand-pink-dark font-bold">{formatPrice(priceRange)}</span>
                    </div>
                    <input
                      type="range"
                      min={1000000}
                      max={maxProductPrice}
                      step={500000}
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      aria-label="حداکثر قیمت فیلتر موبایل"
                      className="w-full h-1 bg-brand-cream rounded-lg appearance-none cursor-pointer accent-brand-pink-dark focus-visible:ring-2 focus-visible:ring-brand-pink-dark focus-visible:outline-none"
                    />
                  </div>

                  {/* Mobile Sorting */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-[11px] font-bold text-brand-stone">ترتیب چیدمان</label>
                    <div className="relative flex items-center">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-brand-cream border border-brand-pink/15 text-brand-charcoal text-xs rounded-[16px] py-2.5 px-3 text-right focus:outline-none font-sans appearance-none cursor-pointer"
                      >
                        <option value="default">پیش‌فرض مرموریس</option>
                        <option value="price-asc">ارزان‌ترین ابتدا</option>
                        <option value="price-desc">گران‌ترین ابتدا</option>
                        <option value="rating">بیشترین امتیاز</option>
                      </select>
                      <ArrowUpDown className="w-3.5 h-3.5 text-brand-stone/60 absolute left-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Mobile Reset Action */}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs py-2.5 px-4 rounded-[16px] font-bold transition-colors cursor-pointer text-center"
                  >
                    پاک کردن فیلترها
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Summary Info */}
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-brand-stone">
              یافت شده: <span className="text-brand-charcoal font-bold font-sans">{toPersianNumbers(totalProducts || products.length)}</span> کالا
            </p>
            {categoryFilter !== 'all' && (
              <span className="bg-brand-pink-light border border-brand-pink/20 text-brand-pink-dark text-[10px] px-2.5 py-1 rounded-full font-bold">
                دسته: {categories.find(c => c.value === categoryFilter || (c.slug && c.slug !== 'all' && c.slug === categoryFilter))?.label || 'نامشخص'}
              </span>
            )}
          </div>

          {/* Actual Catalog Grid */}
          {loadingInitial ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="bg-rose-50/70 border border-rose-200 rounded-[32px] p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <button
                onClick={retry}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-[16px] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                تلاش مجدد
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-brand-pink/15 rounded-[32px] p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-brand-cream border border-brand-pink/15 text-brand-stone rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-brand-charcoal">کالایی یافت نشد</p>
              <p className="text-xs text-brand-stone max-w-sm mx-auto">
                هیچ کدام از محصولات با مشخصات فیلتر انتخابی شما مطابقت ندارند. لطفاً مقادیر را تغییر دهید.
              </p>
              <button
                onClick={clearFilters}
                className="bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-semibold px-4 py-2 rounded-[14px] border border-brand-pink/15 cursor-pointer transition-colors"
              >
                ریست کردن فیلترها
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Skeletons while loading subsequent pages */}
              {loadingMore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <ProductSkeleton key={`more-skel-${i}`} />
                    ))}
                </div>
              )}

              {/* Sentinel target for Intersection Observer */}
              {hasMore && (
                <div ref={targetRef} className="h-16 flex items-center justify-center py-4">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-stone bg-white/80 border border-brand-pink/20 px-4 py-2 rounded-full shadow-sm">
                      <RefreshCw className="w-4 h-4 text-brand-pink-dark animate-spin" />
                      در حال بارگذاری محصولات بیشتر...
                    </div>
                  )}
                </div>
              )}

              {/* End of results message */}
              {!hasMore && products.length > 0 && (
                <div className="text-center py-6 border-t border-brand-pink/10">
                  <p className="text-xs text-brand-stone font-semibold">
                    ✨ تمام محصولات موجود در این دسته نمایش داده شدند.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-brand-stone">در حال دریافت محصولات گالری مرموریس...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

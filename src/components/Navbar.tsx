/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Search, User as UserIcon, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toPersianNumbers } from '@/components/PriceDisplay';
import MarmorisLogo from '@/components/MarmorisLogo';
import { getCategories } from '@/lib/apiClient';

const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>`;

// Truncate user name safely
export function truncateName(name: string, maxLen: number = 18): string {
  if (!name) return '';
  const trimmed = name.trim();
  return trimmed.length > maxLen ? trimmed.substring(0, maxLen) + '...' : trimmed;
}

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([
    { id: 'cat_1', name: 'مرموریس بگ (کیف‌های لوکس)' },
    { id: 'cat_2', name: 'مرموریس استایل (پوشاک مینی‌مال)' },
    { id: 'cat_3', name: 'مرموریس جولری (زیورآلات و اکسسوری)' },
  ]);

  useEffect(() => {
    async function loadNavbarCats() {
      try {
        const list = await getCategories();
        if (list && list.length > 0) {
          // The API returns nested structure, map the parent categories
          const roots = list.filter(c => !c.parent);
          setCategories(roots.map(c => ({ id: c.id, name: c.name })));
        }
      } catch (err) {
        console.error('Error loading categories in Navbar:', err);
      }
    }
    loadNavbarCats();
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 px-2 sm:px-4 md:px-8 py-2 sm:py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="liquid-glass rounded-[20px] sm:rounded-[24px] px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-sm relative">
          
          {/* Right Side: Logo and Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <div className="h-8 sm:h-10 md:h-11 w-[110px] sm:w-[140px] md:w-[160px] flex items-center justify-center">
                <MarmorisLogo width={160} height={48} className="w-full h-full object-contain" />
              </div>
            </Link>
 
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6 whitespace-nowrap" dir="rtl">
              {/* خانه */}
              <Link
                href="/"
                className={`text-[13px] xl:text-[14px] font-medium transition-colors cursor-pointer hover:text-brand-pink-dark ${
                  pathname === '/' ? 'text-brand-pink-dark font-semibold' : 'text-brand-stone'
                }`}
              >
                خانه
              </Link>

              {/* محصولات (Dropdown) */}
              <div className="relative group py-2">
                <Link
                  href="/products"
                  className={`text-[13px] xl:text-[14px] font-medium transition-colors cursor-pointer hover:text-brand-pink-dark flex items-center gap-1.5 ${
                    pathname.startsWith('/products') ? 'text-brand-pink-dark font-semibold' : 'text-brand-stone'
                  }`}
                >
                  <span>محصولات</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-brand-stone group-hover:text-brand-pink-dark" />
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-56 liquid-glass-modal rounded-[20px] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50 text-right space-y-0.5">
                  <Link
                    href="/products"
                    className="block text-xs font-bold text-brand-stone hover:text-brand-pink-dark hover:bg-brand-cream/60 rounded-[12px] px-3.5 py-2 transition-colors"
                  >
                    همه محصولات
                  </Link>
                  <div className="h-[1px] bg-brand-pink/10 my-1" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="block text-xs text-brand-stone hover:text-brand-pink-dark hover:bg-brand-cream/60 rounded-[12px] px-3.5 py-2 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* وبلاگ */}
              <Link
                href="/blog"
                className={`text-[13px] xl:text-[14px] font-medium transition-colors cursor-pointer hover:text-brand-pink-dark ${
                  pathname.startsWith('/blog') ? 'text-brand-pink-dark font-semibold' : 'text-brand-stone'
                }`}
              >
                وبلاگ
              </Link>

              {/* درباره ما */}
              <Link
                href="/about-us"
                className={`text-[13px] xl:text-[14px] font-medium transition-colors cursor-pointer hover:text-brand-pink-dark ${
                  pathname === '/about-us' ? 'text-brand-pink-dark font-semibold' : 'text-brand-stone'
                }`}
              >
                درباره ما
              </Link>

              {/* تماس با ما */}
              <Link
                href="/contact-us"
                className={`text-[13px] xl:text-[14px] font-medium transition-colors cursor-pointer hover:text-brand-pink-dark ${
                  pathname === '/contact-us' ? 'text-brand-pink-dark font-semibold' : 'text-brand-stone'
                }`}
              >
                تماس با ما
              </Link>
            </div>
          </div>
 
          {/* Center: Search Box */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-[140px] lg:max-w-[180px] xl:max-w-[220px] w-full mx-2" dir="rtl">
            <input
              type="text"
              placeholder="جستجو در مرموریس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full liquid-glass-search text-brand-charcoal placeholder-brand-stone/50 text-xs rounded-full py-2 px-4 pr-10 focus:outline-none transition-all font-sans"
            />
            <button type="submit" aria-label="Search" className="absolute right-3 text-brand-stone/60 hover:text-brand-pink-dark transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
 
          {/* Left Side: Cart, User Icon & Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Search Toggle for Mobile */}
            <button 
              onClick={() => router.push('/products')}
              aria-label="Search"
              className="p-2 sm:p-2.5 text-brand-stone hover:text-brand-pink-dark md:hidden liquid-glass-btn rounded-full transition-all cursor-pointer flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
 
            {/* Cart Icon with Counter */}
            <Link
              href="/cart"
              aria-label="Open cart"
              className="relative p-2 sm:p-2.5 text-brand-stone hover:text-brand-pink-dark liquid-glass-btn rounded-full transition-all flex items-center justify-center group"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-brand-pink-dark text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-white font-sans shadow-md animate-bounce">
                  {toPersianNumbers(cartCount)}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-label="حساب کاربری"
                  className="py-1 px-2.5 sm:py-1.5 sm:px-3 text-brand-stone hover:text-brand-pink-dark liquid-glass-btn rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-pink-dark focus-visible:outline-none"
                >
                  <Image
                    src={user.avatar || DEFAULT_AVATAR_SVG}
                    alt={truncateName(user.fullName || user.firstName || '', 25) || "کاربر مرموریس"}
                    width={24}
                    height={24}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-brand-pink/15 shrink-0"
                  />
                  <span className="hidden md:inline text-xs font-semibold text-brand-charcoal font-sans max-w-[80px] truncate pr-0.5">
                    {truncateName(user.fullName || user.firstName || 'کاربر', 12)}
                  </span>
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="py-2 px-3.5 sm:py-2.5 sm:px-4 text-brand-stone hover:text-brand-pink-dark liquid-glass-btn rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden md:inline text-brand-charcoal">ورود</span>
                </Link>
              )}

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && user && (
                <div className="absolute left-0 mt-2.5 w-52 liquid-glass-modal rounded-[20px] p-2 z-50 text-right space-y-1 animate-in fade-in slide-in-from-top-2 duration-150" dir="rtl">
                  <div className="px-3 py-2 border-b border-brand-beige mb-1">
                    <p className="text-xs font-bold text-brand-charcoal">{truncateName(user.fullName || user.firstName || 'کاربر', 25)}</p>
                    <p className="text-[10px] text-brand-stone/60 truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block text-xs text-brand-stone hover:text-brand-pink-dark hover:bg-brand-cream rounded-[12px] px-3 py-2 transition-colors"
                  >
                    داشبورد کاربری
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block text-xs text-brand-stone hover:text-brand-pink-dark hover:bg-brand-cream rounded-[12px] px-3 py-2 transition-colors"
                  >
                    تاریخچه سفارشات
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                      router.push('/');
                    }}
                    className="w-full text-right block text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[12px] px-3 py-2 transition-colors cursor-pointer"
                  >
                    خروج از حساب
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 sm:p-2.5 text-brand-stone hover:text-brand-pink-dark liquid-glass-btn rounded-full transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-24 left-4 right-4 z-40 lg:hidden bg-white border border-brand-pink/25 rounded-[24px] p-6 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full" dir="rtl">
              <input
                type="text"
                placeholder="جستجو در مرموریس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-cream border border-brand-beige text-brand-charcoal placeholder-brand-stone/50 text-xs rounded-[16px] py-2.5 px-4 pr-10 focus:outline-none font-sans"
              />
              <button type="submit" aria-label="Search" className="absolute right-3 text-brand-stone/60">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-2 text-right" dir="rtl">
              {/* خانه */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-colors py-2 border-b border-brand-cream/60 ${
                  pathname === '/' ? 'text-brand-pink-dark' : 'text-brand-stone'
                }`}
              >
                خانه
              </Link>

              {/* محصولات */}
              <div className="border-b border-brand-cream/60 py-1">
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className={`w-full text-right flex items-center justify-between text-sm font-semibold py-1.5 transition-colors ${
                    pathname.startsWith('/products') ? 'text-brand-pink-dark' : 'text-brand-stone'
                  }`}
                >
                  <span>محصولات</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180 text-brand-pink-dark' : 'text-brand-stone/50'}`} />
                </button>

                {mobileProductsOpen && (
                  <div className="bg-brand-cream/40 rounded-[14px] p-2.5 mt-1.5 space-y-2.5 text-xs text-brand-stone font-medium">
                    <Link
                      href="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 px-3 hover:text-brand-pink-dark"
                    >
                      • همه محصولات
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1 px-3 hover:text-brand-pink-dark"
                      >
                        • {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* وبلاگ */}
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-colors py-2 border-b border-brand-cream/60 ${
                  pathname.startsWith('/blog') ? 'text-brand-pink-dark' : 'text-brand-stone'
                }`}
              >
                وبلاگ
              </Link>

              {/* درباره ما */}
              <Link
                href="/about-us"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-colors py-2 border-b border-brand-cream/60 ${
                  pathname === '/about-us' ? 'text-brand-pink-dark' : 'text-brand-stone'
                }`}
              >
                درباره ما
              </Link>

              {/* تماس با ما */}
              <Link
                href="/contact-us"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-colors py-2 border-b border-brand-cream/60 ${
                  pathname === '/contact-us' ? 'text-brand-pink-dark' : 'text-brand-stone'
                }`}
              >
                تماس با ما
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

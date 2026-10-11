const fs = require('fs');
let code = fs.readFileSync('src/app/HomeClient.tsx', 'utf8');

// 1. Add Banner to imports
code = code.replace(
  "getSliders, getBlogPosts, getFaqs, getSlug } from '@/lib/apiClient';",
  "getSliders, getBlogPosts, getFaqs, getSlug, getBanners } from '@/lib/apiClient';"
);
code = code.replace(
  "Slider, BlogPost, FAQ } from '@/types';",
  "Slider, BlogPost, FAQ, Banner } from '@/types';"
);

// 2. Add state
const stateInjection = `  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);`;
if (!code.includes('const [banners, setBanners]')) {
  code = code.replace(
    "const [loadingFaqs, setLoadingFaqs] = useState(true);",
    "const [loadingFaqs, setLoadingFaqs] = useState(true);\n" + stateInjection
  );
}

// 3. Add fetch logic
const fetchInjection = `
      try {
        const b = await getBanners();
        if (b && Array.isArray(b)) {
          setBanners(b);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoadingBanners(false);
      }
`;
if (!code.includes('await getBanners()')) {
  code = code.replace(
    "setLoadingSliders(false);\n      }",
    "setLoadingSliders(false);\n      }\n" + fetchInjection
  );
}

// 4. Compute banners
const bannersCompute = `
  const bagBanner = banners.find(b => b.key === 'bag_banner') || {
    key: 'bag_banner',
    image: '/images/banner-bag.jpg',
    title: 'دقت مینی‌مالیستی در جزئیات دوخت',
    subtitle: 'طراحی سبک و اصیل با پارچه‌های مقاوم طبیعی و دوخت ظریف دست‌ساز که ماندگاری و زیبایی کیف‌های پارچه‌ای مرموریس را تضمین می‌کند.',
    button_text: 'مشاهده کالکشن کیف',
    link: '/products?category=bags',
    is_active: true
  };

  const jewelryBanner = banners.find(b => b.key === 'jewelry_banner') || {
    key: 'jewelry_banner',
    image: '/images/banner-jewelry.jpg',
    title: 'زیبایی طبیعی اکسسوری thetwozza',
    subtitle: 'مهره مروارید و عناصر طبیعی در ترکیب با طراحی دست‌ساز، اصیل و منحصربه‌فرد برای جلوه ماندگار استایل شما.',
    button_text: 'مشاهده اکسسوری‌ها',
    link: '/products?category=jewelry',
    is_active: true
  };
`;
if (!code.includes('const bagBanner = banners.find')) {
  code = code.replace(
    "if (loadingCats || loadingProducts) {",
    bannersCompute + "\n  if (loadingCats || loadingProducts) {"
  );
}

// 5. Replace HTML for bag banner
const bagBannerHTMLOriginal = `<section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 min-h-[280px] sm:min-h-[300px] md:h-80 group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src="/images/banner-bag.jpg"
          alt="کیف پارچه‌ای دست‌دوز مرموریس"
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-xl text-right z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/90 text-brand-pink-dark border border-brand-pink/20 text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full w-max font-sans shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink-dark" />
            کارگاه طراحی و دوخت مرموریس
          </span>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-brand-charcoal leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)]">
            دقت مینی‌مالیستی در جزئیات دوخت
          </h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-brand-stone font-medium leading-relaxed max-w-lg drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]">
            طراحی سبک و اصیل با پارچه‌های مقاوم طبیعی و دوخت ظریف دست‌ساز که ماندگاری و زیبایی کیف‌های پارچه‌ای مرموریس را تضمین می‌کند.
          </p>
          <div className="pt-2">
            <Link href="/products?category=bags" className="inline-flex items-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-5 py-2.5 rounded-[16px] transition-all shadow-md">
              مشاهده کالکشن کیف
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>`;

const bagBannerHTMLNew = `{bagBanner.is_active && (
      <section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 min-h-[280px] sm:min-h-[300px] md:h-80 group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src={bagBanner.image}
          alt={bagBanner.title || "کیف پارچه‌ای دست‌دوز مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-xl text-right z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/90 text-brand-pink-dark border border-brand-pink/20 text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full w-max font-sans shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink-dark" />
            کارگاه طراحی و دوخت مرموریس
          </span>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-brand-charcoal leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)]">
            {bagBanner.title}
          </h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-brand-stone font-medium leading-relaxed max-w-lg drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]">
            {bagBanner.subtitle}
          </p>
          <div className="pt-2">
            <Link href={bagBanner.link} className="inline-flex items-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-5 py-2.5 rounded-[16px] transition-all shadow-md">
              {bagBanner.button_text}
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      )}`;
      
code = code.replace(bagBannerHTMLOriginal, bagBannerHTMLNew);


// 6. Replace HTML for jewelry banner
const jewelryBannerHTMLOriginal = `<section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 min-h-[280px] sm:min-h-[300px] md:h-80 group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src="/images/banner-jewelry.jpg"
          alt="مجموعه اکسسوری و زیورآلات مرموریس"
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-xl text-right z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/90 text-brand-pink-dark border border-brand-pink/20 text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full w-max font-sans shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink-dark" />
            مجموعه اکسسوری thetwozza
          </span>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-brand-charcoal leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)]">
            زیبایی طبیعی اکسسوری thetwozza
          </h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-brand-stone font-medium leading-relaxed max-w-lg drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]">
            مهره مروارید و عناصر طبیعی در ترکیب با طراحی دست‌ساز، اصیل و منحصربه‌فرد برای جلوه ماندگار استایل شما.
          </p>
          <div className="pt-2">
            <Link href="/products?category=jewelry" className="inline-flex items-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-5 py-2.5 rounded-[16px] transition-all shadow-md">
              مشاهده اکسسوری‌ها
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>`;

const jewelryBannerHTMLNew = `{jewelryBanner.is_active && (
      <section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 min-h-[280px] sm:min-h-[300px] md:h-80 group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src={jewelryBanner.image}
          alt={jewelryBanner.title || "مجموعه اکسسوری و زیورآلات مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-xl text-right z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/90 text-brand-pink-dark border border-brand-pink/20 text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full w-max font-sans shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink-dark" />
            مجموعه اکسسوری thetwozza
          </span>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-brand-charcoal leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)]">
            {jewelryBanner.title}
          </h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-brand-stone font-medium leading-relaxed max-w-lg drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]">
            {jewelryBanner.subtitle}
          </p>
          <div className="pt-2">
            <Link href={jewelryBanner.link} className="inline-flex items-center gap-2 bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-5 py-2.5 rounded-[16px] transition-all shadow-md">
              {jewelryBanner.button_text}
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      )}`;

code = code.replace(jewelryBannerHTMLOriginal, jewelryBannerHTMLNew);

fs.writeFileSync('src/app/HomeClient.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/app/HomeClient.tsx', 'utf8');

// 1. Fix getStepMarginClass
code = code.replace(
`const getStepMarginClass = (index: number) => {
  const classes = [
    'md:mr-0',
    'md:mr-[24px]',
    'md:mr-[48px]',
    'md:mr-[72px]',
    'md:mr-[96px]',
  ];
  return classes[index] || 'md:mr-0';
};`,
`const getStepMarginClass = (index: number) => {
  const classes = [
    'mr-0',
    'mr-0 md:mr-[24px]',
    'mr-0 md:mr-[48px]',
    'mr-0 md:mr-[72px]',
    'mr-0 md:mr-[96px]',
  ];
  return classes[index] || 'mr-0';
};`
);

// 2. Fix Hero Luxury Slider container & images
const oldHeroSection = `<div className="relative w-full min-h-[380px] sm:min-h-[420px] md:min-h-[450px] lg:aspect-[21/9] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-brand-pink/15 shadow-md bg-white flex items-center">
          {loadingSliders && sliders.length === 0 ? (
            <SliderSkeleton />
          ) : currentSlide ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Blurred background to prevent empty spaces when containing */}
                <Image
                  src={currentSlide.image || currentSlide.featured_image || currentSlide.url || '/images/banner-bag.jpg'}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover blur-3xl opacity-40 scale-110"
                />
                {/* Main fashion image - contained so product isn't cut off */}
                <Image
                  src={currentSlide.image || currentSlide.featured_image || currentSlide.url || '/images/banner-bag.jpg'}
                  alt={currentSlide.title || "اسلاید شو مرموریس"}
                  fill
                  sizes="100vw"
                  priority
                  referrerPolicy="no-referrer"
                  className="object-contain"
                />

                {/* Text Area (Right Aligned for Persian standard) */}
                <div className="absolute inset-y-0 right-4 sm:right-8 md:right-16 flex flex-col justify-center text-right space-y-3 sm:space-y-4 max-w-xl z-10 px-2" dir="rtl">`;

const newHeroSection = `<div className="relative w-full aspect-[16/11] sm:aspect-[16/8] md:aspect-[21/9] min-h-[290px] sm:min-h-[380px] md:min-h-[420px] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-brand-pink/15 shadow-md bg-white flex items-center">
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
                  src={currentSlide.image || currentSlide.featured_image || currentSlide.url || '/images/banner-bag.jpg'}
                  alt={currentSlide.title || "اسلاید شو مرموریس"}
                  fill
                  sizes="100vw"
                  priority
                  referrerPolicy="no-referrer"
                  className="object-cover object-center sm:object-[center_35%]"
                />

                {/* Glassmorphic Text Area Overlay */}
                <div className="absolute inset-y-0 right-2 sm:right-6 md:right-12 flex flex-col justify-center text-right space-y-2 sm:space-y-3.5 max-w-[85%] sm:max-w-md md:max-w-xl z-10 px-3 sm:px-6 py-3 sm:py-5 my-auto max-h-[88%] rounded-2xl sm:rounded-3xl bg-white/80 sm:bg-white/65 backdrop-blur-md border border-white/60 shadow-sm" dir="rtl">`;

code = code.replace(oldHeroSection, newHeroSection);

// Fix slider arrows touch target
code = code.replace(
  `aria-label="Previous slide"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 bg-white/80 hover:bg-white border border-brand-pink/15 shadow-sm rounded-full text-brand-stone hover:text-brand-pink-dark transition-all cursor-pointer"`,
  `aria-label="Previous slide"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/80 hover:bg-white border border-brand-pink/15 shadow-sm rounded-full text-brand-stone hover:text-brand-pink-dark transition-all cursor-pointer"`
);
code = code.replace(
  `aria-label="Next slide"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 bg-white/80 hover:bg-white border border-brand-pink/15 shadow-sm rounded-full text-brand-stone hover:text-brand-pink-dark transition-all cursor-pointer"`,
  `aria-label="Next slide"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/80 hover:bg-white border border-brand-pink/15 shadow-sm rounded-full text-brand-stone hover:text-brand-pink-dark transition-all cursor-pointer"`
);

// 3. Fix Banner 1 (bagBanner)
const oldBanner1 = `<section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 min-h-[280px] sm:min-h-[300px] md:h-80 group shadow-sm flex items-center bg-white" dir="rtl">
        {/* Blurred background to prevent empty spaces when containing */}
        <Image
          src={bagBanner.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover blur-3xl opacity-40 scale-110"
        />
        {/* Main fashion image - contained so product isn't cut off */}
        <Image
          src={bagBanner.image}
          alt={bagBanner.title || "کیف پارچه‌ای دست‌دوز مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-contain transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-xl text-right z-10">`;

const newBanner1 = `<section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 aspect-[16/10] sm:aspect-[16/7] md:aspect-[21/9] min-h-[220px] sm:min-h-[260px] md:min-h-[300px] group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src={bagBanner.image}
          alt={bagBanner.title || "کیف پارچه‌ای دست‌دوز مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover object-center sm:object-[center_35%] transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-y-0 right-2 sm:right-6 md:right-12 p-3 sm:p-6 md:p-10 flex flex-col justify-center space-y-2 sm:space-y-3.5 max-w-[85%] sm:max-w-md md:max-w-xl text-right z-10 bg-white/80 sm:bg-white/65 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/60 my-auto max-h-[88%] shadow-sm">`;

code = code.replace(oldBanner1, newBanner1);

// 4. Fix Banner 2 (jewelryBanner)
const oldBanner2 = `<section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 min-h-[280px] sm:min-h-[300px] md:h-80 group shadow-sm flex items-center bg-white" dir="rtl">
        {/* Blurred background to prevent empty spaces when containing */}
        <Image
          src={jewelryBanner.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover blur-3xl opacity-40 scale-110"
        />
        {/* Main fashion image - contained so product isn't cut off */}
        <Image
          src={jewelryBanner.image}
          alt={jewelryBanner.title || "مجموعه اکسسوری و زیورآلات مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-contain transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-xl text-right z-10">`;

const newBanner2 = `<section className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border border-brand-pink/15 aspect-[16/10] sm:aspect-[16/7] md:aspect-[21/9] min-h-[220px] sm:min-h-[260px] md:min-h-[300px] group shadow-sm flex items-center bg-white" dir="rtl">
        <Image
          src={jewelryBanner.image}
          alt={jewelryBanner.title || "مجموعه اکسسوری و زیورآلات مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover object-center sm:object-[center_35%] transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-y-0 right-2 sm:right-6 md:right-12 p-3 sm:p-6 md:p-10 flex flex-col justify-center space-y-2 sm:space-y-3.5 max-w-[85%] sm:max-w-md md:max-w-xl text-right z-10 bg-white/80 sm:bg-white/65 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/60 my-auto max-h-[88%] shadow-sm">`;

code = code.replace(oldBanner2, newBanner2);

// 5. Update Swiper slide widths for mobile (320px screens)
code = code.replaceAll('!w-[280px] sm:!w-[320px]', '!w-[245px] sm:!w-[320px]');

// 6. Category row gaps
code = code.replace(
  'className="flex flex-wrap items-center justify-center gap-6 md:gap-12 py-2"',
  'className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-12 py-2"'
);

fs.writeFileSync('src/app/HomeClient.tsx', code);
console.log('Successfully updated HomeClient.tsx!');

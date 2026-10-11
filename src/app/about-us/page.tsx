import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  title: 'درباره ما | گالری مرموریس',
  description: 'داستان گالری مرموریس؛ برند اختصاصی تولید کیف، پوشاک مینی‌مال و زیورآلات خاص در مرموریس.',
  keywords: ['درباره مرموریس', 'برند مرموریس', 'کیف مرموریس'],
  alternates: {
    canonical: `${siteUrl}/about-us`,
  },
  openGraph: {
    title: 'درباره برند و گالری مرموریس',
    description: 'تولید و طراحی اختصاصی کیف، پوشاک و زیورآلات با کیفیت بالا در گالری مرموریس.',
    url: `${siteUrl}/about-us`,
    siteName: 'مرموریس',
    type: 'website',
    images: [`${siteUrl}/logo.png`],
  },
};

export default function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-right animate-fade-in" dir="rtl">
      {/* Glassmorphic Container */}
      <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-[28px] p-8 md:p-12 shadow-xl shadow-slate-100/30 space-y-8">
        
        {/* Title */}
        <h1 className="text-3xl font-black text-slate-800 pb-4 border-b border-white/10">
          درباره مرموریس
        </h1>

        {/* Content Paragraphs */}
        <div className="space-y-6 text-slate-600 text-sm md:text-base leading-relaxed">
          <p>
            مرموریس یک برند تولیدی است که با تمرکز بر کیفیت و ظرافت، کیف، پوشاک و زیورآلات طراحی و تولید می‌کند. تمام محصولات ما در آتلیه خودمان ساخته می‌شوند؛ جایی که هر قطعه با دقت و توجه به جزئیات دوخته و آماده می‌شود، نه در خط تولید انبوه و بی‌روح.
          </p>

          <p>
            ما معتقدیم خرید آنلاین نباید به معنای چشم‌پوشی از کیفیت باشد. به همین دلیل، از انتخاب متریال تا مراحل نهایی تولید، تلاش می‌کنیم محصولی به دست مشتری برسد که واقعاً ارزش خریدن داشته باشد؛ چیزی که هم زیبا باشد، هم بادوام، و هم حس خوبی به همراه داشته باشد.
          </p>

          {/* Core Categories List */}
          <div className="py-4 space-y-3">
            <p className="font-bold text-slate-800 text-sm md:text-base">
              دسته‌بندی‌های مرموریس:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-bold text-slate-700 text-xs md:text-sm">
              <div className="bg-white/20 border border-white/10 py-3.5 px-4 rounded-[20px] text-center">
                مرموریس بگ (Marmoris Bag)
              </div>
              <div className="bg-white/20 border border-white/10 py-3.5 px-4 rounded-[20px] text-center">
                مرموریس استایل (Marmoris Style)
              </div>
              <div className="bg-white/20 border border-white/10 py-3.5 px-4 rounded-[20px] text-center">
                مرموریس جولری (Marmoris Jewelry)
              </div>
            </div>
          </div>

          <p>
            هدف ما فقط فروش نیست؛ می‌خواهیم برندی باشیم که مشتری بتواند به کیفیت کارش اعتماد کند و با خیال راحت خرید کند. اگر سوالی درباره محصولات یا سفارشتان دارید، تیم پشتیبانی مرموریس همیشه در دسترس شماست.
          </p>
        </div>

      </div>
    </div>
  );
}

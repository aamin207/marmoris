/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { use, useState, useEffect } from 'react';
import { getBlogPost, getSlug } from '@/lib/apiClient';
import { BlogPost } from '@/types';
import { Calendar, User, ArrowLeft, Loader2, ArrowRight, Share2, Heart, BookOpen, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import DOMPurify from 'isomorphic-dompurify';

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default function BlogPostDetails({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getBlogPost(id);
        if (data) {
          setPost(data);
        } else {
          setPost(getFallbackPost(id));
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setPost(getFallbackPost(id));
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  function getFallbackPost(idOrSlug: string): BlogPost {
    const fallbackMap: Record<string, BlogPost> = {
      'blog_1': {
        id: 'blog_1',
        title: 'راهنمای مراقبت و افزایش طول عمر کیف‌های مرموریس',
        excerpt: 'چگونه زیبایی و فرم کیف خود را برای سال‌ها حفظ کنیم؟ بررسی روش‌ها و محافظ‌های مناسب.',
        content: `کیف‌ها و اکسسوری‌های مرموریس با کیفیت بالا و دوخت اختصاصی ساخته می‌شوند و به مرور زمان زیبایی خود را حفظ می‌کنند. این محصولات با دقت بالا در جزئیات، بسیار ظریف و در عین حال باکیفیت و ساختاریافته هستند. در این مقاله به اصول اولیه نگهداری از این محصولات می‌پردازیم.

### ۱. دوری از رطوبت و آب مستقیم
بدنه کیف به دلیل بافت ظریف خود، در برابر رطوبت مداوم نیاز به مراقبت دارد. در صورت خیس شدن، فوراً آن را با یک دستمال نرم و بدون پرز خشک کنید. هرگز از سشوار یا حرارت مستقیم برای خشک کردن کیف استفاده نکنید؛ زیرا باعث آسیب دیدن آن می‌شود. اجازه دهید کیف در دمای اتاق و به صورت طبیعی خشک شود.

### ۲. نگهداری و تمیزکاری دوره‌ای
برای حفظ زیبایی و دوام کیف، هر ۳ الی ۶ ماه یک‌بار، سطح آن را با دستمال نخی تمیز و محافظ مناسب پاک کنید. این کار علاوه بر حفظ کیفیت، مقاومت کیف را در برابر آسیب‌های سطحی افزایش می‌دهد.

### ۳. نگهداری اصولی در کمد
هنگامی که از کیف مرموریس خود استفاده نمی‌کنید، داخل آن را با کاغذ باطله بدون جوهر پر کنید تا فرم اصلی خود را حفظ کند. آن را درون کیسه محافظ (Dust Bag) قرار دهید. از نگهداری کیف در کیسه‌های پلاستیکی بدون جریان هوا خودداری کنید.

با رعایت این چند نکته ساده، جلوه و زیبایی کیف شما به شکلی فوق‌العاده حفظ می‌شود.`,
        image: '/logo.png',
        author: 'تیم پژوهش مرموریس',
        date: '۱۴۰۲/۰۹/۱۵'
      },
      'blog_2': {
        id: 'blog_2',
        title: 'اصول استایل‌دهی کیف‌های کلاسیک مینی‌مال',
        excerpt: 'ترکیب بی‌نقص کیف دوشی مرموریس با لباس‌های پاییزه و بارانی‌های طوسی و ملانژ.',
        content: `استایل مینی‌مال یعنی انتخاب آگاهانه کیفیت بر کمیت. در این سبک, اکسسوری‌ها و بخصوص کیف‌ها نقش بسیار مهمی در هماهنگی نهایی پوشش شما ایفا می‌کنند. یک کیف باکیفیت می‌تواند به سادگی یک استایل ساده روزمره را به یک پوشش لوکس و باوقار تبدیل کند.

### هماهنگی رنگی در پالت خنثی
در پاییز و زمستان، استفاده از کت‌ها و بارانی‌هایی با رنگ‌های شتری، طوسی ملانژ، سرمه‌ای و مشکی رواج دارد. کیف‌های با رنگ‌های گرم مرموریس تضاد رنگی بسیار گرم و زیبایی با طوسی و سرمه‌ای ایجاد می‌کنند. برای استایل‌های تابستانه کتان، کیف‌های کرم یا مشکی مینی‌مال جلوه‌ای بی‌نقص دارند.

### تناسب فرم و ابعاد کیف با موقعیت
برای جلسات رسمی یا روزهای کاری، کیف‌های دستی با ساختار هندسی مشخص و محکم پیشنهاد می‌شود. در مقابل، برای پیاده‌روی‌های شهری یا کافه‌گردی‌های آخر هفته، کیف‌های دوشی سبک و کراس‌بادی (Cross-Body) آزادی عمل و در عین حال شیک بودن بی‌نظیری به شما می‌بخشند.

همیشه به یاد داشته باشید که در استایل مینی‌مال، جزئیات کم ولی باکیفیت حرف اول را می‌زنند. یک جفت گوشواره مینی‌مال نقره در کنار یک کیف شیک مرموریس، تمام آن چیزی است که برای درخشش نیاز دارید.`,
        image: '/logo.png',
        author: 'آتلیه طراحی مرموریس',
        date: '۱۴۰۲/۱۰/۰۲'
      },
      'blog_3': {
        id: 'blog_3',
        title: 'تاریخچه اکسسوری thetwozza و جایگاه آن در زیورآلات مدرن',
        excerpt: 'چگونه اکسسوری thetwozza با هندسه‌های نامتقارن و چشم‌نواز خود به یکی از نمادهای اصلی سبک مینی‌مال لوکس تبدیل شدند.',
        content: `طراحی اکسسوری thetwozza به معنای ایجاد فرم‌های متفاوت و غیرتکراری است. برخلاف زیورآلات کلاسیک کاملاً گرد و یکنواخت که سال‌هاست به عنوان استاندارد زیبایی شناخته می‌شدند، امروزه اکسسوری thetwozza با فرم‌های ارگانیک، نامنظم و منحصر‌به‌فرد خود قلب‌های طرفداران مد مدرن را تسخیر کرده‌اند.

### جادوی تفاوت و فردیت
بزرگ‌ترین زیبایی اکسسوری thetwozza در این است که هیچ دو قطعه‌ای در جهان دقیقاً شبیه به یکدیگر نیستند. این یعنی با خرید هر قطعه از اکسسوری thetwozza مرموریس، شما صاحب اثری می‌شوید که در تمام دنیا یگانه است. این مفهوم از فردیت و اصالت با روح سبک زندگی مینی‌مال کاملاً همخوانی دارد.

### مینی‌مالیسم و ترکیب با فلزات گرانبها
طراحان ما در مرموریس، دانه‌هایی با فرم‌های متفاوت و غیرتکراری را با پایه‌های ظریف و نقره استرلینگ ترکیب کرده‌اند. سادگی رکاب‌ها و زنجیرها اجازه می‌دهد که فرم طبیعی و درخشش اصیل به تنهایی خودنمایی کند. این اکسسوری‌ها را می‌توان به راحتی هم با یک پیراهن مشکی رسمی شب ست کرد و هم با یک شومیز کتان سفید روزمره.`,
        image: '/logo.png',
        author: 'طراح ارشد زیورآلات',
        date: '۱۴۰۲/۱۰/۲۲'
      }
    };

    return fallbackMap[idOrSlug] || {
      id: idOrSlug,
      title: 'مطلب مجله مرموریس',
      excerpt: 'بررسی جزئیات طراحی و ساخت کالکشن‌های مرموریس.',
      content: 'محتوای این مقاله در حال حاضر در دست تدوین و به‌روزرسانی توسط تحریریه برند مرموریس است. به‌زودی مطالب غنی‌تری در این بخش خدمت شما همراهان گرامی ارائه خواهد شد.',
      image: '/logo.png',
      author: 'مدیریت هنری مرموریس',
      date: '۱۴۰۲/۱۱/۰۱'
    };
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4" dir="rtl">
        <Loader2 className="w-10 h-10 text-brand-pink-dark animate-spin" />
        <p className="text-sm text-brand-stone">در حال بارگزاری مطلب وبلاگ...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-6 px-4" dir="rtl">
        <div className="p-4 bg-brand-pink-light border border-brand-pink/20 rounded-full inline-block">
          <BookOpen className="w-12 h-12 text-brand-pink-dark" />
        </div>
        <h1 className="text-xl font-bold text-brand-charcoal">مطلب مورد نظر یافت نشد</h1>
        <p className="text-xs text-brand-stone">شاید این پست حذف شده باشد یا آدرس آن تغییر کرده باشد.</p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 bg-brand-pink-dark text-white text-xs font-bold px-5 py-3 rounded-full hover:bg-brand-pink transition-colors cursor-pointer animate-pulse"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به وبلاگ
        </Link>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-right relative animate-fade-in animate-in" dir="rtl">
      
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-stone hover:text-brand-pink-dark transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          بازگشت به لیست مقالات وبلاگ
        </Link>
      </div>

      {/* Main Glassmorphic Layout Container */}
      <article className="bg-white border border-brand-pink/15 rounded-[32px] overflow-hidden shadow-lg shadow-brand-pink/5">
        
        {/* Large Header Image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-brand-cream">
          <Image
            src={post.featured_image || post.image || '/logo.png'}
            alt={post.title || "نوشته وبلاگ مرموریس"}
            fill
            sizes="100vw"
            priority
            referrerPolicy="no-referrer"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/70 via-brand-charcoal/20 to-transparent" />
          
          {/* Post Title Over Image */}
          <div className="absolute bottom-6 right-6 left-6 text-white space-y-2">
            <h1 className="text-xl md:text-3xl font-bold leading-tight drop-shadow-md">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Article Info & Body */}
        <div className="p-6 md:p-10 space-y-8">
          
          {/* Metadata Block */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-brand-pink/10">
            <div className="flex items-center gap-6 text-xs md:text-sm text-brand-stone">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-pink-dark" />
                <span>نویسنده: {
                  typeof post.author === 'object' && post.author !== null 
                    ? (post.author.full_name || post.author.name || 'مدیریت مرموریس') 
                    : (post.author || 'مدیریت مرموریس')
                }</span>
              </div>
            </div>

            {/* Micro Interactions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                  liked 
                    ? 'bg-brand-pink-light text-brand-pink-dark border-brand-pink/30' 
                    : 'bg-white text-brand-stone border-brand-pink/15 hover:text-rose-500 hover:bg-rose-50/50'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current text-rose-500' : ''}`} />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-full bg-white border border-brand-pink/15 text-brand-stone hover:text-brand-pink-dark hover:bg-brand-cream transition-all cursor-pointer relative"
                title="کپی لینک صفحه"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Full Rich Content */}
          <div className="text-brand-charcoal/95 text-sm md:text-base leading-relaxed space-y-6">
            {post.content.split('\n\n').map((paragraph, index) => {
              const cleanPara = DOMPurify.sanitize(paragraph);
              if (cleanPara.startsWith('###')) {
                return (
                  <h3 key={index} className="text-lg md:text-xl font-bold text-brand-charcoal pt-4 border-r-4 border-brand-pink-dark pr-2">
                    {cleanPara.replace('###', '').trim()}
                  </h3>
                );
              }
              return (
                <p key={index} className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: cleanPara }} />
              );
            })}
          </div>

          {/* Bottom Banner */}
          <div className="mt-12 p-6 md:p-8 bg-brand-cream rounded-[24px] border border-brand-pink/15 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-right">
              <p className="font-bold text-brand-charcoal text-sm md:text-base">علاقه‌مند به سبک و متریال مرموریس؟</p>
              <p className="text-xs text-brand-stone">از کالکشن کیف‌ها، زیورآلات و پوشاک ما دیدن فرمایید.</p>
            </div>
            <Link
              href="/products"
              className="bg-brand-pink-dark hover:bg-brand-pink text-white text-xs font-bold px-6 py-3 rounded-[16px] transition-colors shadow-sm cursor-pointer"
            >
              مشاهده محصولات
            </Link>
          </div>

        </div>

      </article>

      {/* Copied Feedback Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed bottom-10 left-10 bg-brand-pink-dark text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 z-50 border border-white/20"
          >
            <Check className="w-4 h-4 bg-white text-brand-pink-dark rounded-full p-0.5" />
            <span>لینک مطلب با موفقیت کپی شد.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

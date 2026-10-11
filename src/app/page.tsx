import { Metadata } from 'next';
import HomeClient from './HomeClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  title: 'مرموریس | فروشگاه آنلاین کیف، پوشاک و زیورآلات',
  description: 'خرید اینترنتی انواع کیف، پوشاک مینی‌مال زنانه و زیورآلات خاص با ضمانت کیفیت گالری مرموریس.',
  keywords: [
    'خرید کیف زنانه',
    'کیف زنانه',
    'گالری مرموریس',
    'پوشاک مینی‌مال',
    'زیورآلات و اکسسوری',
    'خرید آنلاین پوشاک',
    'marmoris store'
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'مرموریس | فروشگاه آنلاین کیف، پوشاک و زیورآلات',
    description: 'تولید و عرضه آنلاین کالکشن جدید کیف، پوشاک و زیورآلات با طراحی اختصاصی در گالری مرموریس.',
    url: siteUrl,
    siteName: 'مرموریس',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 800,
        height: 600,
        alt: 'گالری مرموریس',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مرموریس | گالری کیف، پوشاک و زیورآلات',
    description: 'خرید مستقیم از مرموریس با بهترین کیفیت و ارسال سریع',
    images: [`${siteUrl}/logo.png`],
  },
};

export default function HomePage() {
  return <HomeClient />;
}

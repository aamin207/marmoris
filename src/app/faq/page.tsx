import { Metadata } from 'next';
import FaqClient from './FaqClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  title: 'سوالات متداول | گالری مرموریس',
  description: 'پاسخ جامع به پرسش‌های متداول مشتریان در زمینه سفارش، نحوه ارسال مرسولات پستی، زمان تحویل و تعویض محصولات مرموریس.',
  keywords: ['سوالات متداول مرموریس', 'ارسال پستی مرموریس', 'پیگیری سفارش مرموریس', 'ضمانت تعویض مرموریس'],
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
  openGraph: {
    title: 'سوالات متداول خریداران گالری مرموریس',
    description: 'پاسخ به سوالات رایج درباره ثبت سفارش، نحوه پرداخت و نحوه ارسال مرسوله.',
    url: `${siteUrl}/faq`,
    siteName: 'مرموریس',
    type: 'website',
    images: [`${siteUrl}/logo.png`],
  },
};

export default function FaqPage() {
  return <FaqClient />;
}

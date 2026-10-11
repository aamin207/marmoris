import { Metadata } from 'next';
import OrderTrackingClient from './OrderTrackingClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  title: 'پیگیری آنلاین سفارش و مرسوله پستی | مرموریس',
  description: 'پیگیری سریع وضعیت ارسال مرسوله‌های پستی با کد رهگیری یا شماره سفارش در سیستم گالری مرموریس.',
  keywords: ['پیگیری سفارش مرموریس', 'رهگیری پستی', 'کد رهگیری مرموریس'],
  alternates: {
    canonical: `${siteUrl}/order-tracking`,
  },
  openGraph: {
    title: 'پیگیری آنلاین مرسوله‌های پستی مرموریس',
    description: 'استعلام لحظه‌ای وضعیت ارسال پستی سفارش با کد رهگیری.',
    url: `${siteUrl}/order-tracking`,
    siteName: 'مرموریس',
    type: 'website',
    images: [`${siteUrl}/logo.png`],
  },
};

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}

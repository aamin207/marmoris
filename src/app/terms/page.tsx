import { Metadata } from 'next';
import TermsClient from './TermsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  title: 'قوانین و مقررات | گالری مرموریس',
  description: 'قوانین و ضوابط خرید آنلاین، مرجوعی کالا، حریم خصوصی و استرداد وجه در فروشگاه اینترنتی مرموریس.',
  keywords: ['قوانین مرموریس', 'شرایط تعویض کالا', 'حریم خصوصی مرموریس'],
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'قوانین و شرایط استفاده از گالری مرموریس',
    description: 'قوانین و ضوابط ثبت سفارش و مرجوعی در فروشگاه مرموریس.',
    url: `${siteUrl}/terms`,
    siteName: 'مرموریس',
    type: 'website',
    images: [`${siteUrl}/logo.png`],
  },
};

export default function TermsPage() {
  return <TermsClient />;
}

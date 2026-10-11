import { Metadata } from 'next';
import BlogClient from './BlogClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  title: 'مجله و وبلاگ مرموریس | راهنمای مد و استایل',
  description: 'جدیدترین مقالات تخصصی درباره استایل زنانه، نحوه نگهداری از کیف و ایده‌های ست کردن زیورآلات در مجله مرموریس.',
  keywords: ['مجله مرموریس', 'وبلاگ استایل', 'مراقبت از کیف', 'مد و پوشاک', 'اخبار مرموریس'],
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: 'مجله و وبلاگ مرموریس | راهنمای مد و استایل',
    description: 'مقالات تخصصی درباره کیف، پوشاک و زیورآلات در مجله گالری مرموریس.',
    url: `${siteUrl}/blog`,
    siteName: 'مرموریس',
    type: 'website',
    images: [`${siteUrl}/logo.png`],
  },
};

export default function BlogPage() {
  return <BlogClient />;
}

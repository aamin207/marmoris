import { Metadata } from 'next';
import ContactUsClient from './ContactUsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  title: 'تماس با ما | پشتیبانی و گالری مرموریس',
  description: 'ارتباط با آتلیه و پشتیبانی گالری مرموریس. شماره تماس، شبکه‌های اجتماعی تلگرام و اینستاگرام و فرم ارسال مستقیم پیام.',
  keywords: ['تماس با مرموریس', 'پشتیبانی مرموریس', 'آدرس مرموریس', 'شماره تماس مرموریس'],
  alternates: {
    canonical: `${siteUrl}/contact-us`,
  },
  openGraph: {
    title: 'تماس با گالری و پشتیبانی مرموریس',
    description: 'راه ارتباط مستقیم با پشتیبانی و آتلیه مرموریس.',
    url: `${siteUrl}/contact-us`,
    siteName: 'مرموریس',
    type: 'website',
    images: [`${siteUrl}/logo.png`],
  },
};

export default function ContactUsPage() {
  return <ContactUsClient />;
}

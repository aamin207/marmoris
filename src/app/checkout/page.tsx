import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'نهایی‌سازی سفارش و ثبت آدرس | مرموریس',
  description: 'تکمیل مشخصات گیرنده و نهایی‌سازی خرید از گالری مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

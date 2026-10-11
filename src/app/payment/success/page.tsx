import { Metadata } from 'next';
import PaymentSuccessClient from './PaymentSuccessClient';

export const metadata: Metadata = {
  title: 'پرداخت موفق سفارش | مرموریس',
  description: 'نتیجه موفقیت‌آمیز پرداخت و ثبت نهایی سفارش در مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessClient />;
}

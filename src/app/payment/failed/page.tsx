import { Metadata } from 'next';
import PaymentFailedClient from './PaymentFailedClient';

export const metadata: Metadata = {
  title: 'پرداخت ناموفق | مرموریس',
  description: 'نتیجه ناموفق تراکنش پرداخت در مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentFailedPage() {
  return <PaymentFailedClient />;
}

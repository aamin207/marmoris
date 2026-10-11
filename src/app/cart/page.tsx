import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'سبد خرید | مرموریس',
  description: 'مدیریت و مشاهده اقلام موجود در سبد خرید گالری مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartClient />;
}

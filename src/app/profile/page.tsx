import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'حساب کاربری من | مرموریس',
  description: 'مدیریت مشخصات شخصی، تاریخچه سفارشات و کدهای رهگیری پستی کاربر در مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}

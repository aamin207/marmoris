import { Metadata } from 'next';
import AuthClient from './AuthClient';

export const metadata: Metadata = {
  title: 'ورود یا ثبت‌نام | مرموریس',
  description: 'ورود به حساب کاربری یا ثبت‌نام جدید با شماره موبایل در گالری مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return <AuthClient />;
}

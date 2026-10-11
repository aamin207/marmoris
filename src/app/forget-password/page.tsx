import { Metadata } from 'next';
import ForgetPasswordClient from './ForgetPasswordClient';

export const metadata: Metadata = {
  title: 'بازیابی رمز عبور | مرموریس',
  description: 'بازیابی کلمه عبور حساب کاربری مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgetPasswordPage() {
  return <ForgetPasswordClient />;
}

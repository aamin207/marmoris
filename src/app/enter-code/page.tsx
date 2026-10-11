import { Metadata } from 'next';
import EnterCodeClient from './EnterCodeClient';

export const metadata: Metadata = {
  title: 'تایید کد پیامک | مرموریس',
  description: 'ورود کد تایید پیامک شده برای احراز هویت در سیستم مرموریس.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EnterCodePage() {
  return <EnterCodeClient />;
}

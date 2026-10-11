import { Metadata } from 'next';
import OrderDetailClient from './OrderDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `فاکتور سفارش ${resolvedParams.id} | مرموریس`,
    description: 'مشاهده فاکتور و وضعیت سفارش خریدار در گالری مرموریس.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Page({ params }: Props) {
  return <OrderDetailClient />;
}

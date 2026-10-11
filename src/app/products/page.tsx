import { Metadata } from 'next';
import ProductsClient from './ProductsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) || {};
  const queryParts: string[] = [];
  
  if (resolvedSearchParams.category) {
    queryParts.push(`category=${encodeURIComponent(String(resolvedSearchParams.category))}`);
  }
  if (resolvedSearchParams.search) {
    queryParts.push(`search=${encodeURIComponent(String(resolvedSearchParams.search))}`);
  }
  
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const canonicalUrl = `${siteUrl}/products${queryString}`;

  return {
    title: 'فروشگاه و لیست محصولات | کیف، پوشاک و زیورآلات مرموریس',
    description: 'مشاهده و خرید آنلاین انواع کیف، پوشاک مینی‌مال زنانه و زیورآلات خاص در کاتالوگ جامع گالری مرموریس با فیلتر قیمت و دسته‌بندی.',
    keywords: ['محصولات مرموریس', 'کیف زنانه', 'پوشاک زنانه', 'زیورآلات', 'خرید آنلاین کیف و لباس'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'کاتالوگ جامع محصولات مرموریس',
      description: 'مجموعه کامل کیف، پوشاک و زیورآلات خاص برند مرموریس.',
      url: canonicalUrl,
      siteName: 'مرموریس',
      type: 'website',
      images: [`${siteUrl}/logo.png`],
    },
  };
}

export default function ProductsPage() {
  return <ProductsClient />;
}

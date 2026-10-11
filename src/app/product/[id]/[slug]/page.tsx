import { Metadata } from 'next';
import { getProductBySlugOrId, getSlug } from '@/lib/apiClient';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlugOrId(resolvedParams.id);

  if (!product) {
    return {
      title: 'محصول یافت نشد | گالری مرموریس',
      description: 'محصول مورد نظر شما در فروشگاه مرموریس پیدا نشد.',
      robots: { index: false, follow: true },
    };
  }

  const title = product.title || (product as any).name || 'محصول مرموریس';
  const rawDesc = product.description || '';
  const description = rawDesc.replace(/<[^>]*>?/gm, '').trim().slice(0, 160) || `خرید اینترنتی ${title} با کیفیت ممتاز و دوخت اختصاصی از گالری مرموریس.`;
  const canonicalUrl = `${siteUrl}/product/${product.id}/${getSlug(title)}`;
  const mainImage = product.images?.[0] || `${siteUrl}/logo.png`;

  return {
    title: `${title} | گالری مرموریس`,
    description,
    keywords: [title, product.category || '', 'خرید کیف دست دوز', 'پوشاک مرموریس', 'زیورآلات مرموریس'].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | گالری مرموریس`,
      description,
      url: canonicalUrl,
      siteName: 'مرموریس',
      type: 'website',
      images: [
        {
          url: mainImage,
          width: 800,
          height: 800,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | مرموریس`,
      description,
      images: [mainImage],
    },
  };
}

export default function Page({ params }: Props) {
  return <ProductDetailClient params={params} />;
}

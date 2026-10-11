import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getProductBySlugOrId, getSlug } from '@/lib/apiClient';

interface Props {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlugOrId(resolvedParams.id);

  if (!product) {
    return {
      title: 'محصول یافت نشد | مرموریس',
      robots: { index: false, follow: true },
    };
  }

  const title = product.title || (product as any).name || 'محصول مرموریس';
  const slug = getSlug(title);

  return {
    title: `${title} | گالری مرموریس`,
    description: `خرید آنلاین ${title} از برند مرموریس`,
    alternates: {
      canonical: `${siteUrl}/product/${product.id}/${slug}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProductBySlugOrId(resolvedParams.id);
  if (product) {
    const slug = getSlug(product.title);
    redirect(`/product/${product.id}/${slug}`);
  } else {
    redirect('/products');
  }
}


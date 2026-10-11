import { Metadata } from 'next';
import { getBlogPost, getSlug } from '@/lib/apiClient';
import BlogPostClient from './BlogPostClient';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.id);

  if (!post) {
    return {
      title: 'مقاله یافت نشد | مجله مرموریس',
      description: 'مقاله مورد نظر در مجله مرموریس پیدا نشد.',
      robots: { index: false, follow: true },
    };
  }

  const title = post.title || 'مقاله مرموریس';
  const rawContent = post.content || post.excerpt || '';
  const description = rawContent.replace(/<[^>]*>?/gm, '').trim().slice(0, 160) || `مطالعه مقاله ${title} در مجله و وبلاگ مرموریس.`;
  const canonicalUrl = `${siteUrl}/blog/${post.id}/${getSlug(title)}`;
  const mainImage = post.image || `${siteUrl}/logo.png`;

  return {
    title: `${title} | مجله مرموریس`,
    description,
    keywords: [title, 'مجله مرموریس', 'استایل و مد', 'وبلاگ مرموریس'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | مجله مرموریس`,
      description,
      url: canonicalUrl,
      siteName: 'مرموریس',
      type: 'article',
      publishedTime: post.date,
      authors: ['مرموریس'],
      images: [
        {
          url: mainImage,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | مجله مرموریس`,
      description,
      images: [mainImage],
    },
  };
}

export default function Page({ params }: Props) {
  return <BlogPostClient params={params} />;
}

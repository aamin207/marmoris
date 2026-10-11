import type { MetadataRoute } from 'next';
import { getProducts, getCategories, getBlogPosts, getSlug } from '@/lib/apiClient';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

  // Static site pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/order-tracking`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic Product pages
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    if (Array.isArray(products)) {
      productUrls = products.map((product) => ({
        url: `${baseUrl}/product/${product.id}/${getSlug(product.title || (product as any).name || '')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error for products:', error);
  }

  // Dynamic Blog pages
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await getBlogPosts();
    if (Array.isArray(blogPosts)) {
      blogUrls = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.id}/${getSlug(post.title)}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error for blog posts:', error);
  }

  // Dynamic Category pages
  let categoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    if (Array.isArray(categories)) {
      categoryUrls = categories.map((cat) => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(cat.slug || cat.id)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error for categories:', error);
  }

  return [...staticPages, ...categoryUrls, ...productUrls, ...blogUrls];
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { getBlogPosts, getSlug } from '@/lib/apiClient';
import { BlogPost } from '@/types';
import { Calendar, User, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getBlogPosts();
        setPosts(data || []);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-right relative animate-fade-in" dir="rtl">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-10 right-20 w-80 h-80 bg-brand-pink/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-20 w-80 h-80 bg-brand-pink/5 rounded-full blur-3xl -z-10" />

      {/* Header section */}
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 bg-brand-pink-light border border-brand-pink/25 px-4 py-1.5 rounded-full text-xs font-bold text-brand-pink-dark">
          <BookOpen className="w-4 h-4 text-brand-pink-dark" />
          مجله و وبلاگ مرموریس
        </div>
        <h1 className="text-3xl font-bold text-brand-charcoal md:text-4xl">خواندنی‌های مرموریس</h1>
        <p className="text-xs md:text-sm text-brand-stone max-w-lg mx-auto leading-relaxed">
          جدیدترین مطالب علمی، آموزش‌ها، اصول ست کردن استایل مینی‌مال و اخبار دنیای مد و پوشاک.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-brand-pink-dark animate-spin" />
          <p className="text-xs text-brand-stone/60">در حال دریافت جدیدترین مطالب وبلاگ...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-brand-pink/15 rounded-[28px] p-12 text-center text-xs font-bold text-brand-stone max-w-md mx-auto">
          در حال حاضر مطلبی در وبلاگ ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => {
            const blogUrl = `/blog/${post.id}/${getSlug(post.title)}`;
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="group bg-white border border-brand-pink/15 rounded-[24px] overflow-hidden flex flex-col h-full shadow-md shadow-brand-pink/5 hover:shadow-lg hover:border-brand-pink/35 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Post Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream">
                  <Image
                    src={post.featured_image || post.image || '/logo.png'}
                    alt={post.title || "نوشته وبلاگ مرموریس"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Post Body */}
                <div className="p-6 md:p-7 flex flex-col flex-1 space-y-4 justify-between">
                  <div className="space-y-3">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[11px] text-brand-stone/60">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-brand-pink-dark" />
                        <span>
                          {typeof post.author === 'object' && post.author !== null 
                            ? (post.author.full_name || post.author.name || 'مدیریت مرموریس') 
                            : (post.author || 'مدیریت مرموریس')}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="font-bold text-brand-charcoal text-base md:text-lg leading-snug group-hover:text-brand-pink-dark transition-colors duration-200">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs text-brand-stone leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Read more action */}
                  <div className="pt-2 border-t border-brand-cream">
                    <Link
                      href={blogUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink-dark hover:text-brand-pink transition-colors cursor-pointer"
                    >
                      مطالعه کامل مطلب
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}

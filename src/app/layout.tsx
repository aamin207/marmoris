/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import ClientProviders from '@/app/providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfflineIndicator from '@/components/OfflineIndicator';
import '@/index.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmoris.store';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'مرموریس | فروشگاه آنلاین کیف، پوشاک و زیورآلات',
    template: '%s | مرموریس',
  },
  description: 'مرموریس — فروشگاه آنلاین کیف، پوشاک مینی‌مال و زیورآلات با کیفیت ممتاز و طراحی اختصاصی. ارسال به سراسر ایران.',
  keywords: [
    'مرموریس',
    'کیف زنانه',
    'کیف دوشی',
    'پوشاک زنانه',
    'جواهرات و زیورآلات',
    'گالری مرموریس',
    'خرید آنلاین کیف',
    'خرید پوشاک خاص',
    'زیورآلات و اکسسوری',
    'marmoris',
    'marmoris store'
  ],
  authors: [{ name: 'مرموریس', url: siteUrl }],
  creator: 'مرموریس',
  publisher: 'گالری مرموریس',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'مرموریس | فروشگاه کیف، پوشاک و زیورآلات',
    description: 'تولید و فروش کیف، پوشاک اختصاصی و زیورآلات با کیفیت بالا. ارسال به سراسر ایران.',
    url: siteUrl,
    siteName: 'مرموریس',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 800,
        height: 600,
        alt: 'لوگو گالری مرموریس',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مرموریس | فروشگاه کیف، پوشاک و زیورآلات',
    description: 'خرید اینترنتی کیف، پوشاک و زیورآلات گالری مرموریس با ارسال سریع',
    images: [`${siteUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#E0A899',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': `${siteUrl}/#store`,
        'name': 'مرموریس',
        'url': siteUrl,
        'logo': `${siteUrl}/logo.png`,
        'image': `${siteUrl}/logo.png`,
        'description': 'گالری تولید و فروش آنلاین کیف، پوشاک اختصاصی و زیورآلات با کیفیت ممتاز',
        'telephone': '+989100410340',
        'priceRange': '$$',
        'address': {
          '@type': 'PostalAddress',
          'addressCountry': 'IR',
          'addressLocality': 'تهران',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        'url': siteUrl,
        'name': 'مرموریس',
        'description': 'فروشگاه اینترنتی کیف، پوشاک و زیورآلات مرموریس',
        'inLanguage': 'fa-IR',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${siteUrl}/products?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="bg-brand-cream text-brand-charcoal antialiased selection:bg-brand-pink/30 selection:text-brand-charcoal" suppressHydrationWarning>
        <ClientProviders>
          {/* Main luxury background container with glowing ambient spheres */}
          <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-brand-cream">
            
            {/* Ambient Background Glow Spotlights */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-pink/20 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-brand-pink-dark/10 rounded-full blur-[180px] pointer-events-none -z-10" />
            
            {/* Header Navbar */}
            <Navbar />

            {/* Main Content Stage */}
            <main className="flex-grow py-6 md:py-10">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Offline Fallback Indicator */}
            <OfflineIndicator />
          </div>
        </ClientProviders>
        <Script
          id="goftino-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(){var i="pdGwTL",a=window,d=document;function g(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.async=!0,g.src=l?s+"?o="+l:s;d.getElementsByTagName("head")[0].appendChild(g);}"complete"===d.readyState?g():a.attachEvent?a.attachEvent("onload",g):a.addEventListener("load",g,!1);}();`,
          }}
        />
      </body>
    </html>
  );
}

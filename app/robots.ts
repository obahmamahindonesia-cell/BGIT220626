import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/framework',
          '/levels',
          '/products',
          '/verify',
          '/waitlist',
          '/partnership',
        ],
        disallow: [
          '/dashboard',
          '/profile',
          '/test',
          '/test/start',
          '/test/',
          '/certificates',
          '/settings',
          '/api',
          '/admin',
          '/callback',
        ],
      },
    ],
    sitemap: 'https://bahasacerdas.site/sitemap.xml',
  }
}

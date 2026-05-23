import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Block all bots by default
      {
        userAgent: '*',
        disallow: '/',
      },
      // Allow only major search engine crawlers — landing page only
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/$',   // $ anchors to exact match: only root "/"
        disallow: '/',  // disallow everything else (more specific allow wins)
      },
    ],
  }
}

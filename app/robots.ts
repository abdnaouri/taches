export const runtime = 'edge';

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const privateDisallows = [
    '/api/',
    '/admin/',
    '/*/admin/',
    '/wallet',
    '/*/wallet',
    '/checkout/',
    '/*/checkout/',
    '/profile',
    '/*/profile',
    '/task/new',
    '/*/task/new',
    '/tasks/new',
    '/*/tasks/new',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallows,
      },
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'Applebot',
          'CCBot',
          'Google-Extended',
          'Amazonbot',
        ],
        allow: '/',
        disallow: privateDisallows,
      },
    ],
    sitemap: 'https://taches.ma/sitemap.xml',
  };
}

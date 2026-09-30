import { MetadataRoute } from 'next';
import { TASK_CATEGORIES } from '@/lib/categories';
import { SEO_SERVICES } from '@/lib/seoLandings';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://taches.ma';
  const lastModified = new Date();

  // Core static & navigation routes
  const staticPaths = [
    '',
    '/fr',
    '/ar',
    '/fr/freelance-maroc',
    '/ar/freelance-maroc',
    '/fr/tasks',
    '/ar/tasks',
    '/fr/concepts',
    '/ar/concepts',
    '/fr/wallet',
    '/ar/wallet',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: (path.includes('tasks') ? 'hourly' : 'daily') as 'hourly' | 'daily',
    priority: path === '' || path === '/fr' || path.includes('freelance-maroc') ? 1.0 : 0.8,
  }));

  // Dedicated Programmatic SEO Service Landing Pages
  const serviceEntries: MetadataRoute.Sitemap = SEO_SERVICES.flatMap((service) => [
    {
      url: `${baseUrl}/fr/services/${service.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/ar/services/${service.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]);

  // Category specific filter URLs
  const categoryEntries: MetadataRoute.Sitemap = TASK_CATEGORIES.flatMap((cat) => [
    {
      url: `${baseUrl}/fr/tasks?category=${cat.id}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/ar/tasks?category=${cat.id}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]);

  return [...staticEntries, ...serviceEntries, ...categoryEntries];
}

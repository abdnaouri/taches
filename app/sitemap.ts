export const runtime = 'edge';

import { MetadataRoute } from 'next';
import { SEO_SERVICES } from '@/lib/seoLandings';
import { MOROCCAN_CITIES } from '@/lib/moroccanCities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://taches.ma';
  const lastModified = new Date();

  // Core Static Pillars & Functional Routes (Canonical & Alternate Pairs)
  const coreRoutes = [
    {
      slug: '',
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      slug: 'freelance-maroc',
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      slug: 'tasks',
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      slug: 'concepts',
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      slug: 'daman',
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      slug: 'terms',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      slug: 'privacy',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  const coreEntries: MetadataRoute.Sitemap = coreRoutes.flatMap((route) => {
    const frPath = route.slug ? `/fr/${route.slug}` : '/fr';
    const arPath = route.slug ? `/ar/${route.slug}` : '/ar';

    return [
      {
        url: `${baseUrl}${frPath}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            'x-default': `${baseUrl}${frPath}`,
            'fr-MA': `${baseUrl}${frPath}`,
            'ar-MA': `${baseUrl}${arPath}`,
          },
        },
      },
      {
        url: `${baseUrl}${arPath}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            'x-default': `${baseUrl}${frPath}`,
            'fr-MA': `${baseUrl}${frPath}`,
            'ar-MA': `${baseUrl}${arPath}`,
          },
        },
      },
    ];
  });

  // Dedicated City Clusters (Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir)
  const cityEntries: MetadataRoute.Sitemap = MOROCCAN_CITIES.flatMap((city) => {
    const frUrl = `${baseUrl}/fr/freelance-maroc/${city.slug}`;
    const arUrl = `${baseUrl}/ar/freelance-maroc/${city.slug}`;

    return [
      {
        url: frUrl,
        lastModified,
        changeFrequency: 'daily' as const,
        priority: 0.95,
        alternates: {
          languages: {
            'x-default': frUrl,
            'fr-MA': frUrl,
            'ar-MA': arUrl,
          },
        },
      },
      {
        url: arUrl,
        lastModified,
        changeFrequency: 'daily' as const,
        priority: 0.9,
        alternates: {
          languages: {
            'x-default': frUrl,
            'fr-MA': frUrl,
            'ar-MA': arUrl,
          },
        },
      },
    ];
  });

  // Dedicated Programmatic SEO Landing Pages for Specialized High-Intent Services
  const serviceEntries: MetadataRoute.Sitemap = SEO_SERVICES.flatMap((service) => {
    const frUrl = `${baseUrl}/fr/services/${service.slug}`;
    const arUrl = `${baseUrl}/ar/services/${service.slug}`;

    return [
      {
        url: frUrl,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.95,
        alternates: {
          languages: {
            'x-default': frUrl,
            'fr-MA': frUrl,
            'ar-MA': arUrl,
          },
        },
      },
      {
        url: arUrl,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
        alternates: {
          languages: {
            'x-default': frUrl,
            'fr-MA': frUrl,
            'ar-MA': arUrl,
          },
        },
      },
    ];
  });

  return [...coreEntries, ...cityEntries, ...serviceEntries];
}

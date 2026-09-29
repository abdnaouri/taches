import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://taches.ma';
  const lastModified = new Date();

  const routes = [
    '',
    '/fr',
    '/ar',
    '/tasks',
    '/fr/tasks',
    '/ar/tasks',
    '/wallet',
    '/fr/wallet',
    '/ar/wallet',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route.includes('tasks') ? 'hourly' : 'daily',
    priority: route === '' || route === '/fr' ? 1.0 : 0.8,
  }));
}

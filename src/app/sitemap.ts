import pkg from '@/package.json';
import type { MetadataRoute } from 'next';

const routes = ['', '/about', '/contact', '/pricing'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${pkg.homepage}${route}`,
    lastModified: new Date(),
  }));
}

import pkg from '@/package.json';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    host: pkg.homepage,
    sitemap: `${pkg.homepage}/sitemap.xml`,
  };
}

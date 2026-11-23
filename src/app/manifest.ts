import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Budget Planner',
    short_name: 'Budget Planner',
    description: 'A simple budget planner app.',
    start_url: '/',
    display: 'standalone',
    background_color: '#212529',
    theme_color: '#212529',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

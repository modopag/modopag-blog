import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://modopag.com.br',
  base: '/blog',
  output: 'server',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  adapter: vercel({
    maxDuration: 30,
    imageService: true,
    devImageService: 'sharp',
    isr: {
      expiration: 60,
    },
    functionPerRoute: false,
  }),
  integrations: [tailwind(), react()],
  vite: {
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
  },
  image: {
    domains: ['acxelejbtjjkttfwrdbi.supabase.co'],
    remotePatterns: [{ protocol: 'https' }],
  },
});

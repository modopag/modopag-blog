import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://blog.modopag.com.br',
  base: '/',
  trailingSlash: 'always',
  output: 'server',
  adapter: vercel({
    maxDuration: 30,
  }),
  prefetch: {
    // Prefetch links on hover (fastest perceived performance)
    defaultStrategy: 'hover',
    // Also prefetch links when they enter viewport
    prefetchAll: true,
  },
  integrations: [tailwind(), react()],
  build: {
    assets: '_astro',
  },
  vite: {
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
    build: {
      cssMinify: true,
      minify: 'esbuild',
    },
  },
});

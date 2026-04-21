import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://blog.modopag.com.br',
  base: '/',
  trailingSlash: 'always',
  output: 'server',
  adapter: cloudflare(),
  prefetch: {
    // Prefetch only on hover (reduces network requests)
    defaultStrategy: 'hover',
    prefetchAll: false,
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
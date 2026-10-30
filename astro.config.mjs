import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://blog.modopag.com.br',
  base: '/',
  trailingSlash: 'always',
  output: 'server',
  // Cloudflare Pages (SSR em Worker). Sem `functions/` na raiz: o adapter gera
  // _worker.js e o proxy /img/* é rota Astro (src/pages/img/[...path].ts).
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
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

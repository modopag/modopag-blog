import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://modopag.com.br',
  base: '/blog',
  output: 'server',
  adapter: vercel({
    isr: {
      expiration: 60,
    },
    edgeMiddleware: true,
  }),
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
  },
  image: {
    domains: ['acxelejbtjjkttfwrdbi.supabase.co'],
  },
});

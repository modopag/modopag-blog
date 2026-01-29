import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://modopag.com.br',
  base: '/blog',
  output: 'server',
  adapter: vercel({
    maxDuration: 30,
  }),
  integrations: [tailwind(), react()],
});

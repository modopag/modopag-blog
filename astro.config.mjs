import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  // Blog hospedado no subdomínio dedicado blog.modopag.com.br.
  // Roteado direto via Cloudflare Pages custom domain — sem Workers Route.
  site: 'https://blog.modopag.com.br',
  trailingSlash: 'always',
  output: 'server',
  // Cloudflare Pages adapter — Workers runtime (V8 isolates).
  // mode: 'directory' produz functions/ que Pages monta automaticamente.
  // platformProxy.enabled habilita acesso ao runtime nas previews/local dev.
  adapter: cloudflare({
    mode: 'directory',
    platformProxy: {
      enabled: true,
    },
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
      // supabase-js precisa ser bundlado pra evitar incompatibilidades com Workers
      noExternal: ['@supabase/supabase-js'],
    },
    build: {
      cssMinify: true,
      minify: 'esbuild',
    },
  },
});

import type { APIRoute } from 'astro';

/**
 * Proxy de imagens do Supabase Storage com cache no edge.
 *
 * URL pública: https://blog.modopag.com.br/img/posts/foo.webp
 * Origem:      https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images/posts/foo.webp
 *
 * Por que rota Astro em vez de Pages Function (functions/img/[[path]].ts):
 * o @astrojs/cloudflare em mode 'directory' gera _worker.js advanced mode no
 * dist. Quando há `functions/` na raiz do repo, o Cloudflare Pages prioriza
 * Pages Functions e ignora o _worker.js do Astro — resultado: tudo que não é
 * /img/* cai em 404 universal (rota raiz, posts, etc.).
 *
 * Mantendo o proxy como rota SSR do Astro, o _worker.js gerado já cobre TODAS
 * as rotas (incluindo /img/*) e o conflito some.
 *
 * Cache headers replicados em public/_headers pra /img/*.
 */

const SUPABASE_BUCKET_URL =
  'https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  // params.path vem do catch-all [...path] como string (segmentos joined por '/').
  // Ex: /img/posts/foo.webp → params.path = 'posts/foo.webp'
  const rawPath = params.path;
  if (!rawPath) {
    return new Response('Not Found', { status: 404 });
  }

  // Re-encode cada segmento mantendo barras de path intactas
  const subpath = rawPath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  const upstreamUrl = `${SUPABASE_BUCKET_URL}/${subpath}`;

  // Cache no edge da Cloudflare. caches.default só existe no runtime Workers
  // (não em build/dev local). Em fallback, segue sem cache.
  const cache = (globalThis as { caches?: { default: Cache } }).caches?.default;
  const cacheKey = new Request(request.url, request);

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  // Busca da origem (Supabase Storage). A opção cf é específica do Workers
  // runtime e cacheia o asset no CDN da Cloudflare também.
  const upstreamResponse = await fetch(upstreamUrl, {
    // @ts-expect-error — opção cf é específica do Cloudflare Workers
    cf: { cacheTtl: 31536000, cacheEverything: true },
  });

  if (!upstreamResponse.ok) {
    return new Response('Image not found', { status: upstreamResponse.status });
  }

  // Reconstrói resposta com headers de cache imutável (1 ano)
  const headers = new Headers(upstreamResponse.headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Proxy-Source', 'supabase-storage');

  const response = new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });

  // Armazena no cache do edge. Em SSR Astro não temos waitUntil direto, mas
  // o cache.put é fire-and-forget aceitável aqui — o response.clone() já tá
  // pronto pra ser lido pela cache enquanto o original retorna pro browser.
  if (cache) {
    cache.put(cacheKey, response.clone()).catch(() => {
      /* swallow cache write errors */
    });
  }

  return response;
};

import { defineMiddleware } from 'astro:middleware';

// Migração Vercel → Cloudflare (30/10/2026).
//
// 1) Proxy de imagens do Supabase Storage em /img/* (na Vercel era um rewrite
//    do vercel.json). Vive no middleware, não numa rota: com
//    `trailingSlash: 'always'` uma rota /img/[...path] não casa
//    "/img/posts/foo.webp" (sem barra final) e cai na 404. Cache no edge
//    (caches.default) + Cache-Control imutável, como antes.
// 2) HTML/XML: edge 60 s (+30 s SWR) e navegador sempre revalidando; a zona
//    tem browser_cache_ttl de 4 h e por isso existe a Cache Rule "respeitar a
//    origem" para o host. Assets com hash (/_astro/*) seguem imutáveis pelo
//    public/_headers.
const SUPABASE_BUCKET_URL =
  'https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images';

async function proxyImagem(request: Request, pathname: string): Promise<Response> {
  const subpath = pathname
    .slice('/img/'.length)
    .split('/')
    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
    .join('/');
  if (!subpath) return new Response('Not Found', { status: 404 });
  const cache = (globalThis as { caches?: { default: Cache } }).caches?.default;
  const cacheKey = new Request(new URL(pathname, request.url).toString(), { method: 'GET' });
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }
  const upstream = await fetch(`${SUPABASE_BUCKET_URL}/${subpath}`, {
    // @ts-expect-error — opção só do runtime da Cloudflare
    cf: { cacheTtl: 31536000, cacheEverything: true },
  });
  if (!upstream.ok) return new Response('Image not found', { status: upstream.status });
  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Proxy-Source', 'supabase-storage');
  const response = new Response(upstream.body, { status: upstream.status, headers });
  if (cache) cache.put(cacheKey, response.clone()).catch(() => {});
  return response;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  if (pathname.startsWith('/img/') && ctx.request.method === 'GET') {
    return proxyImagem(ctx.request, pathname);
  }
  const res = await next();
  const tipo = res.headers.get('content-type') || '';
  if (tipo.includes('text/html') || tipo.includes('application/xml') || tipo.includes('text/xml')) {
    // Cache curto no EDGE (aprovado 30/10): 60 s + 30 s de stale-while-revalidate,
    // só para 200. Navegador sempre revalida (max-age=0). A Cache Rule do host
    // respeita estes headers; uma edição no painel aparece em ≤ 60 s. Purge por
    // URL na publicação fica para quando a EF do painel tiver a chave da zona.
    res.headers.set('Cache-Control', res.status === 200
      ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=30'
      : 'no-store, max-age=0, must-revalidate');
  }
  return res;
});

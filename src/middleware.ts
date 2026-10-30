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

// Cache de HTML no edge (aprovado 30/10): rota de Worker não passa pelo cache da
// CDN, então o cache é feito aqui com a Cache API (caches.default), TTL 60 s
// (s-maxage). Chave = URL sem query (o HTML não depende de utm/origem). Só GET
// 200 HTML. Navegador sempre revalida (max-age=0). Purge por URL em
// /api/cache-purge?url=<caminho>&key=<INDEXNOW_KEY> (a chave do IndexNow é
// pública por desenho — serve só para o painel invalidar ao publicar/editar).
const TTL_HTML = 60;

function chaveDeCache(url: URL): Request {
  const limpa = new URL(url.toString());
  limpa.search = '';
  limpa.hash = '';
  return new Request(limpa.toString(), { method: 'GET' });
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  const cache = (globalThis as { caches?: { default: Cache } }).caches?.default;
  const runtime = (ctx.locals as { runtime?: { ctx?: { waitUntil(p: Promise<unknown>): void } } }).runtime;
  if (pathname.startsWith('/img/') && ctx.request.method === 'GET') {
    return proxyImagem(ctx.request, pathname);
  }
  // com trailingSlash 'always' o Astro redireciona /api/cache-purge → /api/cache-purge/ antes do middleware; aceitar os dois
  if (pathname.replace(/\/$/, '') === '/api/cache-purge') {
    const alvo = ctx.url.searchParams.get('url') || '';
    const key = ctx.url.searchParams.get('key') || '';
    const esperada = (import.meta.env.INDEXNOW_KEY as string | undefined) || '';
    if (!esperada || key !== esperada) return new Response('forbidden', { status: 403 });
    if (!cache || !alvo.startsWith('/')) return new Response('bad request', { status: 400 });
    const ok = await cache.delete(chaveDeCache(new URL(alvo, ctx.url.origin)));
    return new Response(JSON.stringify({ purged: ok, url: alvo }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  const cacheavel = ctx.request.method === 'GET' && cache;
  const chave = cacheavel ? chaveDeCache(ctx.url) : null;
  if (chave) {
    const hit = await cache.match(chave);
    if (hit) {
      const r = new Response(hit.body, hit);
      r.headers.set('X-Blog-Cache', 'HIT');
      return r;
    }
  }
  const res = await next();
  const tipo = res.headers.get('content-type') || '';
  const ehHtml = tipo.includes('text/html') || tipo.includes('application/xml') || tipo.includes('text/xml');
  if (!ehHtml) return res;
  if (res.status !== 200) {
    res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return res;
  }
  res.headers.set('Cache-Control', `public, max-age=0, s-maxage=${TTL_HTML}`);
  res.headers.set('X-Blog-Cache', 'MISS');
  if (chave) {
    const copia = res.clone();
    const put = cache.put(chave, copia).catch(() => {});
    if (runtime?.ctx?.waitUntil) runtime.ctx.waitUntil(put); else await put;
  }
  return res;
});

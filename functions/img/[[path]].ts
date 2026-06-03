/**
 * Pages Function — proxy de imagens do Supabase Storage com cache no edge.
 *
 * Substitui o rewrite externo do vercel.json (que Cloudflare Pages não suporta
 * em redirects status 200). Vantagem extra: a imagem é cacheada no
 * blog.modopag.com.br via Cache API do Cloudflare, em vez de bater no Supabase
 * a cada request.
 *
 * URL pública: https://blog.modopag.com.br/img/posts/foo.webp
 * Origem real: https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images/posts/foo.webp
 *
 * Cache headers de saída (configurados em /public/_headers para /img/*):
 *   Cache-Control: public, max-age=31536000, immutable
 */

const SUPABASE_BUCKET_URL =
  'https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images'

interface Env {
  // Nenhuma binding precisa por enquanto. Mantemos a interface vazia
  // pra estender depois (ex: KV pra fallback metadata).
  [key: string]: unknown
}

interface Params {
  path?: string[]
}

interface PagesFunctionContext<EnvT = unknown, ParamsT = Record<string, unknown>> {
  request: Request
  env: EnvT
  params: ParamsT
  waitUntil(promise: Promise<unknown>): void
  next: () => Promise<Response>
}

export const onRequestGet = async (
  context: PagesFunctionContext<Env, Params>,
): Promise<Response> => {
  const { request, params, waitUntil } = context

  // params.path vem do catch-all [[path]] como array de segmentos.
  // Ex: /img/posts/foo.webp → params.path = ['posts', 'foo.webp']
  const pathSegments = Array.isArray(params.path) ? params.path : []
  if (pathSegments.length === 0) {
    return new Response('Not Found', { status: 404 })
  }

  const subpath = pathSegments.map((seg) => encodeURIComponent(seg)).join('/')
  const upstreamUrl = `${SUPABASE_BUCKET_URL}/${subpath}`

  // Cache key derivado da URL do request (preserva query strings se houver)
  const cacheKey = new Request(request.url, request)
  // @ts-expect-error — caches.default existe no runtime de Workers
  const cache = caches.default
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  // Busca da origem (Supabase Storage)
  const upstreamResponse = await fetch(upstreamUrl, {
    // cf-specific: cache no nível de CDN da Cloudflare também
    // @ts-expect-error — opção cf é específica do Cloudflare Workers
    cf: { cacheTtl: 31536000, cacheEverything: true },
  })

  if (!upstreamResponse.ok) {
    return new Response('Image not found', { status: upstreamResponse.status })
  }

  // Reconstrói resposta com headers de cache imutável (1 ano)
  const headers = new Headers(upstreamResponse.headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('X-Proxy-Source', 'supabase-storage')

  const response = new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  })

  // Armazena no cache do edge — assíncrono pra não bloquear a resposta
  waitUntil(cache.put(cacheKey, response.clone()))

  return response
}

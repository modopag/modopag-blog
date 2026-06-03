/**
 * YouTube Lite façade — substitui o iframe pesado do Tiptap YouTube extension
 * por uma thumbnail estática + play button. O iframe real só é injetado no
 * clique do usuário (lazy load on interaction).
 *
 * Spec: economiza ~1.2MB de JS por vídeo no LCP. Compatível com View Transitions.
 *
 * Formato esperado de entrada (do editor Tiptap):
 *   <div data-youtube-video>
 *     <iframe src="https://www.youtube-nocookie.com/embed/{ID}?..." ...></iframe>
 *   </div>
 *
 * Saída: façade HTML com thumbnail + play button. CSS em src/styles/global.css
 * (classes .mp-youtube-lite, .mp-yt-thumb, .mp-yt-play). Handler de clique em
 * <script is:inline> na página, que monta o iframe ao clicar.
 */

import type { Post } from '@/lib/types';

// Detecta o bloco do Tiptap. Captura o videoId (11 chars [a-zA-Z0-9_-]) tanto
// em youtube.com quanto em youtube-nocookie.com/embed/.
const YOUTUBE_BLOCK_REGEX =
  /<div\s+data-youtube-video[^>]*>\s*<iframe\b[^>]*\bsrc=["']https?:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})[^"']*["'][^>]*>\s*<\/iframe>\s*<\/div>/gi;

/**
 * Lê o HTML do post e devolve a lista de videoIds únicos (ordem de aparição).
 * Use pra renderizar preconnects condicionais e schemas VideoObject.
 */
export function extractYouTubeVideoIds(html: string): string[] {
  if (!html) return [];
  const ids: string[] = []
  const seen = new Set<string>()
  YOUTUBE_BLOCK_REGEX.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = YOUTUBE_BLOCK_REGEX.exec(html)) !== null) {
    const id = match[1]
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }
  YOUTUBE_BLOCK_REGEX.lastIndex = 0
  return ids
}

/**
 * Substitui todos os blocos <div data-youtube-video> por façade Lite.
 * O retorno é seguro pra `set:html` (videoId já validado pela regex 11 chars).
 */
export function processYouTubeEmbeds(html: string): string {
  if (!html) return html
  YOUTUBE_BLOCK_REGEX.lastIndex = 0
  return html.replace(YOUTUBE_BLOCK_REGEX, (_match, videoId) => renderYouTubeLite(videoId))
}

/**
 * Renderiza o markup do façade pra um videoId.
 * Mantém um <a href="youtube.com/watch?v=ID"> no HTML inicial pra crawlers
 * indexarem o vídeo como conteúdo da página (view-source visível).
 */
function renderYouTubeLite(videoId: string): string {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const thumbWebp = `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`
  const thumbJpg = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  return `<div class="mp-youtube-lite" data-yt-id="${videoId}" data-yt-mounted="false">
  <a href="${watchUrl}" class="mp-yt-link" aria-label="Reproduzir vídeo do YouTube" rel="noopener">
    <picture>
      <source srcset="${thumbWebp}" type="image/webp" />
      <img src="${thumbJpg}" alt="Capa do vídeo do YouTube" loading="lazy" decoding="async" class="mp-yt-thumb" width="1280" height="720" />
    </picture>
  </a>
  <button type="button" class="mp-yt-play" aria-label="Reproduzir vídeo">
    <svg viewBox="0 0 68 48" aria-hidden="true" focusable="false"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74 0 13.07 0 24 0 24s0 10.93 1.48 16.26c.79 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C68 34.93 68 24 68 24s0-10.93-1.48-16.26z" fill="#212121" fill-opacity="0.85"/><path d="M 45,24 27,14 27,34" fill="#fff"/></svg>
  </button>
</div>`
}

/**
 * VideoObject Schema.org para cada vídeo no post.
 * Use array.map() pra emitir múltiplos schemas se o post tem +1 vídeo.
 */
export function generateVideoObjectSchema(
  videoId: string,
  post: Pick<Post, 'title' | 'description' | 'created_at' | 'updated_at'>,
  postUrl: string,
): string {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  // VideoObject precisa de description com ≤ 5000 chars; cortamos cedo pra
  // não vazar conteúdo extenso. Title sempre presente. Fallback p/ description nula.
  const description = (post.description || post.title || 'Vídeo do blog modoPAG').slice(0, 500)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: post.title,
    description,
    thumbnailUrl,
    contentUrl: watchUrl,
    embedUrl,
    uploadDate: post.created_at,
  }
  if (post.updated_at && post.updated_at !== post.created_at) {
    schema.dateModified = post.updated_at
  }
  if (postUrl) {
    schema.mainEntityOfPage = postUrl
  }
  return JSON.stringify(schema)
}

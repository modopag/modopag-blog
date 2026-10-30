// ============================================
// B1 — blog → site SEM UTM: `?origem=blog_<slug>` + `pagina` do GA4
// ============================================
// blog.modopag.com.br e modopag.com.br estão na MESMA propriedade GA4
// (G-GG2PPZTMCV). `utm_source=blog` nos links abria sessão nova no GA4 e
// apagava a origem real do visitante (Google orgânico, anúncio…). O rótulo
// `origem` o GA4 ignora; o site o guarda no first-touch (tracker v6.1.0), o
// chat classifica o Lead como "blog" com o slug e o checkout o preserva
// (TRACK_PARAMS → checkout_sessions.utm.origem).
//
// Vocabulário: `blog_home` (/), `blog_cat_<categoria>` (/<categoria>/),
// `blog_<slug>` (/<categoria>/<slug>/), `blog_404`. O site aceita
// /^blog_[a-z0-9][a-z0-9_-]*$/ — por isso normalizamos aqui.

export const HOSTS_SITE = new Set([
  'modopag.com.br',
  'www.modopag.com.br',
  'pagamento.modopag.com.br',
  'conta.modopag.com.br',
  'onboarding.modopag.com.br',
  'app.modopag.com.br',
  'afiliados.modopag.com.br',
  'ajuda.modopag.com.br',
]);

export type PaginaBlog = 'blog_home' | 'blog_categoria' | 'blog_post' | 'blog_404' | 'blog_outra';

function slugLimpo(s: string): string {
  const v = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return v || 'x';
}

/** Segmentos do caminho sem query/hash, sem vazios. */
function segmentos(pathname: string): string[] {
  return (pathname || '/').split('?')[0].split('#')[0].split('/').filter(Boolean);
}

/** `pagina` do GA4 para o caminho do blog. */
export function paginaDe(pathname: string): PaginaBlog {
  const seg = segmentos(pathname);
  if (seg.length === 0) return 'blog_home';
  if (seg[0] === '404' || seg[0] === '404.html') return 'blog_404';
  if (seg.length === 1) return 'blog_categoria';
  if (seg.length === 2) return 'blog_post';
  return 'blog_outra';
}

/** Rótulo de um post pelo slug (o mesmo que `origemDe('/<cat>/<slug>/')`). */
export function origemDoPost(slug: string): string {
  return `blog_${slugLimpo(slug)}`;
}

/** Rótulo `origem=` que vai nos links para o site a partir deste caminho. */
export function origemDe(pathname: string): string {
  const seg = segmentos(pathname);
  const pagina = paginaDe(pathname);
  if (pagina === 'blog_home') return 'blog_home';
  if (pagina === 'blog_404') return 'blog_404';
  if (pagina === 'blog_categoria') return `blog_cat_${slugLimpo(seg[0])}`;
  if (pagina === 'blog_post') return origemDoPost(seg[1]);
  return `blog_${slugLimpo(seg.join('-'))}`;
}

/** É link para um host do site (não para o próprio blog)? */
export function ehLinkParaSite(href: string, base = 'https://blog.modopag.com.br'): boolean {
  try {
    const u = new URL(href, base);
    return HOSTS_SITE.has(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Link para o site: tira `utm_*` e põe `origem=<origem>` (sem duplicar).
 * Âncoras (#...) e outros parâmetros são preservados. Não mexe em links que
 * não são para o site.
 */
export function linkParaSite(href: string, origem: string): string {
  if (!ehLinkParaSite(href)) return href;
  const u = new URL(href, 'https://blog.modopag.com.br');
  for (const k of [...u.searchParams.keys()]) if (/^utm_/i.test(k)) u.searchParams.delete(k);
  u.searchParams.set('origem', origem);
  return u.toString();
}

/** Reescreve os `href` do HTML do post (conteúdo vindo do painel) que apontam para o site. */
export function reescreverLinksDoConteudo(html: string, origem: string): string {
  return html.replace(/href=(["'])(https?:\/\/[^"']+)\1/gi, (m, q, url) => {
    if (!ehLinkParaSite(url)) return m;
    return `href=${q}${linkParaSite(url, origem)}${q}`;
  });
}

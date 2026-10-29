// ============================================
// GA4 do blog (B1) — mesma propriedade do site, carregamento tardio
// ============================================
// Só GA4 (sem pixels). O ID é o do site (G-GG2PPZTMCV); cookie `_ga` em
// `.modopag.com.br` (cookie_domain 'auto' = domínio mais alto), então blog →
// site → checkout é o MESMO client_id e a sessão não reinicia.
//
// Ordem: `js` + `config` entram no dataLayer já na carga (sem rede) para os
// eventos ficarem na fila certa; o gtag.js só é injetado no idle (2 s) ou na
// primeira interação, igual ao tracker do site. Consentimento: mesmo cookie
// `mpag_consent` do site (auto-consent quando ausente; `analytics:false`
// desliga). Sem PII: nada de e-mail/nome/telefone nos parâmetros.
//
//   page_view        automático do gtag (carga + pushState do ClientRouter, como no
//                    site — plano §3 linha page_view). Medido em 29/10: parâmetro
//                    custom não acompanha o page_view automático em navegação
//                    (gtag('set'/'config' em pushState chega tarde), e page_view
//                    manual duplicaria o automático. Tipo de página sai do pagePath
//                    nos relatórios; `pagina`/`origem` vão nos eventos custom.
//   cta_click        {cta_id, pagina, origem, destino} — clique em link para *.modopag.com.br
//   secao_vista      {secao_id, pagina, origem, posicao} — blocos fixos do post ([data-secao])
import { paginaDe, origemDe, ehLinkParaSite } from '../lib/origem';

const ID = 'G-GG2PPZTMCV';
const HOST_BLOG = /(^|\.)blog\.modopag\.com\.br$/;
const HOSTS_GA4 = ['blog.modopag.com.br']; // trava de host: preview/localhost não enviam

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; __mpagGa4?: { pronto: boolean } }
}

function consentOk(): boolean {
  const m = /(?:^|; )mpag_consent=([^;]*)/.exec(document.cookie);
  if (!m) {
    // mesmo auto-consent do site (opt-out informativo no banner do site)
    const c = JSON.stringify({ ads: true, analytics: true, essential: true, marketing: true, timestamp: Date.now(), version: '1.0' });
    document.cookie = 'mpag_consent=' + encodeURIComponent(c) + '; path=/; domain=.modopag.com.br; max-age=31536000; SameSite=Lax; Secure';
    return true;
  }
  try {
    const c = JSON.parse(decodeURIComponent(m[1]));
    return c && c.analytics !== false;
  } catch {
    return true;
  }
}

function base() {
  const p = location.pathname;
  const b = document.body?.dataset || {};
  // o layout publica <body data-pagina data-origem> (a 404 manda blog_404); fallback = rota
  return { pagina: b.pagina || paginaDe(p), origem: b.origem || origemDe(p), send_to: ID };
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // gtag.js espera `arguments`, não um array
  window.dataLayer.push(arguments as unknown);
}

let scriptPedido = false;
function injetarGtag() {
  if (scriptPedido) return;
  scriptPedido = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
}


// ---------- cta_click (delegação) ----------
function ctaId(a: HTMLAnchorElement): string {
  const explicito = a.getAttribute('data-cta');
  if (explicito) return explicito;
  const area = a.closest<HTMLElement>('[data-cta-area]')?.getAttribute('data-cta-area');
  return 'blog_' + (area || 'link');
}
function aoClicar(ev: Event) {
  const alvo = ev.target as Element | null;
  const a = alvo?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (!ehLinkParaSite(href, location.href)) return;
  let destino = '';
  try { const u = new URL(href, location.href); destino = u.hostname + u.pathname; } catch { return; }
  gtag('event', 'cta_click', { ...base(), cta_id: ctaId(a), destino });
}

// ---------- secao_vista ----------
let observador: IntersectionObserver | null = null;
let vistas = new Set<string>();
const timers = new Map<Element, ReturnType<typeof setTimeout>>();
function observarSecoes() {
  observador?.disconnect();
  observador = null;
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  vistas = new Set();
  const secoes = Array.from(document.querySelectorAll<HTMLElement>('[data-secao]'));
  if (!secoes.length || typeof IntersectionObserver === 'undefined') return;
  const ordem = new Map<Element, number>();
  secoes.forEach((s, i) => ordem.set(s, i + 1));
  observador = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      const bloco = el.getAttribute('data-secao') || '';
      const id = `${base().pagina}_${bloco}`;
      if (vistas.has(id)) { observador?.unobserve(el); continue; }
      const vh = e.rootBounds?.height || window.innerHeight || 0;
      const visivel = e.isIntersecting && e.intersectionRect.height >= 0.5 * Math.min(e.boundingClientRect.height, vh) - 1;
      if (visivel) {
        if (!timers.has(el)) timers.set(el, setTimeout(() => {
          timers.delete(el);
          if (vistas.has(id)) return;
          vistas.add(id);
          observador?.unobserve(el);
          gtag('event', 'secao_vista', { ...base(), secao_id: id, posicao: ordem.get(el) ?? 0 });
        }, 1000));
      } else if (timers.has(el)) { clearTimeout(timers.get(el)!); timers.delete(el); }
    }
  }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
  secoes.forEach((s) => observador!.observe(s));
}

// ---------- boot ----------
function iniciar() {
  if (!HOSTS_GA4.includes(location.hostname) && !HOST_BLOG.test(location.hostname)) return; // trava de host
  if (!consentOk()) return;
  if (!window.__mpagGa4) {
    window.__mpagGa4 = { pronto: true };
    gtag('js', new Date());
    gtag('config', ID, { cookie_domain: 'auto', transport_type: 'beacon' });
    document.addEventListener('click', aoClicar, true);
    const idle = window.requestIdleCallback;
    const carregar = () => injetarGtag();
    ['pointerdown', 'keydown', 'scroll'].forEach((ev) => document.addEventListener(ev, carregar, { once: true, passive: true }));
    if (idle) idle(carregar, { timeout: 2000 }); else setTimeout(carregar, 2000);
  }
  observarSecoes();
}
document.addEventListener('astro:page-load', iniciar);

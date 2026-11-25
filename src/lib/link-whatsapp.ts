// Link que abre o WhatsApp? Decide pelo HOST do destino, nunca por "whatsapp" em qualquer parte do href
// (25/11/2026; mesma regra do site, src/lib/link-whatsapp.js). Antes, a[href*="whatsapp"] pegava links com
// utm_source=whatsapp (remarketing por WhatsApp) e abria o popup no lugar do destino.
export const HOSTS_DO_WHATSAPP = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 'chat.whatsapp.com', 'whatsapp.com', 'www.whatsapp.com'];

export function ehLinkDoWhatsApp(href: string | null | undefined, base?: string): boolean {
  if (typeof href !== 'string' || !href) return false;
  let u: URL;
  try { u = new URL(href, base || 'https://blog.modopag.com.br/'); } catch { return false; }
  if (u.protocol === 'whatsapp:') return true;
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  const h = u.hostname.toLowerCase();
  if (h === 'modopag.com.br' || h.endsWith('.modopag.com.br')) return false;
  return HOSTS_DO_WHATSAPP.includes(h);
}

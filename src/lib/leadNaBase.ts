// Lead do blog na NOSSA base (saída da Reportana, Fase 2 — 24/11/2026).
//
// Achado do inventário: o blog não carrega o script da Reportana nem o tracker (comentado no BaseLayout),
// então o formulário da newsletter (LeadCaptureForm, data-rptn-form) e o do WhatsApp sem tracker não
// gravavam o lead em lugar nenhum. Agora os dois mandam ao track-lead do checkout com
// consentimento_anuncios: false: o servidor grava o lead (e cria o contato no Resend quando a chave
// leads_resend estiver ligada) e NÃO manda nada à Meta nem ao Google Ads. Sem click-ids e sem IP:
// só o que a pessoa digitou, a página e as UTMs/primeiro toque.
// Com o tracker e o consentimento de anúncios, o componente do WhatsApp segue usando o tracker (CAPI
// com event_id para dedup com o pixel), como antes.

export const TRACK_LEAD_URL = 'https://fefiqmmvsslmyascfvzz.supabase.co/functions/v1/track-lead';

export interface OrigemDoLead {
  utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string;
  original_source?: string; landing_page?: string; referrer?: string;
}

export function payloadDoLead(
  categoria: string,
  lead: { name?: string; email: string; phone?: string },
  origem: OrigemDoLead,
  urlDaPagina: string,
  agora = Date.now(),
  aleatorio = Math.random().toString(36).slice(2, 10),
): Record<string, unknown> {
  const partes = (lead.name ?? '').trim().split(/\s+/).filter(Boolean);
  const vazio = (x?: string) => (x && x.trim() ? x.trim() : undefined);
  return {
    event_name: 'Lead',
    event_id: `lead_${agora}_${aleatorio}`,
    event_source_url: urlDaPagina,
    user_data: {
      em: lead.email.trim().toLowerCase(),
      ph: (lead.phone ?? '').replace(/\D/g, '') || undefined,
      fn: partes[0] || undefined,
      ln: partes.length > 1 ? partes.slice(1).join(' ') : undefined,
    },
    custom_data: {
      consentimento_anuncios: false,
      content_name: 'Blog',
      content_category: categoria,
      utm_source: vazio(origem.utm_source), utm_medium: vazio(origem.utm_medium), utm_campaign: vazio(origem.utm_campaign),
      utm_content: vazio(origem.utm_content), utm_term: vazio(origem.utm_term),
      first_touch: { source: vazio(origem.original_source), landing_page: vazio(origem.landing_page), referrer: vazio(origem.referrer) },
    },
  };
}

/** UTMs da URL atual (para o formulário da newsletter, que não tem o tracker). */
export function origemDaUrl(href: string, referrer: string): OrigemDoLead {
  try {
    const u = new URL(href);
    const p = (k: string) => u.searchParams.get(k) ?? undefined;
    return { utm_source: p('utm_source'), utm_medium: p('utm_medium'), utm_campaign: p('utm_campaign'), utm_content: p('utm_content'),
      utm_term: p('utm_term'), landing_page: u.pathname, referrer: referrer || undefined };
  } catch {
    return {};
  }
}

export function enviarLeadParaBase(categoria: string, lead: { name?: string; email: string; phone?: string }, origem: OrigemDoLead): void {
  try {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email.trim())) return;
    fetch(TRACK_LEAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadDoLead(categoria, lead, origem, typeof location !== 'undefined' ? location.href : '')),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nunca quebra o formulário */
  }
}

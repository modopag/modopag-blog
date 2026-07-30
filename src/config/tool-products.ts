/**
 * Mapa ferramenta -> produto modoPAG para o CTA contextual que aparece
 * logo depois do CalculatorEmbed (momento de maior atenção do usuário).
 *
 * Regra: quem já tem CTA dentro do próprio `calculator_code` fica de fora
 * daqui, pra não empilhar dois CTAs iguais na sequência.
 */

export interface ToolProduct {
  /** Sobrelinha curta em maiúsculas */
  kicker: string;
  title: string;
  text: string;
  ctaLabel: string;
  url: string;
  /** Provas curtas exibidas abaixo do botão */
  badges: string[];
}

export const PRODUCTS = {
  gestor: {
    kicker: 'Sistema de gestão',
    title: 'A única maquininha do Brasil com sistema de gestão pra barbearia',
    text: 'Enquanto as outras só passam cartão, a modoPAG entrega o modo Gestor junto: agenda, comanda, app do barbeiro e o repasse de comissão calculado sozinho a cada atendimento.',
    ctaLabel: 'Conhecer o modo Gestor',
    url: 'https://modopag.com.br/modo-gestor/',
    badges: ['Agenda e comanda', 'Comissão automática'],
  },
  modolink: {
    kicker: 'Venda sem maquininha',
    title: 'Receba de qualquer cliente com um link',
    text: 'Com o modoLINK você cria um link de pagamento e manda no WhatsApp. O cliente paga no cartão em até 18x ou no Pix, de onde estiver — sem maquininha e sem site.',
    ctaLabel: 'Conhecer o modoLINK',
    url: 'https://modopag.com.br/modolink/',
    badges: ['Parcele em até 18x', 'CPF ou CNPJ'],
  },
  conta: {
    kicker: 'Conta digital grátis',
    title: 'Centralize os recebimentos numa conta feita pra quem vende',
    text: 'A conta digital modoPAG é grátis: sem mensalidade e sem taxa de manutenção, com CPF ou CNPJ. Pela mesma conta você aceita Pix, cartão na maquininha, no celular (modoTAP) ou por link.',
    ctaLabel: 'Abrir conta grátis',
    url: 'https://onboarding.modopag.com.br/criar-conta',
    badges: ['Sem mensalidade', 'CPF ou CNPJ'],
  },
  tef: {
    kicker: 'Automação comercial',
    title: 'TEF integrado sem mensalidade',
    text: 'Pin Pad homologado por R$ 747, pagamento único — compatível com SiTef, Linx, PayGo e mais. Receba na hora ou em 1 dia corrido.',
    ctaLabel: 'Conhecer o modo TEF',
    url: 'https://modopag.com.br/maquina-de-cartao-tef/',
    badges: ['Pin Pad homologado', 'Pagamento único'],
  },
} as const satisfies Record<string, ToolProduct>;

export type ProductKey = keyof typeof PRODUCTS;

/** Ferramenta -> produto. */
const TOOL_PRODUCT_BY_SLUG: Record<string, ProductKey> = {
  'calculadora-comissao-barbeiro-online': 'gestor',
  'gerador-link-whatsapp-gratis-vendas': 'modolink',
  // quem manda encomenda vende online — modoLINK é o encaixe natural
  'gerador-etiqueta-correios': 'modolink',
  'gerador-recibo-online-gratis': 'conta',
  'calculadora-de-ferias': 'conta',
};

/**
 * Copy contextual por ferramenta, sobrepondo a copy padrão do produto.
 * WhatsApp usa o ângulo "complete a venda": o link abre a conversa,
 * o modoLINK fecha a venda na mesma conversa.
 */
const SLUG_COPY_OVERRIDES: Record<string, Partial<ToolProduct>> = {
  'gerador-link-whatsapp-gratis-vendas': {
    kicker: 'Feche a venda na mesma conversa',
    title: 'Criou o link do WhatsApp? Agora cobre por ele',
    text: 'Com o modoLINK, você manda o link de pagamento direto na conversa: o cliente paga com Pix, débito ou crédito em até 18x, sem app e sem maquininha. Venda à distância do início ao fim.',
    badges: ['Grátis', 'Sem mensalidade', 'Receba em 1 dia útil no plano Express'],
  },
  'gerador-etiqueta-correios': {
    kicker: 'Quem envia encomenda vende online',
    title: 'Cobre a venda antes de postar a encomenda',
    text: 'Com o modoLINK, você manda um link de pagamento no WhatsApp e o cliente paga com Pix, débito ou crédito em até 18x — sem site e sem maquininha. Confirmou o pagamento, postou a encomenda.',
  },
};

/**
 * Ferramentas que já embutem um CTA no próprio `calculator_code`.
 * Não renderizamos o ProductCTA nelas.
 */
const SLUGS_WITH_INLINE_CTA = new Set<string>([
  'gerador-qr-code-pix-gratis',
]);

/** Fallback por categoria pra ferramentas novas que ainda não estão no mapa. */
const FALLBACK_BY_CATEGORY: Record<string, ProductKey> = {
  calculadoras: 'conta',
  ferramentas: 'conta',
};

/**
 * Posts comuns (não-ferramenta) -> produto. Override pontual por post:
 * quando o assunto do post pede um produto específico, mapear aqui.
 * Sem entrada aqui, o post comum mantém o CTABox genérico do rodapé.
 */
const POST_PRODUCT_BY_SLUG: Record<string, ProductKey> = {
  // Post sobre POS vs TEF — o produto certo é a página do modo TEF
  'diferenca-entre-pos-e-tef-integrado': 'tef',
};

export interface ResolvedToolCTA extends ToolProduct {
  /** URL já com UTMs aplicadas */
  href: string;
}

function buildCTA(key: ProductKey, slug: string): ResolvedToolCTA {
  const product = { ...PRODUCTS[key], ...SLUG_COPY_OVERRIDES[slug] };
  const utm = `utm_source=blog&utm_medium=cta_produto&utm_campaign=${encodeURIComponent(slug)}`;
  const href = `${product.url}${product.url.includes('?') ? '&' : '?'}${utm}`;
  return { ...product, href };
}

/**
 * Resolve o CTA de uma ferramenta. Retorna null quando a ferramenta já tem
 * CTA interno ou quando não há produto mapeado nem fallback de categoria.
 */
export function resolveToolCTA(
  slug: string,
  categorySlug?: string | null
): ResolvedToolCTA | null {
  if (SLUGS_WITH_INLINE_CTA.has(slug)) return null;

  const key =
    TOOL_PRODUCT_BY_SLUG[slug] ??
    (categorySlug ? FALLBACK_BY_CATEGORY[categorySlug] : undefined);

  if (!key) return null;

  return buildCTA(key, slug);
}

/**
 * Resolve o CTA de um post comum (não-ferramenta). Só retorna produto quando
 * há override explícito por slug — sem fallback de categoria, pra não espalhar
 * card contextual em posts que devem manter o CTABox genérico.
 */
export function resolvePostCTA(slug: string): ResolvedToolCTA | null {
  const key = POST_PRODUCT_BY_SLUG[slug];
  if (!key) return null;
  return buildCTA(key, slug);
}

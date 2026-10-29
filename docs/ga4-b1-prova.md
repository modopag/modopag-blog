# B1-c — GA4 no blog e links para o site sem UTM (29/10/2026)

Plano: `site-modopag/docs/ga4/plano-de-medicao.md` §8.7. Depende de:
B1-a (site #61, mergeada) e B1-b (checkout #590: tracker 6.1.0 guarda `origem`).

## O que muda

| peça | o que |
|---|---|
| `src/lib/origem.ts` | vocabulário `pagina` (`blog_home`, `blog_categoria`, `blog_post`, `blog_404`), rótulo `origem` (`blog_home`, `blog_cat_<categoria>`, `blog_<slug>`, `blog_404`), `linkParaSite()` (tira `utm_*`, põe `origem`), `reescreverLinksDoConteudo()` (HTML vindo do painel) |
| `src/scripts/ga4-blog.ts` | só GA4 (`G-GG2PPZTMCV`, `cookie_domain: auto` → `_ga` em `.modopag.com.br`); `js`+`config` no dataLayer já na carga, `gtag.js` injetado em idle (2 s) ou na 1ª interação; `page_view {pagina, origem}` em cada `astro:page-load` (ClientRouter); `cta_click {cta_id, pagina, origem, destino}` por delegação nos links para `*.modopag.com.br`; `secao_vista {secao_id, pagina, origem, posicao}` nos blocos fixos do post (≥ 50 %, 1 s, 1× por page_view); consentimento = cookie `mpag_consent` do site (auto-consent quando ausente, `analytics:false` desliga); trava de host `blog.modopag.com.br` (preview/local não enviam) |
| `BaseLayout.astro` | `<body data-pagina data-origem>`; a 404 manda `blog_404`; importa o módulo |
| Breadcrumb, CTABox, Footer, Header, ProductCTA, `index.astro`, `404.astro`, `tool-products.ts` | `utm_source=blog&…` → `?origem=blog_<slug>` via `linkParaSite`; `data-cta` nos CTAs e `data-cta-area` (header/footer/breadcrumb/cta/conteudo) para o `cta_id` |
| `[category]/[slug].astro` | conteúdo do post passa por `reescreverLinksDoConteudo` (os 2 posts com UTM no painel saem corrigidos sem editar o post); `data-secao` em `cta_meio` (quando há CTA do meio), `relacionados`, `cta_final` |
| `WhatsAppLeadCapture.tsx` | sem mudança: não emite UTM; os campos ocultos são o first-touch do próprio visitante |

Onde as UTMs estavam: template (Header nav/CTA, Footer grid/CTA, Breadcrumb,
404, home), componentes (CTABox, ProductCTA, `tool-products.ts`) e 2 posts no
conteúdo do painel (`gerador-qr-code-pix`, `diferenca-entre-pos-e-tef-integrado`).

`conta.modopag.com.br/register` (CTABox) continua como destino por ora: o host
roda outro GA4 (`G-ESSE0XWE74`) e `/register` redireciona para `/login`; o
`onboarding.modopag.com.br/criar-conta` carrega o tracker mas **não** o GA4
(`GA4_HOSTS` do tracker não inclui o host) — troca só depois de incluir o host.

## Prova 1 — renderização (astro dev local, 29/10)

| rota | body | links para o site | `utm_source=blog` | `data-secao` |
|---|---|---|---|---|
| `/` | `blog_home` / `blog_home` | 47 com `?origem=blog_home` | 0 | — |
| `/pagamentos/` | `blog_categoria` / `blog_cat_pagamentos` | 46 com `?origem=blog_cat_pagamentos` | 0 | — |
| `/pagamentos/diferenca-entre-pos-e-tef-integrado/` | `blog_post` / `blog_diferenca-entre-pos-e-tef-integrado` | 50 com `?origem=blog_diferenca-…` (inclusive os do conteúdo: `/`, `/#bandeiras`, `/calculadora-de-repasse/`, `/conta-digital-pj/`, `/indique-e-ganhe/`, `/maquina-de-cartao-com-voucher/`) | 0 | `relacionados`, `cta_final` |
| `/nao-existe/` (404) | `blog_404` / `blog_404` | 46 com `?origem=blog_404` | 0 | — |

Ficam sem `origem` só os links institucionais que nunca tiveram UTM (políticas,
termos, contrato de afiliados, `ajuda.`, `pagamento.` no rodapé, "Entrar" em
`conta.`): o `cta_click` cobre o clique mesmo assim (`destino`).

`npm run build` (adapter Vercel) ok.

## Prova 2 — Lighthouse mobile do post (antes = produção, 29/10)

`lighthouse --preset=perf --form-factor=mobile --throttling-method=simulate`,
3 runs, mediana, `/pagamentos/diferenca-entre-pos-e-tef-integrado/`:

| versão | score | LCP | CLS | TBT | FCP | JS transferido | requests |
|---|---|---|---|---|---|---|---|
| antes (prod) | 92 (87/92/93) | 2,4 s | 0,000 | 0 ms | 1,7 s | 61 KB | 19 |
| depois | _(medir no deploy — ver abaixo)_ | | | | | | |

## Provas pendentes (só no host real, depois do merge)

A Vercel não publicou preview desta branch pela integração do GitHub (último
deployment registrado no GitHub é de 03/06). As provas que dependem do cookie em
`.modopag.com.br` e da trava de host (`blog.modopag.com.br`) ficam para depois
do deploy, como na S3:

1. mesmo navegador, blog → site → checkout: `_ga` com o **mesmo** client_id nos
   três hosts; sem `session_start` novo ao passar do blog para o site
   (DebugView / Tempo real, `hostName = blog.modopag.com.br`);
2. `page_view` com `pagina`/`origem`, `cta_click` com `destino` e `secao_vista`
   no corpo do `/g/collect` (gravador no navegador, como na S3);
3. Lighthouse mobile "depois" no mesmo post, mesma linha da tabela acima.

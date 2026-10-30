# modopag-blog

## Produção: Cloudflare Worker publicado da `main` (Workers Builds)

- **Produção = Worker `modopag-blog`** (Cloudflare, conta modoPAG). Todo push
  na **`main`** dispara o **Workers Builds** ligado a este repositório:
  `npm ci` → `npm run build` → `npx wrangler deploy`. Não há deploy manual;
  para conferir o que está no ar, compare o commit do último build em
  Workers & Pages → `modopag-blog` → Deployments com `git log -1 origin/main`.
- **Token do build:** "modopag-blog workers build" — token de API **de usuário**
  (Cloudflare → My Profile → API Tokens, login contato@modopag.com.br),
  selecionado em Workers & Pages → `modopag-blog` → Settings → Builds → API
  token. Escopo: conta modoPAG inteira, só **Workers Scripts: Edit**, **Account
  Settings: Read**, **Memberships: Read** e **User Details: Read**; sem
  expiração. O valor fica só na Cloudflare (nunca no repo). Se o build falhar
  com 401/403, é esse token (revogado, expirado ou com permissão retirada).
- Entrada: Worker Route `blog.modopag.com.br/*` com o registro `blog` como
  AAAA `100::` proxiado (sem origem — o Worker atende tudo; desde 30/10/2026,
  antes era CNAME da Vercel).
- A Vercel foi desligada depois da migração (30/10/2026); o histórico da
  migração está em `docs/migracao-cloudflare-investigacao.md`.
- Variáveis: `PUBLIC_SITE_URL`/`PUBLIC_SITE_NAME` em `wrangler.toml`;
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `INDEXNOW_KEY` como secrets do Worker
  (`wrangler secret put`) e, iguais, como **variáveis de build** do Workers
  Builds (`import.meta.env` é resolvido no build). Build local precisa de
  `.env.local` com os mesmos
  valores (o `/<INDEXNOW_KEY>.txt` é pré-renderizado no build e tem de ser a
  chave do painel).
- Cache de HTML: 60 s no edge via Cache API (`src/middleware.ts`), header
  `X-Blog-Cache`; `/api/cache-purge/?url=<caminho>&key=<INDEXNOW_KEY>` invalida
  uma URL. Imagens `/img/*` por proxy no mesmo middleware.

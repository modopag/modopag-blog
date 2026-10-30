# modopag-blog

## Produção (desde 30/10/2026): Cloudflare Worker, publicado desta branch

- **Produção = Worker `modopag-blog`** (Cloudflare, conta modoPAG), publicado
  **desta branch `infra/cloudflare-pages`** com `npm run build && npx wrangler
  deploy`. Entrada: Worker Route `blog.modopag.com.br/*` + registro `blog`
  proxiado (ainda CNAME da Vercel, só com o proxy ligado).
- **Push na `main` NÃO publica o blog**: a `main` continua ligada ao projeto da
  Vercel, que fica de pé só como rollback até **06/11/2026** (rollback = apagar
  a rota e desligar o proxy do registro `blog`). Depois dessa data a branch
  entra na `main` e a Vercel é desligada.
- A B1-c (GA4 do blog, `feat/b1-ga4-origem`) sai desta branch (rebase sobre ela).
- Variáveis: `PUBLIC_SITE_URL`/`PUBLIC_SITE_NAME` em `wrangler.toml`;
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `INDEXNOW_KEY` como secrets do Worker
  (`wrangler secret put`). Build local precisa de `.env.local` com os mesmos
  valores (o `/<INDEXNOW_KEY>.txt` é pré-renderizado no build e tem de ser a
  chave do painel).
- Cache de HTML: 60 s no edge via Cache API (`src/middleware.ts`), header
  `X-Blog-Cache`; `/api/cache-purge/?url=<caminho>&key=<INDEXNOW_KEY>` invalida
  uma URL. Imagens `/img/*` por proxy no mesmo middleware.

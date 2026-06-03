import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy Supabase client.
 *
 * Por que lazy: no runtime do Cloudflare Workers, `import.meta.env.*` (vars
 * configuradas no Pages dashboard) só fica populado DENTRO de um request
 * context — não no module scope. Se inicializássemos `createClient` no
 * top-level, ele leria `undefined` e o Worker explodiria com Error 1101
 * antes mesmo de processar qualquer request.
 *
 * O Proxy delega cada acesso (`supabase.from(...)`, `supabase.auth`, etc.)
 * pra um client que é criado na primeira chamada e cacheado depois. Como
 * a chamada acontece dentro do handler do Astro, `import.meta.env` já tá
 * populado com as vars do Pages.
 *
 * API pública continua idêntica — `database.ts` e demais consumidores não
 * precisam mudar.
 */

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set SUPABASE_URL and SUPABASE_ANON_KEY in Cloudflare Pages → ' +
      'Settings → Variables and Secrets (or .dev.vars for local dev).'
    );
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });

  return cachedClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

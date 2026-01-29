/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_SITE_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

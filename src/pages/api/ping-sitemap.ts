import type { APIRoute } from 'astro';

const SITE_URL = 'https://modopag.com.br';
const SITEMAP_URL = `${SITE_URL}/blog/sitemap.xml`;

const PING_ENDPOINTS = [
  {
    name: 'Google',
    url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  },
  {
    name: 'Bing',
    url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  },
];

export const POST: APIRoute = async () => {
  const results = await Promise.allSettled(
    PING_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint.url, { method: 'GET' });
      return {
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        ok: response.ok,
      };
    })
  );

  const summary = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      name: PING_ENDPOINTS[index].name,
      url: PING_ENDPOINTS[index].url,
      status: 0,
      ok: false,
      error: result.reason?.message,
    };
  });

  const allSuccess = summary.every((r) => r.ok);

  return new Response(
    JSON.stringify({
      success: allSuccess,
      sitemap: SITEMAP_URL,
      results: summary,
      timestamp: new Date().toISOString(),
    }),
    {
      status: allSuccess ? 200 : 207,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const GET: APIRoute = async () => {
  return POST({ request: new Request('http://localhost') } as any);
};

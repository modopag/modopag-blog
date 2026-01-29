import type { APIRoute } from 'astro';

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

const SITE_URL = 'https://modopag.com.br';

interface IndexNowRequest {
  url?: string;
  urls?: string[];
}

export const POST: APIRoute = async ({ request }) => {
  const indexNowKey = import.meta.env.INDEXNOW_KEY;

  if (!indexNowKey) {
    return new Response(
      JSON.stringify({ error: 'INDEXNOW_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: IndexNowRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const urls = body.urls || (body.url ? [body.url] : []);

  if (urls.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No URLs provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const payload = {
    host: 'modopag.com.br',
    key: indexNowKey,
    keyLocation: `${SITE_URL}/blog/${indexNowKey}.txt`,
    urlList: urls,
  };

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return {
        endpoint,
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
      endpoint: INDEXNOW_ENDPOINTS[index],
      status: 0,
      ok: false,
      error: result.reason?.message,
    };
  });

  return new Response(
    JSON.stringify({
      success: true,
      urls,
      results: summary,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

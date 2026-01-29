import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = async () => {
  const indexNowKey = import.meta.env.INDEXNOW_KEY;

  if (!indexNowKey) {
    return [];
  }

  return [{ params: { key: indexNowKey } }];
};

export const GET: APIRoute = async ({ params }) => {
  const indexNowKey = import.meta.env.INDEXNOW_KEY;

  if (!indexNowKey || params.key !== indexNowKey) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(indexNowKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

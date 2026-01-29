import type { APIRoute } from 'astro';
import { getCategories, getPosts } from '@/lib/database';

const SITE_URL = 'https://modopag.com.br';

export const GET: APIRoute = async () => {
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPosts({ published: true, limit: 1000 }),
  ]);

  const urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq: string;
    priority: string;
  }> = [];

  // Homepage
  urls.push({
    loc: `${SITE_URL}/blog/`,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0',
  });

  // Category pages
  for (const category of categories) {
    urls.push({
      loc: `${SITE_URL}/blog/${category.slug}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.8',
    });
  }

  // Post pages
  for (const post of posts) {
    const categorySlug = post.category?.slug || 'artigos';
    urls.push({
      loc: `${SITE_URL}/blog/${categorySlug}/${post.slug}/`,
      lastmod: post.updated_at || post.created_at,
      changefreq: 'weekly',
      priority: post.featured ? '0.9' : '0.7',
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};

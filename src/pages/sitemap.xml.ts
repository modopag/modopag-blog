import type { APIRoute } from 'astro';
import { getCategories, getAllPostsForSitemap } from '@/lib/database';

const SITE_URL = 'https://blog.modopag.com.br';

export const GET: APIRoute = async () => {
  try {
    const [posts, categories] = await Promise.all([
      getAllPostsForSitemap(),
      getCategories(),
    ]);

    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add categories
    if (categories && categories.length > 0) {
      for (const category of categories) {
        xml += `
  <url>
    <loc>${SITE_URL}/${category.slug}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Add posts
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const categorySlug = (post.category as { slug: string })?.slug || 'artigos';
        const postUrl = `${SITE_URL}/${categorySlug}/${post.slug}/`;
        const lastmod = post.updated_at || now;
        const priority = post.featured ? '0.9' : '0.7';

        xml += `
  <url>
    <loc>${postUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
      }
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return minimal valid sitemap on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
};

import type { APIRoute } from 'astro';
import { getPosts } from '@/lib/database';
import { parseMarkdown } from '@/lib/markdown';

const SITE_URL = 'https://modopag.com.br';
const SITE_NAME = 'modoPAG Blog';
const SITE_DESCRIPTION = 'Dicas, guias e calculadoras gratuitas para empreendedores brasileiros.';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRFC822Date(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toUTCString();
}

export const GET: APIRoute = async () => {
  const posts = await getPosts({ published: true, limit: 50 });

  const items = await Promise.all(
    posts.map(async (post) => {
      const categorySlug = post.category?.slug || 'artigos';
      const postUrl = `${SITE_URL}/blog/${categorySlug}/${post.slug}/`;
      const htmlContent = await parseMarkdown(post.content);

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.description || '')}</description>
      <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
      <pubDate>${formatRFC822Date(post.created_at)}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category.name)}</category>` : ''}
      <author>contato@modopag.com.br (Equipe modoPAG)</author>
    </item>`;
    })
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/blog/</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>pt-BR</language>
    <lastBuildDate>${formatRFC822Date(new Date())}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/blog/images/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}/blog/</link>
    </image>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};

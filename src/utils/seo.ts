import type { Post, PostFaq, Category } from '@/lib/types';

const SITE_URL = 'https://modopag.com.br';
const SITE_NAME = 'modoPAG Blog';
const DEFAULT_OG_IMAGE = '/blog/images/og-default.jpg';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function generateSEO(props: SEOProps): SEOProps {
  return {
    ...props,
    title: `${props.title} | ${SITE_NAME}`,
    canonical: props.canonical || SITE_URL,
    ogImage: props.ogImage || `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    ogType: props.ogType || 'website',
  };
}

export interface AuthorInfo {
  name: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  linkedin?: string;
}

export function generateArticleSchema(
  post: Post,
  categorySlug: string,
  author?: AuthorInfo
): string {
  const authorName = author?.name || 'Equipe modoPAG';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.description,
    image: post.featured_image || `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    author: {
      '@type': 'Person',
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'modoPAG',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/blog/images/logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${categorySlug}/${post.slug}/`,
    },
    articleSection: post.category?.name,
    inLanguage: 'pt-BR',
  };

  return JSON.stringify(schema);
}

export function generatePersonSchema(author: AuthorInfo): string {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    url: SITE_URL,
  };

  if (author.avatar) {
    schema.image = author.avatar;
  }

  const sameAs: string[] = [];
  if (author.twitter) {
    sameAs.push(`https://twitter.com/${author.twitter}`);
  }
  if (author.linkedin) {
    sameAs.push(`https://linkedin.com/in/${author.linkedin}`);
  }
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return JSON.stringify(schema);
}

export function generateFAQSchema(faqs: PostFaq[]): string {
  if (!faqs.length) return '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(schema);
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(schema);
}

export function generateOrganizationSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'modoPAG',
    url: SITE_URL,
    logo: `${SITE_URL}/blog/images/logo.png`,
    sameAs: [
      'https://www.instagram.com/modopag',
      'https://www.linkedin.com/company/modopag',
      'https://twitter.com/modopag',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },
  };

  return JSON.stringify(schema);
}

export function generateWebSiteSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/blog/`,
    publisher: {
      '@type': 'Organization',
      name: 'modoPAG',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(schema);
}

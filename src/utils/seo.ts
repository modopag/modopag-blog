import type { Post, PostFaq, Category } from '@/lib/types';

const SITE_URL = 'https://blog.modopag.com.br';
const SITE_NAME = 'modoPAG Blog';
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

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
  const postUrl = `${SITE_URL}/${categorySlug}/${post.slug}/`;

  const schema: Record<string, unknown> = {
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
      jobTitle: 'Especialista em Meios de Pagamento',
      worksFor: {
        '@type': 'Organization',
        name: 'modoPAG',
        url: SITE_URL,
      },
      knowsAbout: [
        'Maquininhas de cartao',
        'Meios de pagamento',
        'Fintech',
        'MEI',
        'Empreendedorismo',
      ],
      sameAs: [
        'https://www.youtube.com/@MaquinadeCartaoBoa',
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'modoPAG',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
        width: 200,
        height: 60,
      },
      sameAs: [
        'https://www.youtube.com/@MaquinadeCartaoBoa',
        'https://www.instagram.com/modopag',
      ],
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    articleSection: post.category?.name,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,

    // GEO: Campo about para contexto semantico
    about: {
      '@type': 'Thing',
      name: 'Maquininhas de Cartao e Meios de Pagamento',
      description: 'Dispositivos e servicos para processamento de pagamentos com cartao de credito e debito no Brasil',
    },

    // GEO: Speakable para assistentes de voz e LLMs
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.tldr-content', '.faq-answer', 'h1', 'h2', '.prose p:first-of-type'],
    },
  };

  // Adicionar keywords se a categoria existir
  if (post.category?.name) {
    schema.keywords = `${post.category.name}, maquininha de cartao, taxas, modoPAG`;
  }

  return JSON.stringify(schema);
}

export function generatePersonSchema(author: AuthorInfo): string {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    url: SITE_URL,

    // GEO: Expertise e conhecimento
    jobTitle: 'Especialista em Meios de Pagamento',
    worksFor: {
      '@type': 'Organization',
      name: 'modoPAG',
      url: SITE_URL,
    },
    knowsAbout: [
      'Maquininhas de cartao',
      'Meios de pagamento',
      'Taxas de cartao',
      'Empreendedorismo',
      'MEI',
      'Fintech brasileira',
    ],
  };

  if (author.avatar) {
    schema.image = author.avatar;
  }

  const sameAs: string[] = [
    'https://www.youtube.com/@MaquinadeCartaoBoa',
  ];

  if (author.twitter) {
    sameAs.push(`https://twitter.com/${author.twitter}`);
  }
  if (author.linkedin) {
    sameAs.push(`https://linkedin.com/in/${author.linkedin}`);
  }

  schema.sameAs = sameAs;

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
    alternateName: 'modo PAG',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: 'Fintech brasileira especializada em maquininhas de cartao com taxas competitivas: 1,09% no debito e 2,99% no credito a vista.',
    foundingDate: '2020',

    // Area de atuacao
    areaServed: {
      '@type': 'Country',
      name: 'Brasil',
    },

    // Contato
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },

    // Redes sociais e presenca online
    sameAs: [
      'https://www.youtube.com/@MaquinadeCartaoBoa',
      'https://www.instagram.com/modopag',
      'https://www.linkedin.com/company/modopag',
      'https://twitter.com/modopag',
    ],

    // GEO: Conhecimento especializado
    knowsAbout: [
      'Maquininhas de cartao',
      'Processamento de pagamentos',
      'Taxas de cartao de credito e debito',
      'Solucoes para MEI',
      'Fintech',
    ],

    // GEO: Ofertas/Produtos
    makesOffer: {
      '@type': 'Offer',
      name: 'Maquininha de Cartao modoPAG',
      description: 'Maquininha com taxas a partir de 1,09% no debito, sem aluguel e sem mensalidade',
      priceCurrency: 'BRL',
    },
  };

  return JSON.stringify(schema);
}

export function generateWebSiteSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: {
      '@type': 'Organization',
      name: 'modoPAG',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(schema);
}

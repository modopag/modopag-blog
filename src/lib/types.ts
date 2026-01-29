export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  color: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  category_id: string;
  category?: Category;
  featured_image: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  type: 'gratuito' | 'guia' | 'artigo';
  featured: boolean;
  published: boolean;
  views: number;
  reading_time: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostFaq {
  id: string;
  post_id: string;
  question: string;
  answer: string;
  order: number;
  created_at: string;
}

export interface GetPostsOptions {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  featured?: boolean;
  published?: boolean;
  excludeId?: string;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

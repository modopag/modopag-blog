/**
 * Centralized image paths - Local assets served from Vercel CDN
 *
 * Folder structure:
 * public/
 * ├── favicon.avif             (AVIF favicon - best quality)
 * └── images/
 *     └── brand/
 *         ├── modopag-icon.png           (Favicon 32x32)
 *         ├── modopag-icon-large.png     (PWA icon 512x512)
 *         ├── modopag-logo-dark.png      (Logo: black + yellow)
 *         ├── modopag-logo-yellow.png    (Logo: yellow only)
 *         ├── modopag-logo-black.png     (Logo: black only)
 *         ├── modopag-logo-white.png     (Logo: black + white)
 *         ├── modopag-logo-mixed.png     (Logo: yellow + black)
 *         ├── modopag-square-dark.png    (1000x1000 dark)
 *         └── modopag-square-light.png   (1000x1000 light)
 *
 * Post images still come from Supabase (dynamic content):
 * https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images/posts/
 */

// Base paths
const LOCAL_BASE = '/blog/images';
const BRAND_BASE = `${LOCAL_BASE}/brand`;
const SITE_URL = 'https://modopag.com.br';
const SUPABASE_STORAGE_URL = 'https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images';

// Brand assets (local - served from Vercel CDN)
export const BRAND = {
  // Favicons
  favicon: '/blog/favicon.avif',
  icon: `${BRAND_BASE}/modopag-icon.png`,
  iconLarge: `${BRAND_BASE}/modopag-icon-large.png`,

  // Logos (horizontal)
  logoDark: `${BRAND_BASE}/modopag-logo-dark.png`,      // Black text + yellow accent (for light bg)
  logoYellow: `${BRAND_BASE}/modopag-logo-yellow.png`,  // Yellow (for dark bg)
  logoBlack: `${BRAND_BASE}/modopag-logo-black.png`,    // Black only
  logoWhite: `${BRAND_BASE}/modopag-logo-white.png`,    // Black + white
  logoMixed: `${BRAND_BASE}/modopag-logo-mixed.png`,    // Yellow + black

  // Square icons (1000x1000)
  squareDark: `${BRAND_BASE}/modopag-square-dark.png`,
  squareLight: `${BRAND_BASE}/modopag-square-light.png`,

  // Full URLs for social sharing / Open Graph
  ogDefault: `${SITE_URL}/blog/images/brand/modopag-square-light.png`,
  ogDark: `${SITE_URL}/blog/images/brand/modopag-square-dark.png`,
} as const;

// Site metadata
export const SITE = {
  url: SITE_URL,
  blogUrl: `${SITE_URL}/blog/`,
  name: 'modoPAG Blog',
  shortName: 'modoPAG',
  description: 'Dicas, guias e calculadoras gratuitas para gerenciar melhor seu negócio e aceitar pagamentos de forma inteligente.',
  author: 'Equipe modoPAG',
  twitter: '@modopag',
  brandColor: '#FFD700',
  secondaryColor: '#1a1a2e',
  locale: 'pt_BR',
  language: 'pt-BR',
} as const;

/**
 * Get post featured image URL from Supabase
 * @param slug - Post slug
 * @param filename - Image filename (default: featured.webp)
 */
export function getPostImageUrl(slug: string, filename = 'featured.webp'): string {
  return `${SUPABASE_STORAGE_URL}/posts/${slug}/${filename}`;
}

/**
 * Get full URL for an image path (for social sharing)
 * @param path - Local image path starting with /blog/
 */
export function getFullImageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path}`;
}

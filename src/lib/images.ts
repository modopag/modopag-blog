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

// Base paths (updated for subdomain: blog.modopag.com.br)
const LOCAL_BASE = '/images';
const BRAND_BASE = `${LOCAL_BASE}/brand`;
const SITE_URL = 'https://blog.modopag.com.br';
const SUPABASE_STORAGE_URL = 'https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images';

// Brand assets (local - served from Vercel CDN)
export const BRAND = {
  // Favicons
  favicon: '/favicon.avif',
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
  ogDefault: `${SITE_URL}/images/brand/modopag-square-light.png`,
  ogDark: `${SITE_URL}/images/brand/modopag-square-dark.png`,
} as const;

// Site metadata (updated for subdomain)
export const SITE = {
  url: SITE_URL,
  blogUrl: `${SITE_URL}/`,
  mainSiteUrl: 'https://modopag.com.br',
  name: 'modoPAG Blog',
  shortName: 'modoPAG',
  description: 'Dicas, guias e calculadoras gratuitas para gerenciar melhor seu negocio e aceitar pagamentos de forma inteligente.',
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
 * Convert Supabase storage URL to proxy URL (/img/...)
 * This allows serving images via blog.modopag.com.br/img/ instead of direct Supabase URLs
 *
 * @param url - Original image URL (can be Supabase URL or already a proxy URL)
 * @returns Proxy URL path or original URL if not from Supabase blog-images bucket
 *
 * @example
 * toProxyImageUrl('https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images/posts/foo.webp')
 * // Returns: '/img/posts/foo.webp'
 */
export function toProxyImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already a proxy URL
  if (url.startsWith('/img/')) return url;

  // Convert Supabase blog-images URL to proxy
  if (url.includes('supabase.co') && url.includes('/blog-images/')) {
    const match = url.match(/\/blog-images\/(.+)$/);
    if (match) {
      return `/img/${match[1]}`;
    }
  }

  // Return original URL for non-Supabase images
  return url;
}

/**
 * Get full URL for an image path (for social sharing)
 * Handles both local paths and proxy paths
 * @param path - Local image path or proxy path
 */
export function getFullImageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path}`;
}

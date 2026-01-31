/**
 * Centralized image paths - Local assets served from Vercel CDN
 *
 * Folder structure:
 * public/
 * ├── favicon.svg              (SVG favicon - best quality)
 * └── images/
 *     └── brand/
 *         ├── modopag-icon.png        (PWA icons - 512x512)
 *         ├── modopag-logo-dark.png   (for light backgrounds)
 *         └── modopag-logo-yellow.png (for dark backgrounds)
 *
 * Post images still come from Supabase (dynamic content):
 * https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images/posts/
 */

// Base path for local images
const LOCAL_BASE = '/images';
const SUPABASE_STORAGE_URL = 'https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images';

// Brand assets (local - served from Vercel CDN)
export const BRAND = {
  favicon: '/favicon.svg',
  icon: `${LOCAL_BASE}/brand/modopag-icon.png`,
  logoDark: `${LOCAL_BASE}/brand/modopag-logo-dark.png`,
  logoYellow: `${LOCAL_BASE}/brand/modopag-logo-yellow.png`,
  // OG image uses full URL for social sharing
  ogDefault: 'https://blog.modopag.com.br/images/brand/modopag-icon.png',
} as const;

/**
 * Get post featured image URL from Supabase
 * @param slug - Post slug
 * @param filename - Image filename (default: featured.webp)
 */
export function getPostImageUrl(slug: string, filename = 'featured.webp'): string {
  return `${SUPABASE_STORAGE_URL}/posts/${slug}/${filename}`;
}

/**
 * Centralized image URLs from Supabase Storage
 *
 * Bucket: blog-images
 * Base URL: https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images
 *
 * Folder structure in Supabase Storage:
 * blog-images/
 * ├── brand/
 * │   ├── modopag-icon.png        (favicon, app icons - 512x512)
 * │   ├── modopag-logo-dark.png   (for light backgrounds - 400x100)
 * │   ├── modopag-logo-yellow.png (for dark backgrounds - 400x100)
 * │   └── modopag-og-default.png  (social sharing - 1200x630)
 * ├── posts/
 * │   └── [post-slug]/
 * │       └── featured.webp       (post featured images - 1200x630)
 * ├── categories/
 * │   └── [category-slug].webp    (category covers - 800x400)
 * └── defaults/
 *     └── post-placeholder.webp   (fallback for posts without images)
 */

const SUPABASE_STORAGE_URL = 'https://acxelejbtjjkttfwrdbi.supabase.co/storage/v1/object/public/blog-images';

// Brand assets
export const BRAND = {
  icon: `${SUPABASE_STORAGE_URL}/brand/modopag-icon.png`,
  logoDark: `${SUPABASE_STORAGE_URL}/brand/modopag-logo-dark.png`,
  logoYellow: `${SUPABASE_STORAGE_URL}/brand/modopag-logo-yellow.png`,
  ogDefault: `${SUPABASE_STORAGE_URL}/brand/modopag-og-default.png`,
} as const;

// Default/fallback images
export const DEFAULTS = {
  postPlaceholder: `${SUPABASE_STORAGE_URL}/defaults/post-placeholder.webp`,
  categoryPlaceholder: `${SUPABASE_STORAGE_URL}/defaults/category-placeholder.webp`,
} as const;

/**
 * Get post featured image URL
 * @param slug - Post slug
 * @param filename - Image filename (default: featured.webp)
 */
export function getPostImageUrl(slug: string, filename = 'featured.webp'): string {
  return `${SUPABASE_STORAGE_URL}/posts/${slug}/${filename}`;
}

/**
 * Get category cover image URL
 * @param categorySlug - Category slug
 */
export function getCategoryImageUrl(categorySlug: string): string {
  return `${SUPABASE_STORAGE_URL}/categories/${categorySlug}.webp`;
}

/**
 * Image optimization tips for Supabase Storage:
 *
 * 1. Use WebP format for best compression/quality ratio
 * 2. Recommended sizes:
 *    - Favicon/Icon: 512x512 PNG (for PWA compatibility)
 *    - Logo: 400x100 PNG (with transparency)
 *    - OG/Social: 1200x630 PNG or WebP
 *    - Post featured: 1200x630 WebP
 *    - Thumbnails: 400x225 WebP
 *
 * 3. Enable Supabase CDN caching (automatic for public buckets)
 * 4. Use descriptive filenames for SEO
 */

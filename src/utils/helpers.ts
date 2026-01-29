import type { TableOfContentsItem } from '@/lib/types';

/**
 * Extract table of contents from HTML content
 */
export function extractTableOfContents(html: string): TableOfContentsItem[] {
  const headingRegex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  const items: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, ''); // Strip any inner HTML tags

    items.push({ id, text, level });
  }

  return items;
}

/**
 * Add IDs to headings in HTML content
 */
export function addHeadingIds(html: string): string {
  let counter = 0;
  return html.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const id = slugify(text) || `heading-${counter++}`;

    if (attrs.includes('id="')) {
      return match;
    }

    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

/**
 * Convert text to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Format date to Brazilian Portuguese
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date for datetime attribute
 */
export function formatDateISO(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Truncate text to a specific length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Get type label in Portuguese
 */
export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    gratuito: 'Gratuito',
    guia: 'Guia',
    artigo: 'Artigo',
  };
  return labels[type] || type;
}

/**
 * Get type color class
 */
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    gratuito: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    guia: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    artigo: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

/**
 * Generate share URLs
 */
export function generateShareUrls(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };
}

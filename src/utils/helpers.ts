import type { TableOfContentsItem } from '@/lib/types';

/**
 * Extract table of contents from HTML content (H2 only for cleaner TOC)
 */
export function extractTableOfContents(html: string): TableOfContentsItem[] {
  const headingRegex = /<h2[^>]*id="([^"]*)"[^>]*>(.*?)<\/h2>/gi;
  const items: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const id = match[1];
    const text = match[2].replace(/<[^>]*>/g, ''); // Strip any inner HTML tags

    items.push({ id, text, level: 2 });
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

/**
 * Format date to DD/MM/YYYY Brazilian format
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

/**
 * Check if two dates are on different days
 */
export function isDifferentDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.toDateString() !== d2.toDateString();
}

/**
 * Insert content at a specific position in HTML
 */
export function insertAtPercentage(html: string, insertContent: string, percentage: number): string {
  const paragraphs = html.split(/<\/p>/gi);
  if (paragraphs.length < 2) return html;

  const insertIndex = Math.floor(paragraphs.length * (percentage / 100));
  const actualIndex = Math.max(1, Math.min(insertIndex, paragraphs.length - 1));

  paragraphs.splice(actualIndex, 0, `</p>${insertContent}<p>`);
  return paragraphs.join('</p>');
}

/**
 * Split HTML content after the introduction (first heading or first 2 paragraphs)
 * Used for inserting calculator/tools in the "middle" position
 */
export function splitContentAfterIntro(htmlContent: string): { intro: string; remaining: string } {
  // Try to find the first H2 as a natural break point
  const h2Match = htmlContent.match(/<h2[^>]*>.*?<\/h2>/i);
  if (h2Match && h2Match.index !== undefined) {
    const splitPoint = h2Match.index;
    return {
      intro: htmlContent.slice(0, splitPoint),
      remaining: htmlContent.slice(splitPoint),
    };
  }

  // Fallback: split after the second paragraph
  const paragraphRegex = /<\/p>/gi;
  let match;
  let count = 0;
  let lastIndex = 0;

  while ((match = paragraphRegex.exec(htmlContent)) !== null) {
    count++;
    if (count === 2) {
      lastIndex = match.index + match[0].length;
      break;
    }
  }

  if (lastIndex > 0) {
    return {
      intro: htmlContent.slice(0, lastIndex),
      remaining: htmlContent.slice(lastIndex),
    };
  }

  // Final fallback: return all as intro
  return { intro: htmlContent, remaining: '' };
}

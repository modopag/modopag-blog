import { marked } from 'marked';

// Configure marked with GFM options
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: false,    // Don't convert single \n to <br> (breaks tables)
});

/**
 * Parse markdown content to HTML
 */
export async function parseMarkdown(content: string): Promise<string> {
  if (!content) return '';

  try {
    // Normalize line endings
    const normalizedContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    const result = marked.parse(normalizedContent);

    // Handle both sync and async results
    if (result instanceof Promise) {
      return await result;
    }
    return result;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return content;
  }
}

/**
 * Parse markdown synchronously
 */
export function parseMarkdownSync(content: string): string {
  if (!content) return '';

  try {
    const result = marked.parse(content, { async: false });
    return result as string;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return content;
  }
}

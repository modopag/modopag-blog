import { marked, Renderer } from 'marked';

// Custom renderer to ensure proper table rendering
const renderer = new Renderer();

// Configure marked with proper options for GFM
marked.use({
  gfm: true,        // GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: false,    // Don't convert single \n to <br> (breaks tables)
  renderer,
});

/**
 * Parse markdown content to HTML
 */
export async function parseMarkdown(content: string): Promise<string> {
  if (!content) return '';

  try {
    // Normalize line endings and ensure proper spacing for tables
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

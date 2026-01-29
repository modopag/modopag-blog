import { marked } from 'marked';

// Configure marked with proper options for GFM
marked.use({
  gfm: true,        // GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: true,     // Convert \n to <br>
});

/**
 * Parse markdown content to HTML
 */
export async function parseMarkdown(content: string): Promise<string> {
  if (!content) return '';

  try {
    const result = marked.parse(content);

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

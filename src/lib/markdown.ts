import { marked, type MarkedOptions } from 'marked';

// Configure marked options for GFM (GitHub Flavored Markdown)
const options: MarkedOptions = {
  gfm: true,
  breaks: true,
};

marked.use(options);

/**
 * Parse markdown content to HTML
 */
export async function parseMarkdown(content: string): Promise<string> {
  if (!content) return '';

  try {
    // marked.parse can return string or Promise<string> depending on async option
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
 * Parse markdown synchronously (for cases where async isn't needed)
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

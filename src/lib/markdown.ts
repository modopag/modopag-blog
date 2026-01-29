import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Parse markdown content to HTML
 */
export async function parseMarkdown(content: string): Promise<string> {
  if (!content) return '';

  try {
    const html = await marked.parse(content);
    return html;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return content;
  }
}

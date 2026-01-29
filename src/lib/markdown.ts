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
    // Debug: Check if content already has HTML
    const hasHtmlTags = /<[^>]+>/.test(content);
    const hasPipeTables = /\|.*\|/.test(content);

    console.log('=== MARKDOWN DEBUG ===');
    console.log('Content length:', content.length);
    console.log('Has HTML tags:', hasHtmlTags);
    console.log('Has pipe tables:', hasPipeTables);
    console.log('First 300 chars:', content.substring(0, 300));

    // If content already has HTML, it might be pre-processed
    // In that case, just return it as-is or try to parse anyway

    // Normalize line endings
    const normalizedContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    const result = marked.parse(normalizedContent);

    // Handle both sync and async results
    let htmlResult: string;
    if (result instanceof Promise) {
      htmlResult = await result;
    } else {
      htmlResult = result;
    }

    // Debug: Check output
    const outputHasTable = /<table/.test(htmlResult);
    console.log('Output has <table>:', outputHasTable);
    console.log('Output first 300 chars:', htmlResult.substring(0, 300));
    console.log('=== END DEBUG ===');

    return htmlResult;
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

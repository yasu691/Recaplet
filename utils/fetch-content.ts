import { JSDOM } from 'jsdom';

interface FetchResult {
  content: string;
  success: boolean;
  error?: string;
}

export async function fetchWebpageContent(
  url: string,
  retries: number = 3,
  timeout: number = 10000
): Promise<FetchResult> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RecapletBot/1.0)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Try various methods to extract the main content
      let content = '';

      // Method 1: Look for common article containers
      const articleSelectors = [
        'article',
        '[role="main"]',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        'main',
      ];

      for (const selector of articleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          content = element.textContent;
          break;
        }
      }

      // Method 2: If no article found, try to get all paragraphs
      if (!content || content.length < 100) {
        const paragraphs = Array.from(document.querySelectorAll('p'));
        content = paragraphs.map(p => p.textContent).join('\n');
      }

      // Clean up the content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      if (content.length < 50) {
        throw new Error('Extracted content too short');
      }

      return {
        content,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (attempt === retries) {
        return {
          content: '',
          success: false,
          error: `Failed after ${retries} attempts: ${errorMessage}`,
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    content: '',
    success: false,
    error: 'Max retries exceeded',
  };
}

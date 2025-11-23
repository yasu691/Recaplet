export interface NewsItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
  contentHash?: string;
}

export interface NewsData {
  generatedAt: string;
  items: NewsItem[];
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
}

export interface NewsData {
  generatedAt: string;
  items: NewsItem[];
}

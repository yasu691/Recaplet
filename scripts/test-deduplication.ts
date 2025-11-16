import { generateArticleId } from '../utils/hash';

interface Article {
  title: string;
  url: string;
}

function testDeduplication() {
  const articles: Article[] = [
    { title: '記事A', url: 'https://example.com/article-1' },
    { title: '記事B', url: 'https://example.com/article-2' },
    { title: '記事C（重複）', url: 'https://example.com/article-1' },
    { title: '記事D', url: 'https://example.com/article-3' },
    { title: '記事E（重複）', url: 'https://example.com/article-2' },
  ];

  console.log('=== 重複排除テスト ===\n');
  console.log(`元の記事数: ${articles.length}\n`);

  // 各記事の ID を表示
  console.log('各記事の ID:');
  articles.forEach((article, i) => {
    const id = generateArticleId(article.url);
    console.log(`${i + 1}. ${article.title} → ID: ${id}`);
  });

  // Map で重複排除
  const uniqueMap = new Map(
    articles.map(article => [
      generateArticleId(article.url),
      article
    ])
  );

  const uniqueArticles = Array.from(uniqueMap.values());

  console.log(`\n重複排除後: ${uniqueArticles.length} 件\n`);

  console.log('ユニークな記事:');
  uniqueArticles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
  });
}

testDeduplication();

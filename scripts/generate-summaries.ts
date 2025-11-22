import { config } from 'dotenv';
import Parser from 'rss-parser';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as fs from 'fs/promises';
import { generateArticleId } from '../utils/hash';

// .env.local を明示的に読み込み
config({ path: '.env.local' });

// レート制限対策: リクエスト間の待機時間（ミリ秒）
const RATE_LIMIT_DELAY_MS = 6000; // 6秒（1分あたり10リクエスト制限に対応）

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractContent(item: any): string {
  return (
    item['content:encoded'] ||
    item.content ||
    item.contentSnippet ||
    item.description ||
    ''
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
}

interface NewsData {
  generatedAt: string;
  items: NewsItem[];
}

async function generateSummaries() {
  try {
    // 環境変数の確認
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY が設定されていません。');
    }

    console.log('=== RSS要約生成開始 ===\n');

    const parser = new Parser();
    const feedsJson = await fs.readFile('feeds.json', 'utf-8');
    const feedsData = JSON.parse(feedsJson);

    const allItems: NewsItem[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const feedConfig of feedsData.feeds) {
      console.log(`\n処理中: ${feedConfig.name}`);

      try {
        const feed = await parser.parseURL(feedConfig.url);
        const items = feed.items.slice(0, 3); // レート制限対策: 3件に削減

        for (const item of items) {
          try {
            // 本文抽出
            const rawContent = extractContent(item);
            if (!rawContent || rawContent.length < 50) {
              console.log(`  スキップ: ${item.title}（本文が短すぎる）`);
              continue;
            }

            const cleanContent = stripHtml(rawContent);
            const limitedContent = cleanContent.slice(0, 2000);

            // 要約生成
            const result = await generateText({
              model: google('gemini-2.5-flash'),
              prompt: `以下の記事を200文字以内の日本語で要約してください:\n\n${limitedContent}`,
            });

            const newsItem: NewsItem = {
              id: generateArticleId(item.link || ''),
              title: item.title || 'タイトルなし',
              url: item.link || '',
              summary: result.text,
              source: feedConfig.name,
              publishedAt: item.isoDate || new Date().toISOString(),
            };

            allItems.push(newsItem);
            successCount++;
            console.log(`  ✓ ${item.title}`);

            // レート制限対策: 次のリクエストまで待機
            await sleep(RATE_LIMIT_DELAY_MS);

          } catch (error) {
            errorCount++;
            console.error(`  ✗ エラー: ${item.title}`, error);
          }
        }
      } catch (error) {
        console.error(`フィード取得エラー: ${feedConfig.name}`, error);
        errorCount++;
      }
    }

    // 重複排除
    const beforeDedup = allItems.length;
    const uniqueMap = new Map(
      allItems.map(item => [item.id, item])
    );
    const uniqueItems = Array.from(uniqueMap.values());

    // 日時降順ソート
    uniqueItems.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // JSON 出力
    const newsData: NewsData = {
      generatedAt: new Date().toISOString(),
      items: uniqueItems,
    };

    // data/news.json に書き込み
    await fs.writeFile(
      'data/news.json',
      JSON.stringify(newsData, null, 2),
      'utf-8'
    );

    // public/data/news.json にもコピー（Web アプリ用）
    await fs.writeFile(
      'public/data/news.json',
      JSON.stringify(newsData, null, 2),
      'utf-8'
    );

    console.log('\n=== 処理完了 ===');
    console.log(`成功: ${successCount} 件`);
    console.log(`エラー: ${errorCount} 件`);
    console.log(`重複排除前: ${beforeDedup} 件`);
    console.log(`重複排除後: ${uniqueItems.length} 件`);
    console.log(`出力先: data/news.json`);

  } catch (error) {
    console.error('致命的エラー:', error);
    process.exit(1);
  }
}

generateSummaries();

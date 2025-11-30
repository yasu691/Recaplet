import { config } from 'dotenv';
import Parser from 'rss-parser';
import { generateText } from 'ai';
import { azure } from '@ai-sdk/azure';
import * as fs from 'fs/promises';
import { generateArticleId, generateContentHash } from '../utils/hash';
import { fetchWebpageContent } from '../utils/fetch-content';

// .env.local を明示的に読み込み
config({ path: '.env.local' });

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
  contentHash?: string;
}

interface NewsData {
  generatedAt: string;
  items: NewsItem[];
}

async function generateSummaries() {
  try {
    // 環境変数の確認
    if (!process.env.AZURE_API_KEY) {
      throw new Error('AZURE_API_KEY が設定されていません。');
    }
    if (!process.env.AZURE_RESOURCE_NAME) {
      throw new Error('AZURE_RESOURCE_NAME が設定されていません。');
    }
    if (!process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
      throw new Error('AZURE_OPENAI_DEPLOYMENT_NAME が設定されていません。');
    }

    // Azure OpenAI モデルの初期化
    const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT_NAME);

    console.log('=== RSS要約生成開始 ===\n');

    const parser = new Parser();
    const feedsJson = await fs.readFile('feeds.json', 'utf-8');
    const feedsData = JSON.parse(feedsJson);

    // 既存の記事を読み込み（存在しない場合は空配列）
    let existingItems: NewsItem[] = [];
    try {
      const existingData = await fs.readFile('data/news.json', 'utf-8');
      const parsed = JSON.parse(existingData) as NewsData;
      existingItems = parsed.items || [];
      console.log(`既存記事: ${existingItems.length} 件\n`);
    } catch (error) {
      console.log('既存記事なし（初回実行）\n');
    }

    const allItems: NewsItem[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const feedConfig of feedsData.feeds) {
      console.log(`\n処理中: ${feedConfig.name}`);

      try {
        const feed = await parser.parseURL(feedConfig.url);
        const items = feed.items.slice(0, 10); // 全件処理（Azure OpenAI はレート制限が緩い）

        for (const item of items) {
          try {
            // 本文抽出
            let rawContent = extractContent(item);
            let cleanContent = stripHtml(rawContent);

            // RSSの本文が短い場合、Webページから取得を試みる
            if (!cleanContent || cleanContent.length < 50) {
              console.log(`  RSS本文不足、Webページから取得中: ${item.title}`);

              if (item.link) {
                const fetchResult = await fetchWebpageContent(item.link);
                if (fetchResult.success) {
                  cleanContent = fetchResult.content;
                  console.log(`  ✓ Webページから取得成功: ${cleanContent.length}文字`);
                } else {
                  console.log(`  ✗ Webページ取得失敗: ${fetchResult.error}`);
                  console.log(`  スキップ: ${item.title}`);
                  continue;
                }
              } else {
                console.log(`  スキップ: ${item.title}（URLなし）`);
                continue;
              }
            }

            const limitedContent = cleanContent.slice(0, 2000);

            // コンテンツハッシュを生成
            const contentHash = generateContentHash(limitedContent);

            // 既存記事から同じcontentHashを持つものを検索
            const existingItemWithSameContent = existingItems.find(
              existing => existing.contentHash === contentHash
            );

            let summary: string;

            if (existingItemWithSameContent) {
              // 同じコンテンツの記事が既に存在する場合、既存の要約を再利用
              summary = existingItemWithSameContent.summary;
              console.log(`  ♻ 要約再利用: ${item.title}`);
            } else {
              // 新しいコンテンツの場合、要約を生成
              const result = await generateText({
                model: model,
                prompt: `以下の記事を200文字以内の日本語で要約してください:\n\n${limitedContent}`,
              });
              summary = result.text;
              console.log(`  ✓ 新規要約: ${item.title}`);
            }

            const newsItem: NewsItem = {
              id: generateArticleId(item.link || ''),
              title: item.title || 'タイトルなし',
              url: item.link || '',
              summary: summary,
              source: feedConfig.name,
              publishedAt: item.isoDate || new Date().toISOString(),
              contentHash: contentHash,
            };

            allItems.push(newsItem);
            successCount++;

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

    // 既存記事と新規記事をマージ
    const mergedItems = [...existingItems, ...allItems];

    // 重複排除（ID ベース）
    const beforeDedup = mergedItems.length;
    const uniqueMap = new Map(
      mergedItems.map(item => [item.id, item])
    );
    let uniqueItems = Array.from(uniqueMap.values());

    // 日時降順ソート
    uniqueItems.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // 最新1000件のみ保持
    const maxItems = 1000;
    const beforeTrim = uniqueItems.length;
    if (uniqueItems.length > maxItems) {
      uniqueItems = uniqueItems.slice(0, maxItems);
      console.log(`\n記事数制限: ${beforeTrim} 件 → ${maxItems} 件（古い記事を ${beforeTrim - maxItems} 件削除）`);
    }

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
    console.log(`新規取得: ${successCount} 件`);
    console.log(`エラー: ${errorCount} 件`);
    console.log(`既存記事: ${existingItems.length} 件`);
    console.log(`マージ後: ${beforeDedup} 件`);
    console.log(`重複排除後: ${beforeTrim} 件`);
    console.log(`最終出力: ${uniqueItems.length} 件`);
    console.log(`出力先: data/news.json`);

  } catch (error) {
    console.error('致命的エラー:', error);
    process.exit(1);
  }
}

generateSummaries();

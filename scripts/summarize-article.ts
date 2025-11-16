import { config } from 'dotenv';
import Parser from 'rss-parser';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as fs from 'fs/promises';

// .env.local を明示的に読み込み
config({ path: '.env.local' });

// 指定されたRSSフィードからできるだけ詳しい記事の内容を抽出する関数
function extractContent(item: any): string {
  return (
    item['content:encoded'] ||
    item.content ||
    item.contentSnippet ||
    item.description ||
    ''
  );
}

// HTMLタグを取り除いてプレーンテキストフォーマットにする関数
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // HTMLタグを削除
    .replace(/&nbsp;/g, ' ') // &nbsp;を半角スペースに変換
    .replace(/&lt;/g, '<') // &lt;を<に変換
    .replace(/&gt;/g, '>') // &gt;を>に変換
    .replace(/&amp;/g, '&') // &amp;を&に変換
    .replace(/&quot;/g, '"') // &quot;を"に変換
    .replace(/&#39;/g, "'") // &#39;を'に変換
    .replace(/\s+/g, ' ') // 連続する空白を単一のスペースに変換
    .trim(); // 前後の空白を削除
}

async function summarizeArticle() {
  try {
    // 環境変数の確認
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY が設定されていません。');
    }

    // 1. RSS フィード取得
    const parser = new Parser();
    const feedsJson = await fs.readFile('feeds.json', 'utf-8');
    const feedsData = JSON.parse(feedsJson);
    const firstFeed = feedsData.feeds[0];

    console.log(`フィード: ${firstFeed.name}\n`);

    const feed = await parser.parseURL(firstFeed.url);
    const firstItem = feed.items[0];

    console.log(`タイトル: ${firstItem.title}`);
    console.log(`URL: ${firstItem.link}\n`);

    // 2. 本文抽出
    const rawContent = extractContent(firstItem);
    const cleanContent = stripHtml(rawContent);

    // 3. 2000文字に制限
    const limitedContent = cleanContent.slice(0, 2000);
    console.log(`本文長: ${limitedContent.length} 文字\n`);

    // 4. Gemini で要約
    console.log('要約生成中...\n');

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `以下の記事を200文字以内の日本語で要約してください:\n\n${limitedContent}`,
    });

    console.log('=== 要約結果 ===');
    console.log(result.text);

    console.log('\n=== トークン使用量 ===');
    console.log(`入力: ${result.usage.inputTokens} tokens`);
    console.log(`出力: ${result.usage.outputTokens} tokens`);
    console.log(`合計: ${result.usage.totalTokens} tokens`);

    // 5. コスト計算（Gemini 2.5 Flash）
    const inputCost = result.usage.inputTokens * 0.075 / 1_000_000;
    const outputCost = result.usage.outputTokens * 0.30 / 1_000_000;
    const totalCost = inputCost + outputCost;

    console.log('\n=== コスト ===');
    console.log(`$${totalCost.toFixed(6)} (約 ${(totalCost * 150).toFixed(4)} 円)`);

  } catch (error) {
    console.error('エラー:', error);
  }
}

summarizeArticle();

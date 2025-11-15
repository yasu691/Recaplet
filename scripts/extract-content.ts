import Parser from 'rss-parser';
import * as fs from 'fs/promises';

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

async function testContentExtraction() {
    try {
        // Parserのインスタンス作成
        const parser = new Parser();
        const feedsJson = await fs.readFile('feeds.json', 'utf-8'); // feeds.jsonを読み込み
        const feedData = JSON.parse(feedsJson); // JSON形式にパース

        // 最初のフィードデータを取得
        const firstFeed = feedData.feeds[3];
        console.log(`フィード名: ${firstFeed.name}`);

        // RSSを取得
        const feed = await parser.parseURL(firstFeed.url);
        const firstItem = feed.items[0];

        console.log(`タイトル: ${firstItem.title}`);
        console.log(`公開日: ${firstItem.pubDate}\n`);

        // コンテンツ抽出とHTMLタグ除去
        const rawContent = extractContent(firstItem);
        console.log(`元の本文長: ${rawContent.length}文字`);

        const cleanContent = stripHtml(rawContent);
        console.log(`整形後: ${cleanContent.length}文字\n`);

        console.log('===抽出された本文(最初の200文字) ===');
        console.log(cleanContent.slice(0, 2000) + '...');
    } catch (error) {
        console.error('エラー:', error);
    }
}

testContentExtraction();

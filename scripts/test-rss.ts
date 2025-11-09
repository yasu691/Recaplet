import Parser from 'rss-parser';
import * as fs from 'fs/promises';

// TODO(human): 以下の処理を実装してください
// 1. Parser のインスタンスを作成
// 2. feeds.json を読み込んで JSON.parse
// 3. feeds 配列の最初のフィードを取得
// 4. parser.parseURL() で RSS を取得
// 5. 最初の 3 件の記事タイトルを console.log で表示

async function testRssFeed() {
    try {
        // Parser のインスタンスを作成
        const parser = new Parser();

        // feeds.json を読み込んで JSON.parse
        const feedsJson = await fs.readFile('feeds.json', 'utf-8');
        const feedsData = JSON.parse(feedsJson);

        // feeds 配列の最初のフィードを取得
        const firstFeed = feedsData.feeds[0];
        console.log(`フィード名: ${firstFeed.name}`);
        console.log(`フィードURL: ${firstFeed.url}\n`);

        // RSS を取得
        const feed = await parser.parseURL(firstFeed.url);

        // 最初の３件を表示
        console.log('最新の記事タイトル:');
        for (let i = 0; i < 3 && i < feed.items.length; i++) {
            console.log(`記事${i + 1}: ${feed.items[i].title}`);
        }
    } catch (error) {
        console.error('RSSフィードの取得中にエラーが発生しました:', error);
    }
}

testRssFeed();

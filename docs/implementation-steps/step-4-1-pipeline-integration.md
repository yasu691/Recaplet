# Step 4-1: 全体パイプラインの統合

## 目標
RSS取得 → 本文抽出 → 要約生成 → 重複排除 → JSON出力の完全なパイプラインを構築する

---

## 前提知識

### パイプライン処理とは

```
入力: feeds.json
  ↓
Step 1: RSS フィード取得（複数フィード）
  ↓
Step 2: 各記事の本文抽出
  ↓
Step 3: Gemini で要約生成
  ↓
Step 4: 重複排除（URL ハッシュ）
  ↓
Step 5: 日時降順ソート
  ↓
出力: data/news.json
```

### データモデル

#### 入力（feeds.json）

```json
{
  "feeds": [
    { "url": "https://...", "name": "Feed Name" }
  ]
}
```

#### 出力（data/news.json）

```json
{
  "generatedAt": "2025-11-08T07:00:00.000Z",
  "items": [
    {
      "id": "a3f2c1d5e6b7",
      "title": "記事タイトル",
      "url": "https://...",
      "summary": "要約文（200文字）",
      "source": "Feed Name",
      "publishedAt": "2025-11-08T06:00:00.000Z"
    }
  ]
}
```

---

## 作業手順

### 1. データ出力ディレクトリの作成

```bash
mkdir -p data
```

---

## ユーザー実装部分

### `scripts/generate-summaries.ts` の作成

これまでのステップで作った関数を**統合**するのだ：

```typescript
import 'dotenv/config';
import Parser from 'rss-parser';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as fs from 'fs/promises';
import { generateArticleId } from '../utils/hash';

// TODO(human): Step 2-2 の関数をコピー
function extractContent(item: any): string {
  // ...
}

function stripHtml(html: string): string {
  // ...
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

// TODO(human): 以下のメイン処理を実装してください
// 1. feeds.json を読み込む
// 2. 各フィードから最新10件の記事を取得
// 3. 各記事について:
//    a. 本文を抽出（extractContent + stripHtml）
//    b. 2000文字に制限
//    c. Gemini で要約生成
//    d. NewsItem オブジェクトを作成
// 4. すべての記事を配列に集める
// 5. 重複排除（Map を使用）
// 6. 日時降順でソート（publishedAt）
// 7. data/news.json に出力
// 8. 処理統計を表示（成功件数、エラー件数）

async function generateSummaries() {
  // ここに実装
}

generateSummaries();
```

---

### 実装のヒント

<details>
<summary>ヒント1: 複数フィードの処理</summary>

```typescript
const feedsJson = await fs.readFile('feeds.json', 'utf-8');
const feedsData = JSON.parse(feedsJson);

const allItems: NewsItem[] = [];

for (const feedConfig of feedsData.feeds) {
  console.log(`処理中: ${feedConfig.name}`);

  const feed = await parser.parseURL(feedConfig.url);

  // 最新10件のみ
  const items = feed.items.slice(0, 10);

  for (const item of items) {
    // 各記事を処理
  }
}
```
</details>

<details>
<summary>ヒント2: 記事の要約と NewsItem 作成</summary>

```typescript
const rawContent = extractContent(item);
const cleanContent = stripHtml(rawContent);
const limitedContent = cleanContent.slice(0, 2000);

const result = await generateText({
  model: google('gemini-1.5-flash'),
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
```
</details>

<details>
<summary>ヒント3: 重複排除と日時ソート</summary>

```typescript
// 重複排除
const uniqueMap = new Map(
  allItems.map(item => [item.id, item])
);
const uniqueItems = Array.from(uniqueMap.values());

// 日時降順ソート
uniqueItems.sort((a, b) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);
```
</details>

<details>
<summary>ヒント4: JSON 出力</summary>

```typescript
const newsData: NewsData = {
  generatedAt: new Date().toISOString(),
  items: uniqueItems,
};

await fs.writeFile(
  'data/news.json',
  JSON.stringify(newsData, null, 2),
  'utf-8'
);
```
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```typescript
import 'dotenv/config';
import Parser from 'rss-parser';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as fs from 'fs/promises';
import { generateArticleId } from '../utils/hash';

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
        const items = feed.items.slice(0, 10);

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
              model: google('gemini-1.5-flash'),
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

    await fs.writeFile(
      'data/news.json',
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
```
</details>

---

## 動作確認

### 1. スクリプトの実行

```bash
npx tsx scripts/generate-summaries.ts
```

**注意:** API コールが多いため、**1〜2分かかる**のだ

### 2. 確認観点

#### ✅ チェックリスト

- [ ] 各フィードの処理状況が表示される
- [ ] 各記事に ✓ または ✗ が表示される
- [ ] `data/news.json` が生成される
- [ ] JSON ファイルが正しいフォーマット
- [ ] 成功件数とエラー件数が表示される
- [ ] 重複排除の前後の件数が表示される

#### 期待される出力例

```
=== RSS要約生成開始 ===

処理中: Zenn
  ✓ Expo Router で型安全なルーティングを実現する
  ✓ React 19 の新機能まとめ
  ✓ TypeScript 5.5 の新機能
  ...

処理中: Publickey
  ✓ AWS re:Invent 2024 の発表まとめ
  ✓ Kubernetes 1.30 リリース
  ...

=== 処理完了 ===
成功: 18 件
エラー: 2 件
重複排除前: 18 件
重複排除後: 18 件
出力先: data/news.json
```

### 3. JSON ファイルの確認

```bash
cat data/news.json | head -n 30
```

**期待される内容:**

```json
{
  "generatedAt": "2025-11-08T07:30:00.123Z",
  "items": [
    {
      "id": "a3f2c1d5e6b7",
      "title": "Expo Router で型安全なルーティングを実現する",
      "url": "https://zenn.dev/articles/...",
      "summary": "Expo Routerはファイルベースルーティングを提供し...",
      "source": "Zenn",
      "publishedAt": "2025-11-08T06:00:00.000Z"
    },
    ...
  ]
}
```

---

## トラブルシューティング

### エラー: `ENOENT: no such file or directory, open 'feeds.json'`

**原因:** feeds.json がない

**解決:**
```bash
cat feeds.json  # 存在確認
pwd             # 正しいディレクトリにいるか確認
```

### 成功件数が 0

**原因:** API キーが間違っている、または本文抽出に失敗

**デバッグ:**
```typescript
console.log('本文:', limitedContent.slice(0, 200));
```

### エラー: `429 Too Many Requests`

**原因:** レート制限（Gemini無料枠: 60リクエスト/分）

**解決:**
- 処理する記事数を減らす:

```typescript
const items = feed.items.slice(0, 5); // 10 → 5 に変更
```

- 遅延を追加:

```typescript
// 各記事の処理後に1秒待機
await new Promise(resolve => setTimeout(resolve, 1000));
```

### JSON が不正なフォーマット

**確認:**
```bash
cat data/news.json | python -m json.tool
```

エラーが出たら、JSON のシンタックスエラーがある

---

## パフォーマンス最適化

### 並列処理（上級者向け）

```typescript
// 逐次処理（現在）
for (const item of items) {
  await generateText(...);  // 1つずつ
}

// 並列処理（高速だがレート制限に注意）
const promises = items.map(item => generateText(...));
const results = await Promise.all(promises);
```

**注意:** レート制限に引っかかりやすいため、このプロジェクトでは逐次処理を採用するのだ

---

## 次のステップ

パイプラインが動作したら、次は [Step 4-2: エラーハンドリングの追加](step-4-2-error-handling.md) に進むのだ！

---

## 学習メモ欄

```
- 複数のステップを統合してパイプライン化できた
- for...of で複数フィードを処理
- Map で重複排除、sort で並び替え
- JSON.stringify の第2引数を null、第3引数を 2 にするとインデント付き

（自由に追記してください）
```

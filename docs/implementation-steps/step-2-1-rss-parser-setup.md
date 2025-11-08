# Step 2-1: RSS パーサーのインストールと動作確認

## 目標
`rss-parser` ライブラリを使って、実際の RSS フィードから記事タイトルを取得する

---

## 前提知識

### RSS とは
- **Rich Site Summary** の略
- Web サイトの更新情報を配信するための XML フォーマット
- ブログやニュースサイトが提供している

### RSS の構造例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tech Blog</title>
    <item>
      <title>TypeScript 5.5 リリース</title>
      <link>https://example.com/article1</link>
      <pubDate>Fri, 08 Nov 2024 10:00:00 GMT</pubDate>
      <description>TypeScript 5.5 の新機能について...</description>
    </item>
  </channel>
</rss>
```

### rss-parser とは
- RSS/Atom フィードを JavaScript オブジェクトに変換するライブラリ
- XML をパースする手間を省ける

---

## 作業手順

### 1. パッケージのインストール

```bash
npm install rss-parser
npm install --save-dev @types/rss-parser
```

**パッケージ解説:**
- `rss-parser`: RSS パーサー本体
- `@types/rss-parser`: TypeScript の型定義（開発時のみ使用）

### 2. feeds.json の作成

プロジェクトルートに `feeds.json` を作成:

```bash
touch feeds.json
```

**ファイル内容:**

```json
{
  "feeds": [
    {
      "url": "https://zenn.dev/feed",
      "name": "Zenn"
    },
    {
      "url": "https://www.publickey1.jp/atom.xml",
      "name": "Publickey"
    }
  ]
}
```

**追加可能な RSS フィード例:**
- はてなブックマーク（テクノロジー）: `https://b.hatena.ne.jp/hotentry/it.rss`
- GitHub Blog: `https://github.blog/feed/`
- TechCrunch Japan: `https://jp.techcrunch.com/feed/`

### 3. scripts ディレクトリの作成

```bash
mkdir -p scripts
```

---

## ユーザー実装部分

### `scripts/test-rss.ts` の作成

以下のファイルを**あなたが作成**するのだ:

```typescript
import Parser from 'rss-parser';
import * as fs from 'fs/promises';

// TODO(human): 以下の処理を実装してください
// 1. Parser のインスタンスを作成
// 2. feeds.json を読み込んで JSON.parse
// 3. feeds 配列の最初のフィードを取得
// 4. parser.parseURL() で RSS を取得
// 5. 最初の 3 件の記事タイトルを console.log で表示

async function testRssFeed() {
  // ここに実装
}

testRssFeed();
```

**実装のヒント:**

<details>
<summary>ヒント1: Parser の作成</summary>

```typescript
const parser = new Parser();
```
</details>

<details>
<summary>ヒント2: feeds.json の読み込み</summary>

```typescript
const feedsJson = await fs.readFile('feeds.json', 'utf-8');
const feedsData = JSON.parse(feedsJson);
const firstFeed = feedsData.feeds[0];
```
</details>

<details>
<summary>ヒント3: RSS の取得とループ</summary>

```typescript
const feed = await parser.parseURL(firstFeed.url);

for (let i = 0; i < 3 && i < feed.items.length; i++) {
  console.log(`記事${i + 1}: ${feed.items[i].title}`);
}
```
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```typescript
import Parser from 'rss-parser';
import * as fs from 'fs/promises';

async function testRssFeed() {
  try {
    // 1. Parser インスタンス作成
    const parser = new Parser();

    // 2. feeds.json を読み込み
    const feedsJson = await fs.readFile('feeds.json', 'utf-8');
    const feedsData = JSON.parse(feedsJson);

    // 3. 最初のフィードを取得
    const firstFeed = feedsData.feeds[0];
    console.log(`フィード名: ${firstFeed.name}`);
    console.log(`URL: ${firstFeed.url}\n`);

    // 4. RSS を取得
    const feed = await parser.parseURL(firstFeed.url);

    // 5. 最初の 3 件を表示
    console.log('=== 最新記事（3件）===');
    for (let i = 0; i < 3 && i < feed.items.length; i++) {
      console.log(`記事${i + 1}: ${feed.items[i].title}`);
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

testRssFeed();
```
</details>

---

## 動作確認

### 1. tsx のインストール

TypeScript を直接実行するために `tsx` をインストール:

```bash
npm install --save-dev tsx
```

### 2. スクリプトの実行

```bash
npx tsx scripts/test-rss.ts
```

### 3. 確認観点

#### ✅ チェックリスト

- [ ] フィード名と URL が表示される
- [ ] 記事タイトルが 3 件表示される
- [ ] エラーが出ない
- [ ] 取得された記事が最新のものである

#### 期待される出力例

```
フィード名: Zenn
URL: https://zenn.dev/feed

=== 最新記事（3件）===
記事1: Expo Router で型安全なルーティングを実現する
記事2: React 19 の新機能まとめ
記事3: TypeScript 5.5 で追加された Inferred Type Predicates
```

---

## トラブルシューティング

### エラー: `Cannot find module 'rss-parser'`

**原因:** パッケージがインストールされていない

**解決:**
```bash
npm install rss-parser
```

### エラー: `fetch failed`

**原因:** ネットワークエラー、または RSS URL が間違っている

**解決:**
1. インターネット接続を確認
2. `feeds.json` の URL をブラウザで開いて確認
3. 別の RSS フィードを試す

### エラー: `SyntaxError: Unexpected token`

**原因:** JSON のシンタックスエラー

**解決:**
```bash
# JSON の文法チェック
cat feeds.json | python -m json.tool
```

### 記事が 0 件

**原因:** RSS フィードに items がない

**解決:**
```typescript
console.log('アイテム数:', feed.items.length);
console.log('フィード情報:', feed);
```

でデバッグ情報を確認

---

## RSS フィードのデータ構造を理解する

### Parser の返り値

```typescript
{
  title: "Tech Blog",           // フィードのタイトル
  description: "技術ブログ",     // 説明
  link: "https://example.com",  // サイトURL
  items: [                      // 記事の配列
    {
      title: "記事タイトル",
      link: "https://...",
      pubDate: "Fri, 08 Nov...",
      content: "本文（HTML）",
      contentSnippet: "本文（テキスト）",
      isoDate: "2024-11-08T10:00:00.000Z"
    }
  ]
}
```

### よく使うフィールド

- `item.title`: 記事タイトル
- `item.link`: 記事 URL
- `item.pubDate`: 公開日時（文字列）
- `item.isoDate`: 公開日時（ISO 8601 形式）
- `item.contentSnippet`: 本文のテキスト版
- `item.content`: 本文の HTML 版

---

## 次のステップ

RSS 取得が成功したら、次は [Step 2-2: RSS の description/content 抽出](step-2-2-extract-content.md) に進むのだ！

---

## 学習メモ欄

このステップで学んだこと、気づいたことをメモするのだ:

```
- rss-parser で簡単に RSS を取得できる
- parseURL() で URL から直接パース可能
- feed.items に記事の配列が入っている
- 非同期処理は async/await で扱う

（自由に追記してください）
```

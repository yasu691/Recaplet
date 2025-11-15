# Step 2-2: RSS の description/content 抽出

## 目標
RSS から本文データを抽出し、LLM 要約に使える形式に整形する

---

## 前提知識

### RSS の本文フィールドの種類

RSS/Atom フィードには複数の本文フィールドがある:

| フィールド | 説明 | 例 |
|-----------|------|-----|
| `content:encoded` | WordPress などが使う完全な HTML | `<p>本文...</p>` |
| `content` | Atom フィードの本文 | HTML または テキスト |
| `contentSnippet` | rss-parser が自動生成する テキスト版 | `本文...`（タグなし） |
| `description` | RSS 2.0 の説明欄 | 抜粋または全文 |

### なぜ優先順位が必要か

- フィードによって持っているフィールドが異なる
- HTML タグが含まれることがあり、そのまま LLM に渡すと無駄なトークンを消費
- 最も情報量の多いフィールドを優先的に使いたい

---

## 作業手順

### 1. `scripts/extract-content.ts` の作成

以下のファイルを**あなたが作成**するのだ:

```typescript
import Parser from 'rss-parser';
import * as fs from 'fs/promises';

// TODO(human): 以下の処理を実装してください
// 1. feeds.json から RSS を取得（前回と同じ）
// 2. 最初の記事（feed.items[0]）から本文を以下の優先順位で取得:
//    - item['content:encoded']
//    - item.content
//    - item.contentSnippet
//    - item.description
// 3. 取得した本文から HTML タグを除去
// 4. 最初の 200 文字を console.log で表示

function extractContent(item: any): string {
  // ここに実装
}

function stripHtml(html: string): string {
  // ここに実装
}

async function testContentExtraction() {
  // ここに実装
}

testContentExtraction();
```

---

## ユーザー実装部分の詳細

### 実装のヒント

<details>
<summary>ヒント1: 本文の優先順位取得</summary>

```typescript
function extractContent(item: any): string {
  return (
    item['content:encoded'] ||
    item.content ||
    item.contentSnippet ||
    item.description ||
    ''
  );
}
```

**論理演算子 `||` の動作:**
- 左から順に評価
- 最初に truthy な値を返す
- すべて falsy なら最後の値（`''`）を返す
</details>

<details>
<summary>ヒント2: HTML タグの除去</summary>

```typescript
function stripHtml(html: string): string {
  // 正規表現で <タグ> を除去
  return html
    .replace(/<[^>]*>/g, '') // HTML タグを削除
    .replace(/&nbsp;/g, ' ') // &nbsp; をスペースに
    .replace(/&lt;/g, '<')   // &lt; を < に
    .replace(/&gt;/g, '>')   // &gt; を > に
    .replace(/&amp;/g, '&')  // &amp; を & に
    .replace(/\s+/g, ' ')    // 連続する空白を1つに
    .trim();                 // 前後の空白を削除
}
```
</details>

<details>
<summary>ヒント3: メイン処理の実装</summary>

```typescript
async function testContentExtraction() {
  try {
    const parser = new Parser();
    const feedsJson = await fs.readFile('feeds.json', 'utf-8');
    const feedsData = JSON.parse(feedsJson);
    const firstFeed = feedsData.feeds[0];

    const feed = await parser.parseURL(firstFeed.url);
    const firstItem = feed.items[0];

    console.log(`タイトル: ${firstItem.title}\n`);

    const rawContent = extractContent(firstItem);
    const cleanContent = stripHtml(rawContent);

    console.log('=== 抽出された本文（最初の200文字）===');
    console.log(cleanContent.slice(0, 200));
  } catch (error) {
    console.error('エラー:', error);
  }
}
```
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```typescript
import Parser from 'rss-parser';
import * as fs from 'fs/promises';

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

async function testContentExtraction() {
  try {
    const parser = new Parser();
    const feedsJson = await fs.readFile('feeds.json', 'utf-8');
    const feedsData = JSON.parse(feedsJson);

    const firstFeed = feedsData.feeds[0];
    console.log(`フィード: ${firstFeed.name}\n`);

    const feed = await parser.parseURL(firstFeed.url);
    const firstItem = feed.items[0];

    console.log(`タイトル: ${firstItem.title}`);
    console.log(`公開日: ${firstItem.pubDate}\n`);

    const rawContent = extractContent(firstItem);
    console.log(`元の本文長: ${rawContent.length} 文字`);

    const cleanContent = stripHtml(rawContent);
    console.log(`整形後: ${cleanContent.length} 文字\n`);

    console.log('=== 抽出された本文（最初の200文字）===');
    console.log(cleanContent.slice(0, 200) + '...');
  } catch (error) {
    console.error('エラー:', error);
  }
}

testContentExtraction();
```
</details>

---

## 動作確認

### 1. スクリプトの実行

```bash
npx tsx scripts/extract-content.ts
```

### 2. 確認観点

#### ✅ チェックリスト

- [x] タイトルと公開日が表示される
- [x] 本文が 200 文字表示される
- [x] HTML タグが含まれていない（`<p>`, `<div>` などがない）
- [x] 文字化けしていない
- [x] 意味のある文章が抽出されている

#### 期待される出力例

```
フィード: Zenn

タイトル: Expo Router で型安全なルーティングを実現する
公開日: Fri, 08 Nov 2024 10:00:00 GMT

元の本文長: 1523 文字
整形後: 1245 文字

=== 抽出された本文（最初の200文字）===
Expo Router は React Native で Next.js のような
ファイルベースルーティングを実現するライブラリです。
この記事では、型安全なルーティングを実現する方法について解説します。
まず、Expo Router の基本的な使い方から始めましょう...
```

---

## トラブルシューティング

### HTML タグが残っている

**原因:** `stripHtml()` の正規表現が不完全

**確認:**
```typescript
console.log('生データ:', rawContent.slice(0, 300));
```

**解決:**
より強力な HTML パーサーを使う:
```bash
npm install html-to-text
```

```typescript
import { convert } from 'html-to-text';

function stripHtml(html: string): string {
  return convert(html, {
    wordwrap: false,
    preserveNewlines: false,
  });
}
```

### 本文が空文字列

**原因:** 該当フィールドがすべて存在しない

**デバッグ:**
```typescript
console.log('利用可能なフィールド:', Object.keys(firstItem));
console.log('content:encoded:', firstItem['content:encoded']);
console.log('content:', firstItem.content);
console.log('contentSnippet:', firstItem.contentSnippet);
console.log('description:', firstItem.description);
```

### 文字数が少なすぎる

**原因:** `description` しかなく、抜粋のみ

**解決:**
- 別の RSS フィードを試す
- 最低文字数をチェックして警告を出す:

```typescript
if (cleanContent.length < 100) {
  console.warn('警告: 本文が短すぎます');
}
```

---

## 正規表現の理解

### `/<[^>]*>/g` の解説

```
/          正規表現の開始
<          < にマッチ
[^>]*      > 以外の文字が 0 回以上
>          > にマッチ
/g         グローバル（全てマッチ）
```

**例:**
- `<p>テキスト</p>` → `テキスト`
- `<div class="foo">内容</div>` → `内容`

### `replace()` チェーン

```typescript
.replace(/<[^>]*>/g, '')    // ステップ1: タグ除去
.replace(/&nbsp;/g, ' ')    // ステップ2: エンティティ変換
.replace(/\s+/g, ' ')       // ステップ3: 空白正規化
.trim()                     // ステップ4: 前後の空白削除
```

各ステップで文字列を変換していく **メソッドチェーン** パターン

---

## 次のステップ

本文抽出が成功したら、次は [Step 3-1: Gemini API キーの設定と疎通確認](step-3-1-gemini-api-setup.md) に進むのだ！

---

## 学習メモ欄

```
- RSS の本文フィールドは複数あり、優先順位が必要
- || 演算子で簡潔に条件分岐できる
- 正規表現で HTML タグを除去できる
- replace() はメソッドチェーンで連続適用できる

（自由に追記してください）
```

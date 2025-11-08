# Step 3-2: 記事要約ロジックの実装

## 目標
RSS から取得した記事本文を Gemini API を使って日本語で要約する

---

## 前提知識

### LLM を使った要約の仕組み

```
入力: 記事本文（最大2000文字）
  ↓
Gemini API に送信
  ↓
プロンプト: "以下の記事を200文字以内の日本語で要約してください"
  ↓
出力: 要約テキスト（約200文字）
```

### なぜ2000文字に制限するのか

1. **コスト削減**: トークン数が少ないほど安い
2. **処理速度**: 入力が短いほど高速
3. **品質**: 長すぎると要約精度が下がることがある

**ほとんどの記事は2000文字あれば十分要約可能なのだ**

### トークンとは

- LLM が処理する単位
- 日本語では**約1.5〜2文字 = 1トークン**
- 2000文字 ≈ 1000〜1300トークン

---

## 作業手順

### 1. `scripts/summarize-article.ts` の作成

このファイルを**あなたが作成**するのだ。

---

## ユーザー実装部分

### 実装タスク

以下の処理を実装してください:

```typescript
import 'dotenv/config';
import Parser from 'rss-parser';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as fs from 'fs/promises';

// TODO(human): 以下の処理を実装してください
// 1. feeds.json から最初の RSS フィードを取得
// 2. フィードから最初の記事を取得
// 3. extractContent() で本文を抽出（Step 2-2 で作った関数を再利用）
// 4. 本文を最大 2000 文字に制限
// 5. Gemini に以下のプロンプトで要約を依頼:
//    "以下の記事を200文字以内の日本語で要約してください:\n\n{本文}"
// 6. 要約結果を console.log で表示
// 7. トークン使用量も表示

function extractContent(item: any): string {
  // Step 2-2 で作った関数をコピー
}

function stripHtml(html: string): string {
  // Step 2-2 で作った関数をコピー
}

async function summarizeArticle() {
  // ここに実装
}

summarizeArticle();
```

---

### 実装のヒント

<details>
<summary>ヒント1: 本文の文字数制限</summary>

```typescript
const limitedContent = cleanContent.slice(0, 2000);
```

`.slice(0, 2000)` で最初の2000文字を取得
</details>

<details>
<summary>ヒント2: プロンプトの作成</summary>

```typescript
const prompt = `以下の記事を200文字以内の日本語で要約してください:\n\n${limitedContent}`;
```

テンプレートリテラル（バッククォート）で変数を埋め込む
</details>

<details>
<summary>ヒント3: Gemini API 呼び出し</summary>

```typescript
const result = await generateText({
  model: google('gemini-1.5-flash'),
  prompt: prompt,
});

console.log('要約:', result.text);
console.log('入力トークン:', result.usage?.promptTokens);
console.log('出力トークン:', result.usage?.completionTokens);
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

async function summarizeArticle() {
  try {
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
      model: google('gemini-1.5-flash'),
      prompt: `以下の記事を200文字以内の日本語で要約してください:\n\n${limitedContent}`,
    });

    console.log('=== 要約結果 ===');
    console.log(result.text);

    console.log('\n=== トークン使用量 ===');
    console.log(`入力: ${result.usage?.promptTokens} tokens`);
    console.log(`出力: ${result.usage?.completionTokens} tokens`);

    // 5. コスト計算（Gemini 1.5 Flash）
    const inputCost = (result.usage?.promptTokens || 0) * 0.075 / 1_000_000;
    const outputCost = (result.usage?.completionTokens || 0) * 0.30 / 1_000_000;
    const totalCost = inputCost + outputCost;

    console.log('\n=== コスト ===');
    console.log(`$${totalCost.toFixed(6)} (約 ${(totalCost * 150).toFixed(4)} 円)`);

  } catch (error) {
    console.error('エラー:', error);
  }
}

summarizeArticle();
```
</details>

---

## 動作確認

### 1. スクリプトの実行

```bash
npx tsx scripts/summarize-article.ts
```

### 2. 確認観点

#### ✅ チェックリスト

- [ ] 記事タイトルと URL が表示される
- [ ] 要約が200文字前後で表示される
- [ ] 要約が日本語である
- [ ] 元記事の内容を正しく要約している
- [ ] トークン使用量が表示される
- [ ] エラーが出ない
- [ ] 処理が10秒以内に完了する

#### 期待される出力例

```
フィード: Zenn

タイトル: Expo Router で型安全なルーティングを実現する
URL: https://zenn.dev/articles/expo-router-type-safe

本文長: 1523 文字

要約生成中...

=== 要約結果 ===
Expo Routerはファイルベースルーティングを提供するライブラリで、
Next.jsのApp Routerと同様の開発体験を実現します。この記事では
型安全なルーティングを実現する方法として、useRouter()フックと
Linkコンポーネントの型定義、パラメータの検証方法について解説しています。

=== トークン使用量 ===
入力: 1245 tokens
出力: 98 tokens

=== コスト ===
$0.000123 (約 0.0185 円)
```

---

## トラブルシューティング

### 要約が短すぎる（50文字以下）

**原因:** 本文が短すぎる、または抽出に失敗

**解決:**
```typescript
console.log('抽出された本文:', limitedContent.slice(0, 500));
```

で本文が正しく抽出されているか確認

### 要約が英語になる

**原因:** プロンプトが英語、または記事が英語

**解決:**
- プロンプトに「日本語で」を必ず含める
- 記事が英語の場合は別の RSS フィードを試す

### 要約が200文字を大幅に超える

**原因:** Gemini が指示を守らなかった

**解決:**
```typescript
prompt: `以下の記事を厳密に200文字以内の日本語で要約してください。
200文字を超えないでください:\n\n${limitedContent}`,
```

より強い指示に変更

### エラー: `429 Too Many Requests`

**原因:** レート制限（無料枠: 60リクエスト/分）

**解決:**
- 数分待ってから再実行
- 有料プランにアップグレード

### 要約の品質が低い

**原因:** 本文が短すぎる、または HTML タグが残っている

**デバッグ:**
```typescript
console.log('=== 送信する本文 ===');
console.log(limitedContent);
console.log('===================\n');
```

**解決:**
- `stripHtml()` が正しく動作しているか確認
- より情報量の多い RSS フィードを選ぶ

---

## プロンプトエンジニアリングの基礎

### 良いプロンプトの条件

1. **具体的**: 「要約して」ではなく「200文字以内で要約して」
2. **言語指定**: 「日本語で」を明記
3. **出力形式**: 箇条書きか段落か指定
4. **制約条件**: 文字数、トーンなど

### プロンプトのバリエーション

#### パターン1: 簡潔重視

```typescript
prompt: `以下の記事の要点を3つの箇条書きで日本語でまとめてください:\n\n${content}`;
```

#### パターン2: ニュース風

```typescript
prompt: `以下の記事をニュース記事風に200文字以内の日本語で要約してください:\n\n${content}`;
```

#### パターン3: 技術記事向け

```typescript
prompt: `以下の技術記事について、主要な技術と解決する課題を200文字以内の日本語で要約してください:\n\n${content}`;
```

**このプロジェクトでは最初のパターン（簡潔重視）を採用するのだ**

---

## コスト最適化のポイント

### 1. 本文の長さを制限

```typescript
// 悪い例: 全文を送信
const prompt = `要約:\n\n${cleanContent}`; // 10000文字 = 5000トークン

// 良い例: 2000文字に制限
const prompt = `要約:\n\n${cleanContent.slice(0, 2000)}`; // 1000トークン
```

**コスト削減: 約80%**

### 2. バッチ処理

```typescript
// 悪い例: 1記事ずつ要約
for (const item of items) {
  await generateText({ ... }); // 30回のAPIコール
}

// 良い例: まとめて要約
const prompt = items.map((item, i) =>
  `記事${i+1}: ${item.content.slice(0, 500)}`
).join('\n\n');
await generateText({ prompt: `以下の記事をそれぞれ要約:\n\n${prompt}` });
```

**ただし、このプロジェクトでは品質重視で1記事ずつ処理するのだ**

---

## 次のステップ

要約ロジックが動作したら、次は [Step 3-3: 重複排除ロジックの実装](step-3-3-deduplication.md) に進むのだ！

---

## 学習メモ欄

このステップで学んだこと、気づいたことをメモするのだ:

```
- Gemini API で簡単に要約が作れる
- プロンプトの書き方で品質が変わる
- トークン数 = コストなので制限が重要
- generateText() の result.usage でトークン数が取得できる

（自由に追記してください）
```

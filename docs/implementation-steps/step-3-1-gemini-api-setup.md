# Step 3-1: Gemini API キーの設定と疎通確認

## 目標
Google Gemini API を使えるようにセットアップし、簡単なテキスト生成で動作確認する

---

## 前提知識

### Gemini API とは
- Google が提供する大規模言語モデル (LLM) API
- GPT-4 と同等の性能を持つ
- **gemini-1.5-flash**: 高速・低コストモデル（推奨）
- **gemini-1.5-pro**: 高性能モデル

### コスト比較（2024年11月時点）

| モデル | 入力 | 出力 | 推奨用途 |
|--------|------|------|----------|
| Gemini 1.5 Flash | $0.075/1M tokens | $0.30/1M tokens | **要約・翻訳** |
| Gemini 1.5 Pro | $1.25/1M tokens | $5.00/1M tokens | 複雑な推論 |
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | 汎用 |

**Gemini Flash が最安！**

---

## 作業手順

### 1. Google AI Studio で API キーを取得

#### 1-1. Google AI Studio にアクセス

ブラウザで以下にアクセス:
```
https://aistudio.google.com/app/apikey
```

#### 1-2. Google アカウントでログイン

#### 1-3. API キーの作成

1. 「Create API Key」ボタンをクリック
2. 既存の Google Cloud プロジェクトを選択、または新規作成
3. API キーが表示される（例: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`）
4. **コピーして安全な場所に保存**（二度と表示されない）

---

### 2. 環境変数の設定

#### 2-1. `.env.local` ファイルの作成

プロジェクトルートに `.env.local` を作成:

```bash
touch .env.local
```

#### 2-2. API キーを記入

`.env.local` を開いて以下を記入:

```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**注意:**
- `=` の前後にスペースを入れない
- クォートは不要

#### 2-3. `.gitignore` に追加

**.gitignore を確認:**

```bash
cat .gitignore | grep .env.local
```

**もし含まれていなければ追加:**

```bash
echo ".env.local" >> .gitignore
```

**重要:** API キーを GitHub にプッシュすると、悪用される危険がある！

---

### 3. パッケージのインストール

```bash
npm install ai @ai-sdk/google dotenv
```

**パッケージ解説:**
- `ai`: Vercel AI SDK（統一インターフェース）
- `@ai-sdk/google`: Google Gemini 用のアダプター
- `dotenv`: 環境変数を `.env.local` から読み込む

---

## ユーザー実装部分

### `scripts/test-gemini.ts` の作成

以下のファイルを**あなたが作成**するのだ:

```typescript
import 'dotenv/config'; // .env.local を自動読み込み
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// TODO(human): 以下の処理を実装してください
// 1. generateText() を使って「こんにちは」を英語に翻訳
// 2. モデルは google('gemini-1.5-flash') を使用
// 3. プロンプトは「以下のテキストを英語に翻訳してください:\n\nこんにちは」
// 4. 結果の .text を console.log で表示

async function testGemini() {
  // ここに実装
}

testGemini();
```

---

### 実装のヒント

<details>
<summary>ヒント1: generateText の基本構造</summary>

```typescript
const result = await generateText({
  model: google('gemini-1.5-flash'),
  prompt: 'あなたのプロンプト',
});

console.log(result.text);
```
</details>

<details>
<summary>ヒント2: API キーの環境変数確認</summary>

```typescript
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY が設定されていません');
}
```
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```typescript
import 'dotenv/config';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

async function testGemini() {
  try {
    // 環境変数の確認
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('API キーが設定されていません');
    }

    console.log('Gemini API テスト開始...\n');

    // Gemini で翻訳
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: '以下のテキストを英語に翻訳してください:\n\nこんにちは',
    });

    console.log('=== 翻訳結果 ===');
    console.log(result.text);
    console.log('\n=== トークン使用量 ===');
    console.log(`入力: ${result.usage?.promptTokens} tokens`);
    console.log(`出力: ${result.usage?.completionTokens} tokens`);

  } catch (error) {
    console.error('エラー:', error);
  }
}

testGemini();
```
</details>

---

## 動作確認

### 1. スクリプトの実行

```bash
npx tsx scripts/test-gemini.ts
```

### 2. 確認観点

#### ✅ チェックリスト

- [ ] "Hello" などの英訳が表示される
- [ ] エラーが出ない
- [ ] トークン使用量が表示される
- [ ] 数秒以内にレスポンスが返ってくる

#### 期待される出力例

```
Gemini API テスト開始...

=== 翻訳結果 ===
Hello

=== トークン使用量 ===
入力: 12 tokens
出力: 2 tokens
```

---

## トラブルシューティング

### エラー: `GOOGLE_GENERATIVE_AI_API_KEY is not defined`

**原因:** 環境変数が読み込まれていない

**解決:**
1. `.env.local` がプロジェクトルートにあるか確認
2. ファイル名が正確か確認（`.env` ではなく `.env.local`）
3. `import 'dotenv/config';` が最初の行にあるか確認

**デバッグ:**
```typescript
console.log('API Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY?.slice(0, 10) + '...');
```

### エラー: `API key not valid`

**原因:** API キーが間違っている、または無効

**解決:**
1. Google AI Studio で API キーを再確認
2. コピペミスがないか確認
3. 新しい API キーを作成

### エラー: `429 Too Many Requests`

**原因:** レート制限に達した

**解決:**
- 無料枠の制限: 60 リクエスト/分
- 数分待ってから再実行

### タイムアウト

**原因:** ネットワークエラー、またはプロンプトが長すぎる

**解決:**
```typescript
const result = await generateText({
  model: google('gemini-1.5-flash'),
  prompt: '...',
  maxRetries: 3, // リトライ回数
});
```

---

## Vercel AI SDK の理解

### なぜ AI SDK を使うのか

**直接 API を叩く場合:**
```typescript
const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [...], ... }),
});
const data = await response.json();
// レスポンスのパースが複雑...
```

**AI SDK を使う場合:**
```typescript
const { text } = await generateText({
  model: google('gemini-1.5-flash'),
  prompt: 'こんにちは',
});
// シンプル！
```

### AI SDK の利点

1. **統一インターフェース**: OpenAI、Gemini、Anthropic を同じコードで扱える
2. **型安全**: TypeScript 完全対応
3. **ストリーミング対応**: `streamText()` で逐次出力可能
4. **エラーハンドリング**: リトライやタイムアウトが組み込み

---

## セキュリティのベストプラクティス

### ✅ やるべきこと

- `.env.local` を `.gitignore` に追加
- API キーは絶対にコードに直接書かない
- 環境変数は `process.env` から読み込む

### ❌ やってはいけないこと

```typescript
// 絶対にやらない！
const API_KEY = 'AIzaSyXXXXXXXXXXXXXXXXXXX';
```

これをコミットすると、GitHub がスキャンして API キーを無効化する

---

## 次のステップ

Gemini API が動作したら、次は [Step 3-2: 記事要約ロジックの実装](step-3-2-article-summarization.md) に進むのだ！

---

## 学習メモ欄

```
- Gemini API は Google AI Studio で取得
- 環境変数は .env.local で管理
- dotenv で環境変数を読み込み
- Vercel AI SDK で統一インターフェース
- API キーは絶対に GitHub にプッシュしない

（自由に追記してください）
```

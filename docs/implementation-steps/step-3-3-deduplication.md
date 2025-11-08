# Step 3-3: 重複排除ロジックの実装

## 目標
同じ記事を複数回要約しないように、URL ハッシュで重複をチェックする仕組みを作る

---

## 前提知識

### なぜ重複排除が必要か

RSS フィードは同じ記事を何日も配信し続けることがあるのだ:

```
11/8 の取得: [記事A, 記事B, 記事C]
11/9 の取得: [記事D, 記事B, 記事C]  ← B, C が重複
```

重複チェックなしでは、**同じ記事に何度も API コール** → コスト増加

### ハッシュ関数とは

- 任意の長さの入力 → 固定長の文字列を生成
- 同じ入力 → 必ず同じ出力
- わずかな違い → 全く異なる出力

```
入力: https://example.com/article-123
SHA-256: a3f2c1d5e6b7...（64文字）
短縮版: a3f2c1d5e6b7（最初の12文字）
```

### SHA-256 とは

- **Secure Hash Algorithm 256-bit**
- 暗号学的ハッシュ関数の一種
- Node.js の `crypto` モジュールで使用可能
- 衝突（異なる入力で同じ出力）がほぼ起こらない

---

## 作業手順

### 1. ユーティリティ関数の作成

まず、ハッシュ生成関数を作るのだ。

### 2. テストスクリプトで動作確認

重複排除ロジックをテストするのだ。

---

## ユーザー実装部分

### Part 1: `utils/hash.ts` の作成

ディレクトリとファイルを作成:

```bash
mkdir -p utils
touch utils/hash.ts
```

以下を実装するのだ:

```typescript
import crypto from 'crypto';

// TODO(human): 以下の関数を実装してください
// URL 文字列を受け取り、SHA-256 ハッシュを生成して最初の12文字を返す
// 例: "https://example.com/article" → "a3f2c1d5e6b7"

export function generateArticleId(url: string): string {
  // ヒント:
  // 1. crypto.createHash('sha256') でハッシュオブジェクト作成
  // 2. .update(url) で URL を設定
  // 3. .digest('hex') で16進数文字列として取得
  // 4. .slice(0, 12) で最初の12文字
}
```

---

### Part 2: `scripts/test-deduplication.ts` の作成

以下のテストスクリプトを実装するのだ:

```typescript
import { generateArticleId } from '../utils/hash';

// TODO(human): 以下の処理を実装してください
// 1. テスト用の記事配列を作成（同じURLを含む）
// 2. 各記事の ID を生成
// 3. Map を使って重複を排除
// 4. 結果を表示

interface Article {
  title: string;
  url: string;
}

function testDeduplication() {
  // テストデータ
  const articles: Article[] = [
    { title: '記事A', url: 'https://example.com/article-1' },
    { title: '記事B', url: 'https://example.com/article-2' },
    { title: '記事C', url: 'https://example.com/article-1' }, // 重複
    { title: '記事D', url: 'https://example.com/article-3' },
    { title: '記事E', url: 'https://example.com/article-2' }, // 重複
  ];

  // TODO(human): 以下を実装
  // 1. 元の記事数を表示
  // 2. 各記事の ID を生成して表示
  // 3. Map を使って重複排除
  //    ヒント: new Map(articles.map(a => [generateArticleId(a.url), a]))
  // 4. 重複排除後の記事数を表示
  // 5. ユニークな記事一覧を表示
}

testDeduplication();
```

---

### 実装のヒント

<details>
<summary>ヒント1: generateArticleId の実装</summary>

```typescript
export function generateArticleId(url: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(url);
  return hash.digest('hex').slice(0, 12);
}
```

**解説:**
- `createHash('sha256')`: SHA-256 ハッシュオブジェクト作成
- `update(url)`: ハッシュ化する文字列を設定
- `digest('hex')`: 16進数文字列で出力
- `slice(0, 12)`: 最初の12文字のみ使用（短縮）
</details>

<details>
<summary>ヒント2: Map を使った重複排除</summary>

```typescript
// Map のキーに ID を使うことで自動的に重複排除
const uniqueMap = new Map(
  articles.map(article => [
    generateArticleId(article.url),
    article
  ])
);

// Map から配列に戻す
const uniqueArticles = Array.from(uniqueMap.values());
```

**Map の特性:**
- 同じキーで2回 set すると、後の値で上書き
- これを利用して重複を自動排除
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

**utils/hash.ts:**
```typescript
import crypto from 'crypto';

export function generateArticleId(url: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(url);
  return hash.digest('hex').slice(0, 12);
}
```

**scripts/test-deduplication.ts:**
```typescript
import { generateArticleId } from '../utils/hash';

interface Article {
  title: string;
  url: string;
}

function testDeduplication() {
  const articles: Article[] = [
    { title: '記事A', url: 'https://example.com/article-1' },
    { title: '記事B', url: 'https://example.com/article-2' },
    { title: '記事C（重複）', url: 'https://example.com/article-1' },
    { title: '記事D', url: 'https://example.com/article-3' },
    { title: '記事E（重複）', url: 'https://example.com/article-2' },
  ];

  console.log('=== 重複排除テスト ===\n');
  console.log(`元の記事数: ${articles.length}\n`);

  // 各記事の ID を表示
  console.log('各記事の ID:');
  articles.forEach((article, i) => {
    const id = generateArticleId(article.url);
    console.log(`${i + 1}. ${article.title} → ID: ${id}`);
  });

  // Map で重複排除
  const uniqueMap = new Map(
    articles.map(article => [
      generateArticleId(article.url),
      article
    ])
  );

  const uniqueArticles = Array.from(uniqueMap.values());

  console.log(`\n重複排除後: ${uniqueArticles.length} 件\n`);

  console.log('ユニークな記事:');
  uniqueArticles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
  });
}

testDeduplication();
```
</details>

---

## 動作確認

### 1. スクリプトの実行

```bash
npx tsx scripts/test-deduplication.ts
```

### 2. 確認観点

#### ✅ チェックリスト

- [ ] 元の記事数が 5 件と表示される
- [ ] 各記事に12文字の ID が表示される
- [ ] 同じ URL の記事は同じ ID になっている
- [ ] 重複排除後が 3 件になっている
- [ ] ユニークな記事一覧に重複がない

#### 期待される出力例

```
=== 重複排除テスト ===

元の記事数: 5

各記事の ID:
1. 記事A → ID: 7f3a2c1d5e6b
2. 記事B → ID: 9e4b3d2a1f8c
3. 記事C（重複） → ID: 7f3a2c1d5e6b  ← 記事Aと同じID
4. 記事D → ID: 2a1f8c9e4b3d
5. 記事E（重複） → ID: 9e4b3d2a1f8c  ← 記事Bと同じID

重複排除後: 3 件

ユニークな記事:
1. 記事C（重複）
2. 記事E（重複）
3. 記事D
```

**注意:** Map は後から追加された値で上書きするため、「記事C」「記事E」が残る

---

## トラブルシューティング

### エラー: `Cannot find module 'crypto'`

**原因:** Node.js 組み込みモジュールが認識されていない

**解決:**
```typescript
import crypto from 'node:crypto'; // node: プレフィックスを追加
```

または

```bash
npm install --save-dev @types/node
```

### ID が毎回変わる

**原因:** URL に動的な要素（タイムスタンプなど）が含まれている

**解決:**
- URL を正規化する関数を追加:

```typescript
function normalizeUrl(url: string): string {
  // クエリパラメータを削除
  return url.split('?')[0];
}

export function generateArticleId(url: string): string {
  const normalized = normalizeUrl(url);
  const hash = crypto.createHash('sha256');
  hash.update(normalized);
  return hash.digest('hex').slice(0, 12);
}
```

### 重複排除後の件数が期待と違う

**デバッグ:**
```typescript
console.log('Map の内容:');
uniqueMap.forEach((article, id) => {
  console.log(`  ${id}: ${article.title}`);
});
```

---

## Map vs Set vs Array の使い分け

### 重複排除の3つの方法

#### 方法1: Map（今回採用）

```typescript
const uniqueMap = new Map(
  articles.map(a => [generateArticleId(a.url), a])
);
const unique = Array.from(uniqueMap.values());
```

**メリット:**
- ID と記事のペアを管理
- 後の値で上書き（最新の情報が残る）

#### 方法2: Set

```typescript
const seenIds = new Set<string>();
const unique = articles.filter(a => {
  const id = generateArticleId(a.url);
  if (seenIds.has(id)) return false;
  seenIds.add(id);
  return true;
});
```

**メリット:**
- 最初の値が残る
- やや複雑

#### 方法3: Array（非推奨）

```typescript
const unique: Article[] = [];
for (const article of articles) {
  const id = generateArticleId(article.url);
  if (!unique.find(a => generateArticleId(a.url) === id)) {
    unique.push(article);
  }
}
```

**デメリット:**
- O(n²) の計算量
- 遅い

**このプロジェクトでは Map を採用するのだ（シンプルで高速）**

---

## ハッシュの長さについて

### なぜ12文字なのか

```
SHA-256 の全長: 64文字（256 bit）
12文字使用: 48 bit

衝突確率:
- 1,000 記事: ほぼ 0%
- 10,000 記事: 0.0001%
- 100,000 記事: 0.01%
```

**RSS 要約アプリでは数千件程度なので12文字で十分なのだ**

### 衝突が心配な場合

```typescript
// 16文字に延長
return hash.digest('hex').slice(0, 16);

// または全長使用
return hash.digest('hex');
```

---

## 次のステップ

重複排除ロジックが動作したら、次は [Step 4-1: 全体パイプラインの統合](step-4-1-pipeline-integration.md) に進むのだ！

---

## 学習メモ欄

このステップで学んだこと、気づいたことをメモするのだ:

```
- SHA-256 で URL から一意な ID を生成できる
- Map を使うと重複排除が簡単
- crypto モジュールは Node.js 組み込み
- ハッシュの長さは用途に応じて調整可能

（自由に追記してください）
```

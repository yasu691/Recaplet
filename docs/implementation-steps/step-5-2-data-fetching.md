# Step 5-2: データフェッチ機能の実装

## 目標
`data/news.json` を fetch で取得し、Expo アプリの画面に記事一覧を表示する

---

## 前提知識

### React の状態管理

```typescript
const [state, setState] = useState(初期値);
```

- `state`: 現在の値
- `setState`: 値を更新する関数
- コンポーネントが再レンダリングされても値を保持

### useEffect フック

```typescript
useEffect(() => {
  // 副作用の処理（API呼び出しなど）
}, [依存配列]);
```

- コンポーネントのマウント時に実行
- 依存配列が空 `[]` なら1回だけ実行

### fetch API

```typescript
const response = await fetch(url);
const data = await response.json();
```

- ブラウザ/React Native で使える標準 API
- Promise ベース（async/await で使う）

---

## 作業手順

### 1. public ディレクトリの準備

Expo Web で静的ファイルを配信するため:

```bash
mkdir -p public/data
cp data/news.json public/data/
```

**これで `/data/news.json` でアクセス可能になるのだ**

### 2. 型定義の作成

```bash
mkdir -p types
touch types/news.ts
```

以下の内容を**Claude が準備**:

```typescript
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
}

export interface NewsData {
  generatedAt: string;
  items: NewsItem[];
}
```

---

## ユーザー実装部分

### `app/(tabs)/index.tsx` の更新

現在の画面を**データフェッチ機能付き**に更新するのだ:

```typescript
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import type { NewsItem } from '@/types/news';

export default function HomeScreen() {
  // TODO(human): 以下の state を定義してください
  // 1. news: NewsItem[] （記事の配列）
  // 2. loading: boolean （ローディング状態）
  // 3. error: string | null （エラーメッセージ）

  // TODO(human): fetchNews 関数を実装してください
  // 1. loading を true にする
  // 2. /data/news.json を fetch
  // 3. レスポンスを JSON にパース
  // 4. news state に data.items を設定
  // 5. エラー時は error state にメッセージを設定
  // 6. finally で loading を false にする
  const fetchNews = async () => {
    // ここに実装
  };

  // TODO(human): useEffect で初回ロード時に fetchNews を呼び出してください
  useEffect(() => {
    // ここに実装
  }, []);

  // TODO(human): ローディング中の表示を実装してください
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        {/* ActivityIndicator を使う */}
      </View>
    );
  }

  // TODO(human): エラー時の表示を実装してください
  if (error) {
    return (
      <View style={styles.centerContainer}>
        {/* エラーメッセージを Text で表示 */}
      </View>
    );
  }

  // TODO(human): 記事一覧の表示を実装してください
  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* タイトル、要約、メタ情報を表示 */}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  // TODO(human): スタイルを定義してください
});
```

---

### 実装のヒント

<details>
<summary>ヒント1: state の定義</summary>

```typescript
const [news, setNews] = useState<NewsItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```
</details>

<details>
<summary>ヒント2: fetchNews 関数</summary>

```typescript
const fetchNews = async () => {
  try {
    setLoading(true);
    const response = await fetch('/data/news.json');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    setNews(data.items || []);
  } catch (err) {
    setError(err instanceof Error ? err.message : '読み込みエラー');
  } finally {
    setLoading(false);
  }
};
```
</details>

<details>
<summary>ヒント3: useEffect の実装</summary>

```typescript
useEffect(() => {
  fetchNews();
}, []);
```

空の依存配列 `[]` で初回のみ実行
</details>

<details>
<summary>ヒント4: FlatList の renderItem</summary>

```typescript
renderItem={({ item }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.summary}>{item.summary}</Text>
    <View style={styles.meta}>
      <Text style={styles.source}>{item.source}</Text>
      <Text style={styles.date}>
        {new Date(item.publishedAt).toLocaleDateString('ja-JP')}
      </Text>
    </View>
  </View>
)}
```
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```typescript
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import type { NewsItem } from '@/types/news';

export default function HomeScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/data/news.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: データの取得に失敗しました`);
      }

      const data = await response.json();
      setNews(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>エラー: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.summary}>{item.summary}</Text>
          <View style={styles.meta}>
            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.date}>
              {new Date(item.publishedAt).toLocaleDateString('ja-JP')}
            </Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  source: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
```
</details>

---

## 動作確認

### 1. 開発サーバーの起動

```bash
npx expo start --web
```

### 2. 確認観点

#### ✅ チェックリスト

- [ ] 初回表示時に「読み込み中...」が表示される
- [ ] 数秒後に記事一覧が表示される
- [ ] 各カードにタイトル、要約、ソース、日付が表示される
- [ ] カードが見やすいデザインになっている
- [ ] スクロールできる
- [ ] エラーが表示されない

#### 期待される画面

```
┌─────────────────────────────────────┐
│  [ニュース]                      │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Expo Router で型安全なルーティ  │ │
│ │ ングを実現する                  │ │
│ │                                 │ │
│ │ Expo Routerはファイルベースル   │ │
│ │ ーティングを提供し...           │ │
│ │                                 │ │
│ │ Zenn         2025/11/08        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ React 19 の新機能まとめ          │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## トラブルシューティング

### 画面が真っ白

**原因:** fetch が失敗している

**デバッグ:**
```typescript
console.log('Fetching...');
const response = await fetch('/data/news.json');
console.log('Response:', response.status);
const data = await response.json();
console.log('Data:', data);
```

ブラウザの開発者ツール（F12）のコンソールで確認

### エラー: `Failed to fetch`

**原因:** `public/data/news.json` が存在しない

**解決:**
```bash
ls -la public/data/news.json  # ファイル存在確認
cp data/news.json public/data/  # コピーし直す
```

### 日付が変な表示になる

**原因:** ロケールが設定されていない

**解決:**
```typescript
new Date(item.publishedAt).toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
```

### スタイルが適用されない

**確認:**
```typescript
console.log('Styles:', styles.card);
```

StyleSheet が正しく定義されているか確認

---

## React Native の FlatList vs ScrollView

### FlatList の利点

```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <Card item={item} />}
/>
```

- **仮想スクロール**: 画面外のアイテムは非表示 → メモリ効率が良い
- **大量データに強い**: 1000件でもスムーズ
- **組み込み機能**: RefreshControl、無限スクロールなど

### ScrollView

```typescript
<ScrollView>
  {items.map(item => <Card key={item.id} item={item} />)}
</ScrollView>
```

- **すべてレンダリング**: 100件以上だと重い
- **シンプル**: 少量データには便利

**このプロジェクトでは FlatList を使うのだ**

---

## 次のステップ

データ表示が成功したら、次は [Step 5-3: コピーボタンの実装](step-5-3-copy-button.md) に進むのだ！

---

## 学習メモ欄

```
- useState でローカル状態を管理
- useEffect で初回ロード時の処理
- fetch API で JSON 取得
- FlatList で効率的なリスト表示
- ActivityIndicator でローディング表示

（自由に追記してください）
```

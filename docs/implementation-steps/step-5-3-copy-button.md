# Step 5-3: コピーボタンの実装

## 目標
記事カードに「要約 + URL をコピー」するボタンを追加し、クリップボードにコピーする機能を実装する

---

## 前提知識

### Expo Clipboard API

```typescript
import * as Clipboard from 'expo-clipboard';

await Clipboard.setStringAsync('コピーするテキスト');
```

- Expo が提供するクリップボード API
- Web、iOS、Android すべてで動作
- Promise ベース

### Pressable コンポーネント

```typescript
<Pressable onPress={() => console.log('pressed')}>
  <Text>ボタン</Text>
</Pressable>
```

- React Native のタッチ可能なコンポーネント
- `Button` より柔軟なスタイリングが可能
- プレス状態に応じてスタイルを変更できる

---

## 作業手順

### 1. expo-clipboard のインストール

```bash
npx expo install expo-clipboard
```

---

## ユーザー実装部分

### `app/(tabs)/index.tsx` の更新

現在のコードに**コピーボタン**を追加するのだ:

```typescript
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import type { NewsItem } from '@/types/news';

export default function HomeScreen() {
  // ... 既存の state とfetchNews ...

  // TODO(human): コピー処理の関数を実装してください
  // 1. Clipboard.setStringAsync() で要約とURLをコピー
  // 2. フォーマット: "{要約}\n\n{URL}"
  // 3. 成功時に Alert.alert() で通知
  const handleCopy = async (item: NewsItem) => {
    // ここに実装
  };

  // TODO(human): FlatList の renderItem を更新してください
  // コピーボタンを追加
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

          {/* TODO(human): ここにコピーボタンを追加 */}
          {/* Pressable を使い、onPress で handleCopy を呼ぶ */}

        </View>
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  // ... 既存のスタイル ...

  // TODO(human): コピーボタンのスタイルを追加してください
  // copyButton: 背景色、パディング、ボーダーラジウス
  // copyButtonText: 文字色、フォントサイズ、中央揃え
});
```

---

### 実装のヒント

<details>
<summary>ヒント1: handleCopy 関数</summary>

```typescript
const handleCopy = async (item: NewsItem) => {
  try {
    const text = `${item.summary}\n\n${item.url}`;
    await Clipboard.setStringAsync(text);
    Alert.alert('コピーしました！', '要約とURLをクリップボードにコピーしました');
  } catch (error) {
    Alert.alert('エラー', 'コピーに失敗しました');
  }
};
```
</details>

<details>
<summary>ヒント2: コピーボタンの配置</summary>

```typescript
<Pressable
  style={styles.copyButton}
  onPress={() => handleCopy(item)}
>
  <Text style={styles.copyButtonText}>📋 要約とURLをコピー</Text>
</Pressable>
```

metaの下に配置
</details>

<details>
<summary>ヒント3: ボタンのスタイル</summary>

```typescript
copyButton: {
  backgroundColor: '#0066cc',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 6,
  marginTop: 12,
  alignItems: 'center',
},
copyButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
```
</details>

<details>
<summary>ヒント4: プレス時のフィードバック</summary>

```typescript
<Pressable
  style={({ pressed }) => [
    styles.copyButton,
    pressed && { opacity: 0.7 },  // 押されたら透明度を下げる
  ]}
  onPress={() => handleCopy(item)}
>
  <Text style={styles.copyButtonText}>📋 要約とURLをコピー</Text>
</Pressable>
```
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```typescript
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
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

  const handleCopy = async (item: NewsItem) => {
    try {
      const text = `${item.summary}\n\n${item.url}`;
      await Clipboard.setStringAsync(text);
      Alert.alert('コピーしました！', '要約とURLをクリップボードにコピーしました');
    } catch (error) {
      Alert.alert('エラー', 'コピーに失敗しました');
      console.error('Copy error:', error);
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

          <Pressable
            style={({ pressed }) => [
              styles.copyButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handleCopy(item)}
          >
            <Text style={styles.copyButtonText}>📋 要約とURLをコピー</Text>
          </Pressable>
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
  copyButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

- [ ] 各カードに「📋 要約とURLをコピー」ボタンが表示される
- [ ] ボタンをクリックすると「コピーしました！」のアラートが出る
- [ ] テキストエディタに貼り付けて、要約とURLが含まれているか確認
- [ ] ボタンを押したときに視覚的なフィードバック（透明度変化）がある
- [ ] エラーが表示されない

#### 期待されるコピー内容

```
Expo Routerはファイルベースルーティングを提供するライブラリで、
Next.jsのApp Routerと同様の開発体験を実現します。この記事では
型安全なルーティングを実現する方法として、useRouter()フックと
Linkコンポーネントの型定義、パラメータの検証方法について解説しています。

https://zenn.dev/articles/expo-router-type-safe
```

---

## トラブルシューティング

### エラー: `Clipboard is not defined`

**原因:** expo-clipboard がインストールされていない

**解決:**
```bash
npx expo install expo-clipboard
npx expo start --clear  # キャッシュクリアして再起動
```

### アラートが表示されない

**デバッグ:**
```typescript
const handleCopy = async (item: NewsItem) => {
  console.log('Copying:', item.title);
  try {
    const text = `${item.summary}\n\n${item.url}`;
    console.log('Text:', text);
    await Clipboard.setStringAsync(text);
    console.log('Copy success');
    Alert.alert('コピーしました！');
  } catch (error) {
    console.error('Copy error:', error);
  }
};
```

コンソールでログを確認

### コピーされたテキストが空

**原因:** `item.summary` または `item.url` が undefined

**デバッグ:**
```typescript
console.log('Summary:', item.summary);
console.log('URL:', item.url);
```

### ボタンが押せない

**原因:** スタイルの `zIndex` や `pointerEvents` の問題

**解決:**
```typescript
<Pressable
  style={styles.copyButton}
  onPress={() => handleCopy(item)}
  disabled={false}  // 明示的に有効化
>
```

---

## UI/UX 改善のアイデア

### アイデア1: コピー成功時のアニメーション

```typescript
import { Animated } from 'react-native';

const [fadeAnim] = useState(new Animated.Value(1));

const handleCopy = async (item: NewsItem) => {
  await Clipboard.setStringAsync(`${item.summary}\n\n${item.url}`);

  // フェードアニメーション
  Animated.sequence([
    Animated.timing(fadeAnim, { toValue: 0.5, duration: 100 }),
    Animated.timing(fadeAnim, { toValue: 1, duration: 100 }),
  ]).start();

  Alert.alert('コピーしました！');
};
```

### アイデア2: アイコンの変化

```typescript
const [copiedId, setCopiedId] = useState<string | null>(null);

const handleCopy = async (item: NewsItem) => {
  await Clipboard.setStringAsync(...);
  setCopiedId(item.id);

  setTimeout(() => setCopiedId(null), 2000);  // 2秒後にリセット
};

// ボタンテキスト
<Text>{copiedId === item.id ? '✓ コピー済み' : '📋 コピー'}</Text>
```

**このプロジェクトではシンプルな実装を採用するのだ**

---

## 次のステップ

コピーボタンが動作したら、次は [Step 6-1: GitHub Actions ワークフローの作成](step-6-1-github-actions.md) に進むのだ！

---

## 学習メモ欄

```
- expo-clipboard で簡単にコピー機能を実装できる
- Pressable でタッチ可能なコンポーネントを作る
- Alert.alert でネイティブアラートを表示
- pressed state でプレス時のフィードバックを追加

（自由に追記してください）
```

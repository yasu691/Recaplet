# Step 1-3: Expo Router のセットアップ

## 目標
ファイルベースルーティングを有効化し、タブナビゲーション構造を作る

---

## 前提知識

### Expo Router とは
- **ファイルベースルーティング**: ファイル構造がそのまま URL になる
- Next.js の App Router と同じ思想
- `app/index.tsx` → `/` (ホーム)
- `app/settings.tsx` → `/settings`

### なぜ Expo Router なのか
- React Navigation の設定コードが不要
- Web、iOS、Android で**同じルーティング**が使える
- ディープリンク対応が簡単

---

## 作業手順

### 1. 必要なパッケージのインストール

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

**パッケージ解説:**
- `expo-router`: ルーティング本体
- `react-native-safe-area-context`: ノッチ対応（SafeArea）
- `react-native-screens`: ネイティブ画面遷移の最適化
- `expo-linking`: ディープリンク対応
- `expo-constants`: アプリ定数の取得
- `expo-status-bar`: ステータスバー制御

### 2. `package.json` の編集

`package.json` を開いて、`main` フィールドを変更:

**変更前:**
```json
{
  "main": "expo-router/entry",
  "name": "recaplet",
  ...
}
```

**変更後:**
```json
{
  "main": "expo-router/entry",
  "name": "recaplet",
  ...
}
```

**※ 既に `expo-router/entry` になっている場合はそのままで OK**

### 3. 既存の `App.tsx` を削除

Expo Router を使う場合、`App.tsx` は不要:

```bash
rm App.tsx
```

### 4. ディレクトリ構造の作成

以下のディレクトリを作成:

```bash
mkdir -p app
mkdir -p app/\(tabs\)
```

**注意:** `(tabs)` はカッコを含むディレクトリ名（エスケープが必要）

---

## ファイル作成（Claude が用意）

以下のファイルを作成するのだ:

### 1. `app/_layout.tsx` (Root Layout)

```typescript
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**役割:**
- アプリ全体のレイアウトを定義
- `headerShown: false` でヘッダーを非表示

### 2. `app/(tabs)/_layout.tsx` (Tab Layout)

```typescript
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ニュース',
        }}
      />
    </Tabs>
  );
}
```

**役割:**
- タブナビゲーションを定義
- `index` 画面のタブ名を「ニュース」に設定

### 3. `app.json` に Expo Router 設定を追加

`app.json` を開いて、`scheme` を追加:

```json
{
  "expo": {
    "name": "Recaplet",
    "slug": "recaplet",
    "version": "1.0.0",
    "scheme": "recaplet",
    "platforms": [
      "ios",
      "android",
      "web"
    ],
    ...
  }
}
```

---

## ユーザー実装部分

### `app/(tabs)/index.tsx` の作成

以下のファイルを**あなたが作成**するのだ:

```typescript
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  // TODO(human): View と Text を使って "ニュース一覧" という見出しを表示してください
  // ヒント:
  // - View コンポーネントでラップする
  // - Text コンポーネントで "ニュース一覧" を表示
  // - StyleSheet.create() でスタイルを定義
  // - container は { flex: 1, alignItems: 'center', justifyContent: 'center' }
  // - title は { fontSize: 24, fontWeight: 'bold' }
}

const styles = StyleSheet.create({
  // TODO(human): ここにスタイルを定義
});
```

**実装のヒント:**

<details>
<summary>構造のヒント（クリックして展開）</summary>

```typescript
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ここに見出しを書く</Text>
    </View>
  );
}
```
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```typescript
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ニュース一覧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```
</details>

---

## 動作確認

### 1. 開発サーバーの起動

```bash
npx expo start --clear
```

**`--clear` オプション:**
- キャッシュをクリアして起動
- Expo Router の設定変更時は必須

### 2. Web ブラウザで確認

ターミナルで **`w`** キーを押す

### 3. 確認観点

#### ✅ チェックリスト

- [ ] ブラウザに「ニュース一覧」という見出しが表示される
- [ ] 画面中央に配置されている
- [ ] エラーが表示されない
- [ ] ターミナルに警告が出ていない

#### 期待される画面

```
┌─────────────────────────────┐
│  [ニュース]              │ ← タブヘッダー
├─────────────────────────────┤
│                             │
│      ニュース一覧           │ ← 中央に大きく表示
│                             │
└─────────────────────────────┘
```

---

## トラブルシューティング

### エラー: `Invariant Violation: "main" has not been registered`

**原因:** `package.json` の `main` フィールドが正しくない

**解決:**
```json
{
  "main": "expo-router/entry"
}
```

### 画面が真っ白

1. ターミナルで Expo を再起動（Ctrl + C → `npx expo start --clear`）
2. ブラウザをハードリロード（Cmd + Shift + R）
3. `app/(tabs)/index.tsx` のシンタックスエラーを確認

### `(tabs)` ディレクトリが認識されない

**Mac/Linux:**
```bash
mkdir -p "app/(tabs)"
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Path "app/(tabs)"
```

---

## React Native スタイリングの基礎

### Flexbox の理解

React Native のレイアウトは **Flexbox** がベース:

```typescript
{
  flex: 1,              // 親要素いっぱいに広がる
  flexDirection: 'column',  // 縦方向（デフォルト）
  alignItems: 'center',     // 横方向の中央揃え
  justifyContent: 'center', // 縦方向の中央揃え
}
```

**CSS との違い:**
- `display: flex` は不要（デフォルトで Flexbox）
- 単位なし数値（`fontSize: 24` であって `'24px'` ではない）
- キャメルケース（`backgroundColor` であって `background-color` ではない）

---

## 次のステップ

Expo Router が動作したら、次は [Step 2-1: RSS パーサーのインストールと動作確認](step-2-1-rss-parser-setup.md) に進むのだ！

---

## 学習メモ欄

このステップで学んだこと、気づいたことをメモするのだ:

```
- Expo Router はファイル構造がそのまま URL になる
- (tabs) はルートグループで、URL には含まれない
- React Native は Flexbox がデフォルト
- StyleSheet.create() でスタイルを定義する

（自由に追記してください）
```

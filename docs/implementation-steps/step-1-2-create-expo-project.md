# Step 1-2: Expo プロジェクト作成

## 目標
Expo の基本プロジェクトを作成し、ブラウザで動作確認する

---

## 前提知識

### Expo とは
- React Native アプリを簡単に開発できるフレームワーク
- Web、iOS、Android を**同じコードベース**で開発可能
- ネイティブ機能（カメラ、位置情報など）にアクセスできる

### なぜ Expo なのか
- Next.js は Web 専用だが、Expo は**モバイルアプリ**も作れる
- 設定が簡単で、ビルド・デプロイも楽

---

## 作業手順

### 1. Expo プロジェクトの作成

ターミナルで以下を実行:

```bash
npx create-expo-app@latest Recaplet --template blank-typescript
```

**コマンド解説:**
- `npx`: npm パッケージを一時的に実行
- `create-expo-app@latest`: Expo の最新プロジェクトテンプレートを使用
- `Recaplet`: プロジェクト名
- `--template blank-typescript`: TypeScript 対応の空テンプレート

**実行中の出力例:**
```
✔ Downloaded and extracted project files.
✔ Installed JavaScript dependencies.

✅ Your project is ready!

To run your project, navigate to the directory and run one of the following npm commands.

- cd Recaplet
- npm start # you can open iOS, Android, or web from here, or run them directly with the commands below.
- npm run android
- npm run ios
- npm run web
```

### 2. プロジェクトディレクトリに移動

```bash
cd Recaplet
```

### 3. 依存パッケージのインストール確認

すでにインストールされているはずだが、念のため確認:

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npx expo start
```

**起動後の画面:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### 5. Web ブラウザで確認

ターミナルで **`w`** キーを押す

**または:**

ブラウザで直接アクセス:
```
http://localhost:8081
```

---

## 動作確認観点

### ✅ チェックリスト

- [ ] ターミナルに QR コードが表示される
- [ ] ブラウザで `http://localhost:8081` にアクセスできる
- [ ] 白い背景に「Open up App.tsx to start working on your app!」というテキストが表示される
- [ ] エラーが表示されない

### 期待される画面

```
┌─────────────────────────────┐
│                             │
│   Open up App.tsx to start  │
│   working on your app!      │
│                             │
└─────────────────────────────┘
```

---

## プロジェクト構造の確認

作成されたファイルを確認:

```bash
ls -la
```

**主要なファイル:**
```
Recaplet/
├── App.tsx              # メインのエントリーポイント
├── app.json             # Expo 設定ファイル
├── package.json         # npm パッケージ管理
├── tsconfig.json        # TypeScript 設定
├── node_modules/        # インストール済みパッケージ
├── assets/              # 画像などのリソース
└── .gitignore
```

### App.tsx の中身を確認

```bash
cat App.tsx
```

**内容:**
```typescript
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**ポイント:**
- `View`: React Native の `<div>` に相当
- `Text`: テキスト表示専用コンポーネント
- `StyleSheet`: CSS の代わりに使うスタイリング

---

## 開発サーバーの停止

確認が終わったら、ターミナルで **Ctrl + C** を押して停止

---

## トラブルシューティング

### ポート 8081 が既に使用されている

```bash
# 別のプロセスを終了
lsof -ti:8081 | xargs kill -9

# または別のポートで起動
npx expo start --port 8082
```

### ブラウザで真っ白な画面が表示される

1. ブラウザのキャッシュをクリア（Cmd + Shift + R）
2. ターミナルで `r` キーを押してリロード
3. `npx expo start --clear` で再起動

### `npx` コマンドが見つからない

Node.js が正しくインストールされているか確認:
```bash
which node
which npm
```

---

## 次のステップ

Expo の基本プロジェクトが動作したら、次は [Step 1-3: Expo Router のセットアップ](step-1-3-setup-expo-router.md) に進むのだ！

---

## 学習メモ欄

このステップで学んだこと、気づいたことをメモするのだ:

```
- Expo は create-expo-app で簡単にプロジェクト作成できる
- Web、iOS、Android を同じコードで開発できる
- React Native の View と Text の基本を理解した

（自由に追記してください）
```

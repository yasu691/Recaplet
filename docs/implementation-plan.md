# Recaplet 段階的実装計画

## 前提
- **アーキテクチャ**: Expo (React Native) + Netlify + GitHub Actions + Gemini API
- **学習方針**: 各ステップを小さく分割し、ユーザーが実装→動作確認を繰り返す
- **開発スタイル**: TDD (Test-Driven Development) を意識

---

## Phase 1: 環境構築とプロジェクト初期化

### Step 1-1: Node.js 環境確認とパッケージマネージャーセットアップ
**目標**: 開発環境の準備

**作業内容**:
1. Node.js 24 がインストールされているか確認
2. npm のバージョン確認

**動作確認観点**:
```bash
node --version  # v24.x.x が表示されるか
npm --version   # 10.x.x 以上が表示されるか
```

**期待結果**: Node 24 系が動作している

---

### Step 1-2: Expo プロジェクト作成
**目標**: Expo の基本プロジェクトを作成し、動作確認

**作業内容** (ユーザー実施):
```bash
npx create-expo-app@latest Recaplet --template blank-typescript
cd Recaplet
npm install
npx expo start
```

**動作確認観点**:
1. ターミナルに QR コードが表示される
2. ブラウザで `http://localhost:8081` にアクセスできる
3. "Open up App.tsx to start working..." というテキストが表示される

**期待結果**: Expo の Welcome 画面が Web ブラウザで表示される

---

### Step 1-3: Expo Router のセットアップ
**目標**: ファイルベースルーティングを有効化

**作業内容** (ユーザー実施):
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

`package.json` の `main` フィールドを変更:
```json
{
  "main": "expo-router/entry"
}
```

**Claude が準備するファイル**:
- `app/_layout.tsx` (Root Layout)
- `app/(tabs)/_layout.tsx` (Tab Layout)
- `app/(tabs)/index.tsx` (Home 画面)
- `app.json` (Expo Router 設定を追加)

**ユーザーが実装する部分**:
`app/(tabs)/index.tsx` の基本構造:
```typescript
// TODO(human): View と Text を使って "ニュース一覧" という見出しを表示してください
```

**動作確認観点**:
```bash
npx expo start --clear
```
1. ブラウザで "ニュース一覧" が表示される
2. エラーが出ない

**期待結果**: Expo Router が動作し、自作の画面が表示される

---

## Phase 2: RSS フィード取得とパース機能

### Step 2-1: RSS パーサーのインストールと動作確認
**目標**: rss-parser が動作することを確認

**作業内容** (ユーザー実施):
```bash
npm install rss-parser
npm install --save-dev @types/rss-parser
```

**Claude が準備するファイル**:
- `scripts/test-rss.ts` (テスト用スクリプトのテンプレート)
- `feeds.json` (RSS フィード設定サンプル)

**ユーザーが実装する部分**:
`scripts/test-rss.ts` 内の RSS 取得ロジック:
```typescript
import Parser from 'rss-parser';

// TODO(human): Parser のインスタンスを作成し、
// feeds.json から読み込んだ URL の RSS を取得して、
// 最初の 3 件の記事タイトルを console.log で表示してください
```

**動作確認観点**:
```bash
npx tsx scripts/test-rss.ts
```
1. RSS フィードから取得した記事タイトルが 3 件表示される
2. エラーが出ない

**期待結果**:
```
記事1: TypeScript の新機能について
記事2: React 19 リリース
記事3: ...
```

---

### Step 2-2: RSS の description/content 抽出
**目標**: 要約に使う本文データを取得

**Claude が準備するファイル**:
- `scripts/extract-content.ts` (本文抽出ロジックのテンプレート)

**ユーザーが実装する部分**:
```typescript
// TODO(human): RSS の item から以下の優先順位で本文を取得してください
// 1. item['content:encoded'] (WordPress など)
// 2. item.content
// 3. item.contentSnippet
// 4. item.description
// 取得できた本文の最初の 200 文字を表示してください
```

**動作確認観点**:
```bash
npx tsx scripts/extract-content.ts
```
1. 各記事の本文抜粋が 200 文字表示される
2. HTML タグが含まれていないか確認

**期待結果**: 本文テキストのみが抽出される（HTML タグなし）

---

## Phase 3: Gemini API 連携と要約生成

### Step 3-1: Gemini API キーの設定と疎通確認
**目標**: Gemini API が動作することを確認

**作業内容** (ユーザー実施):
```bash
npm install ai @ai-sdk/google
```

`.env.local` ファイル作成:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

**Claude が準備するファイル**:
- `scripts/test-gemini.ts` (Gemini 疎通確認スクリプトのテンプレート)

**ユーザーが実装する部分**:
```typescript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// TODO(human): Gemini API を使って「こんにちは」という文字列を
// 英語に翻訳して console.log で表示してください
// モデルは 'gemini-1.5-flash' を使用してください
```

**動作確認観点**:
```bash
npx tsx scripts/test-gemini.ts
```
1. "Hello" などの英訳が表示される
2. API エラーが出ない

**期待結果**: Gemini API が正常に応答する

---

### Step 3-2: 記事要約ロジックの実装
**目標**: RSS 本文を日本語で要約

**Claude が準備するファイル**:
- `scripts/summarize-article.ts` (要約ロジックのテンプレート)

**ユーザーが実装する部分**:
```typescript
// TODO(human): 以下の処理を実装してください
// 1. RSS から取得した記事本文（最大 2000 文字）を Gemini に渡す
// 2. プロンプト: "以下の記事を200文字以内の日本語で要約してください:\n\n{本文}"
// 3. 要約結果を console.log で表示
```

**動作確認観点**:
```bash
npx tsx scripts/summarize-article.ts
```
1. 200 文字程度の日本語要約が表示される
2. 元の記事の主要ポイントが含まれている
3. API コストが発生する（数円程度）

**期待結果**:
```
要約: TypeScript 5.5 では新たに Inferred Type Predicates が導入され、
型推論がより強力になりました。これにより...（約200字）
```

---

### Step 3-3: 重複排除ロジックの実装
**目標**: 同じ記事を複数回要約しないようにする

**Claude が準備するファイル**:
- `utils/hash.ts` (URL ハッシュ生成関数のテンプレート)
- `scripts/deduplicate-articles.ts` (重複排除テストスクリプト)

**ユーザーが実装する部分**:
```typescript
import crypto from 'crypto';

// TODO(human): URL 文字列を受け取り、SHA-256 ハッシュを生成して
// 最初の 12 文字を返す関数 generateArticleId を実装してください

export function generateArticleId(url: string): string {
  // ここに実装
}
```

**動作確認観点**:
```bash
npx tsx scripts/deduplicate-articles.ts
```
1. 同じ URL から同じハッシュが生成される
2. 異なる URL からは異なるハッシュが生成される
3. 重複した記事が配列から削除される

**期待結果**:
```
元記事数: 30
重複排除後: 25
```

---

## Phase 4: データ生成パイプライン統合

### Step 4-1: 全体パイプラインの統合
**目標**: RSS → 要約 → JSON 出力の完全フロー

**Claude が準備するファイル**:
- `scripts/generate-summaries.ts` (統合スクリプトのテンプレート)
- `data/.gitkeep` (出力ディレクトリ)

**ユーザーが実装する部分**:
```typescript
// TODO(human): 以下の処理フローを実装してください
// 1. feeds.json から RSS フィード一覧を読み込む
// 2. 各フィードから最新 10 件の記事を取得
// 3. 各記事の本文を抽出
// 4. Gemini で要約を生成
// 5. 重複排除（URL ハッシュ）
// 6. 日時降順でソート
// 7. data/news.json に出力（フォーマット: {generatedAt, items: [...]}）
```

**動作確認観点**:
```bash
npx tsx scripts/generate-summaries.ts
cat data/news.json | head -n 20
```
1. `data/news.json` が生成される
2. JSON フォーマットが正しい
3. `generatedAt` に現在時刻が入っている
4. `items` に記事配列が入っている
5. 各記事に `id`, `title`, `url`, `summary`, `source`, `publishedAt` が含まれる

**期待結果**:
```json
{
  "generatedAt": "2025-11-08T07:00:00.000Z",
  "items": [
    {
      "id": "a3f2c1d5e6b7",
      "title": "TypeScript 5.5 リリース",
      "url": "https://...",
      "summary": "TypeScript 5.5 では...",
      "source": "Tech Blog",
      "publishedAt": "2025-11-08T06:00:00.000Z"
    }
  ]
}
```

---

### Step 4-2: エラーハンドリングの追加
**目標**: API 失敗時にスキップして続行

**ユーザーが実装する部分**:
`scripts/generate-summaries.ts` に追加:
```typescript
// TODO(human): try-catch を使って以下のエラーハンドリングを追加してください
// 1. RSS 取得失敗 → そのフィードをスキップして次へ
// 2. Gemini API 失敗 → その記事をスキップして次へ
// 3. エラー発生時は console.error でエラー内容を表示
// 4. 処理完了時に成功件数とエラー件数を表示
```

**動作確認観点**:
1. 存在しない RSS URL を `feeds.json` に追加
2. スクリプトを実行
3. エラーが表示されるが、他の記事は正常に処理される
4. 最後に「成功: 25件、エラー: 5件」のような統計が表示される

**期待結果**: エラーがあっても処理が中断されない

---

## Phase 5: Expo アプリ実装

### Step 5-1: ニュースカードコンポーネントの作成
**目標**: 記事を表示するカード UI

**Claude が準備するファイル**:
- `components/NewsCard.tsx` (コンポーネントのテンプレート)
- `types/news.ts` (型定義)

**ユーザーが実装する部分**:
```typescript
// TODO(human): 以下の要素を持つカードコンポーネントを実装してください
// - タイトル (Text)
// - 要約 (Text)
// - メタ情報: source と publishedAt を横並びで表示 (View + Text)
// - 基本的なスタイリング (StyleSheet)
```

**動作確認観点**:
1. `app/(tabs)/index.tsx` でダミーデータを渡してカードを表示
2. タイトル、要約、メタ情報が正しく表示される
3. スタイルが適用されている

**期待結果**: カード UI がブラウザで確認できる

---

### Step 5-2: データフェッチ機能の実装
**目標**: `data/news.json` を取得して表示

**Claude が準備するファイル**:
- `app/(tabs)/index.tsx` (データフェッチのテンプレート)

**ユーザーが実装する部分**:
```typescript
// TODO(human): useState と useEffect を使って以下を実装してください
// 1. /data/news.json を fetch で取得
// 2. 取得したデータを state に保存
// 3. ローディング状態の管理
// 4. エラー状態の管理
```

**動作確認観点**:
```bash
# data/news.json を public/ にコピー
mkdir -p public/data
cp data/news.json public/data/

npx expo start --web
```
1. ブラウザでニュース一覧が表示される
2. ローディング中は "読み込み中..." が表示される
3. エラー時はエラーメッセージが表示される

**期待結果**: JSON データが画面に表示される

---

### Step 5-3: コピーボタンの実装
**目標**: 要約 + URL をクリップボードにコピー

**作業内容** (ユーザー実施):
```bash
npx expo install expo-clipboard
```

**ユーザーが実装する部分**:
`components/NewsCard.tsx` に追加:
```typescript
import * as Clipboard from 'expo-clipboard';

// TODO(human): Pressable を使ってボタンを作成し、
// 押されたら以下の形式でクリップボードにコピーしてください
// フォーマット: "{summary}\n{url}"
// コピー成功時は Alert.alert で "コピーしました！" と表示
```

**動作確認観点**:
1. カードのコピーボタンを押す
2. "コピーしました！" のアラートが表示される
3. テキストエディタに貼り付けて、要約と URL が含まれているか確認

**期待結果**: クリップボードに正しいテキストがコピーされる

---

### Step 5-4: Pull-to-Refresh の実装
**目標**: 下にスワイプして再読み込み

**ユーザーが実装する部分**:
```typescript
// TODO(human): FlatList に RefreshControl を追加して、
// 下スワイプで fetchNews() が再実行されるようにしてください
```

**動作確認観点**:
1. 画面を下にスワイプ
2. ローディングアニメーションが表示される
3. 最新データが再取得される

**期待結果**: Pull-to-Refresh が動作する

---

## Phase 6: GitHub Actions 自動化

### Step 6-1: GitHub Actions ワークフローの作成
**目標**: 15分ごとに自動実行

**Claude が準備するファイル**:
- `.github/workflows/update-feeds.yml` (ワークフローのテンプレート)

**ユーザーが実装する部分**:
```yaml
# TODO(human): 以下の処理を実装してください
# 1. schedule: cron で 15分ごとに実行
# 2. Node.js 24 のセットアップ
# 3. npm install
# 4. scripts/generate-summaries.ts の実行（環境変数に API キーを設定）
# 5. data/news.json の変更を git commit & push
```

**動作確認観点**:
1. GitHub リポジトリにプッシュ
2. Actions タブで「Update Feeds」ワークフローが表示される
3. 手動実行（workflow_dispatch）して成功する
4. `data/news.json` が更新されてコミットされる

**期待結果**: GitHub Actions が正常に動作する

---

### Step 6-2: Netlify 連携の設定
**目標**: GitHub Actions から Netlify にデプロイ

**作業内容** (ユーザー実施):
1. Netlify にログイン
2. 新しいサイトを作成
3. 環境変数 `NETLIFY_AUTH_TOKEN` と `NETLIFY_SITE_ID` を GitHub Secrets に追加

**Claude が準備するファイル**:
- `.github/workflows/deploy-web.yml` (デプロイワークフロー)
- `netlify.toml` (Netlify 設定)

**ユーザーが実装する部分**:
```yaml
# TODO(human): deploy-web.yml に以下を追加してください
# 1. npx expo export:web でビルド
# 2. netlify-cli で dist/ を Netlify にデプロイ
```

**動作確認観点**:
1. GitHub にプッシュ
2. Actions でデプロイが実行される
3. Netlify の URL にアクセスして、アプリが表示される

**期待結果**: Netlify に自動デプロイされる

---

## Phase 7: Android APK ビルド

### Step 7-1: EAS Build のセットアップ
**目標**: Android APK をビルド

**作業内容** (ユーザー実施):
```bash
npm install -g eas-cli
eas login
eas build:configure
```

**ユーザーが実装する部分**:
`eas.json` の編集:
```json
{
  "build": {
    "preview": {
      "android": {
        // TODO(human): APK ビルド設定を追加
      }
    }
  }
}
```

**動作確認観点**:
```bash
eas build --platform android --profile preview
```
1. ビルドがキューに追加される
2. ビルドが成功する（10-15分）
3. APK ダウンロード URL が表示される

**期待結果**: APK がダウンロード可能になる

---

### Step 7-2: Android 実機でのテスト
**目標**: APK を実機にインストールして動作確認

**動作確認観点**:
1. APK を Android 端末にダウンロード
2. インストール（提供元不明アプリの許可が必要）
3. アプリを起動
4. ニュース一覧が表示される
5. コピーボタンが動作する
6. Pull-to-Refresh が動作する

**期待結果**: Android ネイティブアプリとして動作する

---

## 完成後のチェックリスト

- [ ] RSS フィードを `feeds.json` で管理できる
- [ ] 15分ごとに自動要約が生成される
- [ ] Web（Netlify）でアクセスできる
- [ ] Android APK でインストールできる
- [ ] コピーボタンが動作する
- [ ] Pull-to-Refresh が動作する
- [ ] エラーハンドリングが適切に動作する
- [ ] Gemini API コストが月 $1 以下に収まる

---

## コスト試算（再掲）

**Gemini 1.5 Flash:**
- 月額約 $1（5記事/回 × 96回/日 × 30日）

**その他:**
- Netlify: $0
- GitHub Actions: $0
- EAS Build: $0（月1回まで）

**合計: ~$1/月**

---

## 学習ポイント

各フェーズで学べること:
- **Phase 1-2**: Expo + RSS パース
- **Phase 3**: LLM API 連携
- **Phase 4**: データパイプライン設計
- **Phase 5**: React Native UI 開発
- **Phase 6**: CI/CD 自動化
- **Phase 7**: モバイルアプリ配布

すべてのステップで「実装 → 動作確認 → 次へ」のサイクルを回すことで、
確実に動作するアプリケーションを構築できるのだ！

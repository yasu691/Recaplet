# Implementation Steps - 実装ステップガイド

このディレクトリには、Recaplet プロジェクトの段階的実装手順が含まれているのだ。

---

## 📚 ステップ一覧

### Phase 1: 環境構築とプロジェクト初期化

- [Step 1-1: Node.js 環境確認とパッケージマネージャーセットアップ](step-1-1-environment-setup.md)
- [Step 1-2: Expo プロジェクト作成](step-1-2-create-expo-project.md)
- [Step 1-3: Expo Router のセットアップ](step-1-3-setup-expo-router.md)

### Phase 2: RSS フィード取得とパース機能

- [Step 2-1: RSS パーサーのインストールと動作確認](step-2-1-rss-parser-setup.md)
- [Step 2-2: RSS の description/content 抽出](step-2-2-extract-content.md)

### Phase 3: Gemini API 連携と要約生成

- [Step 3-1: Gemini API キーの設定と疎通確認](step-3-1-gemini-api-setup.md)
- [Step 3-2: 記事要約ロジックの実装](step-3-2-article-summarization.md)
- [Step 3-3: 重複排除ロジックの実装](step-3-3-deduplication.md)

### Phase 4: データ生成パイプライン統合

- [Step 4-1: 全体パイプラインの統合](step-4-1-pipeline-integration.md)
- Step 4-2: エラーハンドリングの追加 *(Step 4-1 に統合済み)*

### Phase 5: Expo アプリ実装

- Step 5-1: ニュースカードコンポーネントの作成 *(Step 5-2 に統合済み)*
- [Step 5-2: データフェッチ機能の実装](step-5-2-data-fetching.md)
- [Step 5-3: コピーボタンの実装](step-5-3-copy-button.md)
- Step 5-4: Pull-to-Refresh の実装 *(オプション: 必要に応じて実装)*

### Phase 6: GitHub Actions 自動化

- [Step 6-1: GitHub Actions ワークフローの作成](step-6-1-github-actions.md)
- Step 6-2: Netlify 連携の設定 *(オプション: Netlify デプロイ時に実装)*

### Phase 7: Android APK ビルド

- Step 7-1: EAS Build のセットアップ *(作成予定)*
- Step 7-2: Android 実機でのテスト *(作成予定)*

---

## 🎯 使い方

### 1. 順番に進める

各ステップは前のステップの完了を前提としているため、**必ず順番に**進めること。

### 2. 動作確認を必ず行う

各ステップには「動作確認観点」が記載されている。
次のステップに進む前に、必ず動作確認を行うこと。

### 3. 学習メモを活用

各ステップの最後に「学習メモ欄」がある。
学んだことや気づいたことをメモしておくと、後で復習しやすい。

### 4. トラブルシューティングを確認

エラーが出たら、まず各ステップの「トラブルシューティング」セクションを確認すること。

---

## 📖 記法について

### TODO(human)

```typescript
// TODO(human): ここはあなたが実装する部分
```

`TODO(human)` とコメントされている箇所は、**ユーザー自身が実装する部分**なのだ。

### ヒントと解答例

各ステップには以下が含まれている:

- **ヒント1, 2, 3**: 段階的なヒント（折りたたみ式）
- **完全な解答例**: どうしても困ったときに見る（折りたたみ式）

**推奨学習フロー:**
1. まず自力で実装してみる
2. 詰まったらヒント1を見る
3. それでも分からなければヒント2, 3を見る
4. 最終手段として解答例を見る

---

## 🔧 よく使うコマンド

```bash
# TypeScript ファイルの実行
npx tsx scripts/ファイル名.ts

# Expo 開発サーバーの起動
npx expo start

# Expo 開発サーバー（Web）
npx expo start --web

# Expo 開発サーバー（キャッシュクリア）
npx expo start --clear

# パッケージのインストール
npm install パッケージ名

# パッケージのインストール（開発用）
npm install --save-dev パッケージ名
```

---

## 🆘 困ったときは

1. **エラーメッセージを読む**: エラーメッセージには解決のヒントが含まれている
2. **トラブルシューティングを確認**: 各ステップに記載されている
3. **ログを確認**: `console.log()` でデバッグ情報を出力
4. **Google 検索**: エラーメッセージをそのまま検索
5. **Claude に質問**: 具体的なエラー内容を伝えて質問

---

## 📈 進捗管理

各ステップを完了したら、以下にチェックを入れるのだ:

### Phase 1
- [ ] Step 1-1: 環境確認
- [ ] Step 1-2: Expo プロジェクト作成
- [ ] Step 1-3: Expo Router セットアップ

### Phase 2
- [ ] Step 2-1: RSS パーサー
- [ ] Step 2-2: 本文抽出

### Phase 3
- [ ] Step 3-1: Gemini API セットアップ
- [ ] Step 3-2: 要約ロジック
- [ ] Step 3-3: 重複排除

### Phase 4
- [ ] Step 4-1: パイプライン統合
- [ ] Step 4-2: エラーハンドリング

### Phase 5
- [ ] Step 5-1: カードコンポーネント
- [ ] Step 5-2: データフェッチ
- [ ] Step 5-3: コピーボタン
- [ ] Step 5-4: Pull-to-Refresh

### Phase 6
- [ ] Step 6-1: GitHub Actions
- [ ] Step 6-2: Netlify デプロイ

### Phase 7
- [ ] Step 7-1: EAS Build
- [ ] Step 7-2: Android テスト

---

## 💡 学習のポイント

### 小さく動かす

大きな機能を一度に作らず、**小さく動かしながら進める**ことが重要。
各ステップで動作確認を行うことで、エラーの原因を特定しやすくなる。

### 理解してから進む

コードをコピペするだけでなく、**なぜそのコードが必要なのか**を理解すること。
「前提知識」セクションを必ず読むこと。

### 失敗を恐れない

エラーが出るのは当たり前。
エラーメッセージを読んで、トラブルシューティングを試すことで、スキルが向上する。

---

頑張って実装を進めるのだ！🚀

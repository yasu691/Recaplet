# 開発ガイド

このドキュメントでは、Recapletの開発において重要な運用ルールとベストプラクティスを説明します。

## 生成データファイルの取り扱い

### 対象ファイル
- `data/news.json`
- `public/data/news.json`

### 重要な運用ルール

#### ⚠️ これらのファイルは `.gitignore` に追加しないこと

**理由:**
1. **GitHub Actions との整合性**
   - `.github/workflows/update-feeds.yml` が毎時、自動的にこれらのファイルをコミット・プッシュしている
   - `.gitignore` に追加すると、ワークフローが壊れる

2. **静的サイトアーキテクチャ**
   - Netlify などの静的ホスティングサービスが、リポジトリ内のJSONファイルを直接配信している
   - ファイルがリポジトリに存在しないと、アプリがデータを読み込めず404エラーになる

3. **コンテンツハッシュ方式の活用**
   - 既存の要約を再利用してAPIコストを削減する仕組みが、リポジトリ内のデータに依存している
   - ファイルが存在しないと、要約の重複判定ができない

### ローカル開発時の Git 競合回避

ローカルで `npm run generate-summaries` を実行してテストする場合、以下の手順で Git 競合を回避します。

#### 推奨手順

```bash
# 1. テストのために要約を生成
npx tsx scripts/generate-summaries.ts

# 2. 動作確認後、生成データを元に戻す
git restore data/news.json public/data/news.json

# 3. リモートから最新の変更を取得
git pull
```

#### または、ローカルで生成しない運用

```bash
# リモートの最新データを常に使う（推奨）
git pull
```

**メリット:**
- Git 競合が発生しない
- GitHub Actions が生成した最新データを利用できる
- ローカルでのAPI呼び出しが不要（コスト削減）

### コードファイルの変更をコミットする場合

生成データとコードファイルが同時に変更されている場合:

```bash
# 1. 生成データをリモート版に戻す
git restore data/news.json public/data/news.json

# 2. コードファイルのみをコミット
git add scripts/generate-summaries.ts types/news.ts utils/hash.ts
git commit -m "feat: 新機能を追加"

# 3. リベースでリモートの変更を取り込む
git pull --rebase

# 4. リモートにプッシュ
git push
```

## 要約生成の仕組み

### コンテンツハッシュ方式による要約再利用

2025年11月に実装された機能により、同じ内容の記事は既存の要約を再利用します。

**動作:**
1. 記事本文のSHA-256ハッシュ（12文字）を生成
2. 既存記事と同じ `contentHash` があれば要約を再利用
3. 新しいコンテンツの場合のみ Azure OpenAI で要約生成

**ログ表示:**
- `♻ 要約再利用: [記事タイトル]` - 既存の要約を使用
- `✓ 新規要約: [記事タイトル]` - 新しく要約を生成

**効果:**
- APIコスト削減（重複記事の要約生成をスキップ）
- 処理時間短縮
- URL先の内容が更新された場合は自動的に新しい要約を生成

### GitHub Actions による自動更新

`.github/workflows/update-feeds.yml` が以下を実行:

```yaml
schedule:
  - cron: '0 * * * *'  # 毎時0分に実行
```

1. RSSフィードから最新記事を取得
2. コンテンツハッシュで重複判定
3. 新しい記事のみ要約を生成
4. `data/news.json` と `public/data/news.json` を更新
5. 変更をコミット・プッシュ（コミットメッセージ: `chore: update news data [skip ci]`）

## トラブルシューティング

### `git pull` で競合エラーが出る場合

```bash
error: Your local changes to the following files would be overwritten by merge:
  data/news.json
  public/data/news.json
```

**解決策:**

```bash
# 生成データを元に戻す
git restore data/news.json public/data/news.json

# 再度 pull
git pull
```

### GitHub Actions が失敗する場合

以下を確認:

1. **Secrets の設定**
   - `AZURE_API_KEY`
   - `AZURE_RESOURCE_NAME`
   - `AZURE_OPENAI_DEPLOYMENT_NAME`
   - `NETLIFY_BUILD_HOOK` (Netlify自動デプロイ用)

2. **リポジトリの権限**
   - Actions に `contents: write` 権限があるか確認

3. **ワークフローログ**
   - GitHub の Actions タブでエラーメッセージを確認

### Netlify自動デプロイの設定

データ更新時にNetlifyを自動的に再ビルドするには、以下の手順でBuild Hookを設定:

1. **Netlify Build Hookの作成**
   - Netlifyダッシュボード → Site settings → Build & deploy → Build hooks
   - 「Add build hook」をクリック
   - Hook名: `GitHub Actions News Update`
   - ブランチ: `main` (またはデプロイブランチ)
   - 生成されたURLをコピー

2. **GitHub Secretsに追加**
   - GitHubリポジトリ → Settings → Secrets and variables → Actions
   - 「New repository secret」をクリック
   - Name: `NETLIFY_BUILD_HOOK`
   - Secret: コピーしたNetlify Build Hook URL
   - 「Add secret」をクリック

これにより、GitHub Actionsがニュースデータを更新すると、Netlifyが自動的に再ビルドして最新データを配信します。

## 関連ドキュメント

- [GitHub Actions 設定](../.github/workflows/update-feeds.yml)
- [要約生成スクリプト](../scripts/generate-summaries.ts)
- [データ型定義](../types/news.ts)
- [ハッシュ生成ユーティリティ](../utils/hash.ts)

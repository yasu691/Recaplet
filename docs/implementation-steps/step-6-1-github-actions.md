# Step 6-1: GitHub Actions ワークフローの作成

## 目標
15分ごとに自動でRSS取得→要約生成→JSON更新を実行するGitHub Actionsワークフローを構築する

---

## 前提知識

### GitHub Actions とは

- GitHub が提供する CI/CD サービス
- YAML ファイルでワークフローを定義
- **無料枠**: パブリックリポジトリは無制限、プライベートは月2000分

### cron 式とは

```
*/15 * * * *
│  │ │ │ │
│  │ │ │ └─ 曜日（0-7、0と7が日曜）
│  │ │ └─── 月（1-12）
│  │ └───── 日（1-31）
│  └─────── 時（0-23）
└────────── 分（0-59）
```

**例:**
- `*/15 * * * *`: 15分ごと
- `0 */6 * * *`: 6時間ごと
- `0 9 * * *`: 毎日9時

### Secrets の管理

- API キーなどの機密情報を安全に保存
- リポジトリの Settings > Secrets and variables > Actions で設定

---

## 作業手順

### 1. GitHub リポジトリの作成

```bash
# Git 初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# GitHub にプッシュ
gh repo create Recaplet --public --source=. --remote=origin --push
```

**または Web で作成:**
1. https://github.com/new にアクセス
2. リポジトリ名: `Recaplet`
3. Public を選択
4. Create repository

### 2. Secrets の設定

#### 2-1. GitHub の Settings にアクセス

```
リポジトリページ → Settings → Secrets and variables → Actions
```

#### 2-2. New repository secret をクリック

#### 2-3. API キーを追加

**Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
**Value:** `AIzaSyXXXXXXXXXXXXXXXXXXXX`（あなたのAPIキー）

「Add secret」をクリック

---

## ユーザー実装部分

### `.github/workflows/update-feeds.yml` の作成

ディレクトリとファイルを作成:

```bash
mkdir -p .github/workflows
touch .github/workflows/update-feeds.yml
```

以下のワークフローを**あなたが実装**するのだ:

```yaml
name: Update RSS Feeds

# TODO(human): トリガーを設定してください
# 1. schedule: cron で 15分ごとに実行（*/15 * * * *）
# 2. workflow_dispatch: 手動実行も可能にする

on:
  # ここに実装

jobs:
  update-feeds:
    runs-on: ubuntu-latest

    steps:
      # TODO(human): 以下のステップを実装してください

      # 1. リポジトリをチェックアウト
      - name: Checkout repository
        uses: actions/checkout@v4

      # 2. Node.js 24 をセットアップ
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          # ここに node-version を指定

      # 3. 依存パッケージをインストール
      - name: Install dependencies
        run: # ここにコマンド

      # 4. RSS 要約を生成
      - name: Generate RSS summaries
        env:
          # ここに環境変数を設定（Secrets を使用）
        run: # ここにコマンド

      # 5. 変更をコミット & プッシュ
      - name: Commit and push changes
        run: |
          # Git の設定
          # data/news.json を add
          # 変更があればコミット（git diff --quiet を使用）
          # プッシュ
```

---

### 実装のヒント

<details>
<summary>ヒント1: on トリガーの設定</summary>

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'  # 15分ごと
  workflow_dispatch:  # 手動実行ボタンを有効化
```
</details>

<details>
<summary>ヒント2: Node.js セットアップ</summary>

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '24'
    cache: 'npm'
```
</details>

<details>
<summary>ヒント3: 環境変数の設定</summary>

```yaml
- name: Generate RSS summaries
  env:
    GOOGLE_GENERATIVE_AI_API_KEY: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
  run: npx tsx scripts/generate-summaries.ts
```

`${{ secrets.XXXX }}` で Secrets にアクセス
</details>

<details>
<summary>ヒント4: Git コミット</summary>

```yaml
- name: Commit and push changes
  run: |
    git config --local user.email "github-actions[bot]@users.noreply.github.com"
    git config --local user.name "github-actions[bot]"
    git add data/news.json
    git diff --quiet && git diff --staged --quiet || git commit -m "chore: update news data [skip ci]"
    git push
```

`[skip ci]` で無限ループを防ぐ
</details>

<details>
<summary>完全な解答例（どうしても困ったら見る）</summary>

```yaml
name: Update RSS Feeds

on:
  schedule:
    - cron: '*/15 * * * *'  # 15分ごとに実行
  workflow_dispatch:  # 手動実行を許可

jobs:
  update-feeds:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate RSS summaries
        env:
          GOOGLE_GENERATIVE_AI_API_KEY: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
        run: npx tsx scripts/generate-summaries.ts

      - name: Commit and push changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/news.json public/data/news.json
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "chore: update news data [skip ci]" && git push)
```
</details>

---

## 動作確認

### 1. ワークフローファイルをプッシュ

```bash
git add .github/workflows/update-feeds.yml
git commit -m "feat: add GitHub Actions workflow"
git push origin main
```

### 2. GitHub Actions の確認

#### 2-1. GitHub リポジトリの Actions タブにアクセス

```
https://github.com/[username]/Recaplet/actions
```

#### 2-2. 手動実行でテスト

1. 左サイドバーで「Update RSS Feeds」を選択
2. 右上の「Run workflow」をクリック
3. 「Run workflow」ボタンをクリック

#### 2-3. 実行結果の確認

- 黄色の丸: 実行中
- 緑のチェック: 成功
- 赤の×: 失敗

クリックするとログが表示される

### 3. 確認観点

#### ✅ チェックリスト

- [ ] Actions タブに「Update RSS Feeds」ワークフローが表示される
- [ ] 手動実行が成功する（緑のチェック）
- [ ] `data/news.json` が更新されてコミットされる
- [ ] エラーが出ない
- [ ] 処理が5分以内に完了する

#### 期待されるログ

```
Run npx tsx scripts/generate-summaries.ts
=== RSS要約生成開始 ===

処理中: Zenn
  ✓ Expo Router で型安全なルーティングを実現する
  ✓ React 19 の新機能まとめ
  ...

=== 処理完了 ===
成功: 18 件
エラー: 0 件
```

---

## トラブルシューティング

### エラー: `Error: Input required and not supplied: node-version`

**原因:** `node-version` が指定されていない

**解決:**
```yaml
with:
  node-version: '24'
```

### エラー: `GOOGLE_GENERATIVE_AI_API_KEY is not defined`

**原因:** Secrets が設定されていない

**確認:**
1. Settings > Secrets and variables > Actions
2. `GOOGLE_GENERATIVE_AI_API_KEY` が存在するか確認
3. 名前が完全に一致しているか確認

### エラー: `Permission denied (publickey)`

**原因:** Git push の権限がない

**解決:**
```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}  # 自動的に付与される
```

### ワークフローが実行されない

**原因:** cron が動作していない（新規リポジトリの場合、初回は手動実行が必要）

**解決:**
1. 手動実行（workflow_dispatch）で1回実行
2. その後、cron が有効になる

### data/news.json が更新されない

**デバッグ:**
```yaml
- name: Check file changes
  run: |
    ls -la data/
    cat data/news.json | head -n 10
    git status
```

ログで確認

---

## GitHub Actions のベストプラクティス

### 1. `npm ci` vs `npm install`

```yaml
# 推奨: npm ci
run: npm ci

# 非推奨: npm install
run: npm install
```

**理由:**
- `npm ci`: package-lock.json を厳密に使用（再現性が高い）
- `npm install`: package.json を優先（バージョンがずれる可能性）

### 2. キャッシュの活用

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '24'
    cache: 'npm'  # node_modules をキャッシュ
```

**効果:** 2回目以降の実行が高速化（30秒 → 10秒）

### 3. タイムアウト設定

```yaml
jobs:
  update-feeds:
    runs-on: ubuntu-latest
    timeout-minutes: 10  # 10分でタイムアウト
```

無限ループを防ぐ

---

## cron の頻度について

### コスト試算

```
15分ごと: 96回/日 × 30日 = 2,880回/月
1時間ごと: 24回/日 × 30日 = 720回/月
```

**Gemini コスト（18件/回と仮定）:**
- 15分ごと: 2,880 × 18 = 51,840記事/月 → 約$52/月
- 1時間ごと: 720 × 18 = 12,960記事/月 → 約$13/月

**推奨: 最初は1時間ごと**

```yaml
schedule:
  - cron: '0 * * * *'  # 毎時0分に実行
```

---

## 次のステップ

GitHub Actions が動作したら、次は [Step 6-2: Netlify 連携の設定](step-6-2-netlify-deployment.md) に進むのだ！

---

## 学習メモ欄

```
- GitHub Actions で定期実行を自動化できる
- Secrets で API キーを安全に管理
- cron 式でスケジュール設定
- [skip ci] で無限ループを防ぐ
- npm ci で再現性の高いビルド

（自由に追記してください）
```

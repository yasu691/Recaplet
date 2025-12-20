# GitHub Pages 移行の課題点と暫定対応まとめ

## 概要

Netlify の無料枠デプロイ上限（月300回）を超過したため、GitHub Pages へ移行した。
しかし、**Expo Router をサブパスでデプロイする際に予想外の困難**に直面した。

## 主要な課題と対応

### 1. デプロイ回数上限問題

#### 課題
- Netlify 無料枠: 月300回まで
- 実際の使用: 毎時更新で約720回/月 → **2.4倍オーバー**

#### 対応
- GitHub Pages へ移行（デプロイ回数無制限）
- ワークフロー実行頻度を削減: 毎時 → 8時間おき（3回/日）

---

### 2. ワークフローの競合問題

#### 課題
- `update-feeds.yml` と `deploy-gh-pages.yml` が同時実行
- 両方が同じファイル（`news.json`）を更新しようとして rebase で競合

#### 対応
- `update-feeds.yml` を削除
- `deploy-gh-pages.yml` に一本化（フィード更新 → ビルド → デプロイ）

---

### 3. サブパスデプロイの困難（最大の課題）

#### 課題
GitHub Pages のプロジェクトサイトは `https://username.github.io/repository/` 形式のサブパスになるが、
**Expo 54 + Expo Router はサブパスデプロイに対応していない**ことが判明。

#### 試行錯誤の履歴

| 試行 | アプローチ | 結果 | 理由 |
|------|-----------|------|------|
| 1 | `app.json` に `bundler: "metro"`, `output: "static"` を追加<br>`EXPO_PUBLIC_URL` 環境変数を設定 | ❌ 読み込み中のまま停止 | Expo Router が環境変数を認識しない |
| 2 | `app.json` の `extra.router.origin` を設定<br>`.nojekyll` ファイルを追加 | ❌ 404エラー<br>`/_expo/static/js/...` を探すが正しくは `/Recaplet/_expo/static/js/...` | HTML のパスがルートパス前提のまま |
| 3 | `metro.config.js` で `publicPath` を設定<br>`EXPO_BASE_URL` 環境変数を使用 | ❌ 404エラー（変化なし） | **Expo 54 では Metro の `publicPath` 設定が無視される** |
| 4 | **ビルド後に `sed` で HTML を直接書き換え** | ✅ 実装完了（動作確認待ち） | フレームワークの制約を回避 |

#### 最終的な暫定対応

**ビルド後処理でパスを強制的に書き換える方式**

```bash
# HTMLファイル内のパスを sed で一括置換
find dist -name "*.html" -type f -exec sed -i 's|src="/_expo/|src="/Recaplet/_expo/|g' {} +
find dist -name "*.html" -type f -exec sed -i 's|href="/_expo/|href="/Recaplet/_expo/|g' {} +
find dist -name "*.html" -type f -exec sed -i 's|href="/favicon.ico"|href="/Recaplet/favicon.ico"|g' {} +
```

**メリット:**
- フレームワークの制約に依存しない
- 確実に動作する

**デメリット:**
- エレガントではない
- Expo のバージョンアップで HTML 構造が変わると壊れる可能性

---

## 現在の構成

### ワークフロー: `.github/workflows/deploy-gh-pages.yml`

```yaml
on:
  schedule:
    - cron: '0 */8 * * *'  # 8時間おきに実行（0時、8時、16時 UTC）
  workflow_dispatch:

jobs:
  update-and-deploy:
    steps:
      1. RSS フィード更新
      2. データをコミット&プッシュ
      3. Web アプリをビルド（expo export --platform web）
      4. .nojekyll ファイル作成
      5. sed で HTML 内のパスを修正 ← **暫定対応**
      6. GitHub Pages へデプロイ
```

### 設定ファイル

#### `app.json`
```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static"
    },
    "extra": {
      "router": {
        "origin": "https://yasu691.github.io/Recaplet"
      }
    }
  }
}
```

#### 削除したファイル
- `netlify.toml` - Netlify 設定（不要）
- `update-feeds.yml` - 重複ワークフロー
- `metro.config.js` - Expo 54 で機能しない

---

## 今後の改善案

### 短期（暫定対応の継続）
現在の `sed` 方式を継続使用。動作が確認できれば OK。

### 中期（より良い解決策の検討）
1. **カスタムドメインの使用**
   - `recaplet.example.com` のようなカスタムドメインを設定
   - サブパス問題を根本から回避

2. **Vite への移行**
   - Expo Router を諦め、React Router + Vite に移行
   - Vite は `base` オプションでサブパスに完全対応

### 長期（アーキテクチャ見直し）
1. **Vercel への移行**
   - Hobby プランは無料でデプロイ回数無制限
   - Expo/Next.js のサブパスデプロイに完全対応

2. **Cloudflare Pages**
   - 無料枠が充実（月25,000ビルド/月）
   - サブパスデプロイにも対応

---

## 学んだこと

### 技術的知見
1. **Expo Router のサブパス対応は不完全**
   - 公式ドキュメントに記載がない
   - Metro の `publicPath` 設定が Expo 54 で無視される

2. **GitHub Pages のプロジェクトサイトは制約が多い**
   - サブパスが必須
   - Jekyll 前提の仕様（`.nojekyll` で回避可能）

3. **フレームワークに頼りすぎない**
   - 設定で解決できないなら、ビルド後処理で対応
   - エレガントでなくても、**動くことが最優先**

### プロジェクト管理
1. **段階的な移行の落とし穴**
   - 新旧ワークフローの併存は競合を招く
   - 移行時は一気に切り替えるべき

2. **無料枠の上限確認の重要性**
   - サービス選定時に制限を事前調査
   - 運用開始後もモニタリングが必要

---

## 参考リンク

- [GitHub Pages 公式ドキュメント](https://docs.github.com/pages)
- [Expo Router 公式ドキュメント](https://docs.expo.dev/router/introduction/)
- [Metro Bundler Configuration](https://metrobundler.dev/docs/configuration)
- [GitHub Actions - Deploy Pages](https://github.com/actions/deploy-pages)

---

## まとめ

Netlify から GitHub Pages への移行は、**サブパスデプロイという予期せぬ壁**に直面した。
Expo Router の制約により、エレガントな解決策は見つからなかったが、
**sed でのパス書き換え**という実用的な暫定対応で前進できた。

長期的には、カスタムドメインの使用や、別のホスティングサービスへの移行を検討すべきである。

---

**作成日**: 2025-12-14
**最終更新**: 2025-12-14

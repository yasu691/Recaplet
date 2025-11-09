# Step 1-1: Node.js 環境確認とパッケージマネージャーセットアップ

## 目標
開発環境が正しくセットアップされていることを確認する

---

## 前提知識

### Node.js とは
- JavaScript をサーバーサイドやローカル環境で実行するためのランタイム
- npm (Node Package Manager) が同梱されており、パッケージ管理ができる

### なぜ Node 24 が必要か
- Expo は最新の JavaScript 機能を使用するため、モダンな Node.js が必要
- Node 24 は LTS (Long Term Support) バージョンで安定性が高い

---

## 作業手順

### 1. ターミナルを開く

**Mac の場合:**
- Spotlight 検索 (Cmd + Space) で「ターミナル」と入力
- または Applications > ユーティリティ > ターミナル

**Windows の場合:**
- PowerShell または WSL2 (Ubuntu) を推奨

### 2. Node.js のバージョン確認

以下のコマンドを実行:

```bash
node --version
```

**期待される出力:**
```
v24.x.x
```

**もし異なるバージョンの場合:**
- Node.js 24 をインストール: https://nodejs.org/
- または `nvm` (Node Version Manager) を使用してバージョン切り替え

### 3. npm のバージョン確認

```bash
npm --version
```

**期待される出力:**
```
10.x.x 以上
```

### 4. 作業ディレクトリの確認

現在のディレクトリを確認:

```bash
pwd
```

**期待される出力:**
```
/Users/yasutaka/repo/Recaplet
```

もし違う場所にいる場合は移動:

```bash
cd /Users/yasutaka/repo/Recaplet
```

---

## 動作確認観点

### ✅ チェックリスト

- [x] `node --version` で v24.x.x が表示される
- [x] `npm --version` で 10.x.x 以上が表示される
- [x] `pwd` で Recaplet ディレクトリが表示される

---

## トラブルシューティング

### Node.js がインストールされていない場合

**Mac (Homebrew 使用):**
```bash
brew install node@24
```

**nvm を使う場合 (推奨):**
```bash
# nvm インストール (未インストールの場合)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node 24 インストール
nvm install 24
nvm use 24
nvm alias default 24
```

### npm が古い場合

```bash
npm install -g npm@latest
```

---

## 次のステップ

環境確認ができたら、次は [Step 1-2: Expo プロジェクト作成](step-1-2-create-expo-project.md) に進むのだ！

---

## 学習メモ欄

このステップで学んだこと、気づいたことをメモするのだ:

```
nvmでアップデートするのをすっかり忘れていて、Node.jsが20のまんまだった。
Nodeに限らず、バージョンアップデートを定期的に思い出すための何かがあるべきだと思った。
```

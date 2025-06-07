# ユーザー設定ガイド

プロジェクト実装完了後、ユーザー側で必要な設定手順をまとめています。

## 📋 前提条件

- GitHub アカウント
- Vercel アカウント
- npm アカウント
- Git 設定済み

## 🚀 設定手順

### 1. GitHub リポジトリ設定

#### 1.1 リモートリポジトリ確認・追加

```powershell
# 現在のリモート確認
git remote -v

# リモートリポジトリ追加（まだの場合）
git remote add origin https://github.com/lvncer/name-card.git
```

#### 1.2 ブランチプッシュ

```powershell
# 現在のブランチをプッシュ
git push -u origin feat/1-project-foundation
```

#### 1.3 Pull Request 作成

```powershell
# GitHub CLI を使用する場合
gh pr create --title "feat: 名刺作成アプリケーション実装 (#1)" --body "全フェーズ実装完了"

# または GitHub Web UI で作成
# https://github.com/lvncer/name-card/compare/main...feat/1-project-foundation
```

#### 1.4 マージ・完了

- PR レビュー・承認
- main ブランチにマージ
- Issue #1 自動クローズ確認

### 2. Vercel デプロイ設定

#### 2.1 Vercel CLI インストール

```powershell
npm install -g vercel
```

#### 2.2 Vercel ログイン

```powershell
vercel login
```

#### 2.3 プロジェクト設定

```powershell
# web ディレクトリに移動
Set-Location web

# Vercel プロジェクト初期化
vercel
```

**設定項目**:

- Project Name: `name-card`
- Framework: `Next.js`
- Root Directory: `web` (重要!)
- Build Command: `npm run build`
- Output Directory: `.next`

#### 2.4 環境変数設定

Vercel ダッシュボードで以下を設定:

```
NEXT_PUBLIC_APP_URL=https://name-card.vercel.app
```

#### 2.5 デプロイ実行

```powershell
# 本番デプロイ
vercel --prod
```

### 3. npm 公開設定

#### 3.1 npm ログイン

```powershell
# ルートディレクトリに戻る
Set-Location ..

# npm ログイン
npm login
```

#### 3.2 パッケージ名確認

```powershell
# パッケージ名の重複確認
npm view name-card
```

**重複している場合の対処**:

- `package.json` の `name` を変更
- 例: `name-card-cli`, `@lvncer/name-card` など

#### 3.3 最終ビルド・テスト

```powershell
# 最終ビルド
npm run build

# パッケージ内容確認
npm pack --dry-run
```

#### 3.4 npm 公開

```powershell
# 公開実行
npm publish

# スコープ付きの場合
npm publish --access public
```

## 🔧 設定確認

### GitHub 設定確認

- [ ] リポジトリ作成済み
- [ ] ブランチプッシュ済み
- [ ] PR 作成・マージ済み
- [ ] Issue クローズ済み

### Vercel 設定確認

- [ ] プロジェクト作成済み
- [ ] 環境変数設定済み
- [ ] デプロイ成功
- [ ] URL アクセス可能: https://name-card.vercel.app

### npm 設定確認

- [ ] パッケージ公開済み
- [ ] インストール可能: `npm install -g name-card`
- [ ] CLI 動作確認: `name-card --help`

## 🌐 公開 URL

### Web アプリケーション

- **本番**: https://name-card.vercel.app
- **プレビュー**: https://name-card-git-feat-1-project-foundation-lvncer.vercel.app

### npm パッケージ

- **npm**: https://www.npmjs.com/package/@lvncer/name-card
- **GitHub**: https://github.com/lvncer/name-card

## 📝 使用方法

### CLI 使用

```bash
# グローバルインストール
npm install -g @lvncer/name-card

# 基本使用
name-card business-card.md

# テンプレート使用
name-card --template basic
```

### Web 使用

1. https://name-card.vercel.app にアクセス
2. Markdown ファイルをアップロード
3. プレビュー確認
4. PDF エクスポート

## 🚨 トラブルシューティング

### Vercel デプロイエラー

**症状**: ビルドエラー
**対処**:

```powershell
# ローカルビルド確認
Set-Location web
npm run build
```

### npm 公開エラー

**症状**: パッケージ名重複
**対処**: `package.json` の `name` を変更

**症状**: 権限エラー
**対処**: `npm login` でログイン確認

### CLI 動作エラー

**症状**: コマンドが見つからない
**対処**:

```powershell
# グローバルインストール確認
npm list -g name-card

# 再インストール
npm uninstall -g @lvncer/name-card
npm install -g @lvncer/name-card
```

## 📞 サポート

問題が発生した場合:

1. GitHub Issues: https://github.com/lvncer/name-card/issues
2. ドキュメント確認: `docs/` ディレクトリ
3. テスト実行: `npm run test:all`

## 🎉 完了後の確認

全設定完了後、以下を確認:

1. **CLI 動作確認**:

   ```bash
   name-card templates/basic.md
   ```

2. **Web アクセス確認**:
   https://name-card.vercel.app

3. **npm パッケージ確認**:
   https://www.npmjs.com/package/@lvncer/name-card

4. **GitHub リポジトリ確認**:
   https://github.com/lvncer/name-card

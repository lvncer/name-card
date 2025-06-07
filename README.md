# Name Card

Markdown ファイルから美しい名刺を作成・エクスポートできる CLI ツール & Web アプリケーション

## 🚀 特徴

- **Markdown ベース**: シンプルな Markdown ファイルで名刺情報を管理
- **リアルタイムプレビュー**: ファイル変更を自動検知してプレビューを更新
- **PDF エクスポート**: 高品質な PDF ファイルとして名刺をエクスポート
- **複数の使用方法**: CLI、Web アプリケーション、両方で利用可能
- **レスポンシブデザイン**: モダンで美しい UI/UX

## 📦 インストール

### グローバルインストール（推奨）

```bash
npm install -g name-card
```

### ローカルインストール

```bash
npm install name-card
npx name-card
```

## 🎯 使用方法

### CLI 使用

```bash
# 基本的な使用方法
name-card business-card.md

# サンプルテンプレートを使用
name-card --template basic
name-card --template designer
name-card --template business
name-card --template freelancer

# ヘルプ表示
name-card --help
```

### Web アプリケーション

オンラインで直接利用: [https://name-card.vercel.app](https://name-card.vercel.app)

## 📝 Markdown ファイル形式

```markdown
# 田中太郎

**ソフトウェアエンジニア**

フルスタック開発を専門とし、React、Node.js、TypeScript を使用したモダンな Web アプリケーション開発に従事しています。

- 📧 tanaka@example.com
- 📱 090-1234-5678
- 🌐 https://tanaka.dev
- 🐙 @tanaka-dev
- 📍 東京都渋谷区
```

## 🛠️ 開発

### 前提条件

- Node.js 18 以上
- npm または yarn

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/name-card.git
cd name-card

# 依存関係をインストール
npm install

# CLI開発
npm run dev

# Webアプリケーション開発
npm run web:dev
```

### テスト実行

```bash
# 全テスト実行
npm run test:all

# CLI テスト
npm run test

# Web テスト
npm run web:test

# E2E テスト
npm run web:e2e
```

### ビルド

```bash
# CLI ビルド
npm run build

# Web ビルド
npm run web:build
```

## 📁 プロジェクト構造

```
name-card/
├── bin/                 # CLI エントリーポイント
├── src/                 # CLI ソースコード
├── web/                 # Next.js Webアプリケーション
├── templates/           # サンプルテンプレート
├── tests/               # CLI テスト
└── docs/                # ドキュメント
```

## 🎨 テンプレート

以下のテンプレートが利用可能です：

- **basic**: ソフトウェアエンジニア向け
- **designer**: UI/UX デザイナー向け
- **business**: 営業・ビジネス向け
- **freelancer**: フリーランス向け

## 🚀 デプロイ

### Vercel（Web）

```bash
# Vercel CLI インストール
npm install -g vercel

# デプロイ
cd web
vercel
```

### npm 公開（CLI）

```bash
# ビルド
npm run build

# 公開
npm publish
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Web アプリケーションフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSS フレームワーク
- [Shadcn/ui](https://ui.shadcn.com/) - UI コンポーネント
- [Puppeteer](https://pptr.dev/) - PDF 生成
- [Commander.js](https://github.com/tj/commander.js/) - CLI フレームワーク

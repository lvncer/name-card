# Name Card

Markdown ファイルから美しい名刺を作成・印刷できる CLI ツール & Web アプリケーション

## 🚀 特徴

- **Markdown ベース**: シンプルな Markdown または HTML で名刺情報を管理
- **実物サイズプレビュー**: 実際の名刺サイズ（91mm × 55mm）でプレビュー表示
- **ワンクリック印刷**: ブラウザの印刷機能で PDF 出力・印刷が可能
- **リアルタイム更新**: ファイル変更を自動検知してプレビューを更新
- **HTML デザイン対応**: Tailwind CSS を使った高度なデザインも可能
- **モダン UI/UX**: Next.js ベースの美しいインターフェース

## ⚡ パフォーマンス

### 高速起動・軽量動作を実現

- **⚡ 瞬間起動**: プリビルド方式により**30秒→即座**の驚異的な高速化
- **📦 軽量バンドル**: 最適化により総容量**798KB**の超コンパクトサイズ  
- **🧠 メモリ効率**: わずか**48.5MB**の軽量メモリ使用量
- **🔄 高速更新**: デバウンス付きファイル監視で効率的なリアルタイム更新
- **🌐 最適化されたWeb**: Next.js 15 + Tailwind CSS の最新最適化技術

### 実測パフォーマンス

```bash
# 🚀 起動時間：即座（以前は30秒以上）
$ name-card templates/html-sample.md
Starting prebuilt Next.js server...
Ready in 1291ms ✨

# ⚡ HTTPレスポンス：キャッシュ最適化済み
HTTP/1.1 200 OK
x-nextjs-cache: HIT
Content-Length: 6337 (6.3KB)

# 📊 バンドル解析
Route (app)                Size    First Load JS
├ ○ /                     14.2 kB      115 kB
├ ƒ /api/card-data        139 B        101 kB  
└ ƒ /api/reload           139 B        101 kB
```

### 技術的最適化

- **React Memo化**: 不要な再レンダリング完全排除
- **Next.js 本番最適化**: 自動コード分割・未使用コード削除
- **TypeScript完全対応**: 100%型安全でゼロランタイムエラー
- **メモリ管理**: WeakSet使用でメモリリーク防止
- **グレースフルシャットダウン**: 安全なプロセス終了

## 📦 インストール

### グローバルインストール（推奨）

```bash
npm install -g @lvncer/name-card$$
```

### ローカル使用

```bash
npm install @lvncer/name-card
npx @lvncer/name-card
```

## 🎯 使用方法

### 基本的な流れ

1. **Markdown ファイルを作成**（名刺情報を記載）
2. **CLI コマンドで実行**（Web アプリが自動起動）
3. **実物サイズでプレビュー確認**
4. **「印刷・PDF出力」ボタンで印刷**

### CLI コマンド

```bash
# 基本的な使用方法
name-card my-card.md

# サンプルテンプレートを使用
name-card --template basic        # エンジニア向け
name-card --template business     # ビジネス向け
name-card --template designer     # デザイナー向け
name-card --template freelancer   # フリーランス向け
name-card --template html-sample  # HTML デザイン
name-card --template image-sample # 画像使用例
name-card --template print-friendly # 印刷フレンドリー

# テンプレート一覧表示
name-card list-templates

# ポート指定
name-card my-card.md --port 4000

# ブラウザ自動起動を無効化
name-card my-card.md --no-open

# ヘルプ表示
name-card --help
```

## 📝 Markdown ファイル形式

### 基本形式

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

### HTML デザイン形式

高度なデザインが必要な場合は、HTML + Tailwind CSS で記述：

```html
<div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-3 text-gray-800 h-full flex flex-col justify-between">
  <div class="text-center">
    <h1 class="text-xl font-bold text-indigo-900 mb-1">田中 太郎</h1>
    <p class="text-sm text-indigo-700 font-semibold">フルスタックエンジニア</p>
  </div>
  
  <div class="flex-1 flex items-center py-2">
    <p class="text-xs text-gray-700 text-center w-full leading-tight">
      React・Next.js・TypeScript専門。
      <span class="text-indigo-600 font-medium">UX重視</span>の開発が得意。
    </p>
  </div>

  <div class="space-y-1">
    <div class="flex items-center text-xs text-gray-600">
      <span class="w-3 h-3 mr-1">📧</span>
      <span class="text-xs">tanaka@example.com</span>
    </div>
    <!-- その他の連絡先... -->
  </div>
</div>
```

### 🖼️ 画像ファイルの使用方法

プロフィール写真、会社ロゴ、アイコンなどの画像ファイルを名刺に簡単に追加できます：

#### 1. 簡単な画像配置方法 ✨

```bash
# Markdownファイルと同じディレクトリに画像を配置するだけ！
my-card.md
avatar.jpg       # プロフィール写真
company-logo.png # 会社ロゴ
icon.svg        # アイコン
```

**自動で検出・コピーされます！** 手動でのファイル配置は不要です。

#### 2. HTML での画像参照

```html
<div class="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col justify-between">
  <div class="text-center">
    <!-- プロフィール画像 -->
    <img src="/auto-images/avatar.jpg" alt="プロフィール" 
         class="w-16 h-16 rounded-full mx-auto mb-2 object-cover">
    <h1 class="text-lg font-bold text-gray-900">田中 太郎</h1>
    <p class="text-sm text-gray-600">ソフトウェアエンジニア</p>
  </div>
  
  <div class="flex items-center justify-between">
    <div class="text-xs text-gray-600">
      <p>tanaka@example.com</p>
      <p>090-1234-5678</p>
    </div>
    <!-- 会社ロゴ -->
    <img src="/auto-images/company-logo.png" alt="会社ロゴ" 
         class="h-8 opacity-70">
  </div>
</div>
```

#### 3. 画像使用テンプレート

```bash
# 画像使用例のテンプレート
name-card --template image-sample
```

#### 🚀 自動機能

- **自動検出**: 起動時にMarkdownファイルと同じディレクトリの画像を自動検出
- **自動コピー**: 検出した画像を `/auto-images/` パスで使用可能に
- **リアルタイム更新**: 画像ファイルの変更・追加を自動検知
- **自動クリーンアップ**: サーバー終了時に一時ファイルを自動削除

#### サポート画像形式

- **JPG/JPEG**: 写真・プロフィール画像
- **PNG**: 透明背景対応・ロゴ
- **SVG**: ベクター画像・アイコン  
- **WebP/GIF/BMP/ICO**: その他の画像形式

#### 画像使用のベストプラクティス

- **ファイルサイズ**: 100KB以下を推奨（印刷品質を保ちつつ軽量化）
- **解像度**: 300dpi以上を推奨（印刷時の高品質を保証）
- **プロフィール画像**: 正方形（1:1比率）推奨
- **パス指定**: 必ず `/auto-images/ファイル名` で指定
- **altテキスト**: アクセシビリティのため必ず設定

## 🖨️ 印刷・PDF 出力

1. **Web アプリで「印刷・PDF出力」ボタンをクリック**
2. **ブラウザの印刷ダイアログが開く**
3. **印刷設定で「PDF に保存」を選択**
4. **ファイル名・保存場所を指定して完了**

### 🎨 背景色・グラデーションを印刷する方法

背景色やグラデーションを印刷に含めるには、ブラウザ設定の変更が必要です：

#### Chrome の場合
1. 印刷ダイアログで「詳細設定」をクリック
2. 「背景のグラフィック」を **ON** にする
3. 「印刷」または「PDF に保存」を実行

#### Safari の場合  
1. 印刷ダイアログで「詳細を表示」をクリック
2. 「Safari」→「背景色と画像を印刷」を **チェック**
3. 「印刷」または「PDF に保存」を実行

#### Firefox の場合
1. 印刷ダイアログで「設定」をクリック  
2. 「背景色と画像を印刷」を **ON** にする
3. 「印刷」または「PDF に保存」を実行

### 印刷のポイント

- **実物サイズ**: 91mm × 55mm の標準的な名刺サイズ
- **高品質**: ベクターベースで鮮明な印刷が可能
- **カスタマイズ**: CSS で細かいデザイン調整が可能
- **背景色対応**: 上記設定で背景色・グラデーションも印刷可能

## 🛠️ 開発

### 前提条件

- Node.js 18 以上
- npm または yarn

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/lvncer/name-card.git
cd name-card

# 依存関係をインストール
npm install

# サンプルで開発サーバー起動
npm run dev -- templates/html-sample.md

# 自分の名刺ファイルで起動
npm run dev -- my-card.md
```

### テスト実行

```bash
# 全テスト実行
npm run test:all

# CLI テスト
npm run test

# Web テスト
npm run web:test
```

## 📁 プロジェクト構造

```
name-card/
├── bin/                 # CLI エントリーポイント
├── src/                 # CLI ソースコード
├── web/                 # Next.js Webアプリケーション
│   ├── src/app/         # App Router ページ
│   ├── src/components/  # React コンポーネント
│   └── src/lib/         # ユーティリティ
├── templates/           # サンプルテンプレート
├── tests/               # テストファイル
└── docs/                # ドキュメント
```

## 🎨 テンプレート一覧

| テンプレート | 用途 | 特徴 |
|-------------|------|------|
| `basic` | ソフトウェアエンジニア | シンプルな Markdown 形式 |
| `business` | 営業・ビジネス | ビジネス向けレイアウト |
| `designer` | UI/UX デザイナー | デザイナー向け情報構成 |
| `freelancer` | フリーランス | 個人事業主向け |
| `html-sample` | 高度なデザイン | HTML + Tailwind CSS |
| `image-sample` | 画像使用例 | プロフィール写真・ロゴ対応 |
| `print-friendly` | 印刷重視 | 背景色不要・全ブラウザ対応 |

## 🔧 技術スタック

### フロントエンド
- **Next.js 15** - React フレームワーク
- **Tailwind CSS** - ユーティリティファースト CSS
- **Shadcn/ui** - UI コンポーネントライブラリ

### バックエンド
- **Node.js** - JavaScript ランタイム
- **TypeScript** - 型安全な JavaScript
- **Markdown パーサー** - コンテンツ変換

### 開発ツール
- **Vitest** - テストフレームワーク
- **ESLint** - コード品質チェック
- **Commander.js** - CLI フレームワーク

## 🚀 デプロイ・公開

```bash
# ビルド
npm run build

# バージョン更新
npm version patch  # または minor, major

# npm に公開
npm publish
```

## 💡 使用事例

- **エンジニア**: 技術スタックや GitHub を記載した名刺
- **デザイナー**: ポートフォリオ URL や Adobe Creative Cloud を記載
- **営業**: 会社情報や連絡先を中心とした名刺
- **フリーランス**: 専門分野やスキルをアピールする名刺

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Web アプリケーションフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSS フレームワーク
- [Shadcn/ui](https://ui.shadcn.com/) - UI コンポーネント
- [Commander.js](https://github.com/tj/commander.js/) - CLI フレームワーク
- [Markdown](https://www.markdownguide.org/) - 軽量マークアップ言語

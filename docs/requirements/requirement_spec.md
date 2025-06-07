# 名刺作成アプリケーション 要件定義書

## プロジェクト概要

グローバル npm パッケージとして配布される、Markdown ベースの名刺作成 CLI ツール

## 最終目標

- **CLI ツール**: `npm i -g name-card` でグローバルインストール
- **Markdown ベース**: `.md` ファイルで名刺情報を管理
- **簡単コマンド**: `name-card business-card.md` で即座にプレビュー
- **Web インターフェース**: ローカルサーバーでプレビュー・エクスポート
- **高品質出力**: PDF 形式で名刺サイズ（91mm × 55mm）での出力

## ハイブリッド構成の利点

### 1. 開発者向け (CLI)

- **ローカル開発**: `npm i -g name-card` で即座に使用開始
- **ファイルベース**: Markdown ファイルでバージョン管理
- **Hot Reload**: ファイル編集で即座にプレビュー更新
- **オフライン利用**: インターネット接続不要

### 2. 一般ユーザー向け (Web)

- **インストール不要**: ブラウザから直接アクセス
- **簡単共有**: URL で他の人と共有可能
- **クロスプラットフォーム**: どのデバイスからでもアクセス
- **最新版**: 常に最新機能を利用可能

### 3. 管理・運用面

- **単一コードベース**: CLI と Web で同じ Next.js アプリケーション
- **統一メンテナンス**: 一つのプロジェクトで両方をサポート
- **Vercel 最適化**: Next.js の恩恵を最大限活用
- **スケーラビリティ**: 必要に応じて機能拡張が容易

## MVP（Minimum Viable Product）定義

### 必須機能

1. **CLI インターフェース**

   - `name-card <file.md>` コマンドでプレビュー起動
   - `name-card --help` でヘルプ表示
   - `name-card --version` でバージョン表示

2. **Markdown パーサー**

   - YAML Front Matter での名刺情報定義
   - 標準的な Markdown 記法サポート
   - 名刺情報の構造化データ抽出

3. **ローカル Web サーバー**

   - Next.js による高性能サーバー
   - Hot Reload による即座プレビュー
   - `/` でプレビュー（中央表示 + 右上エクスポートボタン）

4. **PDF エクスポート機能**
   - 右上エクスポートボタンからワンクリック出力
   - Puppeteer による高品質 PDF 生成
   - 名刺サイズ（91mm × 55mm）への自動調整
   - マークダウン内容を名刺レイアウトに自動変換

### 技術要件

- **CLI フレームワーク**: Commander.js
- **Web フレームワーク**: Next.js 15 (App Router)
- **UI ライブラリ**: React 19
- **スタイリング**: Tailwind CSS + Shadcn/ui
- **言語**: TypeScript
- **Markdown パーサー**: gray-matter + marked
- **PDF 生成**: Puppeteer
- **ファイル監視**: chokidar (Hot Reload)
- **デプロイ**: Vercel

## フェーズ別実装計画

### Phase 1: CLI 基盤構築

- npm パッケージプロジェクトセットアップ
- Commander.js による CLI インターフェース
- TypeScript 設定と型定義
- 基本的な README とドキュメント

### Phase 2: Markdown パーサー実装

- gray-matter による YAML Front Matter 解析
- 名刺データの型定義とバリデーション
- Markdown ファイルの読み込み・監視
- サンプル Markdown ファイルの作成

### Phase 3: Next.js Web アプリケーション実装

- Next.js 15 (App Router) による Web アプリケーション
- React 19 コンポーネントの実装
- 名刺プレビューページの作成
- CLI からの Next.js サーバー起動機能

### Phase 4: PDF エクスポート・デプロイ

- Puppeteer による PDF 生成 API (Next.js API Routes)
- 名刺サイズでの正確な出力
- Vercel デプロイ設定
- CLI 版と Web 版の動作確認

## 将来的な拡張機能（MVP 後）

### Phase 5: 基本的な UI エディター（おまけ機能）

- Web UI での簡単な情報入力
- リアルタイムプレビュー
- 設定ファイルの自動生成

### Phase 6: デザインテンプレート拡張

- 複数のテンプレート選択
- カラーバリエーション設定
- フォント選択機能
- CSS カスタマイズガイド

### Phase 7: 高度なカスタマイズ機能

- ロゴ画像の組み込み方法
- レイアウトのカスタマイズ例
- QR コード生成機能
- 複数名刺の管理方法

## Markdown ファイル例

### business-card.md サンプル

```markdown
---
name: "山田 太郎"
company: "株式会社サンプル"
position: "代表取締役"
phone: "03-1234-5678"
email: "taro.yamada@example.com"
website: "https://example.com"
address: "東京都渋谷区..."
---

# 山田 太郎

**代表取締役**
株式会社サンプル

📞 03-1234-5678
📧 taro.yamada@example.com
🌐 https://example.com

📍 東京都渋谷区...

---

_このマークダウンファイルを編集すると、自動的に名刺サイズでプレビューされます_
```

## レイアウト自動調整

### マークダウン → 名刺変換ルール

1. **YAML Front Matter**: 構造化データとして解析
2. **見出し (H1)**: 名前として大きく表示
3. **太字 (**text**)**: 役職として表示
4. **リスト・絵文字**: 連絡先情報として整理
5. **自動レイアウト**: 名刺サイズ（91mm × 55mm）に最適化

## CLI コマンド例

```bash
# グローバルインストール
npm install -g name-card

# 名刺プレビューの起動
name-card business-card.md

# ヘルプ表示
name-card --help

# バージョン確認
name-card --version

# ポート指定
name-card business-card.md --port 8080

# 自動ブラウザ起動無効
name-card business-card.md --no-open
```

## 非機能要件

### パフォーマンス

- 初回読み込み時間: 3 秒以内
- プレビュー更新: 100ms 以内

### ユーザビリティ

- 直感的な操作性
- モバイルフレンドリー
- アクセシビリティ対応

### ブラウザ対応

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 制約事項

- 初期版では日本語のみ対応
- オフライン機能は対象外
- 印刷機能は将来的な検討事項

## 成功指標

### MVP 完了基準

- [ ] `npm i -g name-card` でグローバルインストールできる
- [ ] `name-card business-card.md` でプレビューが起動する
- [ ] Markdown ファイルで名刺情報を編集できる
- [ ] Hot Reload で編集内容が即座に反映される
- [ ] Web インターフェースで名刺プレビューが表示される
- [ ] PDF 形式で名刺サイズでエクスポートできる
- [ ] CLI ヘルプとドキュメントが充実している

### 品質基準

- TypeScript エラーゼロ
- ESLint エラーゼロ
- ビルドエラーゼロ
- 主要ブラウザでの動作確認完了

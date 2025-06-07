# 名刺作成アプリケーション アーキテクチャ設計書

## システム概要

npm グローバルパッケージ + Next.js Web アプリケーションのハイブリッド構成

## アーキテクチャ概要

### 全体構成

```asc
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface                            │
│                   (Commander.js)                            │
├─────────────────────────────────────────────────────────────┤
│                  Next.js Application                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Markdown Parser │  │  React Pages    │  │ PDF Export   │ │
│  │  (gray-matter)  │  │  (App Router)   │  │ (Puppeteer)  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                 File System Watcher                         │
│                    (chokidar)                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Vercel Deployment                          │
│              (Standalone Web Version)                       │
└─────────────────────────────────────────────────────────────┘
```

## ハイブリッド構成の詳細

### 1. npm グローバルパッケージ (CLI)

```bash
npm install -g name-card
```

- **CLI インターフェース**: Commander.js による `name-card` コマンド
- **Markdown パーサー**: gray-matter でファイル解析
- **Next.js サーバー起動**: 内蔵の Next.js アプリケーションを起動
- **ファイル監視**: chokidar による Hot Reload

### 2. Next.js Web アプリケーション (内蔵)

- **App Router**: 最新の Next.js 15 機能
- **React コンポーネント**: 名刺プレビューと編集機能
- **API Routes**: PDF エクスポート機能
- **Tailwind CSS + Shadcn/ui**: モダンな UI

### 3. Vercel デプロイ (スタンドアロン)

- **Web 版**: CLI なしでブラウザから直接利用
- **同一コードベース**: CLI 版と同じ Next.js アプリケーション
- **オンライン利用**: インストール不要でアクセス可能

## 動作フロー

### CLI 使用時

1. `name-card business-card.md` コマンド実行
2. CLI が Markdown ファイルを解析
3. 内蔵 Next.js サーバーを起動 (localhost:3000)
4. ブラウザが自動で開く
5. **中央に名刺プレビュー表示**
6. **右上にエクスポートボタン配置**
7. ファイル変更を監視して Hot Reload

### Web 版使用時

1. Vercel URL にアクセス
2. ブラウザ上で直接編集
3. **中央に名刺プレビュー表示**
4. **右上エクスポートボタンで PDF 出力**

## 技術スタック

### CLI・パッケージ管理

- **Commander.js**: CLI フレームワーク
- **chokidar**: ファイル監視
- **TypeScript**: 型安全性

### Web アプリケーション

- **Next.js 15**: フルスタックフレームワーク (App Router)
- **React 19**: UI ライブラリ
- **Tailwind CSS + Shadcn/ui**: スタイリング

### Markdown 処理

- **gray-matter**: YAML Front Matter パーサー
- **marked**: Markdown パーサー

### PDF 生成

- **Puppeteer**: ヘッドレス Chrome による PDF 生成

### デプロイ・開発ツール

- **Vercel**: Web アプリケーションのホスティング
- **npm**: パッケージ配布
- **ESLint + Prettier**: コード品質管理

## ディレクトリ構造

```sh
name-card/
├── bin/                    # CLI エントリーポイント
│   └── name-card.js       # 実行可能ファイル
├── src/                   # CLI ソースコード
│   ├── cli/              # CLI 関連
│   │   ├── index.ts      # CLI メイン処理
│   │   └── commands/     # コマンド実装
│   │       └── preview.ts
│   ├── parser/           # Markdown パーサー
│   │   ├── index.ts      # パーサーメイン
│   │   └── validator.ts  # バリデーション
│   ├── server/           # Next.js サーバー起動
│   │   └── index.ts      # Next.js dev server 起動
│   ├── types/            # 型定義
│   │   └── business-card.ts
│   └── utils/            # ユーティリティ
│       ├── file-watcher.ts
│       └── next-server.ts
├── web/                  # Next.js Web アプリケーション
│   ├── src/
│   │   ├── app/          # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx  # メインプレビューページ
│   │   │   ├── api/      # API Routes
│   │   │   │   └── export/
│   │   │   │       └── route.ts  # PDF エクスポート API
│   │   │   └── globals.css
│   │   ├── components/   # React コンポーネント
│   │   │   ├── ui/       # Shadcn/ui
│   │   │   └── business-card/
│   │   │       ├── business-card.tsx
│   │   │       └── export-button.tsx
│   │   └── lib/          # ユーティリティ
│   │       ├── utils.ts
│   │       └── pdf-export.ts
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── templates/            # サンプルテンプレート
│   └── business-card.md
├── package.json          # CLI パッケージ設定
└── README.md
```

## コンポーネント設計

### 1. BusinessCard (Server Component)

```typescript
interface BusinessCardProps {
  markdownContent: string;
  frontMatter: BusinessCardData;
  className?: string;
}
```

- メインの名刺表示コンポーネント
- Markdown 内容を名刺レイアウトに自動変換
- 実際の名刺サイズ（91mm × 55mm）での表示
- PDF 出力時の基準となるコンポーネント

### 2. ExportButton (Client Component)

```typescript
interface ExportButtonProps {
  targetId: string;
  filename?: string;
  className?: string; // 右上配置用
}
```

- 右上固定配置の PDF エクスポートボタン
- ワンクリックでの PDF 生成
- エクスポート状態の表示（ローディング・完了）

### 3. MarkdownRenderer (Server Component)

```typescript
interface MarkdownRendererProps {
  content: string;
  frontMatter: BusinessCardData;
}
```

- Markdown → 名刺レイアウト変換
- YAML Front Matter の解析
- 自動レイアウト調整機能

## データ構造

### BusinessCardData 型定義

```typescript
interface BusinessCardData {
  name: string; // 氏名
  company: string; // 会社名
  position: string; // 役職
  phone: string; // 電話番号
  email: string; // メールアドレス
  website?: string; // ウェブサイト（将来拡張）
  address?: string; // 住所（将来拡張）
}
```

### 名刺サイズ定数

```typescript
export const BUSINESS_CARD_SIZE = {
  WIDTH_MM: 91,
  HEIGHT_MM: 55,
  WIDTH_PX: 344, // 96dpi基準
  HEIGHT_PX: 208, // 96dpi基準
  DPI: 300, // PDF出力用
} as const;
```

## 設定ファイル構造

### config/business-card.ts

```typescript
import { BusinessCardData } from "@/lib/types/business-card";

export const businessCardConfig: BusinessCardData = {
  name: "山田 太郎",
  company: "株式会社サンプル",
  position: "代表取締役",
  phone: "03-1234-5678",
  email: "taro.yamada@example.com",
  website: "https://example.com",
  address: "東京都渋谷区...",
};
```

### カスタムフック: usePdfExport

```typescript
interface UsePdfExportReturn {
  exportToPdf: (elementId: string, filename?: string) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}
```

## PDF 出力アーキテクチャ

### 出力フロー

1. **HTML 要素の取得**: 名刺プレビューコンポーネントの DOM 要素
2. **サイズ調整**: 名刺サイズ（91mm × 55mm）に調整
3. **PDF 生成**: jsPDF を使用して PDF 作成
4. **ダウンロード**: ブラウザのダウンロード機能を使用

### PDF 設定

```typescript
const PDF_CONFIG = {
  format: [91, 55] as [number, number], // mm単位
  orientation: "landscape" as const,
  unit: "mm" as const,
  compress: true,
} as const;
```

## レスポンシブ設計

### ブレークポイント

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### レイアウト戦略

- **Desktop**: 中央配置での名刺プレビュー + エクスポートボタン
- **Tablet**: 同様のレイアウトでサイズ調整
- **Mobile**: 縦向きでの最適化表示

## パフォーマンス最適化

### 1. コンポーネント最適化

- React.memo による不要な再レンダリング防止
- useMemo/useCallback による計算結果キャッシュ

### 2. バンドル最適化

- Dynamic Import による遅延読み込み
- Tree Shaking による不要コード除去

### 3. 画像最適化

- next/image による自動最適化
- WebP 形式での配信

## セキュリティ考慮事項

### 1. XSS 対策

- ユーザー入力のサニタイゼーション
- dangerouslySetInnerHTML の使用禁止

### 2. CSP (Content Security Policy)

- インラインスクリプトの制限
- 外部リソースの制限

## テスト戦略

### 1. 単体テスト

- Jest + React Testing Library
- カスタムフックのテスト
- ユーティリティ関数のテスト

### 2. 統合テスト

- コンポーネント間の連携テスト
- PDF 出力機能のテスト

### 3. E2E テスト

- Playwright による自動テスト
- 主要ユーザーフローのテスト

## デプロイメント

### 1. 開発環境

- Next.js Dev Server
- Hot Reload 対応

### 2. 本番環境

- Vercel での静的サイト生成
- CDN による高速配信
- 自動デプロイメント

## 監視・ログ

### 1. エラー監視

- Next.js 組み込みエラーハンドリング
- クライアントサイドエラーの収集

### 2. パフォーマンス監視

- Web Vitals の測定
- バンドルサイズの監視

## 拡張性考慮事項

### 1. テンプレート機能

- テンプレート選択機能の追加
- カスタムテンプレート作成機能

### 2. データ永続化

- LocalStorage による一時保存
- 将来的なクラウド保存機能

### 3. 国際化

- i18n 対応の準備
- 多言語テンプレート対応

## 技術的制約

### 1. ブラウザ制約

- PDF 生成はクライアントサイドのみ
- ファイルシステムアクセス不可

### 2. サイズ制約

- バンドルサイズの最適化必須
- 画像リソースの最小化

### 3. パフォーマンス制約

- リアルタイムプレビューの応答性
- PDF 生成時間の最適化

## UI/UX デザイン

### レイアウト構成

```
┌─────────────────────────────────────────────────────────────┐
│                                                    [Export] │ ← 右上エクスポートボタン
│                                                             │
│                                                             │
│                    ┌─────────────────┐                     │
│                    │                 │                     │
│                    │   名刺プレビュー   │ ← 中央配置           │
│                    │  (91mm×55mm)   │                     │
│                    │                 │                     │
│                    └─────────────────┘                     │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 名刺サイズ自動調整

#### CSS 実装例

```css
.business-card {
  width: 91mm;
  height: 55mm;
  /* ブラウザ表示用スケール調整 */
  transform: scale(2);
  transform-origin: center;

  /* PDF 出力時は実サイズ */
  @media print {
    transform: scale(1);
  }
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.export-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
}
```

### マークダウン → 名刺変換ロジック

#### 変換ルール

1. **H1 見出し** → 名前（大きなフォント）
2. **太字テキスト** → 役職・肩書き
3. **会社名** → 通常テキスト
4. **絵文字付きリスト** → 連絡先情報
5. **水平線 (---)** → セクション区切り

#### 自動レイアウト

```typescript
interface LayoutRule {
  element: "h1" | "strong" | "p" | "list";
  fontSize: string;
  position: "top" | "center" | "bottom";
  alignment: "left" | "center" | "right";
}

const businessCardLayout: LayoutRule[] = [
  { element: "h1", fontSize: "1.5rem", position: "top", alignment: "center" },
  { element: "strong", fontSize: "1rem", position: "top", alignment: "center" },
  { element: "p", fontSize: "0.875rem", position: "center", alignment: "left" },
  {
    element: "list",
    fontSize: "0.75rem",
    position: "bottom",
    alignment: "left",
  },
];
```

# Name Card

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/lvncer/name-card/tree/main?tab=MIT-1-ov-file)

Markdown ファイルから美しい名刺を作成・印刷できる CLI ツール & Web アプリケーション

![./public/images/simple-namecard-sample.png](./public/images/simple-namecard-sample.png)

## 機能

1. シンプルな Markdown または HTML で名刺情報を管理
2. 実際の名刺サイズ（91mm × 55mm）でプレビュー表示
3. ブラウザの印刷機能で PDF 出力・印刷が可能
4. ファイル変更を自動検知してプレビューを更新
5. Tailwind CSS を使った高度なデザインも可能

## ドキュメント

- [開発設計書](/docs/design/development.md)
- [パフォーマンス仕様書](/docs/design/performance.md)
- [使用技術一覧](/docs/design/tech-stacks.md)

## インストール

### グローバルインストール（推奨）

```bash
npm install -g @lvncer/name-card
```

### ローカル使用

```bash
npm install @lvncer/name-card
npx @lvncer/name-card
```

## 使用方法

### 基本的な流れ

1. **Markdown ファイルを作成**（名刺情報を記載）
2. **CLI コマンドで実行**（Web アプリが自動起動）
3. **実物サイズでプレビュー確認**
4. **「印刷・PDF 出力」ボタンで印刷**

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

## ファイル形式

### Markdown 形式

```markdown
# 田中太郎

**ソフトウェアエンジニア**

フルスタック開発を専門とし、React、Node.js、TypeScript を使用したモダンな Web アプリケーション開発に従事しています。

- 📧 tanaka@example.com
- 📱 090-1234-5678
- 🌐 https://tanaka.dev
- 🐙 @tanaka-dev
```

### HTML デザイン形式

高度なデザインが必要な場合は、HTML + Tailwind CSS で記述

```html
<div
  class="bg-gradient-to-br from-blue-50 to-indigo-100 p-3 text-gray-800 h-full flex flex-col justify-between"
>
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
  </div>
</div>
```

### 画像ファイルの使用方法

プロフィール写真、会社ロゴ、アイコンなどの画像ファイルを名刺に簡単に追加できます

#### 1. 簡単な画像配置方法

起動時に Markdown ファイルと同じディレクトリの画像を自動検出します。

#### 2. HTML での画像参照

```html
<img
  src="/auto-images/avatar.jpg"
  alt="avator"
  class="w-16 h-16 rounded-full object-cover"
/>
```

## 印刷・PDF 出力

1. **Web アプリで「印刷・PDF 出力」ボタンをクリック**
2. **ブラウザの印刷ダイアログが開く**
3. **印刷設定で「PDF に保存」を選択**
4. **ファイル名・保存場所を指定して完了**

## テンプレート一覧

[テンプレート一覧](/templates/)

| テンプレート     | 用途                   | 特徴                       |
| ---------------- | ---------------------- | -------------------------- |
| `basic`          | ソフトウェアエンジニア | シンプルな Markdown 形式   |
| `business`       | 営業・ビジネス         | ビジネス向けレイアウト     |
| `designer`       | UI/UX デザイナー       | デザイナー向け情報構成     |
| `freelancer`     | フリーランス           | 個人事業主向け             |
| `html-sample`    | 高度なデザイン         | HTML + Tailwind CSS        |
| `image-sample`   | 画像使用例             | プロフィール写真・ロゴ対応 |
| `print-friendly` | 印刷重視               | 背景色不要・全ブラウザ対応 |

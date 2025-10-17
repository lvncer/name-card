# 開発

## 前提条件

- Node.js 18 以上
- npm または yarn

## ローカル開発

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

## テスト実行

```bash
# 全テスト実行
npm run test:all

# CLI テスト
npm run test

# Web テスト
npm run web:test
```

## デプロイ・公開

```bash
# ビルド
npm run build

# バージョン更新
npm version patch  # または minor, major

# npm に公開
npm publish
```

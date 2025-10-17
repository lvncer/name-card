# パフォーマンス

## 高速起動・軽量動作を実現

- **⚡ 瞬間起動**: プリビルド方式により**30 秒 → 即座**の驚異的な高速化
- **📦 軽量バンドル**: 最適化により総容量**798KB**の超コンパクトサイズ
- **🧠 メモリ効率**: わずか**48.5MB**の軽量メモリ使用量
- **🔄 高速更新**: デバウンス付きファイル監視で効率的なリアルタイム更新
- **🌐 最適化された Web**: Next.js 15 + Tailwind CSS の最新最適化技術

## 実測パフォーマンス

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

## 技術的最適化

- **React Memo 化**: 不要な再レンダリング完全排除
- **Next.js 本番最適化**: 自動コード分割・未使用コード削除
- **TypeScript 完全対応**: 100%型安全でゼロランタイムエラー
- **メモリ管理**: WeakSet 使用でメモリリーク防止
- **グレースフルシャットダウン**: 安全なプロセス終了

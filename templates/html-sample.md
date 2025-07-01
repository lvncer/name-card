<div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg p-3 text-gray-800 h-full flex flex-col justify-between">
  <div class="text-center">
    <!-- プロフィール画像の例 （使用する場合は /avatar.jpg を web/public/ ディレクトリに配置してください） -->
    <!-- <img src="/avatar.jpg" alt="プロフィール" class="w-12 h-12 rounded-full mx-auto mb-2 object-cover"> -->
    
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
    <div class="flex items-center text-xs text-gray-600">
      <span class="w-3 h-3 mr-1">📱</span>
      <span class="text-xs">090-1234-5678</span>
    </div>
    <div class="flex items-center text-xs text-gray-600">
      <span class="w-3 h-3 mr-1">🌐</span>
      <span class="text-xs text-indigo-600">tanaka.dev</span>
    </div>
    <!-- 会社ロゴの例 （使用する場合は /company-logo.png を web/public/ ディレクトリに配置してください） -->
    <!-- <div class="mt-2 text-center">
      <img src="/company-logo.png" alt="Company" class="h-4 mx-auto opacity-70">
    </div> -->
  </div>
</div>

<!-- 
画像ファイルの使用方法:
1. 画像ファイルを web/public/ ディレクトリに配置します
   例: web/public/avatar.jpg
       web/public/company-logo.png

2. HTMLで絶対パスで参照します
   例: <img src="/avatar.jpg" alt="プロフィール">
       <img src="/company-logo.png" alt="Company Logo">

3. Tailwind CSSクラスでスタイリングできます
   例: class="w-12 h-12 rounded-full object-cover"
-->

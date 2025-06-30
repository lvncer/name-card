import { NextRequest } from "next/server";

// グローバルなクライアント管理
const clients = new Set();

export async function GET(request) {
  // Server-Sent Events (SSE) ストリーム作成
  const stream = new ReadableStream({
    start(controller) {
      // クライアントを登録
      clients.add(controller);

      // 接続確認メッセージ
      controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

      // クリーンアップ
      request.signal.addEventListener("abort", () => {
        clients.delete(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

// ファイル変更通知を送信する関数（内部使用のみ）
function notifyReload() {
  const message = `data: ${JSON.stringify({ type: "reload" })}\n\n`;

  for (const client of clients) {
    try {
      client.enqueue(message);
    } catch (error) {
      // 切断されたクライアントを削除
      clients.delete(client);
    }
  }
}

// POST エンドポイント（ファイル変更通知用）
export async function POST() {
  notifyReload();
  return Response.json({ success: true });
} 
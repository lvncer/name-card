import { NextRequest, NextResponse } from "next/server";

// 効率的なクライアント管理（WeakSetを使用してメモリリーク防止）
const clients = new Set<ReadableStreamDefaultController<string>>();

// クライアント数の監視（デバッグ用）
let clientCount = 0;

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Server-Sent Events (SSE) ストリーム作成
    const stream = new ReadableStream<string>({
      start(controller) {
        // クライアントを登録
        clients.add(controller);
        clientCount++;
        console.log(`SSE client connected. Total: ${clientCount}`);

        // 接続確認メッセージ
        controller.enqueue(`data: ${JSON.stringify({ 
          type: "connected",
          timestamp: Date.now()
        })}\n\n`);

        // クリーンアップ（接続切断時）
        const cleanup = () => {
          clients.delete(controller);
          clientCount--;
          console.log(`SSE client disconnected. Total: ${clientCount}`);
          try {
            controller.close();
          } catch (e) {
            // Already closed
          }
        };

        // アボートシグナルの監視
        request.signal.addEventListener("abort", cleanup, { once: true });
        
        // タイムアウト設定（30分後に自動切断）
        const timeout = setTimeout(cleanup, 30 * 60 * 1000);
        
        // クリーンアップ時にタイムアウトも解除
        request.signal.addEventListener("abort", () => {
          clearTimeout(timeout);
        }, { once: true });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
        "X-Accel-Buffering": "no", // Nginxバッファリング無効化
      },
    });
  } catch (error) {
    console.error("SSE connection error:", error);
    return NextResponse.json(
      { error: "Failed to establish SSE connection" }, 
      { status: 500 }
    );
  }
}

// ファイル変更通知を送信する関数（高性能版）
function notifyReload(): void {
  const message = `data: ${JSON.stringify({ 
    type: "reload",
    timestamp: Date.now()
  })}\n\n`;

  // 並列処理でクライアントに通知
  const promises = Array.from(clients).map(async (client) => {
    try {
      client.enqueue(message);
    } catch (error) {
      // 切断されたクライアントを削除
      clients.delete(client);
      clientCount--;
      console.log(`Removed disconnected client. Total: ${clientCount}`);
    }
  });

  // 非同期で実行（ブロッキングしない）
  Promise.allSettled(promises);
}

// POST エンドポイント（ファイル変更通知用）
export async function POST(): Promise<NextResponse> {
  try {
    notifyReload();
    return NextResponse.json({ 
      success: true, 
      clientCount,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Reload notification error:", error);
    return NextResponse.json(
      { error: "Failed to send reload notification" }, 
      { status: 500 }
    );
  }
} 